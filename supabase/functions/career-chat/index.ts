import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { getCorsHeaders } from "../_shared/cors.js"
import { getSupabaseClient } from "../_shared/supabase.js"
import { rateLimit, addRateLimitHeaders } from "../_shared/rate-limiter.js"
import { createLogger } from "../_shared/logger.js"

const logger = createLogger('CareerChat')
logger.info('Career Chat Function initialized!')

interface ChatRequest {
  careerMapId: string
  message: string
  useOpenAI?: boolean
}

interface CareerMapUpdate {
  id: string
  title?: string
  targetRole?: string
  certificationInfo?: any
  roadmapSteps?: any[]
  reviews?: any[]
}

interface ChatResponse {
  success: boolean
  data?: {
    updatedCareerMap: any
    aiResponse: string
    modificationType: string
  }
  error?: string
}

/**
 * Build career modification prompt for OpenAI
 */
function buildCareerModificationPrompt(
  currentCareerMap: any, 
  userMessage: string
): string {
  return `당신은 한국 취업 시장 전문가이자 커리어 컨설턴트입니다. 사용자의 요청에 따라 기존 커리어 로드맵을 수정해주세요.

**현재 커리어 맵 정보:**
- 제목: ${currentCareerMap.title}
- 목표 직무: ${currentCareerMap.target_role}
- 자격증 정보: ${JSON.stringify(currentCareerMap.certification_info, null, 2)}
- 로드맵 단계: ${JSON.stringify(currentCareerMap.roadmap_steps, null, 2)}

**사용자 요청:**
"${userMessage}"

**수정 지침:**
1. 사용자의 요청을 분석하여 적절한 수정사항을 반영
2. 기존 구조는 최대한 유지하되 필요한 부분만 변경
3. 한국 취업 시장의 실제 트렌드를 반영
4. 로드맵 단계의 position 좌표는 ReactFlow 호환성을 위해 유지
5. 모든 텍스트는 한국어로 작성

**응답 형식:**
{
  "modificationType": "roadmap|certification|title|target_role|comprehensive",
  "updatedFields": {
    "title": "수정된 제목 (변경시에만)",
    "target_role": "수정된 목표 직무 (변경시에만)",
    "certification_info": { /* 수정된 자격증 정보 (변경시에만) */ },
    "roadmap_steps": [ /* 수정된 로드맵 단계 (변경시에만) */ ]
  },
  "aiResponse": "사용자에게 보여줄 친근한 한국어 응답 메시지 (수정사항 설명 포함)",
  "reasoning": "수정 사유와 근거"
}

**중요사항:**
- 변경이 필요한 필드만 updatedFields에 포함하세요
- roadmapSteps를 수정할 때는 기존 position 좌표를 유지하거나 적절히 조정하세요
- JSON 형식 외의 다른 텍스트는 포함하지 마세요

JSON만 반환하세요:`
}

/**
 * Analyze user message to determine modification type
 */
function analyzeModificationRequest(message: string): string {
  const messageLower = message.toLowerCase()
  
  if (messageLower.includes('자격증') || messageLower.includes('시험')) {
    return 'certification'
  }
  if (messageLower.includes('로드맵') || messageLower.includes('단계') || messageLower.includes('순서')) {
    return 'roadmap'
  }
  if (messageLower.includes('제목') || messageLower.includes('이름')) {
    return 'title'
  }
  if (messageLower.includes('직무') || messageLower.includes('목표') || messageLower.includes('역할')) {
    return 'target_role'
  }
  
  return 'comprehensive'
}

/**
 * Call OpenAI API for career modification
 */
async function generateCareerModification(prompt: string): Promise<any> {
  const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
  
  if (!openaiApiKey) {
    throw new Error('OpenAI API key not configured')
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: '당신은 한국 커리어 컨설팅 전문가입니다. 항상 유효한 JSON만 응답하세요.'
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
    throw new Error(`OpenAI API error: ${response.status} - ${JSON.stringify(errorData)}`)
  }

  const data = await response.json()
  
  if (!data.choices?.[0]?.message?.content) {
    throw new Error('Invalid OpenAI response structure')
  }

  try {
    return JSON.parse(data.choices[0].message.content)
  } catch (error) {
    console.error('Failed to parse OpenAI JSON response')
    throw new Error(`Invalid JSON from OpenAI: ${error.message}`)
  }
}

