import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'
import type { DenoGlobal } from './types.ts'

export const createSupabaseClient = (
  supabaseUrl: string,
  supabaseKey: string
) => {
  return createClient(supabaseUrl, supabaseKey, {
    global: {
      fetch: (url: RequestInfo | URL, options: RequestInit = {}) => {
        // Preserve existing headers from Request object if present
        const requestHeaders = url instanceof Request ? new Headers(url.headers) : new Headers()
        
        // Merge with option headers, allowing options to override
        const optionHeaders = new Headers(options.headers)
        optionHeaders.forEach((value, key) => {
          requestHeaders.set(key, value)
        })
        
        // Only set Content-Type for JSON requests, preserve existing headers for other types
        if (options.body && typeof options.body === 'string' && !requestHeaders.has('Content-Type')) {
          try {
            JSON.parse(options.body)
            requestHeaders.set('Content-Type', 'application/json; charset=utf-8')
          } catch {
            // Not JSON, let the original Content-Type header be preserved
          }
        }
        
        return fetch(url, {
          ...options,
          headers: requestHeaders
        })
      }
    },
    db: {
      schema: 'public'
    },
    auth: {
      persistSession: false
    }
  })
}

export const getSupabaseClient = () => {
  const deno = (globalThis as { Deno?: DenoGlobal }).Deno
  const supabaseUrl = deno?.env?.get('SUPABASE_URL')
  const supabaseServiceRoleKey = deno?.env?.get('SUPABASE_SERVICE_ROLE_KEY')
  
  if (!supabaseUrl) {
    throw new Error('Missing SUPABASE_URL environment variable')
  }
  
  if (!supabaseServiceRoleKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable')
  }
  
  return createSupabaseClient(supabaseUrl, supabaseServiceRoleKey)
}