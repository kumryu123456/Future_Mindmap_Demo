import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useUIStore as useStore } from '../store/uiStore';
import {
  useTheme,
  useLayout,
  useModals,
  useNotifications,
  useLoading,
  useResponsive,
  useAccessibility,
  useAnimations,
  useFocus,
  useShortcuts,
  useErrors,
  useCurrentTheme,
  useIsDarkMode,
  useCurrentBreakpoint,
  useIsMobile,
  useActiveModal,
  useOpenModals,
  useActiveNotifications,
  useIsGlobalLoading
} from '../store/uiSelectors';
import type {
  ThemeName,
  LayoutType,
  UIModal,
  UINotification,
  KeyboardShortcut,
  AnimationInfo,
  ContextMenu,
  Breadcrumb,
  TabInfo,
  ProgressInfo
} from '../types/ui';

/**
 * UI Store Hooks
 * High-level hooks for common UI functionality
 */

// Theme Management Hook
export const useThemeManager = () => {
  const theme = useTheme();
  const setTheme = useStore((state) => state.setTheme);
  const updateColorScheme = useStore((state) => state.updateColorScheme);
  const createCustomTheme = useStore((state) => state.createCustomTheme);
  const deleteCustomTheme = useStore((state) => state.deleteCustomTheme);

  const handleThemeChange = useCallback((newTheme: ThemeName) => {
    setTheme(newTheme);
    
    // Update document class for CSS theming
    const root = document.documentElement;
    root.classList.remove('theme-light', 'theme-dark', 'theme-auto');
    root.classList.add(`theme-${newTheme}`);
    
    // Update meta theme-color
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      const isDark = newTheme === 'dark' || (newTheme === 'auto' && theme.systemPreference === 'dark');
      metaThemeColor.setAttribute('content', isDark ? '#1f2937' : '#ffffff');
    }
  }, [setTheme, theme.systemPreference]);

  const toggleTheme = useCallback(() => {
    const currentTheme = theme.currentTheme;
    if (currentTheme === 'light') {
      handleThemeChange('dark');
    } else if (currentTheme === 'dark') {
      handleThemeChange('light');
    } else {
      // If auto or custom, toggle to opposite of current appearance
      const isDark = theme.systemPreference === 'dark';
      handleThemeChange(isDark ? 'light' : 'dark');
    }
  }, [theme.currentTheme, theme.systemPreference, handleThemeChange]);

  // System preference detection
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      // This would be handled by the store's system preference detection
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
  }, []);

  return {
    ...theme,
    setTheme: handleThemeChange,
    toggleTheme,
    updateColorScheme,
    createCustomTheme,
    deleteCustomTheme
  };
};

