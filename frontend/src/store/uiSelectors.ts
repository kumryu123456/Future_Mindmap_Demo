import { useUIStore } from './uiStore';
import type { 
  UIStoreState,
  ThemeName,
  LayoutType,
  ModalType,
  NotificationType,
  Breakpoint,
  DeviceType,
  UIModal,
  UINotification,
  NavigationItem,
  TabInfo,
  KeyboardShortcut,
  AnimationInfo,
  ContextMenu,
  FormInfo,
  FieldInfo
} from '../types/ui';

/**
 * UI Store Selectors
 * Optimized selectors for UI store state with memoization
 */

// Theme & Appearance Selectors
export const useTheme = () => useUIStore((state) => state.theme);
export const useCurrentTheme = () => useUIStore((state) => state.theme.currentTheme);
export const useSystemPreference = () => useUIStore((state) => state.theme.systemPreference);
export const useColorScheme = () => useUIStore((state) => state.theme.colorScheme);
export const useAccentColor = () => useUIStore((state) => state.theme.accentColor);
export const useCustomColors = () => useUIStore((state) => state.theme.customColors);
export const useTypographySettings = () => useUIStore((state) => state.theme.typography);
export const useSpacingSettings = () => useUIStore((state) => state.theme.spacing);
export const useEffectSettings = () => useUIStore((state) => state.theme.effects);
export const useBrandingSettings = () => useUIStore((state) => state.theme.branding);

export const useCustomThemes = () => useUIStore((state) => state.theme.customThemes);
export const useActiveTheme = () => useUIStore((state) => 
  state.theme.customThemes.find(theme => theme.isActive) || 
  state.theme.customThemes.find(theme => theme.name === state.theme.currentTheme)
);

export const useAvailableThemes = () => useUIStore((state) => {
  const builtInThemes = ['light', 'dark', 'auto'];
  const customThemes = state.theme.customThemes.map(theme => theme.name);
  return [...builtInThemes, ...customThemes];
});

export const useIsDarkMode = () => useUIStore((state) => {
  const theme = state.theme.currentTheme;
  const systemPreference = state.theme.systemPreference;
  
  if (theme === 'auto') return systemPreference === 'dark';
  if (theme === 'dark') return true;
  
  // Check custom theme
  const customTheme = state.theme.customThemes.find(t => t.name === theme);
  return customTheme?.metadata.category === 'dark';
});

// Layout & Structure Selectors
export const useLayout = () => useUIStore((state) => state.layout);
export const useCurrentLayout = () => useUIStore((state) => state.layout.currentLayout);
export const useLayoutConfig = () => useUIStore((state) => state.layout.layoutConfig);
export const useSidebar = () => useUIStore((state) => state.layout.sidebar);
export const useHeader = () => useUIStore((state) => state.layout.header);
export const useFooter = () => useUIStore((state) => state.layout.footer);
export const useContentArea = () => useUIStore((state) => state.layout.content);
export const usePanels = () => useUIStore((state) => state.layout.panels);
export const useGrid = () => useUIStore((state) => state.layout.grid);

export const useIsSidebarOpen = () => useUIStore((state) => state.layout.sidebar.isOpen);
export const useIsSidebarCollapsed = () => useUIStore((state) => state.layout.sidebar.isCollapsed);
export const useIsSidebarPinned = () => useUIStore((state) => state.layout.sidebar.isPinned);
export const useSidebarWidth = () => useUIStore((state) => 
  state.layout.sidebar.isCollapsed 
    ? state.layout.sidebar.collapsedWidth 
    : state.layout.sidebar.width
);

export const useActiveSidebarSection = () => useUIStore((state) => state.layout.sidebar.activeSection);
export const useExpandedSidebarSections = () => useUIStore((state) => state.layout.sidebar.expandedSections);

export const useVisiblePanels = () => useUIStore((state) => 
  state.layout.panels.panels.filter(panel => panel.isOpen && !panel.isMinimized)
);
export const useActivePanel = () => useUIStore((state) => 
  state.layout.panels.panels.find(panel => panel.id === state.layout.panels.activePanel)
);

