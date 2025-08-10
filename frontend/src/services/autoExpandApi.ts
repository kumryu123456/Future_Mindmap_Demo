import { apiService } from './api';
import type { 
  AutoExpandRequest, 
  AutoExpandResponse, 
  ApiResponse 
} from '../types/api';

/**
 * Auto-expand content using AI-powered expansion service
 * 
 * @param request - The auto expansion request payload
 * @returns Promise with expanded content response
 */
export async function autoExpand(
  request: AutoExpandRequest
): Promise<ApiResponse<AutoExpandResponse['data']>> {
  try {
    // Validate required fields
    if (!request.content || !request.content.data) {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Content data is required for expansion',
        }
      };
    }

    if (!request.content.type) {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Content type is required (mindmap, outline, text, concept, or plan)',
        }
      };
    }

    // Validate expansion options
    if (request.expansionOptions.maxNodes && request.expansionOptions.maxNodes < 1) {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Max nodes must be at least 1',
        }
      };
    }

    if (request.expansionOptions.levels && request.expansionOptions.levels < 1) {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Expansion levels must be at least 1',
        }
      };
    }

    // Validate constraints
    if (request.constraints?.maxDepth && request.constraints.maxDepth < 1) {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Max depth must be at least 1',
        }
      };
    }

    // Prepare request payload
    const payload = {
      content: {
        type: request.content.type,
        data: request.content.data,
        context: {
          subject: request.content.context?.subject || '',
          domain: request.content.context?.domain || 'general',
          audience: request.content.context?.audience || 'general',
          purpose: request.content.context?.purpose || 'exploration'
        }
      },
      expansionOptions: {
        direction: request.expansionOptions.direction || 'both',
        maxNodes: request.expansionOptions.maxNodes || 20,
        levels: request.expansionOptions.levels || 3,
        categories: request.expansionOptions.categories || [],
        includeRelated: request.expansionOptions.includeRelated ?? true,
        includeExamples: request.expansionOptions.includeExamples ?? true,
        includeDetails: request.expansionOptions.includeDetails ?? true
      },
      preferences: {
        creativity: request.preferences?.creativity || 'moderate',
        technicality: request.preferences?.technicality || 'intermediate',
        priority: request.preferences?.priority || 'relevance',
        format: request.preferences?.format || 'structured'
      },
      constraints: {
        excludeTopics: request.constraints?.excludeTopics || [],
        focusAreas: request.constraints?.focusAreas || [],
        maxDepth: request.constraints?.maxDepth || 5,
        timeLimit: request.constraints?.timeLimit || 30000 // 30 seconds default
      }
    };

    // Make POST request to the auto-expand endpoint
    const response = await apiService.post<AutoExpandResponse['data']>(
      '/functions/v1/auto-expand',
      payload,
      {
        'Content-Type': 'application/json',
        'X-Request-Source': 'mindmap-frontend',
        'X-Expansion-Version': '1.0'
      }
    );

    return response;

  } catch (error) {
    console.error('Auto expand API error:', error);
    
    return {
      success: false,
      error: {
        code: 'API_ERROR',
        message: 'Failed to auto-expand content',
        details: { error: String(error) }
      }
    };
  }
}

/**
 * Auto-expand mindmap content (convenience function)
 * 
 * @param mindmapData - Mindmap data to expand
 * @param options - Expansion options
 * @returns Promise with expanded mindmap response
 */
export async function autoExpandMindmap(
  mindmapData: Record<string, unknown>,
  options?: Partial<AutoExpandRequest['expansionOptions']>
): Promise<ApiResponse<AutoExpandResponse['data']>> {
  return autoExpand({
    content: {
      type: 'mindmap',
      data: mindmapData,
      context: {
        purpose: 'mindmap_expansion'
      }
    },
    expansionOptions: {
      direction: 'both',
      maxNodes: 15,
      levels: 2,
      includeRelated: true,
      includeExamples: true,
      includeDetails: false,
      ...options
    },
    preferences: {
      creativity: 'moderate',
      technicality: 'intermediate',
      priority: 'relevance',
      format: 'hierarchical'
    }
  });
}

/**
 * Auto-expand text content into structured format (convenience function)
 * 
 * @param text - Text content to expand
 * @param subject - Subject/topic of the text
 * @param domain - Domain or field
 * @returns Promise with expanded text response
 */
