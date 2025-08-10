import type { ApiResponse } from '../types/api';

export interface ToastSystem {
  success: (message: string, options?: { duration?: number; actions?: { label: string; onClick: () => void }[] }) => void;
  error: (message: string, options?: { duration?: number; actions?: { label: string; onClick: () => void }[] }) => void;
  warning: (message: string, options?: { duration?: number; actions?: { label: string; onClick: () => void }[] }) => void;
  info: (message: string, options?: { duration?: number; actions?: { label: string; onClick: () => void }[] }) => void;
}

// Global toast instance - will be set by the app initialization
let globalToast: ToastSystem | null = null;

export const setGlobalToast = (toast: ToastSystem) => {
  globalToast = toast;
};

// Enhanced error handler that integrates with toast system
export class GlobalErrorHandler {
  private static instance: GlobalErrorHandler;
  
  private constructor() {}
  
  static getInstance(): GlobalErrorHandler {
    if (!GlobalErrorHandler.instance) {
      GlobalErrorHandler.instance = new GlobalErrorHandler();
    }
    return GlobalErrorHandler.instance;
  }
  
  // Handle API response errors
  handleApiError<T>(response: ApiResponse<T>, context?: string): void {
    if (!response.success && response.error) {
      const { code, message } = response.error;
      
      // Map error codes to user-friendly messages
      const userMessage = this.getErrorMessage(code, message, context);
      const retryAction = context ? { label: 'Retry', onClick: () => this.handleRetry(context) } : undefined;
      
      if (globalToast) {
        switch (code) {
          case 'TIMEOUT':
            globalToast.warning(userMessage, {
              duration: 5000,
              actions: retryAction ? [retryAction] : undefined
            });
            break;
          case 'NETWORK_ERROR':
            globalToast.error(userMessage, {
              duration: 6000,
              actions: retryAction ? [retryAction] : undefined
            });
            break;
          case 'VALIDATION_ERROR':
            globalToast.warning(userMessage, { duration: 4000 });
            break;
          case 'AUTHORIZATION_ERROR':
            globalToast.error(userMessage, {
              duration: 5000,
              actions: [{ label: 'Login', onClick: () => this.handleAuthError() }]
            });
            break;
          default:
            globalToast.error(userMessage, {
              duration: 4000,
              actions: retryAction ? [retryAction] : undefined
            });
        }
      }
      
      // Log error for debugging
      console.error(`API Error [${context || 'Unknown'}]:`, {
        code,
        message,
        details: response.error.details
      });
    }
  }
  
  // Handle generic application errors
  handleError(error: Error, context?: string): void {
    const message = `${context ? `${context}: ` : ''}${error.message}`;
    
    if (globalToast) {
      globalToast.error(message, { duration: 4000 });
    }
    
    console.error(`App Error [${context || 'Unknown'}]:`, error);
  }
  
  // Handle success operations
  handleSuccess(message: string, options?: {
    duration?: number;
    actions?: { label: string; onClick: () => void }[];
  }): void {
    if (globalToast) {
      globalToast.success(message, options);
    }
  }
  
  // Handle info notifications
  handleInfo(message: string, options?: {
    duration?: number;
    actions?: { label: string; onClick: () => void }[];
  }): void {
    if (globalToast) {
      globalToast.info(message, options);
    }
  }
  
  // Handle warnings
  handleWarning(message: string, options?: {
    duration?: number;
    actions?: { label: string; onClick: () => void }[];
  }): void {
    if (globalToast) {
      globalToast.warning(message, options);
    }
  }
  
  private getErrorMessage(code: string, originalMessage: string, context?: string): string {
    const errorMessages: Record<string, string> = {
      'TIMEOUT': 'Request timed out. Please check your connection and try again.',
      'NETWORK_ERROR': 'Network error occurred. Please check your internet connection.',
      'VALIDATION_ERROR': originalMessage || 'Invalid data provided.',
      'AUTHORIZATION_ERROR': 'Authentication required. Please log in again.',
      'API_ERROR': originalMessage || 'An error occurred while processing your request.',
      'UNKNOWN_ERROR': 'An unexpected error occurred. Please try again.',
    };
    
    const baseMessage = errorMessages[code] || originalMessage || 'An error occurred.';
    return context ? `${context}: ${baseMessage}` : baseMessage;
  }
  
  private handleRetry(context: string): void {
    if (globalToast) {
      globalToast.info(`Retrying ${context}...`, { duration: 2000 });
    }
    // In a real app, you'd implement retry logic here
    console.log(`Retry requested for: ${context}`);
  }
  
  private handleAuthError(): void {
    if (globalToast) {
      globalToast.info('Redirecting to login...', { duration: 2000 });
    }
    // In a real app, you'd redirect to login page
    console.log('Authentication error - redirect to login');
  }
}

// Export singleton instance
export const globalErrorHandler = GlobalErrorHandler.getInstance();

// Utility functions for common use cases
export const handleApiResponse = <T>(
  response: ApiResponse<T>, 
  context?: string,
  onSuccess?: (data: T) => void,
  onError?: (error: any) => void
): boolean => {
  if (response.success && response.data) {
    if (onSuccess) {
      onSuccess(response.data);
    }
    return true;
  } else {
    globalErrorHandler.handleApiError(response, context);
    if (onError && response.error) {
      onError(response.error);
    }
    return false;
  }
};

export const showSuccess = (message: string, options?: {
  duration?: number;
  actions?: { label: string; onClick: () => void }[];
}) => {
  globalErrorHandler.handleSuccess(message, options);
};

export const showError = (message: string, options?: {
  duration?: number;
  actions?: { label: string; onClick: () => void }[];
}) => {
  if (globalToast) {
    globalToast.error(message, options);
  }
};

export const showWarning = (message: string, options?: {
  duration?: number;
  actions?: { label: string; onClick: () => void }[];
}) => {
  globalErrorHandler.handleWarning(message, options);
};

export const showInfo = (message: string, options?: {
  duration?: number;
  actions?: { label: string; onClick: () => void }[];
}) => {
  globalErrorHandler.handleInfo(message, options);
};

// Error boundary helper for React components
export const withErrorHandling = <T extends (...args: any[]) => any>(
  fn: T,
  context?: string
): T => {
  return ((...args: any[]) => {
    try {
      const result = fn(...args);
      
      // Handle promises
      if (result && typeof result.catch === 'function') {
        return result.catch((error: Error) => {
          globalErrorHandler.handleError(error, context);
          throw error; // Re-throw so the caller can handle it if needed
        });
      }
      
      return result;
    } catch (error) {
      globalErrorHandler.handleError(error as Error, context);
      throw error; // Re-throw so the caller can handle it if needed
    }
  }) as T;
};

// Global unhandled error handlers
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    const error = event.error || new Error(event.message || 'Unknown error');
    globalErrorHandler.handleError(error, 'Global Error');
  });
  
  window.addEventListener('unhandledrejection', (event) => {
    globalErrorHandler.handleError(new Error(event.reason), 'Unhandled Promise Rejection');
  });
}