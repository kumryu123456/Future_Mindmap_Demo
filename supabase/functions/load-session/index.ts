import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "../_shared/cors.js"
import { getSupabaseClient } from "../_shared/supabase.js"

console.log("Load Session Function initialized!")

interface MindmapNode {
  id: string
  title: string
  content: string
  x: number
  y: number
  selected?: boolean
  parent_id?: string
  metadata?: Record<string, any>
}

interface Connection {
  from: string
  to: string
  type: 'hierarchical' | 'associative' | 'dependency' | 'similarity'
  metadata?: Record<string, any>
}

interface ViewportState {
  zoom: number
  center_x: number
  center_y: number
  viewport_width?: number
  viewport_height?: number
}

interface UIPreferences {
  theme: 'light' | 'dark' | 'auto'
  auto_save?: boolean
  show_grid?: boolean
  snap_to_grid?: boolean
  node_style?: 'modern' | 'minimal' | 'classic'
  connection_style?: 'curved' | 'straight' | 'orthogonal'
  sidebar_collapsed?: boolean
  minimap_visible?: boolean
  toolbar_position?: 'top' | 'bottom' | 'left' | 'right'
}

interface SessionData {
  mindmap_nodes: MindmapNode[]
  connections: Connection[]
  user_inputs: string[]
  current_plan_id?: string | null
  last_expansion?: {
    parent_node: string
    expansion_type: string
    timestamp: string
  } | null
  enriched_nodes?: string[]
  session_metadata?: Record<string, any>
}

interface SessionResponse {
  id: string
  session_id: string
  user_id?: string | null
  session_name?: string
  session_data: SessionData
  viewport_state: ViewportState
  ui_preferences: UIPreferences
  last_activity: string
  expires_at: string
  is_active: boolean
  created_at: string
  updated_at: string
}

interface LoadSessionRequest {
  sessionId: string
  updateActivity?: boolean
  validateNodes?: boolean
  includeRelated?: boolean
}

interface SessionMetrics {
  nodes_count: number
  connections_count: number
  user_inputs_count: number
  session_age_days: number
  last_activity_hours_ago: number
  is_expired: boolean
  has_plan: boolean
  enriched_nodes_count: number
}

interface LoadSessionResponse {
  session: SessionResponse
  metrics: SessionMetrics
  validation_results?: {
    missing_nodes: string[]
    orphaned_connections: string[]
    invalid_references: string[]
  }
  related_data?: {
    current_plan?: any
    enriched_content?: any[]
    recent_expansions?: any[]
  }
}

/**
 * Validate session data integrity
 */
function validateSessionData(sessionData: SessionData): {
  isValid: boolean
  missing_nodes: string[]
  orphaned_connections: string[]
  invalid_references: string[]
} {
  const nodeIds = new Set(sessionData.mindmap_nodes.map(node => node.id))
  const missing_nodes: string[] = []
  const orphaned_connections: string[] = []
  const invalid_references: string[] = []

  // Check connections reference valid nodes
  sessionData.connections.forEach(conn => {
    if (!nodeIds.has(conn.from)) {
      missing_nodes.push(conn.from)
      orphaned_connections.push(`${conn.from} -> ${conn.to}`)
    }
    if (!nodeIds.has(conn.to)) {
      missing_nodes.push(conn.to)
      orphaned_connections.push(`${conn.from} -> ${conn.to}`)
    }
  })

  // Check parent_id references
  sessionData.mindmap_nodes.forEach(node => {
    if (node.parent_id && !nodeIds.has(node.parent_id)) {
      invalid_references.push(`Node ${node.id} references missing parent ${node.parent_id}`)
    }
  })

  return {
    isValid: missing_nodes.length === 0 && invalid_references.length === 0,
    missing_nodes: [...new Set(missing_nodes)],
    orphaned_connections: [...new Set(orphaned_connections)],
    invalid_references
  }
}

/**
 * Calculate session metrics
 */
