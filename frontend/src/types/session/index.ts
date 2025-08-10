// Session Store Types
export interface User {
  id: string;
  email: string;
  username: string;
  displayName: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  role: UserRole;
  status: UserStatus;
  
  // Profile Information
  profile: UserProfile;
  
  // Account Settings
  settings: UserSettings;
  
  // Subscription & Billing
  subscription: UserSubscription;
  
  // Activity & Analytics
  activity: UserActivity;
  
  // Permissions & Access
  permissions: UserPermissions;
  
  // Metadata
  metadata: UserMetadata;
}

export interface UserProfile {
  bio?: string;
  title?: string;
  company?: string;
  location?: string;
  website?: string;
  timezone: string;
  language: string;
  country?: string;
  phoneNumber?: string;
  
  // Social Links
  socialLinks: {
    twitter?: string;
    linkedin?: string;
    github?: string;
    website?: string;
  };
  
  // Skills & Interests
  skills: string[];
  interests: string[];
  
  // Professional Information
  experience: ExperienceLevel;
  industry?: string;
  jobFunction?: string;
}

export interface UserSettings {
  // Appearance
  theme: 'light' | 'dark' | 'system';
  colorScheme: string;
  fontSize: 'small' | 'medium' | 'large';
  compactMode: boolean;
  
  // Notifications
  notifications: NotificationSettings;
  
  // Privacy
  privacy: PrivacySettings;
  
  // Workspace
  workspace: WorkspaceSettings;
  
  // Integrations
  integrations: IntegrationSettings;
  
  // Accessibility
  accessibility: AccessibilitySettings;
  
  // Data & Storage
  dataSettings: DataSettings;
}

export interface NotificationSettings {
  email: {
    enabled: boolean;
    frequency: 'immediate' | 'daily' | 'weekly' | 'never';
    types: {
      security: boolean;
      updates: boolean;
      collaboration: boolean;
      reminders: boolean;
      marketing: boolean;
    };
  };
  push: {
    enabled: boolean;
    types: {
      mentions: boolean;
      assignments: boolean;
      deadlines: boolean;
      updates: boolean;
    };
  };
  inApp: {
    enabled: boolean;
    sound: boolean;
    desktop: boolean;
    types: {
      mentions: boolean;
      assignments: boolean;
      deadlines: boolean;
      updates: boolean;
      system: boolean;
    };
  };
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'team' | 'private';
  activityVisibility: 'public' | 'team' | 'private';
  searchVisibility: boolean;
  dataCollection: {
    analytics: boolean;
    performance: boolean;
    usage: boolean;
  };
  sharing: {
    allowMentions: boolean;
    allowInvitations: boolean;
    allowCollaboration: boolean;
  };
}

export interface WorkspaceSettings {
  defaultView: 'mindmap' | 'plans' | 'dashboard';
  sidebarCollapsed: boolean;
  autoSave: boolean;
  autoSaveInterval: number; // minutes
  recentItemsLimit: number;
  
  // Mindmap specific
  mindmap: {
    defaultLayout: 'radial' | 'tree' | 'network';
    animationsEnabled: boolean;
    gridEnabled: boolean;
    snapToGrid: boolean;
    showMinimap: boolean;
  };
  
  // Plans specific
  plans: {
    defaultView: 'gantt' | 'kanban' | 'timeline' | 'calendar';
    showCriticalPath: boolean;
    showResourceUtilization: boolean;
    autoSchedule: boolean;
  };
  
  // Collaboration
  collaboration: {
    realTimeEnabled: boolean;
    showCursors: boolean;
    showPresence: boolean;
    autoInviteTeam: boolean;
  };
}

export interface IntegrationSettings {
  calendar: {
    enabled: boolean;
    provider?: 'google' | 'outlook' | 'apple';
    syncDeadlines: boolean;
    syncMeetings: boolean;
  };
  storage: {
    enabled: boolean;
    provider?: 'google_drive' | 'dropbox' | 'onedrive';
    autoSync: boolean;
  };
  communication: {
    slack: {
      enabled: boolean;
      webhook?: string;
      channels: string[];
    };
    teams: {
      enabled: boolean;
      webhook?: string;
    };
    discord: {
      enabled: boolean;
      webhook?: string;
    };
  };
  projectManagement: {
    jira: {
      enabled: boolean;
      apiKey?: string;
      domain?: string;
    };
    asana: {
      enabled: boolean;
      accessToken?: string;
    };
    trello: {
      enabled: boolean;
      apiKey?: string;
    };
  };
}

