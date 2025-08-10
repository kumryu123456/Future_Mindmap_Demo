import React, { useState, useRef, useEffect } from 'react';
import { useToast } from './ToastNotification';
import type { ToastType, ToastVariant, ToastPosition } from '../../types/ui';

/**
 * ToastNotification Usage Examples
 * 
 * This component demonstrates various ways to use the ToastNotification system
 * for providing user feedback in different scenarios.
 */

export const ToastExamples: React.FC = () => {
  const toast = useToast();
  const [activeLoadingToast, setActiveLoadingToast] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const handleBasicToasts = () => {
    toast.success('Operation completed successfully!');
    setTimeout(() => toast.info('Here\'s some additional information'), 1000);
    setTimeout(() => toast.warning('Please check your input'), 2000);
    setTimeout(() => toast.error('Something went wrong'), 3000);
  };

  const handleCustomToasts = () => {
    toast.success('Custom Success', {
      title: 'File Upload',
      icon: '📁',
      duration: 6000,
      action: {
        label: 'View File',
        onClick: () => console.log('View file clicked'),
        style: 'primary'
      }
    });

    toast.error('Network Error', {
      title: 'Connection Failed',
      duration: null, // Persistent
      action: {
        label: 'Retry',
        onClick: () => console.log('Retry clicked'),
        style: 'secondary'
      }
    });
  };

  const handleVariantToasts = () => {
    toast.show('Filled variant (default)', { variant: 'filled', type: 'info' });
    setTimeout(() => toast.show('Outlined variant', { variant: 'outlined', type: 'success' }), 500);
    setTimeout(() => toast.show('Minimal variant', { variant: 'minimal', type: 'warning' }), 1000);
  };

  const handlePositionToasts = () => {
    const positions: ToastPosition[] = [
      'top-left', 'top-center', 'top-right',
      'bottom-left', 'bottom-center', 'bottom-right'
    ];

    positions.forEach((position, index) => {
      setTimeout(() => {
        toast.show(`Toast at ${position.replace('-', ' ')}`, {
          type: 'info',
          position,
          duration: 3000
        });
      }, index * 300);
    });
  };

  const handleAsyncOperation = () => {
    const loadingId = toast.loading('Processing your request...', {
      title: 'Please Wait'
    });
    setActiveLoadingToast(loadingId);

    // Simulate async operation
    setTimeout(() => {
      toast.dismiss(loadingId);
      
      // Randomly succeed or fail
      if (Math.random() > 0.5) {
        toast.success('Operation completed successfully!', {
          title: 'Success',
          action: {
            label: 'View Result',
            onClick: () => console.log('View result clicked')
          }
        });
      } else {
        toast.error('Operation failed. Please try again.', {
          title: 'Error',
          action: {
            label: 'Retry',
            onClick: () => handleAsyncOperation()
          }
        });
      }
      setActiveLoadingToast(null);
    }, 3000);
  };

  const handleFormValidation = () => {
    // Simulate form validation errors
    const errors = [
      'Email is required',
      'Password must be at least 8 characters',
      'Please accept the terms and conditions'
    ];

    errors.forEach((error, index) => {
      setTimeout(() => {
        toast.error(error, {
          title: 'Validation Error',
          duration: 5000,
          position: 'top-center'
        });
      }, index * 300);
    });
  };

  const handleProgressToast = () => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    let progress = 0;
    const toastId = toast.loading(`Upload progress: ${progress}%`, {
      title: 'Uploading File',
      duration: null
    });

    intervalRef.current = setInterval(() => {
      progress += 10;
      
      if (progress >= 100) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        toast.dismiss(toastId);
        toast.success('File uploaded successfully!', {
          title: 'Upload Complete',
          icon: '📁'
        });
      } else {
        // Note: In a real implementation, you'd update the toast content
        // For now, we'll just show progress in console
        console.log(`Progress: ${progress}%`);
      }
    }, 500);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8 bg-gray-50 dark:bg-gray-900">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Toast Notification Examples
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Comprehensive examples showing different toast notification patterns and use cases for user feedback.
        </p>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        
        {/* Basic Toast Types */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Basic Toast Types
          </h3>
          <div className="space-y-2">
            <button
              onClick={() => toast.success('Success message!')}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              Success Toast
            </button>
            <button
              onClick={() => toast.error('Error message!')}
              className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Error Toast
            </button>
            <button
              onClick={() => toast.warning('Warning message!')}
              className="w-full px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors"
            >
              Warning Toast
            </button>
            <button
              onClick={() => toast.info('Info message!')}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Info Toast
            </button>
            <button
              onClick={handleBasicToasts}
              className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              Show All Types
            </button>
          </div>
        </div>

        {/* Variants */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Toast Variants
          </h3>
          <div className="space-y-2">
            <button
              onClick={() => toast.show('Filled variant', { variant: 'filled', type: 'success' })}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              Filled Variant
            </button>
            <button
              onClick={() => toast.show('Outlined variant', { variant: 'outlined', type: 'info' })}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Outlined Variant
            </button>
            <button
              onClick={() => toast.show('Minimal variant', { variant: 'minimal', type: 'warning' })}
              className="w-full px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors"
            >
              Minimal Variant
            </button>
            <button
              onClick={handleVariantToasts}
              className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              Show All Variants
            </button>
          </div>
        </div>

        {/* Positions */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Toast Positions
          </h3>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <button
              onClick={() => toast.show('Top Left', { position: 'top-left', type: 'info' })}
              className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Top Left
            </button>
            <button
              onClick={() => toast.show('Top Center', { position: 'top-center', type: 'info' })}
              className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Top Center
            </button>
            <button
              onClick={() => toast.show('Top Right', { position: 'top-right', type: 'info' })}
              className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Top Right
            </button>
            <button
              onClick={() => toast.show('Bottom Left', { position: 'bottom-left', type: 'info' })}
              className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Bottom Left
            </button>
            <button
              onClick={() => toast.show('Bottom Center', { position: 'bottom-center', type: 'info' })}
              className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Bottom Center
            </button>
            <button
              onClick={() => toast.show('Bottom Right', { position: 'bottom-right', type: 'info' })}
              className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Bottom Right
            </button>
          </div>
          <button
            onClick={handlePositionToasts}
            className="w-full mt-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            Show All Positions
          </button>
        </div>

        {/* Advanced Features */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Advanced Features
          </h3>
          <div className="space-y-2">
            <button
              onClick={handleCustomToasts}
              className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
            >
              Custom Icons & Actions
            </button>
            <button
              onClick={() => toast.show('Persistent toast', { duration: null, type: 'warning' })}
              className="w-full px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
            >
              Persistent Toast
            </button>
            <button
              onClick={() => toast.show('No auto-dismiss', { duration: 0, type: 'info' })}
              className="w-full px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
            >
              Manual Dismiss Only
            </button>
            <button
              onClick={handleAsyncOperation}
              disabled={activeLoadingToast !== null}
              className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {activeLoadingToast ? 'Processing...' : 'Async Operation'}
            </button>
          </div>
        </div>

        {/* Use Cases */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Common Use Cases
          </h3>
          <div className="space-y-2">
            <button
              onClick={handleFormValidation}
              className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Form Validation Errors
            </button>
            <button
              onClick={handleProgressToast}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              File Upload Progress
            </button>
            <button
              onClick={() => {
                toast.success('Item saved to favorites!', {
                  icon: '❤️',
                  action: {
                    label: 'View',
                    onClick: () => console.log('View favorites'),
                    style: 'ghost'
                  }
                });
              }}
              className="w-full px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 transition-colors"
            >
              User Action Feedback
            </button>
            <button
              onClick={() => {
                toast.info('New message received', {
                  title: 'Notification',
                  icon: '📧',
                  pauseOnHover: true,
                  action: {
                    label: 'Read',
                    onClick: () => console.log('Read message')
                  }
                });
              }}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              System Notification
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Toast Controls
          </h3>
          <div className="space-y-2">
            <button
              onClick={toast.dismissAll}
              className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              Dismiss All Toasts
            </button>
            <button
              onClick={() => {
                toast.updateConfig({ maxToasts: 3 });
                toast.info('Max toasts set to 3');
              }}
              className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              Limit to 3 Toasts
            </button>
            <button
              onClick={() => {
                toast.updateConfig({ defaultDuration: 2000 });
                toast.info('Default duration: 2s');
              }}
              className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              Quick Duration (2s)
            </button>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Active toasts: {toast.toasts.length}
            </p>
          </div>
        </div>
      </div>

      {/* Code Examples */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          Code Examples
        </h3>
        <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
          <pre className="text-sm">
{`// Basic usage
import { useToast } from './components/ui/ToastNotification';

const MyComponent = () => {
  const toast = useToast();

  const handleSuccess = () => {
    toast.success('Operation completed!');
  };

  const handleError = () => {
    toast.error('Something went wrong', {
      title: 'Error',
      duration: null, // Persistent
      action: {
        label: 'Retry',
        onClick: () => handleRetry(),
        style: 'primary'
      }
    });
  };

  const handleCustom = () => {
    toast.show('Custom message', {
      type: 'info',
      variant: 'outlined',
      position: 'top-center',
      icon: '🎉',
      duration: 5000,
      pauseOnHover: true
    });
  };

  return (
    <div>
      <button onClick={handleSuccess}>Success</button>
      <button onClick={handleError}>Error</button>
      <button onClick={handleCustom}>Custom</button>
    </div>
  );
};

// App setup
import { ToastProvider } from './components/ui/ToastNotification';

function App() {
  return (
    <ToastProvider>
      <MyApp />
    </ToastProvider>
  );
}`}
          </pre>
        </div>
      </div>

      {/* Features List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            ✨ Key Features
          </h3>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
            <li>• Multiple toast types (success, error, warning, info, loading)</li>
            <li>• Three visual variants (filled, outlined, minimal)</li>
            <li>• Six positioning options</li>
            <li>• Auto-dismiss with progress indicator</li>
            <li>• Pause on hover functionality</li>
            <li>• Custom icons and actions</li>
            <li>• Queue management with stacking</li>
            <li>• Fully accessible (ARIA compliant)</li>
            <li>• Dark mode support</li>
            <li>• Mobile responsive</li>
          </ul>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            🎯 Best Practices
          </h3>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
            <li>• Use appropriate toast types for the context</li>
            <li>• Keep messages concise and actionable</li>
            <li>• Use persistent toasts for critical errors</li>
            <li>• Provide actions for recoverable errors</li>
            <li>• Consider toast position relative to trigger</li>
            <li>• Limit simultaneous toasts (3-5 max)</li>
            <li>• Use consistent timing (3-5 seconds typical)</li>
            <li>• Test with screen readers for accessibility</li>
            <li>• Use loading toasts for async operations</li>
            <li>• Group related notifications when possible</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ToastExamples;