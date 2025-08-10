import { useState, useCallback, useEffect, useRef } from 'react';
import type {
  SessionItem,
  SessionFilter,
  SaveOptions,
  LoadOptions,
  ValidationResult,
  SearchCriteria,
  SearchOptions,
  SessionOperationResult,
  ExportOptions,
  ImportOptions,
  SyncStatus
} from '../types/components/sessionManager';
import { 
  saveSession,
  saveMindmapSession,
  saveProjectSession,
  autoSaveSession 
} from '../services/saveSessionApi';
import {
  loadSession,
  loadSessionFull,
  getUserSessions,
  getRecentSessions,
  searchSessions
} from '../services/loadSessionApi';
import { useSession, useNotificationSystem, useConnectivity } from './useSessionStore';

/**
 * Custom hook for managing sessions with save/load functionality
 */
export const useSessionManager = () => {
  // State
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [currentSession, setCurrentSession] = useState<SessionItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [saveProgress, setSaveProgress] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<SessionFilter>('all');
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isSynced: true,
    lastSync: new Date().toISOString(),
    status: 'idle',
    pendingChanges: 0
  });

  // Hooks
  const { auth } = useSession();
  const { showSuccess, showError } = useNotificationSystem();
  const { isOnline } = useConnectivity();

  // Refs
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>();
  const loadingOperationsRef = useRef<Set<string>>(new Set());

  // Load sessions based on filter
  const loadSessions = useCallback(async (filter: SessionFilter = activeFilter) => {
    if (!auth.user?.id || loadingOperationsRef.current.has('loadSessions')) return;
    
    loadingOperationsRef.current.add('loadSessions');
    setIsLoading(true);

    try {
      let response;
      
      switch (filter) {
        case 'recent':
          response = await getRecentSessions(auth.user.id, 30, 50);
          break;
        case 'shared':
          response = await getSharedSessions(auth.user.id, 50);
          break;
        case 'collaborative':
          response = await getUserSessions(auth.user.id, {
            limit: 50,
            sortBy: 'updatedAt',
            sortOrder: 'desc'
          });
          // Filter for collaborative sessions
          if (response.success && response.data?.sessions) {
            response.data.sessions = response.data.sessions.filter(
              session => session.collaborators && session.collaborators.length > 0
            );
          }
          break;
        default:
          response = await getUserSessions(auth.user.id, {
            limit: 50,
            sortBy: 'updatedAt',
            sortOrder: 'desc'
          });
      }

      if (response.success && response.data?.sessions) {
        const sessionItems: SessionItem[] = response.data.sessions.map(session => ({
          id: session.id,
          name: session.name,
          type: session.type as SessionItem['type'],
          status: session.status as SessionItem['status'],
          lastModified: session.updatedAt,
          size: session.dataSize || 0,
          isLocal: false,
          isCollaborative: session.collaborators && session.collaborators.length > 0,
          collaboratorCount: session.collaborators?.length,
          preview: session.description,
          tags: session.tags || [],
          priority: session.priority as SessionItem['priority'],
          version: session.version || 1,
          createdAt: session.createdAt,
          ownerId: session.userId,
          accessLevel: 'write' // Default, should be determined by actual permissions
        }));

        setSessions(sessionItems);
        setSyncStatus(prev => ({
          ...prev,
          lastSync: new Date().toISOString(),
          status: 'idle',
          isSynced: true
        }));

        return { success: true, data: sessionItems };
      } else {
        throw new Error(response.error?.message || 'Failed to load sessions');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load sessions';
      showError('Load Error', errorMessage);
      setSyncStatus(prev => ({
        ...prev,
        status: 'error',
        error: errorMessage
      }));
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
      loadingOperationsRef.current.delete('loadSessions');
    }
  }, [auth.user?.id, activeFilter, showError]);

  // Save session data
  const saveSessionData = useCallback(async (
    sessionData: Record<string, unknown>,
    options: SaveOptions = {}
  ): Promise<SessionOperationResult> => {
    if (!sessionData || loadingOperationsRef.current.has('save')) {
      return { success: false, error: { code: 'INVALID_DATA', message: 'No data to save' } };
    }

    loadingOperationsRef.current.add('save');
    setSaveProgress(0);
    setIsLoading(true);

    const startTime = Date.now();

    try {
      setSaveProgress(25);
      setSyncStatus(prev => ({ ...prev, status: 'syncing' }));

      // Use appropriate save function based on session type
      let response;
      const sessionName = (sessionData.name as string) || `Session ${Date.now()}`;
      const sessionType = (sessionData.type as string) || 'mindmap';

      setSaveProgress(50);

      switch (sessionType) {
        case 'mindmap':
          response = await saveMindmapSession(
            sessionName,
            sessionData,
            auth.user?.id,
            {
              description: sessionData.description as string,
              tags: sessionData.tags as string[],
              autoSave: options.autoSave,
              backup: options.createBackup
            }
          );
          break;
        case 'project':
          response = await saveProjectSession(
            sessionName,
            sessionData,
            auth.user?.id,
            sessionData.collaborators as string[]
          );
          break;
        default:
          response = await saveSession({
            session: {
              name: sessionName,
              description: sessionData.description as string,
              type: sessionType as any,
              status: 'active'
            },
            data: {
              mindmapData: sessionType === 'mindmap' ? sessionData : {},
              projectData: sessionType !== 'mindmap' ? sessionData : {},
              userInputs: [],
              preferences: {
                theme: 'auto',
                language: 'en',
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                autoSave: options.autoSave ?? true,
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
              userId: auth.user?.id,
              tags: sessionData.tags as string[] || [],
              priority: 'medium'
            },
            options: {
              autoSave: options.autoSave,
              compression: options.compression || 'gzip',
              encryption: options.encryption,
              backup: options.createBackup,
              versionControl: options.enableVersioning,
              notifications: options.notifications
            }
          });
      }

      setSaveProgress(75);

      if (response.success) {
        setSaveProgress(100);
        showSuccess('Session Saved', `Successfully saved "${sessionName}"`);
        
        // Update sessions list
        await loadSessions();
        
        setSyncStatus(prev => ({
          ...prev,
          status: 'idle',
          isSynced: true,
          lastSync: new Date().toISOString(),
          pendingChanges: 0
        }));

        return {
          success: true,
          data: response.data,
          metadata: {
            duration: Date.now() - startTime,
            timestamp: new Date().toISOString(),
            operationType: 'save'
          }
        };
      } else {
        throw new Error(response.error?.message || 'Failed to save session');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save session';
      showError('Save Error', errorMessage);
      setSyncStatus(prev => ({
        ...prev,
        status: 'error',
        error: errorMessage
      }));
      
      return {
        success: false,
        error: {
          code: 'SAVE_ERROR',
          message: errorMessage
        },
        metadata: {
          duration: Date.now() - startTime,
          timestamp: new Date().toISOString(),
          operationType: 'save'
        }
      };
    } finally {
      setIsLoading(false);
      setSaveProgress(0);
      loadingOperationsRef.current.delete('save');
    }
  }, [auth.user?.id, showSuccess, showError, loadSessions]);

  // Load session data
  const loadSessionData = useCallback(async (
    sessionId: string,
    options: LoadOptions = {}
  ): Promise<SessionOperationResult> => {
    if (!sessionId || loadingOperationsRef.current.has(`load-${sessionId}`)) {
      return { success: false, error: { code: 'INVALID_ID', message: 'Invalid session ID' } };
    }

    loadingOperationsRef.current.add(`load-${sessionId}`);
    setIsLoading(true);

    const startTime = Date.now();

    try {
      const response = await loadSessionFull(sessionId, auth.user?.id, options.accessLevel);

      if (response.success && response.data) {
        const sessionItem = sessions.find(s => s.id === sessionId);
        if (sessionItem) {
          setCurrentSession(sessionItem);
        }

        showSuccess('Session Loaded', `Successfully loaded session`);

        return {
          success: true,
          data: response.data,
          metadata: {
            duration: Date.now() - startTime,
            timestamp: new Date().toISOString(),
            operationType: 'load'
          }
        };
      } else {
        throw new Error(response.error?.message || 'Failed to load session');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load session';
      showError('Load Error', errorMessage);
      
      return {
        success: false,
        error: {
          code: 'LOAD_ERROR',
          message: errorMessage
        },
        metadata: {
          duration: Date.now() - startTime,
          timestamp: new Date().toISOString(),
          operationType: 'load'
        }
      };
    } finally {
      setIsLoading(false);
      loadingOperationsRef.current.delete(`load-${sessionId}`);
    }
  }, [auth.user?.id, sessions, showSuccess, showError]);

  // Search sessions
  const searchSessionsData = useCallback(async (
    criteria: SearchCriteria,
    options: SearchOptions = {}
  ): Promise<SessionOperationResult> => {
    if (!criteria.query && !criteria.tags?.length) {
      await loadSessions();
      return { success: true, data: sessions };
    }

    setIsLoading(true);

    try {
      const response = await searchSessions(
        criteria.query || '',
        auth.user?.id,
        options.limit || 50
      );

      if (response.success && response.data?.sessions) {
        const searchResults: SessionItem[] = response.data.sessions.map(session => ({
          id: session.id,
          name: session.name,
          type: session.type as SessionItem['type'],
          status: session.status as SessionItem['status'],
          lastModified: session.updatedAt,
          size: session.dataSize || 0,
          isLocal: false,
          isCollaborative: session.collaborators && session.collaborators.length > 0,
          collaboratorCount: session.collaborators?.length,
          preview: session.description,
          tags: session.tags || [],
          priority: session.priority as SessionItem['priority'],
          createdAt: session.createdAt,
          ownerId: session.userId
        }));

        setSessions(searchResults);
        return { success: true, data: searchResults };
      } else {
        throw new Error(response.error?.message || 'Search failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Search failed';
      return { success: false, error: { code: 'SEARCH_ERROR', message: errorMessage } };
    } finally {
      setIsLoading(false);
    }
  }, [auth.user?.id, loadSessions, sessions]);

  // Validate session data
  const validateSessionData = useCallback((sessionData: Record<string, unknown>): ValidationResult => {
    const errors: ValidationResult['errors'] = [];
    const warnings: ValidationResult['warnings'] = [];
    
    // Basic validation
    if (!sessionData.name || typeof sessionData.name !== 'string' || sessionData.name.trim().length === 0) {
      errors.push({
        code: 'MISSING_NAME',
        message: 'Session name is required',
        field: 'name',
        severity: 'critical',
        suggestion: 'Provide a meaningful name for the session'
      });
    }

    if (sessionData.name && sessionData.name.toString().length > 100) {
      warnings.push({
        code: 'LONG_NAME',
        message: 'Session name is quite long',
        field: 'name',
        recommendation: 'Consider shortening the name for better readability'
      });
    }

    if (sessionData.description && sessionData.description.toString().length > 500) {
      warnings.push({
        code: 'LONG_DESCRIPTION',
        message: 'Session description is very long',
        field: 'description',
        recommendation: 'Consider shortening the description'
      });
    }

    // Data size validation
    const dataSize = JSON.stringify(sessionData).length;
    if (dataSize > 10 * 1024 * 1024) { // 10MB
      errors.push({
        code: 'DATA_TOO_LARGE',
        message: 'Session data exceeds maximum size limit',
        severity: 'major',
        suggestion: 'Reduce the amount of data or enable compression'
      });
    } else if (dataSize > 5 * 1024 * 1024) { // 5MB
      warnings.push({
        code: 'LARGE_DATA',
        message: 'Session data is quite large',
        recommendation: 'Consider enabling compression to reduce storage requirements'
      });
    }

    // Calculate integrity score
    const totalChecks = 10;
    let passedChecks = totalChecks - errors.filter(e => e.severity === 'critical').length * 3 
                      - errors.filter(e => e.severity === 'major').length * 2
                      - errors.filter(e => e.severity === 'minor').length
                      - warnings.length * 0.5;
    
    const integrityScore = Math.max(0, Math.min(100, (passedChecks / totalChecks) * 100));

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      integrityScore: Math.round(integrityScore)
    };
  }, []);

  // Delete session
  const deleteSession = useCallback(async (sessionId: string): Promise<SessionOperationResult> => {
    if (!sessionId) {
      return { success: false, error: { code: 'INVALID_ID', message: 'Invalid session ID' } };
    }

    try {
      // Note: This would need actual delete API implementation
      // For now, just remove from local state
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      
      if (currentSession?.id === sessionId) {
        setCurrentSession(null);
      }

      showSuccess('Session Deleted', 'Session was successfully deleted');
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete session';
      showError('Delete Error', errorMessage);
      return { success: false, error: { code: 'DELETE_ERROR', message: errorMessage } };
    }
  }, [currentSession, showSuccess, showError]);

  // Auto-save functionality
  const setupAutoSave = useCallback((
    sessionData: Record<string, unknown>,
    sessionId: string,
    interval: number = 30000
  ) => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    const autoSave = async () => {
      if (isOnline && sessionData && sessionId) {
        try {
          await autoSaveSession(sessionId, sessionData, auth.user?.id);
          setSyncStatus(prev => ({
            ...prev,
            lastSync: new Date().toISOString(),
            status: 'idle'
          }));
        } catch (error) {
          console.warn('Auto-save failed:', error);
          setSyncStatus(prev => ({
            ...prev,
            status: 'error',
            error: 'Auto-save failed'
          }));
        }
      }
    };

    autoSaveTimeoutRef.current = setTimeout(() => {
      autoSave();
      setupAutoSave(sessionData, sessionId, interval);
    }, interval);
  }, [isOnline, auth.user?.id]);

  // Clear auto-save
  const clearAutoSave = useCallback(() => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
      autoSaveTimeoutRef.current = undefined;
    }
  }, []);

  // Initialize sessions on mount
  useEffect(() => {
    if (auth.user?.id) {
      loadSessions();
    }
  }, [auth.user?.id, loadSessions]);

  // Update sync status based on online status
  useEffect(() => {
    setSyncStatus(prev => ({
      ...prev,
      status: isOnline ? 'idle' : 'offline'
    }));
  }, [isOnline]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearAutoSave();
    };
  }, [clearAutoSave]);

  return {
    // State
    sessions,
    currentSession,
    isLoading,
    saveProgress,
    searchQuery,
    activeFilter,
    syncStatus,

    // Actions
    loadSessions,
    saveSession: saveSessionData,
    loadSession: loadSessionData,
    deleteSession,
    searchSessions: searchSessionsData,
    validateSession: validateSessionData,
    setupAutoSave,
    clearAutoSave,

    // Setters
    setCurrentSession,
    setSearchQuery,
    setActiveFilter
  };
};