// Layout Management Hook
export const useLayoutManager = () => {
  const layout = useLayout();
  const setLayout = useStore((state) => state.setLayout);
  const toggleSidebar = useStore((state) => state.toggleSidebar);
  const setSidebarOpen = useStore((state) => state.setSidebarOpen);
  const setSidebarCollapsed = useStore((state) => state.setSidebarCollapsed);
  const updateSidebarWidth = useStore((state) => state.updateSidebarWidth);

  const handleLayoutChange = useCallback((newLayout: LayoutType, config?: any) => {
    setLayout(newLayout, config);
    
    // Emit layout change event for other components
    window.dispatchEvent(new CustomEvent('layout-change', { 
      detail: { layout: newLayout, config } 
    }));
  }, [setLayout]);

  const handleSidebarToggle = useCallback(() => {
    toggleSidebar();
    
    // Handle responsive behavior
    const isSmallScreen = window.innerWidth < 768;
    if (isSmallScreen && layout.sidebar.isOpen) {
      // Add overlay class for mobile
      document.body.classList.add('sidebar-overlay');
    } else {
      document.body.classList.remove('sidebar-overlay');
    }
  }, [toggleSidebar, layout.sidebar.isOpen]);

  // Handle responsive sidebar behavior
  useEffect(() => {
    const handleResize = () => {
      const isSmallScreen = window.innerWidth < 768;
      
      if (isSmallScreen && layout.sidebar.isOpen && !layout.sidebar.behavior.overlay) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [layout.sidebar.isOpen, layout.sidebar.behavior.overlay, setSidebarOpen]);

  return {
    ...layout,
    setLayout: handleLayoutChange,
    toggleSidebar: handleSidebarToggle,
    setSidebarOpen,
    setSidebarCollapsed,
    updateSidebarWidth
  };
};

// Modal Management Hook
export const useModalManager = () => {
  const modals = useModals();
  const openModal = useStore((state) => state.openModal);
  const closeModal = useStore((state) => state.closeModal);
  const updateModal = useStore((state) => state.updateModal);
  const minimizeModal = useStore((state) => state.minimizeModal);
  const maximizeModal = useStore((state) => state.maximizeModal);

  const handleOpenModal = useCallback((modal: Omit<UIModal, 'id' | 'lifecycle'>) => {
    const modalId = openModal(modal);
    
    // Handle focus management
    const currentFocus = document.activeElement;
    if (currentFocus && currentFocus !== document.body) {
      // Store the currently focused element to restore later
      window.dispatchEvent(new CustomEvent('modal-focus-store', {
        detail: { modalId, previousFocus: currentFocus }
      }));
    }
    
    return modalId;
  }, [openModal]);

  const handleCloseModal = useCallback((modalId: string) => {
    closeModal(modalId);
    
    // Emit close event for cleanup
    window.dispatchEvent(new CustomEvent('modal-close', { detail: { modalId } }));
    
    // Restore focus if this was the last modal
    setTimeout(() => {
      const openModals = modals.modals.filter(modal => modal.isOpen && modal.id !== modalId);
      if (openModals.length === 0) {
        window.dispatchEvent(new CustomEvent('modal-focus-restore', { detail: { modalId } }));
      }
    }, 100);
  }, [closeModal, modals.modals]);

  const closeAllModals = useCallback(() => {
    const openModals = modals.modals.filter(modal => modal.isOpen);
    openModals.forEach(modal => handleCloseModal(modal.id));
  }, [modals.modals, handleCloseModal]);

  const getModalById = useCallback((id: string) => {
    return modals.modals.find(modal => modal.id === id);
  }, [modals.modals]);

  // Handle escape key for modal closing
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && modals.closeOnEscape) {
        const topModal = modals.modals
          .filter(modal => modal.isOpen)
          .sort((a, b) => {
            const aIndex = modals.modalHistory.indexOf(a.id);
            const bIndex = modals.modalHistory.indexOf(b.id);
            return bIndex - aIndex;
          })[0];
          
        if (topModal && topModal.config.closeOnEscape) {
          handleCloseModal(topModal.id);
        }
      }
    };

    if (modals.modals.some(modal => modal.isOpen)) {
      document.addEventListener('keydown', handleEscapeKey);
      return () => document.removeEventListener('keydown', handleEscapeKey);
    }
  }, [modals, handleCloseModal]);

  return {
    modals,
    openModal: handleOpenModal,
    closeModal: handleCloseModal,
    closeAllModals,
    updateModal,
    minimizeModal,
    maximizeModal,
    getModalById
  };
};

