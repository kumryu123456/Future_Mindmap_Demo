/**
 * SessionManager Component Tests
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SessionManager } from '../SessionManager';
import * as sessionStoreHooks from '../../../hooks/useSessionStore';
import * as saveSessionApi from '../../../services/saveSessionApi';
import * as loadSessionApi from '../../../services/loadSessionApi';

// Mock the hooks and services
jest.mock('../../../hooks/useSessionStore');
jest.mock('../../../services/saveSessionApi');
jest.mock('../../../services/loadSessionApi');

const mockUseSession = sessionStoreHooks as jest.Mocked<typeof sessionStoreHooks>;
const mockSaveSessionApi = saveSessionApi as jest.Mocked<typeof saveSessionApi>;
const mockLoadSessionApi = loadSessionApi as jest.Mocked<typeof loadSessionApi>;

// Mock data
const mockSessionData = {
  name: 'Test Session',
  description: 'A test session for unit testing',
  type: 'mindmap',
  nodes: [
    { id: 'node1', text: 'Node 1', x: 100, y: 100, connections: [] },
    { id: 'node2', text: 'Node 2', x: 200, y: 200, connections: ['node1'] }
  ],
  createdAt: '2024-01-01T00:00:00Z',
  lastModified: '2024-01-01T12:00:00Z'
};

const mockSessions = [
  {
    id: 'session-1',
    name: 'Test Session 1',
    type: 'mindmap' as const,
    status: 'active' as const,
    lastModified: '2024-01-01T12:00:00Z',
    size: 1024,
    isLocal: false,
    isCollaborative: false
  },
  {
    id: 'session-2',
    name: 'Test Session 2',
    type: 'project' as const,
    status: 'paused' as const,
    lastModified: '2024-01-02T12:00:00Z',
    size: 2048,
    isLocal: true,
    isCollaborative: true,
    collaboratorCount: 3
  }
];

const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
  username: 'testuser',
  displayName: 'Test User',
  firstName: 'Test',
  lastName: 'User',
  avatar: null,
  role: 'user' as const,
  status: 'active' as const,
  profile: {} as any,
  settings: {} as any,
  subscription: {} as any,
  activity: {} as any,
  permissions: {} as any,
  metadata: {} as any
};

describe('SessionManager', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Mock the session hooks
    mockUseSession.useSession.mockReturnValue({
      auth: {
        isAuthenticated: true,
        isLoading: false,
        error: null,
        user: mockUser,
        loginAttempts: 0,
        mfa: {
          isEnabled: false,
          isRequired: false,
          methods: [],
          pendingVerification: false
        },
        tokenInfo: null
      },
      connectivity: {
        isOffline: false,
        isOnline: true,
        pendingActions: [],
        lastSync: '2024-01-01T12:00:00Z',
        conflictResolution: 'manual' as const,
        offlineStorage: true,
        offlineActions: true
      }
    } as any);

    mockUseSession.useSessionUI.mockReturnValue({
      setTheme: jest.fn(),
      toggleSidebar: jest.fn(),
      showModal: jest.fn(),
      hideModal: jest.fn(),
      showToast: jest.fn(),
      hideToast: jest.fn(),
      setLoading: jest.fn(),
      setError: jest.fn()
    });

    mockUseSession.useNotificationSystem.mockReturnValue({
      notifications: { unread: [], archive: [], settings: {} as any, realTime: true, connectionId: '', lastUpdate: '' },
      show: jest.fn(),
      showSuccess: jest.fn(),
      showError: jest.fn(),
      showCollaboration: jest.fn(),
      markRead: jest.fn(),
      markAllRead: jest.fn(),
      delete: jest.fn(),
      updateSettings: jest.fn()
    });

    // Mock API responses
    mockSaveSessionApi.saveSession.mockResolvedValue({
      success: true,
      data: {
        sessionId: 'new-session-id',
        message: 'Session saved successfully'
      }
    });

    mockLoadSessionApi.getUserSessions.mockResolvedValue({
      success: true,
      data: {
        sessions: mockSessions.map(session => ({
          ...session,
          updatedAt: session.lastModified,
          createdAt: '2024-01-01T00:00:00Z',
          userId: mockUser.id,
          dataSize: session.size
        }))
      }
    });

    mockLoadSessionApi.loadSessionFull.mockResolvedValue({
      success: true,
      data: {
        session: {
          id: 'session-1',
          data: mockSessionData
        }
      }
    });
  });

  describe('Rendering', () => {
    it('renders the SessionManager component', () => {
      render(<SessionManager currentSessionData={mockSessionData} />);
      
      expect(screen.getByText('Session Manager')).toBeInTheDocument();
      expect(screen.getByText('Save Session')).toBeInTheDocument();
      expect(screen.getByText('Load Session')).toBeInTheDocument();
    });

    it('displays auto-save status when enabled', () => {
      render(
        <SessionManager 
          currentSessionData={mockSessionData}
          autoSave={true}
        />
      );
      
      expect(screen.getByText(/auto-save/i)).toBeInTheDocument();
    });

    it('shows current session info when session is selected', async () => {
      const { rerender } = render(<SessionManager />);
      
      // Initially no current session
      expect(screen.queryByText('Current Session')).not.toBeInTheDocument();
      
      // Add current session
      rerender(
        <SessionManager 
          currentSessionData={mockSessionData}
          currentSessionId="session-1"
        />
      );
      
      await waitFor(() => {
        expect(screen.getByText('Current Session')).toBeInTheDocument();
      });
    });
  });

  describe('Save Functionality', () => {
    it('opens save dialog when save button is clicked', async () => {
      render(<SessionManager currentSessionData={mockSessionData} />);
      
      const saveButton = screen.getByText('Save Session');
      fireEvent.click(saveButton);
      
      await waitFor(() => {
        expect(screen.getByText('Session Name *')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Enter session name...')).toBeInTheDocument();
      });
    });

    it('saves session with provided data', async () => {
      const onSuccess = jest.fn();
      render(
        <SessionManager 
          currentSessionData={mockSessionData}
          onSuccess={onSuccess}
        />
      );
      
      // Open save dialog
      const saveButton = screen.getByText('Save Session');
      fireEvent.click(saveButton);
      
      await waitFor(() => {
        expect(screen.getByPlaceholderText('Enter session name...')).toBeInTheDocument();
      });
      
      // Fill in session name
      const nameInput = screen.getByPlaceholderText('Enter session name...');
      await userEvent.type(nameInput, 'My Test Session');
      
      // Save the session
      const confirmSaveButton = screen.getByRole('button', { name: /save session/i });
      fireEvent.click(confirmSaveButton);
      
      await waitFor(() => {
        expect(mockSaveSessionApi.saveSession).toHaveBeenCalledWith(
          expect.objectContaining({
            session: expect.objectContaining({
              name: 'My Test Session'
            }),
            data: expect.objectContaining({
              mindmapData: mockSessionData
            })
          })
        );
      });
    });

    it('shows validation error for empty session name', async () => {
      render(<SessionManager currentSessionData={mockSessionData} />);
      
      // Open save dialog
      const saveButton = screen.getByText('Save Session');
      fireEvent.click(saveButton);
      
      await waitFor(() => {
        expect(screen.getByPlaceholderText('Enter session name...')).toBeInTheDocument();
      });
      
      // Try to save without name
      const confirmSaveButton = screen.getByRole('button', { name: /save session/i });
      expect(confirmSaveButton).toBeDisabled();
    });

    it('handles save errors gracefully', async () => {
      const onError = jest.fn();
      mockSaveSessionApi.saveSession.mockResolvedValueOnce({
        success: false,
        error: {
          code: 'SAVE_ERROR',
          message: 'Failed to save session'
        }
      });
      
      render(
        <SessionManager 
          currentSessionData={mockSessionData}
          onError={onError}
        />
      );
      
      // Open save dialog and save
      const saveButton = screen.getByText('Save Session');
      fireEvent.click(saveButton);
      
      await waitFor(() => {
        const nameInput = screen.getByPlaceholderText('Enter session name...');
        userEvent.type(nameInput, 'Test Session');
      });
      
      const confirmSaveButton = screen.getByRole('button', { name: /save session/i });
      fireEvent.click(confirmSaveButton);
      
      await waitFor(() => {
        expect(onError).toHaveBeenCalledWith('Failed to save session');
      });
    });
  });

  describe('Load Functionality', () => {
    it('opens load dialog when load button is clicked', async () => {
      render(<SessionManager />);
      
      const loadButton = screen.getByText('Load Session');
      fireEvent.click(loadButton);
      
      await waitFor(() => {
        expect(screen.getByText('Load Session')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Search sessions...')).toBeInTheDocument();
      });
    });

    it('displays sessions list in load dialog', async () => {
      render(<SessionManager />);
      
      const loadButton = screen.getByText('Load Session');
      fireEvent.click(loadButton);
      
      await waitFor(() => {
        expect(screen.getByText('Test Session 1')).toBeInTheDocument();
        expect(screen.getByText('Test Session 2')).toBeInTheDocument();
        expect(screen.getByText('mindmap')).toBeInTheDocument();
        expect(screen.getByText('project')).toBeInTheDocument();
      });
    });

    it('loads selected session', async () => {
      const onSessionChange = jest.fn();
      render(<SessionManager onSessionChange={onSessionChange} />);
      
      // Open load dialog
      const loadButton = screen.getByText('Load Session');
      fireEvent.click(loadButton);
      
      await waitFor(() => {
        expect(screen.getByText('Test Session 1')).toBeInTheDocument();
      });
      
      // Click load button for first session
      const sessionLoadButtons = screen.getAllByText('Load');
      fireEvent.click(sessionLoadButtons[0]);
      
      await waitFor(() => {
        expect(mockLoadSessionApi.loadSessionFull).toHaveBeenCalledWith(
          'session-1',
          mockUser.id,
          undefined
        );
      });
    });

    it('filters sessions by search query', async () => {
      render(<SessionManager />);
      
      const loadButton = screen.getByText('Load Session');
      fireEvent.click(loadButton);
      
      await waitFor(() => {
        expect(screen.getByPlaceholderText('Search sessions...')).toBeInTheDocument();
      });
      
      const searchInput = screen.getByPlaceholderText('Search sessions...');
      await userEvent.type(searchInput, 'Test Session 1');
      
      // Should still show Test Session 1 but might filter out others
      await waitFor(() => {
        expect(screen.getByText('Test Session 1')).toBeInTheDocument();
      });
    });
  });

  describe('Auto-save', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('triggers auto-save at specified intervals', async () => {
      mockSaveSessionApi.autoSaveSession.mockResolvedValue({
        success: true,
        data: { message: 'Auto-saved' }
      });

      render(
        <SessionManager 
          currentSessionData={mockSessionData}
          currentSessionId="session-1"
          autoSave={true}
          autoSaveInterval={10000}
        />
      );
      
      // Fast-forward time to trigger auto-save
      act(() => {
        jest.advanceTimersByTime(10000);
      });
      
      await waitFor(() => {
        expect(mockSaveSessionApi.autoSaveSession).toHaveBeenCalledWith(
          'session-1',
          mockSessionData,
          mockUser.id
        );
      });
    });

    it('does not auto-save when disabled', () => {
      render(
        <SessionManager 
          currentSessionData={mockSessionData}
          currentSessionId="session-1"
          autoSave={false}
        />
      );
      
      act(() => {
        jest.advanceTimersByTime(30000);
      });
      
      expect(mockSaveSessionApi.autoSaveSession).not.toHaveBeenCalled();
    });
  });

  describe('Session Filters', () => {
    it('changes filter when dropdown selection changes', async () => {
      render(<SessionManager />);
      
      const loadButton = screen.getByText('Load Session');
      fireEvent.click(loadButton);
      
      await waitFor(() => {
        expect(screen.getByDisplayValue('All Sessions')).toBeInTheDocument();
      });
      
      const filterSelect = screen.getByDisplayValue('All Sessions');
      fireEvent.change(filterSelect, { target: { value: 'recent' } });
      
      await waitFor(() => {
        expect(mockLoadSessionApi.getRecentSessions).toHaveBeenCalledWith(
          mockUser.id, 30, 20
        );
      });
    });
  });

  describe('Error Handling', () => {
    it('handles API errors gracefully', async () => {
      const onError = jest.fn();
      mockLoadSessionApi.getUserSessions.mockResolvedValueOnce({
        success: false,
        error: {
          code: 'API_ERROR',
          message: 'Failed to load sessions'
        }
      });
      
      render(<SessionManager onError={onError} />);
      
      await waitFor(() => {
        expect(onError).toHaveBeenCalledWith('Failed to load sessions');
      });
    });

    it('disables save button when no data provided', () => {
      render(<SessionManager />);
      
      const saveButton = screen.getByText('Save Session');
      expect(saveButton).toBeDisabled();
    });

    it('shows offline status when not connected', () => {
      mockUseSession.useSession.mockReturnValueOnce({
        auth: {
          isAuthenticated: true,
          user: mockUser
        },
        connectivity: {
          isOnline: false,
          isOffline: true
        }
      } as any);
      
      render(
        <SessionManager 
          currentSessionData={mockSessionData}
          autoSave={true}
        />
      );
      
      expect(screen.getByText(/paused \(offline\)/i)).toBeInTheDocument();
    });
  });

  describe('Custom Handlers', () => {
    it('calls custom save handler when provided', async () => {
      const customSave = jest.fn().mockResolvedValue(undefined);
      
      render(
        <SessionManager 
          currentSessionData={mockSessionData}
          onSave={customSave}
        />
      );
      
      // Open save dialog and save
      const saveButton = screen.getByText('Save Session');
      fireEvent.click(saveButton);
      
      await waitFor(() => {
        const nameInput = screen.getByPlaceholderText('Enter session name...');
        userEvent.type(nameInput, 'Custom Save Test');
      });
      
      const confirmSaveButton = screen.getByRole('button', { name: /save session/i });
      fireEvent.click(confirmSaveButton);
      
      await waitFor(() => {
        expect(customSave).toHaveBeenCalledWith(mockSessionData);
      });
      
      // Should not call default save API
      expect(mockSaveSessionApi.saveSession).not.toHaveBeenCalled();
    });

    it('calls custom load handler when provided', async () => {
      const customLoad = jest.fn().mockResolvedValue(mockSessionData);
      const onSessionChange = jest.fn();
      
      render(
        <SessionManager 
          onLoad={customLoad}
          onSessionChange={onSessionChange}
        />
      );
      
      // Open load dialog and load session
      const loadButton = screen.getByText('Load Session');
      fireEvent.click(loadButton);
      
      await waitFor(() => {
        expect(screen.getByText('Test Session 1')).toBeInTheDocument();
      });
      
      const sessionLoadButtons = screen.getAllByText('Load');
      fireEvent.click(sessionLoadButtons[0]);
      
      await waitFor(() => {
        expect(customLoad).toHaveBeenCalledWith('session-1');
      });
      
      // Should not call default load API
      expect(mockLoadSessionApi.loadSessionFull).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels and roles', () => {
      render(<SessionManager currentSessionData={mockSessionData} />);
      
      const saveButton = screen.getByRole('button', { name: /save session/i });
      const loadButton = screen.getByRole('button', { name: /load session/i });
      
      expect(saveButton).toBeInTheDocument();
      expect(loadButton).toBeInTheDocument();
    });

    it('supports keyboard navigation', async () => {
      render(<SessionManager currentSessionData={mockSessionData} />);
      
      const saveButton = screen.getByText('Save Session');
      saveButton.focus();
      
      // Should be focused
      expect(saveButton).toHaveFocus();
      
      // Tab to load button
      await userEvent.tab();
      const loadButton = screen.getByText('Load Session');
      expect(loadButton).toHaveFocus();
    });
  });
});