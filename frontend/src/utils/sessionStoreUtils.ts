import type {
  User,
  UserSession,
  DeviceInfo,
  ActivityItem,
  Notification,
  OnboardingStep,
  TokenInfo,
  UserSubscription,
  SessionLocation
} from '../types/session';

/**
 * Session Store Utilities
 * Helper functions for session store state management and data manipulation
 */

// Authentication Utilities
export const AuthUtils = {
  /**
   * Check if user session is valid
   */
  isSessionValid: (tokenInfo: TokenInfo | null): boolean => {
    if (!tokenInfo) return false;
    
    const now = Date.now();
    const expiresAt = new Date(tokenInfo.expiresAt).getTime();
    
    return now < expiresAt;
  },

  /**
   * Get time until token expires (in seconds)
   */
  getTimeUntilExpiry: (tokenInfo: TokenInfo | null): number => {
    if (!tokenInfo) return 0;
    
    const now = Date.now();
    const expiresAt = new Date(tokenInfo.expiresAt).getTime();
    
    return Math.max(0, Math.floor((expiresAt - now) / 1000));
  },

  /**
   * Check if token needs refresh (expires within 5 minutes)
   */
  needsRefresh: (tokenInfo: TokenInfo | null): boolean => {
    if (!tokenInfo) return false;
    
    const timeUntilExpiry = AuthUtils.getTimeUntilExpiry(tokenInfo);
    return timeUntilExpiry <= 300; // 5 minutes
  },

  /**
   * Generate device fingerprint
   */
  generateDeviceFingerprint: (): string => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('Device fingerprint', 2, 2);
    }
    
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      canvas.toDataURL()
    ].join('|');
    
    return btoa(fingerprint).substring(0, 32);
  },

  /**
   * Get device information
   */
  getDeviceInfo: (): DeviceInfo => {
    const userAgent = navigator.userAgent;
    
    // Detect device type
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    const isTablet = /iPad|Android(?=.*Mobile)/i.test(userAgent) || 
                    (window.screen.width >= 768 && window.screen.width < 1024);
    
    let type: DeviceInfo['type'] = 'desktop';
    if (isMobile && !isTablet) type = 'mobile';
    else if (isTablet) type = 'tablet';

    // Detect OS
    let os = 'Unknown';
    if (userAgent.includes('Windows')) os = 'Windows';
    else if (userAgent.includes('Mac')) os = 'macOS';
    else if (userAgent.includes('Linux')) os = 'Linux';
    else if (userAgent.includes('Android')) os = 'Android';
    else if (userAgent.includes('iOS')) os = 'iOS';

    // Detect browser
    let browser = 'Unknown';
    if (userAgent.includes('Chrome')) browser = 'Chrome';
    else if (userAgent.includes('Firefox')) browser = 'Firefox';
    else if (userAgent.includes('Safari')) browser = 'Safari';
    else if (userAgent.includes('Edge')) browser = 'Edge';

    return {
      type,
      os,
      browser,
      version: navigator.appVersion,
      screenResolution: `${screen.width}x${screen.height}`,
      colorDepth: screen.colorDepth,
      touchSupport: 'ontouchstart' in window || navigator.maxTouchPoints > 0
    };
  },

  /**
   * Estimate password strength
   */
  getPasswordStrength: (password: string): { score: number; feedback: string[] } => {
    let score = 0;
    const feedback: string[] = [];

    if (password.length < 8) {
      feedback.push('Password should be at least 8 characters long');
    } else {
      score += 1;
    }

    if (!/[a-z]/.test(password)) {
      feedback.push('Add lowercase letters');
    } else {
      score += 1;
    }

    if (!/[A-Z]/.test(password)) {
      feedback.push('Add uppercase letters');
    } else {
      score += 1;
    }

    if (!/[0-9]/.test(password)) {
      feedback.push('Add numbers');
    } else {
      score += 1;
    }

    if (!/[^a-zA-Z0-9]/.test(password)) {
      feedback.push('Add special characters');
    } else {
      score += 1;
    }

    if (password.length >= 12) {
      score += 1;
    }

    return { score: Math.min(score, 5), feedback };
  }
};

