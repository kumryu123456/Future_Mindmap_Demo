/**
 * Embedding generation and vector similarity utilities
 */

import type { DenoGlobal } from './types.ts'

// Supabase client interface for embeddings operations
interface SupabaseClientLike {
  from: (table: string) => {
    upsert: (data: Record<string, unknown>, options?: { onConflict?: string }) => {
      select: () => Promise<{ data?: unknown[]; error?: { message: string } }>;
    };
    select: (columns: string) => {
      eq: (column: string, value: string) => {
        order: (column: string, options?: { ascending: boolean }) => {
          limit: (count: number) => Promise<{ data?: unknown[]; error?: { message: string } }>;
        };
        limit: (count: number) => Promise<{ data?: unknown[]; error?: { message: string } }>;
      };
      gte: (column: string, value: number) => {
        order: (column: string, options?: { ascending: boolean }) => {
          limit: (count: number) => Promise<{ data?: unknown[]; error?: { message: string } }>;
        };
      };
    };
  };
}

/**
 * Sanitize error data to prevent PII leakage
 */
function sanitizeErrorData(errorData: unknown): string {
  if (!errorData || typeof errorData !== 'object') {
    return 'Unknown error'
  }
  
  const errorObj = errorData as Record<string, unknown>
  
  // Extract only safe, non-sensitive fields
  const safeFields: Record<string, unknown> = {}
  
  // Safe fields that typically don't contain user data
  const allowedFields = ['type', 'code', 'status', 'error_type', 'model']
  
  for (const field of allowedFields) {
    if (errorObj[field] !== undefined) {
      safeFields[field] = errorObj[field]
    }
  }
  
  // Handle error messages - truncate if too long to prevent PII exposure
  if (errorObj.message && typeof errorObj.message === 'string') {
    const message = errorObj.message
    if (message.length > 200) {
      safeFields.message = message.substring(0, 200) + '... [truncated]'
    } else {
      safeFields.message = message
    }
  }
  
  // If no safe fields found, return generic message
  if (Object.keys(safeFields).length === 0) {
    return 'API error occurred'
  }
  
  return JSON.stringify(safeFields)
}

export interface EmbeddingResult {
  embedding: number[]
  tokens: number
  model: string
}

export interface SimilarContent {
  id: string
  content_type: string
  content_id: string
  content_text: string
  similarity_score: number
  metadata: Record<string, unknown>
}

/**
 * 🔧 FIX: Enhanced retry logic with proper 429 handling
 */
async function retryWithExponentialBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelayMs: number = 1000
): Promise<T> {
  let lastError: Error
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error
      
      // 🔧 FIX: Enhanced type-safe handling of 429 errors
      if (error instanceof Error && 'status' in error && (error as Error & { status: number }).status === 429) {
        const rateLimitError = error as Error & { status: number; retryAfter: number; isRetryable: boolean }
        
        if (attempt === maxRetries) {
          console.log(`Max retries (${maxRetries}) reached for rate limit. Giving up.`)
          throw error
        }
        
        // Use server-specified retry time or exponential backoff, whichever is longer
        const exponentialDelay = baseDelayMs * Math.pow(2, attempt - 1)
        const retryAfter = rateLimitError.retryAfter || 0
        const actualDelay = Math.max(retryAfter, exponentialDelay)
        
        console.log(`Rate limited (429). Waiting ${actualDelay}ms before retry attempt ${attempt + 1}/${maxRetries}`)
        await new Promise(resolve => setTimeout(resolve, actualDelay))
        continue
      }
      
      // Don't retry on client errors (4xx) except rate limits (429)
      if (error instanceof Error && 'response' in error) {
        const fetchError = error as Error & { response?: { status?: number } }
        const status = fetchError.response?.status
        if (status === 401 || status === 403) {
          throw error
        }
      } else if (error instanceof Error && (error.message.includes('401') || error.message.includes('403'))) {
        // Fallback to message checking for compatibility
        throw error
      }
      
      if (attempt === maxRetries) {
        throw lastError
      }
      
      // Regular exponential backoff with jitter for non-rate-limit errors
      const delay = baseDelayMs * Math.pow(2, attempt - 1) + Math.random() * 1000
      console.log(`Retry attempt ${attempt + 1}/${maxRetries} after ${delay.toFixed(0)}ms delay`)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  
  throw lastError!
}

/**
 * 🔧 FIX: Enhanced token estimation for multilingual text, especially Korean
 */
