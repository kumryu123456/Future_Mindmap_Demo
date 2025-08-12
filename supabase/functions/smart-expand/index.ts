// @ts-expect-error Deno std library types not available in current TypeScript config
import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { getCorsHeaders } from "../_shared/cors.js"
import { getSupabaseClient } from "../_shared/supabase.js"
import { generateEmbedding, findSimilarContent } from "../_shared/embeddings.js"
import { createLogger } from "../_shared/logger.js"
import { DenoGlobal } from "../_shared/types.js"

const logger = createLogger('SmartExpand')

/**
 * RAG item interface for type-safe handling of similar content
 */
interface RagItem {
  content_text: string
  similarity_score: number
  content_type: string
}

/**
 * Type guard to validate RAG items
 */
function isRagItem(item: unknown): item is RagItem {
  return (
    item !== null &&
    typeof item === 'object' &&
    typeof (item as Record<string, unknown>).content_text === 'string' &&
    typeof (item as Record<string, unknown>).similarity_score === 'number' &&
    typeof (item as Record<string, unknown>).content_type === 'string'
  )
}

interface SmartExpandRequest {
  nodeTitle: string
  nodeContent: string
  nodeContext?: {
    id?: string
    type?: string
    category?: string
    level?: string
  }
  expansionStyle: 'comprehensive' | 'focused' | 'creative' | 'analytical'
  maxChildren?: number
  language?: string
  useRAG?: boolean
}

/**
 * Type for RAG context items
 */
interface RagContextItem {
  content: string
  similarity: number
  type: string
}

interface SmartExpandResponse {
  suggestions: Array<{
    title: string
    content: string
    reasoning: string
    priority: number
    confidence: number
    ragSource?: string
  }>
  ragContext?: RagContextItem[]
  expansionMetadata: {
    style: string
    ragUsed: boolean
    aiModel: string
    timestamp: string
  }
}

/**
 * Smart expansion combining OpenAI + RAG for memory nodes
 */
