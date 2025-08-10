import { apiService } from './api';
import type { 
  GeneratePlanRequest, 
  GeneratePlanResponse, 
  ApiResponse 
} from '../types/api';

/**
 * Generate a project plan using the backend AI service
 * 
 * @param request - The plan generation request payload
 * @returns Promise with generated plan response
 */
export async function generatePlan(
  request: GeneratePlanRequest
): Promise<ApiResponse<GeneratePlanResponse['data']>> {
  try {
    // Validate required fields
    if (!request.objective || request.objective.trim() === '') {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Project objective is required and cannot be empty',
        }
      };
    }

    if (!request.projectType) {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Project type is required',
        }
      };
    }

    // Validate team size if provided
    if (request.context?.teamSize && request.context.teamSize < 1) {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Team size must be at least 1',
        }
      };
    }

    // Validate max steps if provided
    if (request.options?.maxSteps && (request.options.maxSteps < 1 || request.options.maxSteps > 100)) {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Max steps must be between 1 and 100',
        }
      };
    }

    // Prepare request payload
    const payload = {
      projectType: request.projectType,
      objective: request.objective.trim(),
      context: {
        industry: request.context?.industry || '',
        timeline: request.context?.timeline || '',
        budget: request.context?.budget || '',
        teamSize: request.context?.teamSize || 1,
        constraints: request.context?.constraints || [],
        requirements: request.context?.requirements || []
      },
      preferences: {
        planStyle: request.preferences?.planStyle || 'detailed',
        includeTimelines: request.preferences?.includeTimelines ?? true,
        includeMilestones: request.preferences?.includeMilestones ?? true,
        includeResources: request.preferences?.includeResources ?? true,
        includeRisks: request.preferences?.includeRisks ?? true,
        detailLevel: request.preferences?.detailLevel || 'intermediate'
      },
      options: {
        format: request.options?.format || 'structured',
        maxSteps: request.options?.maxSteps || 20,
        includeMetadata: request.options?.includeMetadata ?? true,
        generateAlternatives: request.options?.generateAlternatives ?? false
      }
    };

    // Make POST request to the generate plan endpoint
    const response = await apiService.post<GeneratePlanResponse['data']>(
      '/functions/v1/generate-plan',
      payload,
      {
        'Content-Type': 'application/json',
        'X-Request-Source': 'mindmap-frontend'
      }
    );

    return response;

  } catch (error) {
    console.error('Generate plan API error:', error);
    
    return {
      success: false,
      error: {
        code: 'API_ERROR',
        message: 'Failed to generate plan',
        details: { error: String(error) }
      }
    };
  }
}

/**
 * Generate a business plan (convenience function)
 * 
 * @param objective - Business objective
 * @param context - Optional business context
 * @returns Promise with business plan response
 */
export async function generateBusinessPlan(
  objective: string,
  context?: GeneratePlanRequest['context']
): Promise<ApiResponse<GeneratePlanResponse['data']>> {
  return generatePlan({
    projectType: 'business',
    objective,
    context,
    preferences: {
      planStyle: 'detailed',
      includeTimelines: true,
      includeMilestones: true,
      includeResources: true,
      includeRisks: true,
      detailLevel: 'comprehensive'
    },
    options: {
      format: 'structured',
      includeMetadata: true,
      generateAlternatives: false
    }
  });
}

/**
 * Generate a marketing plan (convenience function)
 * 
 * @param objective - Marketing objective
 * @param industry - Target industry
 * @param budget - Marketing budget
 * @returns Promise with marketing plan response
 */
export async function generateMarketingPlan(
  objective: string,
  industry?: string,
  budget?: string
): Promise<ApiResponse<GeneratePlanResponse['data']>> {
  return generatePlan({
    projectType: 'marketing',
    objective,
    context: {
      industry,
      budget,
      timeline: '6 months'
    },
    preferences: {
      planStyle: 'agile',
      includeTimelines: true,
      includeMilestones: true,
      includeResources: true,
      includeRisks: false,
      detailLevel: 'intermediate'
    },
    options: {
      format: 'kanban',
      includeMetadata: true
    }
  });
}

/**
 * Generate a technical project plan (convenience function)
 * 
 * @param objective - Technical objective
 * @param teamSize - Development team size
 * @param requirements - Technical requirements
 * @returns Promise with technical plan response
 */
export async function generateTechnicalPlan(
  objective: string,
  teamSize?: number,
  requirements?: string[]
): Promise<ApiResponse<GeneratePlanResponse['data']>> {
  return generatePlan({
    projectType: 'technical',
    objective,
    context: {
      teamSize,
      requirements,
      timeline: '3-6 months'
    },
    preferences: {
      planStyle: 'agile',
      includeTimelines: true,
      includeMilestones: true,
      includeResources: true,
      includeRisks: true,
      detailLevel: 'comprehensive'
    },
    options: {
      format: 'structured',
      maxSteps: 30,
      includeMetadata: true
    }
  });
}

/**
 * Generate a product launch plan (convenience function)
 * 
 * @param objective - Product launch objective
 * @param timeline - Launch timeline
 * @param constraints - Launch constraints
 * @returns Promise with product plan response
 */
export async function generateProductPlan(
  objective: string,
  timeline?: string,
  constraints?: string[]
): Promise<ApiResponse<GeneratePlanResponse['data']>> {
  return generatePlan({
    projectType: 'product',
    objective,
    context: {
      timeline,
      constraints
    },
    preferences: {
      planStyle: 'waterfall',
      includeTimelines: true,
      includeMilestones: true,
      includeResources: true,
      includeRisks: true,
      detailLevel: 'comprehensive'
    },
    options: {
      format: 'gantt',
      includeMetadata: true,
      generateAlternatives: true
    }
  });
}

/**
 * Generate a personal project plan (convenience function)
 * 
 * @param objective - Personal project objective
 * @param timeline - Project timeline
 * @returns Promise with personal plan response
 */
export async function generatePersonalPlan(
  objective: string,
  timeline?: string
): Promise<ApiResponse<GeneratePlanResponse['data']>> {
  return generatePlan({
    projectType: 'personal',
    objective,
    context: {
      timeline,
      teamSize: 1
    },
    preferences: {
      planStyle: 'high-level',
      includeTimelines: true,
      includeMilestones: true,
      includeResources: false,
      includeRisks: false,
      detailLevel: 'basic'
    },
    options: {
      format: 'mindmap',
      maxSteps: 15,
      includeMetadata: false
    }
  });
}

/**
 * Generate an academic project plan (convenience function)
 * 
 * @param objective - Academic project objective
 * @param requirements - Academic requirements
 * @returns Promise with academic plan response
 */
export async function generateAcademicPlan(
  objective: string,
  requirements?: string[]
): Promise<ApiResponse<GeneratePlanResponse['data']>> {
  return generatePlan({
    projectType: 'academic',
    objective,
    context: {
      requirements,
      timeline: '1 semester'
    },
    preferences: {
      planStyle: 'detailed',
      includeTimelines: true,
      includeMilestones: true,
      includeResources: true,
      includeRisks: false,
      detailLevel: 'intermediate'
    },
    options: {
      format: 'structured',
      includeMetadata: true
    }
  });
}