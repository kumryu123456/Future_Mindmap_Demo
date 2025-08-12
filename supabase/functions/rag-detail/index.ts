// @ts-expect-error Deno std library types not available in current TypeScript config
import { serve } from "https://deno.land/std@0.224.0/http/server.ts"
import { getCorsHeaders } from "../_shared/cors.js"
import { getSupabaseClient } from "../_shared/supabase.js"
import { rateLimit, addRateLimitHeaders } from "../_shared/rate-limiter.js"
import { 
  generateEmbedding, 
  findSimilarContent,
  SimilarContent 
} from "../_shared/embeddings.js"
// Removed unused DenoGlobal import
import { SupabaseClient } from '@supabase/supabase-js'

console.log("RAG Detail Function initialized!")

interface NodeDetailRequest {
  nodeId: string
  nodeType?: string // 'mindmap_node' | 'plan_node' | 'custom'
  enrichmentType?: 'comprehensive' | 'contextual' | 'technical' | 'strategic'
  maxRelevantSources?: number
  similarityThreshold?: number
  includeExamples?: boolean
  includeBestPractices?: boolean
  includeRisks?: boolean
  useLLM?: boolean
}

interface EnrichedNodeDetail {
  original_node: {
    id: string
    title: string
    content: string
    metadata?: Record<string, unknown>
  }
  enriched_content: {
    detailed_description: string
    key_concepts: string[]
    implementation_steps?: string[]
    best_practices?: string[]
    potential_risks?: string[]
    examples?: string[]
    related_resources?: string[]
  }
  relevant_sources: SimilarContent[]
  enrichment_context: {
    enrichment_type: string
    sources_used: number
    confidence_score: number
    generation_method: string
  }
  cached_until: string
  enrichment_id: string
}

/**
 * Build comprehensive RAG prompt for node detail enrichment
 */
function buildEnrichmentPrompt(
  node: Record<string, unknown>,
  relevantSources: SimilarContent[],
  enrichmentType: string,
  options: {
    includeExamples?: boolean
    includeBestPractices?: boolean
    includeRisks?: boolean
  }
): string {
  const sourcesContext = relevantSources
    .slice(0, 10) // Limit to top 10 for context
    .map(source => `
**Source ${source.content_type}** (similarity: ${source.similarity_score.toFixed(2)}):
${source.content_text}
${source.metadata ? `Metadata: ${JSON.stringify(source.metadata)}` : ''}
    `).join('\n')

  const enrichmentInstructions = {
    comprehensive: "Provide a thorough, multi-dimensional analysis covering all aspects of the topic",
    contextual: "Focus on how this concept fits within its broader context and relationships",
    technical: "Emphasize technical details, implementation specifics, and technical considerations",
    strategic: "Focus on strategic implications, business value, and high-level considerations"
  }

  return `You are an expert knowledge curator and content enrichment specialist. Your task is to significantly enhance and expand the detail of a mindmap node using relevant context found through semantic search.

**Original Node:**
Title: "${node.title}"
Content: "${node.content}"
${node.metadata ? `Metadata: ${JSON.stringify(node.metadata)}` : ''}

**Enrichment Type:** ${enrichmentType}
**Instruction:** ${enrichmentInstructions[enrichmentType as keyof typeof enrichmentInstructions]}

**Relevant Context Found:**
${sourcesContext || 'No specific context found - use general knowledge'}

**Enhancement Requirements:**
1. Significantly expand the original content with detailed, accurate information
2. Maintain the core intent and scope of the original node
3. Incorporate insights from the relevant sources where applicable
4. Ensure all information is practical and actionable
5. Structure the response for clarity and comprehension

**Required Sections:**
- **detailed_description**: Comprehensive 2-3 paragraph explanation expanding on the original content
- **key_concepts**: 5-8 essential concepts, terms, or components related to this node
${options.includeExamples ? '- **examples**: 3-5 concrete, practical examples demonstrating the concept' : ''}
${options.includeBestPractices ? '- **best_practices**: 4-6 proven best practices or recommendations' : ''}
${options.includeRisks ? '- **potential_risks**: 3-4 potential challenges, risks, or pitfalls to be aware of' : ''}
- **related_resources**: 3-5 types of resources that would be valuable for deeper learning
- **implementation_steps**: 4-7 actionable steps for implementing or utilizing this concept

**Output Format (JSON only):**
{
  "detailed_description": "Comprehensive multi-paragraph description that significantly expands on the original content, incorporating insights from relevant sources",
  "key_concepts": ["concept1", "concept2", "concept3", "concept4", "concept5"],
  "implementation_steps": ["Step 1: Specific actionable step", "Step 2: Another actionable step", "..."],
  ${options.includeBestPractices ? '"best_practices": ["Best practice 1", "Best practice 2", "..."],' : ''}
  ${options.includeRisks ? '"potential_risks": ["Risk 1: Description", "Risk 2: Description", "..."],' : ''}
  ${options.includeExamples ? '"examples": ["Example 1: Specific scenario", "Example 2: Another scenario", "..."],' : ''}
  "related_resources": ["Resource type 1", "Resource type 2", "..."]
}

**Quality Criteria:**
- Content should be 3-5x more detailed than the original
- Information should be accurate and current
- All points should be practical and actionable
- Maintain consistency with the original node's intent
- Incorporate relevant source material naturally

Return only valid JSON without any markdown formatting or additional text.`
}

