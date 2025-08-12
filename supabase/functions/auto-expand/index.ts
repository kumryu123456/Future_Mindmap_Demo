// @ts-expect-error: Deno module resolution
import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { getCorsHeaders, getCorsJsonHeaders } from "../_shared/cors.js"
import { getSupabaseClient } from "../_shared/supabase.js"
import { rateLimit, addRateLimitHeaders } from "../_shared/rate-limiter.js"
import { 
  generateEmbedding, 
  findSimilarContent, 
  storeEmbedding,
  SimilarContent 
} from "../_shared/embeddings.js"
import { createLogger } from "../_shared/logger.js"
import { DenoGlobal } from "../_shared/types.js"
// Removed unused imports: metrics, withMetrics, measurePerformance

const logger = createLogger('AutoExpand')
logger.info('Auto-Expand Function initialized!')

interface ParentNode {
  id: string
  title: string
  content: string
  x: number
  y: number
  type: string
}

interface ChildNodeSuggestion {
  title: string
  content: string
  reasoning: string
  x: number
  y: number
  priority: number
  confidence: number
}

interface AutoExpandRequest {
  parentNodeId: string
  parentNodeType?: string // 'mindmap_node' | 'plan_node' | 'custom'
  maxChildren?: number
  similarityThreshold?: number
  expansionStyle?: 'comprehensive' | 'focused' | 'creative' | 'analytical'
  useLLM?: boolean
}

interface AutoExpandResponse {
  parent_node: ParentNode
  similar_content: SimilarContent[]
  generated_children: ChildNodeSuggestion[]
  expansion_context: Record<string, unknown>
  created_mindmap_nodes?: unknown[]
  expansion_id: string
}

/**
 * Generate comprehensive prompt for child node creation
 */
function buildExpansionPrompt(
  parentNode: ParentNode,
  similarContent: SimilarContent[],
  expansionStyle: string,
  maxChildren: number
): string {
  const similarContentText = similarContent
    .slice(0, 5) // Limit to top 5 for context
    .map(item => `- ${item.content_text} (similarity: ${item.similarity_score.toFixed(2)}, source: ${item.content_type})`)
    .join('\n')

  const styleInstructions = {
    comprehensive: "Generate diverse child nodes covering multiple aspects and perspectives of the parent concept",
    focused: "Generate highly specific and actionable child nodes that directly support the parent concept",
    creative: "Generate innovative and creative child nodes that explore novel angles and possibilities",
    analytical: "Generate logical, structured child nodes that break down the parent concept systematically"
  }

  return `You are an expert knowledge architect and strategic thinking assistant. Your task is to generate meaningful child nodes that expand upon a parent concept in a mindmap.

**Parent Node:**
Title: "${parentNode.title}"
Content: "${parentNode.content}"
Position: (${parentNode.x}, ${parentNode.y})

**Similar Content Found (for context):**
${similarContentText || 'No similar content found'}

**Expansion Style:** ${expansionStyle}
${styleInstructions[expansionStyle as keyof typeof styleInstructions]}

**Requirements:**
1. Generate exactly ${maxChildren} child nodes
2. Each child should be meaningfully related to the parent but distinct from siblings
3. Ensure progressive positioning around the parent node
4. Provide clear reasoning for each child node
5. Include confidence score (0.0-1.0) and priority (1-5)

**Output Format (JSON only):**
{
  "children": [
    {
      "title": "Clear, specific title (3-8 words)",
      "content": "Detailed description of what this child node represents and how it relates to the parent",
      "reasoning": "Brief explanation of why this child node is valuable and how it connects to the parent concept",
      "x": number, // Position relative to parent, distributed around parent
      "y": number, // Position relative to parent, distributed around parent  
      "priority": number, // 1-5, where 5 is highest priority
      "confidence": number // 0.0-1.0, confidence in the relevance and value of this child
    }
  ]
}

**Positioning Guidelines:**
- Distribute child nodes in a circular or radial pattern around parent
- Use increments of 120-150 pixels for spacing
- Vary both x and y coordinates to avoid overlapping
- Consider the parent position (${parentNode.x}, ${parentNode.y}) as the center

**Quality Criteria:**
- Each child should add unique value
- Content should be actionable or informative
- Titles should be concise but descriptive
- Reasoning should justify the connection to parent

Return only valid JSON without any markdown formatting or additional text.`
}

