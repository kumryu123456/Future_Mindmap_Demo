/**
 * SessionStorage Utilities Tests
 */

import { SessionStorageUtil } from '../sessionStorage';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  const mock = {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
      // Add property to mock object for iteration
      (mock as any)[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
      delete (mock as any)[key];
    }),
    clear: jest.fn(() => {
      // Clear store
      const keys = Object.keys(store);
      store = {};
      // Clear mock properties
      keys.forEach(key => {
        delete (mock as any)[key];
      });
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: jest.fn((index: number) => {
      const keys = Object.keys(store);
      return keys[index] || null;
    }),
    hasOwnProperty: function(key: string) {
      return store.hasOwnProperty(key);
    }
  };

  return mock;
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true
});

describe('SessionStorageUtil', () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  describe('saveSession', () => {
    const mockSessionData = {
      name: 'Test Session',
      type: 'mindmap',
      nodes: [
        { id: 'node1', text: 'Node 1', x: 100, y: 100, connections: [] },
        { id: 'node2', text: 'Node 2', x: 200, y: 200, connections: ['node1'] }
      ],
      createdAt: '2024-01-01T00:00:00Z'
    };

    it('saves session data successfully', () => {
      const result = SessionStorageUtil.saveSession('test-session', mockSessionData);

      expect(result.success).toBe(true);
      expect(localStorageMock.setItem).toHaveBeenCalled();
      
      // Check that session metadata was created
      const sessions = SessionStorageUtil.getAllSessions();
      expect(sessions).toHaveLength(1);
      expect(sessions[0].id).toBe('test-session');
      expect(sessions[0].name).toBe('Test Session');
    });

    it('saves with compression by default', () => {
      const result = SessionStorageUtil.saveSession('test-session', mockSessionData);

      expect(result.success).toBe(true);
      
      // Verify data was compressed (stored data should be different from original)
      const storedData = localStorageMock.getItem('mindmap_session_data_test-session');
      expect(storedData).not.toBe(JSON.stringify(mockSessionData));
    });

    it('saves without compression when disabled', () => {
      const result = SessionStorageUtil.saveSession('test-session', mockSessionData, {
        compress: false
      });

      expect(result.success).toBe(true);
      
      // Without compression, stored data should match original
      const storedData = localStorageMock.getItem('mindmap_session_data_test-session');
      expect(storedData).toBe(JSON.stringify(mockSessionData));
    });

    it('handles encryption option', () => {
      const result = SessionStorageUtil.saveSession('test-session', mockSessionData, {
        encrypt: true,
        compress: false
      });

      expect(result.success).toBe(true);
      
      // Encrypted data should be different from original
      const storedData = localStorageMock.getItem('mindmap_session_data_test-session');
      expect(storedData).not.toBe(JSON.stringify(mockSessionData));
    });

    it('creates backup when requested', () => {
      // First save to create a session
      SessionStorageUtil.saveSession('test-session', mockSessionData, { backup: false });
      
      // Second save with backup
      const updatedData = { ...mockSessionData, name: 'Updated Session' };
      const result = SessionStorageUtil.saveSession('test-session', updatedData, {
        backup: true,
        compress: false
      });

      expect(result.success).toBe(true);
      
      // Check for backup in localStorage
      const backupKeys = Object.keys(localStorageMock)
        .filter(key => key.startsWith('mindmap_backup_test-session_'));
      expect(backupKeys.length).toBeGreaterThan(0);
    });

    it('handles storage errors gracefully', () => {
      // Mock localStorage to throw error
      localStorageMock.setItem.mockImplementationOnce(() => {
        throw new Error('Quota exceeded');
      });

      const result = SessionStorageUtil.saveSession('test-session', mockSessionData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Quota exceeded');
    });
  });

  describe('loadSession', () => {
    const mockSessionData = {
      name: 'Test Session',
      type: 'mindmap',
      nodes: []
    };

    beforeEach(() => {
      // Save a session to load
      SessionStorageUtil.saveSession('test-session', mockSessionData, {
        compress: false,
        encrypt: false
      });
    });

    it('loads session data successfully', () => {
      const result = SessionStorageUtil.loadSession('test-session');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockSessionData);
    });

    it('handles missing session', () => {
      const result = SessionStorageUtil.loadSession('nonexistent-session');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Session not found');
    });

    it('handles decompression', () => {
      // Save with compression
      SessionStorageUtil.saveSession('compressed-session', mockSessionData, {
        compress: true,
        encrypt: false
      });

      const result = SessionStorageUtil.loadSession('compressed-session');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockSessionData);
    });

    it('handles decryption', () => {
      // Save with encryption
      SessionStorageUtil.saveSession('encrypted-session', mockSessionData, {
        compress: false,
        encrypt: true
      });

      const result = SessionStorageUtil.loadSession('encrypted-session');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockSessionData);
    });

    it('handles corrupted data gracefully', () => {
      // Corrupt the stored data
      localStorageMock.setItem('mindmap_session_data_corrupted', 'invalid-json');

      const result = SessionStorageUtil.loadSession('corrupted');

      expect(result.success).toBe(false);
      expect(result.error).toContain('not valid JSON');
    });
  });

  describe('deleteSession', () => {
    beforeEach(() => {
      // Create a session to delete
      SessionStorageUtil.saveSession('test-session', {
        name: 'Test Session',
        type: 'mindmap'
      });
    });

    it('deletes session data successfully', () => {
      const result = SessionStorageUtil.deleteSession('test-session');

      expect(result.success).toBe(true);
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('mindmap_session_data_test-session');
      
      // Session should be removed from sessions list
      const sessions = SessionStorageUtil.getAllSessions();
      expect(sessions.find(s => s.id === 'test-session')).toBeUndefined();
    });

    it('handles deletion of non-existent session', () => {
      const result = SessionStorageUtil.deleteSession('nonexistent');

      expect(result.success).toBe(true);
    });
  });

  describe('getAllSessions', () => {
    it('returns empty array when no sessions exist', () => {
      const sessions = SessionStorageUtil.getAllSessions();
      expect(sessions).toEqual([]);
    });

    it('returns all saved sessions', () => {
      SessionStorageUtil.saveSession('session1', { name: 'Session 1', type: 'mindmap' });
      SessionStorageUtil.saveSession('session2', { name: 'Session 2', type: 'project' });

      const sessions = SessionStorageUtil.getAllSessions();

      expect(sessions).toHaveLength(2);
      expect(sessions.find(s => s.id === 'session1')).toBeDefined();
      expect(sessions.find(s => s.id === 'session2')).toBeDefined();
    });

    it('handles corrupted sessions list gracefully', () => {
      localStorageMock.setItem('mindmap_sessions', 'invalid-json');

      const sessions = SessionStorageUtil.getAllSessions();

      expect(sessions).toEqual([]);
    });
  });

  describe('searchSessions', () => {
    beforeEach(() => {
      SessionStorageUtil.saveSession('session1', {
        name: 'Project Alpha',
        description: 'A project about space exploration',
        tags: ['space', 'science']
      });
      SessionStorageUtil.saveSession('session2', {
        name: 'Beta Testing',
        description: 'Testing the beta version',
        tags: ['testing', 'beta']
      });
      SessionStorageUtil.saveSession('session3', {
        name: 'Space Mission',
        description: 'Mission to Mars',
        tags: ['space', 'mars']
      });
    });

    it('searches by name', () => {
      const results = SessionStorageUtil.searchSessions('Alpha');

      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Project Alpha');
    });

    it('searches by description', () => {
      const results = SessionStorageUtil.searchSessions('mars');

      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Space Mission');
    });

    it('searches by tags', () => {
      const results = SessionStorageUtil.searchSessions('space');

      expect(results).toHaveLength(2);
      expect(results.some(r => r.name === 'Project Alpha')).toBe(true);
      expect(results.some(r => r.name === 'Space Mission')).toBe(true);
    });

    it('performs case-insensitive search', () => {
      const results = SessionStorageUtil.searchSessions('BETA');

      expect(results).toHaveLength(1);
      expect(results.some(r => r.name === 'Beta Testing')).toBe(true);
    });

    it('returns empty array for no matches', () => {
      const results = SessionStorageUtil.searchSessions('nonexistent');

      expect(results).toEqual([]);
    });
  });

  describe('exportSession', () => {
    const mockSessionData = {
      name: 'Export Test',
      type: 'mindmap',
      data: { nodes: [], connections: [] }
    };

    beforeEach(() => {
      SessionStorageUtil.saveSession('export-test', mockSessionData, {
        compress: false
      });
    });

    it('exports session as JSON', () => {
      const result = SessionStorageUtil.exportSession('export-test', 'json');

      expect(result.success).toBe(true);
      expect(result.data).toBe(JSON.stringify(mockSessionData, null, 2));
    });

    it('exports session as compressed format', () => {
      const result = SessionStorageUtil.exportSession('export-test', 'compressed');

      expect(result.success).toBe(true);
      expect(result.data).not.toBe(JSON.stringify(mockSessionData));
    });

    it('handles export of non-existent session', () => {
      const result = SessionStorageUtil.exportSession('nonexistent', 'json');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Session not found');
    });
  });

  describe('importSession', () => {
    const mockSessionData = {
      name: 'Import Test',
      type: 'mindmap',
      nodes: []
    };

    it('imports JSON session data', () => {
      const jsonData = JSON.stringify(mockSessionData);
      const result = SessionStorageUtil.importSession('import-test', jsonData, 'json');

      expect(result.success).toBe(true);
      
      // Verify session was saved
      const loadResult = SessionStorageUtil.loadSession('import-test');
      expect(loadResult.success).toBe(true);
      expect(loadResult.data).toEqual(mockSessionData);
    });

    it('imports compressed session data', () => {
      // First export to get compressed format
      SessionStorageUtil.saveSession('temp', mockSessionData);
      const exportResult = SessionStorageUtil.exportSession('temp', 'compressed');
      
      const result = SessionStorageUtil.importSession('import-test', exportResult.data!, 'compressed');

      expect(result.success).toBe(true);
      
      // Verify session was saved correctly
      const loadResult = SessionStorageUtil.loadSession('import-test');
      expect(loadResult.success).toBe(true);
      expect(loadResult.data).toEqual(mockSessionData);
    });

    it('handles invalid JSON data', () => {
      const result = SessionStorageUtil.importSession('import-test', 'invalid-json', 'json');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('validateSession', () => {
    it('validates valid session successfully', () => {
      SessionStorageUtil.saveSession('valid-session', {
        name: 'Valid Session',
        type: 'mindmap',
        data: { nodes: [] }
      });

      const result = SessionStorageUtil.validateSession('valid-session');

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.integrityScore).toBeGreaterThan(80);
    });

    it('detects missing session', () => {
      const result = SessionStorageUtil.validateSession('nonexistent');

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.code === 'LOAD_ERROR')).toBe(true);
    });

    it('detects data corruption', () => {
      // Create corrupted session data
      localStorageMock.setItem('mindmap_session_data_corrupted', 'invalid-json');
      
      const result = SessionStorageUtil.validateSession('corrupted');

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.code === 'LOAD_ERROR')).toBe(true);
    });
  });

  describe('getStorageStats', () => {
    beforeEach(() => {
      SessionStorageUtil.saveSession('session1', { name: 'Session 1', data: 'test' });
      SessionStorageUtil.saveSession('session2', { name: 'Session 2', data: 'test' });
    });

    it('returns storage statistics', () => {
      const stats = SessionStorageUtil.getStorageStats();

      expect(stats.totalSessions).toBe(2);
      expect(stats.totalSize).toBeGreaterThan(0);
      expect(stats.usagePercentage).toBeGreaterThan(0);
      expect(stats.sessionsBreakdown).toHaveLength(2);
    });

    it('includes session breakdown information', () => {
      const stats = SessionStorageUtil.getStorageStats();

      expect(stats.sessionsBreakdown[0]).toHaveProperty('id');
      expect(stats.sessionsBreakdown[0]).toHaveProperty('name');
      expect(stats.sessionsBreakdown[0]).toHaveProperty('size');
      expect(stats.sessionsBreakdown[0]).toHaveProperty('lastModified');
    });
  });

  describe('clearAllSessions', () => {
    beforeEach(() => {
      SessionStorageUtil.saveSession('session1', { name: 'Session 1' });
      SessionStorageUtil.saveSession('session2', { name: 'Session 2' });
    });

    it('clears all session data', () => {
      const result = SessionStorageUtil.clearAllSessions();

      expect(result.success).toBe(true);
      
      // All sessions should be gone
      const sessions = SessionStorageUtil.getAllSessions();
      expect(sessions).toEqual([]);
      
      // Session data should be removed
      expect(localStorageMock.getItem('mindmap_session_data_session1')).toBeNull();
      expect(localStorageMock.getItem('mindmap_session_data_session2')).toBeNull();
    });

    it('handles errors during clear operation', () => {
      localStorageMock.removeItem.mockImplementationOnce(() => {
        throw new Error('Clear failed');
      });

      const result = SessionStorageUtil.clearAllSessions();

      expect(result.success).toBe(false);
      expect(result.error).toContain('Clear failed');
    });
  });

  describe('Storage Quota Management', () => {
    it('handles quota exceeded errors', () => {
      // Create large session data to exceed quota
      const largeData = {
        name: 'Large Session',
        data: 'x'.repeat(10 * 1024 * 1024) // 10MB of data
      };

      // Mock quota exceeded error
      localStorageMock.setItem.mockImplementationOnce(() => {
        throw new Error('QuotaExceededError');
      });

      const result = SessionStorageUtil.saveSession('large-session', largeData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('QuotaExceededError');
    });
  });
});