export interface AccessibilitySettings {
  highContrast: boolean;
  reduceMotion: boolean;
  screenReader: boolean;
  keyboardNavigation: boolean;
  fontSize: 'default' | 'large' | 'x-large';
  voiceControl: boolean;
}

export interface DataSettings {
  exportFormat: 'json' | 'csv' | 'pdf';
  backupFrequency: 'daily' | 'weekly' | 'monthly';
  dataRetention: number; // days
  offlineMode: boolean;
  syncConflictResolution: 'manual' | 'auto_local' | 'auto_remote';
}

export interface UserSubscription {
  plan: 'free' | 'pro' | 'team' | 'enterprise';
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  periodStart: string;
  periodEnd: string;
  trialEnd?: string;
  cancelAtPeriodEnd: boolean;
  
  // Usage & Limits
  usage: {
    mindmaps: number;
    plans: number;
    storage: number; // bytes
    collaborators: number;
    apiCalls: number;
  };
  limits: {
    mindmaps: number | null; // null = unlimited
    plans: number | null;
    storage: number | null;
    collaborators: number | null;
    apiCalls: number | null;
  };
  
  // Features
  features: {
    advancedAnalytics: boolean;
    prioritySupport: boolean;
    customBranding: boolean;
    apiAccess: boolean;
    ssoEnabled: boolean;
    auditLogs: boolean;
  };
  
  // Billing
  billing: {
    customerId: string;
    subscriptionId: string;
    paymentMethod?: PaymentMethod;
    nextBilling?: string;
    amount: number;
    currency: string;
  };
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal' | 'bank';
  brand?: string;
  last4?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
}

export interface UserActivity {
  // Recent Activity
  recentItems: ActivityItem[];
  
  // Session Information
  currentSession: UserSession;
  recentSessions: UserSession[];
  
  // Usage Statistics
  stats: {
    totalSessions: number;
    totalTime: number; // seconds
    mindmapsCreated: number;
    plansCreated: number;
    collaborationTime: number;
    lastActiveDate: string;
  };
  
  // Productivity Metrics
  productivity: {
    tasksCompleted: number;
    milestonesReached: number;
    collaborationsInitiated: number;
    weeklyActiveTime: number;
    streak: {
      current: number;
      longest: number;
      lastUpdate: string;
    };
  };
}

export interface ActivityItem {
  id: string;
  type: 'mindmap' | 'plan' | 'task' | 'milestone' | 'collaboration';
  action: 'created' | 'updated' | 'deleted' | 'shared' | 'completed';
  itemId: string;
  itemName: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface UserSession {
  id: string;
  userId: string;
  deviceId: string;
  deviceInfo: DeviceInfo;
  ipAddress: string;
  userAgent: string;
  location?: SessionLocation;
  
  // Session Timing
  startTime: string;
  lastActivity: string;
  endTime?: string;
  duration?: number; // seconds
  
  // Session State
  isActive: boolean;
  isCurrent: boolean;
  
  // Security
  authMethod: 'password' | 'oauth' | 'sso' | 'magic_link';
  mfaVerified: boolean;
  
  // Activity
  pageViews: number;
  actionsPerformed: number;
  
  // Metadata
  metadata: {
    timezone: string;
    language: string;
    referrer?: string;
    campaign?: string;
  };
}

export interface DeviceInfo {
  type: 'desktop' | 'mobile' | 'tablet';
  os: string;
  browser: string;
  version: string;
  screenResolution?: string;
  colorDepth?: number;
  touchSupport: boolean;
}

export interface SessionLocation {
  country: string;
  region: string;
  city: string;
  timezone: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface UserPermissions {
  // Feature Access
  features: {
    mindmaps: PermissionLevel;
    plans: PermissionLevel;
    collaboration: PermissionLevel;
    analytics: PermissionLevel;
    integrations: PermissionLevel;
    api: PermissionLevel;
  };
  
  // Data Access
  data: {
    export: boolean;
    delete: boolean;
    share: boolean;
    publicShare: boolean;
  };
  
  // Administrative
  admin: {
    userManagement: boolean;
    billingManagement: boolean;
    auditLogs: boolean;
    systemSettings: boolean;
  };
  
  // Organization
  organization?: OrganizationPermissions;
}

export interface OrganizationPermissions {
  id: string;
  role: OrganizationRole;
  permissions: {
    invite: boolean;
    remove: boolean;
    manageRoles: boolean;
    manageBilling: boolean;
    manageIntegrations: boolean;
    viewAnalytics: boolean;
  };
}

export interface UserMetadata {
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string;
  emailVerifiedAt?: string;
  deletedAt?: string;
  