/**
 * Call OpenAI to generate child node suggestions
 */
async function generateChildNodes(
  parentNode: ParentNode,
  similarContent: SimilarContent[],
  maxChildren: number,
  expansionStyle: string = 'comprehensive'
): Promise<ChildNodeSuggestion[]> {
  const deno = (globalThis as { Deno?: DenoGlobal }).Deno
  const openaiApiKey = deno?.env?.get('OPENAI_API_KEY')
  
  if (!openaiApiKey) {
    throw new Error('OpenAI API key not configured')
  }

  const prompt = buildExpansionPrompt(parentNode, similarContent, expansionStyle, maxChildren)

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are an expert knowledge architect. Always respond with valid JSON only, no markdown or additional text.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
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
    const parsed = JSON.parse(content)
    return parsed.children || []
  } catch (error) {
    const parseError = error instanceof Error ? error.message : 'Unknown parsing error'
    const truncatedContent = content.length > 500 ? `${content.substring(0, 500)}...` : content
    console.error('Failed to parse OpenAI response as JSON:', {
      parseError,
      responseContent: truncatedContent,
      contentLength: content.length
    })
    throw new Error(`Invalid JSON response from OpenAI. Parse error: ${parseError}. Response content: ${truncatedContent}`)
  }
}

/**
 * Generate fallback child nodes without LLM
 */
function generateFallbackNodes(
  parentNode: ParentNode,
  similarContent: SimilarContent[],
  maxChildren: number
): ChildNodeSuggestion[] {
  const children: ChildNodeSuggestion[] = []
  
  // Base positioning around parent
  const radius = 150
  const angleStep = (2 * Math.PI) / maxChildren
  
  for (let i = 0; i < maxChildren; i++) {
    const angle = i * angleStep
    const x = parentNode.x + radius * Math.cos(angle)
    const y = parentNode.y + radius * Math.sin(angle)
    
    children.push({
      title: `Sub-concept ${i + 1}`,
      content: `Related concept derived from: ${parentNode.title}`,
      reasoning: `Generated as a sub-component of the parent concept`,
      x: Math.round(x),
      y: Math.round(y),
      priority: 3,
      confidence: 0.6
    })
  }
  
  return children
}

// Shared response types to avoid duplication
interface ErrorDetail {
  message: string;
  code?: string;
  details?: string;
}

interface Response<T> {
  data?: T;
  error?: ErrorDetail;
}

// Generic query builder interface
interface QueryBuilder<TData = unknown, TResult = Response<TData[]>> {
  select(columns?: string): QueryBuilder<TData, TResult>;
  eq(column: string, value: unknown): QueryBuilder<TData, TResult>;
  in?(column: string, values: unknown[]): QueryBuilder<TData, TResult>;
  order?(column: string, options?: { ascending?: boolean }): QueryBuilder<TData, TResult>;
  limit?(count: number): QueryBuilder<TData, TResult>;
  single?(): QueryBuilder<TData, Response<TData>>;
  then<R1 = TResult, R2 = never>(
    onfulfilled?: ((value: TResult) => R1 | PromiseLike<R1>) | null,
    onrejected?: ((reason: unknown) => R2 | PromiseLike<R2>) | null
  ): Promise<R1 | R2>;
}

// Simplified TypedSupabaseClient interface
interface TypedSupabaseClient {
  from(table: string): {
    insert(data: unknown[] | Record<string, unknown>): QueryBuilder<unknown, Response<unknown[]>>;
    select(columns?: string): QueryBuilder;
    update(data: Record<string, unknown>): {
      eq(column: string, value: unknown): QueryBuilder<unknown, Response<unknown[]>>;
    };
    delete(): {
      eq(column: string, value: unknown): QueryBuilder<unknown, Response<unknown[]>>;
    };
    upsert(data: unknown[] | Record<string, unknown>, options?: { onConflict?: string }): QueryBuilder<unknown, Response<unknown[]>>;
  };
  rpc<T = unknown>(name: string, params?: Record<string, unknown>): Promise<Response<T>>;
}

function getTypedSupabaseClient(supabase: unknown): TypedSupabaseClient {
  return supabase as TypedSupabaseClient;
}

/**
 * Create actual mindmap nodes from suggestions
 */
