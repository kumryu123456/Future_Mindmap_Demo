/**
 * Session Storage Utilities
 * Handles local storage operations for session data with compression and encryption
 */

import type { SessionItem, ValidationResult } from '../types/components/sessionManager';

// Storage keys
const STORAGE_KEYS = {
  SESSIONS: 'mindmap_sessions',
  SESSION_DATA: 'mindmap_session_data_',
  PREFERENCES: 'mindmap_session_preferences',
  AUTO_SAVE: 'mindmap_auto_save_',
  BACKUP: 'mindmap_backup_'
} as const;

// Storage limits
const STORAGE_LIMITS = {
  MAX_SESSION_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_TOTAL_STORAGE: 50 * 1024 * 1024, // 50MB
  MAX_SESSIONS: 100
} as const;

/**
 * Compression utilities
 */
class CompressionUtil {
  static compress(data: string): string {
    try {
      // Simple LZW compression implementation
      const dict: { [key: string]: number } = {};
      const result: number[] = [];
      let dictSize = 256;
      
      for (let i = 0; i < 256; i++) {
        dict[String.fromCharCode(i)] = i;
      }
      
      let w = '';
      for (const c of data) {
        const wc = w + c;
        if (dict[wc]) {
          w = wc;
        } else {
          result.push(dict[w]);
          dict[wc] = dictSize++;
          w = c;
        }
      }
      
      if (w) {
        result.push(dict[w]);
      }
      
      return JSON.stringify(result);
    } catch (error) {
      console.warn('Compression failed, using original data:', error);
      return data;
    }
  }

  static decompress(compressed: string): string {
    try {
      const data = JSON.parse(compressed);
      if (!Array.isArray(data)) return compressed;
      
      const dict: { [key: number]: string } = {};
      let dictSize = 256;
      
      for (let i = 0; i < 256; i++) {
        dict[i] = String.fromCharCode(i);
      }
      
      let result = '';
      let w = String.fromCharCode(data[0]);
      result += w;
      
      for (let i = 1; i < data.length; i++) {
        const k = data[i];
        let entry: string;
        
        if (dict[k]) {
          entry = dict[k];
        } else if (k === dictSize) {
          entry = w + w.charAt(0);
        } else {
          throw new Error('Invalid compressed data');
        }
        
        result += entry;
        dict[dictSize++] = w + entry.charAt(0);
        w = entry;
      }
      
      return result;
    } catch (error) {
      console.warn('Decompression failed, using original data:', error);
      return compressed;
    }
  }
}

/**
 * Simple encryption utilities (for demo purposes - use proper encryption in production)
 */
class EncryptionUtil {
  private static key = 'mindmap_session_key_2024';

  static encrypt(data: string): string {
    try {
      // Simple XOR cipher (NOT for production use)
      let encrypted = '';
      const keyLength = this.key.length;
      
      for (let i = 0; i < data.length; i++) {
        const dataChar = data.charCodeAt(i);
        const keyChar = this.key.charCodeAt(i % keyLength);
        encrypted += String.fromCharCode(dataChar ^ keyChar);
      }
      
      return btoa(encrypted);
    } catch (error) {
      console.warn('Encryption failed, using original data:', error);
      return data;
    }
  }

  static decrypt(encrypted: string): string {
    try {
      const data = atob(encrypted);
      let decrypted = '';
      const keyLength = this.key.length;
      
      for (let i = 0; i < data.length; i++) {
        const dataChar = data.charCodeAt(i);
        const keyChar = this.key.charCodeAt(i % keyLength);
        decrypted += String.fromCharCode(dataChar ^ keyChar);
      }
      
      return decrypted;
    } catch (error) {
      console.warn('Decryption failed, using original data:', error);
      return encrypted;
    }
  }
}

/**
 * Storage quota management
 */
