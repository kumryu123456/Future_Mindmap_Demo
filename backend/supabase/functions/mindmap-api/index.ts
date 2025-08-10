import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { getCorsHeaders } from "../_shared/cors.ts"
import { getSupabaseClient } from "../_shared/supabase.ts"
import { rateLimit, addRateLimitHeaders } from "../_shared/rate-limiter.ts"
import { createLogger } from "../_shared/logger.ts"
import { metrics, withMetrics, measurePerformance } from "../_shared/metrics.ts"
import { insertMindmapNodeDirect, getMindmapNodesDirect } from "../_shared/direct-db.ts"

const logger = createLogger('MindmapAPI')
logger.info('Mindmap API Function initialized!')

// Enhanced input validation functions
function validateNodeInput(node: any, isPartialUpdate: boolean = false): { isValid: boolean; errors: string[] } {
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
    } else if (node.parent_id && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(node.parent_id)) {
      errors.push('parent_id must be a valid UUID')
    }
  }
  
  return { isValid: errors.length === 0, errors }
}

/**
 * Detect if text contains Korean characters
 */
function hasKoreanText(text: string): boolean {
  return /[\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F]/g.test(text)
}

/**
 * Sanitize node input to prevent XSS and ensure data quality
 */
function sanitizeNodeInput(node: any): any {
  const sanitized: any = {}
  
  // Sanitize title with UTF-8 preservation
  if (node.title !== undefined) {
    // Ensure proper UTF-8 string conversion and normalize Unicode
    sanitized.title = String(node.title)
      .normalize('NFC') // Normalize Unicode for consistent storage
      .trim()
      .replace(/[<>\"'&]/g, '') // Remove potential XSS characters while preserving Korean/Unicode
      .slice(0, 500) // Enforce length limit
  }
  
  // Sanitize content with UTF-8 preservation  
  if (node.content !== undefined) {
    sanitized.content = String(node.content)
      .normalize('NFC') // Normalize Unicode for consistent storage
      .trim()
      .replace(/[<>\"'&]/g, '') // Remove potential XSS characters but preserve Korean/Unicode
      .slice(0, 5000) // Enforce length limit
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
      if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(node.parent_id.trim())) {
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
  parent_id?: string
  created_at?: string
  updated_at?: string
}

serve(async (req) => {
  return withMetrics(req, async () => {
    const { method, url } = req
    const urlObj = new URL(url)
    const path = urlObj.pathname

    // Handle CORS preflight requests with dynamic origin-based headers
    if (method === 'OPTIONS') {
      const origin = req.headers.get('Origin')
      const corsHeaders = getCorsHeaders(origin)
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

        // 🔧 FIX: Use direct database operations for better UTF-8 handling in GET requests
        let data, error
        try {
          data = await getMindmapNodesDirect()
          error = null
        } catch (directError) {
          // Fallback to regular Supabase client
          const result = await supabase
            .from('mindmap_nodes')
            .select('*')
            .order('created_at', { ascending: false })
          data = result.data
          error = result.error
        }

        if (error) {
          logger.error('Database error retrieving mindmap nodes', error)
          throw new Error(`Failed to retrieve nodes: ${error.message}`)
        }

        logger.info('Mindmap nodes retrieved successfully', { count: data.length })
        
        const origin = req.headers.get('Origin')
        const corsHeaders = getCorsHeaders(origin)
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
          const origin = req.headers.get('Origin')
          const corsHeaders = getCorsHeaders(origin)
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

        // 🔧 FIX: Use direct database operations for Korean text to preserve UTF-8 encoding
        let data, error
        const hasKorean = hasKoreanText(sanitizedInput.title) || hasKoreanText(sanitizedInput.content || '')
        
        if (hasKorean) {
          try {
            data = await insertMindmapNodeDirect(
              sanitizedInput.title,
              sanitizedInput.content || '',
              sanitizedInput.x || 0,
              sanitizedInput.y || 0,
              sanitizedInput.parent_id || null
            )
            error = null
          } catch (directError) {
            data = null
            error = directError
          }
        } else {
          // Use regular Supabase client for non-Korean text
          const result = await supabase
            .from('mindmap_nodes')
            .insert({
              title: sanitizedInput.title,
              content: sanitizedInput.content || '',
              x: sanitizedInput.x || 0,
              y: sanitizedInput.y || 0,
              parent_id: sanitizedInput.parent_id || null
            })
            .select()
          data = result.data
          error = result.error
        }

        if (error) {
          logger.error('Database error creating mindmap node', error)
          throw new Error(`Failed to create node: ${error.message}`)
        }

        const newNode = Array.isArray(data) ? data[0] : data as MindmapNode
        logger.info('Mindmap node created successfully', { 
          id: newNode.id,
          title: newNode.title 
        })

        const origin = req.headers.get('Origin')
        const corsHeaders = getCorsHeaders(origin)
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

        if (!nodeId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(nodeId)) {
          const origin = req.headers.get('Origin')
          const corsHeaders = getCorsHeaders(origin)
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
          const origin = req.headers.get('Origin')
          const corsHeaders = getCorsHeaders(origin)
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
        if (sanitizedInput.title !== undefined) updateData.title = sanitizedInput.title
        if (sanitizedInput.content !== undefined) updateData.content = sanitizedInput.content
        if (sanitizedInput.x !== undefined) updateData.x = sanitizedInput.x
        if (sanitizedInput.y !== undefined) updateData.y = sanitizedInput.y
        if (sanitizedInput.parent_id !== undefined) updateData.parent_id = sanitizedInput.parent_id

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
          const origin = req.headers.get('Origin')
          const corsHeaders = getCorsHeaders(origin)
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

        const origin = req.headers.get('Origin')
        const corsHeaders = getCorsHeaders(origin)
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

        if (!nodeId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(nodeId)) {
          const origin = req.headers.get('Origin')
          const corsHeaders = getCorsHeaders(origin)
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
          const origin = req.headers.get('Origin')
          const corsHeaders = getCorsHeaders(origin)
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

        const origin = req.headers.get('Origin')
        const corsHeaders = getCorsHeaders(origin)
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
      const origin = req.headers.get('Origin')
      const corsHeaders = getCorsHeaders(origin)
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
      logger.error('Mindmap API error', error)
      
      const origin = req.headers.get('Origin')
      const corsHeaders = getCorsHeaders(origin)
      return new Response(
        JSON.stringify({ 
          error: error.message || 'Internal server error',
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