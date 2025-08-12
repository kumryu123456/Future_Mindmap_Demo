// supabase/functions/embedding/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { OpenAI } from "https://esm.sh/openai@4.52.7";
import { corsHeaders } from '../_shared/cors.ts';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: Deno.env.get("OPENAI_API_KEY"),
});

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Extract 'input' text from the request body
    const { input } = await req.json();
    if (!input) {
      throw new Error("Request body must contain an 'input' field.");
    }

    // Call OpenAI Embeddings API
    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-3-small", // OpenAI's latest embedding model
      input: input,
    });

    // Extract the generated embedding vector
    const embedding = embeddingResponse.data[0].embedding;

    // Return the embedding vector successfully
    return new Response(JSON.stringify({ embedding }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    // --- THIS IS THE CORRECTED PART ---
    // Handle errors safely
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});