// Navigation & Routing Selectors
export const useNavigation = () => useUIStore((state) => state.navigation);
export const useCurrentPath = () => useUIStore((state) => state.navigation.currentPath);
export const useCurrentTitle = () => useUIStore((state) => state.navigation.currentTitle);
export const useNavigationHistory = () => useUIStore((state) => state.navigation.history);
export const useForwardStack = () => useUIStore((state) => state.navigation.forwardStack);
export const useBreadcrumbs = () => useUIStore((state) => state.navigation.breadcrumbs);
export const useNavigationMenu = () => useUIStore((state) => state.navigation.menu);
export const useTabs = () => useUIStore((state) => state.navigation.tabs);
export const useQuickNav = () => useUIStore((state) => state.navigation.quickNav);

export const useCanGoBack = () => useUIStore((state) => state.navigation.history.length > 0);
export const useCanGoForward = () => useUIStore((state) => state.navigation.forwardStack.length > 0);

export const useActiveNavigationItem = () => useUIStore((state) => {
  const findActiveItem = (items: NavigationItem[]): NavigationItem | null => {
    for (const item of items) {
      if (item.isActive) return item;
      if (item.children.length > 0) {
        const activeChild = findActiveItem(item.children);
        if (activeChild) return activeChild;
      }
    }
    return null;
  };
  return findActiveItem(state.navigation.menu.items);
});

export const useOpenTabs = () => useUIStore((state) => state.navigation.tabs.tabs);
export const useActiveTab = () => useUIStore((state) => 
  state.navigation.tabs.tabs.find(tab => tab.id === state.navigation.tabs.activeTab)
);
export const useDirtyTabs = () => useUIStore((state) => 
  state.navigation.tabs.tabs.filter(tab => tab.isDirty)
);

export const useIsQuickNavOpen = () => useUIStore((state) => state.navigation.quickNav.isOpen);
export const useQuickNavQuery = () => useUIStore((state) => state.navigation.quickNav.query);
export const useQuickNavResults = () => useUIStore((state) => state.navigation.quickNav.results);

// Modal & Overlay Selectors
export const useModals = () => useUIStore((state) => state.modals);
export const useOpenModals = () => useUIStore((state) => state.modals.modals.filter(modal => modal.isOpen));
export const useActiveModal = () => useUIStore((state) => 
  state.modals.modals.find(modal => modal.id === state.modals.activeModal)
);
export const useModalById = (id: string) => useUIStore((state) => 
  state.modals.modals.find(modal => modal.id === id)
);
export const useModalsByType = (type: ModalType) => useUIStore((state) => 
  state.modals.modals.filter(modal => modal.type === type)
);

export const useHasOpenModals = () => useUIStore((state) => 
  state.modals.modals.some(modal => modal.isOpen)
);
export const useModalStack = () => useUIStore((state) => 
  state.modals.modals
    .filter(modal => modal.isOpen)
    .sort((a, b) => {
      const aIndex = state.modals.modalHistory.indexOf(a.id);
      const bIndex = state.modals.modalHistory.indexOf(b.id);
      return bIndex - aIndex; // Most recent first
    })
);

export const useTopModal = () => useUIStore((state) => {
  const openModals = state.modals.modals.filter(modal => modal.isOpen);
  if (openModals.length === 0) return null;
  
  const mostRecentId = state.modals.modalHistory[state.modals.modalHistory.length - 1];
  return openModals.find(modal => modal.id === mostRecentId) || openModals[0];
});

// Notification & Alert Selectors
export const useNotifications = () => useUIStore((state) => state.notifications);
export const useActiveNotifications = () => useUIStore((state) => state.notifications.notifications);
export const useNotificationsByType = (type: NotificationType) => useUIStore((state) => 
  state.notifications.notifications.filter(notification => notification.type === type)
);
export const useUnreadNotifications = () => useUIStore((state) => 
  state.notifications.notifications.filter(notification => !notification.isRead)
);
export const usePinnedNotifications = () => useUIStore((state) => 
  state.notifications.notifications.filter(notification => notification.isPinned)
);

export const useNotificationCount = () => useUIStore((state) => state.notifications.notifications.length);
export const useUnreadNotificationCount = () => useUIStore((state) => 
  state.notifications.notifications.filter(notification => !notification.isRead).length
);