// Notification System Hook
export const useNotificationManager = () => {
  const notifications = useNotifications();
  const showNotification = useStore((state) => state.showNotification);
  const hideNotification = useStore((state) => state.hideNotification);
  const markNotificationRead = useStore((state) => state.markNotificationRead);
  const clearAllNotifications = useStore((state) => state.clearAllNotifications);

  const show = useCallback((
    type: UINotification['type'],
    title: string,
    message: string,
    options?: {
      duration?: number | null;
      actions?: UINotification['actions'];
      icon?: string;
      dismissible?: boolean;
      pauseOnHover?: boolean;
    }
  ) => {
    return showNotification({
      type,
      title,
      message,
      duration: options?.duration ?? notifications.defaultDuration,
      actions: options?.actions || [],
      icon: options?.icon,
      dismissible: options?.dismissible ?? true,
      pauseOnHover: options?.pauseOnHover ?? true,
      isRead: false,
      isPinned: false,
      isExpanded: false,
      tags: []
    });
  }, [showNotification, notifications.defaultDuration]);

  const showSuccess = useCallback((title: string, message: string, duration?: number) => {
    return show('success', title, message, { duration });
  }, [show]);

  const showError = useCallback((title: string, message: string, duration?: number) => {
    return show('error', title, message, { duration: duration ?? null }); // Errors persist by default
  }, [show]);

  const showWarning = useCallback((title: string, message: string, duration?: number) => {
    return show('warning', title, message, { duration });
  }, [show]);

  const showInfo = useCallback((title: string, message: string, duration?: number) => {
    return show('info', title, message, { duration });
  }, [show]);

  const showWithProgress = useCallback((
    title: string,
    message: string,
    progress: { value: number; max: number }
  ) => {
    return showNotification({
      type: 'info',
      title,
      message,
      duration: null,
      dismissible: false,
      pauseOnHover: false,
      progress: {
        value: progress.value,
        max: progress.max,
        showProgress: true
      },
      isRead: false,
      isPinned: false,
      isExpanded: false,
      actions: [],
      tags: ['progress']
    });
  }, [showNotification]);

  // Auto-hide notifications based on duration
  useEffect(() => {
    const activeNotifications = notifications.notifications.filter(n => n.duration !== null);
    
    const timeouts = activeNotifications.map(notification => {
      if (notification.duration && notification.duration > 0) {
        return setTimeout(() => {
          hideNotification(notification.id);
        }, notification.duration);
      }
      return null;
    }).filter(Boolean);

    return () => {
      timeouts.forEach(timeout => {
        if (timeout) clearTimeout(timeout);
      });
    };
  }, [notifications.notifications, hideNotification]);

  return {
    notifications,
    show,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showWithProgress,
    hide: hideNotification,
    markRead: markNotificationRead,
    clearAll: clearAllNotifications
  };
};

// Loading State Management Hook
export const useLoadingManager = () => {
  const loading = useLoading();
  const setLoading = useStore((state) => state.setLoading);
  const setProgress = useStore((state) => state.setProgress);
  const startOperation = useStore((state) => state.startOperation);
  const updateOperation = useStore((state) => state.updateOperation);
  const completeOperation = useStore((state) => state.completeOperation);
  const cancelOperation = useStore((state) => state.cancelOperation);

  const startLoading = useCallback((key: string, message?: string) => {
    setLoading(key, true, message);
  }, [setLoading]);

  const stopLoading = useCallback((key: string) => {
    setLoading(key, false);
  }, [setLoading]);

  const updateProgress = useCallback((key: string, value: number, max: number = 100, message?: string) => {
    setProgress(key, {
      value,
      max,
      showPercentage: true,
      showValue: false,
      animated: true
    });
    
    if (message) {
      setLoading(key, true, message);
    }
  }, [setProgress, setLoading]);

  const withLoading = useCallback(async <T>(
    key: string,
    operation: () => Promise<T>,
    options?: { message?: string; onProgress?: (progress: number) => void }
  ): Promise<T> => {
    try {
      startLoading(key, options?.message);
      
      const result = await operation();
      
      stopLoading(key);
      return result;
    } catch (error) {
      stopLoading(key);
      throw error;
    }
  }, [startLoading, stopLoading]);

  const createOperation = useCallback((name: string, cancellable = false) => {
    return startOperation(name, cancellable);
  }, [startOperation]);

  return {
    loading,
    startLoading,
    stopLoading,
    updateProgress,
    withLoading,
    setProgress,
    createOperation,
    updateOperation,
    completeOperation,
    cancelOperation
  };
};

