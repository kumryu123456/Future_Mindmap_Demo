import type { 
  LoadedSession, 
  SessionCollaborator,
  SessionSummary,
  LoadSessionRequest,
  SessionQueryRequest
} from '../types/api';

/**
 * Session loading utilities and helper functions
 */
export class LoadSessionUtils {
  /**
   * Validate session access permissions
   */
  static validateSessionAccess(
    session: LoadedSession,
    userId: string,
    requiredPermissions: string[] = ['read']
  ): {
    hasAccess: boolean;
    grantedPermissions: string[];
    missingPermissions: string[];
    accessLevel: 'none' | 'read' | 'write' | 'admin' | 'owner';
  } {
    const userPermission = session.permissions.find(p => p.userId === userId);
    
    if (!userPermission) {
      return {
        hasAccess: false,
        grantedPermissions: [],
        missingPermissions: requiredPermissions,
        accessLevel: 'none'
      };
    }

    const grantedPermissions = userPermission.permissions;
    const missingPermissions = requiredPermissions.filter(
      perm => !grantedPermissions.includes(perm as 'read' | 'write' | 'delete' | 'share' | 'admin')
    );

    // Determine access level
    let accessLevel: 'none' | 'read' | 'write' | 'admin' | 'owner' = 'none';
    if (userPermission.role === 'owner') accessLevel = 'owner';
    else if (userPermission.role === 'admin') accessLevel = 'admin';
    else if (grantedPermissions.includes('write')) accessLevel = 'write';
    else if (grantedPermissions.includes('read')) accessLevel = 'read';

    return {
      hasAccess: missingPermissions.length === 0,
      grantedPermissions,
      missingPermissions,
      accessLevel
    };
  }

  /**
   * Extract session metadata for display
   */
  static extractSessionMetadata(session: LoadedSession): {
    basicInfo: {
      name: string;
      type: string;
      status: string;
      created: string;
      lastModified: string;
      size: string;
      version: number;
    };
    collaboration: {
      isShared: boolean;
      collaboratorCount: number;
      owner?: string;
      permissions: string[];
    };
    activity: {
      totalViews: number;
      lastAccessed?: string;
      editCount: number;
      activityScore?: number;
    };
    technical: {
      dataSize: number;
      version: number;
      hasBackups: boolean;
      compressionEnabled?: boolean;
      encryptionEnabled?: boolean;
    };
  } {
    const owner = session.permissions.find(p => p.role === 'owner');
    const userPermissions = session.permissions
      .flatMap(p => p.permissions)
      .filter((perm, index, arr) => arr.indexOf(perm) === index);

    return {
      basicInfo: {
        name: session.name,
        type: session.type,
        status: session.status,
        created: new Date(session.createdAt).toLocaleDateString(),
        lastModified: new Date(session.updatedAt).toLocaleDateString(),
        size: this.formatFileSize(session.dataSize),
        version: session.version
      },
      collaboration: {
        isShared: session.isShared,
        collaboratorCount: session.collaborators.length,
        owner: owner?.userId,
        permissions: userPermissions
      },
      activity: {
        totalViews: session.analytics?.totalViews || 0,
        lastAccessed: session.lastAccessedAt,
        editCount: session.analytics?.editCount || 0,
        activityScore: session.analytics ? this.calculateActivityScore(session.analytics) : undefined
      },
      technical: {
        dataSize: session.dataSize,
        version: session.version,
        hasBackups: session.settings?.backupEnabled || false,
        compressionEnabled: session.settings?.compressionEnabled,
        encryptionEnabled: session.settings?.encryptionEnabled
      }
    };
  }

  /**
   * Filter session data based on access level
   */
  static filterSessionData(
    session: LoadedSession,
    accessLevel: 'read' | 'write' | 'admin',
    userId?: string
  ): LoadedSession {
    const filteredSession = { ...session };

    // Filter data based on access level
    if (accessLevel === 'read') {
      // Remove sensitive data for read-only access
      if (filteredSession.data?.apiCalls) {
        filteredSession.data.apiCalls = filteredSession.data.apiCalls.map(call => ({
          ...call,
          metadata: undefined // Remove potentially sensitive metadata
        }));
      }

      // Filter user inputs to remove personal information
      if (filteredSession.data?.userInputs) {
        filteredSession.data.userInputs = filteredSession.data.userInputs.map(input => ({
          ...input,
          metadata: input.metadata ? {
            source: input.metadata.source,
            format: input.metadata.format,
            language: input.metadata.language
          } : undefined
        }));
      }
    }

    // Filter collaborators based on user permissions
    if (userId && accessLevel !== 'admin') {
      const userPermission = session.permissions.find(p => p.userId === userId);
      if (!userPermission?.permissions.includes('admin')) {
        // Hide detailed collaborator information for non-admins
        filteredSession.collaborators = session.collaborators;
        // Remove detailed analytics
        if (filteredSession.analytics) {
          filteredSession.analytics = {
            ...filteredSession.analytics,
            activityLog: []
          };
        }
      }
    }

    return filteredSession;
  }

