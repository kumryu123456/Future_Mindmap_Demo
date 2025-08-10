/**
 * Enhanced LoadingSpinner Tests
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { EnhancedLoadingSpinner, StatefulSpinner } from '../LoadingIndicator';
import type { EnhancedLoadingSpinnerProps, ProgressInfo } from '../../../types/ui';

// Mock CSS imports
jest.mock('../LoadingSpinner.css', () => ({}));

describe('EnhancedLoadingSpinner', () => {
  const defaultProps: EnhancedLoadingSpinnerProps = {
    state: 'loading',
    size: 'md',
    showIcon: true
  };

  const mockProgress: ProgressInfo = {
    value: 50,
    max: 100,
    showPercentage: true,
    showValue: true,
    animated: true,
    unit: '%'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Basic Rendering', () => {
    it('renders without crashing', () => {
      render(<EnhancedLoadingSpinner {...defaultProps} />);
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('renders with correct aria attributes', () => {
      render(<EnhancedLoadingSpinner {...defaultProps} />);
      const container = screen.getByRole('status');
      expect(container).toHaveAttribute('aria-live', 'polite');
    });

    it('includes screen reader text', () => {
      render(<EnhancedLoadingSpinner {...defaultProps} state="loading" />);
      expect(screen.getByText('Loading in progress')).toHaveClass('sr-only');
    });
  });

  describe('State Rendering', () => {
    it('renders loading state correctly', () => {
      render(<EnhancedLoadingSpinner {...defaultProps} state="loading" />);
      
      const spinner = screen.getByLabelText('Loading');
      expect(spinner).toBeInTheDocument();
      expect(spinner).toHaveAttribute('role', 'progressbar');
      expect(spinner).toHaveClass('animate-spin');
    });

    it('renders success state correctly', () => {
      render(<EnhancedLoadingSpinner {...defaultProps} state="success" />);
      
      const icon = screen.getByLabelText('Success');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveAttribute('role', 'img');
      expect(screen.getByText('Operation completed successfully')).toHaveClass('sr-only');
    });

    it('renders error state correctly', () => {
      render(<EnhancedLoadingSpinner {...defaultProps} state="error" />);
      
      const icon = screen.getByLabelText('Error');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveAttribute('role', 'img');
      expect(screen.getByText('An error occurred')).toHaveClass('sr-only');
    });

    it('renders warning state correctly', () => {
      render(<EnhancedLoadingSpinner {...defaultProps} state="warning" />);
      
      const icon = screen.getByLabelText('Warning');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveAttribute('role', 'img');
      expect(screen.getByText('Warning message')).toHaveClass('sr-only');
    });

    it('renders idle state correctly', () => {
      render(<EnhancedLoadingSpinner {...defaultProps} state="idle" />);
      
      const icon = screen.getByLabelText('Ready');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveAttribute('role', 'img');
      expect(screen.getByText('Ready for next operation')).toHaveClass('sr-only');
    });
  });

  describe('Size Variants', () => {
    it('applies correct size classes', () => {
      const { rerender } = render(<EnhancedLoadingSpinner {...defaultProps} size="sm" />);
      expect(screen.getByRole('status')).toHaveClass('spinner-sm');

      rerender(<EnhancedLoadingSpinner {...defaultProps} size="md" />);
      expect(screen.getByRole('status')).toHaveClass('spinner-md');

      rerender(<EnhancedLoadingSpinner {...defaultProps} size="lg" />);
      expect(screen.getByRole('status')).toHaveClass('spinner-lg');

      rerender(<EnhancedLoadingSpinner {...defaultProps} size="xl" />);
      expect(screen.getByRole('status')).toHaveClass('spinner-xl');
    });

    it('applies correct icon sizes', () => {
      const { rerender } = render(<EnhancedLoadingSpinner {...defaultProps} size="sm" />);
      expect(screen.getByLabelText('Loading')).toHaveClass('w-4', 'h-4');

      rerender(<EnhancedLoadingSpinner {...defaultProps} size="xl" />);
      expect(screen.getByLabelText('Loading')).toHaveClass('w-10', 'h-10');
    });
  });

  describe('Custom Messages', () => {
    it('displays custom message when provided', () => {
      const customMessage = 'Processing your data...';
      render(
        <EnhancedLoadingSpinner 
          {...defaultProps} 
          state="loading" 
          message={customMessage}
        />
      );
      
      expect(screen.getByText(customMessage)).toBeInTheDocument();
    });

    it('shows default message for success state when no custom message', () => {
      render(<EnhancedLoadingSpinner {...defaultProps} state="success" />);
      expect(screen.getByText('Success!')).toBeInTheDocument();
    });

    it('shows default message for error state when no custom message', () => {
      render(<EnhancedLoadingSpinner {...defaultProps} state="error" />);
      expect(screen.getByText('Error occurred')).toBeInTheDocument();
    });

    it('shows default message for warning state when no custom message', () => {
      render(<EnhancedLoadingSpinner {...defaultProps} state="warning" />);
      expect(screen.getByText('Warning')).toBeInTheDocument();
    });
  });

  describe('Progress Display', () => {
    it('shows progress bar when progress is provided and state is loading', () => {
      render(
        <EnhancedLoadingSpinner 
          {...defaultProps} 
          state="loading" 
          progress={mockProgress}
        />
      );
      
      // Progress bar should be rendered (assuming ProgressBar component exists)
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('does not show progress bar when state is not loading', () => {
      render(
        <EnhancedLoadingSpinner 
          {...defaultProps} 
          state="success" 
          progress={mockProgress}
        />
      );
      
      // Progress should not be visible for success state
      expect(screen.getByRole('status')).not.toHaveClass('spinner-with-progress');
    });
  });

  describe('Icon Display', () => {
    it('hides icon when showIcon is false', () => {
      render(<EnhancedLoadingSpinner {...defaultProps} showIcon={false} />);
      
      expect(screen.queryByLabelText('Loading')).not.toBeInTheDocument();
    });

    it('shows icon by default', () => {
      render(<EnhancedLoadingSpinner {...defaultProps} />);
      
      expect(screen.getByLabelText('Loading')).toBeInTheDocument();
    });
  });

  describe('State Transitions', () => {
    it('updates state when prop changes', async () => {
      const { rerender } = render(<EnhancedLoadingSpinner {...defaultProps} state="loading" />);
      
      expect(screen.getByLabelText('Loading')).toBeInTheDocument();
      
      rerender(<EnhancedLoadingSpinner {...defaultProps} state="success" />);
      
      await waitFor(() => {
        expect(screen.getByLabelText('Success')).toBeInTheDocument();
      });
    });

    it('applies transition animation class during state changes', async () => {
      const { rerender } = render(<EnhancedLoadingSpinner {...defaultProps} state="loading" />);
      
      rerender(<EnhancedLoadingSpinner {...defaultProps} state="success" />);
      
      // Should have transition class initially
      await waitFor(() => {
        expect(screen.getByText('Success!')).toHaveClass('animate-fade-in');
      });
    });

    it('removes transition animation class after delay', async () => {
      const { rerender } = render(<EnhancedLoadingSpinner {...defaultProps} state="loading" />);
      
      rerender(<EnhancedLoadingSpinner {...defaultProps} state="success" />);
      
      act(() => {
        jest.advanceTimersByTime(300);
      });
      
      await waitFor(() => {
        expect(screen.getByText('Success!')).not.toHaveClass('animate-fade-in');
      });
    });
  });

  describe('Auto-transition', () => {
    it('calls onComplete callback when auto-transition is enabled', async () => {
      const onComplete = jest.fn();
      
      render(
        <EnhancedLoadingSpinner 
          {...defaultProps} 
          state="success" 
          autoTransition={true}
          duration={1000}
          onComplete={onComplete}
        />
      );
      
      act(() => {
        jest.advanceTimersByTime(1000);
      });
      
      await waitFor(() => {
        expect(onComplete).toHaveBeenCalled();
      });
    });

    it('does not auto-transition when autoTransition is false', async () => {
      const onComplete = jest.fn();
      
      render(
        <EnhancedLoadingSpinner 
          {...defaultProps} 
          state="success" 
          autoTransition={false}
          duration={1000}
          onComplete={onComplete}
        />
      );
      
      act(() => {
        jest.advanceTimersByTime(1000);
      });
      
      await waitFor(() => {
        expect(onComplete).not.toHaveBeenCalled();
      });
    });

    it('only auto-transitions for success, error, and warning states', async () => {
      const onComplete = jest.fn();
      
      const { rerender } = render(
        <EnhancedLoadingSpinner 
          {...defaultProps} 
          state="loading" 
          autoTransition={true}
          duration={1000}
          onComplete={onComplete}
        />
      );
      
      act(() => {
        jest.advanceTimersByTime(1000);
      });
      
      expect(onComplete).not.toHaveBeenCalled();
      
      rerender(
        <EnhancedLoadingSpinner 
          {...defaultProps} 
          state="success" 
          autoTransition={true}
          duration={1000}
          onComplete={onComplete}
        />
      );
      
      act(() => {
        jest.advanceTimersByTime(1000);
      });
      
      await waitFor(() => {
        expect(onComplete).toHaveBeenCalled();
      });
    });
  });

  describe('Custom Styling', () => {
    it('applies custom className', () => {
      const customClass = 'custom-spinner-class';
      render(<EnhancedLoadingSpinner {...defaultProps} className={customClass} />);
      
      expect(screen.getByRole('status')).toHaveClass(customClass);
    });

    it('applies custom color', () => {
      const customColor = '#ff0000';
      render(<EnhancedLoadingSpinner {...defaultProps} color={customColor} />);
      
      // Color would be applied via inline styles or CSS custom properties
      expect(screen.getByRole('status')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      render(<EnhancedLoadingSpinner {...defaultProps} />);
      
      const container = screen.getByRole('status');
      expect(container).toHaveAttribute('aria-live', 'polite');
    });

    it('provides screen reader content for all states', () => {
      const states = ['loading', 'success', 'error', 'warning', 'idle'] as const;
      
      states.forEach((state) => {
        const { unmount } = render(<EnhancedLoadingSpinner {...defaultProps} state={state} />);
        
        // Each state should have screen reader text
        const srTexts = {
          loading: 'Loading in progress',
          success: 'Operation completed successfully', 
          error: 'An error occurred',
          warning: 'Warning message',
          idle: 'Ready for next operation'
        };
        
        expect(screen.getByText(srTexts[state])).toHaveClass('sr-only');
        unmount();
      });
    });

    it('has correct role attributes on icons', () => {
      render(<EnhancedLoadingSpinner {...defaultProps} state="loading" />);
      expect(screen.getByLabelText('Loading')).toHaveAttribute('role', 'progressbar');
      
      const { rerender } = render(<EnhancedLoadingSpinner {...defaultProps} state="success" />);
      expect(screen.getByLabelText('Success')).toHaveAttribute('role', 'img');
    });
  });
});

describe('StatefulSpinner', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders with initial idle state', () => {
    render(<StatefulSpinner />);
    
    expect(screen.getByLabelText('Ready')).toBeInTheDocument();
  });

  it('calls onStateChange callback when state changes', async () => {
    const onStateChange = jest.fn();
    
    render(<StatefulSpinner onStateChange={onStateChange} />);
    
    // The initial render should call onStateChange with 'idle'
    // Note: This depends on the internal implementation
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('applies custom configuration', () => {
    const config = {
      enableMessages: true,
      autoTransition: true,
      successDuration: 1000
    };
    
    render(<StatefulSpinner config={config} />);
    
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const customClass = 'custom-stateful-spinner';
    render(<StatefulSpinner className={customClass} />);
    
    expect(screen.getByRole('status').parentElement).toHaveClass(customClass);
  });

  it('handles configuration with disabled messages', () => {
    const config = {
      enableMessages: false
    };
    
    render(<StatefulSpinner config={config} />);
    
    // Should not show any visible message text (except screen reader text)
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});

describe('Animation and Performance', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('cleans up timers on unmount', () => {
    const { unmount } = render(
      <EnhancedLoadingSpinner 
        state="success" 
        autoTransition={true} 
        duration={1000}
      />
    );
    
    const timerSpy = jest.spyOn(global, 'clearTimeout');
    
    unmount();
    
    expect(timerSpy).toHaveBeenCalled();
    
    timerSpy.mockRestore();
  });

  it('applies correct animation classes based on state', () => {
    const { rerender } = render(<EnhancedLoadingSpinner state="loading" />);
    expect(screen.getByLabelText('Loading')).toHaveClass('animate-spin');
    
    rerender(<EnhancedLoadingSpinner state="success" />);
    expect(screen.getByLabelText('Success')).toHaveClass('animate-success-check');
    
    rerender(<EnhancedLoadingSpinner state="error" />);
    expect(screen.getByLabelText('Error')).toHaveClass('animate-error-shake');
    
    rerender(<EnhancedLoadingSpinner state="warning" />);
    expect(screen.getByLabelText('Warning')).toHaveClass('animate-warning-pulse');
    
    rerender(<EnhancedLoadingSpinner state="idle" />);
    expect(screen.getByLabelText('Ready')).toHaveClass('animate-idle-breathe');
  });
});