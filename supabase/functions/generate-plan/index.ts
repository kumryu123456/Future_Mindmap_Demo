// supabase/functions/generate-plan/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { OpenAI } from "https://esm.sh/openai@4.52.7";
// import { corsHeaders } from "../_shared/cors.ts"; // [수정] 공유 파일 대신 직접 헤더를 정의합니다.

// [수정] CORS 오류 해결을 위해 허용할 메서드(POST, OPTIONS)를 명시적으로 추가합니다.
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};


// --- 1. 타입 정의 (프론트엔드 요구사항 반영) ---

interface RagContext {
  career_profiles: { career_summary: string; skills: string[] }[];
  path_info_items: { title_ko: string; category: string[]; topic_tags: string[]; retrieval_text: string }[];
}

interface RequestPayload {
  userInput: string;
  targetRole: string;
  currentRole: string;
  context: RagContext;
}

interface CareerMap {
  id: string;
  title: string;
  targetRole:string;
  createdAt: string;
  updatedAt: string;
  nodes: any[]; 
}

// [추가] LearningResource, SkillInfo 등 상세 타입 정의
interface LearningResource {
  title: string;
  description: string;
  type: "book" | "course" | "article" | "video" | "project";
}

interface SkillInfo {
  description: string;
  prerequisites: string[];
  learningResources: LearningResource[];
  estimatedTime: string;
  difficulty: "초급" | "중급" | "고급";
}

interface GenerateCareerMapResponse {
  success: boolean;
  message: string;
  plan_source: 'openai' | 'fallback';
  data: CareerMap;
}


// --- 2. 헬퍼 함수 (수정) ---

function formatContextForPrompt(context: RagContext): string {
    let contextString = "**참고 정보 (Context):**\n\n";

    if (context.career_profiles?.length > 0) {
        contextString += "--- 유사 경력 프로필 ---\n";
        context.career_profiles.slice(0, 3).forEach(p => {
            contextString += `- 요약: ${p.career_summary}\n- 주요 기술: ${p.skills.join(', ')}\n`;
        });
    }

    if (context.path_info_items?.length > 0) {
        contextString += "\n--- 관련 활동 정보 (공모전, 인턴 등) ---\n";
        context.path_info_items.slice(0, 5).forEach(item => {
            contextString += `- 활동명: ${item.title_ko} (${item.category.join(', ')})\n- 관련 태그: ${item.topic_tags.join(', ')}\n- 내용: ${item.retrieval_text}\n`;
        });
    }
    
    return contextString.trim() ? contextString : "참고 정보 없음.";
}

/**
 * [개선] OpenAI 프롬프트: 더 상세한 지침과 풍부한 예시로 응답 품질 향상
 */
function buildPlanGenerationPrompt(payload: RequestPayload): string {
    const { currentRole, targetRole, userInput, context } = payload;
    const now = new Date().toISOString();
    const formattedContext = formatContextForPrompt(context);

    return `You are an expert career development consultant for the Korean IT industry. Your task is to generate a detailed career roadmap in a specific JSON format.

**User's Goal:**
- **Current Role:** ${currentRole}
- **Target Role:** ${targetRole}
- **Additional Context:** "${userInput}"

---
${formattedContext}
---

**CRITICAL INSTRUCTIONS:**

1.  **JSON ONLY:** Your entire output MUST be a single, valid JSON object. Do not include any text or markdown formatting outside of this JSON object.
2.  **Strict Structure:** The JSON must strictly follow the \`CareerMap\` and \`NodeData\` structure from the example.
3.  **Korean Content:** All user-facing strings (\`title\`, \`label\`, \`description\`, etc.) must be in Korean.
4.  **Content Details & Node Structure:**
    * Create at least one "current", one "final", and 2-4 "intermediate" nodes.
    * Use the provided context to make the intermediate nodes realistic and helpful.
    * **Each node MUST have a \`data\` object.**
    * For 'intermediate' nodes, the \`data\` object **MUST contain an \`info\` object**, which in turn **MUST contain a \`skillInfo\` object.**
    * The \`skillInfo\` object must be detailed, including a description, prerequisites, and at least 2-3 specific learning resources.
    * The \`reviews\` array should contain 1-2 realistic user reviews with all fields populated.
5.  **Dates:** Use this ISO string for all date fields: \`${now}\`.

---

**Example JSON Output (Your output MUST strictly follow this schema and level of detail):**
\`\`\`json
{
  "id": "data-scientist-map-from-developer",
  "title": "신입 개발자에서 데이터 사이언티스트로",
  "targetRole": "데이터 사이언티스트",
  "createdAt": "${now}",
  "updatedAt": "${now}",
  "nodes": [
    {
      "id": "current",
      "type": "current",
      "position": { "x": 300, "y": 600 },
      "data": {
        "label": "현재\\n신입 개발자"
      }
    },
    {
      "id": "python-basics",
      "type": "intermediate",
      "position": { "x": 150, "y": 450 },
      "data": {
        "label": "Python\\n기초 및 라이브러리",
        "info": {
          "skillInfo": {
            "description": "데이터 사이언스의 핵심 언어인 Python 기초 문법과 데이터 처리를 위한 NumPy, Pandas 라이브러리를 학습합니다.",
            "prerequisites": ["프로그래밍 기초"],
            "learningResources": [
              { "title": "점프 투 파이썬", "description": "Python 기초부터 심화까지 체계적으로 다루는 베스트셀러 입문서입니다.", "type": "book" },
              { "title": "파이썬 데이터 사이언스 핸드북", "description": "NumPy, Pandas, Matplotlib 등 데이터 과학 필수 라이브러리 활용법을 깊이 있게 다룹니다.", "type": "book" }
            ],
            "estimatedTime": "2-3개월",
            "difficulty": "초급"
          }
        },
        "reviews": [
          { "id": "review-python-1", "author": "김데이터", "rating": 5, "content": "비전공자인데 이 노드 덕분에 파이썬 기초를 탄탄히 다졌습니다. '파이썬 데이터 사이언스 핸드북'은 필독서입니다.", "createdAt": "${now}", "helpful": 32 }
        ]
      }
    },
    {
      "id": "ml-fundamentals",
      "type": "intermediate",
      "position": { "x": 450, "y": 300 },
      "data": {
        "label": "머신러닝\\n기초",
        "info": {
          "skillInfo": {
            "description": "Scikit-learn 라이브러리를 활용하여 회귀, 분류, 군집화 등 주요 머신러닝 알고리즘을 학습하고 모델을 평가합니다.",
            "prerequisites": ["Python 기초", "기초 통계 지식"],
            "learningResources": [
              { "title": "핸즈온 머신러닝 (2판)", "description": "이론과 실습을 겸비한 최고의 머신러닝 교과서입니다.", "type": "book" },
              { "title": "Andrew Ng의 Machine Learning", "description": "Coursera에서 제공되는 전설적인 머신러닝 입문 강의입니다.", "type": "course" }
            ],
            "estimatedTime": "3-4개월",
            "difficulty": "중급"
          }
        },
        "reviews": []
      }
    },
    {
      "id": "final-goal",
      "type": "final",
      "position": { "x": 300, "y": 50 },
      "data": {
        "label": "데이터 사이언티스트"
      }
    }
  ]
}
\`\`\``;
}