  /**
   * Merge session data with updates
   */
  static mergeSessionData(
    baseSession: LoadedSession,
    updates: Partial<LoadedSession>,
    strategy: 'overwrite' | 'merge' | 'preserve' = 'merge'
  ): LoadedSession {
    const merged = { ...baseSession };

    Object.keys(updates).forEach(key => {
      const updateValue = updates[key as keyof LoadedSession];
      if (updateValue !== undefined) {
        switch (strategy) {
          case 'overwrite':
            (merged as Record<string, unknown>)[key] = updateValue;
            break;
          case 'merge':
            if (typeof updateValue === 'object' && updateValue !== null && !Array.isArray(updateValue)) {
              (merged as Record<string, unknown>)[key] = { ...(merged as Record<string, unknown>)[key] as Record<string, unknown>, ...updateValue };
            } else {
              (merged as Record<string, unknown>)[key] = updateValue;
            }
            break;
          case 'preserve':
            if ((merged as Record<string, unknown>)[key] === undefined) {
              (merged as Record<string, unknown>)[key] = updateValue;
            }
            break;
        }
      }
    });

    return merged;
  }

  /**
   * Generate session summary for display
   */
  static generateSessionSummary(session: LoadedSession): {
    title: string;
    description: string;
    stats: Array<{ label: string; value: string; type?: 'success' | 'warning' | 'info' }>;
    tags: string[];
    actions: Array<{ label: string; action: string; enabled: boolean }>;
  } {
    const metadata = this.extractSessionMetadata(session);
    
    const stats: Array<{ label: string; value: string; type?: 'success' | 'warning' | 'info' }> = [
      { label: 'Size', value: metadata.basicInfo.size, type: 'info' },
      { label: 'Version', value: `v${metadata.basicInfo.version}`, type: 'info' },
      { label: 'Views', value: String(metadata.activity.totalViews), type: 'info' },
      { label: 'Collaborators', value: String(metadata.collaboration.collaboratorCount), type: 'info' }
    ];

    // Add status-based stats
    if (session.status === 'active') {
      stats.push({ label: 'Status', value: 'Active', type: 'success' });
    } else if (session.status === 'paused') {
      stats.push({ label: 'Status', value: 'Paused', type: 'warning' });
    }

    const actions = [
      { label: 'View', action: 'view', enabled: true },
      { label: 'Edit', action: 'edit', enabled: metadata.collaboration.permissions.includes('write') },
      { label: 'Share', action: 'share', enabled: metadata.collaboration.permissions.includes('share') },
      { label: 'Download', action: 'download', enabled: true },
      { label: 'Delete', action: 'delete', enabled: metadata.collaboration.permissions.includes('delete') }
    ];

    return {
      title: session.name,
      description: session.description || `${session.type} session created ${metadata.basicInfo.created}`,
      stats,
      tags: session.tags,
      actions
    };
  }

