import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  throw new Error('VITE_SUPABASE_URL is not defined in environment variables')
}

if (!supabaseKey) {
  throw new Error('VITE_SUPABASE_ANON_KEY is not defined in environment variables')
}

// Create Supabase client with optimized settings
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false // Disable for better security
  },
  realtime: {
    params: {
      eventsPerSecond: 10, // Throttle real-time events
    },
  },
  global: {
    headers: {
      'Content-Type': 'application/json',
    },
  },
})

// Database types (will be auto-generated in production)
export type Database = {
  public: {
    Tables: {
      mindmap_nodes: {
        Row: {
          id: string
          title: string
          content: string | null
          x: number
          y: number
          parent_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          content?: string | null
          x: number
          y: number
          parent_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          content?: string | null
          x?: number
          y?: number
          parent_id?: string | null
          updated_at?: string
        }
      }
      user_sessions: {
        Row: {
          id: string
          session_id: string
          user_id: string | null
          session_data: any
          viewport_state: any | null
          ui_preferences: any | null
          created_at: string
          updated_at: string
          expires_at: string
        }
        Insert: {
          id?: string
          session_id: string
          user_id?: string | null
          session_data: any
          viewport_state?: any | null
          ui_preferences?: any | null
          created_at?: string
          updated_at?: string
          expires_at?: string
        }
        Update: {
          id?: string
          session_data?: any
          viewport_state?: any | null
          ui_preferences?: any | null
          updated_at?: string
          expires_at?: string
        }
      }
    }
  }
}

// Helper functions for common operations
export const supabaseHelpers = {
  /**
   * Get current user session
   */
  async getCurrentSession() {
    const { data: { session }, error } = await supabase.auth.getSession()
    return { session, error }
  },

  /**
   * Sign in with email and password
   */
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  },

  /**
   * Sign out current user
   */
  async signOut() {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  /**
   * Subscribe to auth changes
   */
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback)
  },

  /**
   * Subscribe to real-time table changes
   */
  subscribeToTable(
    table: string,
    callback: (payload: any) => void,
    filter?: string
  ) {
    let channel = supabase
      .channel(`${table}-changes`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table,
          ...(filter ? { filter } : {})
        }, 
        callback
      )

    return channel.subscribe()
  }
}

export default supabase