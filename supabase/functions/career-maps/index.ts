// @ts-expect-error Deno std library types not available in current TypeScript config
import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { getCorsHeaders } from "../_shared/cors.js"
import { getSupabaseClient } from "../_shared/supabase.js"
import { createLogger } from "../_shared/logger.js"

const logger = createLogger('CareerMaps')
logger.info('Career Maps Function initialized!')

// Default positioning constants for RoadmapStep validation
const DEFAULT_POSITION_X = 300
const DEFAULT_POSITION_Y_BASE = 600
const DEFAULT_POSITION_Y_STEP = 100

interface RoadmapStep {
  id: string
  title: string
  type: "current" | "intermediate" | "final"
  position: { x: number; y: number }
}

interface BookData {
  title: string
  description: string
  category: "written" | "practical"
}

interface CourseData {
  title: string
  description: string
  platform: string
}

interface CertificationInfo {
  name: string
  difficulty: string
  eligibility: string
  examStructure: string
  schedule: string
  recommendedBooks: BookData[]
  recommendedCourses: CourseData[]
}

/**
 * Type guard to validate book data
 */
function isValidBookData(item: unknown): item is BookData {
  if (item === null || typeof item !== 'object') {
    return false
  }
  
  const book = item as Record<string, unknown>
  
  // Check all required fields for BookData
  return 'title' in book && typeof book.title === 'string' &&
    'description' in book && typeof book.description === 'string' &&
    'category' in book && typeof book.category === 'string' &&
    (book.category === 'written' || book.category === 'practical')
}

/**
 * Type guard to validate course data
 */
function isValidCourseData(item: unknown): item is CourseData {
  if (item === null || typeof item !== 'object') {
    return false
  }
  
  const course = item as Record<string, unknown>
  
  // Check all required fields for CourseData
  return 'title' in course && typeof course.title === 'string' &&
    'description' in course && typeof course.description === 'string' &&
    'platform' in course && typeof course.platform === 'string'
}

interface Review {
  id: string
  author: string
  rating: number
  content: string
  createdAt: Date
  helpful: number
}

/**
 * Helper function to parse dates with fallback
 */
function parseDate(value: unknown): Date {
  if (value instanceof Date) {
    return value
  }
  if (typeof value === 'number') {
    const date = new Date(value)
    return isNaN(date.getTime()) ? new Date() : date
  }
  if (typeof value === 'string') {
    const date = new Date(value)
    return isNaN(date.getTime()) ? new Date() : date
  }
  return new Date()
}

/**
 * Helper function to parse review dates with fallback for both camelCase and snake_case
 */
function parseReviewDate(value: unknown): Date {
  if (value instanceof Date) {
    return value
  }
  if (typeof value === 'number') {
    const date = new Date(value)
    return isNaN(date.getTime()) ? new Date() : date
  }
  if (typeof value === 'string') {
    const date = new Date(value)
    return isNaN(date.getTime()) ? new Date() : date
  }
  if (value === undefined || value === null) {
    return new Date()
  }
  return new Date()
}

interface CareerMap {
  id: string
  title: string
  targetRole: string
  createdAt: Date
  updatedAt: Date
  info: {
    certification: CertificationInfo
    roadmapSteps: RoadmapStep[]
  }
  reviews: Review[]
}

/**
 * Validate and normalize CertificationInfo from database
 */
