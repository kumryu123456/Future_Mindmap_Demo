// @ts-expect-error Supabase module types not available in current TypeScript config
import { createClient } from 'https://esm.sh/@supabase/supabase-js@^2'
import { DenoGlobal } from './types.js'

export const createSupabaseClient = (
  supabaseUrl: string,
  supabaseKey: string
) => {
  return createClient(supabaseUrl, supabaseKey, {
    global: {
      headers: {
        'Accept-Charset': 'utf-8',
        'Content-Type': 'application/json; charset=utf-8'
      },
      fetch: (url: RequestInfo | URL, options: RequestInit = {}) => {
        // Ensure UTF-8 encoding for all requests
        const headers = new Headers(options.headers)
        headers.set('Accept-Charset', 'utf-8')
        // Only set Content-Type for JSON requests, preserve existing headers for other types
        if (options.body && typeof options.body === 'string' && !headers.has('Content-Type')) {
          try {
            JSON.parse(options.body)
            headers.set('Content-Type', 'application/json; charset=utf-8')
          } catch {
            // Not JSON, let the original Content-Type header be preserved
          }
        }
        
        return fetch(url, {
          ...options,
          headers: headers
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
  const supabaseUrl = deno?.env?.get('SUPABASE_URL') || ''
  const supabaseServiceRoleKey = deno?.env?.get('SUPABASE_SERVICE_ROLE_KEY') || ''
  
  return createSupabaseClient(supabaseUrl, supabaseServiceRoleKey)
}