async function performSmartExpansion(
  request: SmartExpandRequest,
  supabase: unknown
): Promise<SmartExpandResponse> {
  const {
    nodeTitle,
    nodeContent,
    nodeContext,
    expansionStyle,
    maxChildren = 5,
    language = 'korean',
    useRAG = true
  } = request

  let ragContext: RagContextItem[] = []
  let similarContent: unknown[] = []

  // Step 1: RAG - Find similar content if enabled
  if (useRAG) {
    try {
      const combinedText = `${nodeTitle} ${nodeContent}`
      const embeddingResult = await generateEmbedding(combinedText)
      
      similarContent = await findSimilarContent(
        supabase,
        embeddingResult.embedding,
        {
          contentTypes: ['mindmap_node', 'user_input', 'enterprise_data', 'career_data'],
          similarityThreshold: 0.7,
          maxResults: 10
        }
      )
      
      // Filter with type guard and map to RagContextItem
      const validItems = similarContent.filter(isRagItem)
      ragContext = validItems.map(item => ({
        content: item.content_text,
        similarity: item.similarity_score,
        type: item.content_type
      }))
      
      logger.info(`Found ${ragContext.length} similar items via RAG`)
    } catch (error) {
      logger.error('RAG search failed:', error as Error)
    }
  }

  // Step 2: Build enriched prompt with RAG context
  const ragContextText = ragContext.length > 0
    ? `\n\n관련 정보 (RAG):\n${ragContext.slice(0, 5).map(r => `- ${r.content} (유사도: ${r.similarity.toFixed(2)})`).join('\n')}`
    : ''

  const styleInstructions = {
    comprehensive: "다양한 관점과 영역을 포괄적으로 다루는 확장 노드를 생성하세요",
    focused: "핵심적이고 실행 가능한 구체적인 확장 노드를 생성하세요",
    creative: "혁신적이고 창의적인 아이디어 중심의 확장 노드를 생성하세요",
    analytical: "체계적이고 분석적인 관점의 확장 노드를 생성하세요"
  }

  const prompt = `당신은 한국의 커리어 개발 전문가입니다. 다음 노드를 확장해주세요.

노드 정보:
- 제목: ${nodeTitle}
- 내용: ${nodeContent}
- 컨텍스트: ${JSON.stringify(nodeContext || {})}
${ragContextText}

확장 스타일: ${expansionStyle}
${styleInstructions[expansionStyle]}

요구사항:
1. ${maxChildren}개의 하위 노드를 생성하세요
2. 각 노드는 부모 노드와 명확한 연관성이 있어야 합니다
3. ${language === 'korean' ? '모든 내용은 한국어로 작성하세요' : 'Write all content in English'}
4. 실용적이고 구체적인 내용을 포함하세요
5. 커리어 개발에 도움이 되는 실질적인 정보를 제공하세요

출력 형식 (JSON):
{
  "suggestions": [
    {
      "title": "명확한 제목 (3-8단어)",
      "content": "상세한 설명과 실행 방법",
      "reasoning": "이 노드가 중요한 이유와 부모 노드와의 연관성",
      "priority": 1-5 (5가 가장 높음),
      "confidence": 0.0-1.0 (신뢰도),
      "keywords": ["키워드1", "키워드2"]
    }
  ]
}`

  // Step 3: Call OpenAI for generation
  const deno = (globalThis as { Deno?: DenoGlobal }).Deno
  const openaiApiKey = deno?.env?.get('OPENAI_API_KEY')
  
  if (!openaiApiKey) {
    // Fallback to rule-based generation
    return generateFallbackSuggestions(nodeTitle, nodeContent, expansionStyle, maxChildren, ragContext)
  }

  try {
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
            content: 'You are a Korean career development expert. Always respond in valid JSON format only.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: expansionStyle === 'creative' ? 0.8 : 0.6,
        max_tokens: 2000,
        response_format: { type: 'json_object' }
      })
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`)
    }

    const data = await response.json()
    const parsed = JSON.parse(data.choices[0].message.content)

    // Add RAG source information if available
    if (ragContext.length > 0) {
      parsed.suggestions = parsed.suggestions.map((s: Record<string, unknown>) => ({
        ...s,
        ragSource: 'RAG-enhanced generation'
      }))
    }

    return {
      suggestions: parsed.suggestions,
      ragContext: ragContext,
      expansionMetadata: {
        style: expansionStyle,
        ragUsed: ragContext.length > 0,
        aiModel: 'gpt-3.5-turbo',
        timestamp: new Date().toISOString()
      }
    }

  } catch (error) {
    logger.error('OpenAI generation failed:', error as Error)
    return generateFallbackSuggestions(nodeTitle, nodeContent, expansionStyle, maxChildren, ragContext)
  }
}

/**
 * Generate fallback suggestions when AI is unavailable
 */
function generateFallbackSuggestions(
  nodeTitle: string,
  nodeContent: string,
  style: string,
  maxChildren: number,
  ragContext: Array<{content: string; similarity: number; type: string}>
): SmartExpandResponse {
  const suggestions: Array<{
    title: string
    content: string
    reasoning: string
    priority: number
    confidence: number
    ragSource?: string
  }> = []
  
  // Use RAG context if available
  if (ragContext.length > 0) {
    ragContext.slice(0, maxChildren).forEach((item, i) => {
      suggestions.push({
        title: `${nodeTitle} - 연관 ${i + 1}`,
        content: item.content,
        reasoning: `RAG 유사도 ${item.similarity.toFixed(2)} 기반 추천`,
        priority: Math.ceil(item.similarity * 5),
        confidence: item.similarity,
        ragSource: 'RAG direct match'
      })
    })
  }
  
  // Fill remaining with contextual suggestions
  while (suggestions.length < maxChildren) {
    suggestions.push({
      title: `${nodeTitle} - ${style} 확장 ${suggestions.length + 1}`,
      content: `${nodeTitle}와 관련된 ${style} 관점의 내용`,
      reasoning: 'Fallback generation',
      priority: 3,
      confidence: 0.6
    })
  }

  return {
    suggestions: suggestions.slice(0, maxChildren),
    ragContext: ragContext,
    expansionMetadata: {
      style: style,
      ragUsed: ragContext.length > 0,
      aiModel: 'fallback',
      timestamp: new Date().toISOString()
    }
  }
}

serve(async (req: Request) => {
  const { method } = req
  const origin = req.headers.get('Origin') || undefined
  const corsHeaders = getCorsHeaders(origin)

  if (method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  try {
    const supabase = getSupabaseClient()
    const request: SmartExpandRequest = await req.json()
    
    logger.info(`Smart expansion requested for: ${request.nodeTitle}`)
    
    const response = await performSmartExpansion(request, supabase)
    
    return new Response(
      JSON.stringify({
        success: true,
        data: response
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json; charset=utf-8' }
      }
    )
    
  } catch (error) {
    logger.error('Smart expansion error:', error as Error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: (error as Error).message || 'Internal server error'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})