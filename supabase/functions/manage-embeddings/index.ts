// @ts-expect-error: Deno module resolution
import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { getCorsHeaders } from "../_shared/cors.js"
import { getSupabaseClient } from "../_shared/supabase.js"
import { generateEmbeddingsForContent } from "../_shared/embeddings.js"

console.log("Manage Embeddings Function initialized!")

interface EmbeddingStats {
  total_embeddings: number
  by_content_type: Record<string, number>
  latest_embedding: string | null
  oldest_embedding: string | null
}

serve(async (req: Request) => {
  const { method } = req
  const origin = req.headers.get('Origin') || undefined
  const corsHeaders = getCorsHeaders(origin)

  // Handle CORS preflight requests
  if (method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = getSupabaseClient()
    if (method === 'POST') {
      const body = await req.json()
      const { action, contentType, batchSize = 50 } = body

      if (action === 'generate') {
        if (!contentType) {
          return new Response(
            JSON.stringify({ 
              error: 'contentType is required for generate action',
              success: false 
            }),
            { 
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" }
            }
          )
        }

        console.log(`Generating embeddings for ${contentType}...`)
        
        try {
          const result = await generateEmbeddingsForContent(supabase, contentType, batchSize)
          
          return new Response(
            JSON.stringify({ 
              data: result,
              success: true,
              message: `Generated embeddings for ${result.processed} ${contentType} items with ${result.errors} errors`
            }),
            { 
              status: 200,
              headers: { ...corsHeaders, "Content-Type": "application/json" }
            }
          )
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : String(error)
          return new Response(
            JSON.stringify({ 
              error: `Failed to generate embeddings: ${errorMessage}`,
              success: false 
            }),
            { 
              status: 500,
              headers: { ...corsHeaders, "Content-Type": "application/json" }
            }
          )
        }
      } else {
        return new Response(
          JSON.stringify({ 
            error: 'Invalid action. Supported actions: generate',
            success: false 
          }),
          { 
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          }
        )
      }
    }

    if (method === 'GET') {
      const url = new URL(req.url)
      const action = url.searchParams.get('action') || 'stats'

      if (action === 'stats') {
        // Use database aggregation for better performance
        const { data: statsData, error: statsError } = await supabase
          .rpc('embedding_stats')

        if (statsError) {
          throw new Error(`Failed to fetch embedding statistics: ${statsError.message}`)
        }

        const stats: EmbeddingStats = {
          total_embeddings: statsData?.total_embeddings || 0,
          by_content_type: statsData?.by_content_type || {},
          latest_embedding: statsData?.latest_embedding || null,
          oldest_embedding: statsData?.oldest_embedding || null
        }

        return new Response(
          JSON.stringify({ 
            data: stats,
            success: true 
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        )
      } else {
        return new Response(
          JSON.stringify({ 
            error: 'Invalid action. Supported actions: stats',
            success: false 
          }),
          { 
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          }
        )
      }
    }

    return new Response(
      JSON.stringify({ 
        error: 'Method not allowed. Use POST to manage embeddings or GET for statistics.',
        success: false 
      }),
      { 
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json", "Allow": "GET, POST" }
      }
    )

  } catch (error: unknown) {
    console.error('Function error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        success: false 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    )
  }
})