/**
 * Call OpenAI to enrich node content using RAG
 */
async function enrichNodeContent(
  node: Record<string, unknown>,
  relevantSources: SimilarContent[],
  enrichmentType: string,
  options: {
    includeExamples?: boolean
    includeBestPractices?: boolean
    includeRisks?: boolean
  } = {}
): Promise<unknown> {
  // @ts-expect-error Deno global not available in TypeScript config
  const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
  
  if (!openaiApiKey) {
    throw new Error('OpenAI API key not configured')
  }

  // Make model configurable with fallback to cost-effective default
  // @ts-expect-error Deno global not available in TypeScript config
  const modelName = Deno.env.get('OPENAI_RAG_MODEL') || 'gpt-3.5-turbo'
  
  // Canonical immutable allowed models list
  const ALLOWED_MODELS = Object.freeze([
    'gpt-3.5-turbo', 
    'gpt-3.5-turbo-16k', 
    'gpt-4', 
    'gpt-4-turbo-preview'
  ])
  
  // Strict model validation with logging
  let model: string
  if (ALLOWED_MODELS.includes(modelName)) {
    model = modelName
  } else {
    console.warn(`Invalid model "${modelName}" from OPENAI_RAG_MODEL environment variable. Allowed models: ${ALLOWED_MODELS.join(', ')}. Falling back to default: gpt-3.5-turbo`)
    model = 'gpt-3.5-turbo'
  }

  const prompt = buildEnrichmentPrompt(node, relevantSources, enrichmentType, options)

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model, // Configurable model (default: gpt-3.5-turbo)
      messages: [
        {
          role: 'system',
          content: 'You are an expert knowledge curator and content enrichment specialist. Always respond with valid JSON only, no markdown or additional text.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 3000,
      response_format: { type: 'json_object' }
    })
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(`OpenAI API error: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`)
  }

  const data = await response.json()
  
  if (!data.choices || !data.choices[0] || !data.choices[0].message) {
    throw new Error('Invalid response structure from OpenAI API')
  }

  const content = data.choices[0].message.content
  
  try {
    return JSON.parse(content)
  } catch (error) {
    console.error('Failed to parse OpenAI response as JSON:', content)
    const errorMessage = error instanceof Error ? error.message : 'Unknown parsing error'
    throw new Error(`Invalid JSON response from OpenAI: ${errorMessage}`)
  }
}

/**
 * Generate fallback enrichment without LLM
 */
