// UI Components Export Index
export {
  // Original components
  GlobalLoadingIndicator,
  OperationsIndicator,
  PageLoadingOverlay,
  InlineLoading,
  LoadingButton,
  LoadingIndicator,
  // Enhanced components
  EnhancedLoadingSpinner,
  StatefulSpinner,
  // Hooks
  useEnhancedSpinner,
  default as LoadingIndicatorDefault
} from './LoadingIndicator';

// Theme Provider
export { ThemeProvider, default as ThemeProviderDefault } from './ThemeProvider';

// Toast Notification System
export {
  ToastProvider,
  useToast,
  default as ToastProviderDefault
} from './ToastNotification';

// Notification Container (existing system)
export { 
  NotificationContainer,
  default as NotificationContainerDefault 
} from './NotificationContainer';

// Examples (for development/documentation)
export { default as LoadingSpinnerExamples } from './LoadingSpinnerExamples';
export { default as ToastExamples } from './ToastExamples';

// Re-export types for convenience
export type {
  LoadingSpinnerState,
  LoadingSpinnerSize,
  EnhancedLoadingSpinnerProps,
  StatefulSpinnerConfig,
  LoadingSpinnerAnimation,
  // Toast types
  ToastType,
  ToastPosition,
  ToastVariant,
  ToastNotification,
  ToastOptions,
  ToastAction,
  ToastManagerConfig,
  ToastState
} from '../../types/ui';