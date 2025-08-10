import { useSessionStore } from './sessionStore';
import type { 
  SessionStoreState, 
  User, 
  UserProfile, 
  UserSettings, 
  UserSession, 
  ActivityItem,
  Notification,
  OnboardingStep,
  ActiveCollaboration
} from '../types/session';

/**
 * Session Store Selectors
 * Optimized selectors for session store state with memoization
 */

// Authentication Selectors
export const useAuth = () => useSessionStore((state) => state.auth);
export const useIsAuthenticated = () => useSessionStore((state) => state.auth.isAuthenticated);
export const useAuthLoading = () => useSessionStore((state) => state.auth.isLoading);
export const useAuthError = () => useSessionStore((state) => state.auth.error);
export const useCurrentUser = () => useSessionStore((state) => state.auth.user);
export const useTokenInfo = () => useSessionStore((state) => state.auth.tokenInfo);
export const useLoginAttempts = () => useSessionStore((state) => state.auth.loginAttempts);

// MFA Selectors
export const useMfaState = () => useSessionStore((state) => state.auth.mfa);
export const useIsMfaEnabled = () => useSessionStore((state) => state.auth.mfa.isEnabled);
export const useIsMfaRequired = () => useSessionStore((state) => state.auth.mfa.isRequired);
export const useMfaMethods = () => useSessionStore((state) => state.auth.mfa.methods);
export const useMfaPendingVerification = () => useSessionStore((state) => state.auth.mfa.pendingVerification);

// User Profile Selectors
export const useUserProfile = () => useSessionStore((state) => state.auth.user?.profile);
export const useUserDisplayName = () => useSessionStore((state) => 
  state.auth.user?.displayName || state.auth.user?.firstName || state.auth.user?.email || 'Unknown User'
);
export const useUserAvatar = () => useSessionStore((state) => state.auth.user?.avatar);
export const useUserRole = () => useSessionStore((state) => state.auth.user?.role);
export const useUserStatus = () => useSessionStore((state) => state.auth.user?.status);
export const useUserTimezone = () => useSessionStore((state) => state.auth.user?.profile.timezone || 'UTC');
export const useUserLanguage = () => useSessionStore((state) => state.auth.user?.profile.language || 'en');

// User Settings Selectors
export const useUserSettings = () => useSessionStore((state) => state.auth.user?.settings);
export const useUserTheme = () => useSessionStore((state) => state.auth.user?.settings.theme || 'system');
export const useUserNotificationSettings = () => useSessionStore((state) => state.auth.user?.settings.notifications);
export const usePrivacySettings = () => useSessionStore((state) => state.auth.user?.settings.privacy);
export const useWorkspaceSettings = () => useSessionStore((state) => state.auth.user?.settings.workspace);
export const useAccessibilitySettings = () => useSessionStore((state) => state.auth.user?.settings.accessibility);

// Subscription Selectors
export const useSubscription = () => useSessionStore((state) => state.auth.user?.subscription);
export const useSubscriptionPlan = () => useSessionStore((state) => state.auth.user?.subscription.plan || 'free');
export const useSubscriptionStatus = () => useSessionStore((state) => state.auth.user?.subscription.status);
export const useSubscriptionLimits = () => useSessionStore((state) => state.auth.user?.subscription.limits);
export const useSubscriptionUsage = () => useSessionStore((state) => state.auth.user?.subscription.usage);
export const useSubscriptionFeatures = () => useSessionStore((state) => state.auth.user?.subscription.features);

// Usage Limit Checkers
export const useCanCreateMindmap = () => useSessionStore((state) => {
  const subscription = state.auth.user?.subscription;
  if (!subscription) return false;
  
  const { usage, limits } = subscription;
  return limits.mindmaps === null || usage.mindmaps < limits.mindmaps;
});

export const useCanCreatePlan = () => useSessionStore((state) => {
  const subscription = state.auth.user?.subscription;
  if (!subscription) return false;
  
  const { usage, limits } = subscription;
  return limits.plans === null || usage.plans < limits.plans;
});