function validateCertificationInfo(data: unknown): CertificationInfo {
  if (!data || typeof data !== 'object') {
    return {
      name: "정보처리기사",
      difficulty: "중급",
      eligibility: "관련 학과 4년제 졸업(예정) 또는 실무경력 4년 이상",
      examStructure: "필기(객관식 100문항) / 실기(서술형)",
      schedule: "연 3회 (한국산업인력공단)",
      recommendedBooks: [],
      recommendedCourses: []
    }
  }
  
  const cert = data as Record<string, unknown>
  
  return {
    name: typeof cert.name === 'string' ? cert.name : "정보처리기사",
    difficulty: typeof cert.difficulty === 'string' ? cert.difficulty : "중급",
    eligibility: typeof cert.eligibility === 'string' ? cert.eligibility : "관련 학과 4년제 졸업(예정) 또는 실무경력 4년 이상",
    examStructure: typeof cert.examStructure === 'string' ? cert.examStructure : "필기(객관식 100문항) / 실기(서술형)",
    schedule: typeof cert.schedule === 'string' ? cert.schedule : "연 3회 (한국산업인력공단)",
    recommendedBooks: Array.isArray(cert.recommendedBooks) 
      ? cert.recommendedBooks.filter(isValidBookData).map(book => {
          const validBook = book as Record<string, unknown>
          return {
            title: validBook.title as string,
            description: typeof validBook.description === 'string' ? validBook.description : '',
            category: (validBook.category === 'written' || validBook.category === 'practical') 
              ? validBook.category as 'written' | 'practical' : 'written'
          }
        })
      : [],
    recommendedCourses: Array.isArray(cert.recommendedCourses)
      ? cert.recommendedCourses.filter(isValidCourseData).map(course => {
          const validCourse = course as Record<string, unknown>
          return {
            title: validCourse.title as string,
            description: typeof validCourse.description === 'string' ? validCourse.description : '',
            platform: typeof validCourse.platform === 'string' ? validCourse.platform : '온라인'
          }
        })
      : []
  }
}

/**
 * Validate and normalize RoadmapStep array from database
 */
function validateRoadmapSteps(data: unknown): RoadmapStep[] {
  if (!Array.isArray(data)) return []
  
  return data.filter(item => item && typeof item === 'object').map((step, index) => {
    const s = step as Record<string, unknown>
    
    // Ensure position object exists and has valid numbers
    let position = { x: 0, y: 0 }
    if (s.position && typeof s.position === 'object') {
      const pos = s.position as Record<string, unknown>
      position = {
        x: typeof pos.x === 'number' ? pos.x : DEFAULT_POSITION_X,
        y: typeof pos.y === 'number' ? pos.y : DEFAULT_POSITION_Y_BASE + (index * DEFAULT_POSITION_Y_STEP)
      }
    } else {
      // Default positions if missing
      position = { x: DEFAULT_POSITION_X, y: DEFAULT_POSITION_Y_BASE + (index * DEFAULT_POSITION_Y_STEP) }
    }

    return {
      id: typeof s.id === 'string' ? s.id : `step-${index}`,
      title: typeof s.title === 'string' ? s.title : `단계 ${index + 1}`,
      type: (s.type === 'current' || s.type === 'intermediate' || s.type === 'final') 
        ? s.type : 'intermediate',
      position
    }
  })
}

/**
 * Validate and normalize Review array from database
 */
function validateReviews(data: unknown): Review[] {
  if (!Array.isArray(data)) return []
  
  return data.filter(item => item && typeof item === 'object').map((review, index) => {
    const r = review as Record<string, unknown>
    
    // Handle createdAt date conversion using helper
    const createdAt = parseReviewDate(r.createdAt ?? r.created_at)

    return {
      id: typeof r.id === 'string' ? r.id : `review-${index}`,
      author: typeof r.author === 'string' ? r.author : '익명',
      rating: typeof r.rating === 'number' && r.rating >= 1 && r.rating <= 5 ? r.rating : 5,
      content: typeof r.content === 'string' ? r.content : '',
      createdAt,
      helpful: typeof r.helpful === 'number' && r.helpful >= 0 ? r.helpful : 0
    }
  })
}

/**
 * Format database career map to frontend structure with validation
 */
function formatCareerMap(dbCareerMap: Record<string, unknown>): CareerMap {
  // Handle date conversion with helper functions
  const createdAt = parseDate(dbCareerMap.created_at)
  const updatedAt = parseDate(dbCareerMap.updated_at)

  return {
    id: typeof dbCareerMap.id === 'string' ? dbCareerMap.id : '',
    title: typeof dbCareerMap.title === 'string' ? dbCareerMap.title : '커리어 로드맵',
    targetRole: typeof dbCareerMap.target_role === 'string' ? dbCareerMap.target_role : '소프트웨어 개발자',
    createdAt,
    updatedAt,
    info: {
      certification: validateCertificationInfo(dbCareerMap.certification_info),
      roadmapSteps: validateRoadmapSteps(dbCareerMap.roadmap_steps)
    },
    reviews: validateReviews(dbCareerMap.reviews)
  }
}

