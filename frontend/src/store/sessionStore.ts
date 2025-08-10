import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type {
  SessionStoreState,
  SessionStoreActions,
  SessionStore,
  User,
  UserProfile,
  UserSettings,
  UserSubscription,
  PaymentMethod,
  LoginCredentials,
  DeviceInfo,
  UserSession,
  OnboardingStep,
  UIModal,
  UIToast,
  ActivityItem,
  SearchHistoryItem,
  NavigationHistoryItem,
  ActiveCollaboration,
  Notification,
  NotificationSettings,
  OfflineAction,
  CacheEntry
} from '../types/session';

/**
 * Session Store Implementation with Zustand
 * Handles authentication, user profile, settings, onboarding, and session management
 */

// Initial state
const initialState: SessionStoreState = {
  // Authentication
  auth: {
    isAuthenticated: false,
    isLoading: false,
    error: null,
    user: null,
    loginAttempts: 0,
    mfa: {
      isEnabled: false,
      isRequired: false,
      methods: [],
      pendingVerification: false,
    },
    tokenInfo: null,
  },

  // Onboarding
  onboarding: {
    isComplete: false,
    currentStep: 0,
    totalSteps: 5,
    steps: [],
    completedSteps: [],
    skippedSteps: [],
    timeSpent: 0,
    tutorials: {
      mindmap: {
        isComplete: false,
        currentStep: 0,
        totalSteps: 10,
        completedSteps: [],
        skippedSteps: [],
      },
      plans: {
        isComplete: false,
        currentStep: 0,
        totalSteps: 8,
        completedSteps: [],
        skippedSteps: [],
      },
      collaboration: {
        isComplete: false,
        currentStep: 0,
        totalSteps: 6,
        completedSteps: [],
        skippedSteps: [],
      },
    },
  },

  // Application State
  app: {
    isInitialized: false,
    isOnline: navigator.onLine,
    lastSync: new Date().toISOString(),
    syncStatus: 'idle',
    featureFlags: {},
    environment: (['development', 'staging', 'production'] as const).includes(import.meta.env.MODE as any) 
      ? (import.meta.env.MODE as 'development' | 'staging' | 'production')
      : 'development',
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
    buildNumber: import.meta.env.VITE_APP_BUILD_NUMBER || '1',
    performance: {
      loadTime: 0,
      renderTime: 0,
    },
  },

  // UI State
  ui: {
    theme: 'system',
    sidebarCollapsed: false,
    modalStack: [],
    toasts: [],
    loading: {
      global: false,
      auth: false,
      user: false,
      data: false,
    },
    errors: {
      auth: null,
      network: null,
      permission: null,
      validation: [],
    },
    focusMode: false,
    highContrast: false,
    reducedMotion: false,
  },

  // Activity
  activity: {
    recentItems: [],
    searchHistory: [],
    navigationHistory: [],
    sessionStart: new Date().toISOString(),
    pageViews: 0,
    actionsPerformed: 0,
    timeSpent: 0,
  },

  // Presence
  presence: {
    status: 'online',
    lastSeen: new Date().toISOString(),
    currentLocation: {
      type: 'dashboard',
    },
    activeCollaborations: [],
    invitations: [],
  },

  // Notifications
  notifications: {
    unread: [],
    archive: [],
    settings: {
      email: {
        enabled: true,
        frequency: 'immediate',
        types: {
          security: true,
          updates: true,
          collaboration: true,
          reminders: true,
          marketing: false,
        },
      },
      push: {
        enabled: true,
        types: {
          mentions: true,
          assignments: true,
          deadlines: true,
          updates: true,
        },
      },
      inApp: {
        enabled: true,
        sound: true,
        desktop: true,
        types: {
          mentions: true,
          assignments: true,
          deadlines: true,
          updates: true,
          system: true,
        },
      },
    },
    realTime: false,
    lastUpdate: new Date().toISOString(),
  },

  // Cache
  cache: {
    user: {
      data: null,
      timestamp: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes
      isStale: false,
    },
    settings: {
      data: null,
      timestamp: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour
      isStale: false,
    },
    activity: {
      data: null,
      timestamp: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutes
      isStale: false,
    },
    ttl: {
      user: 30 * 60 * 1000, // 30 minutes
      settings: 60 * 60 * 1000, // 1 hour
      activity: 15 * 60 * 1000, // 15 minutes
    },
  },

  // Offline
  offline: {
    isOffline: !navigator.onLine,
    pendingActions: [],
    lastSync: new Date().toISOString(),
    conflictResolution: 'manual',
    offlineStorage: true,
    offlineActions: true,
  },
};

