// SessionManager Component Types
import type { CSSProperties } from 'react';

/**
 * Session item data structure for the SessionManager
 */
export interface SessionItem {
  /** Unique session identifier */
  id: string;
  /** Display name of the session */
  name: string;
  /** Type of session content */
  type: SessionType;
  /** Current status of the session */
  status: SessionStatus;
  /** Last modification timestamp (ISO string) */
  lastModified: string;
  /** Session data size in bytes */
  size: number;
  /** Whether session is stored locally */
  isLocal: boolean;
  /** Whether session has multiple collaborators */
  isCollaborative: boolean;
  /** Number of collaborators (if collaborative) */
  collaboratorCount?: number;
  /** Short preview/description text */
  preview?: string;
  /** Session metadata tags */
  tags?: string[];
  /** Session priority level */
  priority?: SessionPriority;
  /** Version number for version control */
  version?: number;
  /** Whether session has unsaved changes */
  hasUnsavedChanges?: boolean;
  /** Creation timestamp (ISO string) */
  createdAt?: string;
  /** User ID of session owner */
  ownerId?: string;
  /** Session access level */
  accessLevel?: AccessLevel;
  /** Whether session data is compressed */
  compressed?: boolean;
  /** Whether session data is encrypted */
  encrypted?: boolean;
}

/**
 * Session types supported by the SessionManager
 */
export type SessionType = 
  | 'mindmap'
  | 'project' 
  | 'research'
  | 'planning'
  | 'brainstorming'
  | 'analysis'
  | 'presentation'
  | 'workflow'
  | 'template';

/**
 * Session status options
 */
export type SessionStatus = 
  | 'active'
  | 'paused'
  | 'completed'
  | 'archived'
  | 'draft'
  | 'shared'
  | 'template';

/**
 * Session priority levels
 */
export type SessionPriority = 'low' | 'medium' | 'high' | 'urgent';

/**
 * Access levels for sessions
 */
export type AccessLevel = 'read' | 'write' | 'admin' | 'owner';

/**
 * Session filter types for browsing
 */
export type SessionFilter = 
  | 'all' 
  | 'recent' 
  | 'shared' 
  | 'local' 
  | 'collaborative' 
  | 'personal'
  | 'templates'
  | 'archived';

/**
 * Save operation options
 */
export interface SaveOptions {
  /** Enable automatic saving */
  autoSave?: boolean;
  /** Auto-save interval in milliseconds */
  autoSaveInterval?: number;
  /** Create backup before saving */
  createBackup?: boolean;
  /** Enable version control */
  enableVersioning?: boolean;
  /** Compression type for storage */
  compression?: 'none' | 'gzip' | 'brotli';
  /** Encrypt session data */
  encryption?: boolean;
  /** Send notifications on save */
  notifications?: boolean;
  /** Validation level */
  validation?: 'strict' | 'relaxed' | 'none';
}

/**
 * Load operation options
 */
export interface LoadOptions {
  /** Include full session data */
  includeData?: boolean;
  /** Include analytics data */
  includeAnalytics?: boolean;
  /** Include collaboration data */
  includeCollaborators?: boolean;
  /** Include version history */
  includeHistory?: boolean;
  /** Load specific version */
  version?: number;
  /** Access level required */
  accessLevel?: AccessLevel;
  /** Data decompression method */
  decompression?: 'auto' | 'gzip' | 'brotli' | 'none';
}

/**
 * Session validation result
 */
export interface ValidationResult {
  /** Whether validation passed */
  isValid: boolean;
  /** Validation errors */
  errors: ValidationError[];
  /** Validation warnings */
  warnings: ValidationWarning[];
  /** Data integrity score (0-100) */
  integrityScore: number;
}

/**
 * Validation error details
 */
export interface ValidationError {
  /** Error code */
  code: string;
  /** Human-readable message */
  message: string;
  /** Field or path where error occurred */
  field?: string;
  /** Error severity */
  severity: 'critical' | 'major' | 'minor';
  /** Suggested fix */
  suggestion?: string;
}

/**
 * Validation warning details
 */
export interface ValidationWarning {
  /** Warning code */
  code: string;
  /** Human-readable message */
  message: string;
  /** Field or path where warning occurred */
  field?: string;
  /** Recommended action */
  recommendation?: string;
}

/**
 * Session export format options
 */
export type ExportFormat = 
  | 'json'
  | 'csv'
  | 'xml'
  | 'pdf'
  | 'html'
  | 'markdown'
  | 'zip';

