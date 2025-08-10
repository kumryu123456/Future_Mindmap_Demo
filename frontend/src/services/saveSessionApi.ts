import { apiService } from './api';
import type { 
  SaveSessionRequest, 
  SaveSessionResponse, 
  ApiResponse 
} from '../types/api';

/**
 * Save user session data
 * 
 * @param request - The save session request payload
 * @returns Promise with save session response
 */
export async function saveSession(
  request: SaveSessionRequest
): Promise<ApiResponse<SaveSessionResponse['data']>> {
  try {
    // Validate required fields
    if (!request.session?.name || request.session.name.trim() === '') {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Session name is required and cannot be empty',
        }
      };
    }

    if (!request.session.type) {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Session type is required',
        }
      };
    }

    if (!request.session.status) {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Session status is required',
        }
      };
    }

    // Validate data size if provided
    if (request.data && Object.keys(request.data).length === 0) {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Session data cannot be empty when provided',
        }
      };
    }

    // Validate user permissions
    if (request.metadata?.organizationId && !request.metadata?.userId) {
      return {
        success: false,
        error: {
          code: 'AUTHORIZATION_ERROR',
          message: 'User ID is required when saving to organization',
        }
      };
    }

    // Prepare request payload
    const payload = {
      session: {
        id: request.session.id,
        name: request.session.name.trim(),
        description: request.session.description?.trim() || '',
        type: request.session.type,
        status: request.session.status
      },
      data: {
        mindmapData: request.data.mindmapData || {},
        projectData: request.data.projectData || {},
        userInputs: request.data.userInputs || [],
        apiCalls: request.data.apiCalls || [],
        preferences: request.data.preferences || {
          theme: 'auto',
          language: 'en',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          autoSave: true,
          notifications: {
            email: false,
            push: false,
            inApp: true
          },
          display: {
            density: 'standard',
            animations: true,
            shortcuts: true
          },
          privacy: {
            analytics: false,
            sharing: false,
            publicProfile: false
          }
        },
        progress: request.data.progress || {
          currentStep: 0,
          totalSteps: 1,
          completedTasks: [],
          pendingTasks: [],
          milestones: [],
          timeSpent: 0
        }
      },
      metadata: {
        userId: request.metadata.userId,
        organizationId: request.metadata.organizationId,
        collaborators: request.metadata.collaborators || [],
        tags: request.metadata.tags || [],
        category: request.metadata.category,
        priority: request.metadata.priority || 'medium'
      },
      options: {
        autoSave: request.options?.autoSave ?? true,
        compression: request.options?.compression || 'gzip',
        encryption: request.options?.encryption ?? false,
        backup: request.options?.backup ?? true,
        versionControl: request.options?.versionControl ?? true,
        notifications: request.options?.notifications ?? true
      }
    };

    // Make POST request to the save session endpoint
    const response = await apiService.post<SaveSessionResponse['data']>(
      '/functions/v1/save-session',
      payload,
      {
        'Content-Type': 'application/json',
        'X-Request-Source': 'mindmap-frontend',
        'X-Session-Version': '1.0'
      }
    );

    return response;

  } catch (error) {
    console.error('Save session API error:', error);
    
    return {
      success: false,
      error: {
        code: 'API_ERROR',
        message: 'Failed to save session',
        details: { error: String(error) }
      }
    };
  }
}

/**
 * Save mindmap session (convenience function)
 * 
 * @param name - Session name
 * @param mindmapData - Mindmap data to save
 * @param userId - User ID
 * @param options - Save options
 * @returns Promise with save session response
 */
export async function saveMindmapSession(
  name: string,
  mindmapData: Record<string, unknown>,
  userId?: string,
  options?: {
    description?: string;
    tags?: string[];
    autoSave?: boolean;
    backup?: boolean;
  }
): Promise<ApiResponse<SaveSessionResponse['data']>> {
  return saveSession({
    session: {
      name,
      description: options?.description,
      type: 'mindmap',
      status: 'active'
    },
    data: {
      mindmapData,
      preferences: {
        theme: 'auto',
        language: 'en',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        autoSave: options?.autoSave ?? true,
        notifications: {
          email: false,
          push: false,
          inApp: true
        },
        display: {
          density: 'standard',
          animations: true,
          shortcuts: true
        },
        privacy: {
          analytics: false,
          sharing: false,
          publicProfile: false
        }
      }
    },
    metadata: {
      userId,
      tags: options?.tags,
      priority: 'medium'
    },
    options: {
      autoSave: options?.autoSave,
      backup: options?.backup
    }
  });
}

