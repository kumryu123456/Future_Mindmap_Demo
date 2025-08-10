import React from 'react';

// UI Store Types
export interface UIStoreState {
  // Theme & Appearance
  theme: ThemeState;
  
  // Layout & Structure
  layout: LayoutState;
  
  // Navigation & Routing
  navigation: NavigationState;
  
  // Modals & Overlays
  modals: ModalState;
  
  // Notifications & Alerts
  notifications: NotificationState;
  
  // Loading & Progress
  loading: LoadingState;
  
  // Forms & Inputs
  forms: FormState;
  
  // Responsive Design
  responsive: ResponsiveState;
  
  // Interactions & Gestures
  interactions: InteractionState;
  
  // Accessibility
  accessibility: AccessibilityState;
  
  // Performance & Optimization
  performance: PerformanceState;
  
  // Animation & Transitions
  animations: AnimationState;
  
  // Context Menus & Dropdowns
  contextMenus: ContextMenuState;
  
  // Drag & Drop
  dragDrop: DragDropState;
  
  // Focus Management
  focus: FocusState;
  
  // Keyboard Shortcuts
  shortcuts: ShortcutState;
  
  // Error Boundaries & Recovery
  errors: ErrorState;
  
  // Developer Tools & Debugging
  devTools: DevToolsState;
}

// Theme & Appearance Types
export interface ThemeState {
  // Current Theme
  currentTheme: ThemeName;
  systemPreference: 'light' | 'dark';
  customThemes: CustomTheme[];
  
  // Color Schemes
  colorScheme: ColorScheme;
  accentColor: string;
  customColors: CustomColorPalette;
  
  // Typography
  typography: TypographySettings;
  
  // Spacing & Layout
  spacing: SpacingSettings;
  
  // Effects & Styling
  effects: EffectSettings;
  
  // Brand Customization
  branding: BrandingSettings;
}

export interface ColorScheme {
  primary: ColorPalette;
  secondary: ColorPalette;
  success: ColorPalette;
  warning: ColorPalette;
  error: ColorPalette;
  info: ColorPalette;
  neutral: ColorPalette;
}

export interface ColorPalette {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
  950: string;
}

export interface CustomColorPalette {
  background: {
    primary: string;
    secondary: string;
    tertiary: string;
    overlay: string;
  };
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    inverse: string;
    disabled: string;
  };
  border: {
    primary: string;
    secondary: string;
    focus: string;
    error: string;
    success: string;
  };
  surface: {
    primary: string;
    secondary: string;
    raised: string;
    sunken: string;
    overlay: string;
  };
}

export interface TypographySettings {
  fontFamily: {
    sans: string[];
    serif: string[];
    mono: string[];
  };
  fontSize: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
    '4xl': string;
  };
  fontWeight: {
    thin: number;
    light: number;
    normal: number;
    medium: number;
    semibold: number;
    bold: number;
    extrabold: number;
  };
  lineHeight: {
    tight: number;
    normal: number;
    relaxed: number;
  };
  letterSpacing: {
    tight: string;
    normal: string;
    wide: string;
  };
}

export interface SpacingSettings {
  baseUnit: number; // Base spacing unit in pixels
  scale: number[]; // Spacing scale multipliers
  containerMaxWidth: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
  };
  borderRadius: {
    none: string;
    sm: string;
    base: string;
    md: string;
    lg: string;
    xl: string;
    full: string;
  };
}

export interface EffectSettings {
  shadows: {
    sm: string;
    base: string;
    md: string;
    lg: string;
    xl: string;
    inner: string;
  };
  blur: {
    sm: string;
    base: string;
    md: string;
    lg: string;
    xl: string;
  };
  transitions: {
    fast: string;
    base: string;
    slow: string;
  };
  opacity: {
    disabled: number;
    muted: number;
    hover: number;
    active: number;
  };
}

export interface BrandingSettings {
  logo: {
    primary: string;
    secondary: string;
    icon: string;
    favicon: string;
  };
  brand: {
    name: string;
    tagline: string;
    colors: {
      primary: string;
      secondary: string;
    };
  };
  customization: {
    allowUserThemes: boolean;
    allowColorCustomization: boolean;
    allowFontCustomization: boolean;
  };
}

export interface CustomTheme {
  id: string;
  name: string;
  description?: string;
  author?: string;
  version: string;
  isBuiltIn: boolean;
  isActive: boolean;
  
  // Theme Configuration
  colors: ColorScheme;
  typography: Partial<TypographySettings>;
  spacing: Partial<SpacingSettings>;
  effects: Partial<EffectSettings>;
  
  // Metadata
  metadata: {
    createdAt: string;
    updatedAt: string;
    tags: string[];
    category: 'light' | 'dark' | 'high-contrast' | 'custom';
  };
}

// Layout & Structure Types
export interface LayoutState {
  // Layout Configuration
  currentLayout: LayoutType;
  layoutConfig: LayoutConfig;
  
  // Sidebar & Navigation
  sidebar: SidebarState;
  
  // Header & Footer
  header: HeaderState;
  footer: FooterState;
  
  // Content Areas
  content: ContentAreaState;
  
  // Panels & Panes
  panels: PanelState;
  
  // Grid & Flexbox
  grid: GridState;
}