function estimateTokenCount(text: string): number {
  // Handle edge cases
  if (!text || typeof text !== 'string') {
    return 0
  }
  
  const cleanText = text.trim()
  if (cleanText.length === 0) {
    return 0
  }

  // Try to use tiktoken library if available (would need to be imported)
  // For now, use improved heuristic approach
  
  // Count words and characters
  const words = cleanText.split(/\s+/).filter(word => word.length > 0).length
  const chars = cleanText.length
  
  // Detect if text contains significant Korean content
  const koreanChars = (cleanText.match(/[가-힣]/g) || []).length
  const koreanRatio = koreanChars / chars
  
  // Enhanced estimation logic
  let tokenEstimate: number
  
  if (koreanRatio > 0.3) {
    // Korean-heavy text: Korean characters are typically 1-2 tokens each
    // Use more conservative estimation for Korean
    const koreanTokens = koreanChars * 1.5 // Korean chars are often 1.5 tokens on average
    const otherChars = chars - koreanChars
    const otherTokens = otherChars / 4 // English/numbers/punctuation
    tokenEstimate = koreanTokens + otherTokens
  } else {
    // Mixed or English text: use word and character based heuristic
    // This handles mixed content better than naive chars/4
    const wordBasedEstimate = words * 0.75 // Average 0.75 tokens per word
    const charBasedEstimate = chars / 4    // Fallback character estimation
    tokenEstimate = Math.max(wordBasedEstimate, charBasedEstimate)
  }
  
  return Math.ceil(tokenEstimate)
}

/**
 * 🔧 FIX: Enhanced generate embedding with retry logic and token management
 */
export async function generateEmbedding(
  text: string,
  model: string = 'text-embedding-ada-002'
): Promise<EmbeddingResult> {
  // 🔧 FIX: Improved environment variable access with fallbacks
  const deno = (globalThis as { Deno?: DenoGlobal }).Deno
  const openaiApiKey = deno?.env?.get('OPENAI_API_KEY')
  
  if (!openaiApiKey || openaiApiKey.trim().length === 0) {
    throw new Error('OpenAI API key not configured. Set OPENAI_API_KEY environment variable.')
  }

  // 🔧 FIX: Input validation and preprocessing
  const cleanText = text.trim()
  if (!cleanText) {
    throw new Error('Input text cannot be empty')
  }

  // 🔧 FIX: Model-specific token limits with configuration support
  const getTokenLimit = (modelName: string): number => {
    const tokenLimits: Record<string, number> = {
      'text-embedding-ada-002': 8191,
      'text-embedding-3-small': 8191,
      'text-embedding-3-large': 8191,
    }
    
    // Check for custom token limit from environment
    const customLimit = deno?.env?.get('OPENAI_TOKEN_LIMIT')
    if (customLimit) {
      const parsed = parseInt(customLimit, 10)
      if (!isNaN(parsed) && parsed > 0) {
        return Math.min(parsed, 8191) // Cap at API maximum
      }
    }
    
    return tokenLimits[modelName] || 8000 // Conservative default
  }

  const tokenLimit = getTokenLimit(model)
  const estimatedTokens = estimateTokenCount(cleanText)
  
  if (estimatedTokens > tokenLimit) {
    throw new Error(`Input text too long (estimated ${estimatedTokens} tokens). Maximum for ${model} is ${tokenLimit} tokens.`)
  }

  const makeRequest = async (): Promise<EmbeddingResult> => {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: cleanText,
        model,
      }),
    })

    // 🔧 FIX: Enhanced error handling
    if (!response.ok) {
      const errorText = await response.text()
      let errorData: Record<string, unknown> = {}
      
      try {
        errorData = JSON.parse(errorText)
      } catch {
        errorData = { message: errorText }
      }

      // 🔧 FIX: Enhanced 429 error handling with improved type safety
      if (response.status === 429) {
        const retryAfterHeader = response.headers.get('Retry-After')
        let waitTime = 2000 // Default 2 seconds
        
        // Safely parse retry-after header
        if (retryAfterHeader) {
          const parsedRetryAfter = parseInt(retryAfterHeader, 10)
          if (!isNaN(parsedRetryAfter) && parsedRetryAfter > 0) {
            waitTime = parsedRetryAfter * 1000 // Convert to milliseconds
          }
        }
        
        // Create strongly-typed rate limit error
        class RateLimitError extends Error {
          public readonly status = 429
          public readonly retryAfter: number
          public readonly isRetryable = true
          
          constructor(waitTime: number) {
            super(`Rate limited. Retry after ${waitTime}ms. Status: 429`)
            this.name = 'RateLimitError'
            this.retryAfter = waitTime
            
            // Maintain proper prototype chain
            Object.setPrototypeOf(this, RateLimitError.prototype)
          }
        }
        
        throw new RateLimitError(waitTime)
      }

      // Invalid API key
      if (response.status === 401) {
        throw new Error(`Invalid OpenAI API key. Status: ${response.status}`)
      }

      throw new Error(`OpenAI Embeddings API error: ${response.status} ${response.statusText} - ${sanitizeErrorData(errorData)}`)
    }

    const data = await response.json()
    
    // 🔧 FIX: Comprehensive response validation
    if (!data || !data.data || !Array.isArray(data.data) || data.data.length === 0) {
      throw new Error('Invalid response structure from OpenAI Embeddings API - no data array')
    }

    const embeddingData = data.data[0]
    if (!embeddingData || !embeddingData.embedding || !Array.isArray(embeddingData.embedding)) {
      throw new Error('Invalid response structure from OpenAI Embeddings API - no embedding data')
    }

    // 🔧 FIX: Validate embedding dimensions (ada-002 should be 1536)
    if (embeddingData.embedding.length !== 1536) {
      const dimensionError = `Unexpected embedding dimension: ${embeddingData.embedding.length}, expected 1536`
      console.warn(dimensionError)
      throw new Error(`Invalid embedding dimension: expected 1536, got ${embeddingData.embedding.length}`)
    }

    return {
      embedding: embeddingData.embedding,
      tokens: data.usage?.total_tokens || estimatedTokens,
      model: data.model || model
    }
  }

  // 🔧 FIX: Apply retry logic with exponential backoff
  return await retryWithExponentialBackoff(makeRequest, 3, 1000)
}