export const useCanAddCollaborator = () => useSessionStore((state) => {
  const subscription = state.auth.user?.subscription;
  if (!subscription) return false;
  
  const { usage, limits } = subscription;
  return limits.collaborators === null || usage.collaborators < limits.collaborators;
});

export const useStorageUsage = () => useSessionStore((state) => {
  const subscription = state.auth.user?.subscription;
  if (!subscription) return { used: 0, limit: 0, percentage: 0 };
  
  const { usage, limits } = subscription;
  const used = usage.storage;
  const limit = limits.storage || 0;
  const percentage = limit > 0 ? (used / limit) * 100 : 0;
  
  return { used, limit, percentage };
});

// Session Management Selectors
export const useCurrentSession = () => useSessionStore((state) => state.auth.user?.activity.currentSession);
export const useRecentSessions = () => useSessionStore((state) => state.auth.user?.activity.recentSessions || []);
export const useActiveSessions = () => useSessionStore((state) => 
  state.auth.user?.activity.recentSessions.filter(session => session.isActive) || []
);

// Permissions Selectors
export const useUserPermissions = () => useSessionStore((state) => state.auth.user?.permissions);
export const useFeaturePermissions = () => useSessionStore((state) => state.auth.user?.permissions.features);
export const useDataPermissions = () => useSessionStore((state) => state.auth.user?.permissions.data);
export const useAdminPermissions = () => useSessionStore((state) => state.auth.user?.permissions.admin);

export const useCanAccessFeature = (feature: keyof NonNullable<User['permissions']['features']>) => 
  useSessionStore((state) => {
    const permissions = state.auth.user?.permissions.features;
    return permissions?.[feature] !== 'none';
  });

export const useCanEditFeature = (feature: keyof NonNullable<User['permissions']['features']>) => 
  useSessionStore((state) => {
    const permissions = state.auth.user?.permissions.features;
    return permissions?.[feature] === 'write' || permissions?.[feature] === 'admin';
  });

export const useIsAdmin = () => useSessionStore((state) => state.auth.user?.role === 'admin');

// Onboarding Selectors
export const useOnboarding = () => useSessionStore((state) => state.onboarding);
export const useOnboardingComplete = () => useSessionStore((state) => state.onboarding.isComplete);
export const useOnboardingCurrentStep = () => useSessionStore((state) => state.onboarding.currentStep);
export const useOnboardingSteps = () => useSessionStore((state) => state.onboarding.steps);
export const useOnboardingProgress = () => useSessionStore((state) => {
  const { completedSteps, totalSteps } = state.onboarding;
  return {
    completed: completedSteps.length,
    total: totalSteps,
    percentage: totalSteps > 0 ? (completedSteps.length / totalSteps) * 100 : 0
  };
});

export const useCurrentOnboardingStep = () => useSessionStore((state) => {
  const { steps, currentStep } = state.onboarding;
  return steps[currentStep] || null;
});

export const usePendingOnboardingSteps = () => useSessionStore((state) => 
  state.onboarding.steps.filter(step => step.status === 'pending')
);

// Tutorial Selectors
export const useTutorials = () => useSessionStore((state) => state.onboarding.tutorials);
export const useTutorialProgress = (type: 'mindmap' | 'plans' | 'collaboration') => 
  useSessionStore((state) => state.onboarding.tutorials[type]);

export const useIsTutorialComplete = (type: 'mindmap' | 'plans' | 'collaboration') => 
  useSessionStore((state) => state.onboarding.tutorials[type].isComplete);

// Application State Selectors
export const useAppState = () => useSessionStore((state) => state.app);
export const useIsAppInitialized = () => useSessionStore((state) => state.app.isInitialized);
export const useIsOnline = () => useSessionStore((state) => state.app.isOnline);
export const useSyncStatus = () => useSessionStore((state) => state.app.syncStatus);
export const useLastSync = () => useSessionStore((state) => state.app.lastSync);
export const useFeatureFlags = () => useSessionStore((state) => state.app.featureFlags);
export const useAppVersion = () => useSessionStore((state) => ({
  version: state.app.version,
  buildNumber: state.app.buildNumber,
  environment: state.app.environment
}));