export const useNotificationPosition = () => useUIStore((state) => state.notifications.position);
export const useNotificationConfig = () => useUIStore((state) => ({
  position: state.notifications.position,
  maxNotifications: state.notifications.maxNotifications,
  defaultDuration: state.notifications.defaultDuration,
  groupSimilar: state.notifications.groupSimilar,
  soundEnabled: state.notifications.soundEnabled,
  hapticsEnabled: state.notifications.hapticsEnabled
}));

export const useRecentNotifications = (limit = 5) => useUIStore((state) => 
  state.notifications.notifications
    .slice()
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit)
);

// Loading & Progress Selectors
export const useLoading = () => useUIStore((state) => state.loading);
export const useGlobalLoading = () => useUIStore((state) => state.loading.global);
export const useComponentLoading = (componentId: string) => useUIStore((state) => 
  state.loading.components[componentId]
);
export const useRouteLoading = () => useUIStore((state) => state.loading.route);
export const useOperations = () => useUIStore((state) => state.loading.operations);

export const useIsGlobalLoading = () => useUIStore((state) => state.loading.global.isLoading);
export const useIsComponentLoading = (componentId: string) => useUIStore((state) => 
  state.loading.components[componentId]?.isLoading || false
);
export const useIsRouteLoading = () => useUIStore((state) => state.loading.route.isLoading);

export const useActiveOperations = () => useUIStore((state) => 
  Object.entries(state.loading.operations)
    .filter(([, operation]) => operation.isLoading)
    .map(([id, operation]) => ({ id, ...operation }))
);

export const useIsAnyLoading = () => useUIStore((state) => {
  const { global, components, route, operations } = state.loading;
  
  return global.isLoading || 
         route.isLoading ||
         Object.values(components).some(comp => comp.isLoading) ||
         Object.values(operations).some(op => op.isLoading);
});

// Form & Input Selectors
export const useForms = () => useUIStore((state) => state.forms);
export const useActiveForm = () => useUIStore((state) => 
  state.forms.activeForm ? state.forms.forms[state.forms.activeForm] : null
);
export const useFormById = (formId: string) => useUIStore((state) => state.forms.forms[formId]);
export const useValidationState = () => useUIStore((state) => state.forms.validation);
export const useAutoSaveConfig = () => useUIStore((state) => state.forms.autoSave);

export const useFormField = (formId: string, fieldName: string) => useUIStore((state) => 
  state.forms.forms[formId]?.fields[fieldName]
);
export const useFormValue = (formId: string, fieldName: string) => useUIStore((state) => 
  state.forms.forms[formId]?.values[fieldName]
);
export const useFormErrors = (formId: string) => useUIStore((state) => 
  state.forms.forms[formId]?.errors || {}
);
export const useFieldErrors = (formId: string, fieldName: string) => useUIStore((state) => 
  state.forms.forms[formId]?.errors[fieldName] || []
);

export const useIsFormDirty = (formId: string) => useUIStore((state) => 
  state.forms.forms[formId]?.isDirty || false
);
export const useIsFormValid = (formId: string) => useUIStore((state) => 
  state.forms.forms[formId]?.isValid || false
);
export const useIsFormSubmitting = (formId: string) => useUIStore((state) => 
  state.forms.forms[formId]?.isSubmitting || false
);

export const useDirtyForms = () => useUIStore((state) => 
  Object.values(state.forms.forms).filter(form => form.isDirty)
);

// Responsive Design Selectors
export const useResponsive = () => useUIStore((state) => state.responsive);
export const useCurrentBreakpoint = () => useUIStore((state) => state.responsive.currentBreakpoint);
export const useScreen = () => useUIStore((state) => state.responsive.screen);
export const useDevice = () => useUIStore((state) => state.responsive.device);
export const useBreakpoints = () => useUIStore((state) => state.responsive.breakpoints);
export const useContainers = () => useUIStore((state) => state.responsive.containers);
export const useMediaFeatures = () => useUIStore((state) => state.responsive.mediaFeatures);

export const useIsMobile = () => useUIStore((state) => state.responsive.device.isMobile);
export const useIsTablet = () => useUIStore((state) => state.responsive.device.isTablet);
export const useIsDesktop = () => useUIStore((state) => state.responsive.device.isDesktop);
export const useIsTouchDevice = () => useUIStore((state) => state.responsive.device.isTouchDevice);
export const useSupportsHover = () => useUIStore((state) => state.responsive.device.supportsHover);

