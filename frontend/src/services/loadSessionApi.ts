import { apiService } from './api';
import type { 
  LoadSessionRequest, 
  LoadSessionResponse,
  SessionQueryRequest,
  SessionQueryResponse,
  ApiResponse 
} from '../types/api';

/**
 * Load a specific session by ID
 * 
 * @param request - The load session request payload
 * @returns Promise with loaded session response
 */
export async function loadSession(
  request: LoadSessionRequest
): Promise<ApiResponse<LoadSessionResponse['data']>> {
  try {
    // Validate required fields
    if (!request.sessionId || request.sessionId.trim() === '') {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Session ID is required and cannot be empty',
        }
      };
    }

    // Validate session ID format (basic validation)
    if (request.sessionId.length < 8) {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Session ID format is invalid',
        }
      };
    }

    // Validate version if provided
    if (request.options?.version && request.options.version < 1) {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Version must be greater than 0',
        }
      };
    }

    // Validate date range if provided
    if (request.filters?.dateRange) {
      const { startDate, endDate } = request.filters.dateRange;
      if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
        return {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Start date must be before end date',
          }
        };
      }
    }

    // Prepare query parameters for GET request
    const queryParams = new URLSearchParams();
    queryParams.set('sessionId', request.sessionId.trim());

    // Add options as query parameters
    if (request.options) {
      if (request.options.includeData !== undefined) {
        queryParams.set('includeData', String(request.options.includeData));
      }
      if (request.options.includeAnalytics !== undefined) {
        queryParams.set('includeAnalytics', String(request.options.includeAnalytics));
      }
      if (request.options.includeCollaborators !== undefined) {
        queryParams.set('includeCollaborators', String(request.options.includeCollaborators));
      }
      if (request.options.includeHistory !== undefined) {
        queryParams.set('includeHistory', String(request.options.includeHistory));
      }
      if (request.options.includeBackups !== undefined) {
        queryParams.set('includeBackups', String(request.options.includeBackups));
      }
      if (request.options.dataCompression) {
        queryParams.set('dataCompression', request.options.dataCompression);
      }
      if (request.options.version) {
        queryParams.set('version', String(request.options.version));
      }
      if (request.options.accessLevel) {
        queryParams.set('accessLevel', request.options.accessLevel);
      }
    }

    // Add filters as query parameters
    if (request.filters) {
      if (request.filters.dataTypes && request.filters.dataTypes.length > 0) {
        queryParams.set('dataTypes', request.filters.dataTypes.join(','));
      }
      if (request.filters.dateRange?.startDate) {
        queryParams.set('startDate', request.filters.dateRange.startDate);
      }
      if (request.filters.dateRange?.endDate) {
        queryParams.set('endDate', request.filters.dateRange.endDate);
      }
      if (request.filters.userId) {
        queryParams.set('userId', request.filters.userId);
      }
      if (request.filters.includeDeleted !== undefined) {
        queryParams.set('includeDeleted', String(request.filters.includeDeleted));
      }
    }

    // Add metadata as query parameters
    if (request.metadata) {
      if (request.metadata.requesterId) {
        queryParams.set('requesterId', request.metadata.requesterId);
      }
      if (request.metadata.organizationId) {
        queryParams.set('organizationId', request.metadata.organizationId);
      }
      if (request.metadata.clientInfo?.platform) {
        queryParams.set('platform', request.metadata.clientInfo.platform);
      }
    }

    // Make GET request to the load session endpoint
    const response = await apiService.get<LoadSessionResponse['data']>(
      `/functions/v1/load-session?${queryParams.toString()}`,
      {
        'Accept': 'application/json',
        'X-Request-Source': 'mindmap-frontend',
        'X-Session-Version': '1.0',
        'X-Client-Info': JSON.stringify(request.metadata?.clientInfo || {})
      }
    );

    return response;

  } catch (error) {
    console.error('Load session API error:', error);
    
    return {
      success: false,
      error: {
        code: 'API_ERROR',
        message: 'Failed to load session',
        details: { error: String(error) }
      }
    };
  }
}