// [추가] OpenAI API 호출 함수 분리
async function generatePlanWithOpenAI(openai: OpenAI, prompt: string): Promise<any> {
    console.log("[Info] 🤖 Calling OpenAI for career plan generation...");
    const response = await openai.chat.completions.create({
        model: 'gpt-4-turbo',
        messages: [
            { role: 'system', content: 'You are an expert career development strategist. Always respond with valid JSON only that strictly adheres to the user-provided schema. Prioritize Korean context.' },
            { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 4000,
        response_format: { type: 'json_object' }
    });

    const content = response.choices?.[0]?.message?.content;
    if (!content) {
        throw new Error('OpenAI API returned an empty response.');
    }
    try {
        const parsedJson = JSON.parse(content);
        console.log("[Info] ✅ Successfully parsed OpenAI response.");
        return parsedJson;
    } catch (e) {
        console.error('[Error] Failed to parse OpenAI response as JSON. Raw content:', content);
        throw new Error(`Invalid JSON response from OpenAI: ${e.message}`);
    }
}

function validateCareerMap(plan: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!plan || typeof plan !== 'object') {
        return { isValid: false, errors: ['Response is not a valid object.'] };
    }

    // 최상위 필드 검사
    if (typeof plan.id !== 'string') errors.push('Field "id" must be a string.');
    if (typeof plan.title !== 'string') errors.push('Field "title" must be a string.');
    if (typeof plan.targetRole !== 'string') errors.push('Field "targetRole" must be a string.');
    if (plan.edges) errors.push('Field "edges" should not exist at the root level.');

    // Nodes 배열 및 내부 구조 검사
    if (!Array.isArray(plan.nodes) || plan.nodes.length < 2) {
        errors.push('Field "nodes" must be an array with at least 2 nodes.');
    } else {
        plan.nodes.forEach((node: any, i: number) => {
            const nodeIdentifier = node.id ? `Node "${node.id}"` : `Node at index ${i}`;

            if (!node || typeof node !== 'object') {
                errors.push(`Node at index ${i} is not a valid object.`);
                return; // 이 노드는 더 이상 검사할 수 없으므로 다음 노드로 넘어감
            }
            if (typeof node.id !== 'string') errors.push(`${nodeIdentifier} is missing "id".`);
            if (typeof node.type !== 'string') errors.push(`${nodeIdentifier} is missing "type".`);
            if (!node.data || typeof node.data.label !== 'string') {
                errors.push(`${nodeIdentifier} is missing or has an invalid "data.label".`);
            }
            
            // 중간 노드의 상세 구조 검증 강화
            if (node.type === 'intermediate') {
                if (!node.data.info || typeof node.data.info !== 'object') {
                    errors.push(`${nodeIdentifier} is missing the 'info' object.`);
                } else {
                    const skillInfo = node.data.info.skillInfo;
                    if (!skillInfo || typeof skillInfo !== 'object') {
                        errors.push(`${nodeIdentifier} is missing the nested 'skillInfo' object inside 'info'.`);
                    } else {
                        // skillInfo 내부 필드까지 상세 검증
                        if (typeof skillInfo.description !== 'string') errors.push(`${nodeIdentifier} skillInfo is missing "description".`);
                        if (!Array.isArray(skillInfo.prerequisites)) errors.push(`${nodeIdentifier} skillInfo "prerequisites" must be an array.`);
                        if (typeof skillInfo.estimatedTime !== 'string') errors.push(`${nodeIdentifier} skillInfo is missing "estimatedTime".`);
                        if (!["초급", "중급", "고급"].includes(skillInfo.difficulty)) errors.push(`${nodeIdentifier} skillInfo has invalid "difficulty".`);
                        if (!Array.isArray(skillInfo.learningResources)) {
                            errors.push(`${nodeIdentifier} skillInfo "learningResources" must be an array.`);
                        }
                    }
                }

                if (node.data.reviews && !Array.isArray(node.data.reviews)) {
                    errors.push(`${nodeIdentifier} has an invalid 'reviews' field. It must be an array.`);
                }
            }
        });
    }

    return { isValid: errors.length === 0, errors };
}

// [추가] Fallback 플랜 생성 함수
function generateFallbackPlan(payload: RequestPayload): CareerMap {
    console.log("[Info] 🔄 Generating fallback career plan...");
    const now = new Date().toISOString();
    const { currentRole, targetRole } = payload;
    return {
        id: `fallback-map-${Date.now()}`,
        title: `기본 커리어 맵: ${targetRole} 되기`,
        targetRole: targetRole,
        createdAt: now,
        updatedAt: now,
        nodes: [
            {
                id: "current",
                type: "current",
                position: { x: 300, y: 500 },
                data: { label: `현재\n${currentRole}` },
            },
            {
                id: "intermediate-step-1",
                type: "intermediate",
                position: { x: 300, y: 350 },
                data: {
                    label: "1단계: 역량 분석 및 계획",
                    info: {
                        skillInfo: {
                            description: "AI 응답에 문제가 발생하여 생성된 기본 계획입니다. 목표 달성을 위해 필요한 기술과 지식을 분석하고 구체적인 학습 계획을 세워보세요.",
                            prerequisites: ["업무에 대한 열정"],
                            learningResources: [],
                            estimatedTime: "1-2주",
                            difficulty: "초급",
                        },
                    },
                },
            },
            {
                id: "final",
                type: "final",
                position: { x: 300, y: 100 },
                data: { label: targetRole },
            },
        ],
    };
}

// [추가] JSON 응답 생성 래퍼
function createJsonResponse(body: Record<string, any>, status = 200) {
    return new Response(JSON.stringify(body), {
        status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
}

// --- 3. 메인 서버 로직 (수정) ---

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }
    if (req.method !== "POST") {
        return createJsonResponse({ success: false, message: "Method Not Allowed" }, 405);
    }

    try {
        const payload: RequestPayload = await req.json();
        const { userInput, currentRole, targetRole, context } = payload;

        if (!userInput || !currentRole || !targetRole || !context) {
            return createJsonResponse({ success: false, message: 'Missing required fields: userInput, currentRole, targetRole, and context are required.' }, 400);
        }

        console.log(`[Info] 🚀 Request received: From '${currentRole}' to '${targetRole}'.`);

        let finalPlan: CareerMap;
        let planSource: 'openai' | 'fallback' = 'fallback'; // 기본값 설정

        try {
            const openai = new OpenAI({ apiKey: Deno.env.get("OPENAI_API_KEY")! });
            const prompt = buildPlanGenerationPrompt(payload);
            const openaiResponse = await generatePlanWithOpenAI(openai, prompt);
            
            const validation = validateCareerMap(openaiResponse);

            if (!validation.isValid) {
                console.error('[Error] OpenAI plan failed validation. Reasons:', validation.errors.join('; '));
                console.error('[Error] Raw OpenAI Response:', JSON.stringify(openaiResponse, null, 2));
                throw new Error('Generated plan is structurally invalid.');
            }

            finalPlan = openaiResponse as CareerMap;
            planSource = 'openai';
            console.log("[Info] ✅ Successfully validated and processed plan from OpenAI.");

        } catch (error) {
            console.error(`[Error] Main logic failed, switching to fallback. Reason: ${error.message}`);
            finalPlan = generateFallbackPlan(payload);
            planSource = 'fallback';
        }

        const response: GenerateCareerMapResponse = {
            success: true,
            message: `Career plan generated using ${planSource}.`,
            plan_source: planSource,
            data: finalPlan,
        };

        return createJsonResponse(response, 200);

    } catch (error) {
        console.error("[Error] Top-level request handler failed:", error);
        return createJsonResponse({
            success: false,
            message: error instanceof Error ? error.message : "An unknown internal error occurred.",
        }, 500);
    }
});