serve(async (req: Request) => {
  const { method } = req

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    const origin = req.headers.get('Origin') || undefined
    return new Response('ok', { headers: getCorsHeaders(origin) })
  }

  const supabase = getSupabaseClient()

  try {
    if (method === 'GET') {
      const url = new URL(req.url)
      const careerMapId = url.searchParams.get('id')
      const limit = parseInt(url.searchParams.get('limit') || '10')
      const userProfileId = url.searchParams.get('userProfileId')

      // Single career map by ID
      if (careerMapId) {
        const { data: careerMap, error } = await supabase
          .from('career_maps')
          .select('*')
          .eq('id', careerMapId)
          .single()

        if (error) {
          if (error.code === 'PGRST116') {
            return new Response(
              JSON.stringify({ 
                error: '커리어 맵을 찾을 수 없습니다',
                success: false 
              }),
              { 
                status: 404,
                headers: { ...getCorsHeaders(req.headers.get('Origin') || undefined), "Content-Type": "application/json" }
              }
            )
          }
          throw new Error(`커리어 맵 조회 실패: ${error.message}`)
        }

        return new Response(
          JSON.stringify({ 
            data: formatCareerMap(careerMap),
            success: true 
          }),
          { 
            status: 200,
            headers: { ...getCorsHeaders(req.headers.get('Origin') || undefined), "Content-Type": "application/json" }
          }
        )
      }

      // List of career maps
      let query = supabase
        .from('career_maps')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)

      // Filter by user profile if provided
      if (userProfileId) {
        query = query.eq('user_profile_id', userProfileId)
      }

      const { data: careerMaps, error } = await query

      if (error) {
        throw new Error(`커리어 맵 목록 조회 실패: ${error.message}`)
      }

      const formattedCareerMaps = careerMaps.map(formatCareerMap)

      return new Response(
        JSON.stringify({ 
          data: formattedCareerMaps,
          count: formattedCareerMaps.length,
          success: true 
        }),
        { 
          status: 200,
          headers: { ...getCorsHeaders(req.headers.get('Origin') || undefined), "Content-Type": "application/json" }
        }
      )
    }

    // DELETE endpoint for removing career maps
    if (method === 'DELETE') {
      const url = new URL(req.url)
      const careerMapId = url.searchParams.get('id')

      if (!careerMapId) {
        return new Response(
          JSON.stringify({ 
            error: '삭제할 커리어 맵 ID가 필요합니다',
            success: false 
          }),
          { 
            status: 400,
            headers: { ...getCorsHeaders(req.headers.get('Origin') || undefined), "Content-Type": "application/json" }
          }
        )
      }

      const { error } = await supabase
        .from('career_maps')
        .delete()
        .eq('id', careerMapId)

      if (error) {
        throw new Error(`커리어 맵 삭제 실패: ${error.message}`)
      }

      return new Response(
        JSON.stringify({ 
          message: '커리어 맵이 성공적으로 삭제되었습니다',
          success: true 
        }),
        { 
          status: 200,
          headers: { ...getCorsHeaders(req.headers.get('Origin') || undefined), "Content-Type": "application/json" }
        }
      )
    }

    return new Response(
      JSON.stringify({ 
        error: '지원하지 않는 메서드입니다. GET 또는 DELETE 요청을 사용하세요.',
        success: false 
      }),
      { 
        status: 405,
        headers: { ...getCorsHeaders(req.headers.get('Origin') || undefined), "Content-Type": "application/json" }
      }
    )

  } catch (error: unknown) {
    const errorForLog = error instanceof Error ? error : new Error(String(error))
    logger.error('Career maps error:', errorForLog)
    const errorMessage = error instanceof Error ? error.message : '커리어 맵 처리 중 오류가 발생했습니다'
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        success: false 
      }),
      { 
        status: 500,
        headers: { ...getCorsHeaders(req.headers.get('Origin') || undefined), "Content-Type": "application/json" }
      }
    )
  }
})