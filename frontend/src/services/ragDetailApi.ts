import { apiService } from './api';
import type { 
  RAGDetailRequest, 
  RAGDetailResponse, 
  ApiResponse 
} from '../types/api';

/**
 * Get detailed information using RAG (Retrieval-Augmented Generation)
 * 
 * @param request - The RAG detail request payload
 * @returns Promise with detailed RAG response
 */
export async function ragDetail(
  request: RAGDetailRequest
): Promise<ApiResponse<RAGDetailResponse['data']>> {
  try {
    // Validate required fields
    if (!request.query?.text || request.query.text.trim() === '') {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Query text is required and cannot be empty',
        }
      };
    }

    // Validate retrieval options
    if (request.retrievalOptions.maxSources && request.retrievalOptions.maxSources < 1) {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Max sources must be at least 1',
        }
      };
    }

    if (request.retrievalOptions.relevanceThreshold && 
        (request.retrievalOptions.relevanceThreshold < 0 || request.retrievalOptions.relevanceThreshold > 1)) {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Relevance threshold must be between 0 and 1',
        }
      };
    }

    // Validate date range if provided
    if (request.filters?.dateRange?.startDate && request.filters?.dateRange?.endDate) {
      const startDate = new Date(request.filters.dateRange.startDate);
      const endDate = new Date(request.filters.dateRange.endDate);
      if (startDate > endDate) {
        return {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Start date must be before end date',
          }
        };
      }
    }

    // Prepare request payload
    const payload = {
      query: {
        text: request.query.text.trim(),
        context: {
          domain: request.query.context?.domain || 'general',
          topic: request.query.context?.topic || '',
          scope: request.query.context?.scope || 'broad',
          intent: request.query.context?.intent || 'explanation'
        }
      },
      retrievalOptions: {
        sources: request.retrievalOptions.sources || ['documents', 'web', 'knowledge_base'],
        maxSources: request.retrievalOptions.maxSources || 10,
        relevanceThreshold: request.retrievalOptions.relevanceThreshold || 0.7,
        recency: request.retrievalOptions.recency || 'any',
        languages: request.retrievalOptions.languages || ['en'],
        includeMetadata: request.retrievalOptions.includeMetadata ?? true
      },
      generationOptions: {
        detailLevel: request.generationOptions.detailLevel || 'standard',
        perspective: request.generationOptions.perspective || 'neutral',
        format: request.generationOptions.format || 'structured',
        includeReferences: request.generationOptions.includeReferences ?? true,
        includeCitations: request.generationOptions.includeCitations ?? true,
        includeRelated: request.generationOptions.includeRelated ?? true
      },
      filters: {
        dateRange: request.filters?.dateRange,
        authorityLevel: request.filters?.authorityLevel || 'any',
        contentTypes: request.filters?.contentTypes || [],
        excludeDomains: request.filters?.excludeDomains || [],
        includeDomains: request.filters?.includeDomains || []
      }
    };

    // Make POST request to the RAG detail endpoint
    const response = await apiService.post<RAGDetailResponse['data']>(
      '/functions/v1/rag-detail',
      payload,
      {
        'Content-Type': 'application/json',
        'X-Request-Source': 'mindmap-frontend',
        'X-RAG-Version': '1.0'
      }
    );

    return response;

  } catch (error) {
    console.error('RAG detail API error:', error);
    
    return {
      success: false,
      error: {
        code: 'API_ERROR',
        message: 'Failed to retrieve detailed information',
        details: { error: String(error) }
      }
    };
  }
}

/**
 * Get research-focused RAG details (convenience function)
 * 
 * @param query - Research query text
 * @param domain - Research domain
 * @param detailLevel - Level of detail required
 * @returns Promise with research-focused RAG response
 */
export async function ragResearch(
  query: string,
  domain?: string,
  detailLevel?: 'brief' | 'standard' | 'comprehensive' | 'exhaustive'
): Promise<ApiResponse<RAGDetailResponse['data']>> {
  return ragDetail({
    query: {
      text: query,
      context: {
        domain,
        scope: 'comprehensive',
        intent: 'research'
      }
    },
    retrievalOptions: {
      sources: ['documents', 'web', 'knowledge_base'],
      maxSources: 15,
      relevanceThreshold: 0.8,
      recency: 'recent',
      includeMetadata: true
    },
    generationOptions: {
      detailLevel: detailLevel || 'comprehensive',
      perspective: 'analytical',
      format: 'academic',
      includeReferences: true,
      includeCitations: true,
      includeRelated: true
    },
    filters: {
      authorityLevel: 'verified'
    }
  });
}

/**
 * Get explanatory RAG details (convenience function)
 * 
 * @param concept - Concept to explain
 * @param audience - Target audience level
 * @returns Promise with explanatory RAG response
 */
export async function ragExplain(
  concept: string,
  audience?: 'beginner' | 'intermediate' | 'expert'
): Promise<ApiResponse<RAGDetailResponse['data']>> {
  const detailLevel = audience === 'beginner' ? 'standard' : 
                     audience === 'expert' ? 'comprehensive' : 'standard';
  
  return ragDetail({
    query: {
      text: `Explain ${concept}`,
      context: {
        scope: 'broad',
        intent: 'explanation'
      }
    },
    retrievalOptions: {
      sources: ['documents', 'knowledge_base', 'web'],
      maxSources: 12,
      relevanceThreshold: 0.75,
      recency: 'any',
      includeMetadata: true
    },
    generationOptions: {
      detailLevel,
      perspective: 'neutral',
      format: 'narrative',
      includeReferences: true,
      includeCitations: false,
      includeRelated: true
    }
  });
}