class StorageQuotaManager {
  static checkQuota(): { available: number; used: number; percentage: number } {
    let used = 0;
    
    try {
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          used += localStorage[key].length;
        }
      }
    } catch (error) {
      console.warn('Failed to calculate storage usage:', error);
    }
    
    const available = STORAGE_LIMITS.MAX_TOTAL_STORAGE - used;
    const percentage = (used / STORAGE_LIMITS.MAX_TOTAL_STORAGE) * 100;
    
    return { available, used, percentage };
  }

  static cleanupOldSessions(): void {
    try {
      const sessions = SessionStorageUtil.getAllSessions();
      if (sessions.length <= STORAGE_LIMITS.MAX_SESSIONS) return;
      
      // Sort by last modified and remove oldest
      sessions.sort((a, b) => new Date(a.lastModified).getTime() - new Date(b.lastModified).getTime());
      const toRemove = sessions.slice(0, sessions.length - STORAGE_LIMITS.MAX_SESSIONS);
      
      toRemove.forEach(session => {
        SessionStorageUtil.deleteSession(session.id);
      });
      
      console.log(`Cleaned up ${toRemove.length} old sessions`);
    } catch (error) {
      console.error('Failed to cleanup old sessions:', error);
    }
  }

  static canStore(dataSize: number): boolean {
    const quota = this.checkQuota();
    return quota.available >= dataSize && dataSize <= STORAGE_LIMITS.MAX_SESSION_SIZE;
  }
}

/**
 * Main session storage utility class
 */