export interface LayoutConfig {
  type: LayoutType;
  variant: LayoutVariant;
  density: 'compact' | 'comfortable' | 'spacious';
  alignment: 'left' | 'center' | 'right';
  maxWidth: string | null;
  padding: SpacingValue;
  margin: SpacingValue;
}

export interface SidebarState {
  isOpen: boolean;
  isCollapsed: boolean;
  isPinned: boolean;
  position: 'left' | 'right';
  width: number;
  collapsedWidth: number;
  
  // Content
  activeSection: string | null;
  expandedSections: string[];
  
  // Behavior
  behavior: {
    autoHide: boolean;
    overlay: boolean;
    persistent: boolean;
    swipeToToggle: boolean;
  };
  
  // Responsive
  responsive: {
    breakpoint: string;
    hiddenOnMobile: boolean;
    overlayOnMobile: boolean;
  };
}

export interface HeaderState {
  isVisible: boolean;
  isFixed: boolean;
  height: number;
  
  // Navigation
  showNavigation: boolean;
  navigationItems: NavigationItem[];
  
  // Actions
  showActions: boolean;
  actionItems: ActionItem[];
  
  // Search
  showSearch: boolean;
  searchConfig: SearchConfig;
  
  // User Menu
  showUserMenu: boolean;
  userMenuItems: UserMenuItem[];
  
  // Breadcrumbs
  showBreadcrumbs: boolean;
  breadcrumbs: Breadcrumb[];
}

export interface FooterState {
  isVisible: boolean;
  isFixed: boolean;
  height: number;
  
  // Content
  showLinks: boolean;
  links: FooterLink[];
  
  // Copyright
  showCopyright: boolean;
  copyrightText: string;
  
  // Social Links
  showSocial: boolean;
  socialLinks: SocialLink[];
}

export interface ContentAreaState {
  // Main Content
  main: {
    padding: SpacingValue;
    maxWidth: string | null;
    centered: boolean;
  };
  
  // Secondary Content
  aside: {
    position: 'left' | 'right' | 'both';
    width: number | string;
    isCollapsible: boolean;
    isCollapsed: boolean;
  };
  
  // Content Sections
  sections: ContentSection[];
}

export interface PanelState {
  panels: UIPanel[];
  activePanel: string | null;
  panelHistory: string[];
  
  // Panel Management
  maxPanels: number;
  allowMultiple: boolean;
  stackMode: 'overlay' | 'push' | 'reveal';
}

export interface GridState {
  // Grid Configuration
  columns: number;
  rows: number;
  gap: SpacingValue;
  
  // Responsive Grid
  responsive: {
    sm: GridConfig;
    md: GridConfig;
    lg: GridConfig;
    xl: GridConfig;
  };
  
  // Grid Items
  items: GridItem[];
}

// Navigation & Routing Types
export interface NavigationState {
  // Current Navigation
  currentPath: string;
  currentTitle: string;
  
  // History
  history: NavigationHistoryItem[];
  forwardStack: NavigationHistoryItem[];
  
  // Breadcrumbs
  breadcrumbs: Breadcrumb[];
  
  // Navigation Menu
  menu: NavigationMenu;
  
  // Tab Navigation
  tabs: TabState;
  
  // Quick Navigation
  quickNav: QuickNavState;
}

export interface NavigationMenu {
  items: NavigationItem[];
  activeItem: string | null;
  expandedItems: string[];
  
  // Configuration
  showIcons: boolean;
  showLabels: boolean;
  collapsible: boolean;
  searchable: boolean;
}

export interface NavigationItem {
  id: string;
  label: string;
  icon?: string;
  path: string;
  
  // Hierarchy
  parentId?: string;
  children: NavigationItem[];
  depth: number;
  
  // State
  isActive: boolean;
  isExpanded: boolean;
  isDisabled: boolean;
  
  // Permissions
  requiredPermissions?: string[];
  
  // Metadata
  badge?: BadgeInfo;
  tooltip?: string;
  shortcut?: string;
}

export interface TabState {
  tabs: TabInfo[];
  activeTab: string | null;
  
  // Configuration
  maxTabs: number;
  allowClosing: boolean;
  allowReordering: boolean;
  showAddButton: boolean;
  
  // Persistence
  persistTabs: boolean;
  restoreOnLoad: boolean;
}

export interface TabInfo {
  id: string;
  title: string;
  icon?: string;
  path: string;
  
  // State
  isDirty: boolean;
  isLoading: boolean;
  isPinned: boolean;
  isClosable: boolean;
  
  // Content
  component?: string;
  props?: Record<string, any>;
  
  // Metadata
  tooltip?: string;
  badge?: BadgeInfo;
  lastAccessed: string;
}

export interface QuickNavState {
  isOpen: boolean;
  query: string;
  results: QuickNavResult[];
  
  // History
  recentItems: QuickNavResult[];
  favoriteItems: QuickNavResult[];
  
  // Configuration
  maxResults: number;
  searchDelay: number;
  categories: QuickNavCategory[];
}

// Modal & Overlay Types
export interface ModalState {
  modals: UIModal[];
  activeModal: string | null;
  modalHistory: string[];
  
  // Configuration
  maxModals: number;
  allowMultiple: boolean;
  closeOnEscape: boolean;
  closeOnBackdrop: boolean;
  
  // Backdrop
  backdrop: BackdropConfig;
}