function calculateSessionMetrics(session: SessionResponse): SessionMetrics {
  const sessionData = session.session_data
  const now = new Date()
  const createdAt = new Date(session.created_at)
  const lastActivity = new Date(session.last_activity)
  const expiresAt = new Date(session.expires_at)

  const sessionAgeDays = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24))
  const lastActivityHoursAgo = Math.floor((now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60))

  return {
    nodes_count: sessionData.mindmap_nodes?.length || 0,
    connections_count: sessionData.connections?.length || 0,
    user_inputs_count: sessionData.user_inputs?.length || 0,
    session_age_days: sessionAgeDays,
    last_activity_hours_ago: lastActivityHoursAgo,
    is_expired: now > expiresAt,
    has_plan: !!sessionData.current_plan_id,
    enriched_nodes_count: sessionData.enriched_nodes?.length || 0
  }
}

/**
 * Update session activity timestamp
 */
async function updateSessionActivity(supabase: any, sessionId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('user_sessions')
      .update({ 
        last_activity: new Date().toISOString()
      })
      .eq('session_id', sessionId)

    if (error) {
      console.error('Failed to update session activity:', error)
    }
  } catch (error) {
    console.error('Error updating session activity:', error)
  }
}

/**
 * Fetch related data for session
 */
async function fetchRelatedData(supabase: any, sessionData: SessionData): Promise<{
  current_plan?: any
  enriched_content?: any[]
  recent_expansions?: any[]
}> {
  const relatedData: any = {}

  try {
    // Fetch current plan if exists
    if (sessionData.current_plan_id) {
      const { data: planData, error: planError } = await supabase
        .from('plans')
        .select('id, title, description, objective, metadata')
        .eq('id', sessionData.current_plan_id)
        .single()

      if (!planError && planData) {
        relatedData.current_plan = planData
      }
    }

    // Fetch enriched content for nodes
    if (sessionData.enriched_nodes && sessionData.enriched_nodes.length > 0) {
      const { data: enrichedData, error: enrichedError } = await supabase
        .from('embeddings')
        .select('content_id, metadata')
        .eq('content_type', 'mindmap_node_enriched')
        .in('content_id', sessionData.enriched_nodes)

      if (!enrichedError && enrichedData) {
        relatedData.enriched_content = enrichedData.map(item => ({
          node_id: item.content_id,
          enriched_content: item.metadata?.enriched_content,
          cached_until: item.metadata?.cached_until
        }))
      }
    }

    // Fetch recent expansions for session nodes
    const nodeIds = sessionData.mindmap_nodes.map(node => node.id)
    if (nodeIds.length > 0) {
      const { data: expansionsData, error: expansionsError } = await supabase
        .from('node_expansions')
        .select('parent_node_id, expansion_context, generated_children, created_at')
        .in('parent_node_id', nodeIds)
        .order('created_at', { ascending: false })
        .limit(5)

      if (!expansionsError && expansionsData) {
        relatedData.recent_expansions = expansionsData
      }
    }
  } catch (error) {
    console.error('Error fetching related data:', error)
  }

  return relatedData
}

/**
 * Migrate or repair session data if needed
 */
function migrateSessionData(sessionData: SessionData): SessionData {
  // Ensure all required fields exist with defaults
  const migrated: SessionData = {
    mindmap_nodes: sessionData.mindmap_nodes || [],
    connections: sessionData.connections || [],
    user_inputs: sessionData.user_inputs || [],
    current_plan_id: sessionData.current_plan_id || null,
    last_expansion: sessionData.last_expansion || null,
    enriched_nodes: sessionData.enriched_nodes || [],
    session_metadata: sessionData.session_metadata || {}
  }

  // Ensure all nodes have required fields
  migrated.mindmap_nodes = migrated.mindmap_nodes.map(node => ({
    id: node.id,
    title: node.title || 'Untitled Node',
    content: node.content || '',
    x: typeof node.x === 'number' ? node.x : 0,
    y: typeof node.y === 'number' ? node.y : 0,
    selected: Boolean(node.selected),
    parent_id: node.parent_id || undefined,
    metadata: node.metadata || {}
  }))

  // Ensure all connections have required fields
  migrated.connections = migrated.connections.map(conn => ({
    from: conn.from,
    to: conn.to,
    type: ['hierarchical', 'associative', 'dependency', 'similarity'].includes(conn.type) 
      ? conn.type 
      : 'hierarchical',
    metadata: conn.metadata || {}
  }))

  return migrated
}