export const useIsFeatureEnabled = (feature: string) => 
  useSessionStore((state) => state.app.featureFlags[feature] || false);

// UI State Selectors
export const useUIState = () => useSessionStore((state) => state.ui);
export const useTheme = () => useSessionStore((state) => state.ui.theme);
export const useIsSidebarCollapsed = () => useSessionStore((state) => state.ui.sidebarCollapsed);
export const useModals = () => useSessionStore((state) => state.ui.modalStack);
export const useToasts = () => useSessionStore((state) => state.ui.toasts);
export const useLoadingStates = () => useSessionStore((state) => state.ui.loading);
export const useErrorStates = () => useSessionStore((state) => state.ui.errors);

export const useIsLoading = (key?: keyof SessionStoreState['ui']['loading']) => 
  useSessionStore((state) => 
    key ? state.ui.loading[key] : Object.values(state.ui.loading).some(loading => loading)
  );

export const useHasError = (key?: keyof SessionStoreState['ui']['errors']) => 
  useSessionStore((state) => {
    if (key) {
      const error = state.ui.errors[key];
      return key === 'validation' ? (error as any[]).length > 0 : !!error;
    }
    return Object.entries(state.ui.errors).some(([k, error]) => 
      k === 'validation' ? (error as any[]).length > 0 : !!error
    );
  });

// Activity Selectors
export const useActivity = () => useSessionStore((state) => state.activity);
export const useRecentItems = () => useSessionStore((state) => state.activity.recentItems);
export const useSearchHistory = () => useSessionStore((state) => state.activity.searchHistory);
export const useNavigationHistory = () => useSessionStore((state) => state.activity.navigationHistory);
export const useSessionActivity = () => useSessionStore((state) => ({
  sessionStart: state.activity.sessionStart,
  pageViews: state.activity.pageViews,
  actionsPerformed: state.activity.actionsPerformed,
  timeSpent: state.activity.timeSpent
}));

export const useRecentItemsByType = (type: ActivityItem['type']) => 
  useSessionStore((state) => 
    state.activity.recentItems.filter(item => item.type === type)
  );

// Presence Selectors
export const usePresence = () => useSessionStore((state) => state.presence);
export const usePresenceStatus = () => useSessionStore((state) => state.presence.status);
export const useCurrentLocation = () => useSessionStore((state) => state.presence.currentLocation);
export const useActiveCollaborations = () => useSessionStore((state) => state.presence.activeCollaborations);
export const useCollaborationInvitations = () => useSessionStore((state) => state.presence.invitations);

export const useIsInCollaboration = (itemId?: string) => useSessionStore((state) => {
  const collaborations = state.presence.activeCollaborations;
  return itemId 
    ? collaborations.some(collab => collab.itemId === itemId)
    : collaborations.length > 0;
});

// Notifications Selectors
export const useNotifications = () => useSessionStore((state) => state.notifications);
export const useUnreadNotifications = () => useSessionStore((state) => state.notifications.unread);
export const useArchivedNotifications = () => useSessionStore((state) => state.notifications.archive);
export const useNotificationSettings = () => useSessionStore((state) => state.notifications.settings);

export const useUnreadNotificationCount = () => useSessionStore((state) => state.notifications.unread.length);

export const useNotificationsByType = (type: Notification['type']) => 
  useSessionStore((state) => 
    state.notifications.unread.filter(notification => notification.type === type)
  );

export const useHasUnreadNotifications = () => useSessionStore((state) => state.notifications.unread.length > 0);

// Cache Selectors
export const useCache = () => useSessionStore((state) => state.cache);
export const useCacheEntry = <T>(key: keyof SessionStoreState['cache']) => 
  useSessionStore((state) => state.cache[key] as any);

export const useIsCacheStale = (key: keyof SessionStoreState['cache']) => 
  useSessionStore((state) => {
    const entry = (state.cache as any)[key];
    return entry?.isStale || false;
  });

// Offline Selectors
export const useOffline = () => useSessionStore((state) => state.offline);
export const useIsOffline = () => useSessionStore((state) => state.offline.isOffline);
export const usePendingActions = () => useSessionStore((state) => state.offline.pendingActions);
export const useOfflineCapabilities = () => useSessionStore((state) => ({
  offlineStorage: state.offline.offlineStorage,
  offlineActions: state.offline.offlineActions
}));

