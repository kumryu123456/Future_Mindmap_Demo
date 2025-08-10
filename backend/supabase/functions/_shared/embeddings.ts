/**
 * Embedding generation and vector similarity utilities
 */

/**
 * Sanitize error data to prevent PII leakage
 */
function sanitizeErrorData(errorData: any): string {
  if (!errorData || typeof errorData !== 'object') {
    return 'Unknown error'
  }
  
  // Extract only safe, non-sensitive fields
  const safeFields: Record<string, any> = {}
  
  // Safe fields that typically don't contain user data
  const allowedFields = ['type', 'code', 'status', 'error_type', 'model']
  
  for (const field of allowedFields) {
    if (errorData[field] !== undefined) {
      safeFields[field] = errorData[field]
    }
  }
  
  // Handle error messages - truncate if too long to prevent PII exposure
  if (errorData.message && typeof errorData.message === 'string') {
    const message = errorData.message
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
  metadata: Record<string, any>
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
      
      // 🔧 FIX: Handle 429 errors with proper retry logic
      if (error instanceof Error && (error as any).status === 429) {
        const retryAfter = (error as any).retryAfter
        
        if (attempt === maxRetries) {
          console.log(`Max retries (${maxRetries}) reached for rate limit. Giving up.`)
          throw error
        }
        
        // Use server-specified retry time or exponential backoff, whichever is longer
        const exponentialDelay = baseDelayMs * Math.pow(2, attempt - 1)
        const actualDelay = retryAfter ? Math.max(retryAfter, exponentialDelay) : exponentialDelay
        
        console.log(`Rate limited (429). Waiting ${actualDelay}ms before retry attempt ${attempt + 1}/${maxRetries}`)
        await new Promise(resolve => setTimeout(resolve, actualDelay))
        continue
      }
      
      // Don't retry on client errors (4xx) except rate limits (429)
      if (error instanceof Error && 'response' in error) {
        const fetchError = error as any
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
 * 🔧 FIX: Token estimation for text input
 */
function estimateTokenCount(text: string): number {
  // Rough estimation: 1 token ≈ 4 characters for English
  // More accurate for planning purposes
  return Math.ceil(text.length / 4)
}

/**
 * 🔧 FIX: Enhanced generate embedding with retry logic and token management
 */
export async function generateEmbedding(
  text: string,
  model: string = 'text-embedding-ada-002'
): Promise<EmbeddingResult> {
  const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
  
  if (!openaiApiKey) {
    throw new Error('OpenAI API key not configured. Set OPENAI_API_KEY environment variable.')
  }

  // 🔧 FIX: Input validation and preprocessing
  const cleanText = text.trim()
  if (!cleanText) {
    throw new Error('Input text cannot be empty')
  }

  // 🔧 FIX: Token limit check (ada-002 max: 8191 tokens)
  const estimatedTokens = estimateTokenCount(cleanText)
  if (estimatedTokens > 8000) {
    throw new Error(`Input text too long (estimated ${estimatedTokens} tokens). Maximum is 8000 tokens.`)
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
      let errorData: any = {}
      
      try {
        errorData = JSON.parse(errorText)
      } catch {
        errorData = { message: errorText }
      }

      // Rate limiting specific handling - create special error with retry info
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After')
        const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : 2000
        const rateLimitError = new Error(`Rate limited. Retry after ${waitTime}ms. Status: ${response.status}`)
        ;(rateLimitError as any).status = 429
        ;(rateLimitError as any).retryAfter = waitTime
        ;(rateLimitError as any).isRetryable = true
        throw rateLimitError
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
  supabase: any,
  contentType: string,
  contentId: string,
  contentText: string,
  embedding: number[],
  metadata: Record<string, any> = {}
): Promise<any> {
  const { data, error } = await supabase
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
  supabase: any,
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
    const { data, error } = await supabase
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
    let results = data || []
    if (excludeContentId) {
      results = results.filter((item: any) => item.content_id !== excludeContentId)
    }

    return results.map((item: any) => ({
      id: item.id,
      content_type: item.content_type,
      content_id: item.content_id,
      content_text: item.content_text,
      similarity_score: parseFloat(item.similarity_score),
      metadata: item.metadata || {}
    }))
  } catch (error) {
    console.error('Error in findSimilarContent:', error)
    throw error
  }
}

/**
 * Generate embeddings for existing content
 */
export async function generateEmbeddingsForContent(
  supabase: any,
  contentType: string,
  batchSize: number = 50
): Promise<{ processed: number; errors: number }> {
  let processed = 0
  let errors = 0

  try {
    // Get content without embeddings
    let query
    let textField = ''
    
    switch (contentType) {
      case 'mindmap_node':
        query = supabase
          .from('mindmap_nodes')
          .select('id, title, content')
          .not('id', 'in', 
            supabase
              .from('embeddings')
              .select('content_id')
              .eq('content_type', contentType)
          )
        textField = 'title, content'
        break
        
      case 'user_input':
        query = supabase
          .from('user_inputs')
          .select('id, raw_text, keywords')
          .not('id', 'in',
            supabase
              .from('embeddings')
              .select('content_id')
              .eq('content_type', contentType)
          )
        textField = 'raw_text'
        break
        
      case 'enterprise_data':
        query = supabase
          .from('enterprise_data')
          .select('id, keyword_query, data')
          .not('id', 'in',
            supabase
              .from('embeddings')
              .select('content_id')
              .eq('content_type', contentType)
          )
        textField = 'keyword_query'
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
        let metadata: Record<string, any> = {}

        switch (contentType) {
          case 'mindmap_node':
            text = `${item.title}: ${item.content}`
            metadata = { title: item.title }
            break
            
          case 'user_input':
            text = item.raw_text
            metadata = { keywords: item.keywords }
            break
            
          case 'enterprise_data':
            text = item.keyword_query
            metadata = { has_data: (item.data || []).length > 0 }
            break
        }

        // Generate embedding
        const embeddingResult = await generateEmbedding(text)
        
        // Store embedding
        await storeEmbedding(
          supabase,
          contentType,
          item.id,
          text,
          embeddingResult.embedding,
          metadata
        )

        processed++
        
        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100))
        
      } catch (error) {
        console.error(`Error processing ${contentType} ${item.id}:`, error.message)
        errors++
      }
    }

    return { processed, errors }
  } catch (error) {
    console.error(`Error in generateEmbeddingsForContent:`, error.message)
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
  items: any[],
  processor: (item: any) => Promise<void>,
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
        console.error(`Error processing item:`, error.message)
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