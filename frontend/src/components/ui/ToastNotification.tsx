import React, { useEffect, useState, useRef, useCallback, useContext } from 'react';
import { createPortal } from 'react-dom';
import type { 
  ToastNotification as ToastNotificationType,
  ToastType,
  ToastVariant,
  ToastPosition,
  ToastOptions,
  ToastManagerConfig,
  ToastAction
} from '../../types/ui';
import './ToastNotification.css';

// Default icons for each toast type
const DEFAULT_ICONS = {
  success: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
  ),
  error: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
    </svg>
  ),
  warning: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
  ),
  info: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
    </svg>
  ),
  loading: (
    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
    </svg>
  )
};

interface ToastItemProps {
  toast: ToastNotificationType;
  onDismiss: (id: string) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

const ToastItem: React.FC<ToastItemProps> = ({
  toast,
  onDismiss,
  onMouseEnter,
  onMouseLeave
}) => {
  const [isExiting, setIsExiting] = useState(false);
  const [progress, setProgress] = useState(100);
  const progressRef = useRef<number>(100);
  const intervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [startTime, setStartTime] = useState(() => Date.now());
  const [remainingTime, setRemainingTime] = useState<number | null>(toast.duration);

  // Define handleDismiss BEFORE useEffect to avoid hoisting issues
  const handleDismiss = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      onDismiss(toast.id);
    }, 200); // Match exit animation duration
  }, [toast.id, onDismiss]);

  // Handle auto-dismiss with progress - optimized to avoid frequent re-runs
  useEffect(() => {
    if (!toast.duration || isPaused) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    const currentStartTime = Date.now();
    setStartTime(currentStartTime);
    
    const updateInterval = 50; // Update every 50ms for smooth progress

    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - currentStartTime;
      const currentRemaining = Math.max(0, (toast.duration || 0) - elapsed);
      const newProgress = toast.duration ? (currentRemaining / toast.duration) * 100 : 0;
      
      progressRef.current = newProgress;
      setProgress(newProgress);

      if (currentRemaining <= 0) {
        handleDismiss();
      }
    }, updateInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isPaused, toast.duration, handleDismiss]); // Removed remainingTime and startTime from dependencies

  const handleMouseEnter = () => {
    if (toast.pauseOnHover) {
      setIsPaused(true);
      onMouseEnter();
    }
  };

  const handleMouseLeave = () => {
    if (toast.pauseOnHover) {
      setIsPaused(false);
      onMouseLeave();
    }
  };

  const getVariantStyles = (type: ToastType, variant: ToastVariant = 'filled') => {
    const baseStyles = 'shadow-lg rounded-lg border transition-all duration-200 ease-in-out';
    
    const variants = {
      filled: {
        success: `${baseStyles} bg-green-500 border-green-600 text-white`,
        error: `${baseStyles} bg-red-500 border-red-600 text-white`,
        warning: `${baseStyles} bg-yellow-500 border-yellow-600 text-white`,
        info: `${baseStyles} bg-blue-500 border-blue-600 text-white`,
        loading: `${baseStyles} bg-gray-500 border-gray-600 text-white`
      },
      outlined: {
        success: `${baseStyles} bg-white dark:bg-gray-800 border-green-500 text-green-700 dark:text-green-300`,
        error: `${baseStyles} bg-white dark:bg-gray-800 border-red-500 text-red-700 dark:text-red-300`,
        warning: `${baseStyles} bg-white dark:bg-gray-800 border-yellow-500 text-yellow-700 dark:text-yellow-300`,
        info: `${baseStyles} bg-white dark:bg-gray-800 border-blue-500 text-blue-700 dark:text-blue-300`,
        loading: `${baseStyles} bg-white dark:bg-gray-800 border-gray-500 text-gray-700 dark:text-gray-300`
      },
      minimal: {
        success: `${baseStyles} bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200`,
        error: `${baseStyles} bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200`,
        warning: `${baseStyles} bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200`,
        info: `${baseStyles} bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200`,
        loading: `${baseStyles} bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200`
      }
    };

    return variants[variant][type];
  };

  const getActionButtonStyles = (style: ToastAction['style'] = 'ghost', type: ToastType, variant: ToastVariant = 'filled') => {
    const baseStyles = 'px-3 py-1 text-sm font-medium rounded-md transition-colors duration-200';
    
    if (style === 'primary') {
      return `${baseStyles} bg-white bg-opacity-20 hover:bg-opacity-30 text-current`;
    } else if (style === 'secondary') {
      return `${baseStyles} bg-current text-white opacity-80 hover:opacity-100`;
    }
    
    // Ghost style (default)
    if (variant === 'filled') {
      return `${baseStyles} bg-white bg-opacity-10 hover:bg-opacity-20 text-current`;
    } else {
      return `${baseStyles} bg-current bg-opacity-10 hover:bg-opacity-20 text-current`;
    }
  };

  const renderIcon = () => {
    if (toast.icon) {
      if (typeof toast.icon === 'string') {
        return <span className="text-lg" role="img" aria-hidden="true">{toast.icon}</span>;
      }
      return toast.icon;
    }
    return DEFAULT_ICONS[toast.type];
  };

  return (
    <div
      className={`
        toast-item relative max-w-sm w-full p-4 pointer-events-auto
        ${getVariantStyles(toast.type, toast.variant)}
        ${isExiting ? 'toast-exit' : 'toast-enter'}
        ${toast.className || ''}
      `}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      role="alert"
      aria-live={toast.type === 'error' ? 'assertive' : 'polite'}
      aria-label={toast.ariaLabel || `${toast.type} notification: ${toast.message}`}
    >
      {/* Progress bar */}
      {toast.duration && toast.duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black bg-opacity-20 rounded-b-lg overflow-hidden">
          <div
            className={`h-full bg-current transition-all duration-100 ease-linear ${isPaused ? 'opacity-50' : ''}`}
            style={{ 
              width: `${progress}%`,
              willChange: 'width'
            }}
          />
        </div>
      )}

      <div className="flex items-start space-x-3">
        {/* Icon */}
        <div className="flex-shrink-0 mt-0.5">
          {renderIcon()}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {toast.title && (
            <p className="text-sm font-semibold mb-1">
              {toast.title}
            </p>
          )}
          <p className={`text-sm ${toast.title ? 'opacity-90' : ''}`}>
            {toast.message}
          </p>

          {/* Action */}
          {toast.action && (
            <div className="mt-3">
              <button
                onClick={toast.action.onClick}
                className={getActionButtonStyles(toast.action.style, toast.type, toast.variant)}
              >
                {toast.action.label}
              </button>
            </div>
          )}
        </div>

        {/* Dismiss button */}
        {toast.dismissible !== false && (
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 p-1 rounded-md transition-opacity duration-200 opacity-60 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-current"
            aria-label="Dismiss notification"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

interface ToastContainerProps {
  position: ToastPosition;
  toasts: ToastNotificationType[];
  onDismiss: (id: string) => void;
  gutter?: number;
  offset?: number;
}

const ToastContainer: React.FC<ToastContainerProps> = ({
  position,
  toasts,
  onDismiss,
  gutter = 8,
  offset = 16
}) => {
  const [pausedToasts, setPausedToasts] = useState<Set<string>>(new Set());

  const handleMouseEnter = (toastId: string) => {
    setPausedToasts(prev => new Set(prev).add(toastId));
  };

  const handleMouseLeave = (toastId: string) => {
    setPausedToasts(prev => {
      const next = new Set(prev);
      next.delete(toastId);
      return next;
    });
  };

  const getPositionStyles = (position: ToastPosition): React.CSSProperties => {
    // Handle both string and number offset values
    const offsetStr = typeof offset === 'string' ? offset : `${offset}px`;
    let offsetValue: number;
    
    if (offsetStr.endsWith('rem')) {
      offsetValue = parseFloat(offsetStr) * 16; // Convert rem to pixels
    } else if (offsetStr.endsWith('px')) {
      offsetValue = parseFloat(offsetStr); // Parse px value
    } else {
      offsetValue = parseInt(offsetStr) || 16; // Default fallback
    }
    
    const styles: Record<ToastPosition, React.CSSProperties> = {
      'top-left': { top: offsetValue, left: offsetValue },
      'top-center': { 
        top: offsetValue, 
        left: '50%', 
        transform: 'translateX(-50%)' 
      },
      'top-right': { top: offsetValue, right: offsetValue },
      'bottom-left': { bottom: offsetValue, left: offsetValue },
      'bottom-center': { 
        bottom: offsetValue, 
        left: '50%', 
        transform: 'translateX(-50%)' 
      },
      'bottom-right': { bottom: offsetValue, right: offsetValue }
    };
    return styles[position];
  };

  const getFlexDirection = (position: ToastPosition) => {
    return position.startsWith('top-') ? 'flex-col' : 'flex-col-reverse';
  };

  if (toasts.length === 0) return null;

  return (
    <div
      className={`
        fixed z-50 pointer-events-none flex ${getFlexDirection(position)}
      `}
      style={{ 
        gap: `${gutter}px`,
        ...getPositionStyles(position)
      }}
      role="region"
      aria-label={`Toast notifications ${position.replace('-', ' ')}`}
    >
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onDismiss={onDismiss}
          onMouseEnter={() => handleMouseEnter(toast.id)}
          onMouseLeave={() => handleMouseLeave(toast.id)}
        />
      ))}
    </div>
  );
};