  // Tracking
  source: 'organic' | 'referral' | 'campaign' | 'invitation';
  referrer?: string;
  campaign?: string;
  invitedBy?: string;
  
  // Flags
  isEmailVerified: boolean;
  isMfaEnabled: boolean;
  isFirstLogin: boolean;
  hasCompletedOnboarding: boolean;
  
  // Compliance
  gdprConsent: boolean;
  termsAcceptedAt: string;
  privacyPolicyAcceptedAt: string;
  
  // Version
  version: number;
}

// Authentication Types
export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // User Information
  user: User | null;
  
  // Authentication Flow
  loginAttempts: number;
  lastLoginAttempt?: string;
  lockoutUntil?: string;
  
  // Multi-Factor Authentication
  mfa: {
    isEnabled: boolean;
    isRequired: boolean;
    methods: MfaMethod[];
    pendingVerification: boolean;
  };
  
  // Session Management
  tokenInfo: TokenInfo | null;
  refreshTimer?: number;
}

export interface TokenInfo {
  accessToken: string;
  refreshToken: string;
  tokenType: 'Bearer';
  expiresAt: string;
  scope: string[];
  
  // Additional Claims
  claims: {
    sub: string; // subject (user ID)
    iat: number; // issued at
    exp: number; // expires at
    aud: string; // audience
    iss: string; // issuer
    jti: string; // JWT ID
  };
}

export interface MfaMethod {
  id: string;
  type: 'totp' | 'sms' | 'email' | 'backup_codes';
  name: string;
  isEnabled: boolean;
  isPrimary: boolean;
  createdAt: string;
  lastUsedAt?: string;
}

// Onboarding & Tutorial Types
export interface OnboardingState {
  isComplete: boolean;
  currentStep: number;
  totalSteps: number;
  
  // Step Information
  steps: OnboardingStep[];
  completedSteps: string[];
  skippedSteps: string[];
  
  // Progress Tracking
  startedAt?: string;
  completedAt?: string;
  timeSpent: number; // seconds
  
  // Tutorial State
  tutorials: {
    mindmap: TutorialProgress;
    plans: TutorialProgress;
    collaboration: TutorialProgress;
  };
}

export interface OnboardingStep {
  id: string;
  name: string;
  title: string;
  description: string;
  type: 'form' | 'tutorial' | 'choice' | 'confirmation';
  isRequired: boolean;
  estimatedTime: number; // minutes
  
  // Dependencies
  dependencies: string[];
  
  // Configuration
  config: Record<string, any>;
  
  // State
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  completedAt?: string;
  data?: Record<string, any>;
}

export interface TutorialProgress {
  isComplete: boolean;
  currentStep: number;
  totalSteps: number;
  completedSteps: number[];
  skippedSteps: number[];
  startedAt?: string;
  completedAt?: string;
}

// Session Store State
export interface SessionStoreState {
  // Authentication
  auth: AuthState;
  
  // Onboarding
  onboarding: OnboardingState;
  
  // Application State
  app: {
    isInitialized: boolean;
    isOnline: boolean;
    lastSync: string;
    syncStatus: 'idle' | 'syncing' | 'error' | 'offline';
    
    // Feature Flags
    featureFlags: Record<string, boolean>;
    
    // Environment
    environment: 'development' | 'staging' | 'production';
    version: string;
    buildNumber: string;
    
    // Performance
    performance: {
      loadTime: number;
      renderTime: number;
      memoryUsage?: number;
      connectionSpeed?: string;
    };
  };
  