// Responsive Design Hook
export const useResponsiveManager = () => {
  const responsive = useResponsive();
  const updateScreenSize = useStore((state) => state.updateScreenSize);
  const setBreakpoint = useStore((state) => state.setBreakpoint);
  const updateDeviceInfo = useStore((state) => state.updateDeviceInfo);

  // Screen size monitoring
  useEffect(() => {
    const handleResize = () => {
      updateScreenSize(window.innerWidth, window.innerHeight);
      
      // Update breakpoint based on screen size
      const width = window.innerWidth;
      let breakpoint: any = 'xs';
      
      if (width >= responsive.breakpoints['2xl']) breakpoint = '2xl';
      else if (width >= responsive.breakpoints.xl) breakpoint = 'xl';
      else if (width >= responsive.breakpoints.lg) breakpoint = 'lg';
      else if (width >= responsive.breakpoints.md) breakpoint = 'md';
      else if (width >= responsive.breakpoints.sm) breakpoint = 'sm';
      
      setBreakpoint(breakpoint);
    };

    // Initial setup
    handleResize();
    
    // Listen for resize events
    window.addEventListener('resize', handleResize);
    
    // Listen for orientation changes
    const handleOrientationChange = () => {
      setTimeout(handleResize, 100); // Delay to get accurate dimensions
    };
    
    window.addEventListener('orientationchange', handleOrientationChange);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, [updateScreenSize, setBreakpoint, responsive.breakpoints]);

  const matchBreakpoint = useCallback((breakpoint: string) => {
    return responsive.currentBreakpoint === breakpoint;
  }, [responsive.currentBreakpoint]);

  const isBreakpointUp = useCallback((breakpoint: string) => {
    const breakpoints = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];
    const currentIndex = breakpoints.indexOf(responsive.currentBreakpoint);
    const targetIndex = breakpoints.indexOf(breakpoint);
    return currentIndex >= targetIndex;
  }, [responsive.currentBreakpoint]);

  const isBreakpointDown = useCallback((breakpoint: string) => {
    const breakpoints = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];
    const currentIndex = breakpoints.indexOf(responsive.currentBreakpoint);
    const targetIndex = breakpoints.indexOf(breakpoint);
    return currentIndex <= targetIndex;
  }, [responsive.currentBreakpoint]);

  return {
    ...responsive,
    updateScreenSize,
    setBreakpoint,
    updateDeviceInfo,
    matchBreakpoint,
    isBreakpointUp,
    isBreakpointDown
  };
};

// Accessibility Management Hook
export const useAccessibilityManager = () => {
  const accessibility = useAccessibility();
  const announce = useStore((state) => state.announce);
  const setHighContrast = useStore((state) => state.setHighContrast);
  const setReducedMotion = useStore((state) => state.setReducedMotion);
  const addSkipLink = useStore((state) => state.addSkipLink);

  const makeAnnouncement = useCallback((message: string, priority: 'assertive' | 'polite' = 'polite') => {
    announce(message, priority);
    
    // Also create a live region element if needed
    let liveRegion = document.getElementById(`live-region-${priority}`);
    if (!liveRegion) {
      liveRegion = document.createElement('div');
      liveRegion.id = `live-region-${priority}`;
      liveRegion.setAttribute('aria-live', priority);
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.className = 'sr-only';
      document.body.appendChild(liveRegion);
    }
    
    liveRegion.textContent = message;
    
    // Clear after announcement
    setTimeout(() => {
      if (liveRegion) liveRegion.textContent = '';
    }, 1000);
  }, [announce]);

  const createSkipLink = useCallback((label: string, target: string, visible = false) => {
    addSkipLink({
      id: `skip-${target}`,
      label,
      target,
      visible
    });
  }, [addSkipLink]);

  // Monitor system accessibility preferences
  useEffect(() => {
    // Reduced motion
    const motionMediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleMotionChange = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches);
    };
    
    motionMediaQuery.addEventListener('change', handleMotionChange);
    setReducedMotion(motionMediaQuery.matches);

    // High contrast
    const contrastMediaQuery = window.matchMedia('(prefers-contrast: high)');
    const handleContrastChange = (e: MediaQueryListEvent) => {
      setHighContrast(e.matches);
    };
    
    contrastMediaQuery.addEventListener('change', handleContrastChange);
    setHighContrast(contrastMediaQuery.matches);

    return () => {
      motionMediaQuery.removeEventListener('change', handleMotionChange);
      contrastMediaQuery.removeEventListener('change', handleContrastChange);
    };
  }, [setReducedMotion, setHighContrast]);

  return {
    ...accessibility,
    announce: makeAnnouncement,
    setHighContrast,
    setReducedMotion,
    createSkipLink
  };
};