function generateFallbackEnrichment(
  node: Record<string, unknown>,
  relevantSources: SimilarContent[],
  options: {
    includeExamples?: boolean
    includeBestPractices?: boolean
    includeRisks?: boolean
  } = {}
): Record<string, unknown> {
  const enrichment: Record<string, unknown> = {
    detailed_description: `${node.content}\n\nThis concept encompasses multiple dimensions and considerations that are important for comprehensive understanding and successful implementation. The topic connects to various related areas and requires careful planning and execution.`,
    key_concepts: [
      "Core principles",
      "Implementation requirements", 
      "Success factors",
      "Related methodologies",
      "Performance metrics"
    ],
    implementation_steps: [
      "Analyze current state and requirements",
      "Develop comprehensive plan and timeline",
      "Prepare necessary resources and tools",
      "Execute implementation in phases",
      "Monitor progress and adjust as needed",
      "Evaluate results and optimize"
    ],
    related_resources: [
      "Industry best practices documentation",
      "Expert consultations and guidance",
      "Relevant tools and technologies",
      "Case studies and success stories"
    ]
  }

  if (options.includeBestPractices) {
    enrichment.best_practices = [
      "Start with clear objectives and success criteria",
      "Engage stakeholders throughout the process",
      "Maintain focus on value delivery",
      "Implement monitoring and feedback loops"
    ]
  }

  if (options.includeRisks) {
    enrichment.potential_risks = [
      "Insufficient planning or resource allocation",
      "Resistance to change or adoption challenges",
      "Technical complexity or integration issues"
    ]
  }

  if (options.includeExamples) {
    enrichment.examples = [
      "Small-scale pilot implementation",
      "Phased rollout approach",
      "Cross-functional team collaboration"
    ]
  }

  return enrichment
}

/**
 * Cache enriched content
 */
async function cacheEnrichedContent(
  supabase: SupabaseClient,
  nodeId: string,
  nodeType: string,
  enrichedContent: Record<string, unknown>,
  relevantSources: SimilarContent[],
  enrichmentContext: Record<string, unknown>
): Promise<string> {
  const cacheData = {
    content_type: `${nodeType}_enriched`,
    content_id: nodeId,
    content_text: `${enrichedContent.detailed_description || ''} ${Array.isArray(enrichedContent.key_concepts) ? enrichedContent.key_concepts.join(', ') : ''}`,
    metadata: {
      enriched_content: enrichedContent,
      relevant_sources: relevantSources,
      enrichment_context: enrichmentContext,
      cached_at: new Date().toISOString(),
      cached_until: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
    }
  }

  // Generate embedding for enriched content
  try {
    const embeddingResult = await generateEmbedding(cacheData.content_text)
    
    const { data, error } = await supabase
      .from('embeddings')
      .upsert({
        ...cacheData,
        embedding: `[${embeddingResult.embedding.join(',')}]`
      }, {
        onConflict: 'content_type,content_id'
      })
      .select('id')

    if (error) {
      console.error('Failed to cache enriched content:', error)
      return 'cache_failed'
    }

    return data?.[0]?.id || 'unknown'
  } catch (error) {
    console.error('Failed to generate embedding for cached content:', error)
    return 'embedding_failed'
  }
}

/**
 * Retrieve cached enrichment
 */
async function getCachedEnrichment(
  supabase: SupabaseClient,
  nodeId: string,
  nodeType: string
): Promise<Record<string, unknown> | null> {
  try {
    const { data, error } = await supabase
      .from('embeddings')
      .select('metadata')
      .eq('content_type', `${nodeType}_enriched`)
      .eq('content_id', nodeId)
      .single()

    if (error || !data) {
      return null
    }

    const metadata = data.metadata
    if (!metadata || !metadata.cached_until) {
      return null
    }

    // Check if cache is still valid
    if (new Date(metadata.cached_until) <= new Date()) {
      return null // Cache expired
    }

    return metadata
  } catch (error) {
    console.error('Error retrieving cached enrichment:', error)
    return null
  }
}

