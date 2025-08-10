import type { 
  SavedSession, 
  UserInput,
  ApiCallRecord,
  SessionProgress,
  SessionAnalytics,
  SaveSessionRequest
} from '../types/api';

/**
 * Session management utilities and helper functions
 */
export class SessionUtils {
  /**
   * Calculate session storage size in bytes
   */
  static calculateSessionSize(sessionData: Record<string, unknown>): number {
    const jsonString = JSON.stringify(sessionData);
    return new Blob([jsonString]).size;
  }

  /**
   * Compress session data for storage
   */
  static async compressSessionData(
    data: Record<string, unknown>,
    compressionType: 'gzip' | 'brotli' | 'none' = 'gzip'
  ): Promise<{ compressed: string; originalSize: number; compressedSize: number; ratio: number }> {
    const originalString = JSON.stringify(data);
    const originalSize = new Blob([originalString]).size;

    if (compressionType === 'none') {
      return {
        compressed: originalString,
        originalSize,
        compressedSize: originalSize,
        ratio: 1.0
      };
    }

    // Simulate compression (in real implementation, use actual compression)
    const compressed = btoa(originalString);
    const compressedSize = new Blob([compressed]).size;
    const ratio = compressedSize / originalSize;

    return {
      compressed,
      originalSize,
      compressedSize,
      ratio
    };
  }

  /**
   * Generate session checksum for integrity verification
   */
  static async generateChecksum(data: Record<string, unknown>): Promise<string> {
    const jsonString = JSON.stringify(data);
    const encoder = new TextEncoder();
    const dataBytes = encoder.encode(jsonString);
    
    if (crypto.subtle) {
      const hashBuffer = await crypto.subtle.digest('SHA-256', dataBytes);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
    
    // Fallback for environments without crypto.subtle
    return this.simpleHash(jsonString);
  }

  /**
   * Validate session data structure
   */
  static validateSessionData(request: Partial<SaveSessionRequest>): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    recommendations: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];

    // Required field validation
    if (!request.session?.name) {
      errors.push('Session name is required');
    } else if (request.session.name.length > 255) {
      warnings.push('Session name is very long (>255 chars)');
    }

    if (!request.session?.type) {
      errors.push('Session type is required');
    }

    if (!request.session?.status) {
      errors.push('Session status is required');
    }

    // Data validation
    if (request.data) {
      const dataSize = this.calculateSessionSize(request.data);
      if (dataSize > 50 * 1024 * 1024) { // 50MB
        warnings.push('Session data is very large (>50MB)');
        recommendations.push('Consider enabling compression to reduce storage size');
      }

      if (request.data.userInputs && request.data.userInputs.length > 10000) {
        warnings.push('Large number of user inputs may impact performance');
      }

      if (request.data.apiCalls && request.data.apiCalls.length > 5000) {
        warnings.push('Large number of API calls recorded');
        recommendations.push('Consider archiving old API call records');
      }
    }

    // Metadata validation
    if (request.metadata?.collaborators && request.metadata.collaborators.length > 100) {
      warnings.push('Large number of collaborators may impact performance');
    }

    if (request.metadata?.tags && request.metadata.tags.length > 50) {
      warnings.push('Too many tags may make session hard to organize');
    }

    // Options validation
    if (request.options?.compression === 'none' && request.data) {
      const dataSize = this.calculateSessionSize(request.data);
      if (dataSize > 10 * 1024 * 1024) { // 10MB
        recommendations.push('Enable compression for large session data');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      recommendations
    };
  }

  /**
   * Filter sessions by criteria
   */
  static filterSessions(
    sessions: SavedSession[],
    filters: {
      type?: string[];
      status?: string[];
      userId?: string;
      dateRange?: { startDate: string; endDate: string };
      tags?: string[];
      priority?: string[];
      hasCollaborators?: boolean;
      minSize?: number;
      maxSize?: number;
    }
  ): SavedSession[] {
    return sessions.filter(session => {
      // Type filter
      if (filters.type && !filters.type.includes(session.type)) {
        return false;
      }

      // Status filter
      if (filters.status && !filters.status.includes(session.status)) {
        return false;
      }

      // User filter
      if (filters.userId && session.userId !== filters.userId) {
        return false;
      }

      // Date range filter
      if (filters.dateRange) {
        const sessionDate = new Date(session.updatedAt);
        const startDate = new Date(filters.dateRange.startDate);
        const endDate = new Date(filters.dateRange.endDate);
        if (sessionDate < startDate || sessionDate > endDate) {
          return false;
        }
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
        const hasCollabs = session.collaborators.length > 0;
        if (filters.hasCollaborators !== hasCollabs) {
          return false;
        }
      }

      // Size filters
      if (filters.minSize && session.dataSize < filters.minSize) {
        return false;
      }

      if (filters.maxSize && session.dataSize > filters.maxSize) {
        return false;
      }

      return true;
    });
  }