// Animation Management Hook
export const useAnimationManager = () => {
  const animations = useAnimations();
  const startAnimation = useStore((state) => state.startAnimation);
  const pauseAnimation = useStore((state) => state.pauseAnimation);
  const resumeAnimation = useStore((state) => state.resumeAnimation);
  const stopAnimation = useStore((state) => state.stopAnimation);

  const createAnimation = useCallback((
    name: string,
    element: HTMLElement,
    keyframes: any[],
    options: KeyframeAnimationOptions
  ) => {
    const animation = element.animate(keyframes, options);
    
    const animationInfo: Omit<AnimationInfo, 'isRunning' | 'currentTime'> = {
      id: `${name}-${Date.now()}`,
      name,
      type: 'move', // Default type
      duration: typeof options.duration === 'number' ? options.duration : 1000,
      delay: typeof options.delay === 'number' ? options.delay : 0,
      easing: typeof options.easing === 'string' ? options.easing : 'ease',
      iterations: typeof options.iterations === 'number' ? options.iterations : 1,
      direction: options.direction || 'normal',
      fillMode: options.fill || 'both',
      isPaused: false
    };
    
    startAnimation(animationInfo);
    
    // Handle animation events
    animation.addEventListener('finish', () => {
      stopAnimation(animationInfo.id);
      animationInfo.onEnd?.();
    });
    
    return {
      id: animationInfo.id,
      animation,
      pause: () => {
        animation.pause();
        pauseAnimation(animationInfo.id);
      },
      resume: () => {
        animation.play();
        resumeAnimation(animationInfo.id);
      },
      stop: () => {
        animation.cancel();
        stopAnimation(animationInfo.id);
      }
    };
  }, [startAnimation, pauseAnimation, resumeAnimation, stopAnimation]);

  const fadeIn = useCallback((element: HTMLElement, duration = 300) => {
    return createAnimation('fadeIn', element, [
      { opacity: 0 },
      { opacity: 1 }
    ], { duration, fill: 'forwards' });
  }, [createAnimation]);

  const fadeOut = useCallback((element: HTMLElement, duration = 300) => {
    return createAnimation('fadeOut', element, [
      { opacity: 1 },
      { opacity: 0 }
    ], { duration, fill: 'forwards' });
  }, [createAnimation]);

  const slideIn = useCallback((element: HTMLElement, direction: 'left' | 'right' | 'up' | 'down' = 'right', duration = 300) => {
    const transforms = {
      left: ['translateX(-100%)', 'translateX(0%)'],
      right: ['translateX(100%)', 'translateX(0%)'],
      up: ['translateY(-100%)', 'translateY(0%)'],
      down: ['translateY(100%)', 'translateY(0%)']
    };
    
    return createAnimation(`slideIn-${direction}`, element, [
      { transform: transforms[direction][0] },
      { transform: transforms[direction][1] }
    ], { duration, fill: 'forwards' });
  }, [createAnimation]);

  return {
    animations,
    createAnimation,
    startAnimation,
    pauseAnimation,
    resumeAnimation,
    stopAnimation,
    fadeIn,
    fadeOut,
    slideIn
  };
};