// User Utilities
export const UserUtils = {
  /**
   * Get user display name
   */
  getDisplayName: (user: User | null): string => {
    if (!user) return 'Unknown User';
    
    if (user.displayName) return user.displayName;
    if (user.firstName && user.lastName) return `${user.firstName} ${user.lastName}`;
    if (user.firstName) return user.firstName;
    if (user.email) return user.email.split('@')[0];
    
    return 'User';
  },

  /**
   * Get user initials
   */
  getInitials: (user: User | null): string => {
    if (!user) return 'U';
    
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
    
    return user.email?.charAt(0).toUpperCase() || 'U';
  },

  /**
   * Get user avatar URL or generate initials-based URL
   */
  getAvatarUrl: (user: User | null, size = 40): string => {
    if (!user) return '';
    
    if (user.avatar) return user.avatar;
    
    const initials = UserUtils.getInitials(user);
    const backgroundColor = UserUtils.getColorFromString(user.id);
    
    return `https://ui-avatars.com/api/?name=${initials}&size=${size}&background=${backgroundColor}&color=fff&bold=true`;
  },

  /**
   * Generate consistent color from string
   */
  getColorFromString: (str: string): string => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const colors = [
      '3b82f6', '8b5cf6', 'f59e0b', 'ef4444', '10b981',
      'f97316', '06b6d4', 'ec4899', '84cc16', '6366f1'
    ];
    
    return colors[Math.abs(hash) % colors.length];
  },

  /**
   * Check if user has permission
   */
  hasPermission: (user: User | null, feature: string, level: 'read' | 'write' | 'admin' = 'read'): boolean => {
    if (!user?.permissions) return false;
    
    const featurePermissions = user.permissions.features as any;
    const userLevel = featurePermissions[feature];
    
    if (!userLevel || userLevel === 'none') return false;
    
    const levels = ['read', 'write', 'admin'];
    const requiredIndex = levels.indexOf(level);
    const userIndex = levels.indexOf(userLevel);
    
    return userIndex >= requiredIndex;
  },

  /**
   * Check if user is admin
   */
  isAdmin: (user: User | null): boolean => {
    return user?.role === 'admin';
  },

  /**
   * Get user timezone
   */
  getUserTimezone: (user: User | null): string => {
    return user?.profile.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
  },

  /**
   * Format user join date
   */
  formatJoinDate: (user: User | null): string => {
    if (!user?.metadata.createdAt) return '';
    
    const joinDate = new Date(user.metadata.createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - joinDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) {
      return `${diffDays} days ago`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} month${months > 1 ? 's' : ''} ago`;
    } else {
      const years = Math.floor(diffDays / 365);
      return `${years} year${years > 1 ? 's' : ''} ago`;
    }
  }
};

// Session Utilities
export const SessionUtils = {
  /**
   * Get session duration in human readable format
   */
  getSessionDuration: (session: UserSession): string => {
    const start = new Date(session.startTime).getTime();
    const end = session.endTime ? new Date(session.endTime).getTime() : Date.now();
    const duration = Math.floor((end - start) / 1000);
    
    if (duration < 60) return `${duration}s`;
    if (duration < 3600) return `${Math.floor(duration / 60)}m`;
    if (duration < 86400) return `${Math.floor(duration / 3600)}h`;
    
    return `${Math.floor(duration / 86400)}d`;
  },

  /**
   * Check if session is active
   */
  isActiveSession: (session: UserSession): boolean => {
    if (!session.isActive) return false;
    
    const lastActivity = new Date(session.lastActivity).getTime();
    const now = Date.now();
    const inactiveThreshold = 30 * 60 * 1000; // 30 minutes
    
    return (now - lastActivity) < inactiveThreshold;
  },

  /**
   * Get session location string
   */
  getLocationString: (location: SessionLocation): string => {
    const parts = [location.city, location.region, location.country].filter(Boolean);
    return parts.join(', ');
  },

  /**
   * Classify session device
   */
  classifyDevice: (userAgent: string): { type: string; name: string; icon: string } => {
    if (/iPhone/i.test(userAgent)) {
      return { type: 'mobile', name: 'iPhone', icon: '📱' };
    }
    if (/iPad/i.test(userAgent)) {
      return { type: 'tablet', name: 'iPad', icon: '📟' };
    }
    if (/Android/i.test(userAgent)) {
      const isTablet = !/Mobile/i.test(userAgent);
      return { 
        type: isTablet ? 'tablet' : 'mobile', 
        name: isTablet ? 'Android Tablet' : 'Android Phone', 
        icon: isTablet ? '📟' : '📱' 
      };
    }
    if (/Windows/i.test(userAgent)) {
      return { type: 'desktop', name: 'Windows PC', icon: '💻' };
    }
    if (/Macintosh/i.test(userAgent)) {
      return { type: 'desktop', name: 'Mac', icon: '🖥️' };
    }
    
    return { type: 'desktop', name: 'Desktop', icon: '💻' };
  }
};

// Activity Utilities
export const ActivityUtils = {
  /**
   * Format activity timestamp
   */
  formatTimestamp: (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  },

  /**
   * Group activities by date
   */
  groupByDate: (activities: ActivityItem[]): Record<string, ActivityItem[]> => {
    return activities.reduce((groups, activity) => {
      const date = new Date(activity.timestamp).toDateString();
      if (!groups[date]) groups[date] = [];
      groups[date].push(activity);
      return groups;
    }, {} as Record<string, ActivityItem[]>);
  },

  /**
   * Get activity icon
   */
  getActivityIcon: (activity: ActivityItem): string => {
    const iconMap = {
      mindmap: {
        created: '🧠',
        updated: '✏️',
        deleted: '🗑️',
        shared: '🤝',
        completed: '✅'
      },
      plan: {
        created: '📋',
        updated: '✏️',
        deleted: '🗑️',
        shared: '🤝',
        completed: '✅'
      },
      task: {
        created: '📝',
        updated: '✏️',
        deleted: '🗑️',
        shared: '🤝',
        completed: '✅'
      },
      milestone: {
        created: '🏁',
        updated: '✏️',
        deleted: '🗑️',
        shared: '🤝',
        completed: '🎉'
      },
      collaboration: {
        created: '👥',
        updated: '✏️',
        deleted: '👋',
        shared: '🤝',
        completed: '🤝'
      }
    };
    
    return iconMap[activity.type]?.[activity.action] || '📄';
  },

  /**
   * Get activity color
   */
  getActivityColor: (activity: ActivityItem): string => {
    const colorMap = {
      created: 'green',
      updated: 'blue',
      deleted: 'red',
      shared: 'purple',
      completed: 'green'
    };
    
    return colorMap[activity.action] || 'gray';
  },

  /**
   * Filter activities by type
   */
  filterByType: (activities: ActivityItem[], type: ActivityItem['type']): ActivityItem[] => {
    return activities.filter(activity => activity.type === type);
  },

  /**
   * Filter activities by date range
   */
  filterByDateRange: (activities: ActivityItem[], startDate: Date, endDate: Date): ActivityItem[] => {
    return activities.filter(activity => {
      const activityDate = new Date(activity.timestamp);
      return activityDate >= startDate && activityDate <= endDate;
    });
  }
};

// Subscription Utilities
export const SubscriptionUtils = {
  /**
   * Check if plan has feature
   */
  hasFeature: (subscription: UserSubscription | undefined, feature: keyof UserSubscription['features']): boolean => {
    return subscription?.features[feature] || false;
  },

  /**
   * Get plan display name
   */
  getPlanDisplayName: (plan: UserSubscription['plan']): string => {
    const names = {
      free: 'Free',
      pro: 'Pro',
      team: 'Team',
      enterprise: 'Enterprise'
    };
    return names[plan];
  },

  /**
   * Get plan color
   */
  getPlanColor: (plan: UserSubscription['plan']): string => {
    const colors = {
      free: 'gray',
      pro: 'blue',
      team: 'purple',
      enterprise: 'gold'
    };
    return colors[plan];
  },

  /**
   * Calculate usage percentage
   */
  getUsagePercentage: (usage: number, limit: number | null): number => {
    if (limit === null || limit === 0) return 0;
    return Math.min((usage / limit) * 100, 100);
  },

  /**
   * Check if near limit
   */
  isNearLimit: (usage: number, limit: number | null, threshold = 80): boolean => {
    if (limit === null) return false;
    return SubscriptionUtils.getUsagePercentage(usage, limit) >= threshold;
  },

  /**
   * Format storage size
   */
  formatStorageSize: (bytes: number): string => {
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 B';
    
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  },

  /**
   * Get days until renewal
   */
  getDaysUntilRenewal: (periodEnd: string): number => {
    const endDate = new Date(periodEnd).getTime();
    const now = Date.now();
    return Math.max(0, Math.ceil((endDate - now) / (1000 * 60 * 60 * 24)));
  },

  /**
   * Check if subscription is active
   */
  isActive: (subscription: UserSubscription | undefined): boolean => {
    if (!subscription) return false;
    return subscription.status === 'active' || subscription.status === 'trialing';
  },

  /**
   * Check if in trial period
   */
  isTrialing: (subscription: UserSubscription | undefined): boolean => {
    return subscription?.status === 'trialing';
  },

  /**
   * Get trial days remaining
   */
  getTrialDaysRemaining: (subscription: UserSubscription | undefined): number => {
    if (!subscription?.trialEnd) return 0;
    
    const endDate = new Date(subscription.trialEnd).getTime();
    const now = Date.now();
    return Math.max(0, Math.ceil((endDate - now) / (1000 * 60 * 60 * 24)));
  }
};

// Notification Utilities
export const NotificationUtils = {
  /**
   * Get notification icon
   */
  getNotificationIcon: (notification: Notification): string => {
    const iconMap = {
      system: '⚙️',
      collaboration: '👥',
      reminder: '⏰',
      security: '🔒',
      billing: '💳'
    };
    return iconMap[notification.type] || '📄';
  },

  /**
   * Get notification color
   */
  getNotificationColor: (notification: Notification): string => {
    const severity = notification.metadata?.severity || 'medium';
    const colorMap = {
      low: 'blue',
      medium: 'yellow',
      high: 'orange',
      critical: 'red'
    };
    return colorMap[severity];
  },

  /**
   * Format notification time
   */
  formatTime: (timestamp: string): string => {
    return ActivityUtils.formatTimestamp(timestamp);
  },

  /**
   * Group notifications by type
   */
  groupByType: (notifications: Notification[]): Record<string, Notification[]> => {
    return notifications.reduce((groups, notification) => {
      if (!groups[notification.type]) groups[notification.type] = [];
      groups[notification.type].push(notification);
      return groups;
    }, {} as Record<string, Notification[]>);
  },

  /**
   * Filter unread notifications
   */
  filterUnread: (notifications: Notification[]): Notification[] => {
    return notifications.filter(n => !n.read);
  },

  /**
   * Sort notifications by priority and time
   */
  sortByPriority: (notifications: Notification[]): Notification[] => {
    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    
    return [...notifications].sort((a, b) => {
      const aSeverity = a.metadata?.severity || 'medium';
      const bSeverity = b.metadata?.severity || 'medium';
      
      // Sort by severity first
      const severityDiff = (severityOrder as any)[aSeverity] - (severityOrder as any)[bSeverity];
      if (severityDiff !== 0) return severityDiff;
      
      // Then by timestamp (newest first)
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
  }
};

// Onboarding Utilities
export const OnboardingUtils = {
  /**
   * Get next available step
   */
  getNextStep: (steps: OnboardingStep[], completedSteps: string[]): OnboardingStep | null => {
    return steps.find(step => 
      step.status === 'pending' && 
      step.dependencies.every(dep => completedSteps.includes(dep))
    ) || null;
  },

  /**
   * Calculate completion percentage
   */
  getCompletionPercentage: (completedSteps: string[], totalSteps: number): number => {
    return totalSteps > 0 ? (completedSteps.length / totalSteps) * 100 : 0;
  },

  /**
   * Estimate time remaining
   */
  getEstimatedTimeRemaining: (steps: OnboardingStep[], completedSteps: string[]): number => {
    const remainingSteps = steps.filter(step => !completedSteps.includes(step.id));
    return remainingSteps.reduce((total, step) => total + step.estimatedTime, 0);
  },

  /**
   * Check if step can be completed
   */
  canCompleteStep: (step: OnboardingStep, completedSteps: string[]): boolean => {
    return step.dependencies.every(dep => completedSteps.includes(dep));
  },

  /**
   * Get step progress
   */
  getStepProgress: (currentStep: number, totalSteps: number): { current: number; total: number; percentage: number } => {
    return {
      current: currentStep + 1,
      total: totalSteps,
      percentage: totalSteps > 0 ? ((currentStep + 1) / totalSteps) * 100 : 0
    };
  }
};

// Cache Utilities
export const CacheUtils = {
  /**
   * Check if cache entry is expired
   */
  isExpired: (entry: { expiresAt: string }): boolean => {
    return new Date(entry.expiresAt).getTime() < Date.now();
  },

  /**
   * Check if cache entry is stale
   */
  isStale: (entry: { isStale: boolean; timestamp: string }, maxAge: number): boolean => {
    if (entry.isStale) return true;
    
    const age = Date.now() - new Date(entry.timestamp).getTime();
    return age > maxAge;
  },

  /**
   * Get cache age in seconds
   */
  getCacheAge: (timestamp: string): number => {
    return Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);
  }
};

// Validation Utilities
export const ValidationUtils = {
  /**
   * Validate email format
   */
  isValidEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  /**
   * Validate phone number format
   */
  isValidPhoneNumber: (phone: string): boolean => {
    const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
    return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
  },

  /**
   * Validate URL format
   */
  isValidUrl: (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Sanitize user input
   */
  sanitizeInput: (input: string): string => {
    return input
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .trim()
      .substring(0, 1000); // Limit length
  },

  /**
   * Validate username format
   */
  isValidUsername: (username: string): boolean => {
    const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
    return usernameRegex.test(username);
  }
};

// Export all utilities
export const SessionStoreUtils = {
  Auth: AuthUtils,
  User: UserUtils,
  Session: SessionUtils,
  Activity: ActivityUtils,
  Subscription: SubscriptionUtils,
  Notification: NotificationUtils,
  Onboarding: OnboardingUtils,
  Cache: CacheUtils,
  Validation: ValidationUtils
};

export default SessionStoreUtils;