export interface UIModal {
  id: string;
  type: ModalType;
  title: string;
  component: string;
  
  // Props & Data
  props: Record<string, any>;
  data: Record<string, any>;
  
  // Configuration
  config: ModalConfig;
  
  // State
  isOpen: boolean;
  isLoading: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  
  // Position & Size
  position: ModalPosition;
  size: ModalSize;
  
  // Behavior
  behavior: ModalBehavior;
  
  // Lifecycle
  lifecycle: ModalLifecycle;
}

export interface ModalConfig {
  // Appearance
  backdrop: boolean;
  backdropBlur: boolean;
  borderRadius: string;
  shadow: string;
  
  // Behavior
  draggable: boolean;
  resizable: boolean;
  closable: boolean;
  minimizable: boolean;
  maximizable: boolean;
  
  // Interaction
  closeOnEscape: boolean;
  closeOnBackdrop: boolean;
  trapFocus: boolean;
  restoreFocus: boolean;
  
  // Animation
  animation: AnimationConfig;
  
  // Responsive
  responsive: boolean;
  mobileFullscreen: boolean;
}

export interface BackdropConfig {
  color: string;
  opacity: number;
  blur: number;
  clickThrough: boolean;
  animation: AnimationConfig;
}

// Notification & Alert Types
export interface NotificationState {
  notifications: UINotification[];
  
  // Configuration
  position: NotificationPosition;
  maxNotifications: number;
  defaultDuration: number;
  
  // Grouping
  groupSimilar: boolean;
  groupThreshold: number;
  
  // Persistence
  persistAcrossReloads: boolean;
  
  // Sound & Haptics
  soundEnabled: boolean;
  hapticsEnabled: boolean;
}

export interface UINotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  
  // Appearance
  icon?: string;
  color?: string;
  avatar?: string;
  
  // Behavior
  duration: number | null; // null = persistent
  dismissible: boolean;
  pauseOnHover: boolean;
  
  // Actions
  actions: NotificationAction[];
  
  // Metadata
  timestamp: string;
  source?: string;
  category?: string;
  tags: string[];
  
  // Progress
  progress?: {
    value: number;
    max: number;
    showProgress: boolean;
  };
  
  // State
  isRead: boolean;
  isPinned: boolean;
  isExpanded: boolean;
}

export interface NotificationAction {
  id: string;
  label: string;
  style: 'primary' | 'secondary' | 'danger' | 'ghost';
  handler: string | (() => void);
  closeOnClick: boolean;
}

// Loading & Progress Types
export interface LoadingState {
  // Global Loading
  global: {
    isLoading: boolean;
    message?: string;
    progress?: ProgressInfo;
  };
  
  // Component Loading
  components: Record<string, LoadingInfo>;
  
  // Route Loading
  route: {
    isLoading: boolean;
    loadingRoute?: string;
    progress?: number;
  };
  
  // Operation Loading
  operations: Record<string, OperationInfo>;
}

export interface LoadingInfo {
  isLoading: boolean;
  message?: string;
  startTime: string;
  duration?: number;
  progress?: ProgressInfo;
}

export interface ProgressInfo {
  value: number;
  max: number;
  unit?: string;
  showPercentage: boolean;
  showValue: boolean;
  animated: boolean;
}

export interface OperationInfo extends LoadingInfo {
  operation: string;
  cancellable: boolean;
  cancelHandler?: () => void;
}

// Form & Input Types
export interface FormState {
  forms: Record<string, FormInfo>;
  activeForm?: string;
  
  // Validation
  validation: ValidationState;
  
  // Auto-save
  autoSave: AutoSaveConfig;
}

export interface FormInfo {
  id: string;
  name: string;
  fields: Record<string, FieldInfo>;
  
  // State
  isDirty: boolean;
  isValid: boolean;
  isSubmitting: boolean;
  isSubmitted: boolean;
  
  // Validation
  errors: Record<string, FieldError[]>;
  warnings: Record<string, FieldError[]>;
  
  // Values
  initialValues: Record<string, any>;
  values: Record<string, any>;
  
  // Configuration
  config: FormConfig;
}

export interface FieldInfo {
  name: string;
  type: string;
  value: any;
  
  // State
  isDirty: boolean;
  isTouched: boolean;
  isFocused: boolean;
  isDisabled: boolean;
  
  // Validation
  isValid: boolean;
  errors: FieldError[];
  warnings: FieldError[];
  
  // Configuration
  config: FieldConfig;
}

export interface ValidationState {
  mode: 'onChange' | 'onBlur' | 'onSubmit';
  reValidateMode: 'onChange' | 'onBlur' | 'onSubmit';
  
  // Global Validation
  globalErrors: string[];
  
  // Custom Validators
  validators: Record<string, ValidatorFunction>;
  
  // Async Validation
  asyncValidation: Record<string, AsyncValidationInfo>;
}

export interface AsyncValidationInfo {
  isValidating: boolean;
  debounceMs: number;
  abortController?: AbortController;
}

// Responsive Design Types
export interface ResponsiveState {
  // Current Breakpoint
  currentBreakpoint: Breakpoint;
  
  // Screen Information
  screen: {
    width: number;
    height: number;
    availableWidth: number;
    availableHeight: number;
    orientation: 'portrait' | 'landscape';
    devicePixelRatio: number;
  };
  