/**
 * Load session with basic options (convenience function)
 * 
 * @param sessionId - Session ID to load
 * @param includeData - Whether to include session data
 * @param userId - Optional user ID for permission check
 * @returns Promise with loaded session response
 */
export async function loadSessionBasic(
  sessionId: string,
  includeData: boolean = true,
  userId?: string
): Promise<ApiResponse<LoadSessionResponse['data']>> {
  return loadSession({
    sessionId,
    options: {
      includeData,
      includeAnalytics: true,
      includeCollaborators: false,
      includeHistory: false,
      includeBackups: false,
      dataCompression: 'auto',
      accessLevel: 'read'
    },
    filters: {
      userId,
      includeDeleted: false
    }
  });
}

/**
 * Load session with full details (convenience function)
 * 
 * @param sessionId - Session ID to load
 * @param requesterId - ID of user requesting the session
 * @param accessLevel - Required access level
 * @returns Promise with loaded session response with full details
 */
export async function loadSessionFull(
  sessionId: string,
  requesterId?: string,
  accessLevel: 'read' | 'write' | 'admin' = 'read'
): Promise<ApiResponse<LoadSessionResponse['data']>> {
  return loadSession({
    sessionId,
    options: {
      includeData: true,
      includeAnalytics: true,
      includeCollaborators: true,
      includeHistory: true,
      includeBackups: false,
      dataCompression: 'auto',
      accessLevel
    },
    metadata: {
      requesterId,
      clientInfo: {
        userAgent: navigator?.userAgent,
        platform: navigator?.platform,
        version: '1.0.0'
      }
    }
  });
}

/**
 * Load session for editing (convenience function)
 * 
 * @param sessionId - Session ID to load
 * @param userId - User ID requesting edit access
 * @param organizationId - Optional organization ID
 * @returns Promise with loaded session response for editing
 */
export async function loadSessionForEdit(
  sessionId: string,
  userId: string,
  organizationId?: string
): Promise<ApiResponse<LoadSessionResponse['data']>> {
  return loadSession({
    sessionId,
    options: {
      includeData: true,
      includeAnalytics: false,
      includeCollaborators: true,
      includeHistory: false,
      includeBackups: false,
      dataCompression: 'none',
      accessLevel: 'write'
    },
    filters: {
      userId,
      includeDeleted: false
    },
    metadata: {
      requesterId: userId,
      organizationId,
      clientInfo: {
        userAgent: navigator?.userAgent,
        platform: navigator?.platform,
        version: '1.0.0'
      }
    }
  });
}

/**
 * Load session history and versions (convenience function)
 * 
 * @param sessionId - Session ID to get history for
 * @param version - Optional specific version to load
 * @param userId - User ID for permission check
 * @returns Promise with session history and version data
 */
export async function loadSessionHistory(
  sessionId: string,
  version?: number,
  userId?: string
): Promise<ApiResponse<LoadSessionResponse['data']>> {
  return loadSession({
    sessionId,
    options: {
      includeData: version ? true : false,
      includeAnalytics: false,
      includeCollaborators: false,
      includeHistory: true,
      includeBackups: true,
      version,
      accessLevel: 'read'
    },
    filters: {
      userId,
      includeDeleted: false
    }
  });
}

/**
 * Load session collaborators and permissions (convenience function)
 * 
 * @param sessionId - Session ID to get collaborators for
 * @param requesterId - User ID requesting collaborator info
 * @returns Promise with collaborator and permission data
 */
export async function loadSessionCollaborators(
  sessionId: string,
  requesterId?: string
): Promise<ApiResponse<LoadSessionResponse['data']>> {
  return loadSession({
    sessionId,
    options: {
      includeData: false,
      includeAnalytics: false,
      includeCollaborators: true,
      includeHistory: false,
      includeBackups: false,
      accessLevel: 'read'
    },
    metadata: {
      requesterId
    }
  });
}

