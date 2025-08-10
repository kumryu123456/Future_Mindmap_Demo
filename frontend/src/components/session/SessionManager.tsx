import React, { useState, useCallback, useEffect } from 'react';
import type {
  SaveSessionRequest,
  LoadSessionRequest,
  SessionData,
  SessionMetadata
} from '../../types/api';
import { 
  saveSession,
  saveMindmapSession,
  saveProjectSession,
  autoSaveSession,
  saveCollaborativeSession
} from '../../services/saveSessionApi';
import {
  loadSession,
  loadSessionBasic,
  loadSessionFull,
  getUserSessions,
  getRecentSessions,
  searchSessions
} from '../../services/loadSessionApi';
import { useSession, useSessionUI, useNotificationSystem } from '../../hooks/useSessionStore';
import { useToast } from '../ui/ToastNotification';
import { ProgressIndicator } from '../ui/ProgressIndicator';

interface SessionItem {
  id: string;
  name: string;
  type: 'mindmap' | 'project' | 'research' | 'planning' | 'brainstorming' | 'analysis';
  status: 'active' | 'paused' | 'completed' | 'archived';
  lastModified: string;
  size: number;
  isLocal: boolean;
  isCollaborative: boolean;
  collaboratorCount?: number;
  preview?: string;
}

interface SessionManagerProps {
  /** Current session data to save/manage */
  currentSessionData?: Record<string, unknown>;
  /** Current session ID if editing existing */
  currentSessionId?: string;
  /** Session type for new sessions */
  defaultSessionType?: SessionItem['type'];
  /** Enable auto-save functionality */
  autoSave?: boolean;
  /** Auto-save interval in milliseconds */
  autoSaveInterval?: number;
  /** Show collaborative features */
  enableCollaboration?: boolean;
  /** Custom save/load handlers */
  onSave?: (sessionData: Record<string, unknown>) => Promise<void>;
  onLoad?: (sessionId: string) => Promise<Record<string, unknown> | null>;
  /** Event callbacks */
  onSessionChange?: (session: SessionItem | null) => void;
  onError?: (error: string) => void;
}

/**
 * SessionManager Component
 * Provides comprehensive session management with save/load interface
 */