  // Device Information
  device: {
    type: DeviceType;
    isMobile: boolean;
    isTablet: boolean;
    isDesktop: boolean;
    isTouchDevice: boolean;
    supportsHover: boolean;
  };
  
  // Breakpoint Configuration
  breakpoints: BreakpointConfig;
  
  // Container Queries
  containers: Record<string, ContainerInfo>;
  
  // Media Features
  mediaFeatures: MediaFeatures;
}

export interface BreakpointConfig {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  '2xl': number;
}

export interface ContainerInfo {
  id: string;
  width: number;
  height: number;
  breakpoint: Breakpoint;
}

export interface MediaFeatures {
  prefersColorScheme: 'light' | 'dark' | 'no-preference';
  prefersReducedMotion: 'reduce' | 'no-preference';
  prefersContrast: 'high' | 'low' | 'no-preference';
  forcedColors: 'active' | 'none';
  invertedColors: 'inverted' | 'none';
}

// Interaction & Gesture Types
export interface InteractionState {
  // Mouse & Pointer
  pointer: {
    position: { x: number; y: number };
    isDown: boolean;
    button: number;
    buttons: number;
    pressure: number;
    tiltX: number;
    tiltY: number;
  };
  
  // Touch & Gestures
  touch: {
    touches: TouchInfo[];
    gestures: GestureInfo[];
    activeGesture?: string;
  };
  
  // Keyboard
  keyboard: {
    activeKeys: Set<string>;
    modifiers: KeyboardModifiers;
    lastKeyPressed?: string;
    lastKeyTime?: number;
  };
  
  // Hover & Focus
  hover: {
    hoveredElements: Set<string>;
    hoverDelay: number;
  };
  
  // Selection
  selection: {
    selectedElements: Set<string>;
    selectionMode: 'single' | 'multiple' | 'range';
    lastSelected?: string;
  };
}

export interface TouchInfo {
  id: number;
  clientX: number;
  clientY: number;
  pageX: number;
  pageY: number;
  radiusX: number;
  radiusY: number;
  rotationAngle: number;
  force: number;
}

export interface GestureInfo {
  type: GestureType;
  state: 'start' | 'move' | 'end' | 'cancel';
  target: string;
  
  // Gesture Data
  translation: { x: number; y: number };
  rotation: number;
  scale: number;
  velocity: { x: number; y: number };
  
  // Timing
  startTime: number;
  duration: number;
}

export interface KeyboardModifiers {
  alt: boolean;
  ctrl: boolean;
  meta: boolean;
  shift: boolean;
}

// Accessibility Types
export interface AccessibilityState {
  // Screen Reader
  screenReader: {
    enabled: boolean;
    announcements: AnnouncementInfo[];
    liveRegions: LiveRegionInfo[];
  };
  
  // Focus Management
  focusManagement: {
    focusVisible: boolean;
    trapFocus: boolean;
    restoreFocus: boolean;
    skipLinks: SkipLinkInfo[];
  };
  
  // High Contrast
  highContrast: {
    enabled: boolean;
    mode: 'increase' | 'decrease' | 'custom';
    customColors: Partial<ColorScheme>;
  };
  
  // Motion & Animation
  motion: {
    reducedMotion: boolean;
    respectSystemPreference: boolean;
    customAnimationDuration: number;
  };
  
  // Keyboard Navigation
  keyboardNav: {
    enabled: boolean;
    showFocusRings: boolean;
    customFocusStyles: boolean;
  };
  
  // Voice Control
  voiceControl: {
    enabled: boolean;
    commands: VoiceCommand[];
  };
}

export interface AnnouncementInfo {
  id: string;
  message: string;
  priority: 'assertive' | 'polite';
  timestamp: string;
}

export interface LiveRegionInfo {
  id: string;
  element: string;
  politeness: 'assertive' | 'polite' | 'off';
  atomic: boolean;
  relevant: string[];
}

export interface SkipLinkInfo {
  id: string;
  label: string;
  target: string;
  visible: boolean;
}

export interface VoiceCommand {
  phrase: string;
  action: string;
  enabled: boolean;
}

// Performance & Optimization Types
export interface PerformanceState {
  // Metrics
  metrics: PerformanceMetrics;
  
  // Optimization Settings
  optimization: OptimizationSettings;
  
  // Memory Management
  memory: MemoryInfo;
  
  // Bundle Analysis
  bundles: BundleInfo[];
  
  // Lazy Loading
  lazyLoading: LazyLoadingState;
}

export interface PerformanceMetrics {
  // Core Web Vitals
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  
  // Loading Metrics
  ttfb: number; // Time to First Byte
  fcp: number; // First Contentful Paint
  domContentLoaded: number;
  loadComplete: number;
  
  // Runtime Metrics
  taskTime: number;
  longTasks: number;
  jsHeapSize: number;
  renderingTime: number;
}

export interface OptimizationSettings {
  // Rendering
  rendering: {
    enableVirtualization: boolean;
    batchUpdates: boolean;
    deferNonCritical: boolean;
  };
  
  // Caching
  caching: {
    enableMemoryCache: boolean;
    enableDiskCache: boolean;
    cacheSize: number;
    cacheTTL: number;
  };
  
  // Images
  images: {
    enableLazyLoading: boolean;
    enableWebP: boolean;
    enableAVIF: boolean;
    compressionQuality: number;
  };
}

