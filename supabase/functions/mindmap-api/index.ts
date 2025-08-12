// @ts-expect-error Deno std library types not available in current TypeScript config
import { serve } from "https://deno.land/std@0.224.0/http/server.ts"
import { getCorsHeaders } from "../_shared/cors.js"
import { getSupabaseClient } from "../_shared/supabase.js"
import { rateLimit, addRateLimitHeaders } from "../_shared/rate-limiter.js"
import { createLogger } from "../_shared/logger.js"
import { withMetrics } from "../_shared/metrics.js"

const logger = createLogger('MindmapAPI')
logger.info('Mindmap API Function initialized!')

// 🔧 FIX: Extract UUID validation regex as constant
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// Enhanced input validation functions
function validateNodeInput(node: Record<string, unknown>, isPartialUpdate: boolean = false): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  
  // Required fields validation (only for full creates, not partial updates)
  if (!isPartialUpdate) {
    if (!node.title || typeof node.title !== 'string') {
      errors.push('title is required and must be a string')
    } else if (node.title.trim().length === 0) {
      errors.push('title cannot be empty')
    }
  }
  
  // Optional field validation (applies to both creates and updates if field is present)
  if (node.title !== undefined) {
    if (typeof node.title !== 'string') {
      errors.push('title must be a string')
    } else if (node.title.trim().length === 0) {
      errors.push('title cannot be empty')
    } else if (node.title.length > 500) {
      errors.push('title must be less than 500 characters')
    }
  }
  
  if (node.content !== undefined) {
    if (typeof node.content !== 'string') {
      errors.push('content must be a string if provided')
    } else if (node.content.length > 5000) {
      errors.push('content must be less than 5000 characters')
    }
  }
  
  // Coordinate validation (if present)
  if (node.x !== undefined && (typeof node.x !== 'number' || !isFinite(node.x))) {
    errors.push('x coordinate must be a finite number')
  }
  
  if (node.y !== undefined && (typeof node.y !== 'number' || !isFinite(node.y))) {
    errors.push('y coordinate must be a finite number')
  }
  
  // Parent ID validation (if present)
  if (node.parent_id !== undefined) {
    if (node.parent_id !== null && typeof node.parent_id !== 'string') {
      errors.push('parent_id must be a string or null')
    } else if (node.parent_id && !UUID_REGEX.test(node.parent_id)) {
      errors.push('parent_id must be a valid UUID')
    }
  }
  
  return { isValid: errors.length === 0, errors }
}

// Removed unused hasKoreanText function

/**
 * HTML entity escaping function
 */
