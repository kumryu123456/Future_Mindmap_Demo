import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { getCorsHeaders } from "../_shared/cors.js"
import { getSupabaseClient } from "../_shared/supabase.js"

console.log("Fetch Enterprise Data Function initialized!")

interface EnterpriseDataSource {
  name: string
  url: string
  apiKey?: string
  headers?: Record<string, string>
  transformer: (data: any) => NormalizedData[]
}

interface NormalizedData {
  id: string
  title: string
  description: string
  category: string
  source: string
  relevance_score: number
  keywords: string[]
  metadata: Record<string, any>
  url?: string
  created_at: string
}

interface EnterpriseDataRecord {
  id?: string
  keyword_query: string
  source: string
  data: NormalizedData[]
  relevance_score: number
  fetched_at: string
  cached_until: string
  created_at?: string
  updated_at?: string
}

/**
 * Mock enterprise data sources (replace with real APIs)
 */
const mockEnterpriseData: Record<string, NormalizedData[]> = {
  "productivity": [
    {
      id: "prod_001",
      title: "Agile Project Management Best Practices",
      description: "Comprehensive guide to implementing agile methodologies in enterprise environments",
      category: "methodology",
      source: "internal_wiki",
      relevance_score: 0.95,
      keywords: ["agile", "project management", "methodology", "productivity"],
      metadata: { department: "PMO", last_updated: "2024-01-01" },
      url: "/wiki/agile-best-practices",
      created_at: new Date().toISOString()
    },
    {
      id: "prod_002", 
      title: "Enterprise Task Automation Tools",
      description: "Overview of approved automation tools for streamlining business processes",
      category: "tools",
      source: "internal_knowledge_base",
      relevance_score: 0.88,
      keywords: ["automation", "tools", "productivity", "efficiency"],
      metadata: { department: "IT", approval_status: "approved" },
      url: "/kb/automation-tools",
      created_at: new Date().toISOString()
    }
  ],
  "mobile": [
    {
      id: "mobile_001",
      title: "Mobile App Development Standards",
      description: "Enterprise guidelines for developing mobile applications",
      category: "development",
      source: "tech_standards",
      relevance_score: 0.92,
      keywords: ["mobile", "app", "development", "standards"],
      metadata: { version: "2.1", compliance: "required" },
      url: "/standards/mobile-dev",
      created_at: new Date().toISOString()
    }
  ],
  "ai": [
    {
      id: "ai_001",
      title: "AI Implementation Framework",
      description: "Strategic approach to implementing AI solutions in enterprise",
      category: "strategy",
      source: "strategy_docs",
      relevance_score: 0.96,
      keywords: ["ai", "artificial intelligence", "implementation", "strategy"],
      metadata: { status: "active", priority: "high" },
      url: "/strategy/ai-framework",
      created_at: new Date().toISOString()
    }
  ]
}

/**
 * Calculate keyword relevance score based on match quality
 */
function calculateRelevanceScore(keywords: string[], queryKeywords: string[]): number {
  const querySet = new Set(queryKeywords.map(k => k.toLowerCase()))
  const keywordSet = new Set(keywords.map(k => k.toLowerCase()))
  
  let matches = 0
  let totalWeight = 0
  
  for (const keyword of keywordSet) {
    totalWeight += 1
    if (querySet.has(keyword)) {
      matches += 1
    }
    // Partial matches
    for (const queryKeyword of querySet) {
      if (keyword.includes(queryKeyword) || queryKeyword.includes(keyword)) {
        matches += 0.5
        break
      }
    }
  }
  
  return totalWeight > 0 ? Math.min(matches / totalWeight, 1.0) : 0
}

/**
 * Fetch data from external enterprise APIs (mock implementation)
 */
async function fetchFromExternalAPI(source: string, keywords: string[]): Promise<NormalizedData[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 100))
  
  const allData: NormalizedData[] = []
  
  // Search through mock data for relevant entries
  for (const [category, items] of Object.entries(mockEnterpriseData)) {
    for (const item of items) {
      const relevanceScore = calculateRelevanceScore(item.keywords, keywords)
      if (relevanceScore > 0.3) { // Threshold for relevance
        allData.push({
          ...item,
          relevance_score: relevanceScore
        })
      }
    }
  }
  
  // Sort by relevance
  return allData.sort((a, b) => b.relevance_score - a.relevance_score).slice(0, 20)
}

/**
 * Normalize and merge data from multiple sources
 */
function normalizeEnterpriseData(rawData: any[], source: string): NormalizedData[] {
  return rawData.map((item, index) => ({
    id: item.id || `${source}_${index}`,
    title: item.title || item.name || 'Untitled',
    description: item.description || item.summary || item.content || '',
    category: item.category || item.type || 'general',
    source,
    relevance_score: item.relevance_score || 0.5,
    keywords: item.keywords || item.tags || [],
    metadata: item.metadata || item.properties || {},
    url: item.url || item.link,
    created_at: item.created_at || new Date().toISOString()
  }))
}

