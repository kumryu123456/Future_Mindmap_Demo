import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "../_shared/cors.ts"
import { getSupabaseClient } from "../_shared/supabase.ts"
import { generateEmbeddingsForContent } from "../_shared/embeddings.ts"

console.log("Manage Embeddings Function initialized!")

interface EmbeddingStats {
  total_embeddings: number
  by_content_type: Record<string, number>
  latest_embedding: string | null
  oldest_embedding: string | null
}

serve(async (req) => {
  const { method } = req

  // Handle CORS preflight requests
  if (method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const supabase = getSupabaseClient()

  try {
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
        } catch (error) {
          return new Response(
            JSON.stringify({ 
              error: `Failed to generate embeddings: ${error.message}`,
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
        // Get embedding statistics
        const { data: embeddings, error: embeddingsError } = await supabase
          .from('embeddings')
          .select('content_type, created_at')

        if (embeddingsError) {
          throw new Error(`Failed to fetch embeddings: ${embeddingsError.message}`)
        }

        const stats: EmbeddingStats = {
          total_embeddings: embeddings?.length || 0,
          by_content_type: {},
          latest_embedding: null,
          oldest_embedding: null
        }

        if (embeddings && embeddings.length > 0) {
          // Count by content type
          embeddings.forEach(emb => {
            stats.by_content_type[emb.content_type] = (stats.by_content_type[emb.content_type] || 0) + 1
          })

          // Find latest and oldest
          const dates = embeddings.map(emb => emb.created_at).sort()
          stats.oldest_embedding = dates[0]
          stats.latest_embedding = dates[dates.length - 1]
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
        headers: { ...corsHeaders, "Content-Type": "application/json" }
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
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    )
  }
})