  // UI State
  ui: {
    theme: 'light' | 'dark' | 'system';
    sidebarCollapsed: boolean;
    modalStack: UIModal[];
    toasts: UIToast[];
    
    // Loading States
    loading: {
      global: boolean;
      auth: boolean;
      user: boolean;
      data: boolean;
    };
    
    // Error States
    errors: {
      auth: string | null;
      network: string | null;
      permission: string | null;
      validation: ValidationError[];
    };
    
    // Focus & Accessibility
    focusMode: boolean;
    highContrast: boolean;
    reducedMotion: boolean;
  };
  
  // Recent Activity & History
  activity: {
    recentItems: ActivityItem[];
    searchHistory: SearchHistoryItem[];
    navigationHistory: NavigationHistoryItem[];
    
    // Session Activity
    sessionStart: string;
    pageViews: number;
    actionsPerformed: number;
    timeSpent: number; // seconds
  };
  
  // Collaboration & Presence
  presence: {
    status: 'online' | 'away' | 'busy' | 'offline';
    lastSeen: string;
    currentLocation: {
      type: 'mindmap' | 'plan' | 'dashboard' | 'settings';
      id?: string;
      name?: string;
    };
    
    // Real-time Collaboration
    activeCollaborations: ActiveCollaboration[];
    invitations: CollaborationInvitation[];
  };
  
  // Notifications & Alerts
  notifications: {
    unread: Notification[];
    archive: Notification[];
    settings: NotificationSettings;
    
    // Real-time Updates
    realTime: boolean;
    connectionId?: string;
    lastUpdate: string;
  };
  
  // Cache & Performance
  cache: {
    user: CacheEntry<User>;
    settings: CacheEntry<UserSettings>;
    activity: CacheEntry<UserActivity>;
    
    // TTL Configuration
    ttl: {
      user: number;
      settings: number;
      activity: number;
    };
  };
  
  // Offline & Sync
  offline: {
    isOffline: boolean;
    pendingActions: OfflineAction[];
    lastSync: string;
    conflictResolution: 'manual' | 'auto_local' | 'auto_remote';
    
    // Offline Capabilities
    offlineStorage: boolean;
    offlineActions: boolean;
  };
}

// Supporting Types
export type UserRole = 'user' | 'admin' | 'moderator' | 'viewer';
export type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending';
export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';
export type PermissionLevel = 'none' | 'read' | 'write' | 'admin';
export type OrganizationRole = 'owner' | 'admin' | 'manager' | 'member' | 'guest';

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface UIModal {
  id: string;
  type: string;
  props: Record<string, any>;
  zIndex: number;
  backdrop: boolean;
  dismissible: boolean;
}

export interface UIToast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration: number;
  actions?: ToastAction[];
  timestamp: string;
}

export interface ToastAction {
  label: string;
  action: () => void;
  style?: 'primary' | 'secondary' | 'danger';
}

export interface SearchHistoryItem {
  id: string;
  query: string;
  type: 'mindmap' | 'plan' | 'global';
  timestamp: string;
  resultsCount: number;
}

export interface NavigationHistoryItem {
  id: string;
  path: string;
  title: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface ActiveCollaboration {
  id: string;
  type: 'mindmap' | 'plan';
  itemId: string;
  itemName: string;
  collaborators: CollaboratorInfo[];
  startedAt: string;
  lastActivity: string;
}

export interface CollaboratorInfo {
  userId: string;
  name: string;
  avatar?: string;
  status: 'online' | 'away';
  cursor?: {
    x: number;
    y: number;
  };
  lastSeen: string;
}

export interface CollaborationInvitation {
  id: string;
  type: 'mindmap' | 'plan';
  itemId: string;
  itemName: string;
  fromUserId: string;
  fromUserName: string;
  role: 'viewer' | 'editor' | 'admin';
  message?: string;
  expiresAt: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  type: 'system' | 'collaboration' | 'reminder' | 'security' | 'billing';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  
  // Actions
  actions?: NotificationAction[];
  
  // Metadata
  metadata?: {
    userId?: string;
    itemId?: string;
    itemType?: string;
    severity?: 'low' | 'medium' | 'high' | 'critical';
  };
  
