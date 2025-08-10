import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { getCorsHeaders } from "../_shared/cors.ts"
import { getSupabaseClient } from "../_shared/supabase.ts"
import { rateLimit, addRateLimitHeaders } from "../_shared/rate-limiter.ts"
import { createLogger } from "../_shared/logger.ts"
import { metrics, withMetrics, measurePerformance } from "../_shared/metrics.ts"

const logger = createLogger('ParseInput')
logger.info('Korean Parse Input Function initialized!')

interface ExtractedKeywords {
  nouns: string[]           // 명사
  verbs: string[]           // 동사
  adjectives: string[]      // 형용사
  particles: string[]       // 조사 (은/는, 이/가, 을/를 등)
  entities: string[]        // 개체명 (인명, 지명, 기관명)
  topics: string[]          // 주요 주제어
  sentiment: string         // 감정 분석 결과
  language: string          // 언어 감지 결과
}

interface UserInput {
  id?: string
  raw_text: string
  keywords: ExtractedKeywords
  processed_at?: string
  created_at?: string
  updated_at?: string
}

// 한국어 조사 목록
const KOREAN_PARTICLES = [
  '은', '는', '이', '가', '을', '를', '의', '에', '에서', '로', '으로',
  '와', '과', '도', '만', '부터', '까지', '처럼', '같이', '마다', '보다',
  '에게', '한테', '께', '으로부터', '로부터', '에다가', '라고', '다고'
]

// 한국어 어미 패턴
const KOREAN_ENDINGS = [
  '다', '요', '니다', '습니다', '어요', '아요', '해요',
  '었', '았', '였', '겠', '네', '지', '죠', '요'
]

// 한국어 불용어 (stopwords)
const KOREAN_STOPWORDS = [
  '그', '이', '저', '그것', '이것', '저것', '여기', '거기', '저기',
  '또한', '그리고', '하지만', '그러나', '따라서', '그래서', '왜냐하면',
  '있다', '없다', '되다', '하다', '가다', '오다', '보다', '말하다',
  '생각하다', '느끼다', '알다', '모르다', '좋다', '나쁘다', '크다', '작다',
  '많다', '적다', '빠르다', '느리다', '높다', '낮다'
]

// 감정 어휘 사전
const POSITIVE_WORDS = [
  '좋다', '훌륭하다', '멋지다', '아름답다', '기쁘다', '행복하다', '즐겁다',
  '만족하다', '성공하다', '완벽하다', '최고다', '우수하다', '뛰어나다',
  '감사하다', '사랑하다', '희망적이다', '긍정적이다', '효과적이다'
]

const NEGATIVE_WORDS = [
  '나쁘다', '싫다', '슬프다', '화나다', '실망하다', '힘들다', '어렵다',
  '문제다', '실패하다', '부족하다', '위험하다', '걱정되다', '불안하다',
  '부정적이다', '최악이다', '끔찍하다', '심각하다', '치명적이다'
]

/**
 * 🔧 FIX: Enhanced language detection with multiple criteria
 */