/**
 * Load session preview (minimal data for lists) (convenience function)
 * 
 * @param sessionId - Session ID to get preview for
 * @param userId - Optional user ID for permission check
 * @returns Promise with session preview data
 */
export async function loadSessionPreview(
  sessionId: string,
  userId?: string
): Promise<ApiResponse<LoadSessionResponse['data']>> {
  return loadSession({
    sessionId,
    options: {
      includeData: false,
      includeAnalytics: true,
      includeCollaborators: false,
      includeHistory: false,
      includeBackups: false,
      dataCompression: 'auto',
      accessLevel: 'read'
    },
    filters: {
      userId,
      includeDeleted: false
    }
  });
}

/**
 * Query sessions with filters and pagination
 * 
 * @param request - Session query request
 * @returns Promise with session query response
 */
export async function querySessions(
  request: SessionQueryRequest = {}
): Promise<ApiResponse<SessionQueryResponse['data']>> {
  try {
    // Prepare query parameters
    const queryParams = new URLSearchParams();

    // Add query filters
    if (request.query) {
      if (request.query.userId) {
        queryParams.set('userId', request.query.userId);
      }
      if (request.query.organizationId) {
        queryParams.set('organizationId', request.query.organizationId);
      }
      if (request.query.type && request.query.type.length > 0) {
        queryParams.set('type', request.query.type.join(','));
      }
      if (request.query.status && request.query.status.length > 0) {
        queryParams.set('status', request.query.status.join(','));
      }
      if (request.query.tags && request.query.tags.length > 0) {
        queryParams.set('tags', request.query.tags.join(','));
      }
      if (request.query.category) {
        queryParams.set('category', request.query.category);
      }
      if (request.query.priority && request.query.priority.length > 0) {
        queryParams.set('priority', request.query.priority.join(','));
      }
      if (request.query.isShared !== undefined) {
        queryParams.set('isShared', String(request.query.isShared));
      }
      if (request.query.hasCollaborators !== undefined) {
        queryParams.set('hasCollaborators', String(request.query.hasCollaborators));
      }
    }

    // Add filters
    if (request.filters) {
      if (request.filters.dateRange) {
        queryParams.set('dateRangeStart', request.filters.dateRange.startDate);
        queryParams.set('dateRangeEnd', request.filters.dateRange.endDate);
        if (request.filters.dateRange.field) {
          queryParams.set('dateRangeField', request.filters.dateRange.field);
        }
      }
      if (request.filters.sizeRange) {
        if (request.filters.sizeRange.minSize) {
          queryParams.set('minSize', String(request.filters.sizeRange.minSize));
        }
        if (request.filters.sizeRange.maxSize) {
          queryParams.set('maxSize', String(request.filters.sizeRange.maxSize));
        }
      }
      if (request.filters.versionRange) {
        if (request.filters.versionRange.minVersion) {
          queryParams.set('minVersion', String(request.filters.versionRange.minVersion));
        }
        if (request.filters.versionRange.maxVersion) {
          queryParams.set('maxVersion', String(request.filters.versionRange.maxVersion));
        }
      }
      if (request.filters.collaboratorCount) {
        if (request.filters.collaboratorCount.min) {
          queryParams.set('minCollaborators', String(request.filters.collaboratorCount.min));
        }
        if (request.filters.collaboratorCount.max) {
          queryParams.set('maxCollaborators', String(request.filters.collaboratorCount.max));
        }
      }
      if (request.filters.activityLevel) {
        queryParams.set('activityLevel', request.filters.activityLevel);
      }
    }

    // Add options
    if (request.options) {
      if (request.options.sortBy) {
        queryParams.set('sortBy', request.options.sortBy);
      }
      if (request.options.sortOrder) {
        queryParams.set('sortOrder', request.options.sortOrder);
      }
      if (request.options.limit) {
        queryParams.set('limit', String(request.options.limit));
      }
      if (request.options.offset) {
        queryParams.set('offset', String(request.options.offset));
      }
      if (request.options.includeAnalytics !== undefined) {
        queryParams.set('includeAnalytics', String(request.options.includeAnalytics));
      }
      if (request.options.includePreview !== undefined) {
        queryParams.set('includePreview', String(request.options.includePreview));
      }
    }

    // Make GET request to the query sessions endpoint
    const response = await apiService.get<SessionQueryResponse['data']>(
      `/functions/v1/load-session/query?${queryParams.toString()}`,
      {
        'Accept': 'application/json',
        'X-Request-Source': 'mindmap-frontend',
        'X-Query-Version': '1.0'
      }
    );

    return response;

  } catch (error) {
    console.error('Query sessions API error:', error);
    
    return {
      success: false,
      error: {
        code: 'API_ERROR',
        message: 'Failed to query sessions',
        details: { error: String(error) }
      }
    };
  }
}