/**
 * Store embedding in database
 */
export async function storeEmbedding(
  supabase: unknown,
  contentType: string,
  contentId: string,
  contentText: string,
  embedding: number[],
  metadata: Record<string, unknown> = {}
): Promise<unknown> {
  const supabaseClient = supabase as SupabaseClientLike
  
  const { data, error } = await supabaseClient
    .from('embeddings')
    .upsert({
      content_type: contentType,
      content_id: contentId,
      content_text: contentText,
      embedding: `[${embedding.join(',')}]`,
      metadata
    }, {
      onConflict: 'content_type,content_id'
    })
    .select()

  if (error) {
    throw new Error(`Failed to store embedding: ${error.message}`)
  }

  return data?.[0]
}

/**
 * Find similar content using vector similarity search
 */
export async function findSimilarContent(
  supabase: unknown,
  queryEmbedding: number[],
  options: {
    contentTypes?: string[]
    similarityThreshold?: number
    maxResults?: number
    excludeContentId?: string
  } = {}
): Promise<SimilarContent[]> {
  const {
    contentTypes = ['mindmap_node', 'user_input', 'enterprise_data', 'plan_node'],
    similarityThreshold = 0.7,
    maxResults = 10,
    excludeContentId
  } = options

  try {
    const supabaseClient = supabase as {
      rpc: (fn: string, params: Record<string, unknown>) => Promise<{ data?: unknown[]; error?: { message: string } }>;
    }
    
    const { data, error } = await supabaseClient
      .rpc('find_similar_content', {
        query_embedding: `[${queryEmbedding.join(',')}]`,
        content_types: contentTypes,
        similarity_threshold: similarityThreshold,
        max_results: maxResults
      })

    if (error) {
      throw new Error(`Vector similarity search failed: ${error.message}`)
    }

    // Filter out the content we're expanding from
    let results = (data as Record<string, unknown>[]) || []
    if (excludeContentId) {
      results = results.filter((item: Record<string, unknown>) => item.content_id !== excludeContentId)
    }

    return results.map((item: Record<string, unknown>) => {
      // 🔧 FIX: Defensive type checking for similarity_score
      let similarityScore = 0; // Default fallback
      if (typeof item.similarity_score === 'number') {
        similarityScore = item.similarity_score;
      } else if (typeof item.similarity_score === 'string') {
        const parsedScore = Number(item.similarity_score);
        if (!isNaN(parsedScore) && isFinite(parsedScore)) {
          similarityScore = parsedScore;
        }
        // If string is empty or invalid, keep default 0
      }
      // For null, undefined, or other types, keep default 0
      
      return {
        id: item.id as string,
        content_type: item.content_type as string,
        content_id: item.content_id as string,
        content_text: item.content_text as string,
        similarity_score: similarityScore,
        metadata: (item.metadata as Record<string, unknown>) || {}
      };
    })
  } catch (error) {
    console.error('Error in findSimilarContent:', error)
    throw error
  }
}