/**
 * Save project session (convenience function)
 * 
 * @param name - Project name
 * @param projectData - Project data to save
 * @param userId - User ID
 * @param collaborators - Project collaborators
 * @returns Promise with save session response
 */
export async function saveProjectSession(
  name: string,
  projectData: Record<string, unknown>,
  userId?: string,
  collaborators?: string[]
): Promise<ApiResponse<SaveSessionResponse['data']>> {
  return saveSession({
    session: {
      name,
      type: 'project',
      status: 'active'
    },
    data: {
      projectData
    },
    metadata: {
      userId,
      collaborators,
      priority: 'high'
    },
    options: {
      versionControl: true,
      backup: true,
      notifications: true
    }
  });
}

/**
 * Save research session (convenience function)
 * 
 * @param name - Research session name
 * @param researchData - Research data to save
 * @param category - Research category
 * @param userId - User ID
 * @returns Promise with save session response
 */
export async function saveResearchSession(
  name: string,
  researchData: {
    queries?: string[];
    sources?: Record<string, unknown>[];
    findings?: Record<string, unknown>[];
    notes?: string[];
  },
  category?: string,
  userId?: string
): Promise<ApiResponse<SaveSessionResponse['data']>> {
  return saveSession({
    session: {
      name,
      type: 'research',
      status: 'active'
    },
    data: {
      projectData: researchData,
      userInputs: researchData.queries?.map((query, index) => ({
        id: `query-${index}`,
        type: 'text' as const,
        content: query,
        timestamp: new Date().toISOString(),
        metadata: {
          source: 'research_input',
          format: 'text',
          language: 'en'
        }
      })) || []
    },
    metadata: {
      userId,
      category,
      tags: ['research', category].filter(Boolean) as string[],
      priority: 'medium'
    },
    options: {
      versionControl: true,
      encryption: true
    }
  });
}

/**
 * Save planning session (convenience function)
 * 
 * @param name - Planning session name
 * @param planData - Plan data to save
 * @param timeframe - Planning timeframe
 * @param userId - User ID
 * @returns Promise with save session response
 */
export async function savePlanningSession(
  name: string,
  planData: Record<string, unknown>,
  timeframe?: string,
  userId?: string
): Promise<ApiResponse<SaveSessionResponse['data']>> {
  return saveSession({
    session: {
      name,
      description: `Planning session${timeframe ? ` for ${timeframe}` : ''}`,
      type: 'planning',
      status: 'active'
    },
    data: {
      projectData: planData,
      progress: {
        currentStep: 1,
        totalSteps: 5,
        completedTasks: [],
        pendingTasks: ['define_objectives', 'create_timeline', 'allocate_resources', 'identify_risks', 'finalize_plan'],
        milestones: [],
        timeSpent: 0
      }
    },
    metadata: {
      userId,
      tags: ['planning', timeframe].filter(Boolean) as string[],
      priority: 'high'
    },
    options: {
      versionControl: true,
      notifications: true
    }
  });
}

/**
 * Save brainstorming session (convenience function)
 * 
 * @param name - Brainstorming session name
 * @param ideas - Collection of ideas
 * @param participants - Session participants
 * @param userId - User ID
 * @returns Promise with save session response
 */
export async function saveBrainstormingSession(
  name: string,
  ideas: {
    id: string;
    content: string;
    author?: string;
    timestamp: string;
    votes?: number;
    category?: string;
  }[],
  participants?: string[],
  userId?: string
): Promise<ApiResponse<SaveSessionResponse['data']>> {
  return saveSession({
    session: {
      name,
      type: 'brainstorming',
      status: 'active'
    },
    data: {
      projectData: { ideas },
      userInputs: ideas.map(idea => ({
        id: idea.id,
        type: 'text' as const,
        content: idea.content,
        timestamp: idea.timestamp,
        metadata: {
          source: 'brainstorming',
          format: 'idea',
          confidence: (idea.votes || 0) / Math.max(participants?.length || 1, 1)
        }
      }))
    },
    metadata: {
      userId,
      collaborators: participants,
      tags: ['brainstorming', 'creative'],
      priority: 'medium'
    },
    options: {
      autoSave: true,
      notifications: true
    }
  });
}

