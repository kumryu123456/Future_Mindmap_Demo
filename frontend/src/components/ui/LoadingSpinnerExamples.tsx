import React, { useState } from 'react';
import { 
  EnhancedLoadingSpinner,
  StatefulSpinner 
} from './LoadingIndicator';
import type { 
  LoadingSpinnerState, 
  LoadingSpinnerSize,
  ProgressInfo 
} from '../../types/ui';

/**
 * LoadingSpinner Usage Examples
 * 
 * This file demonstrates various ways to use the enhanced LoadingSpinner
 * components with different states, sizes, and configurations.
 */

export const LoadingSpinnerExamples: React.FC = () => {
  const [currentState, setCurrentState] = useState<LoadingSpinnerState>('loading');
  const [currentSize, setCurrentSize] = useState<LoadingSpinnerSize>('md');
  const [showProgress, setShowProgress] = useState(false);
  
  const sampleProgress: ProgressInfo = {
    value: 65,
    max: 100,
    showPercentage: true,
    showValue: true,
    animated: true,
    unit: '%'
  };

  const handleStateChange = (state: LoadingSpinnerState) => {
    console.log(`Spinner state changed to: ${state}`);
  };

  return (
    <div className="p-6 space-y-8 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Enhanced LoadingSpinner Examples
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Comprehensive examples showing different states, sizes, and usage patterns for the enhanced LoadingSpinner component.
        </p>

        {/* Interactive Demo */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
            Interactive Demo
          </h2>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="flex flex-wrap gap-4 mb-6">
              {/* State Controls */}
              <div className="flex flex-col">
                <label className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  State:
                </label>
                <div className="flex gap-2">
                  {(['loading', 'success', 'error', 'warning', 'idle'] as LoadingSpinnerState[]).map((state) => (
                    <button
                      key={state}
                      onClick={() => setCurrentState(state)}
                      className={`px-3 py-1 text-sm rounded ${
                        currentState === state
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {state}
                    </button>
                  ))}
                </div>
              </div>

              {/* Size Controls */}
              <div className="flex flex-col">
                <label className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Size:
                </label>
                <div className="flex gap-2">
                  {(['sm', 'md', 'lg', 'xl'] as LoadingSpinnerSize[]).map((size) => (
                    <button
                      key={size}
                      onClick={() => setCurrentSize(size)}
                      className={`px-3 py-1 text-sm rounded ${
                        currentSize === size
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Progress Toggle */}
              <div className="flex flex-col">
                <label className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Progress:
                </label>
                <button
                  onClick={() => setShowProgress(!showProgress)}
                  className={`px-3 py-1 text-sm rounded ${
                    showProgress
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300'
                  }`}
                >
                  {showProgress ? 'Hide' : 'Show'} Progress
                </button>
              </div>
            </div>

            <div className="p-6 bg-gray-50 dark:bg-gray-700 rounded-md">
              <EnhancedLoadingSpinner
                state={currentState}
                size={currentSize}
                message={`Current state: ${currentState}`}
                progress={showProgress && currentState === 'loading' ? sampleProgress : undefined}
                autoTransition={false}
              />
            </div>
          </div>
        </section>

        {/* Basic States Showcase */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
            All States Showcase
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Loading State */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
              <h3 className="text-lg font-medium mb-3 text-gray-900 dark:text-white">
                Loading State
              </h3>
              <div className="flex flex-col space-y-4">
                <EnhancedLoadingSpinner
                  state="loading"
                  size="md"
                  message="Processing your request..."
                />
                <EnhancedLoadingSpinner
                  state="loading"
                  size="sm"
                  progress={sampleProgress}
                />
              </div>
            </div>

            {/* Success State */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
              <h3 className="text-lg font-medium mb-3 text-gray-900 dark:text-white">
                Success State
              </h3>
              <div className="flex flex-col space-y-4">
                <EnhancedLoadingSpinner
                  state="success"
                  size="md"
                  message="Operation completed!"
                  autoTransition={false}
                />
                <EnhancedLoadingSpinner
                  state="success"
                  size="lg"
                  message="File uploaded successfully"
                  autoTransition={false}
                />
              </div>
            </div>

            {/* Error State */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
              <h3 className="text-lg font-medium mb-3 text-gray-900 dark:text-white">
                Error State
              </h3>
              <div className="flex flex-col space-y-4">
                <EnhancedLoadingSpinner
                  state="error"
                  size="md"
                  message="Connection failed"
                  autoTransition={false}
                />
                <EnhancedLoadingSpinner
                  state="error"
                  size="sm"
                  message="Validation error occurred"
                  autoTransition={false}
                />
              </div>
            </div>

            {/* Warning State */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
              <h3 className="text-lg font-medium mb-3 text-gray-900 dark:text-white">
                Warning State
              </h3>
              <div className="flex flex-col space-y-4">
                <EnhancedLoadingSpinner
                  state="warning"
                  size="md"
                  message="Storage almost full"
                  autoTransition={false}
                />
                <EnhancedLoadingSpinner
                  state="warning"
                  size="xl"
                  message="Unsaved changes detected"
                  autoTransition={false}
                />
              </div>
            </div>

            {/* Idle State */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
              <h3 className="text-lg font-medium mb-3 text-gray-900 dark:text-white">
                Idle State
              </h3>
              <div className="flex flex-col space-y-4">
                <EnhancedLoadingSpinner
                  state="idle"
                  size="md"
                  message="Ready for next operation"
                />
                <EnhancedLoadingSpinner
                  state="idle"
                  size="sm"
                />
              </div>
            </div>

            {/* Size Variants */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
              <h3 className="text-lg font-medium mb-3 text-gray-900 dark:text-white">
                Size Variants
              </h3>
              <div className="flex items-center space-x-4">
                <EnhancedLoadingSpinner state="loading" size="sm" />
                <EnhancedLoadingSpinner state="loading" size="md" />
                <EnhancedLoadingSpinner state="loading" size="lg" />
                <EnhancedLoadingSpinner state="loading" size="xl" />
              </div>
            </div>
          </div>
        </section>

        {/* Stateful Spinner Example */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
            Stateful Spinner Component
          </h2>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              The StatefulSpinner component manages its own state transitions and can be controlled programmatically.
            </p>
            
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
                <StatefulSpinner
                  config={{
                    autoTransition: true,
                    successDuration: 2000,
                    errorDuration: 3000,
                    enableMessages: true,
                    enableProgressBar: false
                  }}
                  onStateChange={handleStateChange}
                />
              </div>
              
              <p className="text-sm text-gray-500 dark:text-gray-400">
                This spinner automatically transitions between states and provides callback notifications.
              </p>
            </div>
          </div>
        </section>

        {/* Usage Patterns */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
            Common Usage Patterns
          </h2>
          
          <div className="space-y-6">
            {/* Form Submission */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-medium mb-3 text-gray-900 dark:text-white">
                Form Submission Pattern
              </h3>
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <EnhancedLoadingSpinner
                    state="loading"
                    size="sm"
                    message="Saving changes..."
                    className="mb-2"
                  />
                  <code className="text-sm text-blue-700 dark:text-blue-300">
                    {'<EnhancedLoadingSpinner state="loading" message="Saving changes..." />'}
                  </code>
                </div>
                
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded">
                  <EnhancedLoadingSpinner
                    state="success"
                    size="sm"
                    message="Changes saved successfully"
                    autoTransition={false}
                    className="mb-2"
                  />
                  <code className="text-sm text-green-700 dark:text-green-300">
                    {'<EnhancedLoadingSpinner state="success" message="Changes saved successfully" />'}
                  </code>
                </div>
                
                <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded">
                  <EnhancedLoadingSpinner
                    state="error"
                    size="sm"
                    message="Failed to save changes"
                    autoTransition={false}
                    className="mb-2"
                  />
                  <code className="text-sm text-red-700 dark:text-red-300">
                    {'<EnhancedLoadingSpinner state="error" message="Failed to save changes" />'}
                  </code>
                </div>
              </div>
            </div>

            {/* File Upload */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-medium mb-3 text-gray-900 dark:text-white">
                File Upload with Progress
              </h3>
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded">
                <EnhancedLoadingSpinner
                  state="loading"
                  size="md"
                  message="Uploading file..."
                  progress={sampleProgress}
                  className="mb-2"
                />
                <code className="text-sm text-gray-600 dark:text-gray-400">
                  {'<EnhancedLoadingSpinner state="loading" progress={progressInfo} />'}
                </code>
              </div>
            </div>

            {/* Inline Loading */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-medium mb-3 text-gray-900 dark:text-white">
                Inline Loading States
              </h3>
              <div className="space-y-3">
                <p className="flex items-center text-gray-700 dark:text-gray-300">
                  <EnhancedLoadingSpinner state="loading" size="sm" className="mr-2" />
                  Processing your request...
                </p>
                <p className="flex items-center text-gray-700 dark:text-gray-300">
                  <EnhancedLoadingSpinner state="success" size="sm" className="mr-2" />
                  Task completed successfully
                </p>
                <p className="flex items-center text-gray-700 dark:text-gray-300">
                  <EnhancedLoadingSpinner state="warning" size="sm" className="mr-2" />
                  Action requires attention
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Code Examples */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
            Code Examples
          </h2>
          <div className="bg-gray-900 text-gray-100 p-6 rounded-lg overflow-x-auto">
            <pre className="text-sm">
{`// Basic usage
<EnhancedLoadingSpinner 
  state="loading" 
  size="md" 
  message="Processing..." 
/>

// With progress tracking
<EnhancedLoadingSpinner
  state="loading"
  size="lg"
  message="Uploading file..."
  progress={{
    value: 65,
    max: 100,
    showPercentage: true,
    showValue: true,
    animated: true,
    unit: '%'
  }}
/>

// With auto-transition
<EnhancedLoadingSpinner
  state="success"
  message="Upload complete!"
  autoTransition={true}
  duration={2000}
  onComplete={() => console.log('Animation finished')}
/>

// Stateful spinner with configuration
<StatefulSpinner
  config={{
    autoTransition: true,
    successDuration: 2000,
    errorDuration: 3000,
    enableMessages: true,
    customIcons: {
      success: 'checkmark-circle',
      error: 'alert-circle'
    }
  }}
  onStateChange={(state) => console.log('State:', state)}
/>`}
            </pre>
          </div>
        </section>
      </div>
    </div>
  );
};

export default LoadingSpinnerExamples;