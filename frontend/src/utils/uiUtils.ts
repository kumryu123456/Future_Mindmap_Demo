import type {
  UIStoreState,
  ColorScheme,
  ColorPalette,
  CustomColorPalette,
  ThemeName,
  CustomTheme,
  UIModal,
  UINotification,
  Breakpoint,
  ResponsiveState,
  PerformanceMetrics,
  AnimationInfo,
  KeyboardShortcut,
  ContextMenu,
  DragData,
  DropTarget,
  FocusTrap,
  UIError,
  ValidationState,
  FormInfo,
  FieldInfo
} from '../types/ui';

/**
 * UI utility functions for theme management, responsive design, and UI operations
 */
export class UIUtils {

  // Theme & Color Utilities
  /**
   * Generate color variations from a base color
   */
  static generateColorPalette(baseColor: string): ColorPalette {
    const hsl = this.hexToHsl(baseColor);
    
    return {
      50: this.hslToHex(hsl.h, Math.max(hsl.s - 50, 0), Math.min(hsl.l + 40, 95)),
      100: this.hslToHex(hsl.h, Math.max(hsl.s - 40, 5), Math.min(hsl.l + 35, 90)),
      200: this.hslToHex(hsl.h, Math.max(hsl.s - 30, 10), Math.min(hsl.l + 25, 85)),
      300: this.hslToHex(hsl.h, Math.max(hsl.s - 20, 15), Math.min(hsl.l + 15, 75)),
      400: this.hslToHex(hsl.h, Math.max(hsl.s - 10, 20), Math.min(hsl.l + 5, 65)),
      500: baseColor,
      600: this.hslToHex(hsl.h, Math.min(hsl.s + 10, 95), Math.max(hsl.l - 5, 35)),
      700: this.hslToHex(hsl.h, Math.min(hsl.s + 20, 95), Math.max(hsl.l - 15, 25)),
      800: this.hslToHex(hsl.h, Math.min(hsl.s + 25, 95), Math.max(hsl.l - 25, 15)),
      900: this.hslToHex(hsl.h, Math.min(hsl.s + 30, 95), Math.max(hsl.l - 35, 10)),
      950: this.hslToHex(hsl.h, Math.min(hsl.s + 35, 95), Math.max(hsl.l - 45, 5))
    };
  }

