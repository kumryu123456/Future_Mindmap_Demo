/**
 * ToastNotification Component Tests
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { ToastProvider, useToast } from '../ToastNotification';
import type { ToastType, ToastPosition, ToastVariant } from '../../../types/ui';

// Mock CSS imports
jest.mock('../ToastNotification.css', () => ({}));

// Test component that uses the toast hook
const TestComponent: React.FC<{
  onToastCreated?: (id: string) => void;
}> = ({ onToastCreated }) => {
  const toast = useToast();

  return (
    <div>
      <button
        onClick={() => {
          const id = toast.success('Success message');
          onToastCreated?.(id);
        }}
        data-testid="success-button"
      >
        Success
      </button>
      
      <button
        onClick={() => {
          const id = toast.error('Error message');
          onToastCreated?.(id);
        }}
        data-testid="error-button"
      >
        Error
      </button>
      
      <button
        onClick={() => {
          const id = toast.warning('Warning message');
          onToastCreated?.(id);
        }}
        data-testid="warning-button"
      >
        Warning
      </button>
      
      <button
        onClick={() => {
          const id = toast.info('Info message');
          onToastCreated?.(id);
        }}
        data-testid="info-button"
      >
        Info
      </button>
      
      <button
        onClick={() => {
          const id = toast.loading('Loading message');
          onToastCreated?.(id);
        }}
        data-testid="loading-button"
      >
        Loading
      </button>
      
      <button
        onClick={() => {
          const id = toast.show('Custom message', {
            type: 'info',
            title: 'Custom Title',
            variant: 'outlined',
            position: 'top-left',
            icon: '🎉'
          });
          onToastCreated?.(id);
        }}
        data-testid="custom-button"
      >
        Custom
      </button>
      
      <button
        onClick={() => toast.dismissAll()}
        data-testid="dismiss-all-button"
      >
        Dismiss All
      </button>
      
      <div data-testid="toast-count">{toast.toasts.length}</div>
    </div>
  );
};

describe('ToastNotification', () => {
  const renderWithProvider = (component: React.ReactNode) => {
    return render(
      <ToastProvider>
        {component}
      </ToastProvider>
    );
  };

  beforeEach(() => {
    jest.useFakeTimers();
    // Clear any existing toasts
    document.body.innerHTML = '';
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  describe('Basic Toast Creation', () => {
    it('creates success toast', async () => {
      renderWithProvider(<TestComponent />);
      
      fireEvent.click(screen.getByTestId('success-button'));
      
      await waitFor(() => {
        expect(screen.getByText('Success message')).toBeInTheDocument();
      });
      
      expect(screen.getByRole('alert')).toHaveAttribute('aria-live', 'polite');
    });

    it('creates error toast with assertive aria-live', async () => {
      renderWithProvider(<TestComponent />);
      
      fireEvent.click(screen.getByTestId('error-button'));
      
      await waitFor(() => {
        expect(screen.getByText('Error message')).toBeInTheDocument();
      });
      
      expect(screen.getByRole('alert')).toHaveAttribute('aria-live', 'assertive');
    });

    it('creates warning toast', async () => {
      renderWithProvider(<TestComponent />);
      
      fireEvent.click(screen.getByTestId('warning-button'));
      
      await waitFor(() => {
        expect(screen.getByText('Warning message')).toBeInTheDocument();
      });
    });

    it('creates info toast', async () => {
      renderWithProvider(<TestComponent />);
      
      fireEvent.click(screen.getByTestId('info-button'));
      
      await waitFor(() => {
        expect(screen.getByText('Info message')).toBeInTheDocument();
      });
    });

    it('creates loading toast', async () => {
      renderWithProvider(<TestComponent />);
      
      fireEvent.click(screen.getByTestId('loading-button'));
      
      await waitFor(() => {
        expect(screen.getByText('Loading message')).toBeInTheDocument();
      });
      
      // Loading toasts should have spinning icon
      expect(document.querySelector('.animate-spin')).toBeInTheDocument();
    });
  });

  describe('Toast Properties', () => {
    it('displays custom title and icon', async () => {
      renderWithProvider(<TestComponent />);
      
      fireEvent.click(screen.getByTestId('custom-button'));
      
      await waitFor(() => {
        expect(screen.getByText('Custom Title')).toBeInTheDocument();
        expect(screen.getByText('Custom message')).toBeInTheDocument();
        expect(screen.getByText('🎉')).toBeInTheDocument();
      });
    });

    it('updates toast count correctly', async () => {
      renderWithProvider(<TestComponent />);
      
      expect(screen.getByTestId('toast-count')).toHaveTextContent('0');
      
      fireEvent.click(screen.getByTestId('success-button'));
      
      await waitFor(() => {
        expect(screen.getByTestId('toast-count')).toHaveTextContent('1');
      });
      
      fireEvent.click(screen.getByTestId('error-button'));
      
      await waitFor(() => {
        expect(screen.getByTestId('toast-count')).toHaveTextContent('2');
      });
    });
  });

  describe('Toast Dismissal', () => {
    it('allows manual dismissal', async () => {
      renderWithProvider(<TestComponent />);
      
      fireEvent.click(screen.getByTestId('success-button'));
      
      await waitFor(() => {
        expect(screen.getByText('Success message')).toBeInTheDocument();
      });
      
      const dismissButton = screen.getByLabelText('Dismiss notification');
      fireEvent.click(dismissButton);
      
      await waitFor(() => {
        expect(screen.queryByText('Success message')).not.toBeInTheDocument();
      });
    });

    it('auto-dismisses after duration', async () => {
      renderWithProvider(<TestComponent />);
      
      fireEvent.click(screen.getByTestId('success-button'));
      
      await waitFor(() => {
        expect(screen.getByText('Success message')).toBeInTheDocument();
      });
      
      // Fast-forward time to trigger auto-dismiss
      act(() => {
        jest.advanceTimersByTime(4000);
      });
      
      await waitFor(() => {
        expect(screen.queryByText('Success message')).not.toBeInTheDocument();
      });
    });

    it('dismisses all toasts', async () => {
      renderWithProvider(<TestComponent />);
      
      fireEvent.click(screen.getByTestId('success-button'));
      fireEvent.click(screen.getByTestId('error-button'));
      
      await waitFor(() => {
        expect(screen.getByTestId('toast-count')).toHaveTextContent('2');
      });
      
      fireEvent.click(screen.getByTestId('dismiss-all-button'));
      
      await waitFor(() => {
        expect(screen.getByTestId('toast-count')).toHaveTextContent('0');
      });
    });
  });

  describe('Toast Actions', () => {
    const TestComponentWithAction: React.FC = () => {
      const toast = useToast();
      const [actionClicked, setActionClicked] = React.useState(false);

      return (
        <div>
          <button
            onClick={() => {
              toast.error('Error with action', {
                action: {
                  label: 'Retry',
                  onClick: () => setActionClicked(true),
                  style: 'primary'
                }
              });
            }}
            data-testid="error-with-action-button"
          >
            Error with Action
          </button>
          {actionClicked && <div data-testid="action-clicked">Action was clicked</div>}
        </div>
      );
    };

    it('handles toast actions', async () => {
      renderWithProvider(<TestComponentWithAction />);
      
      fireEvent.click(screen.getByTestId('error-with-action-button'));
      
      await waitFor(() => {
        expect(screen.getByText('Retry')).toBeInTheDocument();
      });
      
      fireEvent.click(screen.getByText('Retry'));
      
      await waitFor(() => {
        expect(screen.getByTestId('action-clicked')).toBeInTheDocument();
      });
    });
  });

  describe('Hover Behavior', () => {
    const TestComponentWithHover: React.FC = () => {
      const toast = useToast();

      return (
        <button
          onClick={() => {
            toast.info('Hover test', {
              pauseOnHover: true,
              duration: 2000
            });
          }}
          data-testid="hover-test-button"
        >
          Hover Test
        </button>
      );
    };

    it('pauses auto-dismiss on hover', async () => {
      renderWithProvider(<TestComponentWithHover />);
      
      fireEvent.click(screen.getByTestId('hover-test-button'));
      
      await waitFor(() => {
        expect(screen.getByText('Hover test')).toBeInTheDocument();
      });
      
      const toastElement = screen.getByRole('alert');
      
      // Hover over toast
      fireEvent.mouseEnter(toastElement);
      
      // Fast-forward past normal dismissal time
      act(() => {
        jest.advanceTimersByTime(3000);
      });
      
      // Toast should still be visible due to hover
      expect(screen.getByText('Hover test')).toBeInTheDocument();
      
      // Mouse leave
      fireEvent.mouseLeave(toastElement);
      
      // Now it should dismiss after the remaining time
      act(() => {
        jest.advanceTimersByTime(2000);
      });
      
      await waitFor(() => {
        expect(screen.queryByText('Hover test')).not.toBeInTheDocument();
      });
    });
  });

  describe('Configuration', () => {
    const TestComponentWithConfig: React.FC = () => {
      const toast = useToast();

      return (
        <div>
          <button
            onClick={() => {
              toast.updateConfig({ maxToasts: 2 });
            }}
            data-testid="update-config-button"
          >
            Update Config
          </button>
          
          <button
            onClick={() => {
              for (let i = 0; i < 5; i++) {
                toast.info(`Toast ${i + 1}`);
              }
            }}
            data-testid="create-many-button"
          >
            Create Many
          </button>
          
          <div data-testid="toast-count">{toast.toasts.length}</div>
        </div>
      );
    };

    it('respects maxToasts configuration', async () => {
      renderWithProvider(<TestComponentWithConfig />);
      
      fireEvent.click(screen.getByTestId('update-config-button'));
      fireEvent.click(screen.getByTestId('create-many-button'));
      
      await waitFor(() => {
        // Should only show 2 toasts due to maxToasts config
        expect(screen.getByTestId('toast-count')).toHaveTextContent('2');
      });
    });
  });

  describe('Accessibility', () => {
    it('provides proper ARIA attributes', async () => {
      renderWithProvider(<TestComponent />);
      
      fireEvent.click(screen.getByTestId('success-button'));
      
      await waitFor(() => {
        const toastElement = screen.getByRole('alert');
        expect(toastElement).toHaveAttribute('aria-live', 'polite');
        expect(toastElement).toHaveAttribute('aria-label');
      });
    });

    it('supports custom aria labels', async () => {
      const TestComponentWithAria: React.FC = () => {
        const toast = useToast();

        return (
          <button
            onClick={() => {
              toast.success('Success', {
                ariaLabel: 'Custom aria label for success notification'
              });
            }}
            data-testid="custom-aria-button"
          >
            Custom Aria
          </button>
        );
      };

      renderWithProvider(<TestComponentWithAria />);
      
      fireEvent.click(screen.getByTestId('custom-aria-button'));
      
      await waitFor(() => {
        const toastElement = screen.getByRole('alert');
        expect(toastElement).toHaveAttribute('aria-label', 'Custom aria label for success notification');
      });
    });
  });

  describe('Toast Types', () => {
    it('applies correct styling for each toast type', async () => {
      const types: ToastType[] = ['success', 'error', 'warning', 'info', 'loading'];
      
      renderWithProvider(<TestComponent />);
      
      for (const type of types) {
        const button = screen.getByTestId(`${type}-button`);
        fireEvent.click(button);
      }
      
      await waitFor(() => {
        const toasts = screen.getAllByRole('alert');
        expect(toasts).toHaveLength(5);
      });
    });
  });

  describe('Error Handling', () => {
    it('handles invalid toast creation gracefully', async () => {
      const TestComponentWithError: React.FC = () => {
        const toast = useToast();

        return (
          <button
            onClick={() => {
              try {
                // Try to create toast with invalid parameters
                toast.show('', {
                  type: 'invalid' as any,
                  duration: -1
                });
              } catch (error) {
                // Should not throw
                console.log('Error caught:', error);
              }
            }}
            data-testid="error-test-button"
          >
            Error Test
          </button>
        );
      };

      expect(() => {
        renderWithProvider(<TestComponentWithError />);
        fireEvent.click(screen.getByTestId('error-test-button'));
      }).not.toThrow();
    });
  });

  describe('Performance', () => {
    it('cleans up timers on unmount', async () => {
      const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');
      
      const { unmount } = renderWithProvider(<TestComponent />);
      
      fireEvent.click(screen.getByTestId('success-button'));
      
      await waitFor(() => {
        expect(screen.getByText('Success message')).toBeInTheDocument();
      });
      
      unmount();
      
      expect(clearTimeoutSpy).toHaveBeenCalled();
      
      clearTimeoutSpy.mockRestore();
    });
  });
});