/**
 * Get comparative RAG analysis (convenience function)
 * 
 * @param items - Items to compare
 * @param criteria - Comparison criteria
 * @returns Promise with comparative RAG response
 */
export async function ragCompare(
  items: string[],
  criteria?: string[]
): Promise<ApiResponse<RAGDetailResponse['data']>> {
  const query = `Compare ${items.join(' and ')}` + 
                (criteria ? ` in terms of ${criteria.join(', ')}` : '');
  
  return ragDetail({
    query: {
      text: query,
      context: {
        scope: 'comprehensive',
        intent: 'comparison'
      }
    },
    retrievalOptions: {
      sources: ['documents', 'web', 'knowledge_base'],
      maxSources: 20,
      relevanceThreshold: 0.7,
      recency: 'recent',
      includeMetadata: true
    },
    generationOptions: {
      detailLevel: 'comprehensive',
      perspective: 'comparative',
      format: 'structured',
      includeReferences: true,
      includeCitations: true,
      includeRelated: false
    }
  });
}

/**
 * Get analytical RAG insights (convenience function)
 * 
 * @param topic - Topic to analyze
 * @param perspective - Analysis perspective
 * @returns Promise with analytical RAG response
 */
export async function ragAnalyze(
  topic: string,
  perspective?: 'neutral' | 'critical' | 'comparative'
): Promise<ApiResponse<RAGDetailResponse['data']>> {
  return ragDetail({
    query: {
      text: `Analyze ${topic}`,
      context: {
        scope: 'comprehensive',
        intent: 'analysis'
      }
    },
    retrievalOptions: {
      sources: ['documents', 'knowledge_base', 'web'],
      maxSources: 15,
      relevanceThreshold: 0.8,
      recency: 'recent',
      includeMetadata: true
    },
    generationOptions: {
      detailLevel: 'comprehensive',
      perspective: perspective || 'analytical',
      format: 'structured',
      includeReferences: true,
      includeCitations: true,
      includeRelated: true
    },
    filters: {
      authorityLevel: 'verified'
    }
  });
}

/**
 * Get summarized RAG content (convenience function)
 * 
 * @param topic - Topic to summarize
 * @param length - Summary length preference
 * @returns Promise with summarized RAG response
 */
export async function ragSummarize(
  topic: string,
  length?: 'brief' | 'standard' | 'comprehensive'
): Promise<ApiResponse<RAGDetailResponse['data']>> {
  return ragDetail({
    query: {
      text: `Summarize key information about ${topic}`,
      context: {
        scope: 'broad',
        intent: 'summary'
      }
    },
    retrievalOptions: {
      sources: ['documents', 'knowledge_base', 'web'],
      maxSources: 10,
      relevanceThreshold: 0.75,
      recency: 'recent',
      includeMetadata: false
    },
    generationOptions: {
      detailLevel: length || 'standard',
      perspective: 'neutral',
      format: 'bullet_points',
      includeReferences: false,
      includeCitations: false,
      includeRelated: false
    }
  });
}

/**
 * Get recent RAG information (convenience function)
 * 
 * @param topic - Topic for recent information
 * @param timeframe - Recency preference
 * @returns Promise with recent RAG response
 */
export async function ragRecent(
  topic: string,
  timeframe?: 'latest' | 'recent'
): Promise<ApiResponse<RAGDetailResponse['data']>> {
  const currentDate = new Date();
  const startDate = new Date(currentDate);
  startDate.setMonth(currentDate.getMonth() - (timeframe === 'latest' ? 1 : 6));

  return ragDetail({
    query: {
      text: `Latest information and developments about ${topic}`,
      context: {
        scope: 'narrow',
        intent: 'research'
      }
    },
    retrievalOptions: {
      sources: ['web', 'documents'],
      maxSources: 12,
      relevanceThreshold: 0.7,
      recency: timeframe || 'latest',
      includeMetadata: true
    },
    generationOptions: {
      detailLevel: 'standard',
      perspective: 'neutral',
      format: 'structured',
      includeReferences: true,
      includeCitations: true,
      includeRelated: true
    },
    filters: {
      dateRange: {
        startDate: startDate.toISOString().split('T')[0],
        endDate: currentDate.toISOString().split('T')[0]
      }
    }
  });
}

/**
 * Get domain-specific RAG details (convenience function)
 * 
 * @param query - Query text
 * @param domain - Specific domain to focus on
 * @param includeDomains - Domains to include
 * @param excludeDomains - Domains to exclude
 * @returns Promise with domain-specific RAG response
 */
export async function ragDomainSpecific(
  query: string,
  domain: string,
  includeDomains?: string[],
  excludeDomains?: string[]
): Promise<ApiResponse<RAGDetailResponse['data']>> {
  return ragDetail({
    query: {
      text: query,
      context: {
        domain,
        scope: 'comprehensive',
        intent: 'research'
      }
    },
    retrievalOptions: {
      sources: ['documents', 'knowledge_base', 'web'],
      maxSources: 15,
      relevanceThreshold: 0.8,
      recency: 'any',
      includeMetadata: true
    },
    generationOptions: {
      detailLevel: 'comprehensive',
      perspective: 'analytical',
      format: 'structured',
      includeReferences: true,
      includeCitations: true,
      includeRelated: true
    },
    filters: {
      includeDomains,
      excludeDomains,
      authorityLevel: 'verified'
    }
  });
}