export const SessionManager: React.FC<SessionManagerProps> = ({
  currentSessionData,
  currentSessionId,
  defaultSessionType = 'mindmap',
  autoSave = true,
  autoSaveInterval = 30000,
  enableCollaboration = true,
  onSave,
  onLoad,
  onSessionChange,
  onError
}) => {
  // State management
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [selectedSession, setSelectedSession] = useState<SessionItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [saveProgress, setSaveProgress] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [sessionFilter, setSessionFilter] = useState<'all' | 'recent' | 'shared' | 'local'>('all');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showLoadDialog, setShowLoadDialog] = useState(false);
  const [newSessionName, setNewSessionName] = useState('');
  const [newSessionDescription, setNewSessionDescription] = useState('');

  // Hooks
  const { auth, connectivity } = useSession();
  const { showToast, setLoading } = useSessionUI();
  const { showSuccess, showError } = useNotificationSystem();
  const toast = useToast();

  // Load user sessions on mount
  useEffect(() => {
    loadUserSessions();
  }, [auth.user?.id, sessionFilter]);

  // Auto-save functionality
  useEffect(() => {
    if (!autoSave || !currentSessionData || !currentSessionId) return;

    const interval = setInterval(() => {
      handleAutoSave();
    }, autoSaveInterval);

    return () => clearInterval(interval);
  }, [autoSave, currentSessionData, currentSessionId, autoSaveInterval]);

  // Load sessions based on filter
  const loadUserSessions = useCallback(async () => {
    if (!auth.user?.id) return;

    setIsLoading(true);
    try {
      let response;
      
      switch (sessionFilter) {
        case 'recent':
          response = await getRecentSessions(auth.user.id, 30, 20);
          break;
        case 'shared':
          response = await getSharedSessions(auth.user.id, 20);
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
          preview: session.description
        }));

        setSessions(sessionItems);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load sessions';
      showError('Load Error', errorMessage);
      toast.warning('Failed to load sessions list. Using cached data.', {
        duration: 4000,
        actions: [{ label: 'Retry', onClick: () => loadUserSessions() }]
      });
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [auth.user?.id, sessionFilter, showError, onError]);

  // Save current session
  const handleSave = useCallback(async () => {
    if (!currentSessionData || !newSessionName.trim()) return;

    setSaveProgress(0);
    setIsLoading(true);

    try {
      setSaveProgress(25);

      const saveRequest: SaveSessionRequest = {
        session: {
          id: currentSessionId,
          name: newSessionName.trim(),
          description: newSessionDescription.trim(),
          type: defaultSessionType,
          status: 'active'
        },
        data: {
          mindmapData: defaultSessionType === 'mindmap' ? currentSessionData : {},
          projectData: defaultSessionType !== 'mindmap' ? currentSessionData : {},
          userInputs: [],
          preferences: {
            theme: 'auto',
            language: 'en',
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            autoSave: autoSave,
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
          tags: [defaultSessionType],
          priority: 'medium'
        },
        options: {
          autoSave,
          compression: 'gzip',
          backup: true,
          versionControl: true,
          notifications: true
        }
      };

      setSaveProgress(50);

      let response;
      if (onSave) {
        await onSave(currentSessionData);
        response = { success: true };
      } else {
        response = await saveSession(saveRequest);
      }

      setSaveProgress(75);

      if (response.success) {
        setSaveProgress(100);
        showSuccess('Session Saved', `Successfully saved "${newSessionName}"`);
        toast.success(`Session "${newSessionName}" saved successfully!`, {
          duration: 4000,
          actions: [{ label: 'View', onClick: () => setShowLoadDialog(true) }]
        });
        setShowSaveDialog(false);
        setNewSessionName('');
        setNewSessionDescription('');
        
        // Refresh sessions list
        await loadUserSessions();
      } else {
        throw new Error(response.error?.message || 'Failed to save session');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save session';
      showError('Save Error', errorMessage);
      toast.error(`Failed to save session: ${errorMessage}`, {
        duration: 6000,
        actions: [{ label: 'Retry', onClick: () => handleSave() }]
      });
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
      setSaveProgress(0);
    }
  }, [
    currentSessionData,
    currentSessionId,
    newSessionName,
    newSessionDescription,
    defaultSessionType,
    autoSave,
    auth.user?.id,
    onSave,
    showSuccess,
    showError,
    onError,
    loadUserSessions
  ]);

  // Load selected session
  const handleLoad = useCallback(async (sessionItem: SessionItem) => {
    setIsLoading(true);

    try {
      let loadedData;

      if (onLoad) {
        loadedData = await onLoad(sessionItem.id);
      } else {
        const response = await loadSessionFull(sessionItem.id, auth.user?.id);
        
        if (response.success && response.data) {
          loadedData = response.data.session?.data;
        } else {
          throw new Error(response.error?.message || 'Failed to load session');
        }
      }

      if (loadedData) {
        setSelectedSession(sessionItem);
        onSessionChange?.(sessionItem);
        showSuccess('Session Loaded', `Successfully loaded "${sessionItem.name}"`);
        toast.success(`Session "${sessionItem.name}" loaded successfully!`, {
          duration: 3000
        });
        setShowLoadDialog(false);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load session';
      showError('Load Error', errorMessage);
      toast.error(`Failed to load session: ${errorMessage}`, {
        duration: 5000,
        actions: [{ label: 'Retry', onClick: () => handleLoad(sessionItem) }]
      });
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [auth.user?.id, onLoad, onSessionChange, showSuccess, showError, onError]);

  // Auto-save functionality
  const handleAutoSave = useCallback(async () => {
    if (!currentSessionData || !currentSessionId || !auth.user?.id) return;

    try {
      await autoSaveSession(currentSessionId, currentSessionData, auth.user.id);
      toast.info('Session auto-saved', { duration: 2000 });
    } catch (error) {
      console.warn('Auto-save failed:', error);
      toast.warning('Auto-save failed. Changes may be lost.', {
        duration: 5000,
        actions: [{ label: 'Save Now', onClick: () => setShowSaveDialog(true) }]
      });
    }
  }, [currentSessionData, currentSessionId, auth.user?.id, toast, setShowSaveDialog]);

  // Search sessions
  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      await loadUserSessions();
      return;
    }

    setIsLoading(true);
    try {
      const response = await searchSessions(query.trim(), auth.user?.id, 20);
      
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
          preview: session.description
        }));

        setSessions(searchResults);
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsLoading(false);
    }
  }, [auth.user?.id, loadUserSessions]);

  // Filter sessions
  const filteredSessions = sessions.filter(session => {
    if (searchQuery.trim()) {
      return session.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
             session.preview?.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  return (
    <div className="session-manager">
      {/* Header */}
      <div className="session-manager__header">
        <h2>Session Manager</h2>
        <div className="session-manager__actions">
          <button
            onClick={() => setShowSaveDialog(true)}
            disabled={!currentSessionData || isLoading}
            className="btn btn--primary"
          >
            Save Session
          </button>
          <button
            onClick={() => setShowLoadDialog(true)}
            disabled={isLoading}
            className="btn btn--secondary"
          >
            Load Session
          </button>
        </div>
      </div>

      {/* Current Session Info */}
      {selectedSession && (
        <div className="session-manager__current">
          <h3>Current Session</h3>
          <div className="session-card">
            <div className="session-card__info">
              <h4>{selectedSession.name}</h4>
              <p className="session-card__meta">
                {selectedSession.type} • {new Date(selectedSession.lastModified).toLocaleDateString()}
                {selectedSession.isCollaborative && (
                  <span className="session-card__collaborative">
                    • {selectedSession.collaboratorCount} collaborators
                  </span>
                )}
              </p>
              {selectedSession.preview && (
                <p className="session-card__preview">{selectedSession.preview}</p>
              )}
            </div>
            <div className="session-card__status">
              <span className={`status status--${selectedSession.status}`}>
                {selectedSession.status}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Save Progress */}
      {saveProgress > 0 && (
        <div className="session-manager__progress">
          <ProgressIndicator
            progress={{
              overall: saveProgress,
              tasks: { completed: Math.floor(saveProgress / 25), total: 4, inProgress: 0, notStarted: 0, blocked: 0 },
              phases: { completed: Math.floor(saveProgress / 50), total: 2, inProgress: 0, notStarted: 0, blocked: 0 },
              milestones: { completed: saveProgress === 100 ? 1 : 0, total: 1, upcoming: 0, overdue: 0, missed: 0 },
              timeline: { daysElapsed: 1, daysTotal: 1, daysRemaining: 0, isOnTrack: true }
            }}
            mode="compact"
            showLabels={false}
          />
        </div>
      )}

      {/* Auto-save Status */}
      {autoSave && currentSessionData && (
        <div className="session-manager__autosave">
          <span className={`autosave-status ${connectivity.isOnline ? 'online' : 'offline'}`}>
            Auto-save {connectivity.isOnline ? 'enabled' : 'paused (offline)'}
          </span>
        </div>
      )}

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal__header">
              <h3>Save Session</h3>
              <button onClick={() => setShowSaveDialog(false)} className="modal__close">×</button>
            </div>
            <div className="modal__content">
              <div className="form-field">
                <label htmlFor="session-name">Session Name *</label>
                <input
                  id="session-name"
                  type="text"
                  value={newSessionName}
                  onChange={(e) => setNewSessionName(e.target.value)}
                  placeholder="Enter session name..."
                  maxLength={100}
                />
              </div>
              <div className="form-field">
                <label htmlFor="session-description">Description</label>
                <textarea
                  id="session-description"
                  value={newSessionDescription}
                  onChange={(e) => setNewSessionDescription(e.target.value)}
                  placeholder="Optional description..."
                  rows={3}
                  maxLength={500}
                />
              </div>
            </div>
            <div className="modal__actions">
              <button onClick={() => setShowSaveDialog(false)} className="btn btn--secondary">
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!newSessionName.trim() || isLoading}
                className="btn btn--primary"
              >
                {isLoading ? 'Saving...' : 'Save Session'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Load Dialog */}
      {showLoadDialog && (
        <div className="modal-overlay">
          <div className="modal modal--large">
            <div className="modal__header">
              <h3>Load Session</h3>
              <button onClick={() => setShowLoadDialog(false)} className="modal__close">×</button>
            </div>
            <div className="modal__content">
              {/* Search and Filter */}
              <div className="session-browser__controls">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    handleSearch(e.target.value);
                  }}
                  placeholder="Search sessions..."
                  className="search-input"
                />
                <select
                  value={sessionFilter}
                  onChange={(e) => setSessionFilter(e.target.value as any)}
                  className="filter-select"
                >
                  <option value="all">All Sessions</option>
                  <option value="recent">Recent</option>
                  <option value="shared">Shared</option>
                  <option value="local">Local</option>
                </select>
              </div>

              {/* Sessions List */}
              <div className="sessions-list">
                {isLoading ? (
                  <div className="loading-state">Loading sessions...</div>
                ) : filteredSessions.length === 0 ? (
                  <div className="empty-state">
                    {searchQuery ? 'No sessions found matching your search.' : 'No sessions available.'}
                  </div>
                ) : (
                  filteredSessions.map((session) => (
                    <div key={session.id} className="session-item">
                      <div className="session-item__info">
                        <h4>{session.name}</h4>
                        <p className="session-item__meta">
                          {session.type} • {new Date(session.lastModified).toLocaleDateString()}
                          {session.isCollaborative && (
                            <span className="collaborative-indicator">
                              • {session.collaboratorCount} collaborators
                            </span>
                          )}
                        </p>
                        {session.preview && (
                          <p className="session-item__preview">{session.preview}</p>
                        )}
                      </div>
                      <div className="session-item__actions">
                        <span className={`status status--${session.status}`}>
                          {session.status}
                        </span>
                        <button
                          onClick={() => handleLoad(session)}
                          disabled={isLoading}
                          className="btn btn--small btn--primary"
                        >
                          Load
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            <div className="modal__actions">
              <button onClick={() => setShowLoadDialog(false)} className="btn btn--secondary">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionManager;