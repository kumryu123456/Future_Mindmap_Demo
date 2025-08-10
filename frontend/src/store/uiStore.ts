import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { 
  UIStore, 
  UIStoreState, 
  UIStoreActions,
  UIModal,
  UINotification,
  CustomTheme,
  ThemeName,
  ColorScheme,
  LayoutType,
  LayoutConfig,
  Breadcrumb,
  TabInfo,
  FormInfo,
  LoadingInfo,
  ProgressInfo,
  ResponsiveState,
  GestureInfo,
  TouchInfo,
  FocusTrap,
  AnimationInfo,
  ContextMenu,
  DragData,
  DropTarget,
  KeyboardShortcut,
  UIError,
  PerformanceMetrics,
  Breakpoint,
  NotificationPosition,
  ModalType,
  ModalSize,
  ModalPosition,
  ValidationState
} from '../types/ui';

// Initial state
const initialState: UIStoreState = {
  // Theme & Appearance
  theme: {
    currentTheme: 'light',
    systemPreference: 'light',
    customThemes: [],
    colorScheme: {
      primary: {
        50: '#eff6ff',
        100: '#dbeafe',
        200: '#bfdbfe',
        300: '#93c5fd',
        400: '#60a5fa',
        500: '#3b82f6',
        600: '#2563eb',
        700: '#1d4ed8',
        800: '#1e40af',
        900: '#1e3a8a',
        950: '#172554'
      },
      secondary: {
        50: '#f8fafc',
        100: '#f1f5f9',
        200: '#e2e8f0',
        300: '#cbd5e1',
        400: '#94a3b8',
        500: '#64748b',
        600: '#475569',
        700: '#334155',
        800: '#1e293b',
        900: '#0f172a',
        950: '#020617'
      },
      success: {
        50: '#f0fdf4',
        100: '#dcfce7',
        200: '#bbf7d0',
        300: '#86efac',
        400: '#4ade80',
        500: '#22c55e',
        600: '#16a34a',
        700: '#15803d',
        800: '#166534',
        900: '#14532d',
        950: '#052e16'
      },
      warning: {
        50: '#fffbeb',
        100: '#fef3c7',
        200: '#fde68a',
        300: '#fcd34d',
        400: '#fbbf24',
        500: '#f59e0b',
        600: '#d97706',
        700: '#b45309',
        800: '#92400e',
        900: '#78350f',
        950: '#451a03'
      },
      error: {
        50: '#fef2f2',
        100: '#fee2e2',
        200: '#fecaca',
        300: '#fca5a5',
        400: '#f87171',
        500: '#ef4444',
        600: '#dc2626',
        700: '#b91c1c',
        800: '#991b1b',
        900: '#7f1d1d',
        950: '#450a0a'
      },
      info: {
        50: '#ecfeff',
        100: '#cffafe',
        200: '#a5f3fc',
        300: '#67e8f9',
        400: '#22d3ee',
        500: '#06b6d4',
        600: '#0891b2',
        700: '#0e7490',
        800: '#155e75',
        900: '#164e63',
        950: '#083344'
      },
      neutral: {
        50: '#fafafa',
        100: '#f5f5f5',
        200: '#e5e5e5',
        300: '#d4d4d4',
        400: '#a3a3a3',
        500: '#737373',
        600: '#525252',
        700: '#404040',
        800: '#262626',
        900: '#171717',
        950: '#0a0a0a'
      }
    },
    accentColor: '#3b82f6',
    customColors: {
      background: {
        primary: '#ffffff',
        secondary: '#f8fafc',
        tertiary: '#f1f5f9',
        overlay: 'rgba(0, 0, 0, 0.5)'
      },
      text: {
        primary: '#1f2937',
        secondary: '#6b7280',
        tertiary: '#9ca3af',
        inverse: '#ffffff',
        disabled: '#d1d5db'
      },
      border: {
        primary: '#e5e7eb',
        secondary: '#d1d5db',
        focus: '#3b82f6',
        error: '#ef4444',
        success: '#22c55e'
      },
      surface: {
        primary: '#ffffff',
        secondary: '#f9fafb',
        raised: '#ffffff',
        sunken: '#f3f4f6',
        overlay: 'rgba(255, 255, 255, 0.95)'
      }
    },
    typography: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['ui-serif', 'Georgia', 'serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Monaco', 'monospace']
      },
      fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem'
      },
      fontWeight: {
        thin: 100,
        light: 300,
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
        extrabold: 800
      },
      lineHeight: {
        tight: 1.25,
        normal: 1.5,
        relaxed: 1.75
      },
      letterSpacing: {
        tight: '-0.025em',
        normal: '0em',
        wide: '0.025em'
      }
    },
    spacing: {
      baseUnit: 4,
      scale: [0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32, 40, 48, 56, 64],
      containerMaxWidth: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px'
      },
      borderRadius: {
        none: '0px',
        sm: '0.125rem',
        base: '0.25rem',
        md: '0.375rem',
        lg: '0.5rem',
        xl: '0.75rem',
        full: '9999px'
      }
    },
    effects: {
      shadows: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)'
      },
      blur: {
        sm: '4px',
        base: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px'
      },
      transitions: {
        fast: '150ms ease',
        base: '300ms ease',
        slow: '500ms ease'
      },
      opacity: {
        disabled: 0.5,
        muted: 0.7,
        hover: 0.8,
        active: 0.9
      }
    },
    branding: {
      logo: {
        primary: '/logo-primary.svg',
        secondary: '/logo-secondary.svg',
        icon: '/logo-icon.svg',
        favicon: '/favicon.ico'
      },
      brand: {
        name: 'Future Mindmap',
        tagline: 'Visualize Your Ideas',
        colors: {
          primary: '#3b82f6',
          secondary: '#64748b'
        }
      },
      customization: {
        allowUserThemes: true,
        allowColorCustomization: true,
        allowFontCustomization: false
      }
    }
  },

  // Layout & Structure
  layout: {
    currentLayout: 'sidebar',
    layoutConfig: {
      type: 'sidebar',
      variant: 'standard',
      density: 'comfortable',
      alignment: 'left',
      maxWidth: null,
      padding: 16,
      margin: 0
    },
    sidebar: {
      isOpen: true,
      isCollapsed: false,
      isPinned: true,
      position: 'left',
      width: 280,
      collapsedWidth: 64,
      activeSection: null,
      expandedSections: [],
      behavior: {
        autoHide: false,
        overlay: false,
        persistent: true,
        swipeToToggle: true
      },
      responsive: {
        breakpoint: 'md',
        hiddenOnMobile: false,
        overlayOnMobile: true
      }
    },
    header: {
      isVisible: true,
      isFixed: true,
      height: 64,
      showNavigation: true,
      navigationItems: [],
      showActions: true,
      actionItems: [],
      showSearch: true,
      searchConfig: {
        placeholder: 'Search...',
        showSuggestions: true,
        maxSuggestions: 5,
        searchDelay: 300
      },
      showUserMenu: true,
      userMenuItems: [],
      showBreadcrumbs: true,
      breadcrumbs: []
    },
    footer: {
      isVisible: false,
      isFixed: false,
      height: 48,
      showLinks: true,
      links: [],
      showCopyright: true,
      copyrightText: '© 2024 Future Mindmap. All rights reserved.',
      showSocial: false,
      socialLinks: []
    },
    content: {
      main: {
        padding: 24,
        maxWidth: null,
        centered: false
      },
      aside: {
        position: 'right',
        width: 320,
        isCollapsible: true,
        isCollapsed: false
      },
      sections: []
    },
    panels: {
      panels: [],
      activePanel: null,
      panelHistory: [],
      maxPanels: 5,
      allowMultiple: true,
      stackMode: 'overlay'
    },
    grid: {
      columns: 12,
      rows: 1,
      gap: 16,
      responsive: {
        sm: { columns: 4, gap: 8 },
        md: { columns: 8, gap: 12 },
        lg: { columns: 12, gap: 16 },
        xl: { columns: 12, gap: 20 }
      },
      items: []
    }
  },

  // Navigation & Routing
  navigation: {
    currentPath: '/',
    currentTitle: 'Dashboard',
    history: [],
    forwardStack: [],
    breadcrumbs: [],
    menu: {
      items: [],
      activeItem: null,
      expandedItems: [],
      showIcons: true,
      showLabels: true,
      collapsible: true,
      searchable: true
    },
    tabs: {
      tabs: [],
      activeTab: null,
      maxTabs: 10,
      allowClosing: true,
      allowReordering: true,
      showAddButton: true,
      persistTabs: true,
      restoreOnLoad: true
    },
    quickNav: {
      isOpen: false,
      query: '',
      results: [],
      recentItems: [],
      favoriteItems: [],
      maxResults: 20,
      searchDelay: 200,
      categories: []
    }
  },

  // Modals & Overlays
  modals: {
    modals: [],
    activeModal: null,
    modalHistory: [],
    maxModals: 5,
    allowMultiple: false,
    closeOnEscape: true,
    closeOnBackdrop: true,
    backdrop: {
      color: 'rgba(0, 0, 0, 0.5)',
      opacity: 0.5,
      blur: 4,
      clickThrough: false,
      animation: {
        type: 'fade',
        duration: 200,
        easing: 'ease-out'
      }
    }
  },

  // Notifications & Alerts
  notifications: {
    notifications: [],
    position: 'top-right',
    maxNotifications: 5,
    defaultDuration: 5000,
    groupSimilar: true,
    groupThreshold: 3,
    persistAcrossReloads: false,
    soundEnabled: false,
    hapticsEnabled: false
  },

  // Loading & Progress
  loading: {
    global: {
      isLoading: false
    },
    components: {},
    route: {
      isLoading: false
    },
    operations: {}
  },

  // Forms & Inputs
  forms: {
    forms: {},
    validation: {
      mode: 'onChange',
      reValidateMode: 'onChange',
      globalErrors: [],
      validators: {},
      asyncValidation: {}
    },
    autoSave: {
      enabled: true,
      interval: 30000,
      maxVersions: 10,
      storageKey: 'ui-form-autosave'
    }
  },

  // Responsive Design
  responsive: {
    currentBreakpoint: 'lg',
    screen: {
      width: 1920,
      height: 1080,
      availableWidth: 1920,
      availableHeight: 1080,
      orientation: 'landscape',
      devicePixelRatio: 1
    },
    device: {
      type: 'desktop',
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      isTouchDevice: false,
      supportsHover: true
    },
    breakpoints: {
      xs: 475,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      '2xl': 1536
    },
    containers: {},
    mediaFeatures: {
      prefersColorScheme: 'light',
      prefersReducedMotion: 'no-preference',
      prefersContrast: 'no-preference',
      forcedColors: 'none',
      invertedColors: 'none'
    }
  },

  // Interactions & Gestures
  interactions: {
    pointer: {
      position: { x: 0, y: 0 },
      isDown: false,
      button: 0,
      buttons: 0,
      pressure: 0,
      tiltX: 0,
      tiltY: 0
    },
    touch: {
      touches: [],
      gestures: [],
      activeGesture: undefined
    },
    keyboard: {
      activeKeys: new Set(),
      modifiers: {
        alt: false,
        ctrl: false,
        meta: false,
        shift: false
      }
    },
    hover: {
      hoveredElements: new Set(),
      hoverDelay: 500
    },
    selection: {
      selectedElements: new Set(),
      selectionMode: 'single'
    }
  },

  // Accessibility
  accessibility: {
    screenReader: {
      enabled: false,
      announcements: [],
      liveRegions: []
    },
    focusManagement: {
      focusVisible: false,
      trapFocus: false,
      restoreFocus: true,
      skipLinks: []
    },
    highContrast: {
      enabled: false,
      mode: 'increase',
      customColors: {}
    },
    motion: {
      reducedMotion: false,
      respectSystemPreference: true,
      customAnimationDuration: 300
    },
    keyboardNav: {
      enabled: true,
      showFocusRings: true,
      customFocusStyles: false
    },
    voiceControl: {
      enabled: false,
      commands: []
    }
  },

  // Performance & Optimization
  performance: {
    metrics: {
      lcp: 0,
      fid: 0,
      cls: 0,
      ttfb: 0,
      fcp: 0,
      domContentLoaded: 0,
      loadComplete: 0,
      taskTime: 0,
      longTasks: 0,
      jsHeapSize: 0,
      renderingTime: 0
    },
    optimization: {
      rendering: {
        enableVirtualization: true,
        batchUpdates: true,
        deferNonCritical: true
      },
      caching: {
        enableMemoryCache: true,
        enableDiskCache: true,
        cacheSize: 50 * 1024 * 1024, // 50MB
        cacheTTL: 300000 // 5 minutes
      },
      images: {
        enableLazyLoading: true,
        enableWebP: true,
        enableAVIF: true,
        compressionQuality: 85
      }
    },
    memory: {
      usedJSHeapSize: 0,
      totalJSHeapSize: 0,
      jsHeapSizeLimit: 0,
      memoryPressure: 'low'
    },
    bundles: [],
    lazyLoading: {
      pendingComponents: [],
      loadedComponents: new Set(),
      failedComponents: new Set()
    }
  },

  // Animation & Transitions
  animations: {
    animations: {},
    activeAnimations: new Set(),
    globalSettings: {
      enabled: true,
      respectReducedMotion: true,
      defaultDuration: 300,
      defaultEasing: 'ease-out'
    },
    presets: [],
    performance: {
      preferGPUAcceleration: true,
      enableWillChange: true,
      batchAnimations: true
    }
  },

  // Context Menus & Dropdowns
  contextMenus: {
    menus: [],
    activeMenu: null,
    closeOnClick: true,
    closeOnScroll: true,
    closeDelay: 100
  },

  // Drag & Drop
  dragDrop: {
    isDragging: false,
    dragData: null,
    dropTargets: [],
    config: {
      enableTouch: true,
      enableMouse: true,
      enableKeyboard: true,
      delay: 0,
      threshold: 5,
      ghostOpacity: 0.5
    },
    ghostImage: {
      offset: { x: 0, y: 0 }
    }
  },

  // Focus Management
  focus: {
    currentFocus: null,
    focusHistory: [],
    focusTraps: [],
    activeTrap: null,
    focusVisible: false,
    focusSource: 'programmatic',
    tabOrder: [],
    customTabOrder: false
  },

  // Keyboard Shortcuts
  shortcuts: {
    shortcuts: [],
    globalShortcuts: [],
    contextShortcuts: {},
    activeContext: undefined,
    config: {
      enabled: true,
      showTooltips: true,
      captureGlobal: false
    }
  },

  // Error Boundaries & Recovery
  errors: {
    boundaries: [],
    globalErrors: [],
    recoveryActions: [],
    reporting: {
      enabled: false,
      includeUserAgent: true,
      includeUrl: true,
      includeStackTrace: true
    }
  },

  // Developer Tools & Debugging
  devTools: {
    isDevelopment: import.meta.env.MODE === 'development',
    debugMode: false,
    performanceMonitoring: {
      enabled: false,
      trackReRenders: false,
      trackStateChanges: false,
      trackAsyncOperations: false
    },
    debugInfo: {
      componentTree: [],
      stateHistory: [],
      actionLog: []
    },
    hotReload: {
      enabled: import.meta.env.MODE === 'development',
      preserveState: true
    }
  }
};