/**
 * Save analysis session (convenience function)
 * 
 * @param name - Analysis session name
 * @param analysisData - Analysis data to save
 * @param analysisType - Type of analysis
 * @param userId - User ID
 * @returns Promise with save session response
 */
export async function saveAnalysisSession(
  name: string,
  analysisData: {
    datasets?: Record<string, unknown>[];
    results?: Record<string, unknown>;
    insights?: string[];
    recommendations?: string[];
  },
  analysisType?: string,
  userId?: string
): Promise<ApiResponse<SaveSessionResponse['data']>> {
  return saveSession({
    session: {
      name,
      description: `${analysisType || 'Data'} analysis session`,
      type: 'analysis',
      status: 'active'
    },
    data: {
      projectData: analysisData,
      progress: {
        currentStep: analysisData.results ? 3 : 1,
        totalSteps: 4,
        completedTasks: analysisData.results ? ['data_collection', 'analysis', 'results'] : ['data_collection'],
        pendingTasks: analysisData.results ? ['reporting'] : ['analysis', 'results', 'reporting'],
        milestones: [],
        timeSpent: 0
      }
    },
    metadata: {
      userId,
      category: analysisType,
      tags: ['analysis', analysisType].filter(Boolean) as string[],
      priority: 'high'
    },
    options: {
      versionControl: true,
      encryption: true,
      backup: true
    }
  });
}

/**
 * Auto-save session with current state (convenience function)
 * 
 * @param sessionId - Existing session ID
 * @param currentData - Current session data
 * @param userId - User ID
 * @returns Promise with save session response
 */
export async function autoSaveSession(
  sessionId: string,
  currentData: Record<string, unknown>,
  userId?: string
): Promise<ApiResponse<SaveSessionResponse['data']>> {
  return saveSession({
    session: {
      id: sessionId,
      name: `Auto-saved session ${new Date().toLocaleString()}`,
      type: 'mindmap',
      status: 'active'
    },
    data: {
      mindmapData: currentData,
      userInputs: [{
        id: `autosave-${Date.now()}`,
        type: 'interaction',
        content: 'Auto-save triggered',
        timestamp: new Date().toISOString(),
        metadata: {
          source: 'auto_save',
          format: 'system'
        }
      }]
    },
    metadata: {
      userId,
      tags: ['auto-saved'],
      priority: 'low'
    },
    options: {
      autoSave: true,
      compression: 'gzip',
      notifications: false
    }
  });
}

/**
 * Save session with full collaboration data (convenience function)
 * 
 * @param name - Session name
 * @param sessionData - Full session data
 * @param collaborationInfo - Collaboration information
 * @returns Promise with save session response
 */
export async function saveCollaborativeSession(
  name: string,
  sessionData: Record<string, unknown>,
  collaborationInfo: {
    userId: string;
    organizationId?: string;
    collaborators: string[];
    permissions: 'view' | 'edit' | 'admin';
    category?: string;
  }
): Promise<ApiResponse<SaveSessionResponse['data']>> {
  return saveSession({
    session: {
      name,
      description: 'Collaborative session with multiple participants',
      type: 'project',
      status: 'active'
    },
    data: {
      projectData: sessionData,
      preferences: {
        theme: 'auto',
        language: 'en',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        autoSave: true,
        notifications: {
          email: true,
          push: true,
          inApp: true
        },
        display: {
          density: 'standard',
          animations: true,
          shortcuts: true
        },
        privacy: {
          analytics: true,
          sharing: true,
          publicProfile: false
        }
      }
    },
    metadata: {
      userId: collaborationInfo.userId,
      organizationId: collaborationInfo.organizationId,
      collaborators: collaborationInfo.collaborators,
      category: collaborationInfo.category,
      tags: ['collaborative', 'shared'],
      priority: 'high'
    },
    options: {
      versionControl: true,
      backup: true,
      notifications: true,
      encryption: Boolean(collaborationInfo.organizationId)
    }
  });
}