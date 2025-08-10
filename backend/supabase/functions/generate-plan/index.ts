import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { getCorsHeaders } from "../_shared/cors.ts"
import { getSupabaseClient } from "../_shared/supabase.ts"
import { rateLimit, addRateLimitHeaders } from "../_shared/rate-limiter.ts"
import { createLogger } from "../_shared/logger.ts"
import { metrics, withMetrics, measurePerformance } from "../_shared/metrics.ts"

const logger = createLogger('GeneratePlan')
logger.info('Generate Plan Function initialized!')

interface PlanNode {
  id: string
  title: string
  description: string
  type: 'goal' | 'milestone' | 'task' | 'subtask' | 'resource'
  priority: 'low' | 'medium' | 'high' | 'critical'
  status: 'pending' | 'in_progress' | 'completed' | 'blocked'
  timeline: {
    estimated_duration: string
    start_date?: string
    end_date?: string
    dependencies?: string[]
  }
  metadata: {
    effort_level: number // 1-5 scale
    complexity: number // 1-5 scale
    risk_level: number // 1-5 scale
    resources_required: string[]
    skills_required: string[]
    tags: string[]
  }
  children?: PlanNode[]
}

interface GeneratedPlan {
  id?: string
  title: string
  description: string
  objective: string
  context: {
    keywords: string[]
    enterprise_data_sources: string[]
    user_input: string
  }
  plan_structure: PlanNode[]
  metadata: {
    total_estimated_duration: string
    complexity_score: number
    confidence_score: number
    risk_assessment: string
    success_metrics: string[]
  }
  generated_at: string
  created_at?: string
  updated_at?: string
}

/**
 * Build comprehensive prompt for OpenAI plan generation
 */
function buildPlanGenerationPrompt(
  userInput: string,
  keywords: string[],
  enterpriseData: any[]
): string {
  const enterpriseContext = enterpriseData
    .slice(0, 10) // Limit to top 10 most relevant
    .map(item => `- ${item.title}: ${item.description} (Relevance: ${item.relevance_score})`)
    .join('\n')

  return `You are an expert strategic planner and project management consultant. Generate a comprehensive, actionable plan based on the user's input and available enterprise context.

**User Input:**
"${userInput}"

**Extracted Keywords:**
${keywords.join(', ')}

**Relevant Enterprise Context:**
${enterpriseContext || 'No specific enterprise context available'}

**Instructions:**
1. Create a structured, hierarchical plan with clear goals, milestones, tasks, and subtasks
2. Ensure the plan is actionable, realistic, and considers enterprise constraints
3. Include timeline estimates, priority levels, and resource requirements
4. Assess risks and complexity for each component
5. Provide success metrics and confidence scores

**Required JSON Structure:**
{
  "title": "Clear, descriptive plan title",
  "description": "Brief overview of what this plan accomplishes",
  "objective": "Primary goal or outcome this plan aims to achieve",
  "context": {
    "keywords": ["keyword1", "keyword2"],
    "enterprise_data_sources": ["source1", "source2"],
    "user_input": "original user input text"
  },
  "plan_structure": [
    {
      "id": "unique_identifier",
      "title": "Main Goal/Phase Title",
      "description": "Detailed description of this component",
      "type": "goal|milestone|task|subtask|resource",
      "priority": "low|medium|high|critical",
      "status": "pending",
      "timeline": {
        "estimated_duration": "2 weeks",
        "dependencies": ["dependency_id"]
      },
      "metadata": {
        "effort_level": 3,
        "complexity": 4,
        "risk_level": 2,
        "resources_required": ["developers", "designers"],
        "skills_required": ["React", "API design"],
        "tags": ["frontend", "critical_path"]
      },
      "children": [
        {
          "id": "subtask_id",
          "title": "Subtask Title",
          "description": "Subtask description",
          "type": "task",
          "priority": "medium",
          "status": "pending",
          "timeline": {
            "estimated_duration": "3 days"
          },
          "metadata": {
            "effort_level": 2,
            "complexity": 2,
            "risk_level": 1,
            "resources_required": ["developer"],
            "skills_required": ["JavaScript"],
            "tags": ["implementation"]
          }
        }
      ]
    }
  ],
  "metadata": {
    "total_estimated_duration": "8 weeks",
    "complexity_score": 7,
    "confidence_score": 8,
    "risk_assessment": "Medium risk due to external dependencies",
    "success_metrics": ["metric1", "metric2", "metric3"]
  }
}

**Guidelines:**
- Use realistic time estimates (hours, days, weeks, months)
- Assign appropriate priority levels based on business impact
- Include 3-7 main goals/phases with 2-5 tasks each
- Effort level: 1=minimal, 5=intensive
- Complexity: 1=simple, 5=highly complex
- Risk level: 1=low risk, 5=high risk
- Confidence score: 1-10 (10=very confident in plan success)
- Complexity score: 1-10 overall project complexity

Return only valid JSON without any markdown formatting or additional text.`
}

