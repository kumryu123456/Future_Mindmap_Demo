import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { getCorsHeaders } from "../_shared/cors.js"
import { getSupabaseClient } from "../_shared/supabase.js"

console.log("Save Session Function initialized!")

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

interface SaveSessionRequest {
  sessionId: string
  userId?: string | null
  sessionName?: string
  sessionData: SessionData
  viewportState?: ViewportState
  uiPreferences?: UIPreferences
  expiresInDays?: number
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

/**
 * Validate session data structure
 */
function validateSessionData(sessionData: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!sessionData || typeof sessionData !== 'object') {
    errors.push('Session data must be an object')
    return { isValid: false, errors }
  }

  // Validate mindmap_nodes
  if (!Array.isArray(sessionData.mindmap_nodes)) {
    errors.push('mindmap_nodes must be an array')
  } else {
    sessionData.mindmap_nodes.forEach((node: any, index: number) => {
      if (!node.id || typeof node.id !== 'string') {
        errors.push(`mindmap_nodes[${index}]: missing or invalid id`)
      }
      if (!node.title || typeof node.title !== 'string') {
        errors.push(`mindmap_nodes[${index}]: missing or invalid title`)
      }
      if (typeof node.x !== 'number' || typeof node.y !== 'number') {
        errors.push(`mindmap_nodes[${index}]: x and y coordinates must be numbers`)
      }
    })
  }

  // Validate connections
  if (!Array.isArray(sessionData.connections)) {
    errors.push('connections must be an array')
  } else {
    sessionData.connections.forEach((conn: any, index: number) => {
      if (!conn.from || !conn.to) {
        errors.push(`connections[${index}]: missing from or to field`)
      }
      if (!['hierarchical', 'associative', 'dependency', 'similarity'].includes(conn.type)) {
        errors.push(`connections[${index}]: invalid connection type`)
      }
    })
  }

  // Validate user_inputs
  if (!Array.isArray(sessionData.user_inputs)) {
    errors.push('user_inputs must be an array')
  }

  return { isValid: errors.length === 0, errors }
}

/**
 * Validate viewport state
 */
function validateViewportState(viewportState: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  if (viewportState && typeof viewportState === 'object') {
    if (typeof viewportState.zoom !== 'number' || viewportState.zoom <= 0) {
      errors.push('viewport zoom must be a positive number')
    }
    if (typeof viewportState.center_x !== 'number') {
      errors.push('viewport center_x must be a number')
    }
    if (typeof viewportState.center_y !== 'number') {
      errors.push('viewport center_y must be a number')
    }
  }

  return { isValid: errors.length === 0, errors }
}

/**
 * Sanitize session data to prevent XSS and data injection
 */
function sanitizeSessionData(sessionData: SessionData): SessionData {
  // Create a deep copy to avoid mutating the original
  const sanitized = JSON.parse(JSON.stringify(sessionData))

  // Sanitize mindmap nodes
  if (Array.isArray(sanitized.mindmap_nodes)) {
    sanitized.mindmap_nodes = sanitized.mindmap_nodes.map((node: MindmapNode) => ({
      id: String(node.id).trim(),
      title: String(node.title).trim().slice(0, 500), // Limit title length
      content: String(node.content).trim().slice(0, 5000), // Limit content length
      x: Number(node.x) || 0,
      y: Number(node.y) || 0,
      selected: Boolean(node.selected),
      parent_id: node.parent_id ? String(node.parent_id).trim() : undefined,
      metadata: node.metadata && typeof node.metadata === 'object' ? node.metadata : {}
    }))
  }

  // Sanitize connections
  if (Array.isArray(sanitized.connections)) {
    sanitized.connections = sanitized.connections.map((conn: Connection) => ({
      from: String(conn.from).trim(),
      to: String(conn.to).trim(),
      type: ['hierarchical', 'associative', 'dependency', 'similarity'].includes(conn.type) 
        ? conn.type 
        : 'hierarchical',
      metadata: conn.metadata && typeof conn.metadata === 'object' ? conn.metadata : {}
    }))
  }

  // Sanitize user inputs
  if (Array.isArray(sanitized.user_inputs)) {
    sanitized.user_inputs = sanitized.user_inputs
      .map((input: string) => String(input).trim())
      .filter((input: string) => input.length > 0)
      .slice(0, 100) // Limit number of inputs
  }

  // Sanitize other fields
  if (sanitized.current_plan_id) {
    sanitized.current_plan_id = String(sanitized.current_plan_id).trim()
  }

  if (Array.isArray(sanitized.enriched_nodes)) {
    sanitized.enriched_nodes = sanitized.enriched_nodes
      .map((nodeId: string) => String(nodeId).trim())
      .filter((nodeId: string) => nodeId.length > 0)
  }

  return sanitized
}

