import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { getCorsHeaders } from '../_shared/cors.ts'
import { getSupabaseClient } from '../_shared/supabase.ts'
import { generateEmbedding } from '../_shared/embeddings.ts'
import { openAIClient, isOpenAIEnabled, getOpenAIStatus } from '../_shared/openai.ts'
import { mockAIGenerator } from '../_shared/mock-ai.ts'

// Types for the smart mindmap creation
interface SmartMindmapRequest {
  input: string
  options?: {
    maxNodes?: number
    includeEnterpriseData?: boolean
    includeRAG?: boolean
    layout?: 'hierarchical' | 'radial' | 'force'
    language?: string
  }
}

interface MindmapNode {
  id: string
  title: string
  content: string
  x: number
  y: number
  type: 'center' | 'major' | 'minor' | 'detail'
  parentId?: string
  level: number
  metadata?: {
    source?: 'parsed' | 'enterprise' | 'rag' | 'ai'
    confidence?: number
    relatedCompanies?: string[]
    keywords?: string[]
  }
}

interface SmartMindmapResponse {
  success: boolean
  data?: {
    nodes: MindmapNode[]
    connections: Array<{
      id: string
      sourceId: string
      targetId: string
      type: string
    }>
    metadata: {
      processingTime: number
      sources: string[]
      totalNodes: number
      parseResults: any
      enterpriseResults: any
    }
  }
  error?: string
}

serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req.headers.get('origin'))

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const startTime = Date.now()
    const supabase = getSupabaseClient()

    // Parse request body with enhanced UTF-8 handling
    let requestData: SmartMindmapRequest
    try {
      // Enhanced UTF-8 JSON parsing for Korean text
      let textBody: string
      
      try {
        // Primary: UTF-8 with error handling
        const textDecoder = new TextDecoder('utf-8', { fatal: true })
        const rawBody = await req.arrayBuffer()
        textBody = textDecoder.decode(rawBody)
      } catch (decodeError) {
        console.warn('UTF-8 decoding failed, trying fallback:', decodeError)
        // Fallback: Try without fatal flag
        const textDecoder = new TextDecoder('utf-8', { fatal: false })
        const rawBody = await req.arrayBuffer()
        textBody = textDecoder.decode(rawBody)
      }
      
      console.log('📥 Smart Mindmap received text body:', textBody)
      requestData = JSON.parse(textBody)
    } catch (parseError) {
      return Response.json(
        { success: false, error: 'Invalid JSON in request body' },
        { status: 400, headers: corsHeaders }
      )
    }

    const { input, options = {} } = requestData

    if (!input || input.trim() === '') {
      return Response.json(
        { success: false, error: 'Input text is required' },
        { status: 400, headers: corsHeaders }
      )
    }

    const {
      maxNodes = 12,
      includeEnterpriseData = true,
      includeRAG = false, // RAG는 2단계에서 사용
      layout = 'hierarchical',
      language = 'korean'
    } = options

    console.log(`[Smart Mindmap] Processing: "${input.substring(0, 50)}..."`)

    // Step 1: Parse input text (Korean NLP)
    console.log('[Step 1] Parsing input...')
    const parseResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/parse-input`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Authorization': req.headers.get('Authorization') || ''
      },
      body: JSON.stringify({
        rawText: input.trim(), // 올바른 필드명 사용
        context: 'mindmap_generation'
      })
    })

    const parseData = await parseResponse.json()
    if (!parseData.success) {
      throw new Error(`Parse failed: ${parseData.error}`)
    }

    console.log('[Step 1] Parse results:', parseData.data.keywords)

    // Step 2: Fetch enterprise data (if enabled)
    let enterpriseData = null
    if (includeEnterpriseData) {
      console.log('[Step 2] Fetching enterprise data...')
      
      // Use main keywords for enterprise search
      const mainKeywords = parseData.data.keywords.nouns?.slice(0, 3) || [input.split(' ')[0]]
      
      const enterpriseResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/fetch-enterprise-data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Authorization': req.headers.get('Authorization') || ''
        },
        body: JSON.stringify({
          query: mainKeywords.join(' '),
          options: { maxResults: 5, includeMetadata: true }
        })
      })

      const enterpriseResult = await enterpriseResponse.json()
      if (enterpriseResult.success) {
        enterpriseData = enterpriseResult.data
        console.log('[Step 2] Enterprise data found:', enterpriseData?.results?.length || 0, 'items')
      }
    }

    // Step 3: Generate AI-powered mindmap structure using OpenAI
    console.log('[Step 3] Generating smart mindmap structure with OpenAI...')
    
    let nodes: MindmapNode[] = []
    let connections: any[] = []

    // Check OpenAI availability
    const openAIStatus = getOpenAIStatus()
    console.log('🤖 OpenAI Status:', openAIStatus)

    if (isOpenAIEnabled() && openAIClient) {
      try {
        // Generate mindmap using OpenAI
        const mindmapData = await openAIClient.generateMindmapContent(
          input,
          parseData.data,
          enterpriseData,
          {
            maxNodes,
            language: language as 'korean' | 'english',
            includeMetadata: true
          }
        )

        nodes = mindmapData.nodes || []
        connections = mindmapData.connections || []

        console.log(`✅ OpenAI generated ${nodes.length} nodes and ${connections.length} connections`)

      } catch (error) {
        console.error('❌ OpenAI generation failed, using Mock AI:', error)
        // Fall back to Mock AI if OpenAI fails
        const mockResult = await mockAIGenerator.generateMindmapContent(
          input,
          parseData.data,
          enterpriseData,
          {
            maxNodes,
            language: language as 'korean' | 'english',
            includeMetadata: true
          }
        )
        nodes = mockResult.nodes || []
        connections = mockResult.connections || []
      }
    } else {
      console.log('⚠️ OpenAI not available, using Mock AI generation')
      // Use Mock AI when OpenAI is not available
      const mockResult = await mockAIGenerator.generateMindmapContent(
        input,
        parseData.data,
        enterpriseData,
        {
          maxNodes,
          language: language as 'korean' | 'english',
          includeMetadata: true
        }
      )
      nodes = mockResult.nodes || []
      connections = mockResult.connections || []
    }

    // Step 4: Fallback mindmap generation if OpenAI is not available or failed
    if (nodes.length === 0) {
      console.log('[Step 4] Using fallback mindmap generation...')
      
      // Create center node
      const centerNode: MindmapNode = {
        id: 'center-0',
        title: input.length > 50 ? `${input.substring(0, 47)}...` : input,
        content: input,
        x: 0,
        y: 0,
        type: 'center',
        level: 0,
        metadata: {
          source: 'parsed',
          confidence: 1.0,
          keywords: parseData.data.keywords?.nouns || []
        }
      }
      nodes.push(centerNode)

      // Generate basic nodes from parsed keywords
      const keywords = parseData.data.keywords?.nouns || [input.split(' ')[0]]
      const maxMainNodes = Math.min(keywords.length, maxNodes - 1, 6)

      keywords.slice(0, maxMainNodes).forEach((keyword: string, index: number) => {
        const angle = (index * 2 * Math.PI) / maxMainNodes
        const radius = 200

        const majorNode: MindmapNode = {
          id: `major-${index}`,
          title: keyword,
          content: `${keyword}에 관한 세부 내용`,
          x: Math.cos(angle) * radius,
          y: Math.sin(angle) * radius,
          type: 'major',
          parentId: 'center-0',
          level: 1,
          metadata: {
            source: 'parsed',
            confidence: 0.7,
            keywords: [keyword]
          }
        }
        nodes.push(majorNode)

        // Create connection
        connections.push({
          id: `conn-center-${index}`,
          sourceId: 'center-0',
          targetId: `major-${index}`,
          type: 'main'
        })
      })

      console.log(`🔄 Fallback generated ${nodes.length} nodes`)
    }

    const processingTime = Date.now() - startTime
    console.log(`[Smart Mindmap] Completed in ${processingTime}ms with ${nodes.length} nodes`)

    const response: SmartMindmapResponse = {
      success: true,
      data: {
        nodes,
        connections,
        metadata: {
          processingTime,
          sources: ['parse-input', ...(includeEnterpriseData ? ['enterprise-data'] : []), 'ai-generation'],
          totalNodes: nodes.length,
          parseResults: parseData.data,
          enterpriseResults: enterpriseData
        }
      }
    }

    return Response.json(response, { headers: corsHeaders })

  } catch (error) {
    console.error('[Smart Mindmap] Error:', error)
    
    return Response.json(
      { 
        success: false, 
        error: `Smart mindmap generation failed: ${error.message}` 
      },
      { status: 500, headers: corsHeaders }
    )
  }
})