export const useIsBreakpoint = (breakpoint: Breakpoint) => useUIStore((state) => 
  state.responsive.currentBreakpoint === breakpoint
);
export const useIsBreakpointUp = (breakpoint: Breakpoint) => useUIStore((state) => {
  const breakpoints = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'] as const;
  const currentIndex = breakpoints.indexOf(state.responsive.currentBreakpoint);
  const targetIndex = breakpoints.indexOf(breakpoint);
  return currentIndex >= targetIndex;
});
export const useIsBreakpointDown = (breakpoint: Breakpoint) => useUIStore((state) => {
  const breakpoints = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'] as const;
  const currentIndex = breakpoints.indexOf(state.responsive.currentBreakpoint);
  const targetIndex = breakpoints.indexOf(breakpoint);
  return currentIndex <= targetIndex;
});

export const useScreenOrientation = () => useUIStore((state) => state.responsive.screen.orientation);
export const useScreenSize = () => useUIStore((state) => ({
  width: state.responsive.screen.width,
  height: state.responsive.screen.height
}));

export const usePrefersColorScheme = () => useUIStore((state) => 
  state.responsive.mediaFeatures.prefersColorScheme
);
export const usePrefersReducedMotion = () => useUIStore((state) => 
  state.responsive.mediaFeatures.prefersReducedMotion === 'reduce'
);

// Interaction & Gesture Selectors
export const useInteractions = () => useUIStore((state) => state.interactions);
export const usePointer = () => useUIStore((state) => state.interactions.pointer);
export const useTouch = () => useUIStore((state) => state.interactions.touch);
export const useKeyboard = () => useUIStore((state) => state.interactions.keyboard);
export const useHover = () => useUIStore((state) => state.interactions.hover);
export const useSelection = () => useUIStore((state) => state.interactions.selection);

export const useIsPointerDown = () => useUIStore((state) => state.interactions.pointer.isDown);
export const usePointerPosition = () => useUIStore((state) => state.interactions.pointer.position);
export const useActiveTouches = () => useUIStore((state) => state.interactions.touch.touches);
export const useActiveGesture = () => useUIStore((state) => state.interactions.touch.activeGesture);
export const useActiveKeys = () => useUIStore((state) => state.interactions.keyboard.activeKeys);
export const useKeyboardModifiers = () => useUIStore((state) => state.interactions.keyboard.modifiers);

export const useIsKeyPressed = (key: string) => useUIStore((state) => 
  state.interactions.keyboard.activeKeys.has(key)
);
export const useHoveredElements = () => useUIStore((state) => state.interactions.hover.hoveredElements);
export const useSelectedElements = () => useUIStore((state) => state.interactions.selection.selectedElements);
export const useSelectionMode = () => useUIStore((state) => state.interactions.selection.selectionMode);

// Accessibility Selectors
export const useAccessibility = () => useUIStore((state) => state.accessibility);
export const useScreenReader = () => useUIStore((state) => state.accessibility.screenReader);
export const useFocusManagement = () => useUIStore((state) => state.accessibility.focusManagement);
export const useHighContrast = () => useUIStore((state) => state.accessibility.highContrast);
export const useMotionSettings = () => useUIStore((state) => state.accessibility.motion);
export const useKeyboardNav = () => useUIStore((state) => state.accessibility.keyboardNav);
export const useVoiceControl = () => useUIStore((state) => state.accessibility.voiceControl);

export const useIsScreenReaderEnabled = () => useUIStore((state) => 
  state.accessibility.screenReader.enabled
);
export const useIsHighContrastEnabled = () => useUIStore((state) => 
  state.accessibility.highContrast.enabled
);
export const useIsReducedMotionEnabled = () => useUIStore((state) => 
  state.accessibility.motion.reducedMotion
);
export const useIsKeyboardNavEnabled = () => useUIStore((state) => 
  state.accessibility.keyboardNav.enabled
);
export const useShowFocusRings = () => useUIStore((state) => 
  state.accessibility.keyboardNav.showFocusRings
);

