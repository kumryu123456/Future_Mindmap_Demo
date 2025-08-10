import { apiService } from './api';
import type { 
  EnterpriseDataRequest, 
  EnterpriseDataResponse, 
  ApiResponse 
} from '../types/api';

/**
 * Fetch enterprise data from the backend API
 * 
 * @param request - The enterprise data request payload
 * @returns Promise with enterprise data response
 */
export async function fetchEnterprise(
  request: EnterpriseDataRequest
): Promise<ApiResponse<EnterpriseDataResponse['data']>> {
  try {
    // Validate required fields
    if (!request.organizationId || request.organizationId.trim() === '') {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Organization ID is required and cannot be empty',
        }
      };
    }

    if (!request.dataType) {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Data type is required',
        }
      };
    }

    // Validate pagination if provided
    if (request.options?.pagination) {
      const { page, limit } = request.options.pagination;
      if (page < 1 || limit < 1 || limit > 1000) {
        return {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid pagination parameters. Page must be ≥1, limit must be 1-1000',
          }
        };
      }
    }

    // Validate date range if provided
    if (request.filters?.dateRange) {
      const { startDate, endDate } = request.filters.dateRange;
      if (new Date(startDate) > new Date(endDate)) {
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
      organizationId: request.organizationId.trim(),
      dataType: request.dataType,
      filters: {
        dateRange: request.filters?.dateRange,
        userId: request.filters?.userId,
        projectId: request.filters?.projectId,
        tags: request.filters?.tags || [],
        status: request.filters?.status || 'active'
      },
      options: {
        includeMetadata: request.options?.includeMetadata ?? true,
        includeShared: request.options?.includeShared ?? true,
        pagination: {
          page: request.options?.pagination?.page || 1,
          limit: request.options?.pagination?.limit || 50
        },
        sortBy: request.options?.sortBy || 'updatedAt',
        sortOrder: request.options?.sortOrder || 'desc'
      }
    };

    // Make POST request to the enterprise data endpoint
    const response = await apiService.post<EnterpriseDataResponse['data']>(
      '/functions/v1/fetch-enterprise-data',
      payload,
      {
        'Authorization': `Bearer ${getEnterpriseToken()}`,
        'X-Organization-ID': request.organizationId
      }
    );

    return response;

  } catch (error) {
    console.error('Fetch enterprise API error:', error);
    
    return {
      success: false,
      error: {
        code: 'API_ERROR',
        message: 'Failed to fetch enterprise data',
        details: { error: String(error) }
      }
    };
  }
}

/**
 * Fetch enterprise mindmaps (convenience function)
 * 
 * @param organizationId - Organization identifier
 * @param filters - Optional filters
 * @returns Promise with mindmaps data
 */
export async function fetchEnterpriseMindmaps(
  organizationId: string,
  filters?: EnterpriseDataRequest['filters']
): Promise<ApiResponse<EnterpriseDataResponse['data']>> {
  return fetchEnterprise({
    organizationId,
    dataType: 'mindmaps',
    filters,
    options: {
      includeMetadata: true,
      includeShared: true,
      sortBy: 'updatedAt',
      sortOrder: 'desc'
    }
  });
}

/**
 * Fetch enterprise analytics (convenience function)
 * 
 * @param organizationId - Organization identifier
 * @param dateRange - Date range for analytics
 * @returns Promise with analytics data
 */
export async function fetchEnterpriseAnalytics(
  organizationId: string,
  dateRange?: { startDate: string; endDate: string }
): Promise<ApiResponse<EnterpriseDataResponse['data']>> {
  return fetchEnterprise({
    organizationId,
    dataType: 'analytics',
    filters: { dateRange },
    options: {
      includeMetadata: true,
      sortBy: 'usage',
      sortOrder: 'desc'
    }
  });
}

/**
 * Fetch enterprise users (convenience function)
 * 
 * @param organizationId - Organization identifier
 * @param status - User status filter
 * @returns Promise with users data
 */
export async function fetchEnterpriseUsers(
  organizationId: string,
  status?: 'active' | 'archived' | 'draft'
): Promise<ApiResponse<EnterpriseDataResponse['data']>> {
  return fetchEnterprise({
    organizationId,
    dataType: 'users',
    filters: { status },
    options: {
      includeMetadata: true,
      sortBy: 'name',
      sortOrder: 'asc'
    }
  });
}

/**
 * Fetch enterprise projects with pagination
 * 
 * @param organizationId - Organization identifier
 * @param page - Page number
 * @param limit - Items per page
 * @returns Promise with projects data
 */
export async function fetchEnterpriseProjects(
  organizationId: string,
  page: number = 1,
  limit: number = 50
): Promise<ApiResponse<EnterpriseDataResponse['data']>> {
  return fetchEnterprise({
    organizationId,
    dataType: 'projects',
    options: {
      includeMetadata: true,
      includeShared: true,
      pagination: { page, limit },
      sortBy: 'updatedAt',
      sortOrder: 'desc'
    }
  });
}

/**
 * Get enterprise authentication token from storage or environment
 * @private
 */
function getEnterpriseToken(): string {
  // Try to get from localStorage first
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('enterprise_token') || 
                  sessionStorage.getItem('enterprise_token');
    if (token) return token;
  }
  
  // Fallback to environment variable
  return import.meta.env.VITE_ENTERPRISE_TOKEN || '';
}