export class SessionStorageUtil {
  /**
   * Save session data to local storage
   */
  static saveSession(
    sessionId: string,
    sessionData: Record<string, unknown>,
    options: {
      compress?: boolean;
      encrypt?: boolean;
      backup?: boolean;
    } = {}
  ): { success: boolean; error?: string } {
    try {
      const { compress = true, encrypt = false, backup = true } = options;
      
      // Serialize data
      let serialized = JSON.stringify(sessionData);
      
      // Compress if requested
      if (compress) {
        serialized = CompressionUtil.compress(serialized);
      }
      
      // Encrypt if requested
      if (encrypt) {
        serialized = EncryptionUtil.encrypt(serialized);
      }
      
      // Check storage quota
      if (!StorageQuotaManager.canStore(serialized.length)) {
        StorageQuotaManager.cleanupOldSessions();
        
        if (!StorageQuotaManager.canStore(serialized.length)) {
          return { success: false, error: 'Storage quota exceeded' };
        }
      }
      
      // Create backup if requested
      if (backup) {
        this.createBackup(sessionId);
      }
      
      // Store data
      const storageKey = STORAGE_KEYS.SESSION_DATA + sessionId;
      localStorage.setItem(storageKey, serialized);
      
      // Update session metadata
      this.updateSessionMetadata(sessionId, {
        name: typeof sessionData.name === 'string' ? sessionData.name : `Session ${sessionId.slice(0, 8)}`,
        preview: typeof sessionData.description === 'string' ? sessionData.description : undefined,
        tags: Array.isArray(sessionData.tags) ? sessionData.tags : undefined,
        lastModified: new Date().toISOString(),
        size: serialized.length,
        compressed: compress,
        encrypted: encrypt
      });
      
      return { success: true };
    } catch (error) {
      console.error('Failed to save session:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Load session data from local storage
   */
  static loadSession(
    sessionId: string
  ): { success: boolean; data?: Record<string, unknown>; error?: string } {
    try {
      const storageKey = STORAGE_KEYS.SESSION_DATA + sessionId;
      const stored = localStorage.getItem(storageKey);
      
      if (!stored) {
        return { success: false, error: 'Session not found' };
      }
      
      // Get session metadata
      const metadata = this.getSessionMetadata(sessionId);
      
      let data = stored;
      
      // Decrypt if necessary
      if (metadata?.encrypted) {
        data = EncryptionUtil.decrypt(data);
      }
      
      // Decompress if necessary
      if (metadata?.compressed) {
        data = CompressionUtil.decompress(data);
      }
      
      // Parse JSON
      const sessionData = JSON.parse(data);
      
      // Update last accessed
      this.updateSessionMetadata(sessionId, {
        lastAccessed: new Date().toISOString()
      });
      
      return { success: true, data: sessionData };
    } catch (error) {
      console.error('Failed to load session:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to parse session data' 
      };
    }
  }

  /**
   * Delete session from local storage
   */
  static deleteSession(sessionId: string): { success: boolean; error?: string } {
    try {
      const storageKey = STORAGE_KEYS.SESSION_DATA + sessionId;
      localStorage.removeItem(storageKey);
      
      // Remove from sessions list
      const sessions = this.getAllSessions();
      const updated = sessions.filter(s => s.id !== sessionId);
      this.saveSessionsList(updated);
      
      // Remove backups
      this.deleteBackups(sessionId);
      
      return { success: true };
    } catch (error) {
      console.error('Failed to delete session:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Get all sessions metadata
   */
  static getAllSessions(): SessionItem[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SESSIONS);
      if (!stored) return [];
      
      return JSON.parse(stored);
    } catch (error) {
      console.error('Failed to load sessions list:', error);
      return [];
    }
  }

  /**
   * Search sessions by query
   */
  static searchSessions(query: string): SessionItem[] {
    const sessions = this.getAllSessions();
    const lowerQuery = query.toLowerCase();
    
    return sessions.filter(session => 
      session.name.toLowerCase().includes(lowerQuery) ||
      session.preview?.toLowerCase().includes(lowerQuery) ||
      session.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }

  /**
   * Get session metadata
   */
  private static getSessionMetadata(sessionId: string): {
    compressed?: boolean;
    encrypted?: boolean;
    lastModified?: string;
    lastAccessed?: string;
    size?: number;
  } | null {
    const sessions = this.getAllSessions();
    const session = sessions.find(s => s.id === sessionId);
    
    return session ? {
      compressed: session.compressed || false,
      encrypted: session.encrypted || false,
      lastModified: session.lastModified,
      size: session.size
    } : null;
  }

  /**
   * Update session metadata
   */
  private static updateSessionMetadata(
    sessionId: string, 
    updates: Partial<{
      name: string;
      preview: string;
      tags: string[];
      lastModified: string;
      lastAccessed: string;
      size: number;
      compressed: boolean;
      encrypted: boolean;
    }>
  ): void {
    const sessions = this.getAllSessions();
    const sessionIndex = sessions.findIndex(s => s.id === sessionId);
    
    if (sessionIndex >= 0) {
      // Update existing
      sessions[sessionIndex] = {
        ...sessions[sessionIndex],
        ...updates
      };
    } else {
      // Create new
      sessions.push({
        id: sessionId,
        name: updates.name || `Session ${sessionId.slice(0, 8)}`,
        preview: updates.preview,
        tags: updates.tags,
        type: 'mindmap',
        status: 'active',
        lastModified: updates.lastModified || new Date().toISOString(),
        size: updates.size || 0,
        isLocal: true,
        isCollaborative: false,
        compressed: updates.compressed,
        encrypted: updates.encrypted
      });
    }
    
    this.saveSessionsList(sessions);
  }

  /**
   * Save sessions list
   */
  private static saveSessionsList(sessions: SessionItem[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
    } catch (error) {
      console.error('Failed to save sessions list:', error);
    }
  }

  /**
   * Create backup of session
   */
  private static createBackup(sessionId: string): void {
    try {
      const current = localStorage.getItem(STORAGE_KEYS.SESSION_DATA + sessionId);
      if (current) {
        const backupKey = STORAGE_KEYS.BACKUP + sessionId + '_' + Date.now();
        localStorage.setItem(backupKey, current);
        
        // Keep only last 3 backups
        this.cleanupBackups(sessionId);
      }
    } catch (error) {
      console.warn('Failed to create backup:', error);
    }
  }

  /**
   * Clean up old backups
   */
  private static cleanupBackups(sessionId: string): void {
    try {
      const backupPrefix = STORAGE_KEYS.BACKUP + sessionId + '_';
      const backups: { key: string; timestamp: number }[] = [];
      
      for (let key in localStorage) {
        if (key.startsWith(backupPrefix)) {
          const timestamp = parseInt(key.split('_').pop() || '0');
          backups.push({ key, timestamp });
        }
      }
      
      // Sort by timestamp and keep only 3 most recent
      backups.sort((a, b) => b.timestamp - a.timestamp);
      backups.slice(3).forEach(backup => {
        localStorage.removeItem(backup.key);
      });
    } catch (error) {
      console.warn('Failed to cleanup backups:', error);
    }
  }

  /**
   * Delete all backups for session
   */
  private static deleteBackups(sessionId: string): void {
    try {
      const backupPrefix = STORAGE_KEYS.BACKUP + sessionId + '_';
      
      for (let key in localStorage) {
        if (key.startsWith(backupPrefix)) {
          localStorage.removeItem(key);
        }
      }
    } catch (error) {
      console.warn('Failed to delete backups:', error);
    }
  }

  /**
   * Export session data
   */
  static exportSession(sessionId: string, format: 'json' | 'compressed' = 'json'): { success: boolean; data?: string; error?: string } {
    try {
      const result = this.loadSession(sessionId);
      if (!result.success || !result.data) {
        return { success: false, error: result.error };
      }
      
      let exportData: string;
      
      if (format === 'compressed') {
        exportData = CompressionUtil.compress(JSON.stringify(result.data));
      } else {
        exportData = JSON.stringify(result.data, null, 2);
      }
      
      return { success: true, data: exportData };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Export failed' 
      };
    }
  }

  /**
   * Import session data
   */
  static importSession(
    sessionId: string, 
    data: string, 
    format: 'json' | 'compressed' = 'json'
  ): { success: boolean; error?: string } {
    try {
      let sessionData: Record<string, unknown>;
      
      if (format === 'compressed') {
        const decompressed = CompressionUtil.decompress(data);
        sessionData = JSON.parse(decompressed);
      } else {
        sessionData = JSON.parse(data);
      }
      
      return this.saveSession(sessionId, sessionData);
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Import failed' 
      };
    }
  }

  /**
   * Get storage statistics
   */
  static getStorageStats() {
    const quota = StorageQuotaManager.checkQuota();
    const sessions = this.getAllSessions();
    
    return {
      totalSessions: sessions.length,
      totalSize: quota.used,
      availableSpace: quota.available,
      usagePercentage: quota.percentage,
      sessionsBreakdown: sessions.map(session => ({
        id: session.id,
        name: session.name,
        size: session.size || 0,
        lastModified: session.lastModified
      }))
    };
  }

  /**
   * Validate session data integrity
   */
  static validateSession(sessionId: string): ValidationResult {
    const errors: ValidationResult['errors'] = [];
    const warnings: ValidationResult['warnings'] = [];
    
    try {
      const result = this.loadSession(sessionId);
      
      if (!result.success) {
        errors.push({
          code: 'LOAD_ERROR',
          message: result.error || 'Failed to load session',
          severity: 'critical'
        });
      } else if (result.data) {
        // Validate data structure
        if (!result.data.name) {
          errors.push({
            code: 'MISSING_NAME',
            message: 'Session name is missing',
            field: 'name',
            severity: 'major'
          });
        }
        
        // Check data size
        const dataSize = JSON.stringify(result.data).length;
        if (dataSize > STORAGE_LIMITS.MAX_SESSION_SIZE) {
          errors.push({
            code: 'SIZE_EXCEEDED',
            message: 'Session data exceeds size limit',
            severity: 'major'
          });
        }
      }
      
      const sessions = this.getAllSessions();
      const session = sessions.find(s => s.id === sessionId);
      
      if (!session) {
        errors.push({
          code: 'METADATA_MISSING',
          message: 'Session metadata not found',
          severity: 'major'
        });
      }
      
    } catch (error) {
      errors.push({
        code: 'VALIDATION_ERROR',
        message: error instanceof Error ? error.message : 'Validation failed',
        severity: 'critical'
      });
    }
    
    const integrityScore = Math.max(0, 100 - (errors.length * 20) - (warnings.length * 5));
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      integrityScore
    };
  }

  /**
   * Clear all session data
   */
  static clearAllSessions(): { success: boolean; error?: string } {
    try {
      const sessions = this.getAllSessions();
      
      // Remove all session data
      sessions.forEach(session => {
        const storageKey = STORAGE_KEYS.SESSION_DATA + session.id;
        localStorage.removeItem(storageKey);
        this.deleteBackups(session.id);
      });
      
      // Clear sessions list
      localStorage.removeItem(STORAGE_KEYS.SESSIONS);
      localStorage.removeItem(STORAGE_KEYS.PREFERENCES);
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to clear sessions' 
      };
    }
  }
}