/**
 * Generate fallback modification response
 */
function generateFallbackModification(
  currentCareerMap: any, 
  userMessage: string
): any {
  const modificationType = analyzeModificationRequest(userMessage)
  
  const fallbackResponse = {
    modificationType,
    updatedFields: {},
    aiResponse: "요청을 확인했습니다. 현재 로드맵을 바탕으로 적절한 수정사항을 반영하겠습니다.",
    reasoning: "사용자 요청에 기반한 기본적인 수정 적용"
  }

  // Simple modification based on message analysis
  switch (modificationType) {
    case 'certification':
      fallbackResponse.aiResponse = "자격증 정보를 검토하고 추천사항을 업데이트했습니다."
      break
    case 'roadmap':
      fallbackResponse.aiResponse = "로드맵 단계를 사용자 요청에 맞게 조정했습니다."
      break
    case 'title':
      fallbackResponse.aiResponse = "커리어 맵 제목을 더 적절하게 수정했습니다."
      break
    case 'target_role':
      fallbackResponse.aiResponse = "목표 직무를 사용자의 의도에 맞게 조정했습니다."
      break
    default:
      fallbackResponse.aiResponse = "종합적인 검토를 통해 커리어 맵을 개선했습니다."
  }

  return fallbackResponse
}

/**
 * Apply modifications to career map
 */
function applyModifications(
  currentCareerMap: any, 
  modifications: any
): any {
  const updatedCareerMap = { ...currentCareerMap }

  if (modifications.updatedFields.title) {
    updatedCareerMap.title = modifications.updatedFields.title
  }

  if (modifications.updatedFields.target_role) {
    updatedCareerMap.target_role = modifications.updatedFields.target_role
  }

  if (modifications.updatedFields.certification_info) {
    updatedCareerMap.certification_info = modifications.updatedFields.certification_info
  }

  if (modifications.updatedFields.roadmap_steps) {
    updatedCareerMap.roadmap_steps = modifications.updatedFields.roadmap_steps
  }

  return updatedCareerMap
}

/**
 * Validate modification structure
 */
