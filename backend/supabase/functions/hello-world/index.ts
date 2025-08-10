// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { getCorsHeaders } from "../_shared/cors.ts"

console.log("Hello from Functions!")

serve(async (req) => {
  const { method } = req
  const corsHeaders = getCorsHeaders(req.headers.get('origin'))

  // Handle CORS preflight requests
  if (method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    if (method === 'POST') {
      const body = await req.json()
      
      // 🔧 FIX: Input validation and sanitization
      let name = body?.name
      
      if (!name || typeof name !== 'string') {
        return new Response(
          JSON.stringify({ 
            error: 'Name field is required and must be a string',
            success: false 
          }),
          { 
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          }
        )
      }
      
      // Sanitize input: remove HTML tags and limit length
      name = name.trim().replace(/<[^>]*>/g, '').slice(0, 100)
      
      if (name.length === 0) {
        return new Response(
          JSON.stringify({ 
            error: 'Name cannot be empty after sanitization',
            success: false 
          }),
          { 
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          }
        )
      }

      const data = {
        message: `Hello ${name}!`,
        timestamp: new Date().toISOString(),
        success: true
      }

      return new Response(
        JSON.stringify(data),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      )
    }

    if (method === 'GET') {
      const data = {
        message: "Hello World from Supabase Edge Function!",
        timestamp: new Date().toISOString(),
      }

      return new Response(
        JSON.stringify(data),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      )
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      },
    )
  }
})