export const useHasPendingActions = () => useSessionStore((state) => state.offline.pendingActions.length > 0);

// Computed Selectors
export const useUserInitials = () => useSessionStore((state) => {
  const user = state.auth.user;
  if (!user) return '';
  
  if (user.firstName && user.lastName) {
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  }
  
  if (user.displayName) {
    const names = user.displayName.split(' ');
    if (names.length >= 2) {
      return `${names[0].charAt(0)}${names[1].charAt(0)}`.toUpperCase();
    }
    return names[0].charAt(0).toUpperCase();
  }
  
  return user.email.charAt(0).toUpperCase();
});

export const useUserFullName = () => useSessionStore((state) => {
  const user = state.auth.user;
  if (!user) return '';
  
  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`;
  }
  
  return user.displayName || user.email;
});

export const useSessionDuration = () => useSessionStore((state) => {
  const startTime = new Date(state.activity.sessionStart).getTime();
  const currentTime = Date.now();
  return Math.floor((currentTime - startTime) / 1000);
});

export const useIsFirstLogin = () => useSessionStore((state) => 
  state.auth.user?.metadata.isFirstLogin || false
);

export const useNeedsOnboarding = () => useSessionStore((state) => {
  const user = state.auth.user;
  const onboarding = state.onboarding;
  
  return user?.metadata.isFirstLogin && !onboarding.isComplete;
});

export const useAccountAge = () => useSessionStore((state) => {
  const user = state.auth.user;
  if (!user?.metadata.createdAt) return 0;
  
  const createdAt = new Date(user.metadata.createdAt).getTime();
  const now = Date.now();
  
  return Math.floor((now - createdAt) / (1000 * 60 * 60 * 24)); // days
});

export const useSubscriptionDaysRemaining = () => useSessionStore((state) => {
  const subscription = state.auth.user?.subscription;
  if (!subscription?.periodEnd) return null;
  
  const endDate = new Date(subscription.periodEnd).getTime();
  const now = Date.now();
  
  return Math.max(0, Math.ceil((endDate - now) / (1000 * 60 * 60 * 24)));
});

export const useIsTrialing = () => useSessionStore((state) => 
  state.auth.user?.subscription.status === 'trialing'
);

export const useTrialDaysRemaining = () => useSessionStore((state) => {
  const subscription = state.auth.user?.subscription;
  if (!subscription?.trialEnd) return null;
  
  const endDate = new Date(subscription.trialEnd).getTime();
  const now = Date.now();
  
  return Math.max(0, Math.ceil((endDate - now) / (1000 * 60 * 60 * 24)));
});

// Performance & Analytics
export const usePerformanceMetrics = () => useSessionStore((state) => state.app.performance);

export const useUserActivityStats = () => useSessionStore((state) => 
  state.auth.user?.activity.stats
);

export const useProductivityMetrics = () => useSessionStore((state) => 
  state.auth.user?.activity.productivity
);

// Bulk Selectors for Performance
export const useAuthBundle = () => useSessionStore((state) => ({
  isAuthenticated: state.auth.isAuthenticated,
  isLoading: state.auth.isLoading,
  user: state.auth.user,
  error: state.auth.error
}));

export const useUserBundle = () => useSessionStore((state) => {
  const user = state.auth.user;
  if (!user) return null;
  
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    avatar: user.avatar,
    role: user.role,
    status: user.status,
    plan: user.subscription.plan
  };
});

export const useNotificationBundle = () => useSessionStore((state) => ({
  unread: state.notifications.unread,
  count: state.notifications.unread.length,
  hasUnread: state.notifications.unread.length > 0,
  settings: state.notifications.settings
}));

export const useActivityBundle = () => useSessionStore((state) => ({
  recentItems: state.activity.recentItems.slice(0, 5),
  sessionDuration: state.activity.timeSpent,
  pageViews: state.activity.pageViews,
  actions: state.activity.actionsPerformed
}));