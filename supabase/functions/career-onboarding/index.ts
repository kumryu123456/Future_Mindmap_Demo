import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { getCorsHeaders } from "../_shared/cors.js"
import { getSupabaseClient } from "../_shared/supabase.js"
import { rateLimit, addRateLimitHeaders } from "../_shared/rate-limiter.js"
import { createLogger } from "../_shared/logger.js"

const logger = createLogger('CareerOnboarding')
logger.info('Career Onboarding Function initialized!')

// Frontend interfaces matching exactly
interface OnboardingFormData {
  education: string
  school?: string
  major: string
  skills: string[]
  certifications?: string
  experience: string
  goal: string
}

interface RoadmapStep {
  id: string
  title: string
  type: "current" | "intermediate" | "final"
  position: { x: number; y: number }
}

interface CertificationInfo {
  name: string
  difficulty: string
  eligibility: string
  examStructure: string
  schedule: string
  recommendedBooks: {
    title: string
    description: string
    category: "written" | "practical"
  }[]
  recommendedCourses: {
    title: string
    description: string
    platform: string
  }[]
}

interface Review {
  id: string
  author: string
  rating: number
  content: string
  createdAt: Date
  helpful: number
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
 * Korean career market knowledge base
 */
const KOREAN_CAREER_DATA = {
  certifications: {
    "데이터 사이언티스트": {
      primary: "빅데이터분석기사",
      alternatives: ["ADsP", "ADP", "SQLD", "SQLP"]
    },
    "백엔드 개발자": {
      primary: "정보처리기사",
      alternatives: ["정보처리산업기사", "컴활1급", "리눅스마스터"]
    },
    "프론트엔드 개발자": {
      primary: "웹디자인기능사",
      alternatives: ["정보처리기사", "컴활1급"]
    },
    "AI 엔지니어": {
      primary: "빅데이터분석기사",
      alternatives: ["정보처리기사", "ADP"]
    },
    "DevOps 엔지니어": {
      primary: "정보처리기사",
      alternatives: ["리눅스마스터", "네트워크관리사"]
    }
  },
  skillMappings: {
    python: ["백엔드 개발자", "데이터 사이언티스트", "AI 엔지니어"],
    javascript: ["프론트엔드 개발자", "백엔드 개발자", "풀스택 개발자"],
    react: ["프론트엔드 개발자", "풀스택 개발자"],
    java: ["백엔드 개발자", "안드로이드 개발자"],
    sql: ["데이터 사이언티스트", "백엔드 개발자", "데이터 엔지니어"],
    aws: ["DevOps 엔지니어", "클라우드 엔지니어", "백엔드 개발자"],
    docker: ["DevOps 엔지니어", "백엔드 개발자"]
  }
}

/**
 * Generate career-specific AI prompt for Korean market
 */
function buildCareerPrompt(formData: OnboardingFormData): string {
  const { education, major, skills, experience, goal } = formData
  
  // Infer target role from goal and skills
  const targetRoles = inferTargetRoles(skills, goal)
  const primaryRole = targetRoles[0] || "소프트웨어 개발자"
  
  return `당신은 한국 취업 시장 전문가이자 커리어 컨설턴트입니다. 다음 정보를 바탕으로 구체적이고 실용적인 커리어 로드맵을 생성해주세요.

**사용자 정보:**
- 학력: ${education} (전공: ${major})
- 보유 기술: ${skills.join(', ')}
- 경험: ${experience}
- 목표: ${goal}

**추론된 목표 직무:** ${primaryRole}

**생성 요구사항:**
1. 한국 취업 시장의 실제 채용 트렌드를 반영
2. 목표 직무에 적합한 자격증 추천 (한국 국가자격증 우선)
3. 현실적인 학습 시간과 난이도 설정
4. 단계별 로드맵 (현재 상태 → 중간 단계 → 목표 달성)
5. 추천 교재와 온라인 강의 (한국 플랫폼 우선)

**JSON 응답 형식:**
{
  "title": "구체적인 커리어 맵 제목",
  "targetRole": "${primaryRole}",
  "certification": {
    "name": "주요 목표 자격증명",
    "difficulty": "초급|중급|고급",
    "eligibility": "응시 자격 요건",
    "examStructure": "시험 구성 (필기/실기)",
    "schedule": "시험 일정 정보",
    "recommendedBooks": [
      {
        "title": "교재명",
        "description": "교재 설명 및 특징",
        "category": "written|practical"
      }
    ],
    "recommendedCourses": [
      {
        "title": "강의명",
        "description": "강의 내용 설명",
        "platform": "인프런|패스트캠퍼스|유데미|기타"
      }
    ]
  },
  "roadmapSteps": [
    {
      "id": "current",
      "title": "현재 상태\\n(간단히)",
      "type": "current",
      "position": {"x": 300, "y": 800}
    },
    {
      "id": "step1",
      "title": "중간 단계 1",
      "type": "intermediate", 
      "position": {"x": 150, "y": 650}
    },
    {
      "id": "step2",
      "title": "중간 단계 2",
      "type": "intermediate",
      "position": {"x": 450, "y": 650}
    },
    {
      "id": "final",
      "title": "${primaryRole}",
      "type": "final",
      "position": {"x": 300, "y": 200}
    }
  ]
}

**중요 지침:**
- roadmapSteps는 4-8개의 단계로 구성
- position 좌표는 ReactFlow에서 사용됩니다 (중앙 기준)
- 모든 텍스트는 한국어로 작성
- 실제 존재하는 자격증과 교재명 사용
- JSON 형식 외의 다른 텍스트는 포함하지 마세요

JSON만 반환하세요:`
}

/**
 * Infer target roles from skills and goal text
 */
function inferTargetRoles(skills: string[], goal: string): string[] {
  const goalLower = goal.toLowerCase()
  const roles: string[] = []
  
  // Goal-based inference
  if (goalLower.includes('데이터') || goalLower.includes('분석')) {
    roles.push('데이터 사이언티스트')
  }
  if (goalLower.includes('백엔드') || goalLower.includes('서버')) {
    roles.push('백엔드 개발자')
  }
  if (goalLower.includes('프론트엔드') || goalLower.includes('ui') || goalLower.includes('웹')) {
    roles.push('프론트엔드 개발자')
  }
  if (goalLower.includes('ai') || goalLower.includes('머신러닝') || goalLower.includes('딥러닝')) {
    roles.push('AI 엔지니어')
  }
  if (goalLower.includes('devops') || goalLower.includes('인프라')) {
    roles.push('DevOps 엔지니어')
  }
  
  // Skills-based inference
  skills.forEach(skill => {
    if (KOREAN_CAREER_DATA.skillMappings[skill]) {
      roles.push(...KOREAN_CAREER_DATA.skillMappings[skill])
    }
  })
  
  // Remove duplicates and return
  return [...new Set(roles)]
}

/**
 * Call OpenAI API for career roadmap generation
 */
async function generateCareerRoadmap(prompt: string): Promise<any> {
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
          content: '당신은 한국 취업 시장 전문가입니다. 항상 유효한 JSON만 응답하세요.'
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
 * Generate fallback career roadmap
 */
function generateFallbackRoadmap(formData: OnboardingFormData): any {
  const targetRoles = inferTargetRoles(formData.skills, formData.goal)
  const targetRole = targetRoles[0] || "소프트웨어 개발자"
  
  return {
    title: `${targetRole} 커리어 로드맵`,
    targetRole,
    certification: {
      name: "정보처리기사",
      difficulty: "중급",
      eligibility: "관련 학과 4년제 졸업(예정) 또는 실무경력 4년 이상",
      examStructure: "필기(객관식 100문항) / 실기(서술형)",
      schedule: "연 3회 (한국산업인력공단)",
      recommendedBooks: [
        {
          title: "2025 시나공 정보처리기사 필기",
          description: "기출문제 중심의 체계적인 학습서",
          category: "written"
        }
      ],
      recommendedCourses: [
        {
          title: "정보처리기사 완전정복 패키지",
          description: "필기부터 실기까지 한번에",
          platform: "인프런"
        }
      ]
    },
    roadmapSteps: [
      {
        id: "current",
        title: `${formData.major}\n전공자`,
        type: "current",
        position: { x: 300, y: 800 }
      },
      {
        id: "basic",
        title: "기초 역량 강화",
        type: "intermediate",
        position: { x: 200, y: 650 }
      },
      {
        id: "certification",
        title: "자격증 취득",
        type: "intermediate",
        position: { x: 400, y: 650 }
      },
      {
        id: "project",
        title: "프로젝트 경험",
        type: "intermediate",
        position: { x: 200, y: 500 }
      },
      {
        id: "portfolio",
        title: "포트폴리오 완성",
        type: "intermediate",
        position: { x: 400, y: 500 }
      },
      {
        id: "final",
        title: targetRole,
        type: "final",
        position: { x: 300, y: 350 }
      }
    ]
  }
}

/**
 * Validate career roadmap structure
 */
function validateCareerRoadmap(roadmap: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!roadmap.title || typeof roadmap.title !== 'string') {
    errors.push('제목이 필요합니다')
  }

  if (!roadmap.targetRole || typeof roadmap.targetRole !== 'string') {
    errors.push('목표 직무가 필요합니다')
  }

  if (!roadmap.certification || typeof roadmap.certification !== 'object') {
    errors.push('자격증 정보가 필요합니다')
  }

  if (!Array.isArray(roadmap.roadmapSteps)) {
    errors.push('로드맵 단계가 필요합니다')
  } else if (roadmap.roadmapSteps.length < 3) {
    errors.push('최소 3개의 로드맵 단계가 필요합니다')
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
        formData, 
        useOpenAI = true 
      }: { 
        formData: OnboardingFormData, 
        useOpenAI?: boolean 
      } = body

      // Validate input
      if (!formData || !formData.major || !formData.goal || !formData.skills?.length) {
        return new Response(
          JSON.stringify({ 
            error: '필수 입력 항목이 누락되었습니다 (전공, 목표, 기술)',
            success: false 
          }),
          { 
            status: 400,
            headers: { ...getCorsHeaders(req.headers.get('Origin')), "Content-Type": "application/json" }
          }
        )
      }

      logger.info(`Generating career roadmap for: ${formData.goal.substring(0, 50)}...`)

      // Step 1: Save user profile
      const { data: savedProfile, error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          education: formData.education,
          school: formData.school,
          major: formData.major,
          skills: JSON.stringify(formData.skills),
          certifications: formData.certifications,
          experience: formData.experience,
          goal: formData.goal
        })
        .select()
        .single()