/**
 * Generate embeddings for existing content
 */
export async function generateEmbeddingsForContent(
  supabase: unknown,
  contentType: string,
  batchSize: number = 50
): Promise<{ processed: number; errors: number }> {
  let processed = 0
  let errors = 0

  try {
    const supabaseClient = supabase as {
      from: (table: string) => {
        select: (fields: string) => {
          not: (field: string, operator: string, subquery: unknown) => {
            limit: (count: number) => Promise<{ data?: unknown[]; error?: { message: string } }>;
          };
        };
      };
    }
    
    // Get content without embeddings
    let query
    
    switch (contentType) {
      case 'mindmap_node':
        query = supabaseClient
          .from('mindmap_nodes')
          .select('id, title, content')
          .not('id', 'in', 
            supabaseClient
              .from('embeddings')
              .select('content_id')
          )
        break
        
      case 'user_input':
        query = supabaseClient
          .from('user_inputs')
          .select('id, raw_text, keywords')
          .not('id', 'in',
            supabaseClient
              .from('embeddings')
              .select('content_id')
          )
        break
        
      case 'enterprise_data':
        query = supabaseClient
          .from('enterprise_data')
          .select('id, keyword_query, data')
          .not('id', 'in',
            supabaseClient
              .from('embeddings')
              .select('content_id')
          )
        break
        
      default:
        throw new Error(`Unsupported content type: ${contentType}`)
    }

    const { data: content, error: fetchError } = await query.limit(batchSize)
    
    if (fetchError) {
      throw new Error(`Failed to fetch ${contentType}: ${fetchError.message}`)
    }

    // Process each item
    for (const item of content || []) {
      try {
        let text = ''
        let metadata: Record<string, unknown> = {}
        
        // Type cast item to a record
        const typedItem = item as Record<string, unknown>

        switch (contentType) {
          case 'mindmap_node':
            text = `${typedItem.title as string}: ${typedItem.content as string}`
            metadata = { title: typedItem.title }
            break
            
          case 'user_input':
            text = typedItem.raw_text as string
            metadata = { keywords: typedItem.keywords }
            break
            
          case 'enterprise_data':
            text = typedItem.keyword_query as string
            metadata = { has_data: ((typedItem.data as unknown[]) || []).length > 0 }
            break
        }

        // Generate embedding
        const embeddingResult = await generateEmbedding(text)
        
        // Store embedding
        await storeEmbedding(
          supabase,
          contentType,
          typedItem.id as string,
          text,
          embeddingResult.embedding,
          metadata
        )

        processed++
        
        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100))
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        const itemId = (item as Record<string, unknown>).id as string
        console.error(`Error processing ${contentType} ${itemId}:`, errorMessage)
        errors++
      }
    }

    return { processed, errors }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error(`Error in generateEmbeddingsForContent:`, errorMessage)
    throw error
  }
}

/**
 * Calculate cosine similarity between two vectors
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have the same length')
  }

  let dotProduct = 0
  let normA = 0
  let normB = 0

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }

  normA = Math.sqrt(normA)
  normB = Math.sqrt(normB)

  if (normA === 0 || normB === 0) {
    return 0
  }

  return dotProduct / (normA * normB)
}

/**
 * Normalize vector to unit length
 */
export function normalizeVector(vector: number[]): number[] {
  const norm = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0))
  return norm === 0 ? vector : vector.map(val => val / norm)
}

/**
 * Batch process embeddings with rate limiting
 */
export async function batchProcessEmbeddings(
  items: unknown[],
  processor: (item: unknown) => Promise<void>,
  batchSize: number = 10,
  delayMs: number = 1000
): Promise<{ processed: number; errors: number }> {
  let processed = 0
  let errors = 0

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize)
    
    const promises = batch.map(async (item) => {
      try {
        await processor(item)
        processed++
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        console.error(`Error processing item:`, errorMessage)
        errors++
      }
    })

    await Promise.all(promises)
    
    // Add delay between batches to avoid rate limiting
    if (i + batchSize < items.length) {
      await new Promise(resolve => setTimeout(resolve, delayMs))
    }
  }

  return { processed, errors }
}