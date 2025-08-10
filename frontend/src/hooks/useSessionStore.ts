import { useCallback, useEffect, useMemo } from 'react';
import { useSessionStore as useStore } from '../store/sessionStore';
import { globalErrorHandler, showSuccess, showError, showWarning, showInfo } from '../utils/errorHandler';
import {
  useAuth,
  useCurrentUser,
  useOnboarding,
  useNotifications,
  useActivity,
  usePresence,
  useSubscription,
  useIsAuthenticated,
  useAuthLoading,
  useUnreadNotificationCount,
  useIsOnline,
  useOffline
} from '../store/sessionSelectors';
import type {
  LoginCredentials,
  UserProfile,
  UserSettings,
  DeviceInfo,
  ActivityItem,
  Notification
} from '../types/session';

/**
 * Session Store Hooks
 * High-level hooks that provide common session functionality
 */

// Authentication Hooks
export const useAuthentication = () => {
  const auth = useAuth();
  const login = useStore((state) => state.login);
  const logout = useStore((state) => state.logout);
  const refreshToken = useStore((state) => state.refreshToken);
  const verifyMfa = useStore((state) => state.verifyMfa);
  const resetPassword = useStore((state) => state.resetPassword);

  const handleLogin = useCallback(async (credentials: LoginCredentials) => {
    try {
      await login(credentials);
      showSuccess('Login successful! Welcome back.', { duration: 3000 });
      return { success: true };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Login failed';
      showError(`Login failed: ${errorMsg}`, {
        duration: 5000,
        actions: [{ label: 'Forgot Password?', onClick: () => showInfo('Password reset link sent to your email') }]
      });
      return { 
        success: false, 
        error: errorMsg
      };
    }
  }, [login]);

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      showInfo('You have been logged out successfully.', { duration: 2000 });
      return { success: true };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Logout failed';
      showError(`Logout failed: ${errorMsg}`, { duration: 3000 });
      return { 
        success: false, 
        error: errorMsg
      };
    }
  }, [logout]);

  const handleMfaVerification = useCallback(async (code: string, method: string) => {
    try {
      await verifyMfa(code, method);
      showSuccess('Multi-factor authentication verified successfully!', { duration: 3000 });
      return { success: true };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'MFA verification failed';
      showError(`MFA verification failed: ${errorMsg}`, {
        duration: 4000,
        actions: [{ label: 'Try Again', onClick: () => showInfo('Please enter a new verification code') }]
      });
      return { 
        success: false, 
        error: errorMsg
      };
    }
  }, [verifyMfa]);

  const handlePasswordReset = useCallback(async (email: string) => {
    try {
      await resetPassword(email);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Password reset failed' 
      };
    }
  }, [resetPassword]);

  return {
    ...auth,
    login: handleLogin,
    logout: handleLogout,
    verifyMfa: handleMfaVerification,
    resetPassword: handlePasswordReset,
    refreshToken
  };
};

// User Profile Management Hook
export const useUserProfile = () => {
  const user = useCurrentUser();
  const updateProfile = useStore((state) => state.updateProfile);
  const updateSettings = useStore((state) => state.updateSettings);
  const uploadAvatar = useStore((state) => state.uploadAvatar);
  const deleteAccount = useStore((state) => state.deleteAccount);

  const handleProfileUpdate = useCallback(async (updates: Partial<UserProfile>) => {
    try {
      await updateProfile(updates);
      showSuccess('Profile updated successfully!', { duration: 2000 });
      return { success: true };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Profile update failed';
      showError(`Profile update failed: ${errorMsg}`, { duration: 4000 });
      return { 
        success: false, 
        error: errorMsg
      };
    }
  }, [updateProfile]);

  const handleSettingsUpdate = useCallback(async (updates: Partial<UserSettings>) => {
    try {
      await updateSettings(updates);
      showSuccess('Settings saved successfully!', { duration: 2000 });
      return { success: true };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Settings update failed';
      showError(`Settings update failed: ${errorMsg}`, { duration: 4000 });
      return { 
        success: false, 
        error: errorMsg
      };
    }
  }, [updateSettings]);

  const handleAvatarUpload = useCallback(async (file: File) => {
    try {
      const avatarUrl = await uploadAvatar(file);
      showSuccess('Avatar uploaded successfully!', { duration: 2000 });
      return { success: true, avatarUrl };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Avatar upload failed';
      showError(`Avatar upload failed: ${errorMsg}`, { duration: 4000 });
      return { 
        success: false, 
        error: errorMsg
      };
    }
  }, [uploadAvatar]);

  const handleAccountDeletion = useCallback(async () => {
    try {
      await deleteAccount();
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Account deletion failed' 
      };
    }
  }, [deleteAccount]);

  return {
    user,
    updateProfile: handleProfileUpdate,
    updateSettings: handleSettingsUpdate,
    uploadAvatar: handleAvatarUpload,
    deleteAccount: handleAccountDeletion
  };
};

