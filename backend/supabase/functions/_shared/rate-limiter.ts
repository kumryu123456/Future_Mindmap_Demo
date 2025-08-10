/**
 * Simple rate limiting utility for Supabase Edge Functions
 */

export interface RateLimitResult {
  allowed: boolean
  info: {
    remaining: number
    reset: number
    limit: number
  }
  response?: Response
}

export interface RateLimitConfig {
  limit: number
  window: number // in milliseconds
}

const DEFAULT_CONFIGS: Record<string, RateLimitConfig> = {
  general: { limit: 100, window: 60000 }, // 100 requests per minute
  parse: { limit: 50, window: 60000 },    // 50 requests per minute for parsing
  ai: { limit: 20, window: 60000 }        // 20 requests per minute for AI operations
}

// Simple in-memory store (in production, use Redis or similar)
const requestCounts = new Map<string, { count: number, reset: number }>()

function getClientId(req: Request): string {
  // In a real implementation, you might use IP, user ID, or API key
  const forwarded = req.headers.get('x-forwarded-for')
  const realIp = req.headers.get('x-real-ip')
  const clientIp = forwarded?.split(',')[0] || realIp || '127.0.0.1'
  
  return clientIp
}

export function rateLimit(type: keyof typeof DEFAULT_CONFIGS = 'general') {
  return function(req: Request): RateLimitResult {
    const config = DEFAULT_CONFIGS[type] || DEFAULT_CONFIGS.general
    const clientId = getClientId(req)
    const key = `${type}:${clientId}`
    const now = Date.now()
    const windowStart = now - config.window
    
    // Clean up old entries
    const current = requestCounts.get(key)
    if (!current || current.reset < windowStart) {
      requestCounts.set(key, {
        count: 1,
        reset: now + config.window
      })
      
      return {
        allowed: true,
        info: {
          remaining: config.limit - 1,
          reset: now + config.window,
          limit: config.limit
        }
      }
    }
    
    // Check if limit exceeded
    if (current.count >= config.limit) {
      const response = new Response(
        JSON.stringify({
          error: 'Rate limit exceeded',
          success: false,
          retryAfter: Math.ceil((current.reset - now) / 1000)
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': Math.ceil((current.reset - now) / 1000).toString(),
            'X-RateLimit-Limit': config.limit.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': current.reset.toString()
          }
        }
      )
      
      return {
        allowed: false,
        info: {
          remaining: 0,
          reset: current.reset,
          limit: config.limit
        },
        response
      }
    }
    
    // Increment count
    current.count++
    requestCounts.set(key, current)
    
    return {
      allowed: true,
      info: {
        remaining: config.limit - current.count,
        reset: current.reset,
        limit: config.limit
      }
    }
  }
}

export function addRateLimitHeaders(response: Response, info: RateLimitResult['info']): Response {
  const headers = new Headers(response.headers)
  headers.set('X-RateLimit-Limit', info.limit.toString())
  headers.set('X-RateLimit-Remaining', info.remaining.toString())
  headers.set('X-RateLimit-Reset', info.reset.toString())
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  })
}