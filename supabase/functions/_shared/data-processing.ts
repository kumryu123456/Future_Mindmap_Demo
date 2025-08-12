/**
 * Shared utilities for data processing and validation
 */

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

/**
 * Validate keywords array
 */
export function validateKeywords(keywords: unknown): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: []
  }

  if (!keywords) {
    result.errors.push('Keywords are required')
    result.isValid = false
    return result
  }

  if (!Array.isArray(keywords)) {
    result.errors.push('Keywords must be an array')
    result.isValid = false
    return result
  }

  if (keywords.length === 0) {
    result.errors.push('At least one keyword is required')
    result.isValid = false
    return result
  }

  // Check for valid string keywords
  const invalidKeywords = keywords.filter(k => typeof k !== 'string' || k.trim().length === 0)
  if (invalidKeywords.length > 0) {
    result.errors.push('All keywords must be non-empty strings')
    result.isValid = false
  }

  // Warning for too many keywords
  if (keywords.length > 20) {
    result.warnings.push('Large number of keywords may affect performance')
  }

  // Warning for very short keywords
  const shortKeywords = keywords.filter(k => typeof k === 'string' && k.length < 3)
  if (shortKeywords.length > 0) {
    result.warnings.push(`Short keywords may produce less relevant results: ${shortKeywords.join(', ')}`)
  }

  return result
}

/**
 * Sanitize and normalize keywords
 */
export function normalizeKeywords(keywords: string[]): string[] {
  return keywords
    .map(keyword => keyword.trim().toLowerCase())
    .filter(keyword => keyword.length > 0)
    .filter((keyword, index, arr) => arr.indexOf(keyword) === index) // Remove duplicates
    .slice(0, 20) // Limit to 20 keywords
}

/**
 * Calculate text similarity using basic string matching
 */
export function calculateTextSimilarity(text1: string, text2: string): number {
  const words1 = text1.toLowerCase().split(/\s+/).filter(w => w.length > 2)
  const words2 = text2.toLowerCase().split(/\s+/).filter(w => w.length > 2)
  
  if (words1.length === 0 || words2.length === 0) {
    return 0
  }

  const set1 = new Set(words1)
  const set2 = new Set(words2)
  
  const intersection = new Set([...set1].filter(word => set2.has(word)))
  const union = new Set([...set1, ...set2])
  
  return intersection.size / union.size
}

/**
 * Extract domain-specific terms from text
 */
export function extractDomainTerms(text: string, domains: string[]): Record<string, string[]> {
  const result: Record<string, string[]> = {}
  
  // Simple domain-specific keyword matching
  const domainKeywords: Record<string, string[]> = {
    technology: ['api', 'database', 'server', 'cloud', 'software', 'app', 'system', 'platform', 'framework'],
    business: ['strategy', 'revenue', 'customer', 'market', 'sales', 'growth', 'roi', 'kpi', 'metrics'],
    project: ['deadline', 'milestone', 'task', 'resource', 'budget', 'timeline', 'scope', 'deliverable'],
    security: ['authentication', 'authorization', 'encryption', 'vulnerability', 'compliance', 'audit', 'risk'],
    performance: ['optimization', 'speed', 'efficiency', 'scalability', 'throughput', 'latency', 'bottleneck']
  }

  const textLower = text.toLowerCase()
  
  for (const domain of domains) {
    if (domainKeywords[domain]) {
      result[domain] = domainKeywords[domain].filter(keyword => 
        textLower.includes(keyword)
      )
    }
  }
  
  return result
}

/**
 * Generate cache key for data
 */
export function generateCacheKey(keywords: string[], sources: string[]): string {
  const normalizedKeywords = normalizeKeywords(keywords).sort()
  const normalizedSources = sources.map(s => s.trim().toLowerCase()).sort()
  
  return `${normalizedKeywords.join('|')}::${normalizedSources.join('|')}`
}

/**
 * Check if cached data is still valid
 */
export function isCacheValid(cachedUntil: string): boolean {
  return new Date(cachedUntil) > new Date()
}

/**
 * Parse and validate enterprise data response
 */
export function validateEnterpriseDataResponse(data: unknown): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: []
  }

  if (!data) {
    result.errors.push('No data provided')
    result.isValid = false
    return result
  }

  if (!Array.isArray(data)) {
    result.errors.push('Data must be an array')
    result.isValid = false
    return result
  }

  // Validate each item in the data array
  for (let i = 0; i < data.length; i++) {
    const item = data[i]
    const prefix = `Item ${i + 1}:`

    if (!item.id) {
      result.errors.push(`${prefix} Missing required field 'id'`)
      result.isValid = false
    }

    if (!item.title) {
      result.errors.push(`${prefix} Missing required field 'title'`)
      result.isValid = false
    }

    if (!item.source) {
      result.errors.push(`${prefix} Missing required field 'source'`)
      result.isValid = false
    }

    if (typeof item.relevance_score !== 'number' || item.relevance_score < 0 || item.relevance_score > 1) {
      result.errors.push(`${prefix} Invalid relevance_score (must be number between 0-1)`)
      result.isValid = false
    }

    if (!Array.isArray(item.keywords)) {
      result.warnings.push(`${prefix} Keywords should be an array`)
    }
  }

  return result
}

/**
 * Rate limiter utility
 */
export class SimpleRateLimiter {
  private requests: Map<string, number[]> = new Map()

  constructor(private maxRequests: number, private windowMs: number) {}

  isAllowed(identifier: string): boolean {
    const now = Date.now()
    const windowStart = now - this.windowMs

    // Get existing requests for this identifier
    const existing = this.requests.get(identifier) || []
    
    // Remove old requests outside the window
    const validRequests = existing.filter(time => time > windowStart)
    
    // Check if we're under the limit
    if (validRequests.length >= this.maxRequests) {
      return false
    }

    // Add current request and update
    validRequests.push(now)
    this.requests.set(identifier, validRequests)
    
    return true
  }

  getRemainingRequests(identifier: string): number {
    const now = Date.now()
    const windowStart = now - this.windowMs
    const existing = this.requests.get(identifier) || []
    const validRequests = existing.filter(time => time > windowStart)
    
    return Math.max(0, this.maxRequests - validRequests.length)
  }
}