export async function autoExpandText(
  text: string,
  subject?: string,
  domain?: string
): Promise<ApiResponse<AutoExpandResponse['data']>> {
  return autoExpand({
    content: {
      type: 'text',
      data: { text, content: text },
      context: {
        subject,
        domain,
        purpose: 'text_structuring'
      }
    },
    expansionOptions: {
      direction: 'breadth',
      maxNodes: 25,
      levels: 3,
      includeRelated: true,
      includeExamples: true,
      includeDetails: true
    },
    preferences: {
      creativity: 'moderate',
      technicality: 'intermediate',
      priority: 'completeness',
      format: 'structured'
    }
  });
}

/**
 * Auto-expand concept with related ideas (convenience function)
 * 
 * @param concept - Main concept to expand
 * @param domain - Domain/field of the concept
 * @param audience - Target audience
 * @returns Promise with expanded concept response
 */
export async function autoExpandConcept(
  concept: string,
  domain?: string,
  audience?: string
): Promise<ApiResponse<AutoExpandResponse['data']>> {
  return autoExpand({
    content: {
      type: 'concept',
      data: { concept, title: concept },
      context: {
        subject: concept,
        domain,
        audience,
        purpose: 'concept_exploration'
      }
    },
    expansionOptions: {
      direction: 'both',
      maxNodes: 30,
      levels: 4,
      includeRelated: true,
      includeExamples: true,
      includeDetails: true
    },
    preferences: {
      creativity: 'creative',
      technicality: 'intermediate',
      priority: 'novelty',
      format: 'natural'
    }
  });
}

/**
 * Auto-expand outline with detailed breakdowns (convenience function)
 * 
 * @param outline - Outline data to expand
 * @param detailLevel - Level of detail to include
 * @returns Promise with expanded outline response
 */
export async function autoExpandOutline(
  outline: Record<string, unknown>,
  detailLevel?: 'basic' | 'intermediate' | 'advanced'
): Promise<ApiResponse<AutoExpandResponse['data']>> {
  return autoExpand({
    content: {
      type: 'outline',
      data: outline,
      context: {
        purpose: 'outline_detailing'
      }
    },
    expansionOptions: {
      direction: 'depth',
      maxNodes: 40,
      levels: 5,
      includeRelated: false,
      includeExamples: true,
      includeDetails: true
    },
    preferences: {
      creativity: 'conservative',
      technicality: detailLevel || 'intermediate',
      priority: 'completeness',
      format: 'hierarchical'
    }
  });
}

/**
 * Auto-expand with specific focus areas (convenience function)
 * 
 * @param content - Content to expand
 * @param focusAreas - Specific areas to focus on
 * @param excludeTopics - Topics to exclude from expansion
 * @returns Promise with focused expansion response
 */
export async function autoExpandFocused(
  content: Record<string, unknown>,
  focusAreas: string[],
  excludeTopics?: string[]
): Promise<ApiResponse<AutoExpandResponse['data']>> {
  return autoExpand({
    content: {
      type: 'concept',
      data: content,
      context: {
        purpose: 'focused_expansion'
      }
    },
    expansionOptions: {
      direction: 'both',
      maxNodes: 20,
      levels: 3,
      includeRelated: true,
      includeExamples: false,
      includeDetails: true
    },
    preferences: {
      creativity: 'moderate',
      technicality: 'intermediate',
      priority: 'relevance',
      format: 'structured'
    },
    constraints: {
      focusAreas,
      excludeTopics: excludeTopics || [],
      maxDepth: 4
    }
  });
}

/**
 * Auto-expand for creative brainstorming (convenience function)
 * 
 * @param seed - Initial seed content
 * @param domain - Creative domain
 * @returns Promise with creative expansion response
 */
export async function autoExpandCreative(
  seed: string | Record<string, unknown>,
  domain?: string
): Promise<ApiResponse<AutoExpandResponse['data']>> {
  const seedData = typeof seed === 'string' ? { seed, title: seed } : seed;
  
  return autoExpand({
    content: {
      type: 'concept',
      data: seedData,
      context: {
        domain: domain || 'creative',
        purpose: 'brainstorming'
      }
    },
    expansionOptions: {
      direction: 'breadth',
      maxNodes: 35,
      levels: 3,
      includeRelated: true,
      includeExamples: true,
      includeDetails: false
    },
    preferences: {
      creativity: 'creative',
      technicality: 'basic',
      priority: 'novelty',
      format: 'natural'
    }
  });
}