// @ts-expect-error: Deno module resolution
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { getCorsJsonHeaders } from '../_shared/cors.js'
// Removed unused import: generateEmbedding
import { openAIClient, isOpenAIEnabled, getOpenAIStatus } from '../_shared/openai.js'
import { mockAIGenerator } from '../_shared/mock-ai.js'
import type { DenoGlobal } from '../_shared/types.js'

// Types for the smart mindmap creation
interface SmartMindmapRequest {
  input: string
  options?: {
    maxNodes?: number
    includeEnterpriseData?: boolean
    language?: 'korean' | 'english'
  }
}

/**
 * Normalize and validate mindmap node from AI generation
 */
function normalizeNode(node: unknown): MindmapNode {
  const nodeRecord = node as Record<string, unknown>
  
  // Validate and normalize type
  let nodeType: 'center' | 'major' | 'minor' | 'detail' = 'major'
  if (nodeRecord.type === 'center' || nodeRecord.type === 'major' || nodeRecord.type === 'minor' || nodeRecord.type === 'detail') {
    nodeType = nodeRecord.type
  }

  // Ensure metadata exists and normalize source
  let metadata: MindmapNode['metadata'] = {
    source: 'ai',
    confidence: 0.8,
    keywords: []
  }

  if (nodeRecord.metadata && typeof nodeRecord.metadata === 'object') {
    const metadataRecord = nodeRecord.metadata as Record<string, unknown>
    const source = metadataRecord.source
    let normalizedSource: 'ai' | 'parsed' | 'enterprise' | 'rag' = 'ai'
    
    if (source === 'ai' || source === 'parsed' || source === 'enterprise' || source === 'rag') {
      normalizedSource = source
    }

    metadata = {
      source: normalizedSource,
      confidence: typeof metadataRecord.confidence === 'number' ? metadataRecord.confidence : 0.8,
      keywords: Array.isArray(metadataRecord.keywords) ? metadataRecord.keywords : [],
      relatedCompanies: Array.isArray(metadataRecord.relatedCompanies) ? metadataRecord.relatedCompanies : undefined
    }
  }

  return {
    id: typeof nodeRecord.id === 'string' ? nodeRecord.id : '',
    title: typeof nodeRecord.title === 'string' ? nodeRecord.title : '',
    content: typeof nodeRecord.content === 'string' ? nodeRecord.content : '',
    x: typeof nodeRecord.x === 'number' ? nodeRecord.x : 0,
    y: typeof nodeRecord.y === 'number' ? nodeRecord.y : 0,
    level: typeof nodeRecord.level === 'number' ? nodeRecord.level : 0,
    parentId: typeof nodeRecord.parentId === 'string' ? nodeRecord.parentId : undefined,
    type: nodeType,
    metadata
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
      parseResults: unknown
      enterpriseResults: unknown
    }
  }
  error?: string
}

serve(async (req: Request) => {
  const origin = req.headers.get('origin') || undefined
  const corsJsonHeaders = getCorsJsonHeaders(origin)

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsJsonHeaders })
  }

  try {
    const startTime = Date.now()

    // Parse request body with enhanced UTF-8 handling
    let requestData: SmartMindmapRequest
    try {
      // 🔧 FIX: Simplified UTF-8 decoding using Request.text() which handles UTF-8 automatically
      const textBody = await req.text()
      
      console.log('📥 Smart Mindmap received text body:', textBody)
      requestData = JSON.parse(textBody)
    } catch (parseError) {
      console.error('JSON parsing failed:', parseError)
      return Response.json(
        { success: false, error: 'Invalid JSON in request body' },
        { status: 400, headers: corsJsonHeaders }
      )
    }

    const { input, options = {} } = requestData

    if (!input || input.trim() === '') {
      return Response.json(
        { success: false, error: 'Input text is required' },
        { status: 400, headers: corsJsonHeaders }
      )
    }

    // 🔧 FIX: Removed unused variables includeRAG and layout
    const {
      maxNodes = 12,
      includeEnterpriseData = true,
      language = 'korean'
    } = options

    console.log(`[Smart Mindmap] Processing: "${input.substring(0, 50)}..."`)

    // Step 1: Parse input text (Korean NLP)
    console.log('[Step 1] Parsing input...')
    const deno = (globalThis as { Deno?: DenoGlobal }).Deno
    const supabaseUrl = deno?.env?.get('SUPABASE_URL')
    
    if (!supabaseUrl || supabaseUrl === '') {
      throw new Error('SUPABASE_URL not set in environment variables')
    }
    const parseResponse = await fetch(`${supabaseUrl}/functions/v1/parse-input`, {
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
      const inputTokens = input.trim().split(/\s+/).filter(token => token.length > 0)
      const fallbackToken = inputTokens.length > 0 ? inputTokens[0] : 'keyword'
      const mainKeywords = parseData.data.keywords.nouns?.slice(0, 3) || [fallbackToken]
      
      const enterpriseResponse = await fetch(`${supabaseUrl}/functions/v1/fetch-enterprise-data`, {
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
    let connections: Array<{ id: string; sourceId: string; targetId: string; type: string }> = []
    let usedMockAI = false
    let usedFallback = false

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

        nodes = (mindmapData.nodes || []).map(normalizeNode)
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
        nodes = (mockResult.nodes || []).map(normalizeNode)
        connections = mockResult.connections || []
        usedMockAI = true
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
      nodes = (mockResult.nodes || []).map(normalizeNode)
      connections = mockResult.connections || []
      usedMockAI = true
    }

    // Step 4: Fallback mindmap generation if OpenAI is not available or failed
    if (nodes.length === 0) {
      console.log('[Step 4] Using fallback mindmap generation...')
      usedFallback = true
      
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
      const inputTokens = input.trim().split(/\s+/).filter(token => token.length > 0)
      const fallbackToken = inputTokens.length > 0 ? inputTokens[0] : 'keyword'
      const keywords = parseData.data.keywords?.nouns || [fallbackToken]
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
          sources: [
            'parse-input', 
            ...(includeEnterpriseData ? ['enterprise-data'] : []), 
            usedMockAI ? 'mock-ai' : (usedFallback ? 'fallback-generation' : 'ai-generation')
          ],
          totalNodes: nodes.length,
          parseResults: parseData.data,
          enterpriseResults: enterpriseData
        }
      }
    }

    return Response.json(response, { headers: corsJsonHeaders })

  } catch (error) {
    console.error('[Smart Mindmap] Error:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    return Response.json(
      { 
        success: false, 
        error: `Smart mindmap generation failed: ${errorMessage}` 
      },
      { status: 500, headers: corsJsonHeaders }
    )
  }
})