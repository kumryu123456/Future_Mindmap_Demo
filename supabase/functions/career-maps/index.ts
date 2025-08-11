import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { getCorsHeaders } from "../_shared/cors.js"
import { getSupabaseClient } from "../_shared/supabase.js"
import { createLogger } from "../_shared/logger.js"

const logger = createLogger('CareerMaps')
logger.info('Career Maps Function initialized!')

interface CareerMap {
  id: string
  title: string
  targetRole: string
  createdAt: Date
  updatedAt: Date
  info: {
    certification: any
    roadmapSteps: any[]
  }
  reviews: any[]
}

/**
 * Format database career map to frontend structure
 */
function formatCareerMap(dbCareerMap: any): CareerMap {
  return {
    id: dbCareerMap.id,
    title: dbCareerMap.title,
    targetRole: dbCareerMap.target_role,
    createdAt: new Date(dbCareerMap.created_at),
    updatedAt: new Date(dbCareerMap.updated_at),
    info: {
      certification: dbCareerMap.certification_info || {},
      roadmapSteps: dbCareerMap.roadmap_steps || []
    },
    reviews: dbCareerMap.reviews || []
  }
}

serve(async (req) => {
  const { method } = req

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    const origin = req.headers.get('Origin')
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
                headers: { ...getCorsHeaders(req.headers.get('Origin')), "Content-Type": "application/json" }
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
            headers: { ...getCorsHeaders(req.headers.get('Origin')), "Content-Type": "application/json" }
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
          headers: { ...getCorsHeaders(req.headers.get('Origin')), "Content-Type": "application/json" }
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
            headers: { ...getCorsHeaders(req.headers.get('Origin')), "Content-Type": "application/json" }
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
          headers: { ...getCorsHeaders(req.headers.get('Origin')), "Content-Type": "application/json" }
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
        headers: { ...getCorsHeaders(req.headers.get('Origin')), "Content-Type": "application/json" }
      }
    )

  } catch (error) {
    logger.error('Career maps error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || '커리어 맵 처리 중 오류가 발생했습니다',
        success: false 
      }),
      { 
        status: 500,
        headers: { ...getCorsHeaders(req.headers.get('Origin')), "Content-Type": "application/json" }
      }
    )
  }
})