// Animation & Transition Types
export interface AnimationState {
  // Animation Registry
  animations: Record<string, AnimationInfo>;
  activeAnimations: Set<string>;
  
  // Global Settings
  globalSettings: {
    enabled: boolean;
    respectReducedMotion: boolean;
    defaultDuration: number;
    defaultEasing: string;
  };
  
  // Presets
  presets: AnimationPreset[];
  
  // Performance
  performance: {
    preferGPUAcceleration: boolean;
    enableWillChange: boolean;
    batchAnimations: boolean;
  };
}

export interface AnimationInfo {
  id: string;
  name: string;
  type: AnimationType;
  
  // Configuration
  duration: number;
  delay: number;
  easing: string;
  iterations: number | 'infinite';
  direction: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse';
  fillMode: 'none' | 'forwards' | 'backwards' | 'both';
  
  // State
  isRunning: boolean;
  isPaused: boolean;
  currentTime: number;
  
  // Callbacks
  onStart?: () => void;
  onEnd?: () => void;
  onIteration?: () => void;
}

export interface AnimationPreset {
  id: string;
  name: string;
  description: string;
  keyframes: Keyframe[];
  config: Partial<AnimationInfo>;
}

// Context Menu & Dropdown Types
export interface ContextMenuState {
  menus: ContextMenu[];
  activeMenu: string | null;
  
  // Configuration
  closeOnClick: boolean;
  closeOnScroll: boolean;
  closeDelay: number;
}

export interface ContextMenu {
  id: string;
  triggerId: string;
  
  // Position
  position: { x: number; y: number };
  anchor: 'mouse' | 'element';
  placement: PlacementType;
  
  // Items
  items: ContextMenuItem[];
  
  // State
  isOpen: boolean;
  
  // Configuration
  config: ContextMenuConfig;
}

export interface ContextMenuItem {
  id: string;
  type: 'item' | 'separator' | 'submenu' | 'group';
  label: string;
  icon?: string;
  
  // State
  disabled: boolean;
  checked?: boolean;
  
  // Action
  action?: string | (() => void);
  
  // Submenu
  submenu?: ContextMenuItem[];
  
  // Keyboard
  shortcut?: string;
  
  // Styling
  color?: string;
  variant?: 'default' | 'danger' | 'success';
}

// Drag & Drop Types
export interface DragDropState {
  // Active Operations
  isDragging: boolean;
  dragData: DragData | null;
  dropTargets: DropTarget[];
  
  // Configuration
  config: DragDropConfig;
  
  // Ghost Image
  ghostImage: {
    element?: HTMLElement;
    offset: { x: number; y: number };
  };
}

export interface DragData {
  id: string;
  type: string;
  data: any;
  
  // Source Information
  source: {
    id: string;
    type: string;
    index?: number;
  };
  
  // Visual Feedback
  preview: {
    element: HTMLElement;
    offset: { x: number; y: number };
  };
  
  // Allowed Operations
  allowedEffects: DropEffect[];
}

export interface DropTarget {
  id: string;
  element: HTMLElement;
  acceptedTypes: string[];
  
  // State
  isActive: boolean;
  isHovered: boolean;
  canDrop: boolean;
  
  // Configuration
  config: DropTargetConfig;
}

// Focus Management Types
export interface FocusState {
  // Current Focus
  currentFocus: string | null;
  focusHistory: string[];
  
  // Focus Traps
  focusTraps: FocusTrap[];
  activeTrap: string | null;
  
  // Focus Visible
  focusVisible: boolean;
  focusSource: 'mouse' | 'keyboard' | 'programmatic';
  
  // Tab Order
  tabOrder: TabOrderItem[];
  customTabOrder: boolean;
}

export interface FocusTrap {
  id: string;
  container: string;
  
  // Configuration
  initialFocus?: string;
  returnFocus?: string;
  allowClickOutside: boolean;
  
  // State
  isActive: boolean;
  
  // Focus Elements
  focusableElements: string[];
  firstFocusable?: string;
  lastFocusable?: string;
}

// Keyboard Shortcut Types
export interface ShortcutState {
  // Registered Shortcuts
  shortcuts: KeyboardShortcut[];
  
  // Global Shortcuts
  globalShortcuts: KeyboardShortcut[];
  
  // Context Shortcuts
  contextShortcuts: Record<string, KeyboardShortcut[]>;
  
  // State
  activeContext?: string;
  
  // Configuration
  config: ShortcutConfig;
}

export interface KeyboardShortcut {
  id: string;
  keys: string[];
  description: string;
  
  // Action
  action: string | (() => void);
  
  // Context
  context?: string;
  global: boolean;
  
  // State
  enabled: boolean;
  
  // Configuration
  preventDefault: boolean;
  stopPropagation: boolean;
  
  // Modifiers
  requireExactMatch: boolean;
  caseSensitive: boolean;
}

// Error Boundary & Recovery Types
export interface ErrorState {
  // Error Boundaries
  boundaries: ErrorBoundary[];
  
  // Global Errors
  globalErrors: UIError[];
  
  // Recovery Actions
  recoveryActions: RecoveryAction[];
  
  // Error Reporting
  reporting: {
    enabled: boolean;
    endpoint?: string;
    includeUserAgent: boolean;
    includeUrl: boolean;
    includeStackTrace: boolean;
  };
}