// Store implementation
export const useUIStore = create<UIStore>()(
  devtools(
    subscribeWithSelector(
      immer<UIStore>((set, get) => ({
        ...initialState,

        // Theme Actions
        setTheme: (theme: ThemeName) => {
          set((state) => {
            state.theme.currentTheme = theme;
          });
        },

        updateColorScheme: (colors: Partial<ColorScheme>) => {
          set((state) => {
            state.theme.colorScheme = { ...state.theme.colorScheme, ...colors };
          });
        },

        createCustomTheme: (theme: Omit<CustomTheme, 'id' | 'metadata'>) => {
          set((state) => {
            const newTheme: CustomTheme = {
              ...theme,
              id: `theme_${Date.now()}`,
              metadata: {
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                tags: theme.metadata?.tags || [],
                category: theme.metadata?.category || 'custom'
              }
            };
            state.theme.customThemes.push(newTheme);
          });
        },

        deleteCustomTheme: (themeId: string) => {
          set((state) => {
            state.theme.customThemes = state.theme.customThemes.filter(t => t.id !== themeId);
          });
        },

        // Layout Actions
        setLayout: (layout: LayoutType, config?: Partial<LayoutConfig>) => {
          set((state) => {
            state.layout.currentLayout = layout;
            if (config) {
              state.layout.layoutConfig = { ...state.layout.layoutConfig, ...config };
            }
          });
        },

        toggleSidebar: () => {
          set((state) => {
            state.layout.sidebar.isOpen = !state.layout.sidebar.isOpen;
          });
        },

        setSidebarOpen: (open: boolean) => {
          set((state) => {
            state.layout.sidebar.isOpen = open;
          });
        },

        setSidebarCollapsed: (collapsed: boolean) => {
          set((state) => {
            state.layout.sidebar.isCollapsed = collapsed;
          });
        },

        updateSidebarWidth: (width: number) => {
          set((state) => {
            state.layout.sidebar.width = width;
          });
        },

        // Navigation Actions
        navigate: (path: string, title?: string) => {
          set((state) => {
            // Add current to history
            if (state.navigation.currentPath !== path) {
              state.navigation.history.push({
                id: `nav_${Date.now()}`,
                path: state.navigation.currentPath,
                title: state.navigation.currentTitle,
                timestamp: new Date().toISOString()
              });
              
              // Limit history size
              if (state.navigation.history.length > 50) {
                state.navigation.history = state.navigation.history.slice(-50);
              }
            }
            
            state.navigation.currentPath = path;
            state.navigation.currentTitle = title || 'Page';
            state.navigation.forwardStack = []; // Clear forward stack on new navigation
          });
        },

        goBack: () => {
          set((state) => {
            const previous = state.navigation.history.pop();
            if (previous) {
              state.navigation.forwardStack.push({
                id: `forward_${Date.now()}`,
                path: state.navigation.currentPath,
                title: state.navigation.currentTitle,
                timestamp: new Date().toISOString()
              });
              
              state.navigation.currentPath = previous.path;
              state.navigation.currentTitle = previous.title;
            }
          });
        },

        goForward: () => {
          set((state) => {
            const next = state.navigation.forwardStack.pop();
            if (next) {
              state.navigation.history.push({
                id: `history_${Date.now()}`,
                path: state.navigation.currentPath,
                title: state.navigation.currentTitle,
                timestamp: new Date().toISOString()
              });
              
              state.navigation.currentPath = next.path;
              state.navigation.currentTitle = next.title;
            }
          });
        },

        updateBreadcrumbs: (breadcrumbs: Breadcrumb[]) => {
          set((state) => {
            state.navigation.breadcrumbs = breadcrumbs;
            state.layout.header.breadcrumbs = breadcrumbs;
          });
        },

        openTab: (tab: Omit<TabInfo, 'id' | 'lastAccessed'>) => {
          set((state) => {
            const newTab: TabInfo = {
              ...tab,
              id: `tab_${Date.now()}`,
              lastAccessed: new Date().toISOString()
            };
            
            // Check if tab already exists
            const existingTab = state.navigation.tabs.tabs.find(t => t.path === tab.path);
            if (existingTab) {
              state.navigation.tabs.activeTab = existingTab.id;
              existingTab.lastAccessed = new Date().toISOString();
            } else {
              state.navigation.tabs.tabs.push(newTab);
              state.navigation.tabs.activeTab = newTab.id;
              
              // Enforce max tabs
              if (state.navigation.tabs.tabs.length > state.navigation.tabs.maxTabs) {
                const oldestTab = state.navigation.tabs.tabs
                  .filter(t => !t.isPinned)
                  .sort((a, b) => new Date(a.lastAccessed).getTime() - new Date(b.lastAccessed).getTime())[0];
                
                if (oldestTab) {
                  state.navigation.tabs.tabs = state.navigation.tabs.tabs.filter(t => t.id !== oldestTab.id);
                }
              }
            }
          });
        },

        closeTab: (tabId: string) => {
          set((state) => {
            const tabIndex = state.navigation.tabs.tabs.findIndex(t => t.id === tabId);
            if (tabIndex === -1) return;
            
            const tab = state.navigation.tabs.tabs[tabIndex];
            if (!tab.isClosable) return;
            
            state.navigation.tabs.tabs.splice(tabIndex, 1);
            
            // Update active tab if necessary
            if (state.navigation.tabs.activeTab === tabId) {
              if (state.navigation.tabs.tabs.length > 0) {
                const nextTab = state.navigation.tabs.tabs[Math.min(tabIndex, state.navigation.tabs.tabs.length - 1)];
                state.navigation.tabs.activeTab = nextTab.id;
              } else {
                state.navigation.tabs.activeTab = null;
              }
            }
          });
        },

        switchTab: (tabId: string) => {
          set((state) => {
            const tab = state.navigation.tabs.tabs.find(t => t.id === tabId);
            if (tab) {
              state.navigation.tabs.activeTab = tabId;
              tab.lastAccessed = new Date().toISOString();
            }
          });
        },

        // Modal Actions
        openModal: (modal: Omit<UIModal, 'id' | 'lifecycle'>) => {
          let modalId = '';
          set((state) => {
            modalId = `modal_${Date.now()}`;
            const newModal: UIModal = {
              ...modal,
              id: modalId,
              lifecycle: {
                createdAt: new Date().toISOString()
              }
            };
            
            if (!state.modals.allowMultiple) {
              // Close existing modals
              state.modals.modals.forEach(m => m.isOpen = false);
            }
            
            state.modals.modals.push(newModal);
            state.modals.activeModal = modalId;
            state.modals.modalHistory.push(modalId);
          });
          return modalId;
        },

        closeModal: (modalId: string) => {
          set((state) => {
            const modal = state.modals.modals.find(m => m.id === modalId);
            if (modal) {
              modal.isOpen = false;
              modal.lifecycle.closedAt = new Date().toISOString();
              
              // Update active modal
              if (state.modals.activeModal === modalId) {
                const openModals = state.modals.modals.filter(m => m.isOpen);
                state.modals.activeModal = openModals.length > 0 ? openModals[openModals.length - 1].id : null;
              }
            }
          });
        },

        updateModal: (modalId: string, updates: Partial<UIModal>) => {
          set((state) => {
            const modal = state.modals.modals.find(m => m.id === modalId);
            if (modal) {
              Object.assign(modal, updates);
            }
          });
        },

        minimizeModal: (modalId: string) => {
          set((state) => {
            const modal = state.modals.modals.find(m => m.id === modalId);
            if (modal && modal.config.minimizable) {
              modal.isMinimized = true;
            }
          });
        },

        maximizeModal: (modalId: string) => {
          set((state) => {
            const modal = state.modals.modals.find(m => m.id === modalId);
            if (modal && modal.config.maximizable) {
              modal.isMaximized = !modal.isMaximized;
            }
          });
        },

        // Notification Actions
        showNotification: (notification: Omit<UINotification, 'id' | 'timestamp'>) => {
          let notificationId = '';
          set((state) => {
            notificationId = `notification_${Date.now()}`;
            const newNotification: UINotification = {
              ...notification,
              id: notificationId,
              timestamp: new Date().toISOString()
            };
            
            state.notifications.notifications.unshift(newNotification);
            
            // Enforce max notifications
            if (state.notifications.notifications.length > state.notifications.maxNotifications) {
              state.notifications.notifications = state.notifications.notifications.slice(0, state.notifications.maxNotifications);
            }
          });
          return notificationId;
        },

        hideNotification: (notificationId: string) => {
          set((state) => {
            state.notifications.notifications = state.notifications.notifications.filter(n => n.id !== notificationId);
          });
        },

        markNotificationRead: (notificationId: string) => {
          set((state) => {
            const notification = state.notifications.notifications.find(n => n.id === notificationId);
            if (notification) {
              notification.isRead = true;
            }
          });
        },

        clearAllNotifications: () => {
          set((state) => {
            state.notifications.notifications = [];
          });
        },

        // Loading Actions
        setLoading: (key: string, loading: boolean, message?: string) => {
          set((state) => {
            if (key === 'global') {
              state.loading.global = {
                isLoading: loading,
                message
              };
            } else {
              if (loading) {
                state.loading.components[key] = {
                  isLoading: true,
                  message,
                  startTime: new Date().toISOString()
                };
              } else {
                delete state.loading.components[key];
              }
            }
          });
        },

        setProgress: (key: string, progress: ProgressInfo) => {
          set((state) => {
            const loadingInfo = state.loading.components[key] || state.loading.global;
            if (loadingInfo) {
              loadingInfo.progress = progress;
            }
          });
        },

        startOperation: (operation: string, cancellable = false) => {
          let operationId = '';
          set((state) => {
            operationId = `op_${Date.now()}`;
            state.loading.operations[operationId] = {
              operation,
              isLoading: true,
              startTime: new Date().toISOString(),
              cancellable
            };
          });
          return operationId;
        },

        updateOperation: (operationId: string, progress: ProgressInfo) => {
          set((state) => {
            const operation = state.loading.operations[operationId];
            if (operation) {
              operation.progress = progress;
            }
          });
        },

        completeOperation: (operationId: string) => {
          set((state) => {
            delete state.loading.operations[operationId];
          });
        },

        cancelOperation: (operationId: string) => {
          set((state) => {
            const operation = state.loading.operations[operationId];
            if (operation && operation.cancellable && operation.cancelHandler) {
              operation.cancelHandler();
            }
            delete state.loading.operations[operationId];
          });
        },

        // Form Actions
        registerForm: (form: Omit<FormInfo, 'isDirty' | 'isValid' | 'errors' | 'warnings'>) => {
          set((state) => {
            const formInfo: FormInfo = {
              ...form,
              isDirty: false,
              isValid: true,
              isSubmitting: false,
              isSubmitted: false,
              errors: {},
              warnings: {}
            };
            state.forms.forms[form.id] = formInfo;
          });
        },

        updateFormValue: (formId: string, fieldName: string, value: any) => {
          set((state) => {
            const form = state.forms.forms[formId];
            if (form) {
              form.values[fieldName] = value;
              form.isDirty = true;
              
              const field = form.fields[fieldName];
              if (field) {
                field.value = value;
                field.isDirty = true;
              }
            }
          });
        },

        validateForm: (formId: string) => {
          const state = get();
          const form = state.forms.forms[formId];
          return form ? form.isValid : false;
        },

        submitForm: (formId: string) => {
          set((state) => {
            const form = state.forms.forms[formId];
            if (form) {
              form.isSubmitting = true;
            }
          });
        },

        resetForm: (formId: string) => {
          set((state) => {
            const form = state.forms.forms[formId];
            if (form) {
              form.values = { ...form.initialValues };
              form.isDirty = false;
              form.isSubmitting = false;
              form.isSubmitted = false;
              form.errors = {};
              form.warnings = {};
              
              Object.values(form.fields).forEach(field => {
                field.value = form.initialValues[field.name];
                field.isDirty = false;
                field.isTouched = false;
                field.errors = [];
                field.warnings = [];
              });
            }
          });
        },

        // Responsive Actions
        updateScreenSize: (width: number, height: number) => {
          set((state) => {
            state.responsive.screen.width = width;
            state.responsive.screen.height = height;
            state.responsive.screen.orientation = width > height ? 'landscape' : 'portrait';
            
            // Update breakpoint
            const breakpoints = state.responsive.breakpoints;
            let currentBreakpoint: Breakpoint = 'xs';
            
            if (width >= breakpoints['2xl']) currentBreakpoint = '2xl';
            else if (width >= breakpoints.xl) currentBreakpoint = 'xl';
            else if (width >= breakpoints.lg) currentBreakpoint = 'lg';
            else if (width >= breakpoints.md) currentBreakpoint = 'md';
            else if (width >= breakpoints.sm) currentBreakpoint = 'sm';
            
            state.responsive.currentBreakpoint = currentBreakpoint;
            
            // Update device type
            if (width <= breakpoints.sm) {
              state.responsive.device.type = 'mobile';
              state.responsive.device.isMobile = true;
              state.responsive.device.isTablet = false;
              state.responsive.device.isDesktop = false;
            } else if (width <= breakpoints.lg) {
              state.responsive.device.type = 'tablet';
              state.responsive.device.isMobile = false;
              state.responsive.device.isTablet = true;
              state.responsive.device.isDesktop = false;
            } else {
              state.responsive.device.type = 'desktop';
              state.responsive.device.isMobile = false;
              state.responsive.device.isTablet = false;
              state.responsive.device.isDesktop = true;
            }
          });
        },

        setBreakpoint: (breakpoint: Breakpoint) => {
          set((state) => {
            state.responsive.currentBreakpoint = breakpoint;
          });
        },

        updateDeviceInfo: (device: Partial<ResponsiveState['device']>) => {
          set((state) => {
            state.responsive.device = { ...state.responsive.device, ...device };
          });
        },

        // Interaction Actions
        updatePointer: (position: { x: number; y: number }) => {
          set((state) => {
            state.interactions.pointer.position = position;
          });
        },

        addTouch: (touch: TouchInfo) => {
          set((state) => {
            state.interactions.touch.touches.push(touch);
          });
        },

        removeTouch: (touchId: number) => {
          set((state) => {
            state.interactions.touch.touches = state.interactions.touch.touches.filter(t => t.id !== touchId);
          });
        },

        startGesture: (gesture: Omit<GestureInfo, 'startTime' | 'duration'>) => {
          set((state) => {
            const newGesture: GestureInfo = {
              ...gesture,
              startTime: Date.now(),
              duration: 0
            };
            state.interactions.touch.gestures.push(newGesture);
            state.interactions.touch.activeGesture = `${gesture.type}_${Date.now()}`;
          });
        },

        updateGesture: (gestureId: string, updates: Partial<GestureInfo>) => {
          set((state) => {
            const gesture = state.interactions.touch.gestures.find(g => `${g.type}_${g.startTime}` === gestureId);
            if (gesture) {
              Object.assign(gesture, updates);
              gesture.duration = Date.now() - gesture.startTime;
            }
          });
        },

        endGesture: (gestureId: string) => {
          set((state) => {
            if (state.interactions.touch.activeGesture === gestureId) {
              state.interactions.touch.activeGesture = undefined;
            }
          });
        },

        // Accessibility Actions
        announce: (message: string, priority: 'assertive' | 'polite' = 'polite') => {
          set((state) => {
            state.accessibility.screenReader.announcements.push({
              id: `announce_${Date.now()}`,
              message,
              priority,
              timestamp: new Date().toISOString()
            });
            
            // Limit announcements
            if (state.accessibility.screenReader.announcements.length > 10) {
              state.accessibility.screenReader.announcements = state.accessibility.screenReader.announcements.slice(-10);
            }
          });
        },

        setHighContrast: (enabled: boolean) => {
          set((state) => {
            state.accessibility.highContrast.enabled = enabled;
          });
        },

        setReducedMotion: (enabled: boolean) => {
          set((state) => {
            state.accessibility.motion.reducedMotion = enabled;
          });
        },

        addSkipLink: (skipLink) => {
          set((state) => {
            state.accessibility.focusManagement.skipLinks.push(skipLink);
          });
        },

        // Focus Actions
        setFocus: (elementId: string) => {
          set((state) => {
            if (state.focus.currentFocus) {
              state.focus.focusHistory.push(state.focus.currentFocus);
              if (state.focus.focusHistory.length > 20) {
                state.focus.focusHistory = state.focus.focusHistory.slice(-20);
              }
            }
            state.focus.currentFocus = elementId;
          });
        },

        createFocusTrap: (trap: Omit<FocusTrap, 'isActive' | 'focusableElements'>) => {
          set((state) => {
            const newTrap: FocusTrap = {
              ...trap,
              isActive: false,
              focusableElements: []
            };
            state.focus.focusTraps.push(newTrap);
          });
        },

        activateFocusTrap: (trapId: string) => {
          set((state) => {
            // Deactivate other traps
            state.focus.focusTraps.forEach(trap => trap.isActive = false);
            
            const trap = state.focus.focusTraps.find(t => t.id === trapId);
            if (trap) {
              trap.isActive = true;
              state.focus.activeTrap = trapId;
            }
          });
        },

        deactivateFocusTrap: (trapId: string) => {
          set((state) => {
            const trap = state.focus.focusTraps.find(t => t.id === trapId);
            if (trap) {
              trap.isActive = false;
              if (state.focus.activeTrap === trapId) {
                state.focus.activeTrap = null;
              }
            }
          });
        },

        // Animation Actions
        startAnimation: (animation: Omit<AnimationInfo, 'isRunning' | 'currentTime'>) => {
          set((state) => {
            const newAnimation: AnimationInfo = {
              ...animation,
              isRunning: true,
              isPaused: false,
              currentTime: 0
            };
            state.animations.animations[animation.id] = newAnimation;
            state.animations.activeAnimations.add(animation.id);
          });
        },

        pauseAnimation: (animationId: string) => {
          set((state) => {
            const animation = state.animations.animations[animationId];
            if (animation) {
              animation.isPaused = true;
            }
          });
        },

        resumeAnimation: (animationId: string) => {
          set((state) => {
            const animation = state.animations.animations[animationId];
            if (animation) {
              animation.isPaused = false;
            }
          });
        },

        stopAnimation: (animationId: string) => {
          set((state) => {
            const animation = state.animations.animations[animationId];
            if (animation) {
              animation.isRunning = false;
              animation.isPaused = false;
              state.animations.activeAnimations.delete(animationId);
              delete state.animations.animations[animationId];
            }
          });
        },

        // Context Menu Actions
        showContextMenu: (menu: Omit<ContextMenu, 'id' | 'isOpen'>) => {
          let menuId = '';
          set((state) => {
            menuId = `menu_${Date.now()}`;
            const newMenu: ContextMenu = {
              ...menu,
              id: menuId,
              isOpen: true
            };
            
            // Close other menus if only one allowed
            state.contextMenus.menus.forEach(m => m.isOpen = false);
            state.contextMenus.menus.push(newMenu);
            state.contextMenus.activeMenu = menuId;
          });
          return menuId;
        },

        hideContextMenu: (menuId?: string) => {
          set((state) => {
            if (menuId) {
              const menu = state.contextMenus.menus.find(m => m.id === menuId);
              if (menu) {
                menu.isOpen = false;
              }
              if (state.contextMenus.activeMenu === menuId) {
                state.contextMenus.activeMenu = null;
              }
            } else {
              // Hide all menus
              state.contextMenus.menus.forEach(m => m.isOpen = false);
              state.contextMenus.activeMenu = null;
            }
          });
        },

        // Drag & Drop Actions
        startDrag: (dragData: Omit<DragData, 'id'>) => {
          set((state) => {
            state.dragDrop.isDragging = true;
            state.dragDrop.dragData = {
              ...dragData,
              id: `drag_${Date.now()}`
            };
          });
        },

        updateDrag: (position: { x: number; y: number }) => {
          set((state) => {
            if (state.dragDrop.dragData) {
              // Update ghost image position or other drag state
              state.dragDrop.ghostImage.offset = position;
            }
          });
        },

        endDrag: (dropTargetId?: string) => {
          set((state) => {
            if (dropTargetId) {
              const target = state.dragDrop.dropTargets.find(t => t.id === dropTargetId);
              if (target) {
                target.isActive = false;
              }
            }
            
            state.dragDrop.isDragging = false;
            state.dragDrop.dragData = null;
            
            // Reset all drop targets
            state.dragDrop.dropTargets.forEach(target => {
              target.isActive = false;
              target.isHovered = false;
            });
          });
        },

        registerDropTarget: (target: Omit<DropTarget, 'isActive' | 'isHovered' | 'canDrop'>) => {
          set((state) => {
            const newTarget: DropTarget = {
              ...target,
              isActive: false,
              isHovered: false,
              canDrop: true
            };
            state.dragDrop.dropTargets.push(newTarget);
          });
        },

        unregisterDropTarget: (targetId: string) => {
          set((state) => {
            state.dragDrop.dropTargets = state.dragDrop.dropTargets.filter(t => t.id !== targetId);
          });
        },

        // Keyboard Actions
        registerShortcut: (shortcut: KeyboardShortcut) => {
          set((state) => {
            if (shortcut.global) {
              state.shortcuts.globalShortcuts.push(shortcut);
            } else if (shortcut.context) {
              if (!state.shortcuts.contextShortcuts[shortcut.context]) {
                state.shortcuts.contextShortcuts[shortcut.context] = [];
              }
              state.shortcuts.contextShortcuts[shortcut.context].push(shortcut);
            } else {
              state.shortcuts.shortcuts.push(shortcut);
            }
          });
        },

        unregisterShortcut: (shortcutId: string) => {
          set((state) => {
            state.shortcuts.shortcuts = state.shortcuts.shortcuts.filter(s => s.id !== shortcutId);
            state.shortcuts.globalShortcuts = state.shortcuts.globalShortcuts.filter(s => s.id !== shortcutId);
            
            Object.keys(state.shortcuts.contextShortcuts).forEach(context => {
              state.shortcuts.contextShortcuts[context] = state.shortcuts.contextShortcuts[context].filter(s => s.id !== shortcutId);
            });
          });
        },

        setShortcutContext: (context: string) => {
          set((state) => {
            state.shortcuts.activeContext = context;
          });
        },

        // Error Actions
        reportError: (error: Error, component?: string, action?: string) => {
          set((state) => {
            const uiError: UIError = {
              id: `error_${Date.now()}`,
              type: 'unknown',
              message: error.message,
              component,
              action,
              stack: error.stack,
              severity: 'medium',
              recoverable: true,
              timestamp: new Date().toISOString(),
              url: window.location.href,
              userAgent: navigator.userAgent
            };
            
            state.errors.globalErrors.push(uiError);
            
            // Limit error history
            if (state.errors.globalErrors.length > 50) {
              state.errors.globalErrors = state.errors.globalErrors.slice(-50);
            }
          });
        },

        addRecoveryAction: (action) => {
          set((state) => {
            state.errors.recoveryActions.push(action);
          });
        },

        clearErrors: () => {
          set((state) => {
            state.errors.globalErrors = [];
            state.errors.boundaries = [];
          });
        },

        // Performance Actions
        updateMetrics: (metrics: Partial<PerformanceMetrics>) => {
          set((state) => {
            state.performance.metrics = { ...state.performance.metrics, ...metrics };
          });
        },

        enableOptimization: (setting: keyof typeof initialState.performance.optimization, enabled: boolean) => {
          set((state) => {
            if (setting === 'rendering') {
              state.performance.optimization.rendering.enableVirtualization = enabled;
            } else if (setting === 'caching') {
              state.performance.optimization.caching.enableMemoryCache = enabled;
            } else if (setting === 'images') {
              state.performance.optimization.images.enableLazyLoading = enabled;
            }
          });
        },

        // Developer Tools Actions
        setDebugMode: (enabled: boolean) => {
          set((state) => {
            state.devTools.debugMode = enabled;
          });
        },

        logAction: (action: string, payload: any) => {
          set((state) => {
            if (state.devTools.performanceMonitoring.trackStateChanges) {
              state.devTools.debugInfo.actionLog.push({
                timestamp: new Date().toISOString(),
                action,
                payload,
                source: 'ui-store'
              });
              
              // Limit log size
              if (state.devTools.debugInfo.actionLog.length > 100) {
                state.devTools.debugInfo.actionLog = state.devTools.debugInfo.actionLog.slice(-100);
              }
            }
          });
        },

        logStateChange: (state: any, diff: any) => {
          set((uiState) => {
            if (uiState.devTools.performanceMonitoring.trackStateChanges) {
              uiState.devTools.debugInfo.stateHistory.push({
                timestamp: new Date().toISOString(),
                action: 'state-change',
                state,
                diff
              });
              
              // Limit history size
              if (uiState.devTools.debugInfo.stateHistory.length > 50) {
                uiState.devTools.debugInfo.stateHistory = uiState.devTools.debugInfo.stateHistory.slice(-50);
              }
            }
          });
        },

        // Utility Actions
        reset: () => {
          set(() => initialState);
        },

        updateConfig: (config: Partial<UIStoreState>) => {
          set((state) => {
            Object.assign(state, config);
          });
        },

        batchUpdate: (updates: Array<{ action: string; payload: any }>) => {
          set((state) => {
            updates.forEach(({ action, payload }) => {
              // This would need to be implemented to call the appropriate action
              // For now, we'll just log it
              if (state.devTools.debugMode) {
                console.log(`Batch update: ${action}`, payload);
              }
            });
          });
        }
      }))
    ),
    {
      name: 'ui-store',
      version: 1,
    }
  )
);

// Export the store
export default useUIStore;