serve(async (req) => {
  const { method } = req
  const corsHeaders = getCorsHeaders(req.headers.get('origin'))

  // Handle CORS preflight requests
  if (method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const supabase = getSupabaseClient()

  try {
    if (method === 'POST') {
      const body = await req.json()
      const { keywords, sources, useCache = true } = body

      // Validate input
      if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
        return new Response(
          JSON.stringify({ 
            error: 'Missing or invalid keywords field. Please provide an array of keywords.',
            success: false 
          }),
          { 
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          }
        )
      }

      const keywordQuery = keywords.join(', ')
      const requestedSources = sources || ['internal_wiki', 'knowledge_base', 'external_api']

      console.log('Fetching enterprise data for keywords:', keywords)

      // Check cache first if enabled
      if (useCache) {
        const { data: cachedData, error: cacheError } = await supabase
          .from('enterprise_data')
          .select('*')
          .eq('keyword_query', keywordQuery)
          .gt('cached_until', new Date().toISOString())
          .order('created_at', { ascending: false })
          .limit(1)

        if (!cacheError && cachedData && cachedData.length > 0) {
          console.log('Returning cached enterprise data')
          return new Response(
            JSON.stringify({ 
              data: cachedData[0],
              cached: true,
              success: true,
              message: 'Enterprise data retrieved from cache'
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          )
        }
      }

      // Fetch fresh data from multiple sources
      const allData: NormalizedData[] = []
      const fetchPromises: Promise<NormalizedData[]>[] = []

      for (const source of requestedSources) {
        fetchPromises.push(fetchFromExternalAPI(source, keywords))
      }

      try {
        const results = await Promise.allSettled(fetchPromises)
        
        results.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            const normalizedData = normalizeEnterpriseData(result.value, requestedSources[index])
            allData.push(...normalizedData)
          } else {
            console.error(`Failed to fetch from ${requestedSources[index]}:`, result.reason)
          }
        })
      } catch (error) {
        console.error('Error fetching from external sources:', error)
      }

      // Remove duplicates and calculate overall relevance
      const uniqueData = allData.reduce((acc, item) => {
        const existing = acc.find(existing => 
          existing.title === item.title || existing.id === item.id
        )
        if (!existing || item.relevance_score > existing.relevance_score) {
          if (existing) {
            const index = acc.indexOf(existing)
            acc[index] = item
          } else {
            acc.push(item)
          }
        }
        return acc
      }, [] as NormalizedData[])

      // Sort by relevance and limit results
      const sortedData = uniqueData
        .sort((a, b) => b.relevance_score - a.relevance_score)
        .slice(0, 50)

      // Calculate overall relevance score
      const overallRelevanceScore = sortedData.length > 0 
        ? sortedData.reduce((sum, item) => sum + item.relevance_score, 0) / sortedData.length
        : 0

      // Prepare data for caching
      const enterpriseDataRecord: Omit<EnterpriseDataRecord, 'id' | 'created_at' | 'updated_at'> = {
        keyword_query: keywordQuery,
        source: requestedSources.join(','),
        data: sortedData,
        relevance_score: overallRelevanceScore,
        fetched_at: new Date().toISOString(),
        cached_until: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
      }

      // Save to cache
      const { data: savedData, error: saveError } = await supabase
        .from('enterprise_data')
        .insert(enterpriseDataRecord)
        .select()

      if (saveError) {
        console.error('Failed to cache enterprise data:', saveError)
        // Continue without caching
      }

      const responseData = savedData && savedData.length > 0 ? savedData[0] : enterpriseDataRecord

      return new Response(
        JSON.stringify({ 
          data: responseData,
          cached: false,
          results_count: sortedData.length,
          success: true,
          message: 'Enterprise data fetched and normalized successfully'
        }),
        { 
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      )
    }

    // GET - Retrieve cached enterprise data
    if (method === 'GET') {
      const url = new URL(req.url)
      const keywords = url.searchParams.get('keywords')
      const limit = parseInt(url.searchParams.get('limit') || '10')

      let query = supabase
        .from('enterprise_data')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)

      if (keywords) {
        query = query.ilike('keyword_query', `%${keywords}%`)
      }

      const { data, error } = await query

      if (error) {
        throw new Error(`Failed to retrieve enterprise data: ${error.message}`)
      }

      return new Response(
        JSON.stringify({ 
          data,
          count: data.length,
          success: true 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    return new Response(
      JSON.stringify({ 
        error: 'Method not allowed. Use POST to fetch enterprise data or GET to retrieve cached data.',
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