// Navigation Hook
export const useNavigationManager = () => {
  const navigate = useStore((state) => state.navigate);
  const goBack = useStore((state) => state.goBack);
  const goForward = useStore((state) => state.goForward);
  const updateBreadcrumbs = useStore((state) => state.updateBreadcrumbs);
  const openTab = useStore((state) => state.openTab);
  const closeTab = useStore((state) => state.closeTab);
  const switchTab = useStore((state) => state.switchTab);

  const navigateTo = useCallback((path: string, title?: string, options?: { newTab?: boolean }) => {
    if (options?.newTab) {
      openTab({
        title: title || path,
        path,
        isDirty: false,
        isLoading: false,
        isPinned: false,
        isClosable: true
      });
    } else {
      navigate(path, title);
    }
  }, [navigate, openTab]);

  const createBreadcrumbs = useCallback((paths: Array<{ label: string; path: string }>) => {
    const breadcrumbs: Breadcrumb[] = paths.map((item, index) => ({
      id: `breadcrumb-${index}`,
      label: item.label,
      path: item.path,
      isActive: index === paths.length - 1
    }));
    
    updateBreadcrumbs(breadcrumbs);
  }, [updateBreadcrumbs]);

  return {
    navigate: navigateTo,
    goBack,
    goForward,
    createBreadcrumbs,
    openTab,
    closeTab,
    switchTab
  };
};

// Context Menu Hook
export const useContextMenuManager = () => {
  const showContextMenu = useStore((state) => state.showContextMenu);
  const hideContextMenu = useStore((state) => state.hideContextMenu);

  const showMenu = useCallback((
    event: React.MouseEvent,
    items: ContextMenu['items'],
    options?: {
      triggerId?: string;
      placement?: ContextMenu['placement'];
    }
  ) => {
    event.preventDefault();
    
    return showContextMenu({
      triggerId: options?.triggerId || 'unknown',
      position: { x: event.clientX, y: event.clientY },
      anchor: 'mouse',
      placement: options?.placement || 'bottom-start',
      items,
      config: {
        closeOnClick: true,
        closeOnScroll: true,
        showIcons: true,
        showShortcuts: true
      }
    });
  }, [showContextMenu]);

  return {
    showMenu,
    hide: hideContextMenu
  };
};

// Combined UI Hook (Main Hook)
export const useUI = () => {
  const theme = useThemeManager();
  const layout = useLayoutManager();
  const modals = useModalManager();
  const notifications = useNotificationManager();
  const loading = useLoadingManager();
  const responsive = useResponsiveManager();
  const accessibility = useAccessibilityManager();
  const animations = useAnimationManager();
  const navigation = useNavigationManager();
  const contextMenu = useContextMenuManager();

  return {
    theme,
    layout,
    modals,
    notifications,
    loading,
    responsive,
    accessibility,
    animations,
    navigation,
    contextMenu
  };
};

// Utility Hooks
export const useUIState = () => {
  const currentTheme = useCurrentTheme();
  const isDarkMode = useIsDarkMode();
  const breakpoint = useCurrentBreakpoint();
  const isMobile = useIsMobile();
  const activeModal = useActiveModal();
  const openModals = useOpenModals();
  const notifications = useActiveNotifications();
  const isLoading = useIsGlobalLoading();

  return {
    theme: currentTheme,
    isDarkMode,
    breakpoint,
    isMobile,
    hasActiveModal: !!activeModal,
    modalCount: openModals.length,
    notificationCount: notifications.length,
    isLoading
  };
};

export const useMediaQuery = (query: string) => {
  const [matches, setMatches] = React.useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches;
    }
    return false;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    setMatches(mediaQuery.matches);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [query]);

  return matches;
};

export const usePrefersDarkMode = () => {
  return useMediaQuery('(prefers-color-scheme: dark)');
};

export const usePrefersReducedMotion = () => {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
};

export const useViewportSize = () => {
  const [size, setSize] = React.useState(() => ({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0
  }));

  useEffect(() => {
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return size;
};