serve(async (req: Request) => {
  const { method } = req
  const origin = req.headers.get('Origin') || undefined
  const corsHeaders = getCorsHeaders(origin)

  // Handle CORS preflight requests
  if (method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const supabase = getSupabaseClient()

  try {
    if (method === 'POST') {
      // 🔧 FIX: Apply rate limiting for AI endpoints
      const rateLimitResult = rateLimit('ai')(req)
      if (!rateLimitResult.allowed) {
        return rateLimitResult.response!
      }

      // Pre-check request body size before parsing JSON
      const contentLength = req.headers.get('Content-Length')
      const MAX_REQUEST_SIZE = 1024 * 1024 // 1MB limit
      
      if (contentLength) {
        const size = parseInt(contentLength, 10)
        if (size > MAX_REQUEST_SIZE) {
          return new Response(
            JSON.stringify({ 
              error: `Request body too large. Maximum size allowed: ${MAX_REQUEST_SIZE} bytes`,
              success: false 
            }),
            { 
              status: 413,
              headers: { ...getCorsHeaders(req.headers.get('Origin') || undefined), "Content-Type": "application/json" }
            }
          )
        }
      }

      const body: NodeDetailRequest = await req.json()
      const { 
        nodeId,
        nodeType = 'mindmap_node',
        enrichmentType = 'comprehensive',
        maxRelevantSources = 15,
        similarityThreshold = 0.6,
        includeExamples = true,
        includeBestPractices = true,
        includeRisks = true,
        useLLM = true
      } = body

      // Validate input
      if (!nodeId) {
        return new Response(
          JSON.stringify({ 
            error: 'nodeId is required',
            success: false 
          }),
          { 
            status: 400,
            headers: { ...getCorsHeaders(req.headers.get('Origin') || undefined), "Content-Type": "application/json" }
          }
        )
      }

      console.log(`Enriching ${nodeType} node ${nodeId} with type: ${enrichmentType}`)

      // Check for cached enrichment first
      const cachedEnrichment = await getCachedEnrichment(supabase, nodeId, nodeType)
      if (cachedEnrichment) {
        console.log('Returning cached enrichment')
        return new Response(
          JSON.stringify({ 
            data: {
              ...(typeof cachedEnrichment.enriched_content === 'object' && cachedEnrichment.enriched_content ? cachedEnrichment.enriched_content as Record<string, unknown> : {}),
              relevant_sources: Array.isArray(cachedEnrichment.relevant_sources) ? cachedEnrichment.relevant_sources : [],
              enrichment_context: typeof cachedEnrichment.enrichment_context === 'object' && cachedEnrichment.enrichment_context ? cachedEnrichment.enrichment_context as Record<string, unknown> : {},
              cached: true,
              enrichment_id: 'cached'
            },
            success: true,
            message: 'Retrieved cached enriched content'
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        )
      }

      // Fetch node data
      let nodeData: Record<string, unknown> = {}
      
      if (nodeType === 'mindmap_node') {
        const { data: nodes, error: nodeError } = await supabase
          .from('mindmap_nodes')
          .select('*')
          .eq('id', nodeId)

        if (nodeError || !nodes || nodes.length === 0) {
          return new Response(
            JSON.stringify({ 
              error: 'Node not found',
              success: false 
            }),
            { 
              status: 404,
              headers: { ...getCorsHeaders(req.headers.get('Origin') || undefined), "Content-Type": "application/json" }
            }
          )
        }
        nodeData = nodes[0]
      } else if (nodeType === 'plan_node') {
        // Handle plan nodes from plans table
        const { data: plans, error: planError } = await supabase
          .from('plans')
          .select('*')
          .eq('id', nodeId)

        if (planError || !plans || plans.length === 0) {
          return new Response(
            JSON.stringify({ 
              error: 'Plan node not found',
              success: false 
            }),
            { 
              status: 404,
              headers: { ...getCorsHeaders(req.headers.get('Origin') || undefined), "Content-Type": "application/json" }
            }
          )
        }
        nodeData = {
          id: plans[0].id,
          title: plans[0].title,
          content: plans[0].description,
          metadata: { objective: plans[0].objective }
        }
      } else {
        return new Response(
          JSON.stringify({ 
            error: 'Unsupported node type',
            success: false 
          }),
          { 
            status: 400,
            headers: { ...getCorsHeaders(req.headers.get('Origin') || undefined), "Content-Type": "application/json" }
          }
        )
      }

      // Generate embedding for node content
      const nodeText = `${nodeData.title}: ${nodeData.content}`
      let queryEmbedding: number[] = []
      
      try {
        const embeddingResult = await generateEmbedding(nodeText)
        queryEmbedding = embeddingResult.embedding
      } catch (error) {
        console.error('Failed to generate embedding:', (error as Error).message)
        // Continue without embeddings if generation fails
      }

      // Find relevant sources using vector search
      let relevantSources: SimilarContent[] = []
      if (queryEmbedding.length > 0) {
        try {
          relevantSources = await findSimilarContent(
            supabase,
            queryEmbedding,
            {
              contentTypes: ['mindmap_node', 'user_input', 'enterprise_data', 'plan_node', 'mindmap_node_enriched'],
              similarityThreshold,
              maxResults: maxRelevantSources,
              excludeContentId: nodeId
            }
          )
          console.log(`Found ${relevantSources.length} relevant sources`)
        } catch (error) {
          console.error('Vector similarity search failed:', (error as Error).message)
          // Continue without relevant sources if search fails
        }
      }

      // Enrich content using RAG
      let enrichedContent: Record<string, unknown> = {}
      let generationMethod = 'fallback'

      const enrichmentOptions = {
        includeExamples,
        includeBestPractices,
        includeRisks
      }

      if (useLLM) {
        try {
          enrichedContent = await enrichNodeContent(
            nodeData,
            relevantSources,
            enrichmentType,
            enrichmentOptions
          ) as Record<string, unknown>
          generationMethod = 'llm'
          console.log('Content enriched using LLM with RAG')
        } catch (error) {
          console.error('LLM enrichment failed:', (error as Error).message)
          console.log('Falling back to rule-based enrichment')
        }
      }

      // Fallback to rule-based enrichment if LLM failed or disabled
      if (!enrichedContent.detailed_description) {
        enrichedContent = generateFallbackEnrichment(nodeData, relevantSources, enrichmentOptions)
        generationMethod = 'fallback'
        console.log('Content enriched using fallback method')
      }

      // Calculate confidence score
      const confidenceScore = generationMethod === 'llm' 
        ? Math.min(0.9, 0.6 + (relevantSources.length * 0.05))
        : Math.min(0.7, 0.4 + (relevantSources.length * 0.03))

      // Prepare enrichment context
      const enrichmentContext = {
        enrichment_type: enrichmentType,
        sources_used: relevantSources.length,
        confidence_score: confidenceScore,
        generation_method: generationMethod,
        similarity_threshold: similarityThreshold,
        options_used: enrichmentOptions
      }

      // Cache the enriched content
      const enrichmentId = await cacheEnrichedContent(
        supabase,
        nodeId,
        nodeType,
        enrichedContent,
        relevantSources,
        enrichmentContext
      )

      const response: EnrichedNodeDetail = {
        original_node: {
          id: typeof nodeData.id === 'string' ? nodeData.id : String(nodeData.id || ''),
          title: typeof nodeData.title === 'string' ? nodeData.title : String(nodeData.title || ''),
          content: typeof nodeData.content === 'string' ? nodeData.content : String(nodeData.content || ''),
          metadata: typeof nodeData.metadata === 'object' && nodeData.metadata ? nodeData.metadata as Record<string, unknown> : undefined
        },
        enriched_content: enrichedContent as {
          detailed_description: string;
          key_concepts: string[];
          implementation_steps?: string[];
          best_practices?: string[];
          potential_risks?: string[];
          examples?: string[];
          related_resources?: string[];
        },
        relevant_sources: relevantSources,
        enrichment_context: enrichmentContext,
        cached_until: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        enrichment_id: enrichmentId
      }

      const finalResponse = new Response(
        JSON.stringify({ 
          data: response,
          success: true,
          message: `Successfully enriched node content using ${generationMethod} method with ${relevantSources.length} relevant sources`
        }),
        { 
          status: 200,
          headers: { ...getCorsHeaders(req.headers.get('Origin') || undefined), "Content-Type": "application/json" }
        }
      )
      
      // 🔧 FIX: Add rate limit headers
      return addRateLimitHeaders(finalResponse, rateLimitResult.info)
    }

    // GET - Retrieve cached enrichments
    if (method === 'GET') {
      const url = new URL(req.url)
      const nodeId = url.searchParams.get('nodeId')
      const nodeType = url.searchParams.get('nodeType') || 'mindmap_node'

      if (nodeId) {
        // Get specific cached enrichment
        const cachedEnrichment = await getCachedEnrichment(supabase, nodeId, nodeType)
        
        return new Response(
          JSON.stringify({ 
            data: cachedEnrichment,
            success: true 
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        )
      } else {
        // Get all cached enrichments
        const { data, error } = await supabase
          .from('embeddings')
          .select('content_id, content_type, metadata, created_at')
          .like('content_type', '%_enriched')
          .order('created_at', { ascending: false })
          .limit(50)

        if (error) {
          throw new Error(`Failed to retrieve cached enrichments: ${error.message}`)
        }

        return new Response(
          JSON.stringify({ 
            data,
            count: data.length,
            success: true 
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        )
      }
    }

    return new Response(
      JSON.stringify({ 
        error: 'Method not allowed. Use POST to enrich node details or GET to retrieve cached enrichments.',
        success: false 
      }),
      { 
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    )

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ 
        error: (error as Error).message || 'Internal server error',
        success: false 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    )
  }
})