/**
 * Call OpenAI API to generate plan
 */
async function generatePlanWithOpenAI(prompt: string): Promise<any> {
  const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
  
  if (!openaiApiKey) {
    throw new Error('OpenAI API key not configured. Please set OPENAI_API_KEY environment variable.')
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4', // Use GPT-4 for better structured output
      messages: [
        {
          role: 'system',
          content: 'You are an expert strategic planner. Always respond with valid JSON only, no markdown or additional text.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 4000,
      response_format: { type: 'json_object' }
    })
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(`OpenAI API error: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`)
  }

  const data = await response.json()
  
  if (!data.choices || !data.choices[0] || !data.choices[0].message) {
    throw new Error('Invalid response structure from OpenAI API')
  }

  const content = data.choices[0].message.content
  
  try {
    return JSON.parse(content)
  } catch (error) {
    console.error('Failed to parse OpenAI response as JSON:', content)
    throw new Error(`Invalid JSON response from OpenAI: ${error.message}`)
  }
}

/**
 * Validate generated plan structure
 */
function validatePlanStructure(plan: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!plan.title || typeof plan.title !== 'string') {
    errors.push('Plan must have a valid title')
  }

  if (!plan.description || typeof plan.description !== 'string') {
    errors.push('Plan must have a valid description')
  }

  if (!plan.objective || typeof plan.objective !== 'string') {
    errors.push('Plan must have a valid objective')
  }

  if (!Array.isArray(plan.plan_structure)) {
    errors.push('Plan must have a plan_structure array')
  } else {
    // Validate each node in the structure
    plan.plan_structure.forEach((node: any, index: number) => {
      if (!node.id || !node.title || !node.type) {
        errors.push(`Plan node ${index + 1} missing required fields (id, title, type)`)
      }
      
      if (!['goal', 'milestone', 'task', 'subtask', 'resource'].includes(node.type)) {
        errors.push(`Plan node ${index + 1} has invalid type: ${node.type}`)
      }

      if (!['low', 'medium', 'high', 'critical'].includes(node.priority)) {
        errors.push(`Plan node ${index + 1} has invalid priority: ${node.priority}`)
      }
    })
  }

  if (!plan.metadata || typeof plan.metadata !== 'object') {
    errors.push('Plan must have valid metadata object')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Generate fallback plan if OpenAI fails
 */
function generateFallbackPlan(userInput: string, keywords: string[]): GeneratedPlan {
  return {
    title: "Automated Plan Generation",
    description: "A basic plan structure generated from your input keywords",
    objective: "Accomplish the goals outlined in your input",
    context: {
      keywords,
      enterprise_data_sources: [],
      user_input: userInput
    },
    plan_structure: [
      {
        id: "research_phase",
        title: "Research and Discovery",
        description: "Gather requirements and understand the scope",
        type: "goal",
        priority: "high",
        status: "pending",
        timeline: {
          estimated_duration: "1 week"
        },
        metadata: {
          effort_level: 3,
          complexity: 2,
          risk_level: 1,
          resources_required: ["analyst"],
          skills_required: ["research"],
          tags: ["discovery"]
        },
        children: [
          {
            id: "requirements_gathering",
            title: "Requirements Gathering",
            description: "Collect and document detailed requirements",
            type: "task",
            priority: "high",
            status: "pending",
            timeline: {
              estimated_duration: "3 days"
            },
            metadata: {
              effort_level: 2,
              complexity: 2,
              risk_level: 1,
              resources_required: ["analyst"],
              skills_required: ["documentation"],
              tags: ["requirements"]
            }
          }
        ]
      },
      {
        id: "implementation_phase",
        title: "Implementation",
        description: "Execute the main work based on research findings",
        type: "goal",
        priority: "high",
        status: "pending",
        timeline: {
          estimated_duration: "3 weeks",
          dependencies: ["research_phase"]
        },
        metadata: {
          effort_level: 4,
          complexity: 3,
          risk_level: 2,
          resources_required: ["developer", "designer"],
          skills_required: keywords.slice(0, 3),
          tags: ["implementation", "core"]
        }
      }
    ],
    metadata: {
      total_estimated_duration: "4 weeks",
      complexity_score: 5,
      confidence_score: 6,
      risk_assessment: "Medium risk - basic plan structure",
      success_metrics: ["Requirements documented", "Implementation completed", "Testing passed"]
    },
    generated_at: new Date().toISOString()
  }
}

serve(async (req) => {
  const { method } = req

  // Handle CORS preflight requests
  if (method === 'OPTIONS') {
    const origin = req.headers.get('Origin')
    const corsHeaders = getCorsHeaders(origin)
    return new Response('ok', { headers: corsHeaders })
  }

  // 🔧 FIX: Apply rate limiting for AI endpoints
  const rateLimitResult = rateLimit('ai')(req)
  if (!rateLimitResult.allowed) {
    return rateLimitResult.response!
  }

  const supabase = getSupabaseClient()

  try {
    if (method === 'POST') {
      const body = await req.json()
      const { 
        userInput, 
        keywords = [], 
        enterpriseData = [],
        useOpenAI = true 
      } = body

      // Validate input
      if (!userInput || typeof userInput !== 'string' || userInput.trim().length === 0) {
        return new Response(
          JSON.stringify({ 
            error: 'Missing or invalid userInput field. Please provide a non-empty string.',
            success: false 
          }),
          { 
            status: 400,
            headers: { ...getCorsHeaders(req.headers.get('Origin')), "Content-Type": "application/json" }
          }
        )
      }

      console.log('Generating plan for input:', userInput.substring(0, 100) + '...')

      let generatedPlan: GeneratedPlan
      let planSource = 'openai'

      if (useOpenAI) {
        try {
          // Generate comprehensive prompt
          const prompt = buildPlanGenerationPrompt(userInput, keywords, enterpriseData)
          
          // Call OpenAI API
          const openaiResponse = await generatePlanWithOpenAI(prompt)
          
          // Validate the response
          const validation = validatePlanStructure(openaiResponse)
          
          if (!validation.isValid) {
            console.error('OpenAI generated invalid plan structure:', validation.errors)
            throw new Error('Generated plan failed validation')
          }

          // Prepare the complete plan object
          generatedPlan = {
            ...openaiResponse,
            context: {
              keywords,
              enterprise_data_sources: enterpriseData.map(item => item.source).filter(Boolean),
              user_input: userInput
            },
            generated_at: new Date().toISOString()
          }

        } catch (error) {
          console.error('OpenAI plan generation failed:', error.message)
          console.log('Falling back to automated plan generation')
          
          // Use fallback plan
          generatedPlan = generateFallbackPlan(userInput, keywords)
          planSource = 'fallback'
        }
      } else {
        // Use fallback plan directly
        generatedPlan = generateFallbackPlan(userInput, keywords)
        planSource = 'fallback'
      }

      // Save plan to database
      const { data: savedPlan, error: saveError } = await supabase
        .from('plans')
        .insert({
          title: generatedPlan.title,
          description: generatedPlan.description,
          objective: generatedPlan.objective,
          context: generatedPlan.context,
          plan_structure: generatedPlan.plan_structure,
          metadata: generatedPlan.metadata,
          generated_at: generatedPlan.generated_at,
          plan_source: planSource
        })
        .select()

      if (saveError) {
        console.error('Failed to save plan to database:', saveError)
        // Return the plan anyway, but note the save failure
        return new Response(
          JSON.stringify({ 
            data: generatedPlan,
            plan_source: planSource,
            success: true,
            warning: 'Plan generated successfully but failed to save to database',
            message: 'Plan generated and ready for use'
          }),
          { 
            status: 200,
            headers: { ...getCorsHeaders(req.headers.get('Origin')), "Content-Type": "application/json" }
          }
        )
      }

      const finalPlan = savedPlan[0]

      const response = new Response(
        JSON.stringify({ 
          data: finalPlan,
          plan_source: planSource,
          success: true,
          message: 'Plan generated and saved successfully'
        }),
        { 
          status: 201,
          headers: { ...getCorsHeaders(req.headers.get('Origin')), "Content-Type": "application/json" }
        }
      )
      
      // 🔧 FIX: Add rate limit headers
      return addRateLimitHeaders(response, rateLimitResult.info)
    }

    // GET - Retrieve saved plans
    if (method === 'GET') {
      const url = new URL(req.url)
      const limit = parseInt(url.searchParams.get('limit') || '10')
      const planId = url.searchParams.get('id')

      let query = supabase
        .from('plans')
        .select('*')
        .order('created_at', { ascending: false })

      if (planId) {
        query = query.eq('id', planId).limit(1)
      } else {
        query = query.limit(limit)
      }

      const { data, error } = await query

      if (error) {
        throw new Error(`Failed to retrieve plans: ${error.message}`)
      }

      return new Response(
        JSON.stringify({ 
          data: planId ? (data[0] || null) : data,
          count: data.length,
          success: true 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    return new Response(
      JSON.stringify({ 
        error: 'Method not allowed. Use POST to generate a plan or GET to retrieve plans.',
        success: false 
      }),
      { 
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    )

  } catch (error) {
    console.error('Function error:', error)
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