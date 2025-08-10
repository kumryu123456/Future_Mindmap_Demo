/**
 * useSessionManager Hook Tests
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useSessionManager } from '../useSessionManager';
import * as sessionStoreHooks from '../useSessionStore';
import * as saveSessionApi from '../../services/saveSessionApi';
import * as loadSessionApi from '../../services/loadSessionApi';

// Mock the dependencies
jest.mock('../useSessionStore');
jest.mock('../../services/saveSessionApi');
jest.mock('../../services/loadSessionApi');

const mockSessionStoreHooks = sessionStoreHooks as jest.Mocked<typeof sessionStoreHooks>;
const mockSaveSessionApi = saveSessionApi as jest.Mocked<typeof saveSessionApi>;
const mockLoadSessionApi = loadSessionApi as jest.Mocked<typeof loadSessionApi>;

const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
  username: 'testuser',
  displayName: 'Test User'
};

const mockSessionData = {
  name: 'Test Session',
  type: 'mindmap',
  description: 'Test description',
  nodes: [
    { id: 'node1', text: 'Node 1', x: 100, y: 100, connections: [] }
  ]
};

describe('useSessionManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock session hooks
    mockSessionStoreHooks.useSession.mockReturnValue({
      auth: {
        isAuthenticated: true,
        user: mockUser
      }
    } as any);
    
    mockSessionStoreHooks.useNotificationSystem.mockReturnValue({
      showSuccess: jest.fn(),
      showError: jest.fn()
    } as any);
    
    mockSessionStoreHooks.useConnectivity.mockReturnValue({
      isOnline: true
    } as any);
    
    // Mock API responses
    mockLoadSessionApi.getUserSessions.mockResolvedValue({
      success: true,
      data: {
        sessions: [
          {
            id: 'session-1',
            name: 'Test Session 1',
            type: 'mindmap',
            status: 'active',
            updatedAt: '2024-01-01T12:00:00Z',
            createdAt: '2024-01-01T00:00:00Z',
            userId: 'user-123',
            dataSize: 1024,
            collaborators: [],
            tags: ['test']
          }
        ]
      }
    });
  });

  describe('Initial State', () => {
    it('initializes with default state', () => {
      const { result } = renderHook(() => useSessionManager());
      
      expect(result.current.sessions).toEqual([]);
      expect(result.current.currentSession).toBeNull();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.saveProgress).toBe(0);
      expect(result.current.searchQuery).toBe('');
      expect(result.current.activeFilter).toBe('all');
      expect(result.current.syncStatus.isSynced).toBe(true);
      expect(result.current.syncStatus.status).toBe('idle');
    });

    it('loads sessions on mount when user is authenticated', async () => {
      const { result } = renderHook(() => useSessionManager());
      
      await waitFor(() => {
        expect(mockLoadSessionApi.getUserSessions).toHaveBeenCalledWith(
          'user-123',
          expect.objectContaining({
            limit: 50,
            sortBy: 'updatedAt',
            sortOrder: 'desc'
          })
        );
      });
      
      expect(result.current.sessions).toHaveLength(1);
      expect(result.current.sessions[0].name).toBe('Test Session 1');
    });
  });

  describe('Save Session', () => {
    it('saves session data successfully', async () => {
      mockSaveSessionApi.saveSession.mockResolvedValue({
        success: true,
        data: { sessionId: 'new-session-id' }
      });
      
      const { result } = renderHook(() => useSessionManager());
      
      let saveResult;
      await act(async () => {
        saveResult = await result.current.saveSession(mockSessionData, {
          autoSave: true,
          compression: 'gzip'
        });
      });
      
      expect(mockSaveSessionApi.saveSession).toHaveBeenCalledWith(
        expect.objectContaining({
          session: expect.objectContaining({
            name: 'Test Session',
            type: 'mindmap'
          }),
          options: expect.objectContaining({
            autoSave: true,
            compression: 'gzip'
          })
        })
      );
      
      expect(saveResult.success).toBe(true);
    });

    it('handles save errors properly', async () => {
      mockSaveSessionApi.saveSession.mockResolvedValue({
        success: false,
        error: {
          code: 'SAVE_ERROR',
          message: 'Save failed'
        }
      });
      
      const { result } = renderHook(() => useSessionManager());
      
      let saveResult;
      await act(async () => {
        saveResult = await result.current.saveSession(mockSessionData);
      });
      
      expect(saveResult.success).toBe(false);
      expect(saveResult.error?.message).toBe('Save failed');
    });

    it('updates save progress during save operation', async () => {
      let resolvePromise: (value: any) => void;
      const savePromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      
      mockSaveSessionApi.saveSession.mockReturnValue(savePromise);
      
      const { result } = renderHook(() => useSessionManager());
      
      // Start save operation
      act(() => {
        result.current.saveSession(mockSessionData);
      });
      
      // Check that loading started
      expect(result.current.isLoading).toBe(true);
      
      // Resolve the promise
      act(() => {
        resolvePromise({ success: true, data: {} });
      });
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('validates session data before saving', async () => {
      const { result } = renderHook(() => useSessionManager());
      
      let saveResult;
      await act(async () => {
        saveResult = await result.current.saveSession({});
      });
      
      expect(saveResult.success).toBe(false);
      expect(saveResult.error?.code).toBe('INVALID_DATA');
    });
  });

  describe('Load Session', () => {
    it('loads session data successfully', async () => {
      mockLoadSessionApi.loadSessionFull.mockResolvedValue({
        success: true,
        data: {
          session: {
            id: 'session-1',
            data: mockSessionData
          }
        }
      });
      
      const { result } = renderHook(() => useSessionManager());
      
      // First load sessions to populate sessions array
      await act(async () => {
        await result.current.loadSessions();
      });
      
      let loadResult;
      await act(async () => {
        loadResult = await result.current.loadSession('session-1');
      });
      
      expect(mockLoadSessionApi.loadSessionFull).toHaveBeenCalledWith(
        'session-1',
        'user-123',
        undefined
      );
      
      expect(loadResult.success).toBe(true);
      expect(result.current.currentSession?.id).toBe('session-1');
    });

    it('handles load errors properly', async () => {
      mockLoadSessionApi.loadSessionFull.mockResolvedValue({
        success: false,
        error: {
          code: 'LOAD_ERROR',
          message: 'Session not found'
        }
      });
      
      const { result } = renderHook(() => useSessionManager());
      
      let loadResult;
      await act(async () => {
        loadResult = await result.current.loadSession('invalid-session');
      });
      
      expect(loadResult.success).toBe(false);
      expect(loadResult.error?.message).toBe('Session not found');
    });

    it('prevents duplicate load operations', async () => {
      let resolveCount = 0;
      mockLoadSessionApi.loadSessionFull.mockImplementation(() => {
        resolveCount++;
        return Promise.resolve({
          success: true,
          data: { session: { id: 'session-1', data: mockSessionData } }
        });
      });
      
      const { result } = renderHook(() => useSessionManager());
      
      // Start two load operations simultaneously
      await act(async () => {
        const promise1 = result.current.loadSession('session-1');
        const promise2 = result.current.loadSession('session-1');
        await Promise.all([promise1, promise2]);
      });
      
      // Should only call API once due to duplicate prevention
      expect(resolveCount).toBe(1);
    });
  });

  describe('Search Sessions', () => {
    it('searches sessions by query', async () => {
      mockLoadSessionApi.searchSessions.mockResolvedValue({
        success: true,
        data: {
          sessions: [
            {
              id: 'search-result-1',
              name: 'Matching Session',
              type: 'mindmap',
              status: 'active',
              updatedAt: '2024-01-01T12:00:00Z',
              createdAt: '2024-01-01T00:00:00Z',
              userId: 'user-123',
              dataSize: 512
            }
          ]
        }
      });
      
      const { result } = renderHook(() => useSessionManager());
      
      let searchResult;
      await act(async () => {
        searchResult = await result.current.searchSessions(
          { query: 'matching' },
          { limit: 10 }
        );
      });
      
      expect(mockLoadSessionApi.searchSessions).toHaveBeenCalledWith(
        'matching',
        'user-123',
        10
      );
      
      expect(searchResult.success).toBe(true);
      expect(result.current.sessions).toHaveLength(1);
      expect(result.current.sessions[0].name).toBe('Matching Session');
    });

    it('returns to full session list when query is empty', async () => {
      const { result } = renderHook(() => useSessionManager());
      
      await act(async () => {
        await result.current.searchSessions({ query: '' });
      });
      
      expect(mockLoadSessionApi.getUserSessions).toHaveBeenCalled();
    });
  });

  describe('Session Validation', () => {
    it('validates session data correctly', () => {
      const { result } = renderHook(() => useSessionManager());
      
      const validSession = {
        name: 'Valid Session',
        type: 'mindmap',
        description: 'A valid session'
      };
      
      const validation = result.current.validateSession(validSession);
      
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
      expect(validation.integrityScore).toBeGreaterThan(80);
    });

    it('detects validation errors', () => {
      const { result } = renderHook(() => useSessionManager());
      
      const invalidSession = {
        name: '', // Invalid: empty name
        description: 'A'.repeat(600) // Invalid: too long description
      };
      
      const validation = result.current.validateSession(invalidSession);
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
      expect(validation.errors.some(e => e.code === 'MISSING_NAME')).toBe(true);
      expect(validation.integrityScore).toBeLessThan(100);
    });

    it('provides warnings for potential issues', () => {
      const { result } = renderHook(() => useSessionManager());
      
      const sessionWithWarnings = {
        name: 'A'.repeat(95), // Warning: long name
        description: 'Valid description',
        type: 'mindmap'
      };
      
      const validation = result.current.validateSession(sessionWithWarnings);
      
      expect(validation.isValid).toBe(true); // Still valid
      expect(validation.warnings.length).toBeGreaterThan(0);
      expect(validation.warnings.some(w => w.code === 'LONG_NAME')).toBe(true);
    });
  });

  describe('Delete Session', () => {
    it('deletes session successfully', async () => {
      const { result } = renderHook(() => useSessionManager());
      
      // First load sessions
      await act(async () => {
        await result.current.loadSessions();
      });
      
      expect(result.current.sessions).toHaveLength(1);
      
      // Delete the session
      await act(async () => {
        await result.current.deleteSession('session-1');
      });
      
      expect(result.current.sessions).toHaveLength(0);
    });

    it('clears current session when deleted session is current', async () => {
      const { result } = renderHook(() => useSessionManager());
      
      // Set current session
      act(() => {
        result.current.setCurrentSession({
          id: 'session-1',
          name: 'Current Session',
          type: 'mindmap',
          status: 'active',
          lastModified: '2024-01-01T12:00:00Z',
          size: 1024,
          isLocal: true,
          isCollaborative: false
        });
      });
      
      expect(result.current.currentSession?.id).toBe('session-1');
      
      // Delete current session
      await act(async () => {
        await result.current.deleteSession('session-1');
      });
      
      expect(result.current.currentSession).toBeNull();
    });
  });

  describe('Auto-save', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });
    
    afterEach(() => {
      jest.useRealTimers();
    });
    
    it('sets up auto-save with specified interval', async () => {
      mockSaveSessionApi.autoSaveSession.mockResolvedValue({
        success: true,
        data: {}
      });
      
      const { result } = renderHook(() => useSessionManager());
      
      act(() => {
        result.current.setupAutoSave(mockSessionData, 'session-1', 5000);
      });
      
      // Advance time to trigger auto-save
      act(() => {
        jest.advanceTimersByTime(5000);
      });
      
      await waitFor(() => {
        expect(mockSaveSessionApi.autoSaveSession).toHaveBeenCalledWith(
          'session-1',
          mockSessionData,
          'user-123'
        );
      });
    });
    
    it('clears auto-save when requested', () => {
      const { result } = renderHook(() => useSessionManager());
      
      act(() => {
        result.current.setupAutoSave(mockSessionData, 'session-1', 5000);
        result.current.clearAutoSave();
      });
      
      // Advance time - auto-save should not trigger
      act(() => {
        jest.advanceTimersByTime(10000);
      });
      
      expect(mockSaveSessionApi.autoSaveSession).not.toHaveBeenCalled();
    });
  });

  describe('Session Filters', () => {
    it('loads recent sessions when filter is changed to recent', async () => {
      mockLoadSessionApi.getRecentSessions.mockResolvedValue({
        success: true,
        data: { sessions: [] }
      });
      
      const { result } = renderHook(() => useSessionManager());
      
      act(() => {
        result.current.setActiveFilter('recent');
      });
      
      await waitFor(() => {
        expect(mockLoadSessionApi.getRecentSessions).toHaveBeenCalledWith(
          'user-123',
          30,
          50
        );
      });
    });

    it('loads shared sessions when filter is changed to shared', async () => {
      mockLoadSessionApi.getSharedSessions.mockResolvedValue({
        success: true,
        data: { sessions: [] }
      });
      
      const { result } = renderHook(() => useSessionManager());
      
      act(() => {
        result.current.setActiveFilter('shared');
      });
      
      await waitFor(() => {
        expect(mockLoadSessionApi.getSharedSessions).toHaveBeenCalledWith(
          'user-123',
          50
        );
      });
    });
  });

  describe('Sync Status', () => {
    it('updates sync status based on online connectivity', () => {
      const { result, rerender } = renderHook(() => useSessionManager());
      
      expect(result.current.syncStatus.status).toBe('idle');
      
      // Mock going offline
      mockSessionStoreHooks.useConnectivity.mockReturnValue({
        isOnline: false
      } as any);
      
      rerender();
      
      expect(result.current.syncStatus.status).toBe('offline');
    });

    it('updates sync status during save operations', async () => {
      let resolvePromise: (value: any) => void;
      const savePromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      
      mockSaveSessionApi.saveSession.mockReturnValue(savePromise);
      
      const { result } = renderHook(() => useSessionManager());
      
      // Start save - should show syncing
      act(() => {
        result.current.saveSession(mockSessionData);
      });
      
      expect(result.current.syncStatus.status).toBe('syncing');
      
      // Complete save - should return to idle
      await act(async () => {
        resolvePromise({ success: true, data: {} });
      });
      
      await waitFor(() => {
        expect(result.current.syncStatus.status).toBe('idle');
        expect(result.current.syncStatus.isSynced).toBe(true);
      });
    });
  });

  describe('Error Handling', () => {
    it('handles network errors gracefully', async () => {
      mockLoadSessionApi.getUserSessions.mockRejectedValue(new Error('Network error'));
      
      const { result } = renderHook(() => useSessionManager());
      
      await waitFor(() => {
        expect(result.current.syncStatus.status).toBe('error');
      });
    });

    it('prevents operations when already loading', async () => {
      let resolvePromise: (value: any) => void;
      const loadPromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      
      mockLoadSessionApi.getUserSessions.mockReturnValue(loadPromise);
      
      const { result } = renderHook(() => useSessionManager());
      
      // Start first load
      const firstLoad = result.current.loadSessions();
      
      // Try to start second load while first is in progress
      const secondLoad = result.current.loadSessions();
      
      // Resolve the promise
      act(() => {
        resolvePromise({
          success: true,
          data: { sessions: [] }
        });
      });
      
      await Promise.all([firstLoad, secondLoad]);
      
      // Should only have been called once
      expect(mockLoadSessionApi.getUserSessions).toHaveBeenCalledTimes(1);
    });
  });
});