  /**
   * Convert hex to HSL
   */
  static hexToHsl(hex: string): { h: number; s: number; l: number } {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const diff = max - min;
    const sum = max + min;
    const l = sum / 2;

    let h = 0;
    let s = 0;

    if (diff !== 0) {
      s = l > 0.5 ? diff / (2 - sum) : diff / sum;

      switch (max) {
        case r:
          h = ((g - b) / diff) + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / diff + 2;
          break;
        case b:
          h = (r - g) / diff + 4;
          break;
      }
      h /= 6;
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  }

  /**
   * Convert HSL to hex
   */
  static hslToHex(h: number, s: number, l: number): string {
    h /= 360;
    s /= 100;
    l /= 100;

    const hueToRgb = (p: number, q: number, t: number): number => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    let r, g, b;

    if (s === 0) {
      r = g = b = l;
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hueToRgb(p, q, h + 1/3);
      g = hueToRgb(p, q, h);
      b = hueToRgb(p, q, h - 1/3);
    }

    const toHex = (c: number): string => {
      const hex = Math.round(c * 255).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }

  /**
   * Calculate contrast ratio between two colors
   */
  static calculateContrastRatio(color1: string, color2: string): number {
    const luminance1 = this.getLuminance(color1);
    const luminance2 = this.getLuminance(color2);
    
    const brighter = Math.max(luminance1, luminance2);
    const darker = Math.min(luminance1, luminance2);
    
    return (brighter + 0.05) / (darker + 0.05);
  }

  /**
   * Get relative luminance of a color
   */
  static getLuminance(hex: string): number {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const toLinear = (c: number) => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);

    return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
  }

  /**
   * Determine if a color is light or dark
   */
  static isLightColor(hex: string): boolean {
    return this.getLuminance(hex) > 0.5;
  }

  /**
   * Generate accessible text color for a background
   */
  static getAccessibleTextColor(backgroundColor: string, lightColor = '#ffffff', darkColor = '#000000'): string {
    const lightContrast = this.calculateContrastRatio(backgroundColor, lightColor);
    const darkContrast = this.calculateContrastRatio(backgroundColor, darkColor);
    
    return lightContrast >= darkContrast ? lightColor : darkColor;
  }

  /**
   * Validate theme configuration
   */
  static validateTheme(theme: CustomTheme): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check required fields
    if (!theme.name || theme.name.trim() === '') {
      errors.push('Theme name is required');
    }

    if (!theme.colors) {
      errors.push('Theme colors are required');
    } else {
      // Validate color scheme
      const requiredColors = ['primary', 'secondary', 'success', 'warning', 'error', 'info', 'neutral'];
      requiredColors.forEach(colorName => {
        if (!theme.colors[colorName as keyof ColorScheme]) {
          errors.push(`${colorName} color palette is required`);
        }
      });

      // Check contrast ratios
      if (theme.colors.primary && theme.colors.neutral) {
        const contrast = this.calculateContrastRatio(theme.colors.primary[500], theme.colors.neutral[50]);
        if (contrast < 3) {
          warnings.push('Primary color may have insufficient contrast with light backgrounds');
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Generate theme from base colors
   */
  static generateThemeFromColors(colors: {
    primary: string;
    secondary?: string;
    success?: string;
    warning?: string;
    error?: string;
    info?: string;
  }): ColorScheme {
    return {
      primary: this.generateColorPalette(colors.primary),
      secondary: this.generateColorPalette(colors.secondary || '#64748b'),
      success: this.generateColorPalette(colors.success || '#22c55e'),
      warning: this.generateColorPalette(colors.warning || '#f59e0b'),
      error: this.generateColorPalette(colors.error || '#ef4444'),
      info: this.generateColorPalette(colors.info || '#06b6d4'),
      neutral: this.generateColorPalette('#64748b')
    };
  }

  // Responsive Design Utilities
  /**
   * Get current breakpoint from screen width
   */
  static getBreakpointFromWidth(width: number, breakpoints: ResponsiveState['breakpoints']): Breakpoint {
    if (width >= breakpoints['2xl']) return '2xl';
    if (width >= breakpoints.xl) return 'xl';
    if (width >= breakpoints.lg) return 'lg';
    if (width >= breakpoints.md) return 'md';
    if (width >= breakpoints.sm) return 'sm';
    return 'xs';
  }

  /**
   * Check if device is mobile based on screen width and user agent
   */
  static isMobileDevice(width: number, userAgent?: string): boolean {
    const mobileBreakpoint = 768;
    const widthCheck = width <= mobileBreakpoint;
    
    if (userAgent) {
      const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
      return mobileRegex.test(userAgent);
    }
    
    return widthCheck;
  }

  /**
   * Calculate responsive spacing
   */
  static getResponsiveSpacing(
    baseSpacing: number,
    breakpoint: Breakpoint,
    scalingFactor = 1.2
  ): number {
    const breakpointMultipliers = {
      xs: 0.75,
      sm: 0.875,
      md: 1,
      lg: 1.125,
      xl: 1.25,
      '2xl': 1.5
    };

    return Math.round(baseSpacing * breakpointMultipliers[breakpoint] * scalingFactor);
  }

  /**
   * Generate responsive grid configuration
   */
  static generateResponsiveGrid(
    columns: { xs?: number; sm?: number; md?: number; lg?: number; xl?: number; '2xl'?: number },
    gap: number = 16
  ): ResponsiveState['responsive'] {
    return {
      sm: { columns: columns.sm || columns.xs || 4, gap },
      md: { columns: columns.md || columns.sm || 8, gap },
      lg: { columns: columns.lg || columns.md || 12, gap },
      xl: { columns: columns.xl || columns.lg || 12, gap }
    };
  }

  // Modal Management Utilities
  /**
   * Calculate optimal modal position
   */
  static calculateModalPosition(
    modalSize: { width: number; height: number },
    screenSize: { width: number; height: number },
    preferredPosition?: { x: number; y: number }
  ): { x: number; y: number } {
    const padding = 20;
    
    let x = preferredPosition?.x || (screenSize.width - modalSize.width) / 2;
    let y = preferredPosition?.y || (screenSize.height - modalSize.height) / 2;

    // Ensure modal stays within screen bounds
    x = Math.max(padding, Math.min(x, screenSize.width - modalSize.width - padding));
    y = Math.max(padding, Math.min(y, screenSize.height - modalSize.height - padding));

    return { x, y };
  }

  /**
   * Get modal z-index based on stack order
   */
  static getModalZIndex(stackOrder: number, baseZIndex = 1000): number {
    return baseZIndex + (stackOrder * 10);
  }

  /**
   * Validate modal configuration
   */
  static validateModal(modal: Partial<UIModal>): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!modal.title || modal.title.trim() === '') {
      errors.push('Modal title is required');
    }

    if (!modal.component || modal.component.trim() === '') {
      errors.push('Modal component is required');
    }

    if (modal.size && typeof modal.size === 'object') {
      if (!modal.size.width || !modal.size.height) {
        errors.push('Modal size must include both width and height');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Notification Management Utilities
  /**
   * Calculate notification position on screen
   */
  static calculateNotificationPosition(
    position: UIStoreState['notifications']['position'],
    index: number,
    notificationHeight: number = 80,
    spacing: number = 12,
    margin: number = 20
  ): { x: string; y: string } {
    const offset = (notificationHeight + spacing) * index;

    switch (position) {
      case 'top-left':
        return { x: `${margin}px`, y: `${margin + offset}px` };
      case 'top-center':
        return { x: '50%', y: `${margin + offset}px` };
      case 'top-right':
        return { x: `calc(100% - ${margin}px)`, y: `${margin + offset}px` };
      case 'bottom-left':
        return { x: `${margin}px`, y: `calc(100% - ${margin + notificationHeight + offset}px)` };
      case 'bottom-center':
        return { x: '50%', y: `calc(100% - ${margin + notificationHeight + offset}px)` };
      case 'bottom-right':
        return { x: `calc(100% - ${margin}px)`, y: `calc(100% - ${margin + notificationHeight + offset}px)` };
      default:
        return { x: `calc(100% - ${margin}px)`, y: `${margin + offset}px` };
    }
  }

  /**
   * Group similar notifications
   */
  static groupNotifications(
    notifications: UINotification[],
    groupThreshold: number = 3
  ): Array<UINotification | { type: 'group'; count: number; notifications: UINotification[] }> {
    const groups: Record<string, UINotification[]> = {};
    const ungrouped: UINotification[] = [];

    notifications.forEach(notification => {
      const key = `${notification.type}-${notification.title}`;
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(notification);
    });

    const result: Array<UINotification | { type: 'group'; count: number; notifications: UINotification[] }> = [];

    Object.entries(groups).forEach(([key, notificationGroup]) => {
      if (notificationGroup.length >= groupThreshold) {
        result.push({
          type: 'group',
          count: notificationGroup.length,
          notifications: notificationGroup
        });
      } else {
        result.push(...notificationGroup);
      }
    });

    return result;
  }

  // Animation Utilities
  /**
   * Calculate animation duration based on distance
   */
  static calculateAnimationDuration(
    distance: number,
    baseSpeed: number = 300, // pixels per second
    minDuration: number = 150,
    maxDuration: number = 500
  ): number {
    const calculatedDuration = (distance / baseSpeed) * 1000;
    return Math.max(minDuration, Math.min(maxDuration, calculatedDuration));
  }

  /**
   * Generate easing function
   */
  static getEasingFunction(type: string): string {
    const easings = {
      linear: 'linear',
      ease: 'ease',
      'ease-in': 'ease-in',
      'ease-out': 'ease-out',
      'ease-in-out': 'ease-in-out',
      'ease-in-sine': 'cubic-bezier(0.47, 0, 0.745, 0.715)',
      'ease-out-sine': 'cubic-bezier(0.39, 0.575, 0.565, 1)',
      'ease-in-quad': 'cubic-bezier(0.55, 0.085, 0.68, 0.53)',
      'ease-out-quad': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      'ease-in-cubic': 'cubic-bezier(0.55, 0.055, 0.675, 0.19)',
      'ease-out-cubic': 'cubic-bezier(0.215, 0.61, 0.355, 1)',
      'ease-in-back': 'cubic-bezier(0.6, -0.28, 0.735, 0.045)',
      'ease-out-back': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)'
    };

    return easings[type as keyof typeof easings] || 'ease-out';
  }

  /**
   * Check if reduced motion is preferred
   */
  static shouldReduceMotion(): boolean {
    return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches || false;
  }

  // Form & Validation Utilities
  /**
   * Validate form field
   */
  static validateField(
    value: any,
    validators: string[],
    customValidators: Record<string, (value: any) => string | boolean> = {}
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    validators.forEach(validator => {
      switch (validator) {
        case 'required':
          if (value === null || value === undefined || value === '') {
            errors.push('This field is required');
          }
          break;
        case 'email':
          if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            errors.push('Please enter a valid email address');
          }
          break;
        case 'minLength':
          if (value && typeof value === 'string' && value.length < 3) {
            errors.push('Minimum 3 characters required');
          }
          break;
        case 'maxLength':
          if (value && typeof value === 'string' && value.length > 255) {
            errors.push('Maximum 255 characters allowed');
          }
          break;
        case 'number':
          if (value && isNaN(Number(value))) {
            errors.push('Please enter a valid number');
          }
          break;
        case 'url':
          if (value && !/^https?:\/\/.+/.test(value)) {
            errors.push('Please enter a valid URL');
          }
          break;
        default:
          // Check custom validators
          if (customValidators[validator]) {
            const result = customValidators[validator](value);
            if (typeof result === 'string') {
              errors.push(result);
            } else if (!result) {
              errors.push(`Validation failed: ${validator}`);
            }
          }
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Debounce function for form validation
   */
  static debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }

  // Accessibility Utilities
  /**
   * Generate accessible ID
   */
  static generateAccessibleId(prefix: string = 'ui'): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get ARIA attributes for element
   */
  static getAriaAttributes(element: {
    role?: string;
    label?: string;
    describedBy?: string;
    expanded?: boolean;
    selected?: boolean;
    disabled?: boolean;
  }): Record<string, string | boolean> {
    const attributes: Record<string, string | boolean> = {};

    if (element.role) attributes.role = element.role;
    if (element.label) attributes['aria-label'] = element.label;
    if (element.describedBy) attributes['aria-describedby'] = element.describedBy;
    if (element.expanded !== undefined) attributes['aria-expanded'] = element.expanded;
    if (element.selected !== undefined) attributes['aria-selected'] = element.selected;
    if (element.disabled !== undefined) attributes['aria-disabled'] = element.disabled;

    return attributes;
  }

  /**
   * Check if element is focusable
   */
  static isFocusable(element: HTMLElement): boolean {
    if (element.tabIndex < 0) return false;
    if (element.hasAttribute('disabled')) return false;
    if (element.getAttribute('aria-hidden') === 'true') return false;

    const focusableSelectors = [
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'button:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ];

    return focusableSelectors.some(selector => element.matches(selector));
  }

  // Performance Utilities
  /**
   * Calculate performance score
   */
  static calculatePerformanceScore(metrics: PerformanceMetrics): {
    overall: number;
    scores: {
      loading: number;
      interactivity: number;
      visualStability: number;
    };
    grade: 'A' | 'B' | 'C' | 'D' | 'F';
  } {
    // Core Web Vitals scoring (Google's thresholds)
    const lcpScore = metrics.lcp <= 2500 ? 100 : metrics.lcp <= 4000 ? 50 : 0;
    const fidScore = metrics.fid <= 100 ? 100 : metrics.fid <= 300 ? 50 : 0;
    const clsScore = metrics.cls <= 0.1 ? 100 : metrics.cls <= 0.25 ? 50 : 0;

    // Additional loading metrics
    const fcpScore = metrics.fcp <= 1800 ? 100 : metrics.fcp <= 3000 ? 50 : 0;
    const ttfbScore = metrics.ttfb <= 800 ? 100 : metrics.ttfb <= 1800 ? 50 : 0;

    const loadingScore = (lcpScore + fcpScore + ttfbScore) / 3;
    const interactivityScore = fidScore;
    const visualStabilityScore = clsScore;

    const overallScore = (loadingScore + interactivityScore + visualStabilityScore) / 3;

    let grade: 'A' | 'B' | 'C' | 'D' | 'F' = 'F';
    if (overallScore >= 90) grade = 'A';
    else if (overallScore >= 80) grade = 'B';
    else if (overallScore >= 70) grade = 'C';
    else if (overallScore >= 60) grade = 'D';

    return {
      overall: Math.round(overallScore),
      scores: {
        loading: Math.round(loadingScore),
        interactivity: Math.round(interactivityScore),
        visualStability: Math.round(visualStabilityScore)
      },
      grade
    };
  }

  /**
   * Optimize image loading
   */
  static getOptimizedImageSrc(
    src: string,
    width: number,
    height: number,
    format: 'webp' | 'avif' | 'jpeg' | 'png' = 'webp',
    quality: number = 85
  ): string {
    // This would integrate with an image optimization service
    const params = new URLSearchParams({
      w: width.toString(),
      h: height.toString(),
      f: format,
      q: quality.toString()
    });

    // Example integration with image optimization service
    if (src.startsWith('http')) {
      return `${src}?${params.toString()}`;
    }

    return src;
  }

  // Layout Utilities
  /**
   * Calculate container dimensions
   */
  static calculateContainerDimensions(
    parentWidth: number,
    parentHeight: number,
    aspectRatio?: number,
    maxWidth?: number,
    maxHeight?: number
  ): { width: number; height: number } {
    let width = parentWidth;
    let height = parentHeight;

    if (aspectRatio) {
      if (parentWidth / parentHeight > aspectRatio) {
        width = parentHeight * aspectRatio;
      } else {
        height = parentWidth / aspectRatio;
      }
    }

    if (maxWidth && width > maxWidth) {
      width = maxWidth;
      if (aspectRatio) {
        height = width / aspectRatio;
      }
    }

    if (maxHeight && height > maxHeight) {
      height = maxHeight;
      if (aspectRatio) {
        width = height * aspectRatio;
      }
    }

    return { width: Math.round(width), height: Math.round(height) };
  }

  /**
   * Calculate grid item positions
   */
  static calculateGridLayout(
    items: Array<{ id: string; width: number; height: number }>,
    containerWidth: number,
    columns: number,
    gap: number = 16
  ): Array<{ id: string; x: number; y: number; width: number; height: number }> {
    const columnWidth = (containerWidth - (gap * (columns - 1))) / columns;
    const positions: Array<{ id: string; x: number; y: number; width: number; height: number }> = [];
    const columnHeights = new Array(columns).fill(0);

    items.forEach(item => {
      // Find column with least height
      const shortestColumnIndex = columnHeights.indexOf(Math.min(...columnHeights));
      
      const x = shortestColumnIndex * (columnWidth + gap);
      const y = columnHeights[shortestColumnIndex];
      
      const scaledWidth = Math.min(item.width, columnWidth);
      const scaledHeight = (item.height * scaledWidth) / item.width;

      positions.push({
        id: item.id,
        x,
        y,
        width: scaledWidth,
        height: scaledHeight
      });

      columnHeights[shortestColumnIndex] += scaledHeight + gap;
    });

    return positions;
  }

  // Utility Functions
  /**
   * Generate unique ID
   */
  static generateId(prefix: string = 'ui'): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Deep clone object
   */
  static deepClone<T>(obj: T): T {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime()) as any;
    if (obj instanceof Array) return obj.map(item => this.deepClone(item)) as any;
    if (obj instanceof Set) return new Set(Array.from(obj).map(item => this.deepClone(item))) as any;
    if (obj instanceof Map) {
      const clonedMap = new Map();
      obj.forEach((value, key) => {
        clonedMap.set(this.deepClone(key), this.deepClone(value));
      });
      return clonedMap as any;
    }
    if (typeof obj === 'object') {
      const clonedObj = {} as any;
      Object.keys(obj).forEach(key => {
        clonedObj[key] = this.deepClone((obj as any)[key]);
      });
      return clonedObj;
    }
    return obj;
  }

  /**
   * Throttle function
   */
  static throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  /**
   * Format file size
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Format duration
   */
  static formatDuration(ms: number): string {
    if (ms < 1000) return `${ms}ms`;
    
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }

  /**
   * Clamp value between min and max
   */
  static clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }

  /**
   * Linear interpolation
   */
  static lerp(start: number, end: number, factor: number): number {
    return start + (end - start) * this.clamp(factor, 0, 1);
  }

  /**
   * Map value from one range to another
   */
  static mapRange(
    value: number,
    inMin: number,
    inMax: number,
    outMin: number,
    outMax: number
  ): number {
    return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
  }

  /**
   * Check if value is empty
   */
  static isEmpty(value: any): boolean {
    if (value == null) return true;
    if (typeof value === 'string' || Array.isArray(value)) return value.length === 0;
    if (typeof value === 'object') return Object.keys(value).length === 0;
    return false;
  }

  /**
   * Capitalize string
   */
  static capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Convert string to kebab-case
   */
  static toKebabCase(str: string): string {
    return str
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .replace(/[\s_]+/g, '-')
      .toLowerCase();
  }

  /**
   * Convert string to camelCase
   */
  static toCamelCase(str: string): string {
    return str
      .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
        return index === 0 ? word.toLowerCase() : word.toUpperCase();
      })
      .replace(/\s+/g, '');
  }
}

export default UIUtils;