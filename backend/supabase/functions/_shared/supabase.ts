import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
      fetch: (url: RequestInfo | URL, options: any = {}) => {
        // Ensure UTF-8 encoding for all requests
        const headers = new Headers(options.headers)
        headers.set('Accept-Charset', 'utf-8')
        if (options.body && (typeof options.body === 'string' || options.body instanceof Uint8Array || (typeof options.body === 'object' && options.body !== null))) {
          headers.set('Content-Type', 'application/json; charset=utf-8')
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
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  
  return createSupabaseClient(supabaseUrl, supabaseServiceRoleKey)
}