/**
 * Set default viewport state
 */
function getDefaultViewportState(): ViewportState {
  return {
    zoom: 1.0,
    center_x: 0,
    center_y: 0,
    viewport_width: 1920,
    viewport_height: 1080
  }
}

/**
 * Set default UI preferences
 */
function getDefaultUIPreferences(): UIPreferences {
  return {
    theme: 'light',
    auto_save: true,
    show_grid: true,
    snap_to_grid: false,
    node_style: 'modern',
    connection_style: 'curved',
    sidebar_collapsed: false,
    minimap_visible: true,
    toolbar_position: 'top'
  }
}

/**
 * Calculate session expiration date
 */
function calculateExpirationDate(expiresInDays: number = 30): string {
  const expirationDate = new Date()
  expirationDate.setDate(expirationDate.getDate() + expiresInDays)
  return expirationDate.toISOString()
}

serve(async (req) => {
  const { method } = req

  // Handle CORS preflight requests
  if (method === 'OPTIONS') {
    const origin = req.headers.get('Origin')
    const corsHeaders = getCorsHeaders(origin)
    return new Response('ok', { headers: corsHeaders })
  }

  const supabase = getSupabaseClient()

  try {
    if (method === 'POST') {
      const body: SaveSessionRequest = await req.json()
      const { 
        sessionId,
        userId = null,
        sessionName,
        sessionData,
        viewportState,
        uiPreferences,
        expiresInDays = 30
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
            headers: { ...getCorsHeaders(req.headers.get('Origin')), "Content-Type": "application/json" }
          }
        )
      }

      if (!sessionData) {
        return new Response(
          JSON.stringify({ 
            error: 'sessionData is required',
            success: false 
          }),
          { 
            status: 400,
            headers: { ...getCorsHeaders(req.headers.get('Origin')), "Content-Type": "application/json" }
          }
        )
      }

      // Validate session data structure
      const sessionValidation = validateSessionData(sessionData)
      if (!sessionValidation.isValid) {
        return new Response(
          JSON.stringify({ 
            error: 'Invalid session data structure',
            validation_errors: sessionValidation.errors,
            success: false 
          }),
          { 
            status: 400,
            headers: { ...getCorsHeaders(req.headers.get('Origin')), "Content-Type": "application/json" }
          }
        )
      }

      // Validate viewport state if provided
      if (viewportState) {
        const viewportValidation = validateViewportState(viewportState)
        if (!viewportValidation.isValid) {
          return new Response(
            JSON.stringify({ 
              error: 'Invalid viewport state',
              validation_errors: viewportValidation.errors,
              success: false 
            }),
            { 
              status: 400,
              headers: { ...getCorsHeaders(req.headers.get('Origin')), "Content-Type": "application/json" }
            }
          )
        }
      }

      console.log(`Saving session: ${sessionId}`)

      // Sanitize and prepare data
      const sanitizedSessionData = sanitizeSessionData(sessionData)
      const finalViewportState = viewportState ? { ...getDefaultViewportState(), ...viewportState } : getDefaultViewportState()
      const finalUIPreferences = uiPreferences ? { ...getDefaultUIPreferences(), ...uiPreferences } : getDefaultUIPreferences()
      const expirationDate = calculateExpirationDate(expiresInDays)

      // Prepare upsert data
      const sessionRecord = {
        session_id: sessionId.trim(),
        user_id: userId,
        session_name: sessionName ? sessionName.trim().slice(0, 200) : null,
        session_data: sanitizedSessionData,
        viewport_state: finalViewportState,
        ui_preferences: finalUIPreferences,
        expires_at: expirationDate,
        is_active: true
      }

      // Upsert session data
      const { data, error } = await supabase
        .from('user_sessions')
        .upsert(sessionRecord, {
          onConflict: 'session_id',
          ignoreDuplicates: false
        })
        .select()

      if (error) {
        console.error('Failed to save session:', error)
        return new Response(
          JSON.stringify({ 
            error: `Failed to save session: ${error.message}`,
            success: false 
          }),
          { 
            status: 500,
            headers: { ...getCorsHeaders(req.headers.get('Origin')), "Content-Type": "application/json" }
          }
        )
      }

      const savedSession = data[0] as SessionResponse

      return new Response(
        JSON.stringify({ 
          data: savedSession,
          success: true,
          message: 'Session saved successfully'
        }),
        { 
          status: 200,
          headers: { ...getCorsHeaders(req.headers.get('Origin')), "Content-Type": "application/json" }
        }
      )
    }

    // GET - Retrieve session(s)
    if (method === 'GET') {
      const url = new URL(req.url)
      const sessionId = url.searchParams.get('sessionId')
      const userId = url.searchParams.get('userId')
      const includeExpired = url.searchParams.get('includeExpired') === 'true'
      const limit = parseInt(url.searchParams.get('limit') || '10')

      let query = supabase
        .from('user_sessions')
        .select('*')

      if (sessionId) {
        // Get specific session
        query = query.eq('session_id', sessionId)
      } else if (userId) {
        // Get sessions for specific user
        query = query
          .eq('user_id', userId)
          .order('last_activity', { ascending: false })
          .limit(limit)
      } else {
        // Get recent sessions
        query = query
          .order('last_activity', { ascending: false })
          .limit(limit)
      }

      // Filter out expired sessions unless explicitly requested
      if (!includeExpired) {
        query = query.eq('is_active', true)
      }

      const { data, error } = await query

      if (error) {
        console.error('Failed to retrieve sessions:', error)
        return new Response(
          JSON.stringify({ 
            error: `Failed to retrieve sessions: ${error.message}`,
            success: false 
          }),
          { 
            status: 500,
            headers: { ...getCorsHeaders(req.headers.get('Origin')), "Content-Type": "application/json" }
          }
        )
      }

      // If requesting a specific session, return single object or null
      if (sessionId) {
        const session = data && data.length > 0 ? data[0] : null
        return new Response(
          JSON.stringify({ 
            data: session,
            success: true 
          }),
          { headers: { ...getCorsHeaders(req.headers.get('Origin')), "Content-Type": "application/json" } }
        )
      }

      return new Response(
        JSON.stringify({ 
          data,
          count: data.length,
          success: true 
        }),
        { headers: { ...getCorsHeaders(req.headers.get('Origin')), "Content-Type": "application/json" } }
      )
    }

    // DELETE - Delete session(s)
    if (method === 'DELETE') {
      const url = new URL(req.url)
      const sessionId = url.searchParams.get('sessionId')
      const userId = url.searchParams.get('userId')
      const deleteExpired = url.searchParams.get('deleteExpired') === 'true'

      if (deleteExpired) {
        // Cleanup expired sessions
        const { error: cleanupError } = await supabase.rpc('cleanup_expired_sessions')
        
        if (cleanupError) {
          console.error('Failed to cleanup expired sessions:', cleanupError)
          return new Response(
            JSON.stringify({ 
              error: `Failed to cleanup expired sessions: ${cleanupError.message}`,
              success: false 
            }),
            { 
              status: 500,
              headers: { ...getCorsHeaders(req.headers.get('Origin')), "Content-Type": "application/json" }
            }
          )
        }

        return new Response(
          JSON.stringify({ 
            success: true,
            message: 'Expired sessions cleaned up successfully'
          }),
          { headers: { ...getCorsHeaders(req.headers.get('Origin')), "Content-Type": "application/json" } }
        )
      }

      if (!sessionId && !userId) {
        return new Response(
          JSON.stringify({ 
            error: 'sessionId or userId is required for deletion',
            success: false 
          }),
          { 
            status: 400,
            headers: { ...getCorsHeaders(req.headers.get('Origin')), "Content-Type": "application/json" }
          }
        )
      }

      let deleteQuery = supabase.from('user_sessions').delete()

      if (sessionId) {
        deleteQuery = deleteQuery.eq('session_id', sessionId)
      } else if (userId) {
        deleteQuery = deleteQuery.eq('user_id', userId)
      }

      const { error } = await deleteQuery

      if (error) {
        console.error('Failed to delete session(s):', error)
        return new Response(
          JSON.stringify({ 
            error: `Failed to delete session(s): ${error.message}`,
            success: false 
          }),
          { 
            status: 500,
            headers: { ...getCorsHeaders(req.headers.get('Origin')), "Content-Type": "application/json" }
          }
        )
      }

      return new Response(
        JSON.stringify({ 
          success: true,
          message: 'Session(s) deleted successfully'
        }),
        { headers: { ...getCorsHeaders(req.headers.get('Origin')), "Content-Type": "application/json" } }
      )
    }

    return new Response(
      JSON.stringify({ 
        error: 'Method not allowed. Use POST to save, GET to retrieve, or DELETE to remove sessions.',
        success: false 
      }),
      { 
        status: 405,
        headers: { ...getCorsHeaders(req.headers.get('Origin')), "Content-Type": "application/json" }
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
        headers: { ...getCorsHeaders(req.headers.get('Origin')), "Content-Type": "application/json" }
      }
    )
  }
})