      if (profileError) {
        console.error('Failed to save user profile:', profileError)
        throw new Error('사용자 프로필 저장에 실패했습니다')
      }

      // Step 2: Generate career roadmap
      let roadmapData: any
      let aiSource = 'openai'

      if (useOpenAI) {
        try {
          const prompt = buildCareerPrompt(formData)
          roadmapData = await generateCareerRoadmap(prompt)
          
          const validation = validateCareerRoadmap(roadmapData)
          if (!validation.isValid) {
            throw new Error(`검증 실패: ${validation.errors.join(', ')}`)
          }
        } catch (error) {
          console.error('OpenAI generation failed:', error.message)
          logger.info('Using fallback generation')
          roadmapData = generateFallbackRoadmap(formData)
          aiSource = 'fallback'
        }
      } else {
        roadmapData = generateFallbackRoadmap(formData)
        aiSource = 'fallback'
      }

      // Step 3: Save career map
      const now = new Date().toISOString()
      const { data: savedCareerMap, error: careerMapError } = await supabase
        .from('career_maps')
        .insert({
          user_profile_id: savedProfile.id,
          title: roadmapData.title,
          target_role: roadmapData.targetRole,
          certification_info: roadmapData.certification,
          roadmap_steps: roadmapData.roadmapSteps,
          reviews: [], // Empty initially
          ai_source: aiSource,
          generation_prompt: useOpenAI ? buildCareerPrompt(formData) : null
        })
        .select()
        .single()

      if (careerMapError) {
        console.error('Failed to save career map:', careerMapError)
        throw new Error('커리어 맵 저장에 실패했습니다')
      }

      // Step 4: Format response to match frontend expectations
      const careerMapResponse: CareerMap = {
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
          data: careerMapResponse,
          success: true,
          message: '커리어 로드맵이 성공적으로 생성되었습니다',
          ai_source: aiSource
        }),
        { 
          status: 201,
          headers: { ...getCorsHeaders(req.headers.get('Origin')), "Content-Type": "application/json" }
        }
      )
      
      return addRateLimitHeaders(response, rateLimitResult.info)
    }

    return new Response(
      JSON.stringify({ 
        error: '지원하지 않는 메서드입니다. POST 요청을 사용하세요.',
        success: false 
      }),
      { 
        status: 405,
        headers: { ...getCorsHeaders(req.headers.get('Origin')), "Content-Type": "application/json" }
      }
    )

  } catch (error) {
    logger.error('Career onboarding error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || '커리어 온보딩 처리 중 오류가 발생했습니다',
        success: false 
      }),
      { 
        status: 500,
        headers: { ...getCorsHeaders(req.headers.get('Origin')), "Content-Type": "application/json" }
      }
    )
  }
})