/**
 * Get user's sessions (convenience function)
 * 
 * @param userId - User ID to get sessions for
 * @param options - Query options
 * @returns Promise with user's sessions
 */
export async function getUserSessions(
  userId: string,
  options: {
    type?: string[];
    status?: string[];
    limit?: number;
    sortBy?: 'name' | 'createdAt' | 'updatedAt';
    sortOrder?: 'asc' | 'desc';
  } = {}
): Promise<ApiResponse<SessionQueryResponse['data']>> {
  return querySessions({
    query: {
      userId,
      type: options.type,
      status: options.status || ['active', 'paused']
    },
    options: {
      sortBy: options.sortBy || 'updatedAt',
      sortOrder: options.sortOrder || 'desc',
      limit: options.limit || 50,
      includeAnalytics: true,
      includePreview: true
    }
  });
}

/**
 * Get shared sessions (convenience function)
 * 
 * @param userId - User ID to get shared sessions for
 * @param limit - Maximum number of sessions to return
 * @returns Promise with shared sessions
 */
export async function getSharedSessions(
  userId?: string,
  limit: number = 20
): Promise<ApiResponse<SessionQueryResponse['data']>> {
  return querySessions({
    query: {
      userId,
      isShared: true,
      hasCollaborators: true
    },
    options: {
      sortBy: 'updatedAt',
      sortOrder: 'desc',
      limit,
      includeAnalytics: true,
      includePreview: true
    }
  });
}

/**
 * Get recent sessions (convenience function)
 * 
 * @param userId - Optional user ID to filter by
 * @param days - Number of days to look back (default: 30)
 * @param limit - Maximum number of sessions to return
 * @returns Promise with recent sessions
 */
export async function getRecentSessions(
  userId?: string,
  days: number = 30,
  limit: number = 20
): Promise<ApiResponse<SessionQueryResponse['data']>> {
  const endDate = new Date();
  const startDate = new Date(endDate.getTime() - (days * 24 * 60 * 60 * 1000));

  return querySessions({
    query: {
      userId,
      status: ['active', 'paused']
    },
    filters: {
      dateRange: {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        field: 'lastAccessedAt'
      },
      activityLevel: 'medium'
    },
    options: {
      sortBy: 'updatedAt',
      sortOrder: 'desc',
      limit,
      includeAnalytics: true,
      includePreview: true
    }
  });
}

/**
 * Search sessions by name or content (convenience function)
 * 
 * @param searchTerm - Term to search for
 * @param userId - Optional user ID to filter by
 * @param limit - Maximum number of sessions to return
 * @returns Promise with search results
 */
export async function searchSessions(
  searchTerm: string,
  userId?: string,
  limit: number = 20
): Promise<ApiResponse<SessionQueryResponse['data']>> {
  if (!searchTerm || searchTerm.trim().length < 2) {
    return {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Search term must be at least 2 characters long'
      }
    };
  }

  // Note: In a real implementation, you'd pass searchTerm as a query parameter
  // For now, we'll use the existing query structure
  return querySessions({
    query: {
      userId,
      status: ['active', 'paused', 'completed']
    },
    options: {
      sortBy: 'updatedAt',
      sortOrder: 'desc',
      limit,
      includeAnalytics: true,
      includePreview: true
    }
  });
}