export const useAnnouncements = () => useUIStore((state) => state.accessibility.screenReader.announcements);
export const useLiveRegions = () => useUIStore((state) => state.accessibility.screenReader.liveRegions);
export const useSkipLinks = () => useUIStore((state) => state.accessibility.focusManagement.skipLinks);
export const useVoiceCommands = () => useUIStore((state) => state.accessibility.voiceControl.commands);

// Performance & Optimization Selectors
export const usePerformance = () => useUIStore((state) => state.performance);
export const usePerformanceMetrics = () => useUIStore((state) => state.performance.metrics);
export const useOptimizationSettings = () => useUIStore((state) => state.performance.optimization);
export const useMemoryInfo = () => useUIStore((state) => state.performance.memory);
export const useBundles = () => useUIStore((state) => state.performance.bundles);
export const useLazyLoading = () => useUIStore((state) => state.performance.lazyLoading);

export const useLoadedBundles = () => useUIStore((state) => 
  state.performance.bundles.filter(bundle => bundle.isLoaded)
);
export const usePendingComponents = () => useUIStore((state) => 
  state.performance.lazyLoading.pendingComponents
);
export const useLoadedComponents = () => useUIStore((state) => 
  state.performance.lazyLoading.loadedComponents
);
export const useFailedComponents = () => useUIStore((state) => 
  state.performance.lazyLoading.failedComponents
);

export const useMemoryPressure = () => useUIStore((state) => state.performance.memory.memoryPressure);
export const useIsMemoryPressureHigh = () => useUIStore((state) => 
  ['high', 'critical'].includes(state.performance.memory.memoryPressure)
);

// Animation & Transition Selectors
export const useAnimations = () => useUIStore((state) => state.animations);
export const useAnimationRegistry = () => useUIStore((state) => state.animations.animations);
export const useActiveAnimations = () => useUIStore((state) => state.animations.activeAnimations);
export const useGlobalAnimationSettings = () => useUIStore((state) => state.animations.globalSettings);
export const useAnimationPresets = () => useUIStore((state) => state.animations.presets);
export const useAnimationPerformance = () => useUIStore((state) => state.animations.performance);

export const useIsAnimationsEnabled = () => useUIStore((state) => 
  state.animations.globalSettings.enabled && 
  !state.accessibility.motion.reducedMotion
);
export const useRunningAnimations = () => useUIStore((state) => 
  Object.values(state.animations.animations).filter(animation => animation.isRunning)
);

export const useAnimationById = (id: string) => useUIStore((state) => 
  state.animations.animations[id]
);

// Context Menu & Dropdown Selectors
export const useContextMenus = () => useUIStore((state) => state.contextMenus);
export const useActiveContextMenu = () => useUIStore((state) => 
  state.contextMenus.menus.find(menu => menu.id === state.contextMenus.activeMenu)
);
export const useContextMenuById = (id: string) => useUIStore((state) => 
  state.contextMenus.menus.find(menu => menu.id === id)
);

export const useHasActiveContextMenu = () => useUIStore((state) => 
  state.contextMenus.activeMenu !== null
);
export const useContextMenuConfig = () => useUIStore((state) => ({
  closeOnClick: state.contextMenus.closeOnClick,
  closeOnScroll: state.contextMenus.closeOnScroll,
  closeDelay: state.contextMenus.closeDelay
}));

// Drag & Drop Selectors
export const useDragDrop = () => useUIStore((state) => state.dragDrop);
export const useIsDragging = () => useUIStore((state) => state.dragDrop.isDragging);
export const useDragData = () => useUIStore((state) => state.dragDrop.dragData);
export const useDropTargets = () => useUIStore((state) => state.dragDrop.dropTargets);
export const useDragDropConfig = () => useUIStore((state) => state.dragDrop.config);
export const useGhostImage = () => useUIStore((state) => state.dragDrop.ghostImage);

export const useActiveDropTargets = () => useUIStore((state) => 
  state.dragDrop.dropTargets.filter(target => target.isActive)
);
export const useHoveredDropTargets = () => useUIStore((state) => 
  state.dragDrop.dropTargets.filter(target => target.isHovered)
);
export const useValidDropTargets = () => useUIStore((state) => 
  state.dragDrop.dropTargets.filter(target => target.canDrop)
);