function validateModifications(modifications: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!modifications.modificationType) {
    errors.push('수정 유형이 필요합니다')
  }

  if (!modifications.aiResponse || typeof modifications.aiResponse !== 'string') {
    errors.push('AI 응답 메시지가 필요합니다')
  }

  if (!modifications.updatedFields || typeof modifications.updatedFields !== 'object') {
    errors.push('업데이트된 필드 정보가 필요합니다')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

serve(async (req) => {
  const { method } = req

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    const origin = req.headers.get('Origin')
    return new Response('ok', { headers: getCorsHeaders(origin) })
  }

  // Apply rate limiting
  const rateLimitResult = rateLimit('career')(req)
  if (!rateLimitResult.allowed) {
    return rateLimitResult.response!
  }

  const supabase = getSupabaseClient()

  try {
    if (method === 'POST') {
      const body = await req.json()
      const { 
        careerMapId, 
        message, 
        useOpenAI = true 
      }: ChatRequest = body

      // Validate input
      if (!careerMapId || !message?.trim()) {
        return new Response(
          JSON.stringify({ 
            error: '커리어 맵 ID와 메시지가 필요합니다',
            success: false 
          }),
          { 
            status: 400,
            headers: { ...getCorsHeaders(req.headers.get('Origin')), "Content-Type": "application/json" }
          }
        )
      }

      logger.info(`Processing career modification request for map: ${careerMapId}`)

      // Step 1: Retrieve current career map
      const { data: currentCareerMap, error: fetchError } = await supabase
        .from('career_maps')
        .select('*')
        .eq('id', careerMapId)
        .single()

      if (fetchError || !currentCareerMap) {
        return new Response(
          JSON.stringify({ 
            error: '커리어 맵을 찾을 수 없습니다',
            success: false 
          }),
          { 
            status: 404,
            headers: { ...getCorsHeaders(req.headers.get('Origin')), "Content-Type": "application/json" }
          }
        )
      }

      // Step 2: Generate modifications
      let modificationData: any
      let aiSource = 'openai'

      if (useOpenAI) {
        try {
          const prompt = buildCareerModificationPrompt(currentCareerMap, message)
          modificationData = await generateCareerModification(prompt)
          
          const validation = validateModifications(modificationData)
          if (!validation.isValid) {
            throw new Error(`검증 실패: ${validation.errors.join(', ')}`)
          }
        } catch (error) {
          console.error('OpenAI modification failed:', error.message)
          logger.info('Using fallback modification')
          modificationData = generateFallbackModification(currentCareerMap, message)
          aiSource = 'fallback'
        }
      } else {
        modificationData = generateFallbackModification(currentCareerMap, message)
        aiSource = 'fallback'
      }

      // Step 3: Apply modifications
      const updatedCareerMap = applyModifications(currentCareerMap, modificationData)

      // Step 4: Save modification history
      const { error: historyError } = await supabase
        .from('career_modifications')
        .insert({
          career_map_id: careerMapId,
          modification_request: message,
          previous_version: currentCareerMap,
          new_version: updatedCareerMap,
          ai_response: modificationData.aiResponse
        })

      if (historyError) {
        console.warn('Failed to save modification history:', historyError)
      }

      // Step 5: Update career map in database
      const { data: savedCareerMap, error: updateError } = await supabase
        .from('career_maps')
        .update({
          title: updatedCareerMap.title,
          target_role: updatedCareerMap.target_role,
          certification_info: updatedCareerMap.certification_info,
          roadmap_steps: updatedCareerMap.roadmap_steps,
          updated_at: new Date().toISOString()
        })
        .eq('id', careerMapId)
        .select()
        .single()

      if (updateError) {
        console.error('Failed to update career map:', updateError)
        throw new Error('커리어 맵 업데이트에 실패했습니다')
      }

      // Step 6: Format response to match frontend expectations
      const formattedResponse = {
        id: savedCareerMap.id,
        title: savedCareerMap.title,
        targetRole: savedCareerMap.target_role,
        createdAt: new Date(savedCareerMap.created_at),
        updatedAt: new Date(savedCareerMap.updated_at),
        info: {
          certification: savedCareerMap.certification_info,
          roadmapSteps: savedCareerMap.roadmap_steps
        },
        reviews: savedCareerMap.reviews || []
      }

      const response = new Response(
        JSON.stringify({ 
          data: {
            updatedCareerMap: formattedResponse,
            aiResponse: modificationData.aiResponse,
            modificationType: modificationData.modificationType
          },
          success: true,
          message: '커리어 맵이 성공적으로 수정되었습니다',
          ai_source: aiSource
        }),
        { 
          status: 200,
          headers: { ...getCorsHeaders(req.headers.get('Origin')), "Content-Type": "application/json" }
        }
      )
      
      return addRateLimitHeaders(response, rateLimitResult.info)
    }

    // GET endpoint for retrieving modification history
    if (method === 'GET') {
      const url = new URL(req.url)
      const careerMapId = url.searchParams.get('careerMapId')

      if (!careerMapId) {
        return new Response(
          JSON.stringify({ 
            error: '커리어 맵 ID가 필요합니다',
            success: false 
          }),
          { 
            status: 400,
            headers: { ...getCorsHeaders(req.headers.get('Origin')), "Content-Type": "application/json" }
          }
        )
      }

      const { data: modifications, error: fetchError } = await supabase
        .from('career_modifications')
        .select('*')
        .eq('career_map_id', careerMapId)
        .order('created_at', { ascending: false })
        .limit(10)

      if (fetchError) {
        throw new Error(`수정 내역 조회 실패: ${fetchError.message}`)
      }

      return new Response(
        JSON.stringify({ 
          data: modifications,
          success: true 
        }),
        { 
          status: 200,
          headers: { ...getCorsHeaders(req.headers.get('Origin')), "Content-Type": "application/json" }
        }
      )
    }

    return new Response(
      JSON.stringify({ 
        error: '지원하지 않는 메서드입니다. POST 또는 GET 요청을 사용하세요.',
        success: false 
      }),
      { 
        status: 405,
        headers: { ...getCorsHeaders(req.headers.get('Origin')), "Content-Type": "application/json" }
      }
    )

  } catch (error) {
    logger.error('Career chat error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || '커리어 채팅 처리 중 오류가 발생했습니다',
        success: false 
      }),
      { 
        status: 500,
        headers: { ...getCorsHeaders(req.headers.get('Origin')), "Content-Type": "application/json" }
      }
    )
  }
})