serve(async (req) => {
  const { method } = req

  // Handle CORS preflight requests
  if (method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const supabase = getSupabaseClient()

  // 🔧 FIX: Shared helper function to eliminate code duplication
  async function processSessionRequest(
    sessionId: string,
    updateActivity: boolean,
    validateNodes: boolean,
    includeRelated: boolean
  ): Promise<Response> {
    // Fetch session from database
    const { data: sessionData, error: sessionError } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('session_id', sessionId.trim())
      .single()

    if (sessionError) {
      if (sessionError.code === 'PGRST116') { // No rows returned
        return new Response(
          JSON.stringify({ 
            error: 'Session not found',
            success: false 
          }),
          { 
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          }
        )
      } else {
        console.error('Database error fetching session:', sessionError)
        return new Response(
          JSON.stringify({ 
            error: `Failed to load session: ${sessionError.message}`,
            success: false 
          }),
          { 
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          }
        )
      }
    }

    const session: SessionResponse = sessionData

    // Migrate/repair session data if needed
    session.session_data = migrateSessionData(session.session_data)

    // Calculate session metrics
    const metrics = calculateSessionMetrics(session)

    // Prepare response
    const response: LoadSessionResponse = {
      session,
      metrics
    }

    // Validate session data integrity if requested
    if (validateNodes) {
      const validation = validateSessionData(session.session_data)
      response.validation_results = {
        missing_nodes: validation.missing_nodes,
        orphaned_connections: validation.orphaned_connections,
        invalid_references: validation.invalid_references
      }
    }

    // Fetch related data if requested
    if (includeRelated) {
      response.related_data = await fetchRelatedData(supabase, session.session_data)
    }

    // Update activity timestamp if requested
    if (updateActivity && !metrics.is_expired) {
      await updateSessionActivity(supabase, sessionId)
      // Update the response with new activity time
      response.session.last_activity = new Date().toISOString()
    }

    // Check if session is expired and mark as warning
    let statusCode = 200
    let message = 'Session loaded successfully'
    
    if (metrics.is_expired) {
      message += ' (Warning: Session has expired)'
    }

    return new Response(
      JSON.stringify({ 
        data: response,
        success: true,
        message
      }),
      { 
        status: statusCode,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    )
  }

  try {
    if (method === 'POST') {
      const body: LoadSessionRequest = await req.json()
      const { 
        sessionId,
        updateActivity = true,
        validateNodes = true,
        includeRelated = false
      } = body

      // Validate required fields
      if (!sessionId || typeof sessionId !== 'string' || sessionId.trim().length === 0) {
        return new Response(
          JSON.stringify({ 
            error: 'sessionId is required and must be a non-empty string',
            success: false 
          }),
          { 
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          }
        )
      }

      console.log(`Loading session: ${sessionId}`)
      return await processSessionRequest(sessionId, updateActivity, validateNodes, includeRelated)
    }

    // GET - Simple session loading via query params
    if (method === 'GET') {
      const url = new URL(req.url)
      const sessionId = url.searchParams.get('sessionId')
      const updateActivity = url.searchParams.get('updateActivity') !== 'false'
      const validateNodes = url.searchParams.get('validateNodes') !== 'false'
      const includeRelated = url.searchParams.get('includeRelated') === 'true'

      if (!sessionId) {
        return new Response(
          JSON.stringify({ 
            error: 'sessionId query parameter is required',
            success: false 
          }),
          { 
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          }
        )
      }

      console.log(`Loading session via GET: ${sessionId}`)
      return await processSessionRequest(sessionId, updateActivity, validateNodes, includeRelated)
    }

    return new Response(
      JSON.stringify({ 
        error: 'Method not allowed. Use POST with request body or GET with query parameters to load a session.',
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