// Focus Management Selectors
export const useFocus = () => useUIStore((state) => state.focus);
export const useCurrentFocus = () => useUIStore((state) => state.focus.currentFocus);
export const useFocusHistory = () => useUIStore((state) => state.focus.focusHistory);
export const useFocusTraps = () => useUIStore((state) => state.focus.focusTraps);
export const useActiveFocusTrap = () => useUIStore((state) => 
  state.focus.focusTraps.find(trap => trap.id === state.focus.activeTrap)
);
export const useFocusVisible = () => useUIStore((state) => state.focus.focusVisible);
export const useFocusSource = () => useUIStore((state) => state.focus.focusSource);
export const useTabOrder = () => useUIStore((state) => state.focus.tabOrder);

export const useHasActiveFocusTrap = () => useUIStore((state) => state.focus.activeTrap !== null);
export const useIsFocusVisible = () => useUIStore((state) => 
  state.focus.focusVisible && state.accessibility.keyboardNav.showFocusRings
);

// Keyboard Shortcut Selectors
export const useShortcuts = () => useUIStore((state) => state.shortcuts);
export const useRegisteredShortcuts = () => useUIStore((state) => state.shortcuts.shortcuts);
export const useGlobalShortcuts = () => useUIStore((state) => state.shortcuts.globalShortcuts);
export const useContextShortcuts = (context?: string) => useUIStore((state) => 
  context ? state.shortcuts.contextShortcuts[context] || [] : []
);
export const useActiveShortcutContext = () => useUIStore((state) => state.shortcuts.activeContext);
export const useShortcutConfig = () => useUIStore((state) => state.shortcuts.config);

export const useShortcutById = (id: string) => useUIStore((state) => 
  state.shortcuts.shortcuts.find(shortcut => shortcut.id === id)
);
export const useEnabledShortcuts = () => useUIStore((state) => 
  state.shortcuts.shortcuts.filter(shortcut => shortcut.enabled)
);

// Error Boundary & Recovery Selectors
export const useErrors = () => useUIStore((state) => state.errors);
export const useErrorBoundaries = () => useUIStore((state) => state.errors.boundaries);
export const useGlobalErrors = () => useUIStore((state) => state.errors.globalErrors);
export const useRecoveryActions = () => useUIStore((state) => state.errors.recoveryActions);
export const useErrorReporting = () => useUIStore((state) => state.errors.reporting);

export const useHasErrors = () => useUIStore((state) => 
  state.errors.globalErrors.length > 0 || state.errors.boundaries.length > 0
);
export const useCriticalErrors = () => useUIStore((state) => 
  state.errors.globalErrors.filter(error => error.severity === 'critical')
);
export const useRecoverableErrors = () => useUIStore((state) => 
  state.errors.globalErrors.filter(error => error.recoverable)
);

export const useRecentErrors = (limit = 5) => useUIStore((state) => 
  state.errors.globalErrors
    .slice()
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit)
);

// Developer Tools & Debugging Selectors
export const useDevTools = () => useUIStore((state) => state.devTools);
export const useIsDevelopment = () => useUIStore((state) => state.devTools.isDevelopment);
export const useIsDebugMode = () => useUIStore((state) => state.devTools.debugMode);
export const usePerformanceMonitoring = () => useUIStore((state) => state.devTools.performanceMonitoring);
export const useDebugInfo = () => useUIStore((state) => state.devTools.debugInfo);
export const useHotReload = () => useUIStore((state) => state.devTools.hotReload);

export const useComponentTree = () => useUIStore((state) => state.devTools.debugInfo.componentTree);
export const useStateHistory = () => useUIStore((state) => state.devTools.debugInfo.stateHistory);
export const useActionLog = () => useUIStore((state) => state.devTools.debugInfo.actionLog);

// Computed Selectors
export const useViewportSize = () => useUIStore((state) => ({
  width: state.responsive.screen.width,
  height: state.responsive.screen.height,
  breakpoint: state.responsive.currentBreakpoint,
  orientation: state.responsive.screen.orientation
}));