  /**
   * Sort sessions by criteria
   */
  static sortSessions(
    sessions: SavedSession[],
    sortBy: 'name' | 'createdAt' | 'updatedAt' | 'dataSize' | 'priority' | 'type',
    sortOrder: 'asc' | 'desc' = 'desc'
  ): SavedSession[] {
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
        case 'dataSize':
          valueA = a.dataSize;
          valueB = b.dataSize;
          break;
        case 'priority': {
          const priorityOrder = { low: 0, medium: 1, high: 2, critical: 3 };
          valueA = priorityOrder[a.priority as keyof typeof priorityOrder] || 1;
          valueB = priorityOrder[b.priority as keyof typeof priorityOrder] || 1;
          break;
        }
        case 'type':
          valueA = a.type.toLowerCase();
          valueB = b.type.toLowerCase();
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
   * Group sessions by category
   */
  static groupSessions(
    sessions: SavedSession[],
    groupBy: 'type' | 'status' | 'priority' | 'userId' | 'date'
  ): Record<string, SavedSession[]> {
    const groups: Record<string, SavedSession[]> = {};

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
        case 'userId':
          groupKey = session.userId || 'unknown';
          break;
        case 'date': {
          const date = new Date(session.updatedAt);
          groupKey = date.toISOString().split('T')[0];
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
   * Calculate session analytics
   */
  static calculateSessionAnalytics(
    userInputs: UserInput[],
    _apiCalls: ApiCallRecord[],
    existingAnalytics?: Partial<SessionAnalytics>
  ): SessionAnalytics {
    const now = new Date();
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Calculate active times
    const recentInputs = userInputs.filter(input => 
      new Date(input.timestamp) > dayAgo
    );
    const weeklyInputs = userInputs.filter(input => 
      new Date(input.timestamp) > weekAgo
    );
    const monthlyInputs = userInputs.filter(input => 
      new Date(input.timestamp) > monthAgo
    );

    // Estimate active time based on input frequency
    const dailyActiveTime = Math.min(recentInputs.length * 2, 480); // Max 8 hours
    const weeklyActiveTime = Math.min(weeklyInputs.length * 2, 2400); // Max 40 hours
    const monthlyActiveTime = Math.min(monthlyInputs.length * 2, 9600); // Max 160 hours

    return {
      totalViews: existingAnalytics?.totalViews || 0,
      uniqueViewers: existingAnalytics?.uniqueViewers || 1,
      editCount: existingAnalytics?.editCount || userInputs.length,
      shareCount: existingAnalytics?.shareCount || 0,
      collaborationTime: existingAnalytics?.collaborationTime || 0,
      activityLog: existingAnalytics?.activityLog || [],
      usageStats: {
        dailyActiveTime,
        weeklyActiveTime,
        monthlyActiveTime,
        lastActiveDate: userInputs.length > 0 ? 
          userInputs[userInputs.length - 1].timestamp : 
          now.toISOString()
      }
    };
  }

  /**
   * Generate session progress report
   */
  static generateProgressReport(progress: SessionProgress): {
    completionPercentage: number;
    timeEfficiency: number;
    milestoneProgress: number;
    recommendations: string[];
  } {
    const completionPercentage = progress.totalSteps > 0 ? 
      (progress.currentStep / progress.totalSteps) * 100 : 0;

    const completedMilestones = progress.milestones.filter(m => m.status === 'completed').length;
    const milestoneProgress = progress.milestones.length > 0 ? 
      (completedMilestones / progress.milestones.length) * 100 : 0;

    // Simple time efficiency calculation
    const expectedTimePerStep = 30 * 60; // 30 minutes per step
    const expectedTime = progress.currentStep * expectedTimePerStep;
    const timeEfficiency = expectedTime > 0 ? 
      Math.min((expectedTime / progress.timeSpent) * 100, 200) : 100;

    const recommendations: string[] = [];

    if (completionPercentage < 25) {
      recommendations.push('Consider breaking down tasks into smaller, manageable steps');
    }

    if (timeEfficiency < 50) {
      recommendations.push('Session is taking longer than expected - consider reviewing approach');
    }

    if (progress.pendingTasks.length > 10) {
      recommendations.push('Large number of pending tasks - consider prioritizing most important ones');
    }

    if (milestoneProgress < completionPercentage - 20) {
      recommendations.push('Milestone progress is lagging behind overall progress');
    }

    return {
      completionPercentage,
      timeEfficiency,
      milestoneProgress,
      recommendations
    };
  }

  /**
   * Build session request with defaults
   */
  static buildSessionRequest(
    name: string,
    type: 'mindmap' | 'project' | 'research' | 'planning' | 'brainstorming' | 'analysis',
    data: Record<string, unknown>,
    overrides: Partial<SaveSessionRequest> = {}
  ): SaveSessionRequest {
    return {
      session: {
        name,
        type,
        status: 'active',
        ...overrides.session
      },
      data: {
        mindmapData: type === 'mindmap' ? data : {},
        projectData: type !== 'mindmap' ? data : {},
        userInputs: [],
        apiCalls: [],
        preferences: {
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
        progress: {
          currentStep: 1,
          totalSteps: 1,
          completedTasks: [],
          pendingTasks: [],
          milestones: [],
          timeSpent: 0
        },
        ...overrides.data
      },
      metadata: {
        tags: [],
        priority: 'medium',
        ...overrides.metadata
      },
      options: {
        autoSave: true,
        compression: 'gzip',
        encryption: false,
        backup: true,
        versionControl: true,
        notifications: true,
        ...overrides.options
      }
    };
  }

  /**
   * Merge session data for collaboration
   */
  static mergeSessionData(
    baseSession: Record<string, unknown>,
    updates: Record<string, unknown>[],
    strategy: 'last_write_wins' | 'merge_arrays' | 'deep_merge' = 'deep_merge'
  ): Record<string, unknown> {
    let result = { ...baseSession };

    updates.forEach(update => {
      switch (strategy) {
        case 'last_write_wins':
          result = { ...result, ...update };
          break;
        case 'merge_arrays':
          Object.keys(update).forEach(key => {
            if (Array.isArray(result[key]) && Array.isArray(update[key])) {
              result[key] = [...(result[key] as unknown[]), ...(update[key] as unknown[])];
            } else {
              result[key] = update[key];
            }
          });
          break;
        case 'deep_merge':
          result = this.deepMerge(result, update);
          break;
      }
    });

    return result;
  }

  /**
   * Extract session insights
   */
  static extractSessionInsights(session: SavedSession): {
    activityLevel: 'low' | 'medium' | 'high';
    collaborationScore: number;
    dataComplexity: 'simple' | 'moderate' | 'complex';
    recommendations: string[];
  } {
    // Activity level based on analytics
    const dailyTime = session.analytics.usageStats.dailyActiveTime;
    const activityLevel: 'low' | 'medium' | 'high' = 
      dailyTime > 240 ? 'high' : dailyTime > 60 ? 'medium' : 'low';

    // Collaboration score
    const collaborationScore = Math.min(
      (session.collaborators.length * 20) + 
      (session.analytics.shareCount * 10) + 
      (session.analytics.collaborationTime / 60),
      100
    );

    // Data complexity
    const dataComplexity: 'simple' | 'moderate' | 'complex' = 
      session.dataSize > 10 * 1024 * 1024 ? 'complex' : 
      session.dataSize > 1024 * 1024 ? 'moderate' : 'simple';

    const recommendations: string[] = [];

    if (activityLevel === 'low') {
      recommendations.push('Consider setting up regular session reminders');
    }

    if (collaborationScore < 20 && session.collaborators.length === 0) {
      recommendations.push('Consider inviting collaborators to improve productivity');
    }

    if (dataComplexity === 'complex') {
      recommendations.push('Enable compression and consider archiving old data');
    }

    return {
      activityLevel,
      collaborationScore,
      dataComplexity,
      recommendations
    };
  }

  // Private helper methods
  private static simpleHash(str: string): string {
    let hash = 0;
    if (str.length === 0) return hash.toString(16);
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }

  private static deepMerge(target: Record<string, unknown>, source: Record<string, unknown>): Record<string, unknown> {
    const result = { ...target };
    
    Object.keys(source).forEach(key => {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.deepMerge(
          (result[key] as Record<string, unknown>) || {},
          source[key] as Record<string, unknown>
        );
      } else {
        result[key] = source[key];
      }
    });
    
    return result;
  }
}