  // Delivery
  channels: ('in_app' | 'email' | 'push')[];
  delivered: boolean;
  deliveredAt?: string;
}

export interface NotificationAction {
  id: string;
  label: string;
  type: 'button' | 'link';
  style?: 'primary' | 'secondary' | 'danger';
  action: string;
  data?: Record<string, any>;
}

export interface CacheEntry<T> {
  data: T | null;
  timestamp: string;
  expiresAt: string;
  isStale: boolean;
}

export interface OfflineAction {
  id: string;
  type: 'create' | 'update' | 'delete';
  entity: 'user' | 'settings' | 'mindmap' | 'plan' | 'task';
  entityId: string;
  payload: Record<string, any>;
  timestamp: string;
  retries: number;
  maxRetries: number;
}

// Store Actions Interface
export interface SessionStoreActions {
  // Authentication Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  verifyMfa: (code: string, method: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  
  // User Profile Actions
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  updateSettings: (updates: Partial<UserSettings>) => Promise<void>;
  uploadAvatar: (file: File) => Promise<string>;
  deleteAccount: () => Promise<void>;
  
  // Session Management
  createSession: (deviceInfo: DeviceInfo) => Promise<UserSession>;
  updateSessionActivity: () => void;
  terminateSession: (sessionId: string) => Promise<void>;
  terminateAllSessions: () => Promise<void>;
  
  // Onboarding Actions
  startOnboarding: () => void;
  completeOnboardingStep: (stepId: string, data?: Record<string, any>) => void;
  skipOnboardingStep: (stepId: string) => void;
  finishOnboarding: () => void;
  restartOnboarding: () => void;
  
  // Tutorial Actions
  startTutorial: (type: 'mindmap' | 'plans' | 'collaboration') => void;
  completeTutorialStep: (type: string, stepId: number) => void;
  finishTutorial: (type: string) => void;
  
  // UI Actions
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  toggleSidebar: () => void;
  showModal: (modal: Omit<UIModal, 'id' | 'zIndex'>) => string;
  hideModal: (modalId: string) => void;
  showToast: (toast: Omit<UIToast, 'id' | 'timestamp'>) => string;
  hideToast: (toastId: string) => void;
  setLoading: (key: keyof SessionStoreState['ui']['loading'], loading: boolean) => void;
  setError: (key: keyof SessionStoreState['ui']['errors'], error: string | null) => void;
  
  // Activity Actions
  addRecentItem: (item: ActivityItem) => void;
  addSearchHistory: (query: string, type: string, resultsCount: number) => void;
  addNavigationHistory: (path: string, title: string, metadata?: Record<string, any>) => void;
  clearHistory: (type: 'search' | 'navigation' | 'all') => void;
  
  // Presence Actions
  setPresenceStatus: (status: 'online' | 'away' | 'busy' | 'offline') => void;
  updateLocation: (location: SessionStoreState['presence']['currentLocation']) => void;
  joinCollaboration: (collaboration: ActiveCollaboration) => void;
  leaveCollaboration: (collaborationId: string) => void;
  
  // Notification Actions
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  markNotificationRead: (notificationId: string) => void;
  markAllNotificationsRead: () => void;
  deleteNotification: (notificationId: string) => void;
  updateNotificationSettings: (settings: Partial<NotificationSettings>) => void;
  
  // Cache Actions
  updateCache: <T>(key: keyof SessionStoreState['cache'], data: T) => void;
  invalidateCache: (key: keyof SessionStoreState['cache'] | 'all') => void;
  
  // Sync Actions
  syncData: () => Promise<void>;
  addOfflineAction: (action: Omit<OfflineAction, 'id' | 'timestamp' | 'retries'>) => void;
  processOfflineActions: () => Promise<void>;
  setOfflineMode: (offline: boolean) => void;
  
  // Subscription Actions
  updateSubscription: (subscription: Partial<UserSubscription>) => void;
  upgradePlan: (plan: UserSubscription['plan']) => Promise<void>;
  cancelSubscription: () => Promise<void>;
  updatePaymentMethod: (paymentMethod: PaymentMethod) => Promise<void>;
  
  // Feature Flag Actions
  updateFeatureFlags: (flags: Record<string, boolean>) => void;
  isFeatureEnabled: (feature: string) => boolean;
  
  // Analytics Actions
  trackEvent: (event: string, properties?: Record<string, any>) => void;
  trackPageView: (path: string, title: string) => void;
  trackUserAction: (action: string, metadata?: Record<string, any>) => void;
  
  // Utility Actions
  initialize: () => Promise<void>;
  reset: () => void;
  cleanup: () => void;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
  mfaCode?: string;
}

// Combined Store Type
export interface SessionStore extends SessionStoreState, SessionStoreActions {}