// Toast Context
interface ToastContextType {
  toasts: ToastNotificationType[];
  config: ToastManagerConfig;
  show: (message: string, options?: ToastOptions) => void;
  success: (message: string, options?: Omit<ToastOptions, 'type'>) => void;
  error: (message: string, options?: Omit<ToastOptions, 'type'>) => void;
  warning: (message: string, options?: Omit<ToastOptions, 'type'>) => void;
  info: (message: string, options?: Omit<ToastOptions, 'type'>) => void;
  dismiss: (id: string) => void;
  clear: () => void;
  configure: (newConfig: Partial<ToastManagerConfig>) => void;
}

const ToastContext = React.createContext<ToastContextType | null>(null);

// Toast Manager Hook
export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Internal hook for ToastProvider
const useToastManager = () => {
  const [toasts, setToasts] = useState<ToastNotificationType[]>([]);
  const [config, setConfig] = useState<ToastManagerConfig>({
    maxToasts: 5,
    defaultDuration: 4000,
    defaultPosition: 'top-right',
    defaultVariant: 'filled',
    gutter: 8,
    containerOffset: 16
  });

  const generateId = () => `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const show = useCallback((message: string, options?: ToastOptions) => {
    const id = generateId();
    const toast: ToastNotificationType = {
      id,
      message,
      type: options?.type || 'info',
      title: options?.title,
      variant: options?.variant || config.defaultVariant,
      icon: options?.icon,
      duration: options?.duration !== undefined ? options.duration : config.defaultDuration,
      dismissible: options?.dismissible !== false,
      pauseOnHover: options?.pauseOnHover !== false,
      position: options?.position || config.defaultPosition,
      action: options?.action,
      onDismiss: options?.onDismiss,
      className: options?.className,
      ariaLabel: options?.ariaLabel
    };

    setToasts(prev => {
      const newToasts = [toast, ...prev];
      return newToasts.slice(0, config.maxToasts);
    });

    return id;
  }, [config]);

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const dismissAll = useCallback(() => {
    setToasts([]);
  }, []);

  const updateConfig = useCallback((newConfig: Partial<ToastManagerConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
  }, []);

  // Convenience methods
  const success = useCallback((message: string, options?: Omit<ToastOptions, 'type'>) => 
    show(message, { ...options, type: 'success' }), [show]);

  const error = useCallback((message: string, options?: Omit<ToastOptions, 'type'>) => 
    show(message, { ...options, type: 'error' }), [show]);

  const warning = useCallback((message: string, options?: Omit<ToastOptions, 'type'>) => 
    show(message, { ...options, type: 'warning' }), [show]);

  const info = useCallback((message: string, options?: Omit<ToastOptions, 'type'>) => 
    show(message, { ...options, type: 'info' }), [show]);

  const loading = useCallback((message: string, options?: Omit<ToastOptions, 'type'>) => 
    show(message, { ...options, type: 'loading', duration: null }), [show]);

  const configure = useCallback((newConfig: Partial<ToastManagerConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
  }, []);

  const clear = useCallback(() => {
    setToasts([]);
  }, []);

  return {
    toasts,
    config,
    show,
    success,
    error,
    warning,
    info,
    dismiss,
    clear,
    configure
  };
};

// Main Toast Provider Component
export const ToastProvider: React.FC<{ children: React.ReactNode; position?: ToastPosition }> = ({ 
  children, 
  position = 'top-right' 
}) => {
  const toastManager = useToastManager();

  // Group toasts by position
  const toastsByPosition = toastManager.toasts.reduce((acc, toast) => {
    const position = toast.position || toastManager.config.defaultPosition;
    if (!acc[position]) acc[position] = [];
    acc[position].push(toast);
    return acc;
  }, {} as Record<ToastPosition, ToastNotificationType[]>);

  return (
    <ToastContext.Provider value={toastManager}>
      {children}
      {typeof document !== 'undefined' && createPortal(
        <>
          {Object.entries(toastsByPosition).map(([position, positionToasts]) => (
            <ToastContainer
              key={position}
              position={position as ToastPosition}
              toasts={positionToasts}
              onDismiss={toastManager.dismiss}
              gutter={toastManager.config.gutter}
              offset={toastManager.config.containerOffset}
            />
          ))}
        </>,
        document.body
      )}
    </ToastContext.Provider>
  );
};

export default ToastProvider;