export const useEffectiveTheme = () => useUIStore((state) => {
  const currentTheme = state.theme.currentTheme;
  
  if (currentTheme === 'auto') {
    return state.theme.systemPreference;
  }
  
  const customTheme = state.theme.customThemes.find(theme => theme.name === currentTheme);
  if (customTheme) {
    return customTheme.metadata.category === 'dark' ? 'dark' : 'light';
  }
  
  return currentTheme as 'light' | 'dark';
});

export const useLayoutMetrics = () => useUIStore((state) => {
  const sidebar = state.layout.sidebar;
  const header = state.layout.header;
  const footer = state.layout.footer;
  
  return {
    sidebarWidth: sidebar.isOpen ? (sidebar.isCollapsed ? sidebar.collapsedWidth : sidebar.width) : 0,
    headerHeight: header.isVisible ? header.height : 0,
    footerHeight: footer.isVisible ? footer.height : 0,
    availableWidth: state.responsive.screen.width - (sidebar.isOpen ? sidebar.width : 0),
    availableHeight: state.responsive.screen.height - 
                     (header.isVisible ? header.height : 0) - 
                     (footer.isVisible ? footer.height : 0)
  };
});

export const useUIState = () => useUIStore((state) => ({
  theme: state.theme.currentTheme,
  isDarkMode: state.theme.currentTheme === 'dark' || 
              (state.theme.currentTheme === 'auto' && state.theme.systemPreference === 'dark'),
  breakpoint: state.responsive.currentBreakpoint,
  isMobile: state.responsive.device.isMobile,
  isTablet: state.responsive.device.isTablet,
  isDesktop: state.responsive.device.isDesktop,
  sidebarOpen: state.layout.sidebar.isOpen,
  sidebarCollapsed: state.layout.sidebar.isCollapsed,
  hasModals: state.modals.modals.some(modal => modal.isOpen),
  hasNotifications: state.notifications.notifications.length > 0,
  isLoading: state.loading.global.isLoading,
  hasErrors: state.errors.globalErrors.length > 0
}));

// Performance Optimization Selectors
export const useUIPerformance = () => useUIStore((state) => ({
  renderOptimization: state.performance.optimization.rendering,
  memoryPressure: state.performance.memory.memoryPressure,
  animationsEnabled: state.animations.globalSettings.enabled && !state.accessibility.motion.reducedMotion,
  lazyLoadingEnabled: state.performance.optimization.images.enableLazyLoading,
  virtualizationEnabled: state.performance.optimization.rendering.enableVirtualization
}));

export const useAccessibilitySettings = () => useUIStore((state) => ({
  screenReader: state.accessibility.screenReader.enabled,
  highContrast: state.accessibility.highContrast.enabled,
  reducedMotion: state.accessibility.motion.reducedMotion,
  keyboardNav: state.accessibility.keyboardNav.enabled,
  focusVisible: state.accessibility.focusManagement.focusVisible,
  voiceControl: state.accessibility.voiceControl.enabled
}));

// Bulk Selectors for Performance
export const useThemeBundle = () => useUIStore((state) => ({
  currentTheme: state.theme.currentTheme,
  isDarkMode: state.theme.currentTheme === 'dark' || 
              (state.theme.currentTheme === 'auto' && state.theme.systemPreference === 'dark'),
  colorScheme: state.theme.colorScheme,
  accentColor: state.theme.accentColor,
  customColors: state.theme.customColors
}));

export const useLayoutBundle = () => useUIStore((state) => ({
  currentLayout: state.layout.currentLayout,
  sidebarOpen: state.layout.sidebar.isOpen,
  sidebarCollapsed: state.layout.sidebar.isCollapsed,
  sidebarWidth: state.layout.sidebar.isCollapsed ? 
                state.layout.sidebar.collapsedWidth : 
                state.layout.sidebar.width,
  headerVisible: state.layout.header.isVisible,
  footerVisible: state.layout.footer.isVisible
}));

export const useInteractionBundle = () => useUIStore((state) => ({
  isDragging: state.dragDrop.isDragging,
  hasActiveModal: state.modals.modals.some(modal => modal.isOpen),
  hasActiveContextMenu: state.contextMenus.activeMenu !== null,
  focusVisible: state.focus.focusVisible,
  activeFocusTrap: state.focus.activeTrap
}));