function escapeHtml(text: string): string {
  const entityMap: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }
  return text.replace(/[&<>"']/g, (char) => entityMap[char] || char)
}

/**
 * Sanitize node input to prevent XSS and ensure data quality
 */
function sanitizeNodeInput(node: Record<string, unknown>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {}
  
  // Sanitize title with UTF-8 preservation and HTML entity encoding
  if (node.title !== undefined) {
    // Ensure proper UTF-8 string conversion and normalize Unicode
    const cleanTitle = String(node.title)
      .normalize('NFC') // Normalize Unicode for consistent storage
      .trim()
      .slice(0, 500) // Enforce length limit
    
    sanitized.title = escapeHtml(cleanTitle)
  }
  
  // Sanitize content with UTF-8 preservation and HTML entity encoding
  if (node.content !== undefined) {
    const cleanContent = String(node.content)
      .normalize('NFC') // Normalize Unicode for consistent storage
      .trim()
      .slice(0, 5000) // Enforce length limit
    
    sanitized.content = escapeHtml(cleanContent)
  }
  
  // Sanitize coordinates
  if (node.x !== undefined) {
    const x = Number(node.x)
    sanitized.x = isFinite(x) ? Math.max(-50000, Math.min(50000, x)) : 0
  }
  
  if (node.y !== undefined) {
    const y = Number(node.y)
    sanitized.y = isFinite(y) ? Math.max(-50000, Math.min(50000, y)) : 0
  }
  
  // Sanitize parent_id
  if (node.parent_id !== undefined) {
    if (node.parent_id === null) {
      sanitized.parent_id = null
    } else if (typeof node.parent_id === 'string' && node.parent_id.trim().length > 0) {
      // Validate UUID format
      if (UUID_REGEX.test(node.parent_id.trim())) {
        sanitized.parent_id = node.parent_id.trim()
      } else {
        sanitized.parent_id = null // Invalid UUID format
      }
    } else {
      sanitized.parent_id = null
    }
  }
  
  return sanitized
}

interface MindmapNode {
  id: string
  title: string
  content: string
  x: number
  y: number
  parent_id?: string | null
  level?: number
  type?: string
  created_at?: string
  updated_at?: string
}

serve(async (req: Request) => {
  return withMetrics(req, async () => {
    const { method, url } = req
    const urlObj = new URL(url)
    const path = urlObj.pathname
    
    // Extract origin once at the top for reuse
    const origin = req.headers.get('Origin') || undefined
    const corsHeaders = getCorsHeaders(origin)

    // Handle CORS preflight requests with dynamic origin-based headers
    if (method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders })
    }

    const supabase = getSupabaseClient()

    try {
      // 🔧 FIX: GET - Retrieve all mindmap nodes with path verification
      if (method === 'GET' && path === '/mindmap-api') {
        // Apply rate limiting
        const rateLimitResult = rateLimit('general')(req)
        if (!rateLimitResult.allowed) {
          return rateLimitResult.response!
        }

        // Get all mindmap nodes
        const result = await supabase
          .from('mindmap_nodes')
          .select('*')
          .order('created_at', { ascending: false })
        
        const { data, error } = result

        if (error) {
          logger.error('Database error retrieving mindmap nodes', error)
          throw new Error(`Failed to retrieve nodes: ${error.message}`)
        }

        logger.info('Mindmap nodes retrieved successfully', { count: data.length })
        
        const response = new Response(
          JSON.stringify({ 
            data,
            count: data.length,
            success: true 
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8" } }
        )
        
        return addRateLimitHeaders(response, rateLimitResult.info)
      }

      // POST - Create a new mindmap node
      if (method === 'POST') {
        // Apply rate limiting
        const rateLimitResult = rateLimit('general')(req)
        if (!rateLimitResult.allowed) {
          return rateLimitResult.response!
        }

        const body = await req.json()

        // 🔧 FIX: Apply input sanitization to prevent XSS and ensure data quality
        const sanitizedInput = sanitizeNodeInput(body)
        
        // Validate sanitized input
        const validation = validateNodeInput(sanitizedInput)
        if (!validation.isValid) {
          return new Response(
            JSON.stringify({
              error: 'Validation failed',
              details: validation.errors,
              success: false
            }),
            { 
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8" }
            }
          )
        }

        // Insert new mindmap node
        const result = await supabase
          .from('mindmap_nodes')
          .insert({
            title: sanitizedInput.title,
            content: sanitizedInput.content || '',
            x: sanitizedInput.x || 0,
            y: sanitizedInput.y || 0,
            parent_id: sanitizedInput.parent_id || null,
            level: sanitizedInput.level || 0,
            type: sanitizedInput.type || 'default'
          })
          .select()
        
        const { data, error } = result

        if (error) {
          logger.error('Database error creating mindmap node', error)
          throw new Error(`Failed to create node: ${error.message}`)
        }

        const newNode = Array.isArray(data) ? data[0] : data as MindmapNode
        logger.info('Mindmap node created successfully', { 
          id: newNode.id,
          title: newNode.title 
        })

        const response = new Response(
          JSON.stringify({ 
            data: newNode,
            success: true,
            message: 'Node created successfully'
          }),
          { 
            status: 201,
            headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8" }
          }
        )
        
        return addRateLimitHeaders(response, rateLimitResult.info)
      }

      // PUT - Update a mindmap node
      if (method === 'PUT') {
        // Apply rate limiting
        const rateLimitResult = rateLimit('general')(req)
        if (!rateLimitResult.allowed) {
          return rateLimitResult.response!
        }

        // Extract ID from path
        const pathParts = path.split('/')
        const nodeId = pathParts[pathParts.length - 1]

        if (!nodeId || !UUID_REGEX.test(nodeId)) {
          return new Response(
            JSON.stringify({
              error: 'Invalid or missing node ID in path',
              success: false
            }),
            { 
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8" }
            }
          )
        }

        const body = await req.json()

        // 🔧 FIX: Apply input sanitization for updates
        const sanitizedInput = sanitizeNodeInput(body)

        // Validate sanitized input (partial update)
        const validation = validateNodeInput(sanitizedInput, true)
        if (!validation.isValid) {
          return new Response(
            JSON.stringify({
              error: 'Validation failed',
              details: validation.errors,
              success: false
            }),
            { 
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8" }
            }
          )
        }

        // Prepare update data with sanitized values (only include fields that are present)
        const updateData: Partial<MindmapNode> = {}
        if (sanitizedInput.title !== undefined && typeof sanitizedInput.title === 'string') {
          updateData.title = sanitizedInput.title
        }
        if (sanitizedInput.content !== undefined && typeof sanitizedInput.content === 'string') {
          updateData.content = sanitizedInput.content
        }
        if (sanitizedInput.x !== undefined && typeof sanitizedInput.x === 'number') {
          updateData.x = sanitizedInput.x
        }
        if (sanitizedInput.y !== undefined && typeof sanitizedInput.y === 'number') {
          updateData.y = sanitizedInput.y
        }
        if (sanitizedInput.parent_id !== undefined && (typeof sanitizedInput.parent_id === 'string' || sanitizedInput.parent_id === null)) {
          updateData.parent_id = sanitizedInput.parent_id
        }
        if (sanitizedInput.level !== undefined && typeof sanitizedInput.level === 'number') {
          updateData.level = sanitizedInput.level
        }
        if (sanitizedInput.type !== undefined && typeof sanitizedInput.type === 'string') {
          updateData.type = sanitizedInput.type
        }

        const { data, error } = await supabase
          .from('mindmap_nodes')
          .update(updateData)
          .eq('id', nodeId)
          .select()

        if (error) {
          logger.error('Database error updating mindmap node', error, { nodeId })
          throw new Error(`Failed to update node: ${error.message}`)
        }

        if (!data || data.length === 0) {
          return new Response(
            JSON.stringify({
              error: 'Node not found',
              success: false
            }),
            { 
              status: 404,
              headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8" }
            }
          )
        }

        const updatedNode = data[0] as MindmapNode
        logger.info('Mindmap node updated successfully', { 
          id: updatedNode.id,
          title: updatedNode.title 
        })

        const response = new Response(
          JSON.stringify({ 
            data: updatedNode,
            success: true,
            message: 'Node updated successfully'
          }),
          { 
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8" }
          }
        )
        
        return addRateLimitHeaders(response, rateLimitResult.info)
      }

      // DELETE - Delete a mindmap node
      if (method === 'DELETE') {
        // Apply rate limiting
        const rateLimitResult = rateLimit('general')(req)
        if (!rateLimitResult.allowed) {
          return rateLimitResult.response!
        }

        // Extract ID from path
        const pathParts = path.split('/')
        const nodeId = pathParts[pathParts.length - 1]

        if (!nodeId || !UUID_REGEX.test(nodeId)) {
          return new Response(
            JSON.stringify({
              error: 'Invalid or missing node ID in path',
              success: false
            }),
            { 
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8" }
            }
          )
        }

        const { data, error } = await supabase
          .from('mindmap_nodes')
          .delete()
          .eq('id', nodeId)
          .select()

        if (error) {
          logger.error('Database error deleting mindmap node', error, { nodeId })
          throw new Error(`Failed to delete node: ${error.message}`)
        }

        if (!data || data.length === 0) {
          return new Response(
            JSON.stringify({
              error: 'Node not found',
              success: false
            }),
            { 
              status: 404,
              headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8" }
            }
          )
        }

        const deletedNode = data[0] as MindmapNode
        logger.info('Mindmap node deleted successfully', { 
          id: deletedNode.id,
          title: deletedNode.title 
        })

        return new Response(
          JSON.stringify({ 
            data: { id: deletedNode.id },
            success: true,
            message: 'Node deleted successfully'
          }),
          { 
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8" }
          }
        )
      }

      // Method not allowed
      return new Response(
        JSON.stringify({ 
          error: 'Method not allowed. Use GET, POST, PUT, or DELETE.',
          success: false 
        }),
        { 
          status: 405,
          headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8" }
        }
      )

    } catch (error) {
      logger.error('Mindmap API error', error as Error)
      
      return new Response(
        JSON.stringify({ 
          error: (error as Error).message || 'Internal server error',
          success: false 
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8" }
        }
      )
    }
  })
})