  /**
   * Sort sessions by various criteria
   */
  static sortSessions<T extends SessionSummary | LoadedSession>(
    sessions: T[],
    sortBy: 'name' | 'createdAt' | 'updatedAt' | 'size' | 'priority' | 'activity',
    sortOrder: 'asc' | 'desc' = 'desc'
  ): T[] {
    return [...sessions].sort((a, b) => {
      let valueA: string | number | Date;
      let valueB: string | number | Date;

      switch (sortBy) {
        case 'name':
          valueA = a.name.toLowerCase();
          valueB = b.name.toLowerCase();
          break;
        case 'createdAt':
          valueA = new Date(a.createdAt);
          valueB = new Date(b.createdAt);
          break;
        case 'updatedAt':
          valueA = new Date(a.updatedAt);
          valueB = new Date(b.updatedAt);
          break;
        case 'size':
          valueA = a.dataSize;
          valueB = b.dataSize;
          break;
        case 'priority': {
          const priorityOrder = { low: 0, medium: 1, high: 2, critical: 3 };
          valueA = priorityOrder[a.priority as keyof typeof priorityOrder] || 1;
          valueB = priorityOrder[b.priority as keyof typeof priorityOrder] || 1;
          break;
        }
        case 'activity':
          valueA = 'analytics' in a && a.analytics ? 
            (a.analytics.totalViews + ('editCount' in a.analytics ? a.analytics.editCount : 0)) : 0;
          valueB = 'analytics' in b && b.analytics ? 
            (b.analytics.totalViews + ('editCount' in b.analytics ? b.analytics.editCount : 0)) : 0;
          break;
        default:
          valueA = new Date(a.updatedAt);
          valueB = new Date(b.updatedAt);
      }

      if (valueA < valueB) return sortOrder === 'asc' ? -1 : 1;
      if (valueA > valueB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }

  /**
   * Filter sessions by criteria
   */
  static filterSessions<T extends SessionSummary | LoadedSession>(
    sessions: T[],
    filters: {
      type?: string[];
      status?: string[];
      tags?: string[];
      priority?: string[];
      hasCollaborators?: boolean;
      isShared?: boolean;
      sizeRange?: { min?: number; max?: number };
      dateRange?: { startDate: string; endDate: string; field?: 'createdAt' | 'updatedAt' };
      searchTerm?: string;
    }
  ): T[] {
    return sessions.filter(session => {
      // Type filter
      if (filters.type && !filters.type.includes(session.type)) {
        return false;
      }

      // Status filter
      if (filters.status && !filters.status.includes(session.status)) {
        return false;
      }

      // Tags filter
      if (filters.tags && !filters.tags.some(tag => session.tags.includes(tag))) {
        return false;
      }

      // Priority filter
      if (filters.priority && !filters.priority.includes(session.priority)) {
        return false;
      }

      // Collaborators filter
      if (filters.hasCollaborators !== undefined) {
        const hasCollabs = 'collaborators' in session ? 
          session.collaborators.length > 0 : 
          'collaboratorCount' in session ? session.collaboratorCount > 0 : false;
        if (filters.hasCollaborators !== hasCollabs) {
          return false;
        }
      }

      // Shared filter
      if (filters.isShared !== undefined && session.isShared !== filters.isShared) {
        return false;
      }

      // Size range filter
      if (filters.sizeRange) {
        if (filters.sizeRange.min && session.dataSize < filters.sizeRange.min) {
          return false;
        }
        if (filters.sizeRange.max && session.dataSize > filters.sizeRange.max) {
          return false;
        }
      }

      // Date range filter
      if (filters.dateRange) {
        const field = filters.dateRange.field || 'updatedAt';
        const sessionDate = new Date(session[field]);
        const startDate = new Date(filters.dateRange.startDate);
        const endDate = new Date(filters.dateRange.endDate);
        if (sessionDate < startDate || sessionDate > endDate) {
          return false;
        }
      }

      // Search term filter
      if (filters.searchTerm) {
        const term = filters.searchTerm.toLowerCase();
        const searchableText = [
          session.name,
          session.description || '',
          ...session.tags
        ].join(' ').toLowerCase();
        if (!searchableText.includes(term)) {
          return false;
        }
      }

      return true;
    });
  }

  /**
   * Group sessions by category
   */
  static groupSessions<T extends SessionSummary | LoadedSession>(
    sessions: T[],
    groupBy: 'type' | 'status' | 'priority' | 'category' | 'date' | 'size'
  ): Record<string, T[]> {
    const groups: Record<string, T[]> = {};

    sessions.forEach(session => {
      let groupKey: string;

      switch (groupBy) {
        case 'type':
          groupKey = session.type;
          break;
        case 'status':
          groupKey = session.status;
          break;
        case 'priority':
          groupKey = session.priority;
          break;
        case 'category':
          groupKey = session.category || 'uncategorized';
          break;
        case 'date': {
          const date = new Date(session.updatedAt);
          groupKey = date.toISOString().split('T')[0];
          break;
        }
        case 'size': {
          const size = session.dataSize;
          groupKey = size < 1024 * 1024 ? 'Small (<1MB)' :
                    size < 10 * 1024 * 1024 ? 'Medium (<10MB)' :
                    size < 100 * 1024 * 1024 ? 'Large (<100MB)' : 'Very Large (>100MB)';
          break;
        }
        default:
          groupKey = 'unknown';
      }

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(session);
    });

    return groups;
  }

  /**
   * Build load session request with defaults
   */
  static buildLoadRequest(
    sessionId: string,
    options: {
      accessLevel?: 'read' | 'write' | 'admin';
      includeData?: boolean;
      includeHistory?: boolean;
      includeCollaborators?: boolean;
      userId?: string;
      organizationId?: string;
    } = {}
  ): LoadSessionRequest {
    return {
      sessionId,
      options: {
        includeData: options.includeData ?? true,
        includeAnalytics: true,
        includeCollaborators: options.includeCollaborators ?? false,
        includeHistory: options.includeHistory ?? false,
        includeBackups: false,
        dataCompression: 'auto',
        accessLevel: options.accessLevel || 'read'
      },
      filters: {
        userId: options.userId,
        includeDeleted: false
      },
      metadata: {
        requesterId: options.userId,
        organizationId: options.organizationId,
        clientInfo: {
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
          platform: typeof navigator !== 'undefined' ? navigator.platform : 'unknown',
          version: '1.0.0'
        }
      }
    };
  }

  /**
   * Build session query request with defaults
   */
  static buildQueryRequest(
    options: {
      userId?: string;
      type?: string[];
      status?: string[];
      limit?: number;
      sortBy?: 'name' | 'createdAt' | 'updatedAt' | 'size' | 'priority' | 'activity';
      sortOrder?: 'asc' | 'desc';
      includeShared?: boolean;
      searchTerm?: string;
    } = {}
  ): SessionQueryRequest {
    return {
      query: {
        userId: options.userId,
        type: options.type,
        status: options.status || ['active', 'paused'],
        isShared: options.includeShared
      },
      options: {
        sortBy: options.sortBy || 'updatedAt',
        sortOrder: options.sortOrder || 'desc',
        limit: options.limit || 50,
        offset: 0,
        includeAnalytics: true,
        includePreview: true
      }
    };
  }

  /**
   * Extract collaborator insights
   */
  static analyzeCollaborators(collaborators: SessionCollaborator[]): {
    totalCollaborators: number;
    activeCollaborators: number;
    roleDistribution: Record<string, number>;
    activitySummary: {
      totalEdits: number;
      totalComments: number;
      totalTime: number;
      mostActiveUser?: string;
    };
    recommendations: string[];
  } {
    const totalCollaborators = collaborators.length;
    const activeCollaborators = collaborators.filter(c => c.status === 'active').length;
    
    const roleDistribution = collaborators.reduce((acc, c) => {
      acc[c.role] = (acc[c.role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const totalEdits = collaborators.reduce((sum, c) => sum + c.contributionStats.editsCount, 0);
    const totalComments = collaborators.reduce((sum, c) => sum + c.contributionStats.commentsCount, 0);
    const totalTime = collaborators.reduce((sum, c) => sum + c.contributionStats.timeSpent, 0);
    
    const mostActiveUser = collaborators.reduce((most, current) => {
      const currentActivity = current.contributionStats.editsCount + current.contributionStats.commentsCount;
      const mostActivity = most.contributionStats.editsCount + most.contributionStats.commentsCount;
      return currentActivity > mostActivity ? current : most;
    }, collaborators[0])?.userId;

    const recommendations: string[] = [];
    if (activeCollaborators < totalCollaborators * 0.5) {
      recommendations.push('Low collaboration activity - consider re-engaging inactive collaborators');
    }
    if (totalEdits === 0) {
      recommendations.push('No edits recorded - session may need more active collaboration');
    }
    if (roleDistribution.owner && roleDistribution.owner > 1) {
      recommendations.push('Multiple owners detected - consider clarifying ownership roles');
    }

    return {
      totalCollaborators,
      activeCollaborators,
      roleDistribution,
      activitySummary: {
        totalEdits,
        totalComments,
        totalTime,
        mostActiveUser
      },
      recommendations
    };
  }

  // Private helper methods
  private static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  private static calculateActivityScore(analytics: Record<string, unknown>): number {
    const viewWeight = 1;
    const editWeight = 5;
    const shareWeight = 3;
    const timeWeight = 0.01;

    return Math.min(
      (analytics.totalViews * viewWeight) + 
      (analytics.editCount * editWeight) + 
      (analytics.shareCount * shareWeight) + 
      (analytics.usageStats?.dailyActiveTime || 0) * timeWeight,
      100
    );
  }
}