export interface ErrorBoundary {
  id: string;
  componentStack: string;
  
  // Error Information
  error: Error;
  errorInfo: any;
  
  // Recovery
  hasRecovered: boolean;
  recoveryAttempts: number;
  maxRecoveryAttempts: number;
  
  // Metadata
  timestamp: string;
  userId?: string;
  sessionId: string;
}

export interface UIError {
  id: string;
  type: ErrorType;
  message: string;
  
  // Context
  component?: string;
  action?: string;
  
  // Error Details
  stack?: string;
  cause?: Error;
  
  // User Impact
  severity: 'low' | 'medium' | 'high' | 'critical';
  recoverable: boolean;
  
  // Metadata
  timestamp: string;
  url: string;
  userAgent: string;
}

// Developer Tools & Debugging Types
export interface DevToolsState {
  // Development Mode
  isDevelopment: boolean;
  debugMode: boolean;
  
  // Performance Monitoring
  performanceMonitoring: {
    enabled: boolean;
    trackReRenders: boolean;
    trackStateChanges: boolean;
    trackAsyncOperations: boolean;
  };
  
  // Debug Information
  debugInfo: {
    componentTree: ComponentTreeNode[];
    stateHistory: StateHistoryEntry[];
    actionLog: ActionLogEntry[];
  };
  
  // Hot Reload
  hotReload: {
    enabled: boolean;
    preserveState: boolean;
  };
}

export interface ComponentTreeNode {
  id: string;
  name: string;
  type: string;
  
  // Hierarchy
  parentId?: string;
  children: ComponentTreeNode[];
  depth: number;
  
  // State
  props: Record<string, any>;
  state: Record<string, any>;
  
  // Performance
  renderCount: number;
  renderTime: number;
  lastRenderTime: string;
}

// Supporting Types
export type ThemeName = 'light' | 'dark' | 'auto' | string;
export type LayoutType = 'sidebar' | 'header' | 'dashboard' | 'fullscreen' | 'split' | 'tabs';
export type LayoutVariant = 'standard' | 'compact' | 'wide' | 'narrow' | 'custom';
export type SpacingValue = number | string | { top?: number; right?: number; bottom?: number; left?: number; };
export type ModalType = 'dialog' | 'drawer' | 'popup' | 'fullscreen' | 'inline';
export type ModalSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full' | 'auto' | { width: string; height: string; };
export type ModalPosition = 'center' | 'top' | 'bottom' | 'left' | 'right' | { x: number; y: number; };
export type NotificationType = 'success' | 'error' | 'warning' | 'info' | 'default';
export type NotificationPosition = 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
export type DeviceType = 'mobile' | 'tablet' | 'desktop' | 'tv' | 'watch' | 'unknown';
export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type GestureType = 'tap' | 'pan' | 'pinch' | 'rotate' | 'swipe' | 'long-press';
export type AnimationType = 'enter' | 'exit' | 'move' | 'scale' | 'fade' | 'slide' | 'flip' | 'bounce';
export type PlacementType = 'top' | 'bottom' | 'left' | 'right' | 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end';
export type DropEffect = 'copy' | 'move' | 'link' | 'none';
export type ErrorType = 'render' | 'network' | 'validation' | 'permission' | 'timeout' | 'unknown';

// Additional interfaces for completeness
export interface ActionItem {
  id: string;
  label: string;
  icon?: string;
  action: string | (() => void);
  disabled?: boolean;
  tooltip?: string;
}

export interface UserMenuItem {
  id: string;
  label: string;
  icon?: string;
  action: string | (() => void);
  separator?: boolean;
}

export interface SearchConfig {
  placeholder: string;
  showSuggestions: boolean;
  maxSuggestions: number;
  searchDelay: number;
}

export interface Breadcrumb {
  id: string;
  label: string;
  path: string;
  isActive: boolean;
}

export interface FooterLink {
  id: string;
  label: string;
  url: string;
  external: boolean;
}

export interface SocialLink {
  id: string;
  platform: string;
  url: string;
  icon: string;
}

export interface ContentSection {
  id: string;
  title?: string;
  component: string;
  props: Record<string, any>;
  order: number;
}

export interface UIPanel {
  id: string;
  title: string;
  component: string;
  props: Record<string, any>;
  position: PanelPosition;
  isOpen: boolean;
  isMinimized: boolean;
}

export interface GridConfig {
  columns: number;
  gap: SpacingValue;
}

export interface GridItem {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  component: string;
  props: Record<string, any>;
}

export interface NavigationHistoryItem {
  id: string;
  path: string;
  title: string;
  timestamp: string;
}

export interface QuickNavResult {
  id: string;
  title: string;
  description?: string;
  path: string;
  category: string;
  icon?: string;
  score: number;
}

export interface QuickNavCategory {
  id: string;
  label: string;
  icon: string;
  searchable: boolean;
}

export interface BadgeInfo {
  text: string;
  variant: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  pulse?: boolean;
}

export interface ModalBehavior {
  modal: boolean;
  persistent: boolean;
  focusTrap: boolean;
  restoreFocus: boolean;
}