/**
 * Session import source types
 */
export type ImportSource = 
  | 'file'
  | 'url'
  | 'clipboard'
  | 'template'
  | 'backup';

/**
 * Export options configuration
 */
export interface ExportOptions {
  /** Export format */
  format: ExportFormat;
  /** Include metadata */
  includeMetadata?: boolean;
  /** Include version history */
  includeHistory?: boolean;
  /** Include collaborator data */
  includeCollaborators?: boolean;
  /** Compression for export */
  compressed?: boolean;
  /** Custom filename */
  filename?: string;
  /** Export specific sections */
  sections?: string[];
}

/**
 * Import options configuration
 */
export interface ImportOptions {
  /** Import source type */
  source: ImportSource;
  /** Validation level */
  validation?: 'strict' | 'relaxed' | 'none';
  /** Merge with existing data */
  merge?: boolean;
  /** Conflict resolution strategy */
  conflictResolution?: 'overwrite' | 'merge' | 'skip' | 'prompt';
  /** Import as template */
  asTemplate?: boolean;
  /** Custom session name */
  sessionName?: string;
}

/**
 * Session search criteria
 */
export interface SearchCriteria {
  /** Search query text */
  query?: string;
  /** Session types to include */
  types?: SessionType[];
  /** Session statuses to include */
  statuses?: SessionStatus[];
  /** Tags to match */
  tags?: string[];
  /** Priority levels */
  priorities?: SessionPriority[];
  /** Date range filter */
  dateRange?: {
    startDate: string;
    endDate: string;
    field: 'createdAt' | 'lastModified' | 'lastAccessed';
  };
  /** Size range filter */
  sizeRange?: {
    minSize: number;
    maxSize: number;
  };
  /** Collaboration filter */
  collaboration?: {
    isCollaborative?: boolean;
    minCollaborators?: number;
    maxCollaborators?: number;
  };
  /** Owner filter */
  ownerId?: string;
  /** Organization filter */
  organizationId?: string;
}

/**
 * Search and sort options
 */
export interface SearchOptions {
  /** Maximum results to return */
  limit?: number;
  /** Offset for pagination */
  offset?: number;
  /** Sort field */
  sortBy?: 'name' | 'createdAt' | 'lastModified' | 'size' | 'priority' | 'status';
  /** Sort order */
  sortOrder?: 'asc' | 'desc';
  /** Include analytics in results */
  includeAnalytics?: boolean;
  /** Include preview data */
  includePreview?: boolean;
}

/**
 * Session operation result
 */
export interface SessionOperationResult<T = any> {
  /** Whether operation succeeded */
  success: boolean;
  /** Result data */
  data?: T;
  /** Error information */
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  /** Operation metadata */
  metadata?: {
    duration: number;
    timestamp: string;
    operationType: string;
  };
}

/**
 * Collaboration user information
 */
export interface CollaboratorInfo {
  /** User ID */
  id: string;
  /** Display name */
  name: string;
  /** Email address */
  email: string;
  /** Avatar URL */
  avatar?: string;
  /** Role in session */
  role: 'viewer' | 'editor' | 'admin' | 'owner';
  /** Online status */
  status: 'online' | 'away' | 'offline';
  /** Last activity timestamp */
  lastActivity: string;
  /** Current cursor position */
  cursor?: {
    x: number;
    y: number;
  };
  /** Permissions */
  permissions: {
    read: boolean;
    write: boolean;
    delete: boolean;
    share: boolean;
    admin: boolean;
  };
}

/**
 * Session activity log entry
 */
export interface ActivityLogEntry {
  /** Activity ID */
  id: string;
  /** Activity type */
  type: 'save' | 'load' | 'edit' | 'share' | 'collaborate' | 'export' | 'import';
  /** User who performed the action */
  userId: string;
  /** User display name */
  userName: string;
  /** Activity timestamp */
  timestamp: string;
  /** Activity description */
  description: string;
  /** Activity metadata */
  metadata?: Record<string, any>;
  /** IP address */
  ipAddress?: string;
  /** User agent */
  userAgent?: string;
}

/**
 * Session backup information
 */
export interface BackupInfo {
  /** Backup ID */
  id: string;
  /** Session ID */
  sessionId: string;
  /** Backup timestamp */
  createdAt: string;
  /** Backup size */
  size: number;
  /** Backup type */
  type: 'auto' | 'manual' | 'scheduled';
  /** Backup version */
  version: number;
  /** Backup status */
  status: 'creating' | 'completed' | 'failed' | 'corrupted';
  /** Storage location */
  location: 'local' | 'cloud' | 'archive';
  /** Retention period */
  retentionPeriod?: number;
  /** Backup description */
  description?: string;
}

/**
 * Session sync status
 */
export interface SyncStatus {
  /** Whether session is in sync */
  isSynced: boolean;
  /** Last sync timestamp */
  lastSync: string;
  /** Sync status */
  status: 'idle' | 'syncing' | 'conflict' | 'error' | 'offline';
  /** Pending changes count */
  pendingChanges: number;
  /** Conflict information */
  conflicts?: {
    count: number;
    fields: string[];
    resolution: 'manual' | 'auto';
  };
  /** Sync error */
  error?: string;
}

/**
 * SessionManager component props
 */
export interface SessionManagerProps {
  /** Current session data to save/manage */
  currentSessionData?: Record<string, unknown>;
  /** Current session ID if editing existing */
  currentSessionId?: string;
  /** Session type for new sessions */
  defaultSessionType?: SessionType;
  /** Enable auto-save functionality */
  autoSave?: boolean;
  /** Auto-save interval in milliseconds */
  autoSaveInterval?: number;
  /** Show collaborative features */
  enableCollaboration?: boolean;
  /** Show export/import features */
  enableImportExport?: boolean;
  /** Show version control features */
  enableVersionControl?: boolean;
  /** Maximum sessions to display */
  maxSessions?: number;
  /** Default filter for session list */
  defaultFilter?: SessionFilter;
  /** Custom CSS class */
  className?: string;
  /** Custom styles */
  style?: CSSProperties;
  /** Theme variant */
  theme?: 'light' | 'dark' | 'auto';
  /** Component size */
  size?: 'compact' | 'standard' | 'expanded';
  /** Custom save handler */
  onSave?: (sessionData: Record<string, unknown>, options?: SaveOptions) => Promise<SessionOperationResult>;
  /** Custom load handler */
  onLoad?: (sessionId: string, options?: LoadOptions) => Promise<SessionOperationResult>;
  /** Session selection change handler */
  onSessionChange?: (session: SessionItem | null) => void;
  /** Error handler */
  onError?: (error: string, details?: any) => void;
  /** Success handler */
  onSuccess?: (message: string, data?: any) => void;
  /** Session validation handler */
  onValidate?: (sessionData: Record<string, unknown>) => ValidationResult;
  /** Before save handler */
  onBeforeSave?: (sessionData: Record<string, unknown>) => boolean | Promise<boolean>;
  /** After save handler */
  onAfterSave?: (result: SessionOperationResult) => void;
  /** Before load handler */
  onBeforeLoad?: (sessionId: string) => boolean | Promise<boolean>;
  /** After load handler */
  onAfterLoad?: (result: SessionOperationResult) => void;
}

/**
 * SessionManager context data
 */
export interface SessionManagerContext {
  /** Current sessions list */
  sessions: SessionItem[];
  /** Currently selected session */
  currentSession: SessionItem | null;
  /** Loading state */
  isLoading: boolean;
  /** Save progress (0-100) */
  saveProgress: number;
  /** Search query */
  searchQuery: string;
  /** Active filter */
  activeFilter: SessionFilter;
  /** Sync status */
  syncStatus: SyncStatus;
  /** Available actions */
  actions: {
    save: (data: Record<string, unknown>, options?: SaveOptions) => Promise<SessionOperationResult>;
    load: (sessionId: string, options?: LoadOptions) => Promise<SessionOperationResult>;
    delete: (sessionId: string) => Promise<SessionOperationResult>;
    duplicate: (sessionId: string) => Promise<SessionOperationResult>;
    export: (sessionId: string, options: ExportOptions) => Promise<SessionOperationResult>;
    import: (source: any, options: ImportOptions) => Promise<SessionOperationResult>;
    share: (sessionId: string, collaborators: string[]) => Promise<SessionOperationResult>;
    search: (criteria: SearchCriteria, options?: SearchOptions) => Promise<SessionOperationResult>;
    validate: (sessionData: Record<string, unknown>) => ValidationResult;
    backup: (sessionId: string) => Promise<SessionOperationResult>;
    restore: (backupId: string) => Promise<SessionOperationResult>;
  };
}