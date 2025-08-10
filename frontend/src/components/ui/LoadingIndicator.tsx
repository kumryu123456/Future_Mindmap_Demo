import React, { useEffect, useState } from 'react';
import { useLoadingManager } from '../../hooks/useUIStore';
import { 
  useGlobalLoading, 
  useIsGlobalLoading, 
  useActiveOperations,
  useIsAnyLoading 
} from '../../store/uiSelectors';
import type { 
  ProgressInfo, 
  OperationInfo, 
  EnhancedLoadingSpinnerProps,
  LoadingSpinnerState,
  LoadingSpinnerSize,
  StatefulSpinnerConfig 
} from '../../types/ui';
import './LoadingSpinner.css';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  color = 'currentColor',
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <svg
      className={`animate-spin ${sizeClasses[size]} ${className}`}
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke={color}
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill={color}
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
};

// Enhanced LoadingSpinner with multiple states
export const EnhancedLoadingSpinner: React.FC<EnhancedLoadingSpinnerProps> = ({
  state = 'loading',
  size = 'md',
  color,
  className = '',
  showIcon = true,
  duration = 2000,
  autoTransition = false,
  onComplete,
  message,
  progress
}) => {
  const [currentState, setCurrentState] = useState<LoadingSpinnerState>(state);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-10 h-10'
  };

  const getStateColor = (spinnerState: LoadingSpinnerState) => {
    if (color) return color;
    
    const stateColors = {
      loading: 'text-blue-600',
      success: 'text-green-600',
      error: 'text-red-600',
      warning: 'text-yellow-600',
      idle: 'text-gray-400'
    };
    
    return stateColors[spinnerState] || 'currentColor';
  };

  const renderStateIcon = (spinnerState: LoadingSpinnerState) => {
    if (!showIcon) return null;
    
    const iconSize = sizeClasses[size];
    const stateClass = `loading-spinner-${spinnerState}`;
    
    const getAnimationClass = () => {
      if (isTransitioning) return 'animate-scale-bounce';
      
      switch (spinnerState) {
        case 'loading': return 'animate-spin';
        case 'success': return 'animate-success-check';
        case 'error': return 'animate-error-shake';
        case 'warning': return 'animate-warning-pulse';
        case 'idle': return 'animate-idle-breathe';
        default: return '';
      }
    };

    switch (spinnerState) {
      case 'loading':
        return (
          <svg
            className={`${iconSize} ${stateClass} ${getAnimationClass()} ${className} spinner-accessible loading`}
            fill="none"
            viewBox="0 0 24 24"
            aria-label="Loading"
            role="progressbar"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        );

      case 'success':
        return (
          <svg
            className={`${iconSize} ${stateClass} ${getAnimationClass()} ${className} spinner-accessible success`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-label="Success"
            role="img"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M5 13l4 4L19 7"
              className="animate-success-check"
            />
          </svg>
        );

      case 'error':
        return (
          <svg
            className={`${iconSize} ${stateClass} ${getAnimationClass()} ${className} spinner-accessible error`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-label="Error"
            role="img"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        );

      case 'warning':
        return (
          <svg
            className={`${iconSize} ${stateClass} ${getAnimationClass()} ${className} spinner-accessible warning`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-label="Warning"
            role="img"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        );

      case 'idle':
        return (
          <div 
            className={`${iconSize} ${stateClass} ${getAnimationClass()} ${className} bg-current rounded-full spinner-accessible`}
            aria-label="Ready"
            role="img" 
          />
        );

      default:
        return null;
    }
  };

  const getStateMessage = (spinnerState: LoadingSpinnerState) => {
    if (message) return message;
    
    const defaultMessages = {
      loading: 'Loading...',
      success: 'Success!',
      error: 'Error occurred',
      warning: 'Warning',
      idle: 'Ready'
    };
    
    return defaultMessages[spinnerState] || '';
  };

  // Handle state transitions
  useEffect(() => {
    if (state !== currentState) {
      setIsTransitioning(true);
      setCurrentState(state);
      
      const transitionTimer = setTimeout(() => {
        setIsTransitioning(false);
      }, 300);

      return () => clearTimeout(transitionTimer);
    }
  }, [state, currentState]);

  // Handle auto-transition for success/error/warning states
  useEffect(() => {
    if (autoTransition && ['success', 'error', 'warning'].includes(currentState)) {
      const timer = setTimeout(() => {
        setCurrentState('idle');
        onComplete?.();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [currentState, autoTransition, duration, onComplete]);

  const containerClass = `spinner-container spinner-${size} ${progress ? 'spinner-with-progress' : ''} ${className}`;
  const messageClass = `spinner-message spinner-${size} loading-spinner-${currentState} ${isTransitioning ? 'animate-fade-in' : ''}`;

  return (
    <div className={containerClass} role="status" aria-live="polite">
      {renderStateIcon(currentState)}
      {(message || ['success', 'error', 'warning'].includes(currentState)) && (
        <span className={messageClass}>
          {getStateMessage(currentState)}
        </span>
      )}
      {progress && currentState === 'loading' && (
        <div className="flex-1 ml-2">
          <ProgressBar progress={progress} className="w-full" />
        </div>
      )}
      {/* Screen reader only text for accessibility */}
      <span className="sr-only">
        {currentState === 'loading' && 'Loading in progress'}
        {currentState === 'success' && 'Operation completed successfully'}
        {currentState === 'error' && 'An error occurred'}
        {currentState === 'warning' && 'Warning message'}
        {currentState === 'idle' && 'Ready for next operation'}
      </span>
    </div>
  );
};

interface ProgressBarProps {
  progress: ProgressInfo;
  className?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress, className = '' }) => {
  const percentage = Math.min((progress.value / progress.max) * 100, 100);

  return (
    <div className={`w-full ${className}`}>
      <div className="flex justify-between items-center mb-2">
        {progress.showPercentage && (
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {Math.round(percentage)}%
          </span>
        )}
        {progress.showValue && (
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {progress.value} / {progress.max} {progress.unit || ''}
          </span>
        )}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
        <div
          className={`
            bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out
            ${progress.animated ? 'animate-pulse' : ''}
          `}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

interface OperationItemProps {
  operation: OperationInfo & { id: string };
  onCancel?: (operationId: string) => void;
}

const OperationItem: React.FC<OperationItemProps> = ({ operation, onCancel }) => {
  const handleCancel = () => {
    if (operation.cancellable && operation.cancelHandler) {
      operation.cancelHandler();
    } else if (onCancel) {
      onCancel(operation.id);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-3">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {operation.operation}
        </h4>
        {operation.cancellable && (
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
            aria-label={`Cancel ${operation.operation}`}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}
      </div>
      
      {operation.message && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
          {operation.message}
        </p>
      )}

      <div className="flex items-center space-x-3">
        <LoadingSpinner size="sm" />
        {operation.progress && (
          <ProgressBar progress={operation.progress} className="flex-1" />
        )}
      </div>

      {operation.startTime && (
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          Started {new Date(operation.startTime).toLocaleTimeString()}
          {operation.duration && ` • ${Math.round(operation.duration / 1000)}s`}
        </div>
      )}
    </div>
  );
};

export const GlobalLoadingIndicator: React.FC = () => {
  const globalLoading = useGlobalLoading();
  const isLoading = useIsGlobalLoading();

  if (!isLoading) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <div className="bg-blue-600 text-white px-4 py-2 text-sm flex items-center justify-center">
        <LoadingSpinner size="sm" className="mr-2" color="white" />
        {globalLoading.message || 'Loading...'}
        {globalLoading.progress && (
          <div className="ml-4 flex-1 max-w-xs">
            <ProgressBar 
              progress={globalLoading.progress}
              className="text-white"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export const OperationsIndicator: React.FC = () => {
  const operations = useActiveOperations();
  const loadingManager = useLoadingManager();

  if (operations.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-40 w-80">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Active Operations ({operations.length})
          </h3>
          <button
            onClick={() => {
              operations.forEach(op => {
                if (op.cancellable) {
                  loadingManager.cancelOperation(op.id);
                }
              });
            }}
            className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            Cancel All
          </button>
        </div>
        
        <div className="max-h-64 overflow-y-auto">
          {operations.map((operation) => (
            <OperationItem
              key={operation.id}
              operation={operation}
              onCancel={loadingManager.cancelOperation}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export const PageLoadingOverlay: React.FC<{ message?: string }> = ({ 
  message = 'Loading...' 
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-white dark:bg-gray-900 bg-opacity-90 backdrop-blur-sm">
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
};

interface InlineLoadingProps {
  isLoading: boolean;
  message?: string;
  showSpinner?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  children?: React.ReactNode;
}

export const InlineLoading: React.FC<InlineLoadingProps> = ({
  isLoading,
  message,
  showSpinner = true,
  size = 'md',
  className = '',
  children
}) => {
  if (!isLoading && !children) return null;

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {isLoading && showSpinner && <LoadingSpinner size={size} />}
      {isLoading && message && (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {message}
        </span>
      )}
      {!isLoading && children}
    </div>
  );
};

interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading: boolean;
  loadingText?: string;
  children: React.ReactNode;
}

export const LoadingButton: React.FC<LoadingButtonProps> = ({
  isLoading,
  loadingText,
  children,
  disabled,
  className = '',
  ...props
}) => {
  return (
    <button
      {...props}
      disabled={disabled || isLoading}
      className={`
        relative inline-flex items-center justify-center
        ${isLoading ? 'cursor-not-allowed' : ''}
        ${className}
      `}
    >
      {isLoading && (
        <LoadingSpinner 
          size="sm" 
          className="mr-2"
          color="currentColor"
        />
      )}
      {isLoading ? (loadingText || 'Loading...') : children}
    </button>
  );
};

// Main loading indicator component that shows appropriate loading state
export const LoadingIndicator: React.FC = () => {
  const isAnyLoading = useIsAnyLoading();
  const isGlobalLoading = useIsGlobalLoading();
  const activeOperations = useActiveOperations();

  return (
    <>
      {isGlobalLoading && <GlobalLoadingIndicator />}
      {activeOperations.length > 0 && <OperationsIndicator />}
    </>
  );
};

// Hook for using the enhanced loading spinner programmatically
export const useEnhancedSpinner = () => {
  const [state, setState] = useState<LoadingSpinnerState>('idle');
  const [message, setMessage] = useState<string>('');

  const startLoading = (loadingMessage?: string) => {
    setState('loading');
    setMessage(loadingMessage || 'Loading...');
  };

  const setSuccess = (successMessage?: string) => {
    setState('success');
    setMessage(successMessage || 'Success!');
  };

  const setError = (errorMessage?: string) => {
    setState('error');
    setMessage(errorMessage || 'Error occurred');
  };

  const setWarning = (warningMessage?: string) => {
    setState('warning');
    setMessage(warningMessage || 'Warning');
  };

  const setIdle = (idleMessage?: string) => {
    setState('idle');
    setMessage(idleMessage || '');
  };

  const reset = () => {
    setState('idle');
    setMessage('');
  };

  return {
    state,
    message,
    startLoading,
    setSuccess,
    setError,
    setWarning,
    setIdle,
    reset
  };
};

// Stateful spinner that can manage its own transitions
export const StatefulSpinner: React.FC<{
  config?: StatefulSpinnerConfig;
  onStateChange?: (state: LoadingSpinnerState) => void;
  className?: string;
}> = ({ 
  config = {}, 
  onStateChange,
  className = ''
}) => {
  const [state, setState] = useState<LoadingSpinnerState>('idle');
  const [message, setMessage] = useState<string>('');

  const defaultConfig: StatefulSpinnerConfig = {
    autoTransition: true,
    successDuration: 2000,
    errorDuration: 3000,
    warningDuration: 2500,
    idleDuration: 1000,
    enableProgressBar: false,
    enableMessages: true,
    customIcons: {},
    ...config
  };

  const startLoading = (loadingMessage?: string) => {
    setState('loading');
    setMessage(loadingMessage || 'Loading...');
    onStateChange?.(
'loading');
  };

  const setSuccess = (successMessage?: string) => {
    setState('success');
    setMessage(successMessage || 'Success!');
    onStateChange?.('success');
  };

  const setError = (errorMessage?: string) => {
    setState('error');
    setMessage(errorMessage || 'Error occurred');
    onStateChange?.('error');
  };

  const setWarning = (warningMessage?: string) => {
    setState('warning');
    setMessage(warningMessage || 'Warning');
    onStateChange?.('warning');
  };

  const setIdle = (idleMessage?: string) => {
    setState('idle');
    setMessage(idleMessage || '');
    onStateChange?.('idle');
  };

  // Expose control methods via ref
  React.useImperativeHandle(React.useRef(), () => ({
    startLoading,
    setSuccess,
    setError,
    setWarning,
    setIdle
  }));

  return (
    <div className={className}>
      <EnhancedLoadingSpinner
        state={state}
        message={defaultConfig.enableMessages ? message : undefined}
        autoTransition={defaultConfig.autoTransition}
        duration={
          state === 'success' ? defaultConfig.successDuration :
          state === 'error' ? defaultConfig.errorDuration :
          state === 'warning' ? defaultConfig.warningDuration :
          defaultConfig.idleDuration
        }
        onComplete={() => {
          if (['success', 'error', 'warning'].includes(state)) {
            setIdle();
          }
        }}
      />
    </div>
  );
};

export default LoadingIndicator;