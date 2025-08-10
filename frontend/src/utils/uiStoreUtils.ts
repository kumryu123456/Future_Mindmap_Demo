import type {
  ThemeName,
  ColorScheme,
  ColorPalette,
  CustomTheme,
  LayoutType,
  LayoutConfig,
  UIModal,
  UINotification,
  NotificationType,
  Breakpoint,
  DeviceType,
  AnimationInfo,
  KeyboardShortcut,
  ContextMenu,
  FormInfo,
  FieldInfo,
  ProgressInfo,
  ResponsiveState,
  TouchInfo,
  GestureInfo,
  PerformanceMetrics
} from '../types/ui';

/**
 * UI Store Utilities
 * Helper functions for UI store state management and operations
 */

// Theme Utilities
export const ThemeUtils = {
  /**
   * Generate a color palette from a base color
   */
  generateColorPalette: (baseColor: string): ColorPalette => {
    // This is a simplified version - in practice, you'd use a color library
    const hsl = ThemeUtils.hexToHsl(baseColor);
    
    return {
      50: ThemeUtils.hslToHex(hsl.h, hsl.s * 0.1, 0.95),
      100: ThemeUtils.hslToHex(hsl.h, hsl.s * 0.2, 0.9),
      200: ThemeUtils.hslToHex(hsl.h, hsl.s * 0.3, 0.8),
      300: ThemeUtils.hslToHex(hsl.h, hsl.s * 0.4, 0.7),
      400: ThemeUtils.hslToHex(hsl.h, hsl.s * 0.6, 0.6),
      500: baseColor, // Base color
      600: ThemeUtils.hslToHex(hsl.h, hsl.s * 0.8, 0.45),
      700: ThemeUtils.hslToHex(hsl.h, hsl.s * 0.9, 0.35),
      800: ThemeUtils.hslToHex(hsl.h, hsl.s * 0.95, 0.25),
      900: ThemeUtils.hslToHex(hsl.h, hsl.s, 0.15),
      950: ThemeUtils.hslToHex(hsl.h, hsl.s, 0.1)
    };
  },

  /**
   * Convert hex color to HSL
   */
  hexToHsl: (hex: string): { h: number; s: number; l: number } => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h: number, s: number;
    const l = (max + min) / 2;

    if (max === min) {
      h = s = 0; // Achromatic
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
        default: h = 0;
      }
      h /= 6;
    }

    return { h: h * 360, s, l };
  },

  /**
   * Convert HSL to hex
   */
  hslToHex: (h: number, s: number, l: number): string => {
    h /= 360;
    
    const hue2rgb = (p: number, q: number, t: number): number => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    const r = hue2rgb(p, q, h + 1/3);
    const g = hue2rgb(p, q, h);
    const b = hue2rgb(p, q, h - 1/3);

    const toHex = (c: number) => {
      const hex = Math.round(c * 255).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  },

  /**
   * Get contrast ratio between two colors
   */
  getContrastRatio: (color1: string, color2: string): number => {
    const luminance = (color: string): number => {
      const rgb = ThemeUtils.hexToRgb(color);
      const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(c => {
        c = c / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };

    const l1 = luminance(color1);
    const l2 = luminance(color2);
    const brightest = Math.max(l1, l2);
    const darkest = Math.min(l1, l2);

    return (brightest + 0.05) / (darkest + 0.05);
  },

  /**
   * Convert hex to RGB
   */
  hexToRgb: (hex: string): { r: number; g: number; b: number } => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return { r, g, b };
  },

  /**
   * Check if a color meets WCAG contrast requirements
   */
  meetsWCAG: (foreground: string, background: string, level: 'AA' | 'AAA' = 'AA'): boolean => {
    const ratio = ThemeUtils.getContrastRatio(foreground, background);
    return level === 'AA' ? ratio >= 4.5 : ratio >= 7;
  },

  /**
   * Get the appropriate text color (black or white) for a background
   */
  getTextColor: (backgroundColor: string): string => {
    const whiteRatio = ThemeUtils.getContrastRatio('#ffffff', backgroundColor);
    const blackRatio = ThemeUtils.getContrastRatio('#000000', backgroundColor);
    return whiteRatio > blackRatio ? '#ffffff' : '#000000';
  },

  /**
   * Validate theme configuration
   */
  validateTheme: (theme: Partial<CustomTheme>): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!theme.name) {
      errors.push('Theme name is required');
    }

    if (!theme.colors) {
      errors.push('Color scheme is required');
    } else {
      // Validate color contrast
      const { colors } = theme;
      if (colors.primary && colors.neutral) {
        const textOnPrimary = ThemeUtils.getTextColor(colors.primary[500]);
        if (!ThemeUtils.meetsWCAG(textOnPrimary, colors.primary[500])) {
          errors.push('Primary color does not meet WCAG contrast requirements');
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
};

// Layout Utilities
export const LayoutUtils = {
  /**
   * Calculate layout dimensions
   */
  calculateDimensions: (
    screenWidth: number,
    screenHeight: number,
    layout: LayoutConfig
  ): {
    sidebar: { width: number; height: number };
    header: { width: number; height: number };
    footer: { width: number; height: number };
    content: { width: number; height: number };
  } => {
    const sidebarWidth = layout.type === 'sidebar' ? 280 : 0;
    const headerHeight = ['header', 'dashboard'].includes(layout.type) ? 64 : 0;
    const footerHeight = layout.type === 'dashboard' ? 48 : 0;

    return {
      sidebar: { width: sidebarWidth, height: screenHeight },
      header: { width: screenWidth, height: headerHeight },
      footer: { width: screenWidth, height: footerHeight },
      content: {
        width: screenWidth - sidebarWidth,
        height: screenHeight - headerHeight - footerHeight
      }
    };
  },

  /**
   * Get responsive layout configuration
   */
  getResponsiveLayout: (breakpoint: Breakpoint, baseLayout: LayoutType): LayoutConfig => {
    const isMobile = ['xs', 'sm'].includes(breakpoint);
    const isTablet = breakpoint === 'md';

    if (isMobile) {
      return {
        type: baseLayout === 'fullscreen' ? 'fullscreen' : 'header',
        variant: 'compact',
        density: 'compact',
        alignment: 'left',
        maxWidth: '100%',
        padding: 16,
        margin: 0
      };
    }

    if (isTablet) {
      return {
        type: baseLayout,
        variant: 'standard',
        density: 'comfortable',
        alignment: 'left',
        maxWidth: '100%',
        padding: 24,
        margin: 0
      };
    }

    return {
      type: baseLayout,
      variant: 'wide',
      density: 'spacious',
      alignment: 'center',
      maxWidth: '1200px',
      padding: 32,
      margin: 'auto'
    };
  },

  /**
   * Check if layout supports feature
   */
  supportsFeature: (layout: LayoutType, feature: string): boolean => {
    const features = {
      sidebar: ['navigation', 'panels', 'collapsible'],
      header: ['navigation', 'search', 'actions'],
      dashboard: ['widgets', 'panels', 'grid'],
      fullscreen: ['immersive'],
      split: ['dual-pane', 'resizable'],
      tabs: ['multiple-views', 'closeable']
    };

    return features[layout]?.includes(feature) || false;
  }
};

// Modal Utilities
export const ModalUtils = {
  /**
   * Generate modal ID
   */
  generateId: (prefix = 'modal'): string => {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  },

  /**
   * Calculate modal position
   */
  calculatePosition: (
    modal: { size: UIModal['size']; position: UIModal['position'] },
    viewport: { width: number; height: number }
  ): { x: number; y: number; width: number; height: number } => {
    let width = 500;
    let height = 400;

    // Calculate size
    if (typeof modal.size === 'string') {
      const sizes = {
        xs: { width: 320, height: 200 },
        sm: { width: 400, height: 300 },
        md: { width: 500, height: 400 },
        lg: { width: 700, height: 500 },
        xl: { width: 900, height: 600 },
        full: { width: viewport.width * 0.9, height: viewport.height * 0.9 },
        auto: { width: 500, height: 400 }
      };
      const size = sizes[modal.size] || sizes.md;
      width = size.width;
      height = size.height;
    } else if (typeof modal.size === 'object') {
      width = parseInt(modal.size.width) || 500;
      height = parseInt(modal.size.height) || 400;
    }

    // Calculate position
    let x = (viewport.width - width) / 2;
    let y = (viewport.height - height) / 2;

    if (typeof modal.position === 'string') {
      switch (modal.position) {
        case 'top':
          y = viewport.height * 0.1;
          break;
        case 'bottom':
          y = viewport.height - height - viewport.height * 0.1;
          break;
        case 'left':
          x = viewport.width * 0.1;
          break;
        case 'right':
          x = viewport.width - width - viewport.width * 0.1;
          break;
        default: // center
          break;
      }
    } else if (typeof modal.position === 'object') {
      x = modal.position.x;
      y = modal.position.y;
    }

    return { x, y, width, height };
  },

  /**
   * Check if modal can be displayed
   */
  canDisplay: (modal: UIModal, activeModals: UIModal[]): boolean => {
    // Check max modals limit
    const openModals = activeModals.filter(m => m.isOpen);
    if (openModals.length >= 5) return false; // Max 5 modals

    // Check for blocking modals
    const blockingModal = openModals.find(m => 
      m.behavior.modal && !m.config.allowClickOutside
    );
    if (blockingModal && blockingModal.id !== modal.id) return false;

    return true;
  }
};

// Notification Utilities
export const NotificationUtils = {
  /**
   * Generate notification ID
   */
  generateId: (): string => {
    return `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  },

  /**
   * Get notification icon
   */
  getDefaultIcon: (type: NotificationType): string => {
    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️',
      default: '📋'
    };
    return icons[type];
  },

  /**
   * Get notification color
   */
  getDefaultColor: (type: NotificationType): string => {
    const colors = {
      success: '#10b981',
      error: '#ef4444',
      warning: '#f59e0b',
      info: '#3b82f6',
      default: '#6b7280'
    };
    return colors[type];
  },

  /**
   * Calculate notification duration
   */
  calculateDuration: (type: NotificationType, messageLength: number): number => {
    const baseDuration = {
      success: 4000,
      error: 0, // Persistent
      warning: 6000,
      info: 5000,
      default: 4000
    };

    const base = baseDuration[type];
    if (base === 0) return 0; // Persistent

    // Add time based on message length
    const readingTime = Math.max(messageLength * 50, 0); // 50ms per character
    return base + readingTime;
  },

  /**
   * Group similar notifications
   */
  groupNotifications: (
    notifications: UINotification[],
    threshold = 3
  ): Array<UINotification | { type: 'group'; notifications: UINotification[]; count: number }> => {
    const groups = new Map<string, UINotification[]>();
    const ungrouped: UINotification[] = [];

    notifications.forEach(notification => {
      const key = `${notification.type}-${notification.title}`;
      
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(notification);
    });

    const result: Array<UINotification | { type: 'group'; notifications: UINotification[]; count: number }> = [];

    groups.forEach(group => {
      if (group.length >= threshold) {
        result.push({
          type: 'group',
          notifications: group,
          count: group.length
        });
      } else {
        result.push(...group);
      }
    });

    return result;
  },

  /**
   * Format notification timestamp
   */
  formatTimestamp: (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    
    return date.toLocaleDateString();
  }
};

// Responsive Utilities
export const ResponsiveUtils = {
  /**
   * Get breakpoint from width
   */
  getBreakpoint: (width: number, breakpoints: ResponsiveState['breakpoints']): Breakpoint => {
    if (width >= breakpoints['2xl']) return '2xl';
    if (width >= breakpoints.xl) return 'xl';
    if (width >= breakpoints.lg) return 'lg';
    if (width >= breakpoints.md) return 'md';
    if (width >= breakpoints.sm) return 'sm';
    return 'xs';
  },

  /**
   * Check if breakpoint is up (greater than or equal)
   */
  isBreakpointUp: (current: Breakpoint, target: Breakpoint): boolean => {
    const order = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];
    return order.indexOf(current) >= order.indexOf(target);
  },

  /**
   * Check if breakpoint is down (less than or equal)
   */
  isBreakpointDown: (current: Breakpoint, target: Breakpoint): boolean => {
    const order = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];
    return order.indexOf(current) <= order.indexOf(target);
  },

  /**
   * Get device type from user agent
   */
  getDeviceType: (userAgent: string): DeviceType => {
    if (/Mobile|Android|iPhone|iPad/.test(userAgent)) {
      if (/iPad/.test(userAgent) || (/Android/.test(userAgent) && !/Mobile/.test(userAgent))) {
        return 'tablet';
      }
      return 'mobile';
    }
    if (/TV|SmartTV/.test(userAgent)) return 'tv';
    if (/Watch/.test(userAgent)) return 'watch';
    return 'desktop';
  },

  /**
   * Check if device supports hover
   */
  supportsHover: (): boolean => {
    return window.matchMedia('(hover: hover)').matches;
  },

  /**
   * Check if device supports touch
   */
  supportsTouch: (): boolean => {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  },

  /**
   * Get device pixel ratio
   */
  getDevicePixelRatio: (): number => {
    return window.devicePixelRatio || 1;
  }
};

// Form Utilities
export const FormUtils = {
  /**
   * Validate field value
   */
  validateField: (value: any, validators: string[]): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    validators.forEach(validator => {
      switch (validator) {
        case 'required':
          if (!value || (typeof value === 'string' && value.trim() === '')) {
            errors.push('This field is required');
          }
          break;
        case 'email':
          if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            errors.push('Please enter a valid email address');
          }
          break;
        case 'url':
          if (value && !/^https?:\/\/.+$/.test(value)) {
            errors.push('Please enter a valid URL');
          }
          break;
        case 'phone':
          if (value && !/^\+?[\d\s\-\(\)]+$/.test(value)) {
            errors.push('Please enter a valid phone number');
          }
          break;
        case 'min-length-8':
          if (value && value.length < 8) {
            errors.push('Must be at least 8 characters long');
          }
          break;
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  /**
   * Check if form is dirty
   */
  isFormDirty: (form: FormInfo): boolean => {
    return Object.keys(form.values).some(key => 
      form.values[key] !== form.initialValues[key]
    );
  },

  /**
   * Get form validation summary
   */
  getValidationSummary: (form: FormInfo): {
    isValid: boolean;
    errorCount: number;
    warningCount: number;
    fieldErrors: Record<string, string[]>;
  } => {
    const fieldErrors: Record<string, string[]> = {};
    let errorCount = 0;
    let warningCount = 0;

    Object.entries(form.errors).forEach(([field, errors]) => {
      if (errors.length > 0) {
        fieldErrors[field] = errors.map(error => error.message);
        errorCount += errors.length;
      }
    });

    Object.entries(form.warnings).forEach(([field, warnings]) => {
      warningCount += warnings.length;
    });

    return {
      isValid: errorCount === 0,
      errorCount,
      warningCount,
      fieldErrors
    };
  }
};

// Animation Utilities
export const AnimationUtils = {
  /**
   * Get CSS easing function
   */
  getEasingFunction: (easing: string): string => {
    const easings = {
      linear: 'linear',
      ease: 'ease',
      'ease-in': 'ease-in',
      'ease-out': 'ease-out',
      'ease-in-out': 'ease-in-out',
      'bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      'elastic': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      'back': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)'
    };
    return easings[easing as keyof typeof easings] || easing;
  },

  /**
   * Check if animations should be disabled
   */
  shouldDisableAnimations: (): boolean => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  },

  /**
   * Get animation duration based on distance
   */
  getDurationForDistance: (distance: number, speed = 200): number => {
    // Calculate duration based on distance (pixels) and speed (pixels/second)
    return Math.min(Math.max(distance / speed * 1000, 150), 500); // Min 150ms, max 500ms
  },

  /**
   * Create keyframes for common animations
   */
  createKeyframes: (type: string, options: any = {}): any[] => {
    switch (type) {
      case 'fadeIn':
        return [{ opacity: 0 }, { opacity: 1 }];
      case 'fadeOut':
        return [{ opacity: 1 }, { opacity: 0 }];
      case 'slideInLeft':
        return [
          { transform: `translateX(-${options.distance || 100}%)` },
          { transform: 'translateX(0)' }
        ];
      case 'slideInRight':
        return [
          { transform: `translateX(${options.distance || 100}%)` },
          { transform: 'translateX(0)' }
        ];
      case 'slideInUp':
        return [
          { transform: `translateY(${options.distance || 100}%)` },
          { transform: 'translateY(0)' }
        ];
      case 'slideInDown':
        return [
          { transform: `translateY(-${options.distance || 100}%)` },
          { transform: 'translateY(0)' }
        ];
      case 'scaleIn':
        return [
          { transform: 'scale(0)', opacity: 0 },
          { transform: 'scale(1)', opacity: 1 }
        ];
      case 'scaleOut':
        return [
          { transform: 'scale(1)', opacity: 1 },
          { transform: 'scale(0)', opacity: 0 }
        ];
      default:
        return [{ opacity: 0 }, { opacity: 1 }];
    }
  }
};

// Performance Utilities
export const PerformanceUtils = {
  /**
   * Measure performance metric
   */
  measureMetric: (name: string, fn: () => void): number => {
    const start = performance.now();
    fn();
    const end = performance.now();
    return end - start;
  },

  /**
   * Check memory pressure
   */
  getMemoryPressure: (memoryInfo: any): 'low' | 'medium' | 'high' | 'critical' => {
    if (!memoryInfo) return 'low';
    
    const { usedJSHeapSize, jsHeapSizeLimit } = memoryInfo;
    const usage = usedJSHeapSize / jsHeapSizeLimit;
    
    if (usage > 0.9) return 'critical';
    if (usage > 0.75) return 'high';
    if (usage > 0.5) return 'medium';
    return 'low';
  },

  /**
   * Throttle function calls
   */
  throttle: <T extends (...args: any[]) => void>(func: T, delay: number): T => {
    let timeoutId: NodeJS.Timeout | null = null;
    let lastExecTime = 0;
    
    return ((...args: any[]) => {
      const currentTime = Date.now();
      
      if (currentTime - lastExecTime > delay) {
        func(...args);
        lastExecTime = currentTime;
      } else if (!timeoutId) {
        timeoutId = setTimeout(() => {
          func(...args);
          lastExecTime = Date.now();
          timeoutId = null;
        }, delay - (currentTime - lastExecTime));
      }
    }) as T;
  },

  /**
   * Debounce function calls
   */
  debounce: <T extends (...args: any[]) => void>(func: T, delay: number): T => {
    let timeoutId: NodeJS.Timeout | null = null;
    
    return ((...args: any[]) => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    }) as T;
  },

  /**
   * Batch DOM operations
   */
  batchDOMOperations: (operations: (() => void)[]): void => {
    requestAnimationFrame(() => {
      operations.forEach(operation => operation());
    });
  },

  /**
   * Check if should enable optimizations
   */
  shouldOptimize: (metrics: PerformanceMetrics): boolean => {
    return (
      metrics.renderingTime > 16 || // 60fps = 16.67ms per frame
      metrics.longTasks > 5 ||
      metrics.jsHeapSize > 50 * 1024 * 1024 // 50MB
    );
  }
};

// Accessibility Utilities
export const AccessibilityUtils = {
  /**
   * Generate accessible ID
   */
  generateId: (prefix = 'ui-element'): string => {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  },

  /**
   * Check if element is focusable
   */
  isFocusable: (element: Element): boolean => {
    const focusableElements = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ];

    return focusableElements.some(selector => element.matches(selector));
  },

  /**
   * Get all focusable elements within a container
   */
  getFocusableElements: (container: Element): Element[] => {
    const selector = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ].join(', ');

    return Array.from(container.querySelectorAll(selector))
      .filter(el => !el.hasAttribute('hidden') && el.getAttribute('aria-hidden') !== 'true');
  },

  /**
   * Create accessible description
   */
  createDescription: (element: Element, description: string): string => {
    const descriptionId = AccessibilityUtils.generateId('desc');
    const descriptionEl = document.createElement('div');
    descriptionEl.id = descriptionId;
    descriptionEl.className = 'sr-only';
    descriptionEl.textContent = description;
    
    element.appendChild(descriptionEl);
    element.setAttribute('aria-describedby', descriptionId);
    
    return descriptionId;
  },

  /**
   * Announce to screen readers
   */
  announce: (message: string, priority: 'polite' | 'assertive' = 'polite'): void => {
    const announcer = document.createElement('div');
    announcer.setAttribute('aria-live', priority);
    announcer.setAttribute('aria-atomic', 'true');
    announcer.className = 'sr-only';
    
    document.body.appendChild(announcer);
    
    // Delay to ensure screen reader picks it up
    setTimeout(() => {
      announcer.textContent = message;
    }, 100);
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(announcer);
    }, 1000);
  },

  /**
   * Check WCAG compliance
   */
  checkWCAG: (element: Element): { passed: boolean; issues: string[] } => {
    const issues: string[] = [];

    // Check for alt text on images
    if (element.tagName === 'IMG' && !element.getAttribute('alt')) {
      issues.push('Image missing alt attribute');
    }

    // Check for labels on form inputs
    if (['INPUT', 'SELECT', 'TEXTAREA'].includes(element.tagName)) {
      const hasLabel = element.getAttribute('aria-label') || 
                      element.getAttribute('aria-labelledby') ||
                      document.querySelector(`label[for="${element.id}"]`);
      if (!hasLabel) {
        issues.push('Form control missing label');
      }
    }

    // Check for sufficient color contrast
    const style = getComputedStyle(element);
    const color = style.color;
    const backgroundColor = style.backgroundColor;
    
    if (color && backgroundColor && color !== backgroundColor) {
      // This would require a color contrast calculation
      // For now, just warn if colors are set
      if (!ThemeUtils.meetsWCAG(color, backgroundColor)) {
        issues.push('Insufficient color contrast');
      }
    }

    return {
      passed: issues.length === 0,
      issues
    };
  }
};

// Export all utilities
export const UIStoreUtils = {
  Theme: ThemeUtils,
  Layout: LayoutUtils,
  Modal: ModalUtils,
  Notification: NotificationUtils,
  Responsive: ResponsiveUtils,
  Form: FormUtils,
  Animation: AnimationUtils,
  Performance: PerformanceUtils,
  Accessibility: AccessibilityUtils
};

export default UIStoreUtils;