// Store implementation
export const useSessionStore = create<SessionStore>()(
  devtools(
    subscribeWithSelector(
      immer((set, get) => ({
        ...initialState,

        // Authentication Actions
        login: async (credentials: LoginCredentials) => {
          set((state) => {
            state.auth.isLoading = true;
            state.auth.error = null;
            state.auth.loginAttempts += 1;
            state.auth.lastLoginAttempt = new Date().toISOString();
            state.ui.loading.auth = true;
          });

          try {
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 1000));

            // Mock successful login
            const mockUser: User = {
              id: 'user_1',
              email: credentials.email,
              username: credentials.email.split('@')[0],
              displayName: credentials.email.split('@')[0],
              firstName: 'John',
              lastName: 'Doe',
              role: 'user',
              status: 'active',
              profile: {
                timezone: 'UTC',
                language: 'en',
                skills: [],
                interests: [],
                experience: 'intermediate',
                socialLinks: {},
              },
              settings: {
                theme: 'system',
                colorScheme: 'blue',
                fontSize: 'medium',
                compactMode: false,
                notifications: get().notifications.settings,
                privacy: {
                  profileVisibility: 'team',
                  activityVisibility: 'team',
                  searchVisibility: true,
                  dataCollection: {
                    analytics: true,
                    performance: true,
                    usage: true,
                  },
                  sharing: {
                    allowMentions: true,
                    allowInvitations: true,
                    allowCollaboration: true,
                  },
                },
                workspace: {
                  defaultView: 'dashboard',
                  sidebarCollapsed: false,
                  autoSave: true,
                  autoSaveInterval: 5,
                  recentItemsLimit: 10,
                  mindmap: {
                    defaultLayout: 'radial',
                    animationsEnabled: true,
                    gridEnabled: false,
                    snapToGrid: false,
                    showMinimap: true,
                  },
                  plans: {
                    defaultView: 'gantt',
                    showCriticalPath: true,
                    showResourceUtilization: true,
                    autoSchedule: false,
                  },
                  collaboration: {
                    realTimeEnabled: true,
                    showCursors: true,
                    showPresence: true,
                    autoInviteTeam: false,
                  },
                },
                integrations: {
                  calendar: { enabled: false, syncDeadlines: false, syncMeetings: false },
                  storage: { enabled: false, autoSync: false },
                  communication: {
                    slack: { enabled: false, channels: [] },
                    teams: { enabled: false },
                    discord: { enabled: false },
                  },
                  projectManagement: {
                    jira: { enabled: false },
                    asana: { enabled: false },
                    trello: { enabled: false },
                  },
                },
                accessibility: {
                  highContrast: false,
                  reduceMotion: false,
                  screenReader: false,
                  keyboardNavigation: false,
                  fontSize: 'default',
                  voiceControl: false,
                },
                dataSettings: {
                  exportFormat: 'json',
                  backupFrequency: 'weekly',
                  dataRetention: 365,
                  offlineMode: true,
                  syncConflictResolution: 'manual',
                },
              },
              subscription: {
                plan: 'free',
                status: 'active',
                periodStart: new Date().toISOString(),
                periodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                cancelAtPeriodEnd: false,
                usage: {
                  mindmaps: 0,
                  plans: 0,
                  storage: 0,
                  collaborators: 0,
                  apiCalls: 0,
                },
                limits: {
                  mindmaps: 5,
                  plans: 3,
                  storage: 1024 * 1024 * 100, // 100MB
                  collaborators: 3,
                  apiCalls: 1000,
                },
                features: {
                  advancedAnalytics: false,
                  prioritySupport: false,
                  customBranding: false,
                  apiAccess: false,
                  ssoEnabled: false,
                  auditLogs: false,
                },
                billing: {
                  customerId: 'cust_1',
                  subscriptionId: 'sub_1',
                  amount: 0,
                  currency: 'USD',
                },
              },
              activity: {
                recentItems: [],
                currentSession: {} as UserSession,
                recentSessions: [],
                stats: {
                  totalSessions: 1,
                  totalTime: 0,
                  mindmapsCreated: 0,
                  plansCreated: 0,
                  collaborationTime: 0,
                  lastActiveDate: new Date().toISOString(),
                },
                productivity: {
                  tasksCompleted: 0,
                  milestonesReached: 0,
                  collaborationsInitiated: 0,
                  weeklyActiveTime: 0,
                  streak: {
                    current: 1,
                    longest: 1,
                    lastUpdate: new Date().toISOString(),
                  },
                },
              },
              permissions: {
                features: {
                  mindmaps: 'write',
                  plans: 'write',
                  collaboration: 'write',
                  analytics: 'read',
                  integrations: 'write',
                  api: 'none',
                },
                data: {
                  export: true,
                  delete: true,
                  share: true,
                  publicShare: false,
                },
                admin: {
                  userManagement: false,
                  billingManagement: false,
                  auditLogs: false,
                  systemSettings: false,
                },
              },
              metadata: {
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                lastLoginAt: new Date().toISOString(),
                source: 'organic',
                isEmailVerified: true,
                isMfaEnabled: false,
                isFirstLogin: true,
                hasCompletedOnboarding: false,
                gdprConsent: true,
                termsAcceptedAt: new Date().toISOString(),
                privacyPolicyAcceptedAt: new Date().toISOString(),
                version: 1,
              },
            };

            const tokenInfo = {
              accessToken: 'mock_access_token',
              refreshToken: 'mock_refresh_token',
              tokenType: 'Bearer' as const,
              expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
              scope: ['read', 'write'],
              claims: {
                sub: mockUser.id,
                iat: Math.floor(Date.now() / 1000),
                exp: Math.floor(Date.now() / 1000) + 3600,
                aud: 'future-mindmap',
                iss: 'future-mindmap-auth',
                jti: 'jwt_1',
              },
            };

            set((state) => {
              state.auth.isAuthenticated = true;
              state.auth.user = mockUser;
              state.auth.tokenInfo = tokenInfo;
              state.auth.isLoading = false;
              state.ui.loading.auth = false;
              state.cache.user.data = mockUser;
              state.cache.user.timestamp = new Date().toISOString();
              state.cache.user.isStale = false;
            });

            // Store token in localStorage
            localStorage.setItem('auth_token', tokenInfo.accessToken);
            localStorage.setItem('refresh_token', tokenInfo.refreshToken);

          } catch (error) {
            set((state) => {
              state.auth.error = error instanceof Error ? error.message : 'Login failed';
              state.auth.isLoading = false;
              state.ui.loading.auth = false;
            });
          }
        },

        logout: async () => {
          set((state) => {
            state.auth.isAuthenticated = false;
            state.auth.user = null;
            state.auth.tokenInfo = null;
            state.auth.error = null;
            state.onboarding = initialState.onboarding;
            state.cache.user.data = null;
            state.cache.settings.data = null;
            state.cache.activity.data = null;
            state.activity.recentItems = [];
            state.presence.activeCollaborations = [];
            state.notifications.unread = [];
          });

          // Clear stored tokens
          localStorage.removeItem('auth_token');
          localStorage.removeItem('refresh_token');
        },

        refreshToken: async () => {
          const tokenInfo = get().auth.tokenInfo;
          if (!tokenInfo?.refreshToken) return;

          try {
            // Simulate token refresh
            await new Promise((resolve) => setTimeout(resolve, 500));

            const newTokenInfo = {
              ...tokenInfo,
              accessToken: 'new_mock_access_token',
              expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
              claims: {
                ...tokenInfo.claims,
                iat: Math.floor(Date.now() / 1000),
                exp: Math.floor(Date.now() / 1000) + 3600,
              },
            };

            set((state) => {
              state.auth.tokenInfo = newTokenInfo;
            });

            localStorage.setItem('auth_token', newTokenInfo.accessToken);
          } catch (error) {
            // Token refresh failed, logout user
            get().logout();
          }
        },

        verifyMfa: async (code: string, method: string) => {
          set((state) => {
            state.auth.isLoading = true;
          });

          try {
            await new Promise((resolve) => setTimeout(resolve, 1000));

            set((state) => {
              state.auth.mfa.pendingVerification = false;
              state.auth.isLoading = false;
            });
          } catch (error) {
            set((state) => {
              state.auth.error = 'Invalid MFA code';
              state.auth.isLoading = false;
            });
          }
        },

        resetPassword: async (email: string) => {
          try {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            
            get().showToast({
              type: 'success',
              title: 'Password Reset',
              message: 'Password reset email sent',
              duration: 5000,
            });
          } catch (error) {
            get().showToast({
              type: 'error',
              title: 'Error',
              message: 'Failed to send password reset email',
              duration: 5000,
            });
          }
        },

        // User Profile Actions
        updateProfile: async (updates: Partial<UserProfile>) => {
          const user = get().auth.user;
          if (!user) return;

          set((state) => {
            if (state.auth.user) {
              state.auth.user.profile = { ...state.auth.user.profile, ...updates };
              state.auth.user.metadata.updatedAt = new Date().toISOString();
              state.cache.user.data = state.auth.user;
              state.cache.user.timestamp = new Date().toISOString();
            }
          });

          try {
            await new Promise((resolve) => setTimeout(resolve, 500));
          } catch (error) {
            // Revert on error
            set((state) => {
              if (state.auth.user) {
                state.auth.user.profile = user.profile;
              }
            });
          }
        },

        updateSettings: async (updates: Partial<UserSettings>) => {
          const user = get().auth.user;
          if (!user) return;

          set((state) => {
            if (state.auth.user) {
              state.auth.user.settings = { ...state.auth.user.settings, ...updates };
              state.auth.user.metadata.updatedAt = new Date().toISOString();
              state.cache.settings.data = state.auth.user.settings;
              state.cache.settings.timestamp = new Date().toISOString();
            }

            // Apply theme setting to UI
            if (updates.theme) {
              state.ui.theme = updates.theme;
            }
          });

          try {
            await new Promise((resolve) => setTimeout(resolve, 500));
          } catch (error) {
            // Revert on error
            set((state) => {
              if (state.auth.user) {
                state.auth.user.settings = user.settings;
              }
            });
          }
        },

        uploadAvatar: async (file: File) => {
          try {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            
            const avatarUrl = URL.createObjectURL(file);
            
            set((state) => {
              if (state.auth.user) {
                state.auth.user.avatar = avatarUrl;
                state.auth.user.metadata.updatedAt = new Date().toISOString();
                state.cache.user.data = state.auth.user;
              }
            });

            return avatarUrl;
          } catch (error) {
            throw new Error('Failed to upload avatar');
          }
        },

        deleteAccount: async () => {
          try {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            await get().logout();
          } catch (error) {
            throw new Error('Failed to delete account');
          }
        },

        // Session Management
        createSession: async (deviceInfo: DeviceInfo) => {
          const session: UserSession = {
            id: `session_${Date.now()}`,
            userId: get().auth.user?.id || '',
            deviceId: `device_${Date.now()}`,
            deviceInfo,
            ipAddress: '192.168.1.1',
            userAgent: navigator.userAgent,
            startTime: new Date().toISOString(),
            lastActivity: new Date().toISOString(),
            isActive: true,
            isCurrent: true,
            authMethod: 'password',
            mfaVerified: false,
            pageViews: 0,
            actionsPerformed: 0,
            metadata: {
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
              language: navigator.language,
            },
          };

          set((state) => {
            if (state.auth.user) {
              state.auth.user.activity.currentSession = session;
              state.auth.user.activity.recentSessions.unshift(session);
              // Keep only last 10 sessions
              state.auth.user.activity.recentSessions = 
                state.auth.user.activity.recentSessions.slice(0, 10);
            }
          });

          return session;
        },

        updateSessionActivity: () => {
          set((state) => {
            if (state.auth.user?.activity.currentSession) {
              state.auth.user.activity.currentSession.lastActivity = new Date().toISOString();
              state.auth.user.activity.currentSession.actionsPerformed += 1;
            }
            state.activity.actionsPerformed += 1;
            state.activity.timeSpent = Math.floor(
              (Date.now() - new Date(state.activity.sessionStart).getTime()) / 1000
            );
          });
        },

        terminateSession: async (sessionId: string) => {
          set((state) => {
            if (state.auth.user) {
              const session = state.auth.user.activity.recentSessions.find(s => s.id === sessionId);
              if (session) {
                session.isActive = false;
                session.endTime = new Date().toISOString();
                session.duration = Math.floor(
                  (Date.now() - new Date(session.startTime).getTime()) / 1000
                );
              }
            }
          });
        },

        terminateAllSessions: async () => {
          set((state) => {
            if (state.auth.user) {
              state.auth.user.activity.recentSessions.forEach(session => {
                if (session.id !== state.auth.user?.activity.currentSession.id) {
                  session.isActive = false;
                  session.endTime = new Date().toISOString();
                  session.duration = Math.floor(
                    (Date.now() - new Date(session.startTime).getTime()) / 1000
                  );
                }
              });
            }
          });
        },

        // Onboarding Actions
        startOnboarding: () => {
          const steps: OnboardingStep[] = [
            {
              id: 'welcome',
              name: 'welcome',
              title: 'Welcome to Future Mindmap',
              description: 'Get started with your first mindmap',
              type: 'tutorial',
              isRequired: true,
              estimatedTime: 2,
              dependencies: [],
              config: {},
              status: 'pending',
            },
            {
              id: 'profile',
              name: 'profile',
              title: 'Complete Your Profile',
              description: 'Add your personal information',
              type: 'form',
              isRequired: false,
              estimatedTime: 3,
              dependencies: ['welcome'],
              config: {},
              status: 'pending',
            },
            {
              id: 'preferences',
              name: 'preferences',
              title: 'Set Your Preferences',
              description: 'Customize your workspace',
              type: 'choice',
              isRequired: false,
              estimatedTime: 2,
              dependencies: ['profile'],
              config: {},
              status: 'pending',
            },
            {
              id: 'first_mindmap',
              name: 'first_mindmap',
              title: 'Create Your First Mindmap',
              description: 'Learn the basics of mindmapping',
              type: 'tutorial',
              isRequired: true,
              estimatedTime: 5,
              dependencies: ['preferences'],
              config: {},
              status: 'pending',
            },
            {
              id: 'complete',
              name: 'complete',
              title: 'You\'re All Set!',
              description: 'Start creating amazing mindmaps',
              type: 'confirmation',
              isRequired: true,
              estimatedTime: 1,
              dependencies: ['first_mindmap'],
              config: {},
              status: 'pending',
            },
          ];

          set((state) => {
            state.onboarding.steps = steps;
            state.onboarding.startedAt = new Date().toISOString();
            state.onboarding.currentStep = 0;
          });
        },

        completeOnboardingStep: (stepId: string, data?: Record<string, any>) => {
          set((state) => {
            const step = state.onboarding.steps.find(s => s.id === stepId);
            if (step) {
              step.status = 'completed';
              step.completedAt = new Date().toISOString();
              if (data) step.data = data;
              
              if (!state.onboarding.completedSteps.includes(stepId)) {
                state.onboarding.completedSteps.push(stepId);
              }
              
              if (state.onboarding.currentStep < state.onboarding.steps.length - 1) {
                state.onboarding.currentStep += 1;
              }

              if (state.onboarding.completedSteps.length === state.onboarding.totalSteps) {
                state.onboarding.isComplete = true;
                state.onboarding.completedAt = new Date().toISOString();
                
                if (state.auth.user) {
                  state.auth.user.metadata.hasCompletedOnboarding = true;
                }
              }
            }
          });
        },

        skipOnboardingStep: (stepId: string) => {
          set((state) => {
            const step = state.onboarding.steps.find(s => s.id === stepId);
            if (step && !step.isRequired) {
              step.status = 'skipped';
              
              if (!state.onboarding.skippedSteps.includes(stepId)) {
                state.onboarding.skippedSteps.push(stepId);
              }
              
              if (state.onboarding.currentStep < state.onboarding.steps.length - 1) {
                state.onboarding.currentStep += 1;
              }
            }
          });
        },

        finishOnboarding: () => {
          set((state) => {
            state.onboarding.isComplete = true;
            state.onboarding.completedAt = new Date().toISOString();
            
            if (state.auth.user) {
              state.auth.user.metadata.hasCompletedOnboarding = true;
              state.auth.user.metadata.isFirstLogin = false;
            }
          });
        },

        restartOnboarding: () => {
          set((state) => {
            state.onboarding = {
              ...initialState.onboarding,
              steps: state.onboarding.steps.map(step => ({
                ...step,
                status: 'pending',
                completedAt: undefined,
                data: undefined,
              })),
            };
          });
        },

        // Tutorial Actions
        startTutorial: (type: 'mindmap' | 'plans' | 'collaboration') => {
          set((state) => {
            const tutorial = state.onboarding.tutorials[type];
            tutorial.startedAt = new Date().toISOString();
            tutorial.currentStep = 0;
          });
        },

        completeTutorialStep: (type: string, stepId: number) => {
          set((state) => {
            const tutorial = state.onboarding.tutorials[type as keyof typeof state.onboarding.tutorials];
            if (tutorial && !tutorial.completedSteps.includes(stepId)) {
              tutorial.completedSteps.push(stepId);
              tutorial.currentStep = Math.max(tutorial.currentStep, stepId + 1);
              
              if (tutorial.completedSteps.length === tutorial.totalSteps) {
                tutorial.isComplete = true;
                tutorial.completedAt = new Date().toISOString();
              }
            }
          });
        },

        finishTutorial: (type: string) => {
          set((state) => {
            const tutorial = state.onboarding.tutorials[type as keyof typeof state.onboarding.tutorials];
            if (tutorial) {
              tutorial.isComplete = true;
              tutorial.completedAt = new Date().toISOString();
              tutorial.currentStep = tutorial.totalSteps;
            }
          });
        },

        // UI Actions
        setTheme: (theme: 'light' | 'dark' | 'system') => {
          set((state) => {
            state.ui.theme = theme;
            
            // Also update user settings if authenticated
            if (state.auth.user) {
              state.auth.user.settings.theme = theme;
            }
          });
        },

        toggleSidebar: () => {
          set((state) => {
            state.ui.sidebarCollapsed = !state.ui.sidebarCollapsed;
            
            // Also update user settings
            if (state.auth.user) {
              state.auth.user.settings.workspace.sidebarCollapsed = state.ui.sidebarCollapsed;
            }
          });
        },

        showModal: (modal: Omit<UIModal, 'id' | 'zIndex'>) => {
          const id = `modal_${Date.now()}_${Math.random().toString(36).substring(2)}`;
          
          set((state) => {
            const zIndex = 1000 + state.ui.modalStack.length * 10;
            state.ui.modalStack.push({
              id,
              zIndex,
              backdrop: true,
              dismissible: true,
              ...modal,
            });
          });
          
          return id;
        },

        hideModal: (modalId: string) => {
          set((state) => {
            state.ui.modalStack = state.ui.modalStack.filter(modal => modal.id !== modalId);
          });
        },

        showToast: (toast: Omit<UIToast, 'id' | 'timestamp'>) => {
          const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2)}`;
          
          set((state) => {
            state.ui.toasts.push({
              id,
              timestamp: new Date().toISOString(),
              duration: 5000,
              ...toast,
            });
          });
          
          // Auto-hide toast after duration
          setTimeout(() => {
            get().hideToast(id);
          }, toast.duration || 5000);
          
          return id;
        },

        hideToast: (toastId: string) => {
          set((state) => {
            state.ui.toasts = state.ui.toasts.filter(toast => toast.id !== toastId);
          });
        },

        setLoading: (key: keyof SessionStoreState['ui']['loading'], loading: boolean) => {
          set((state) => {
            state.ui.loading[key] = loading;
          });
        },

        setError: (key: keyof SessionStoreState['ui']['errors'], error: string | null) => {
          set((state) => {
            if (key === 'validation') return; // Validation errors are arrays
            (state.ui.errors as any)[key] = error;
          });
        },

        // Activity Actions
        addRecentItem: (item: ActivityItem) => {
          set((state) => {
            // Remove existing item if it exists
            state.activity.recentItems = state.activity.recentItems.filter(
              existing => !(existing.type === item.type && existing.itemId === item.itemId)
            );
            
            // Add to beginning
            state.activity.recentItems.unshift(item);
            
            // Keep only recent items based on user setting
            const limit = state.auth.user?.settings.workspace.recentItemsLimit || 10;
            state.activity.recentItems = state.activity.recentItems.slice(0, limit);

            // Also add to user activity if authenticated
            if (state.auth.user) {
              state.auth.user.activity.recentItems = [...state.activity.recentItems];
            }
          });
        },

        addSearchHistory: (query: string, type: string, resultsCount: number) => {
          const historyItem: SearchHistoryItem = {
            id: `search_${Date.now()}`,
            query,
            type: type as 'mindmap' | 'plan' | 'global',
            timestamp: new Date().toISOString(),
            resultsCount,
          };

          set((state) => {
            // Remove existing query if it exists
            state.activity.searchHistory = state.activity.searchHistory.filter(
              item => item.query !== query || item.type !== type
            );
            
            // Add to beginning
            state.activity.searchHistory.unshift(historyItem);
            
            // Keep only last 50 searches
            state.activity.searchHistory = state.activity.searchHistory.slice(0, 50);
          });
        },

        addNavigationHistory: (path: string, title: string, metadata?: Record<string, any>) => {
          const historyItem: NavigationHistoryItem = {
            id: `nav_${Date.now()}`,
            path,
            title,
            timestamp: new Date().toISOString(),
            metadata,
          };

          set((state) => {
            // Remove existing path if it exists
            state.activity.navigationHistory = state.activity.navigationHistory.filter(
              item => item.path !== path
            );
            
            // Add to beginning
            state.activity.navigationHistory.unshift(historyItem);
            
            // Keep only last 100 items
            state.activity.navigationHistory = state.activity.navigationHistory.slice(0, 100);
            
            // Update page views
            state.activity.pageViews += 1;
            
            if (state.auth.user?.activity.currentSession) {
              state.auth.user.activity.currentSession.pageViews += 1;
            }
          });
        },

        clearHistory: (type: 'search' | 'navigation' | 'all') => {
          set((state) => {
            if (type === 'search' || type === 'all') {
              state.activity.searchHistory = [];
            }
            if (type === 'navigation' || type === 'all') {
              state.activity.navigationHistory = [];
            }
          });
        },

        // Presence Actions
        setPresenceStatus: (status: 'online' | 'away' | 'busy' | 'offline') => {
          set((state) => {
            state.presence.status = status;
            state.presence.lastSeen = new Date().toISOString();
          });
        },

        updateLocation: (location: SessionStoreState['presence']['currentLocation']) => {
          set((state) => {
            state.presence.currentLocation = location;
            state.presence.lastSeen = new Date().toISOString();
          });
        },

        joinCollaboration: (collaboration: ActiveCollaboration) => {
          set((state) => {
            const existing = state.presence.activeCollaborations.findIndex(
              c => c.id === collaboration.id
            );
            
            if (existing >= 0) {
              state.presence.activeCollaborations[existing] = collaboration;
            } else {
              state.presence.activeCollaborations.push(collaboration);
            }
          });
        },

        leaveCollaboration: (collaborationId: string) => {
          set((state) => {
            state.presence.activeCollaborations = state.presence.activeCollaborations.filter(
              c => c.id !== collaborationId
            );
          });
        },

        // Notification Actions
        addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => {
          const id = `notification_${Date.now()}_${Math.random().toString(36).substring(2)}`;
          
          set((state) => {
            state.notifications.unread.unshift({
              id,
              timestamp: new Date().toISOString(),
              read: false,
              channels: ['in_app'],
              delivered: true,
              deliveredAt: new Date().toISOString(),
              ...notification,
            });
            
            // Keep only last 100 notifications
            state.notifications.unread = state.notifications.unread.slice(0, 100);
            
            state.notifications.lastUpdate = new Date().toISOString();
          });
        },

        markNotificationRead: (notificationId: string) => {
          set((state) => {
            const notification = state.notifications.unread.find(n => n.id === notificationId);
            if (notification) {
              notification.read = true;
              
              // Move to archive
              state.notifications.archive.unshift(notification);
              state.notifications.unread = state.notifications.unread.filter(
                n => n.id !== notificationId
              );
              
              // Keep only last 500 archived notifications
              state.notifications.archive = state.notifications.archive.slice(0, 500);
            }
          });
        },

        markAllNotificationsRead: () => {
          set((state) => {
            state.notifications.unread.forEach(notification => {
              notification.read = true;
            });
            
            // Move all to archive
            state.notifications.archive = [
              ...state.notifications.unread,
              ...state.notifications.archive,
            ].slice(0, 500);
            
            state.notifications.unread = [];
          });
        },

        deleteNotification: (notificationId: string) => {
          set((state) => {
            state.notifications.unread = state.notifications.unread.filter(
              n => n.id !== notificationId
            );
            state.notifications.archive = state.notifications.archive.filter(
              n => n.id !== notificationId
            );
          });
        },

        updateNotificationSettings: (settings: Partial<NotificationSettings>) => {
          set((state) => {
            state.notifications.settings = { ...state.notifications.settings, ...settings };
            
            // Also update user settings
            if (state.auth.user) {
              state.auth.user.settings.notifications = state.notifications.settings;
            }
          });
        },

        // Cache Actions
        updateCache: <T>(key: keyof SessionStoreState['cache'], data: T) => {
          set((state) => {
            const cacheEntry = state.cache[key] as CacheEntry<T>;
            cacheEntry.data = data;
            cacheEntry.timestamp = new Date().toISOString();
            cacheEntry.expiresAt = new Date(Date.now() + state.cache.ttl[key]).toISOString();
            cacheEntry.isStale = false;
          });
        },

        invalidateCache: (key: keyof SessionStoreState['cache'] | 'all') => {
          set((state) => {
            if (key === 'all') {
              Object.keys(state.cache).forEach(cacheKey => {
                if (cacheKey !== 'ttl') {
                  (state.cache as any)[cacheKey].isStale = true;
                }
              });
            } else if (key !== 'ttl') {
              (state.cache as any)[key].isStale = true;
            }
          });
        },

        // Sync Actions
        syncData: async () => {
          set((state) => {
            state.app.syncStatus = 'syncing';
          });

          try {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            
            set((state) => {
              state.app.syncStatus = 'idle';
              state.app.lastSync = new Date().toISOString();
              state.offline.lastSync = new Date().toISOString();
            });
          } catch (error) {
            set((state) => {
              state.app.syncStatus = 'error';
            });
          }
        },

        addOfflineAction: (action: Omit<OfflineAction, 'id' | 'timestamp' | 'retries'>) => {
          set((state) => {
            state.offline.pendingActions.push({
              ...action,
              id: `offline_${Date.now()}_${Math.random().toString(36).substring(2)}`,
              timestamp: new Date().toISOString(),
              retries: 0,
              maxRetries: 3,
            });
          });
        },

        processOfflineActions: async () => {
          const { pendingActions } = get().offline;
          
          for (const action of pendingActions) {
            try {
              // Simulate processing offline action
              await new Promise((resolve) => setTimeout(resolve, 100));
              
              set((state) => {
                state.offline.pendingActions = state.offline.pendingActions.filter(
                  a => a.id !== action.id
                );
              });
            } catch (error) {
              set((state) => {
                const pendingAction = state.offline.pendingActions.find(a => a.id === action.id);
                if (pendingAction) {
                  pendingAction.retries += 1;
                  
                  if (pendingAction.retries >= pendingAction.maxRetries) {
                    state.offline.pendingActions = state.offline.pendingActions.filter(
                      a => a.id !== action.id
                    );
                  }
                }
              });
            }
          }
        },

        setOfflineMode: (offline: boolean) => {
          set((state) => {
            state.offline.isOffline = offline;
            state.app.isOnline = !offline;
          });
        },

        // Subscription Actions
        updateSubscription: (subscription: Partial<UserSubscription>) => {
          set((state) => {
            if (state.auth.user) {
              state.auth.user.subscription = { ...state.auth.user.subscription, ...subscription };
              state.auth.user.metadata.updatedAt = new Date().toISOString();
            }
          });
        },

        upgradePlan: async (plan: UserSubscription['plan']) => {
          try {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            
            set((state) => {
              if (state.auth.user) {
                state.auth.user.subscription.plan = plan;
                state.auth.user.subscription.status = 'active';
                
                // Update limits based on plan
                const limits = {
                  free: { mindmaps: 5, plans: 3, storage: 100 * 1024 * 1024, collaborators: 3, apiCalls: 1000 },
                  pro: { mindmaps: 50, plans: 25, storage: 1024 * 1024 * 1024, collaborators: 10, apiCalls: 10000 },
                  team: { mindmaps: null, plans: null, storage: 5 * 1024 * 1024 * 1024, collaborators: 50, apiCalls: 50000 },
                  enterprise: { mindmaps: null, plans: null, storage: null, collaborators: null, apiCalls: null },
                };
                
                state.auth.user.subscription.limits = limits[plan];
              }
            });

            get().showToast({
              type: 'success',
              title: 'Plan Upgraded',
              message: `Successfully upgraded to ${plan} plan`,
              duration: 5000,
            });
          } catch (error) {
            get().showToast({
              type: 'error',
              title: 'Upgrade Failed',
              message: 'Failed to upgrade plan',
              duration: 5000,
            });
          }
        },

        cancelSubscription: async () => {
          try {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            
            set((state) => {
              if (state.auth.user) {
                state.auth.user.subscription.cancelAtPeriodEnd = true;
              }
            });

            get().showToast({
              type: 'info',
              title: 'Subscription Cancelled',
              message: 'Your subscription will end at the current period',
              duration: 5000,
            });
          } catch (error) {
            get().showToast({
              type: 'error',
              title: 'Cancellation Failed',
              message: 'Failed to cancel subscription',
              duration: 5000,
            });
          }
        },

        updatePaymentMethod: async (paymentMethod: PaymentMethod) => {
          try {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            
            set((state) => {
              if (state.auth.user) {
                state.auth.user.subscription.billing.paymentMethod = paymentMethod;
              }
            });
          } catch (error) {
            throw new Error('Failed to update payment method');
          }
        },

        // Feature Flag Actions
        updateFeatureFlags: (flags: Record<string, boolean>) => {
          set((state) => {
            state.app.featureFlags = { ...state.app.featureFlags, ...flags };
          });
        },

        isFeatureEnabled: (feature: string) => {
          const { featureFlags } = get().app;
          return featureFlags[feature] ?? false;
        },

        // Analytics Actions
        trackEvent: (event: string, properties?: Record<string, any>) => {
          // In a real app, this would send to analytics service
          console.log('Analytics Event:', event, properties);
          
          get().updateSessionActivity();
        },

        trackPageView: (path: string, title: string) => {
          get().addNavigationHistory(path, title);
          get().trackEvent('page_view', { path, title });
        },

        trackUserAction: (action: string, metadata?: Record<string, any>) => {
          get().trackEvent('user_action', { action, ...metadata });
        },

        // Utility Actions
        initialize: async () => {
          set((state) => {
            state.ui.loading.global = true;
          });

          try {
            // Check for stored auth token
            const token = localStorage.getItem('auth_token');
            if (token) {
              // Validate token and restore session
              // For now, just simulate validation
              await new Promise((resolve) => setTimeout(resolve, 1000));
            }

            // Initialize feature flags
            const featureFlags = {
              newDashboard: true,
              collaborativeEditing: true,
              advancedAnalytics: false,
            };

            // Set up online/offline listeners
            const handleOnline = () => get().setOfflineMode(false);
            const handleOffline = () => get().setOfflineMode(true);
            
            window.addEventListener('online', handleOnline);
            window.addEventListener('offline', handleOffline);

            set((state) => {
              state.app.isInitialized = true;
              state.app.featureFlags = featureFlags;
              state.app.performance.loadTime = Date.now();
              state.ui.loading.global = false;
            });

          } catch (error) {
            set((state) => {
              state.ui.loading.global = false;
              state.ui.errors.network = 'Failed to initialize application';
            });
          }
        },

        reset: () => {
          set(() => ({ ...initialState }));
        },

        cleanup: () => {
          // Clear timers and event listeners
          const tokenTimer = get().auth.refreshTimer;
          if (tokenTimer) {
            clearInterval(tokenTimer);
          }

          window.removeEventListener('online', () => get().setOfflineMode(false));
          window.removeEventListener('offline', () => get().setOfflineMode(true));
        },
      }))
    ),
    {
      name: 'session-store',
      partialize: (state) => ({
        // Only persist essential data
        auth: {
          isAuthenticated: state.auth.isAuthenticated,
          user: state.auth.user,
        },
        ui: {
          theme: state.ui.theme,
          sidebarCollapsed: state.ui.sidebarCollapsed,
        },
        activity: {
          recentItems: state.activity.recentItems.slice(0, 10),
          searchHistory: state.activity.searchHistory.slice(0, 20),
        },
        onboarding: state.onboarding,
        notifications: {
          settings: state.notifications.settings,
        },
      }),
    }
  )
);

// Set up automatic token refresh
if (typeof window !== 'undefined') {
  const store = useSessionStore.getState();
  
  // Refresh token every 55 minutes
  const refreshInterval = setInterval(() => {
    if (store.auth.isAuthenticated && store.auth.tokenInfo) {
      store.refreshToken();
    }
  }, 55 * 60 * 1000);

  // Store refresh timer reference
  useSessionStore.setState((state) => {
    state.auth.refreshTimer = refreshInterval as any;
  });
}

export default useSessionStore;