export interface ModalLifecycle {
  createdAt: string;
  openedAt?: string;
  closedAt?: string;
  onBeforeOpen?: () => boolean;
  onAfterOpen?: () => void;
  onBeforeClose?: () => boolean;
  onAfterClose?: () => void;
}

export interface AnimationConfig {
  type: string;
  duration: number;
  easing: string;
  delay?: number;
}

export interface FieldError {
  type: string;
  message: string;
  params?: Record<string, any>;
}

export interface FormConfig {
  validateOn: 'change' | 'blur' | 'submit';
  reValidateOn: 'change' | 'blur' | 'submit';
  autoSave: boolean;
  autoSaveDelay: number;
}

export interface FieldConfig {
  required: boolean;
  disabled: boolean;
  readonly: boolean;
  placeholder?: string;
  validators: string[];
}

export interface AutoSaveConfig {
  enabled: boolean;
  interval: number;
  maxVersions: number;
  storageKey: string;
}

export interface ValidatorFunction {
  (value: any, field: string, form: Record<string, any>): string | boolean;
}

export interface ContextMenuConfig {
  closeOnClick: boolean;
  closeOnScroll: boolean;
  showIcons: boolean;
  showShortcuts: boolean;
}

export interface DragDropConfig {
  enableTouch: boolean;
  enableMouse: boolean;
  enableKeyboard: boolean;
  delay: number;
  threshold: number;
  ghostOpacity: number;
}

export interface DropTargetConfig {
  highlightOnHover: boolean;
  showDropIndicator: boolean;
  acceptMultiple: boolean;
}

export interface TabOrderItem {
  element: string;
  tabIndex: number;
  order: number;
}

export interface ShortcutConfig {
  enabled: boolean;
  showTooltips: boolean;
  captureGlobal: boolean;
}

export interface RecoveryAction {
  id: string;
  label: string;
  action: () => void;
  automatic: boolean;
}

export interface StateHistoryEntry {
  timestamp: string;
  action: string;
  state: any;
  diff: any;
}

export interface ActionLogEntry {
  timestamp: string;
  action: string;
  payload: any;
  source: string;
}

export interface MemoryInfo {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
  memoryPressure: 'low' | 'medium' | 'high' | 'critical';
}

export interface BundleInfo {
  name: string;
  size: number;
  gzipSize: number;
  loadTime: number;
  isLoaded: boolean;
}

export interface LazyLoadingState {
  pendingComponents: string[];
  loadedComponents: Set<string>;
  failedComponents: Set<string>;
}

export interface Keyframe {
  offset: number;
  styles: Record<string, string | number>;
  easing?: string;
}

export type PanelPosition = 'left' | 'right' | 'top' | 'bottom' | 'center' | 'floating';

// Store Actions Interface
export interface UIStoreActions {
  // Theme Actions
  setTheme: (theme: ThemeName) => void;
  updateColorScheme: (colors: Partial<ColorScheme>) => void;
  createCustomTheme: (theme: Omit<CustomTheme, 'id' | 'metadata'>) => void;
  deleteCustomTheme: (themeId: string) => void;
  
  // Layout Actions
  setLayout: (layout: LayoutType, config?: Partial<LayoutConfig>) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  updateSidebarWidth: (width: number) => void;
  
  // Navigation Actions
  navigate: (path: string, title?: string) => void;
  goBack: () => void;
  goForward: () => void;
  updateBreadcrumbs: (breadcrumbs: Breadcrumb[]) => void;
  openTab: (tab: Omit<TabInfo, 'id' | 'lastAccessed'>) => void;
  closeTab: (tabId: string) => void;
  switchTab: (tabId: string) => void;
  
  // Modal Actions
  openModal: (modal: Omit<UIModal, 'id' | 'lifecycle'>) => string;
  closeModal: (modalId: string) => void;
  updateModal: (modalId: string, updates: Partial<UIModal>) => void;
  minimizeModal: (modalId: string) => void;
  maximizeModal: (modalId: string) => void;
  
  // Notification Actions
  showNotification: (notification: Omit<UINotification, 'id' | 'timestamp'>) => string;
  hideNotification: (notificationId: string) => void;
  markNotificationRead: (notificationId: string) => void;
  clearAllNotifications: () => void;
  
  // Loading Actions
  setLoading: (key: string, loading: boolean, message?: string) => void;
  setProgress: (key: string, progress: ProgressInfo) => void;
  startOperation: (operation: string, cancellable?: boolean) => string;
  updateOperation: (operationId: string, progress: ProgressInfo) => void;
  completeOperation: (operationId: string) => void;
  cancelOperation: (operationId: string) => void;
  
  // Form Actions
  registerForm: (form: Omit<FormInfo, 'isDirty' | 'isValid' | 'errors' | 'warnings'>) => void;
  updateFormValue: (formId: string, fieldName: string, value: any) => void;
  validateForm: (formId: string) => boolean;
  submitForm: (formId: string) => void;
  resetForm: (formId: string) => void;
  
  // Responsive Actions
  updateScreenSize: (width: number, height: number) => void;
  setBreakpoint: (breakpoint: Breakpoint) => void;
  updateDeviceInfo: (device: Partial<ResponsiveState['device']>) => void;
  
  // Interaction Actions
  updatePointer: (position: { x: number; y: number }) => void;
  addTouch: (touch: TouchInfo) => void;
  removeTouch: (touchId: number) => void;
  startGesture: (gesture: Omit<GestureInfo, 'startTime' | 'duration'>) => void;
  updateGesture: (gestureId: string, updates: Partial<GestureInfo>) => void;
  endGesture: (gestureId: string) => void;
  