// Session Management Hook
export const useSessionManagement = () => {
  const createSession = useStore((state) => state.createSession);
  const updateSessionActivity = useStore((state) => state.updateSessionActivity);
  const terminateSession = useStore((state) => state.terminateSession);
  const terminateAllSessions = useStore((state) => state.terminateAllSessions);
  const trackEvent = useStore((state) => state.trackEvent);
  const trackPageView = useStore((state) => state.trackPageView);
  const trackUserAction = useStore((state) => state.trackUserAction);

  const handleSessionCreation = useCallback(async (deviceInfo: DeviceInfo) => {
    try {
      const session = await createSession(deviceInfo);
      return { success: true, session };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Session creation failed' 
      };
    }
  }, [createSession]);

  // Auto-update session activity
  useEffect(() => {
    const interval = setInterval(() => {
      updateSessionActivity();
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [updateSessionActivity]);

  // Track page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        updateSessionActivity();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [updateSessionActivity]);

  return {
    createSession: handleSessionCreation,
    updateActivity: updateSessionActivity,
    terminateSession,
    terminateAllSessions,
    trackEvent,
    trackPageView,
    trackUserAction
  };
};

// Onboarding Hook
export const useOnboardingFlow = () => {
  const onboarding = useOnboarding();
  const startOnboarding = useStore((state) => state.startOnboarding);
  const completeOnboardingStep = useStore((state) => state.completeOnboardingStep);
  const skipOnboardingStep = useStore((state) => state.skipOnboardingStep);
  const finishOnboarding = useStore((state) => state.finishOnboarding);
  const restartOnboarding = useStore((state) => state.restartOnboarding);
  const startTutorial = useStore((state) => state.startTutorial);
  const completeTutorialStep = useStore((state) => state.completeTutorialStep);
  const finishTutorial = useStore((state) => state.finishTutorial);

  const currentStep = useMemo(() => 
    onboarding.steps[onboarding.currentStep] || null,
    [onboarding.steps, onboarding.currentStep]
  );

  const progress = useMemo(() => ({
    completed: onboarding.completedSteps.length,
    total: onboarding.totalSteps,
    percentage: onboarding.totalSteps > 0 
      ? (onboarding.completedSteps.length / onboarding.totalSteps) * 100 
      : 0
  }), [onboarding.completedSteps.length, onboarding.totalSteps]);

  const canProceed = useMemo(() => {
    if (!currentStep) return false;
    return currentStep.status === 'completed' || !currentStep.isRequired;
  }, [currentStep]);

  return {
    ...onboarding,
    currentStep,
    progress,
    canProceed,
    start: startOnboarding,
    completeStep: completeOnboardingStep,
    skipStep: skipOnboardingStep,
    finish: finishOnboarding,
    restart: restartOnboarding,
    startTutorial,
    completeTutorialStep,
    finishTutorial
  };
};

// Notifications Hook
export const useNotificationSystem = () => {
  const notifications = useNotifications();
  const addNotification = useStore((state) => state.addNotification);
  const markNotificationRead = useStore((state) => state.markNotificationRead);
  const markAllNotificationsRead = useStore((state) => state.markAllNotificationsRead);
  const deleteNotification = useStore((state) => state.deleteNotification);
  const updateNotificationSettings = useStore((state) => state.updateNotificationSettings);

  const showNotification = useCallback((
    type: Notification['type'],
    title: string,
    message: string,
    options?: {
      metadata?: Notification['metadata'];
      actions?: Notification['actions'];
      channels?: Notification['channels'];
    }
  ) => {
    addNotification({
      type,
      title,
      message,
      read: false,
      channels: options?.channels || ['in_app'],
      delivered: true,
      deliveredAt: new Date().toISOString(),
      ...options
    });
  }, [addNotification]);

  const showSuccessNotification = useCallback((title: string, message: string) => {
    showNotification('system', title, message);
    // Also show as toast for immediate feedback
    showSuccess(`${title}: ${message}`, { duration: 3000 });
  }, [showNotification]);

  const showErrorNotification = useCallback((title: string, message: string) => {
    showNotification('system', title, message, {
      metadata: { severity: 'high' }
    });
    // Also show as toast for immediate feedback
    showError(`${title}: ${message}`, { duration: 4000 });
  }, [showNotification]);

  const showCollaborationNotification = useCallback((title: string, message: string, itemId: string) => {
    showNotification('collaboration', title, message, {
      metadata: { itemId, itemType: 'mindmap' }
    });
    // Also show as toast for collaboration updates
    showInfo(`${title}: ${message}`, { duration: 3000 });
  }, [showNotification]);

  return {
    notifications,
    show: showNotification,
    showSuccess: showSuccessNotification,
    showError: showErrorNotification,
    // Direct toast methods for immediate feedback
    showToastSuccess: showSuccess,
    showToastError: showError,
    showToastWarning: showWarning,
    showToastInfo: showInfo,
    showCollaboration: showCollaborationNotification,
    markRead: markNotificationRead,
    markAllRead: markAllNotificationsRead,
    delete: deleteNotification,
    updateSettings: updateNotificationSettings
  };
};

// Activity Tracking Hook
export const useActivityTracking = () => {
  const activity = useActivity();
  const addRecentItem = useStore((state) => state.addRecentItem);
  const addSearchHistory = useStore((state) => state.addSearchHistory);
  const addNavigationHistory = useStore((state) => state.addNavigationHistory);
  const clearHistory = useStore((state) => state.clearHistory);

  const trackActivity = useCallback((
    type: ActivityItem['type'],
    action: ActivityItem['action'],
    itemId: string,
    itemName: string,
    metadata?: Record<string, any>
  ) => {
    addRecentItem({
      id: `activity_${Date.now()}`,
      type,
      action,
      itemId,
      itemName,
      timestamp: new Date().toISOString(),
      metadata
    });
  }, [addRecentItem]);

  const trackSearch = useCallback((query: string, type: string, resultsCount: number) => {
    addSearchHistory(query, type, resultsCount);
  }, [addSearchHistory]);

  const trackNavigation = useCallback((path: string, title: string, metadata?: Record<string, any>) => {
    addNavigationHistory(path, title, metadata);
  }, [addNavigationHistory]);

  return {
    ...activity,
    track: trackActivity,
    trackSearch,
    trackNavigation,
    clearHistory
  };
};

// Presence Hook
export const usePresenceSystem = () => {
  const presence = usePresence();
  const setPresenceStatus = useStore((state) => state.setPresenceStatus);
  const updateLocation = useStore((state) => state.updateLocation);
  const joinCollaboration = useStore((state) => state.joinCollaboration);
  const leaveCollaboration = useStore((state) => state.leaveCollaboration);

  // Auto-update presence based on user activity
  useEffect(() => {
    const handleActivity = () => {
      if (presence.status === 'away') {
        setPresenceStatus('online');
      }
    };

    const handleFocus = () => setPresenceStatus('online');
    const handleBlur = () => {
      setTimeout(() => {
        if (document.hidden) {
          setPresenceStatus('away');
        }
      }, 300000); // 5 minutes delay
    };

    document.addEventListener('mousemove', handleActivity);
    document.addEventListener('keypress', handleActivity);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('mousemove', handleActivity);
      document.removeEventListener('keypress', handleActivity);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, [presence.status, setPresenceStatus]);

  return {
    ...presence,
    setStatus: setPresenceStatus,
    updateLocation,
    joinCollaboration,
    leaveCollaboration
  };
};

// Subscription Hook
export const useSubscriptionManager = () => {
  const subscription = useSubscription();
  const updateSubscription = useStore((state) => state.updateSubscription);
  const upgradePlan = useStore((state) => state.upgradePlan);
  const cancelSubscription = useStore((state) => state.cancelSubscription);
  const updatePaymentMethod = useStore((state) => state.updatePaymentMethod);

  const handlePlanUpgrade = useCallback(async (plan: NonNullable<typeof subscription>['plan']) => {
    try {
      await upgradePlan(plan);
      showSuccess(`Successfully upgraded to ${plan} plan!`, {
        duration: 4000,
        actions: [{ label: 'View Features', onClick: () => showInfo('Check out your new features in the settings') }]
      });
      return { success: true };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Plan upgrade failed';
      showError(`Plan upgrade failed: ${errorMsg}`, { duration: 4000 });
      return { 
        success: false, 
        error: errorMsg
      };
    }
  }, [upgradePlan]);

  const handleSubscriptionCancellation = useCallback(async () => {
    try {
      await cancelSubscription();
      showWarning('Subscription cancelled. You will retain access until the end of your billing period.', {
        duration: 6000,
        actions: [{ label: 'Reactivate', onClick: () => showInfo('Contact support to reactivate your subscription') }]
      });
      return { success: true };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Subscription cancellation failed';
      showError(`Cancellation failed: ${errorMsg}`, { duration: 4000 });
      return { 
        success: false, 
        error: errorMsg
      };
    }
  }, [cancelSubscription]);

  const usagePercentage = useMemo(() => {
    if (!subscription) return {};

    const { usage, limits } = subscription;
    return {
      mindmaps: limits.mindmaps ? (usage.mindmaps / limits.mindmaps) * 100 : 0,
      plans: limits.plans ? (usage.plans / limits.plans) * 100 : 0,
      storage: limits.storage ? (usage.storage / limits.storage) * 100 : 0,
      collaborators: limits.collaborators ? (usage.collaborators / limits.collaborators) * 100 : 0,
      apiCalls: limits.apiCalls ? (usage.apiCalls / limits.apiCalls) * 100 : 0
    };
  }, [subscription]);

  const isNearLimit = useCallback((resource: keyof NonNullable<typeof subscription>['usage'], threshold = 80) => {
    if (!subscription?.limits[resource]) return false;
    return usagePercentage[resource] >= threshold;
  }, [subscription, usagePercentage]);

  return {
    subscription,
    usagePercentage,
    isNearLimit,
    updateSubscription,
    upgradePlan: handlePlanUpgrade,
    cancelSubscription: handleSubscriptionCancellation,
    updatePaymentMethod
  };
};

// Offline/Online Hook
export const useConnectivity = () => {
  const offline = useOffline();
  const isOnline = useIsOnline();
  const syncData = useStore((state) => state.syncData);
  const addOfflineAction = useStore((state) => state.addOfflineAction);
  const processOfflineActions = useStore((state) => state.processOfflineActions);
  const setOfflineMode = useStore((state) => state.setOfflineMode);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setOfflineMode(false);
      // Process any pending offline actions
      processOfflineActions();
    };

    const handleOffline = () => {
      setOfflineMode(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    setOfflineMode(!navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setOfflineMode, processOfflineActions]);

  // Auto-sync when coming back online
  useEffect(() => {
    if (isOnline && offline.pendingActions.length === 0) {
      syncData();
    }
  }, [isOnline, offline.pendingActions.length, syncData]);

  return {
    ...offline,
    isOnline,
    sync: syncData,
    addOfflineAction,
    processOfflineActions,
    setOfflineMode
  };
};

// UI State Hook
export const useSessionUI = () => {
  const setTheme = useStore((state) => state.setTheme);
  const toggleSidebar = useStore((state) => state.toggleSidebar);
  const showModal = useStore((state) => state.showModal);
  const hideModal = useStore((state) => state.hideModal);
  const showToast = useStore((state) => state.showToast);
  const hideToast = useStore((state) => state.hideToast);
  const setLoading = useStore((state) => state.setLoading);
  const setError = useStore((state) => state.setError);

  return {
    setTheme,
    toggleSidebar,
    showModal,
    hideModal,
    showToast,
    hideToast,
    setLoading,
    setError
  };
};

// Initialization Hook
export const useSessionInitialization = () => {
  const initialize = useStore((state) => state.initialize);
  const cleanup = useStore((state) => state.cleanup);
  const reset = useStore((state) => state.reset);
  const isAuthenticated = useIsAuthenticated();
  const isLoading = useAuthLoading();
  const unreadCount = useUnreadNotificationCount();

  // Initialize session on mount
  useEffect(() => {
    initialize();
    
    // Cleanup on unmount
    return () => {
      cleanup();
    };
  }, [initialize, cleanup]);

  // Setup periodic token refresh
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      // Token refresh is handled automatically in the store
    }, 50 * 60 * 1000); // Check every 50 minutes

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  return {
    initialize,
    cleanup,
    reset,
    isInitialized: !isLoading,
    hasNotifications: unreadCount > 0
  };
};

// Combined Session Hook (Main Hook)
export const useSession = () => {
  const auth = useAuthentication();
  const profile = useUserProfile();
  const onboarding = useOnboardingFlow();
  const notifications = useNotificationSystem();
  const activity = useActivityTracking();
  const presence = usePresenceSystem();
  const subscription = useSubscriptionManager();
  const connectivity = useConnectivity();
  const ui = useSessionUI();

  return {
    auth,
    profile,
    onboarding,
    notifications,
    activity,
    presence,
    subscription,
    connectivity,
    ui
  };
};