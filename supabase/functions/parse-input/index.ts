import { serve } from "https://deno.land/std@0.224.0/http/server.ts"
import { corsHeaders } from "../_shared/cors.ts"
import { getSupabaseClient } from "../_shared/supabase.ts"

console.log("Korean Keyword Extraction Function initialized!")

// --- 타입 정의 ---

// 전문 NLP 서비스로부터 받을 키워드 데이터 구조
interface NlpResult {
  nouns: string[]
  verbs: string[]
  entities: string[]
}

// 최종적으로 처리된 사용자 입력 데이터 구조
interface ProcessedInput {
  id?: string
  raw_text: string
  keywords: NlpResult
  processed_at?: string
  created_at?: string
}


// --- 외부 서비스 호출 함수 ---

/**
 * [핵심] 전문 한국어 NLP 마이크로서비스 호출
 * @description 별도로 구축한 Python(Flask/FastAPI) 형태소 분석 API를 호출합니다.
 * @param text 분석할 원본 텍스트
 * @returns {Promise<NlpResult>} 형태소 분석 결과
 */
async function callNlpService(text: string): Promise<NlpResult> {
  const NLP_API_URL = Deno.env.get('NLP_API_URL') || 'http://localhost:5000/parse'

  try {
    const response = await fetch(NLP_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    })

    if (!response.ok) {
      throw new Error(`NLP service failed with status: ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error("Failed to call NLP service:", error.message);
    const nouns = text.split(' ').filter(word => word.length > 1);
    return { nouns, verbs: [], entities: [] };
  }
}


// --- 메인 서버 로직 ---

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = getSupabaseClient()

    if (req.method === 'POST') {
      // [수정] 'rawText' 대신 'input' 키로 데이터를 받도록 변경
      const { input } = await req.json()

      // [수정] 유효성 검사 대상을 'input'으로 변경
      if (!input || typeof input !== 'string' || input.trim().length === 0) {
        return new Response(JSON.stringify({ error: '`input` field is required and must be a non-empty string.' }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } })
      }

      // --- 키워드 추출 파이프라인 실행 ---
      
      // 1. [전문 NLP] 텍스트를 분석하여 고품질 키워드 추출
      console.log('1. Calling NLP service to extract keywords from input...')
      const keywords = await callNlpService(input)
      
      console.log(`Keywords extracted: ${JSON.stringify(keywords)}`)

      // 2. [저장] 분석 결과를 DB에 저장
      // DB의 'raw_text' 컬럼에는 여전히 원본 텍스트를 저장
      const processedData: Omit<ProcessedInput, 'id' | 'created_at'> = {
        raw_text: input.trim(),
        keywords,
        processed_at: new Date().toISOString(),
      }

      const { data: savedData, error } = await supabase
        .from('processed_inputs')
        .insert(processedData)
        .select()
        .single()

      if (error) throw error

      // 3. [응답] 최종 결과를 프론트엔드로 전달
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Keyword extraction completed successfully.',
          data: savedData,
        }),
        { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }
    
    // GET 요청 처리 (기존과 동일)
    if (req.method === 'GET') {
      const { data, error } = await supabase.from('processed_inputs').select('*').limit(50)
      if (error) throw error
      return new Response(JSON.stringify({ success: true, data }), { headers: { ...corsHeaders, "Content-Type": "application/json" } })
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } })

  } catch (error) {
    console.error('Function error:', error)
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } })
  }
})