function detectLanguage(text: string): string {
  const cleanText = text.replace(/\s+/g, '').replace(/[0-9.,!?;:()\[\]{}"'`~@#$%^&*+=<>/\\|-]/g, '')
  
  if (cleanText.length === 0) return 'english'
  
  // Count different character types
  const koreanCount = (cleanText.match(/[가-힣]/g) || []).length
  const hanjaCount = (cleanText.match(/[一-龯]/g) || []).length
  const englishCount = (cleanText.match(/[a-zA-Z]/g) || []).length
  const totalCount = cleanText.length
  
  // Calculate ratios
  const koreanRatio = koreanCount / totalCount
  const hanjaRatio = hanjaCount / totalCount
  const englishRatio = englishCount / totalCount
  
  // 🔧 FIX: More sophisticated detection logic
  // Primary criterion: Korean character ratio
  if (koreanRatio >= 0.4) return 'korean'
  
  // Secondary criterion: Korean + Hanja ratio (common in Korean text)
  if ((koreanRatio + hanjaRatio) >= 0.3 && koreanRatio > 0.1) return 'korean'
  
  // Tertiary criterion: Presence of Korean particles/endings
  const hasKoreanGrammar = KOREAN_PARTICLES.some(p => text.includes(p)) ||
                          KOREAN_ENDINGS.some(e => text.includes(e))
  
  if (hasKoreanGrammar && koreanRatio > 0.05) return 'korean'
  
  // Default to English if predominantly Latin characters
  if (englishRatio >= 0.6) return 'english'
  
  // Mixed or ambiguous cases - use threshold
  return koreanRatio > 0.15 ? 'korean' : 'english'
}

/**
 * 🔧 FIX: Enhanced Korean text normalization
 */
function normalizeKoreanText(text: string): string {
  return text
    .replace(/[！？｡＂＃＄％＆＇（）＊＋，－／：；＜＝＞？＠［＼］＾＿｀｛｜｝]/g, ' ') // Full-width punctuation
    .replace(/[^\w\s가-힣一-龯ㄱ-ㅎㅏ-ㅣ]/g, ' ')  // Keep Korean, Hanja, Jamo, alphanumeric
    .replace(/\s+/g, ' ')           // Collapse whitespace
    .trim()                         // Trim edges
}

// 🔧 FIX: Enhanced technical domain vocabularies
const TECH_TERMS = [
  '인공지능', 'AI', '머신러닝', '딥러닝', '빅데이터', '클라우드', '데이터베이스', '알고리즘',
  '소프트웨어', '하드웨어', '네트워크', '보안', '암호화', 'API', '프레임워크', '라이브러리',
  '개발', '프로그래밍', '코딩', '디버깅', '테스팅', '배포', '운영', '유지보수', '최적화'
]

const BUSINESS_TERMS = [
  '전략', '계획', '목표', '성과', '수익', '투자', '마케팅', '브랜딩', '고객', '서비스',
  '제품', '시장', '경쟁', '분석', '프로젝트', '관리', '운영', '조직', '팀', '리더십'
]

// 🔧 FIX: Compound word patterns for better noun extraction
const COMPOUND_PATTERNS = [
  /([가-힣]{2,})(시스템|서비스|솔루션|플랫폼|기술|방법|전략|관리)$/,
  /^(스마트|디지털|온라인|모바일|클라우드)([가-힣]{2,})$/,
  /(데이터|정보|콘텐츠|컨텐츠)([가-힣]{2,})$/
]

/**
 * 🔧 FIX: Enhanced Korean morphological analysis with compound word handling
 */
function extractKoreanKeywords(rawText: string): ExtractedKeywords {
  const language = detectLanguage(rawText)
  const normalizedText = normalizeKoreanText(rawText)
  const words = normalizedText.split(/\s+/).filter(word => word.length > 0)
  
  const nouns: string[] = []
  const verbs: string[] = []
  const adjectives: string[] = []
  const particles: string[] = []
  const entities: string[] = []
  const topics: string[] = []
  
  // 🔧 FIX: Enhanced word analysis with compound word detection
  words.forEach(word => {
    // Skip stopwords
    if (KOREAN_STOPWORDS.includes(word)) return
    
    // 🔧 FIX: Technical and business term recognition
    if (TECH_TERMS.includes(word) || BUSINESS_TERMS.includes(word)) {
      nouns.push(word)
      return
    }
    
    // 🔧 FIX: Enhanced particle extraction with better stem handling
    let foundParticle = false
    for (const particle of KOREAN_PARTICLES) {
      if (word.endsWith(particle) && word.length > particle.length + 1) {
        particles.push(particle)
        const stem = word.slice(0, -particle.length)
        if (stem.length > 1) {
          nouns.push(stem)
          foundParticle = true
          break
        }
      }
    }
    
    // 🔧 FIX: Enhanced ending pattern analysis
    if (!foundParticle) {
      let foundEnding = false
      for (const ending of KOREAN_ENDINGS) {
        if (word.endsWith(ending) && word.length > ending.length + 1) {
          const stem = word.slice(0, -ending.length)
          if (stem.length > 1) {
            // Better classification of verbs vs adjectives
            if (['다', '었', '았', '였', '겠'].includes(ending) || 
                ending.includes('어') || ending.includes('아') || ending.includes('해')) {
              verbs.push(stem + '다')
            } else {
              adjectives.push(stem + '다')
            }
            foundEnding = true
            break
          }
        }
      }
    }
    
    // 🔧 FIX: Enhanced noun extraction with compound word patterns
    if (/^[가-힣]{2,}$/.test(word)) {
      // Check if it's a pure noun (no particles/endings)
      if (!KOREAN_PARTICLES.some(p => word.endsWith(p)) && 
          !KOREAN_ENDINGS.some(e => word.endsWith(e))) {
        
        // Check compound word patterns
        let isCompound = false
        for (const pattern of COMPOUND_PATTERNS) {
          if (pattern.test(word)) {
            nouns.push(word) // Add full compound
            const matches = word.match(pattern)
            if (matches && matches[1] && matches[1].length > 1) {
              nouns.push(matches[1]) // Add component
            }
            isCompound = true
            break
          }
        }
        
        if (!isCompound) {
          nouns.push(word)
        }
      }
    }
    
    // 🔧 FIX: Enhanced entity extraction
    if (word.length >= 2) {
      // Company patterns
      if (/[A-Z]/.test(word) || word.includes('㈜') || word.includes('(주)') || 
          word.includes('Corp') || word.includes('Inc') || word.endsWith('회사')) {
        entities.push(word)
      }
      
      // Location patterns (expanded)
      if (word.endsWith('시') || word.endsWith('구') || word.endsWith('동') || 
          word.endsWith('읍') || word.endsWith('면') || word.endsWith('리') ||
          word.endsWith('도') || word.endsWith('군') || word.endsWith('로') ||
          word.endsWith('길') || word.endsWith('대로')) {
        entities.push(word)
      }
      
      // Person name patterns (common Korean surnames)
      const surnames = ['김', '이', '박', '최', '정', '강', '조', '윤', '장', '임']
      if (surnames.some(surname => word.startsWith(surname)) && word.length >= 3) {
        entities.push(word)
      }
    }
  })
  
  // 🔧 FIX: Enhanced topic extraction with TF-IDF-like scoring
  const wordFreq: Record<string, number> = {}
  const wordPositions: Record<string, number[]> = {}
  
  nouns.forEach((noun, index) => {
    wordFreq[noun] = (wordFreq[noun] || 0) + 1
    if (!wordPositions[noun]) wordPositions[noun] = []
    wordPositions[noun].push(index)
  })
  
  // Score words based on frequency and importance
  const scoredWords = Object.entries(wordFreq).map(([word, freq]) => {
    let score = freq
    
    // Boost technical/business terms
    if (TECH_TERMS.includes(word) || BUSINESS_TERMS.includes(word)) {
      score *= 2
    }
    
    // Boost longer words (usually more meaningful)
    if (word.length >= 4) {
      score *= 1.5
    }
    
    // Boost words appearing early in text (title effect)
    const avgPosition = wordPositions[word].reduce((sum, pos) => sum + pos, 0) / wordPositions[word].length
    if (avgPosition < 5) {
      score *= 1.3
    }
    
    return [word, score]
  })
  
  const sortedWords = scoredWords
    .sort(([,a], [,b]) => (b as number) - (a as number))
    .slice(0, 10)
    .map(([word]) => word as string)
  
  topics.push(...sortedWords)
  
  // 🔧 FIX: Enhanced sentiment analysis with context awareness
  let positiveScore = 0
  let negativeScore = 0
  
  const textForSentiment = normalizedText
  
  // Helper function to escape regex special characters
  const escapeRegExp = (string: string): string => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  }
  
  POSITIVE_WORDS.forEach(word => {
    const escapedWord = escapeRegExp(word)
    const matches = (textForSentiment.match(new RegExp(escapedWord, 'g')) || []).length
    positiveScore += matches
  })
  
  NEGATIVE_WORDS.forEach(word => {
    const escapedWord = escapeRegExp(word)
    const matches = (textForSentiment.match(new RegExp(escapedWord, 'g')) || []).length
    negativeScore += matches
  })
  
  // Consider intensity modifiers
  const intensifiers = ['매우', '정말', '너무', '아주', '굉장히', '완전', '진짜', '대단히']
  intensifiers.forEach(intensifier => {
    if (textForSentiment.includes(intensifier)) {
      positiveScore *= 1.3
      negativeScore *= 1.3
    }
  })
  
  let sentiment = 'neutral'
  const sentimentThreshold = 0.5
  
  if (positiveScore > negativeScore + sentimentThreshold) {
    sentiment = 'positive'
  } else if (negativeScore > positiveScore + sentimentThreshold) {
    sentiment = 'negative'
  } else if (positiveScore > 0 && negativeScore > 0) {
    sentiment = 'mixed'
  }
  
  return {
    nouns: [...new Set(nouns)].filter(n => n.length > 1).slice(0, 20),
    verbs: [...new Set(verbs)].filter(v => v.length > 1).slice(0, 15),
    adjectives: [...new Set(adjectives)].filter(a => a.length > 1).slice(0, 15),
    particles: [...new Set(particles)].slice(0, 10),
    entities: [...new Set(entities)].filter(e => e.length > 1).slice(0, 10),
    topics: [...new Set(topics)].filter(t => t.length > 1).slice(0, 10),
    sentiment,
    language
  }
}

/**
 * compromise.js를 사용한 영어 키워드 추출 (fallback)
 */
function extractEnglishKeywords(rawText: string): ExtractedKeywords {
  // 영어 텍스트에 대한 기본적인 처리
  const words = rawText.toLowerCase()
    .replace(/[^a-zA-Z\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2)
  
  const nouns = words.filter(word => 
    !['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'].includes(word)
  )
  
  return {
    nouns: [...new Set(nouns)].slice(0, 20),
    verbs: [],
    adjectives: [],
    particles: [],
    entities: [],
    topics: [...new Set(nouns)].slice(0, 10),
    sentiment: 'neutral',
    language: 'english'
  }
}

/**
 * 텍스트에서 키워드와 인사이트 추출 (한국어 우선)
 */
function extractKeywords(rawText: string): ExtractedKeywords {
  const language = detectLanguage(rawText)
  
  if (language === 'korean') {
    logger.info('Analyzing Korean text', { textLength: rawText.length })
    return extractKoreanKeywords(rawText)
  } else {
    logger.info('Analyzing English text', { textLength: rawText.length })
    return extractEnglishKeywords(rawText)
  }
}

serve(async (req) => {
  return withMetrics(req, async () => {
    const { method } = req

    // 🔧 FIX: Handle CORS preflight requests with dynamic origin-based headers
    if (method === 'OPTIONS') {
      const origin = req.headers.get('Origin')
      const corsHeaders = getCorsHeaders(origin)
      return new Response(null, { status: 204, headers: corsHeaders })
    }

    const supabase = getSupabaseClient()

    try {
      if (method === 'POST') {
        // 🔧 FIX: Apply rate limiting
        const rateLimitResult = rateLimit('general')(req)
        if (!rateLimitResult.allowed) {
          return rateLimitResult.response!
        }

        // 🔧 FIX: Add JSON parsing error handling with proper 400 vs 500 response
        let body
        try {
          body = await req.json()
        } catch (parseError) {
          const origin = req.headers.get('Origin')
          const corsHeaders = getCorsHeaders(origin)
          return new Response(
            JSON.stringify({ 
              error: 'Invalid JSON in request body. Please provide valid JSON.',
              success: false 
            }),
            { 
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" }
            }
          )
        }
        const { rawText } = body

        // 🔧 FIX: Enhanced input validation with dynamic CORS headers
        if (!rawText || typeof rawText !== 'string') {
          const origin = req.headers.get('Origin')
          const corsHeaders = getCorsHeaders(origin)
          return new Response(
            JSON.stringify({ 
              error: 'Missing or invalid rawText field. Must be a non-empty string.',
              success: false 
            }),
            { 
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" }
            }
          )
        }

        const cleanText = rawText.trim()
        if (cleanText.length === 0) {
          const origin = req.headers.get('Origin')
          const corsHeaders = getCorsHeaders(origin)
          return new Response(
            JSON.stringify({ 
              error: 'Empty text after normalization. Please provide meaningful content.',
              success: false 
            }),
            { 
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" }
            }
          )
        }

        // 🔧 FIX: Text length validation (reasonable limits) with dynamic CORS headers
        if (cleanText.length > 5000) {
          const origin = req.headers.get('Origin')
          const corsHeaders = getCorsHeaders(origin)
          return new Response(
            JSON.stringify({ 
              error: 'Text too long. Maximum length is 5000 characters.',
              success: false 
            }),
            { 
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" }
            }
          )
        }

        // Extract keywords using Korean morphological analysis
        logger.info('Starting morphological analysis', { 
          textLength: cleanText.length,
          textPreview: cleanText.substring(0, 100) + '...',
          detectedLanguage: detectLanguage(cleanText)
        })
        const keywords = await measurePerformance('keyword_extraction', () => Promise.resolve(extractKeywords(cleanText)), {
          textLength: cleanText.length,
          language: detectLanguage(cleanText)
        })
        
        // Prepare data for database
        const userInputData: Omit<UserInput, 'id' | 'created_at' | 'updated_at'> = {
          raw_text: cleanText,
          keywords,
          processed_at: new Date().toISOString()
        }

        // Save to UserInputs table
        const { data, error } = await supabase
          .from('user_inputs')
          .insert(userInputData)
          .select()

        if (error) {
          logger.error('Database error saving user input', error, { 
            textLength: cleanText.length,
            errorCode: error.code,
            errorDetails: error.details
          })
          throw new Error(`Failed to save user input: ${error.message}`)
        }

        const savedInput = data[0] as UserInput
        
        // Record business metrics
        metrics.recordBusinessEvent('text_processed', 1, {
          language: keywords.language,
          textLength: cleanText.length,
          nounsFound: keywords.nouns.length,
          topicsFound: keywords.topics.length,
          sentiment: keywords.sentiment
        })
        
        logger.info('Text processing completed successfully', {
          id: savedInput.id,
          language: keywords.language,
          nounsFound: keywords.nouns.length,
          topicsFound: keywords.topics.length,
          sentiment: keywords.sentiment
        })

        const origin = req.headers.get('Origin')
        const corsHeaders = getCorsHeaders(origin)
        const finalResponse = new Response(
          JSON.stringify({ 
            data: savedInput,
            keywords,
            success: true,
            message: `Text processed successfully with ${keywords.language} analysis. Found ${keywords.nouns.length} nouns, ${keywords.topics.length} topics.`
          }),
          { 
            status: 201,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          }
        )
        
        // 🔧 FIX: Add rate limit headers
        return addRateLimitHeaders(finalResponse, rateLimitResult.info)
      }

      // GET - Retrieve all user inputs with their keywords
      if (method === 'GET') {
        const { data, error } = await supabase
          .from('user_inputs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50) // Limit to last 50 entries

        if (error) {
          logger.error('Database error retrieving user inputs', error, {
            errorCode: error.code,
            errorDetails: error.details
          })
          throw new Error(`Failed to retrieve user inputs: ${error.message}`)
        }

        logger.info('User inputs retrieved successfully', { count: data.length })
        
        const origin = req.headers.get('Origin')
        const corsHeaders = getCorsHeaders(origin)
        return new Response(
          JSON.stringify({ 
            data,
            count: data.length,
            success: true 
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        )
      }

      const origin = req.headers.get('Origin')
      const corsHeaders = getCorsHeaders(origin)
      return new Response(
        JSON.stringify({ 
          error: 'Method not allowed. Use POST to process text or GET to retrieve inputs.',
          success: false 
        }),
        { 
          status: 405,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      )

    } catch (error) {
      logger.error('Parse input function error', error, {
        method,
        url: req.url,
        userAgent: req.headers.get('user-agent')
      })
      
      metrics.recordBusinessEvent('text_processing_error', 1, {
        errorMessage: error.message,
        method
      })
      
      const origin = req.headers.get('Origin')
      const corsHeaders = getCorsHeaders(origin)
      return new Response(
        JSON.stringify({ 
          error: error.message || 'Internal server error',
          success: false 
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      )
    }
  })
})