  // Accessibility Actions
  announce: (message: string, priority?: 'assertive' | 'polite') => void;
  setHighContrast: (enabled: boolean) => void;
  setReducedMotion: (enabled: boolean) => void;
  addSkipLink: (skipLink: SkipLinkInfo) => void;
  
  // Focus Actions
  setFocus: (elementId: string) => void;
  createFocusTrap: (trap: Omit<FocusTrap, 'isActive' | 'focusableElements'>) => void;
  activateFocusTrap: (trapId: string) => void;
  deactivateFocusTrap: (trapId: string) => void;
  
  // Animation Actions
  startAnimation: (animation: Omit<AnimationInfo, 'isRunning' | 'currentTime'>) => void;
  pauseAnimation: (animationId: string) => void;
  resumeAnimation: (animationId: string) => void;
  stopAnimation: (animationId: string) => void;
  
  // Context Menu Actions
  showContextMenu: (menu: Omit<ContextMenu, 'id' | 'isOpen'>) => string;
  hideContextMenu: (menuId?: string) => void;
  
  // Drag & Drop Actions
  startDrag: (dragData: Omit<DragData, 'id'>) => void;
  updateDrag: (position: { x: number; y: number }) => void;
  endDrag: (dropTargetId?: string) => void;
  registerDropTarget: (target: Omit<DropTarget, 'isActive' | 'isHovered' | 'canDrop'>) => void;
  unregisterDropTarget: (targetId: string) => void;
  
  // Keyboard Actions
  registerShortcut: (shortcut: KeyboardShortcut) => void;
  unregisterShortcut: (shortcutId: string) => void;
  setShortcutContext: (context: string) => void;
  
  // Error Actions
  reportError: (error: Error, component?: string, action?: string) => void;
  addRecoveryAction: (action: RecoveryAction) => void;
  clearErrors: () => void;
  
  // Performance Actions
  updateMetrics: (metrics: Partial<PerformanceMetrics>) => void;
  enableOptimization: (setting: keyof OptimizationSettings, enabled: boolean) => void;
  
  // Developer Tools Actions
  setDebugMode: (enabled: boolean) => void;
  logAction: (action: string, payload: any) => void;
  logStateChange: (state: any, diff: any) => void;
  
  // Utility Actions
  reset: () => void;
  updateConfig: (config: Partial<UIStoreState>) => void;
  batchUpdate: (updates: Array<{ action: string; payload: any }>) => void;
}

// Enhanced LoadingSpinner types
export type LoadingSpinnerState = 'loading' | 'success' | 'error' | 'warning' | 'idle';
export type LoadingSpinnerSize = 'sm' | 'md' | 'lg' | 'xl';

export interface EnhancedLoadingSpinnerProps {
  state?: LoadingSpinnerState;
  size?: LoadingSpinnerSize;
  color?: string;
  className?: string;
  showIcon?: boolean;
  duration?: number;
  autoTransition?: boolean;
  onComplete?: () => void;
  message?: string;
  progress?: ProgressInfo;
}

export interface StatefulSpinnerConfig {
  autoTransition?: boolean;
  successDuration?: number;
  errorDuration?: number;
  warningDuration?: number;
  idleDuration?: number;
  enableProgressBar?: boolean;
  enableMessages?: boolean;
  customIcons?: {
    loading?: string;
    success?: string;
    error?: string;
    warning?: string;
    idle?: string;
  };
}

export interface LoadingSpinnerAnimation {
  type: 'spin' | 'pulse' | 'bounce' | 'fade' | 'scale';
  duration: number;
  easing: string;
  iterations?: number | 'infinite';
}

// Toast Notification Types (enhanced, lighter-weight notification system)
export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading';
export type ToastPosition = 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
export type ToastVariant = 'filled' | 'outlined' | 'minimal';

export interface ToastNotification {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  variant?: ToastVariant;
  icon?: React.ReactNode | string;
  duration?: number | null; // null = persistent, 0 = no auto-dismiss
  dismissible?: boolean;
  pauseOnHover?: boolean;
  position?: ToastPosition;
  action?: ToastAction;
  onDismiss?: (id: string) => void;
  className?: string;
  ariaLabel?: string;
}

export interface ToastAction {
  label: string;
  onClick: () => void;
  style?: 'primary' | 'secondary' | 'ghost';
}

export interface ToastOptions {
  type?: ToastType;
  title?: string;
  variant?: ToastVariant;
  icon?: React.ReactNode | string;
  duration?: number | null;
  dismissible?: boolean;
  pauseOnHover?: boolean;
  position?: ToastPosition;
  action?: ToastAction;
  className?: string;
  ariaLabel?: string;
}

export interface ToastManagerConfig {
  maxToasts: number;
  defaultDuration: number;
  defaultPosition: ToastPosition;
  defaultVariant: ToastVariant;
  gutter: number; // Space between toasts
  containerOffset: number; // Offset from viewport edges
}

export interface ToastState {
  toasts: ToastNotification[];
  config: ToastManagerConfig;
}

// Combined Store Type
export interface UIStore extends UIStoreState, UIStoreActions {}