async function createMindmapNodes(
  supabase: unknown,
  parentNodeId: string,
  childSuggestions: ChildNodeSuggestion[]
): Promise<unknown[]> {
  const nodesToCreate = childSuggestions.map(child => ({
    title: child.title,
    content: child.content,
    x: child.x,
    y: child.y,
    parent_id: parentNodeId
  }))

  const client = getTypedSupabaseClient(supabase);
  
  const { data, error } = await client
    .from('mindmap_nodes')
    .insert(nodesToCreate)
    .select()

  if (error) {
    // 🔧 FIX: Enhanced error handling with safe stringification
    const errorDetails = {
      message: String(error.message || 'Unknown error'),
      code: String(error.code || 'UNKNOWN_ERROR'),
      details: typeof error.details === 'object' ? JSON.stringify(error.details) : String(error.details || 'No additional details')
    }
    
    console.error('Failed to create mindmap nodes:', {
      ...errorDetails,
      timestamp: new Date().toISOString(),
      nodesToCreateCount: nodesToCreate.length
    })
    throw new Error(`Failed to create mindmap nodes: ${errorDetails.message} (Code: ${errorDetails.code})`)
  }

  return data || []
}

/**
 * Store expansion history
 */
async function storeExpansionHistory(
  supabase: unknown,
  parentNodeId: string,
  parentNodeType: string,
  similarContent: SimilarContent[],
  generatedChildren: ChildNodeSuggestion[],
  expansionContext: Record<string, unknown>
): Promise<string> {
  const client = getTypedSupabaseClient(supabase);
  
  const { data, error } = await client
    .from('node_expansions')
    .insert({
      parent_node_id: parentNodeId,
      parent_node_type: parentNodeType,
      expansion_context: expansionContext,
      similar_content: similarContent,
      generated_children: generatedChildren,
      expansion_method: 'llm_generation',
      similarity_threshold: expansionContext.similarity_threshold || 0.7,
      max_children: generatedChildren.length,
      llm_model: 'gpt-3.5-turbo'
    })
    .select()

  if (error) {
    // 🔧 FIX: Enhanced error logging with detailed error information
    const errorDetails = {
      message: error.message || 'Unknown error',
      code: error.code || 'UNKNOWN_ERROR',
      details: error.details || 'No additional details'
    }
    
    console.error('Failed to store expansion history:', {
      errorDetails,
      timestamp: new Date().toISOString(),
      parentNodeId,
      parentNodeType
    })
    
    // 🔧 FIX: Propagate the failure instead of returning 'unknown'
    throw new Error(`Failed to store expansion history: ${errorDetails.message} (Code: ${errorDetails.code})`);
  }

  return (data?.[0] as { id: string })?.id || 'unknown'
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

      const body: AutoExpandRequest = await req.json()
      const { 
        parentNodeId,
        parentNodeType = 'mindmap_node',
        maxChildren = 5,
        similarityThreshold = 0.7,
        expansionStyle = 'comprehensive',
        useLLM = true
      } = body

      // Validate input
      if (!parentNodeId) {
        return new Response(
          JSON.stringify({ 
            error: 'parentNodeId is required',
            success: false 
          }),
          { 
            status: 400,
            headers: getCorsJsonHeaders(req.headers.get('Origin') || undefined)
          }
        )
      }

      console.log(`Auto-expanding node ${parentNodeId} with style: ${expansionStyle}`)

      // Fetch parent node data
      const { data: parentNodes, error: parentError } = await supabase
        .from('mindmap_nodes')
        .select('*')
        .eq('id', parentNodeId)

      if (parentError || !parentNodes || parentNodes.length === 0) {
        return new Response(
          JSON.stringify({ 
            error: 'Parent node not found',
            success: false 
          }),
          { 
            status: 404,
            headers: getCorsJsonHeaders(req.headers.get('Origin') || undefined)
          }
        )
      }

      const parentNode: ParentNode = {
        id: parentNodes[0].id,
        title: parentNodes[0].title,
        content: parentNodes[0].content,
        x: parentNodes[0].x,
        y: parentNodes[0].y,
        type: parentNodeType
      }

      // Generate embedding for parent node content
      const parentText = `${parentNode.title}: ${parentNode.content}`
      let queryEmbedding: number[] = []
      
      try {
        const embeddingResult = await generateEmbedding(parentText)
        queryEmbedding = embeddingResult.embedding
        
        // Store embedding for future use
        await storeEmbedding(
          supabase,
          parentNodeType,
          parentNodeId,
          parentText,
          queryEmbedding,
          { title: parentNode.title, type: parentNodeType }
        )
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        console.error('Failed to generate embedding:', errorMessage)
        // Continue without embeddings if generation fails
      }

      // Find similar content using vector search
      let similarContent: SimilarContent[] = []
      if (queryEmbedding.length > 0) {
        try {
          similarContent = await findSimilarContent(
            supabase,
            queryEmbedding,
            {
              contentTypes: ['mindmap_node', 'user_input', 'enterprise_data', 'plan_node'],
              similarityThreshold,
              maxResults: 20,
              excludeContentId: parentNodeId
            }
          )
          console.log(`Found ${similarContent.length} similar content items`)
        } catch (error) {
          console.error('Vector similarity search failed:', (error as Error).message)
          // Continue without similar content if search fails
        }
      }

      // Generate child node suggestions
      let childSuggestions: ChildNodeSuggestion[] = []
      let generationMethod = 'fallback'

      if (useLLM) {
        try {
          childSuggestions = await generateChildNodes(
            parentNode,
            similarContent,
            maxChildren,
            expansionStyle
          )
          generationMethod = 'llm'
          console.log(`Generated ${childSuggestions.length} child suggestions using LLM`)
        } catch (error) {
          console.error('LLM generation failed:', (error as Error).message)
          console.log('Falling back to rule-based generation')
        }
      }

      // Fallback to rule-based generation if LLM failed or disabled
      if (childSuggestions.length === 0) {
        childSuggestions = generateFallbackNodes(parentNode, similarContent, maxChildren)
        generationMethod = 'fallback'
        console.log(`Generated ${childSuggestions.length} child suggestions using fallback method`)
      }

      // Create actual mindmap nodes
      let createdNodes: unknown[] = []
      try {
        createdNodes = await createMindmapNodes(supabase, parentNodeId, childSuggestions)
        console.log(`Created ${createdNodes.length} new mindmap nodes`)
      } catch (error) {
        console.error('Failed to create mindmap nodes:', (error as Error).message)
        // Return suggestions even if node creation fails
      }

      // Store expansion history
      const expansionContext = {
        parent_title: parentNode.title,
        parent_content: parentNode.content,
        expansion_style: expansionStyle,
        similarity_threshold: similarityThreshold,
        generation_method: generationMethod,
        similar_content_count: similarContent.length
      }

      const expansionId = await storeExpansionHistory(
        supabase,
        parentNodeId,
        parentNodeType,
        similarContent,
        childSuggestions,
        expansionContext
      )

      const response: AutoExpandResponse = {
        parent_node: parentNode,
        similar_content: similarContent,
        generated_children: childSuggestions,
        expansion_context: expansionContext,
        created_mindmap_nodes: createdNodes,
        expansion_id: expansionId
      }

      const finalResponse = new Response(
        JSON.stringify({ 
          data: response,
          success: true,
          message: `Successfully expanded node with ${childSuggestions.length} children using ${generationMethod} method`
        }),
        { 
          status: 201,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      )
      
      // 🔧 FIX: Add rate limit headers
      return addRateLimitHeaders(finalResponse, rateLimitResult.info)
    }

    // GET - Retrieve expansion history
    if (method === 'GET') {
      const url = new URL(req.url)
      const parentNodeId = url.searchParams.get('parentNodeId')
      const limit = parseInt(url.searchParams.get('limit') || '10')

      let query = supabase
        .from('node_expansions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)

      if (parentNodeId) {
        query = query.eq('parent_node_id', parentNodeId)
      }

      const { data, error } = await query

      if (error) {
        throw new Error(`Failed to retrieve expansion history: ${(error as Error).message}`)
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

    return new Response(
      JSON.stringify({ 
        error: 'Method not allowed. Use POST to auto-expand a node or GET to retrieve expansion history.',
        success: false 
      }),
      { 
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    )

  } catch (error: unknown) {
    console.error('Function error:', (error as Error).message)
    return new Response(
      JSON.stringify({ 
        error: (error as Error).message,
        success: false 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    )
  }
})