import React from 'react';
import { useToast } from './ui/ToastNotification';
import { 
  globalErrorHandler, 
  showSuccess, 
  showError, 
  showWarning, 
  showInfo 
} from '../utils/errorHandler';

/**
 * ToastTestPanel Component
 * A development panel to test all toast notification types and integrations
 */
export const ToastTestPanel: React.FC = () => {
  const toast = useToast();

  const testBasicToasts = () => {
    toast.success('Basic success toast!');
    setTimeout(() => toast.error('Basic error toast!'), 500);
    setTimeout(() => toast.warning('Basic warning toast!'), 1000);
    setTimeout(() => toast.info('Basic info toast!'), 1500);
  };

  const testActionToasts = () => {
    toast.success('Success with action!', {
      duration: 5000,
      action: { label: 'View', onClick: () => toast.info('View action clicked!') }
    });

    setTimeout(() => {
      toast.error('Error with retry!', {
        duration: 6000,
        action: {
          label: 'Retry', onClick: () => toast.success('Retry successful!')
        }
      });
    }, 1000);
  };

  const testGlobalHandlers = () => {
    showSuccess('Global success handler!', { duration: 3000 });
    setTimeout(() => showError('Global error handler!'), 500);
    setTimeout(() => showWarning('Global warning handler!'), 1000);
    setTimeout(() => showInfo('Global info handler!'), 1500);
  };

  const testApiErrorSimulation = () => {
    // Simulate different API error responses
    globalErrorHandler.handleApiError({
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: 'Connection failed',
        details: { status: 'offline' }
      }
    }, 'Session Save');

    setTimeout(() => {
      globalErrorHandler.handleApiError({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid session data provided',
          details: { field: 'name', reason: 'required' }
        }
      }, 'Session Validation');
    }, 1000);

    setTimeout(() => {
      globalErrorHandler.handleApiError({
        success: false,
        error: {
          code: 'AUTHORIZATION_ERROR',
          message: 'Token expired',
          details: { expiredAt: new Date().toISOString() }
        }
      }, 'Authentication');
    }, 2000);
  };

  const testSessionIntegration = () => {
    // Simulate session management actions
    toast.success('Session "My Mindmap" saved successfully!', {
      duration: 4000,
      action: { label: 'View', onClick: () => toast.info('Opening session view...') }
    });

    setTimeout(() => {
      toast.success('Session "Project Planning" loaded successfully!', { duration: 3000 });
    }, 1000);

    setTimeout(() => {
      toast.warning('Auto-save failed. Changes may be lost.', {
        duration: 5000,
        action: { label: 'Save Now', onClick: () => toast.success('Manual save completed!') }
      });
    }, 2000);
  };

  const testMindmapActions = () => {
    // Simulate mindmap canvas actions
    toast.success('New node added!', {
      duration: 2000,
      action: { label: 'Undo', onClick: () => toast.info('Node removed') }
    });

    setTimeout(() => {
      toast.info('Node position updated', { duration: 1500 });
    }, 500);

    setTimeout(() => {
      toast.success('Canvas saved successfully!', {
        duration: 3000,
        action: { label: 'Export', onClick: () => toast.info('Mindmap exported to file') }
      });
    }, 1000);

    setTimeout(() => {
      toast.warning('Cannot delete the central node', { duration: 2000 });
    }, 1500);
  };

  const testLongDurationToast = () => {
    toast.info('This toast will stay for 10 seconds...', {
      duration: 10000,
      action: { label: 'Dismiss', onClick: () => toast.info('Toast dismissed early') }
    });
  };

  const testMultipleToasts = () => {
    // Test stacking of multiple toasts
    for (let i = 1; i <= 5; i++) {
      setTimeout(() => {
        const types = ['success', 'error', 'warning', 'info'] as const;
        const type = types[i % types.length];
        const messages = {
          success: `Success message ${i}`,
          error: `Error message ${i}`,
          warning: `Warning message ${i}`,
          info: `Info message ${i}`
        };
        
        // Type-safe approach using switch statement
        switch (type) {
          case 'success':
            toast.success(messages[type]);
            break;
          case 'error':
            toast.error(messages[type]);
            break;
          case 'warning':
            toast.warning(messages[type]);
            break;
          case 'info':
            toast.info(messages[type]);
            break;
        }
      }, i * 200);
    }
  };

  const clearAllToasts = () => {
    // TODO: Implement actual toast dismissal logic
    // Check if toast system has a dismissAll method like toast.dismissAll()
    // For now, placeholder implementation with clear TODO comment
    console.warn('TODO: Implement clearAllToasts with actual toast dismiss functionality');
    toast.info('Clear all toasts - implementation pending', { duration: 2000 });
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      left: '20px',
      background: 'white',
      border: '1px solid #ccc',
      borderRadius: '8px',
      padding: '16px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      maxWidth: '300px',
      zIndex: 1000
    }}>
      <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600' }}>
        Toast Test Panel
      </h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <button onClick={testBasicToasts} style={buttonStyle}>
          Basic Toasts
        </button>
        
        <button onClick={testActionToasts} style={buttonStyle}>
          Action Toasts
        </button>
        
        <button onClick={testGlobalHandlers} style={buttonStyle}>
          Global Handlers
        </button>
        
        <button onClick={testApiErrorSimulation} style={buttonStyle}>
          API Error Simulation
        </button>
        
        <button onClick={testSessionIntegration} style={buttonStyle}>
          Session Integration
        </button>
        
        <button onClick={testMindmapActions} style={buttonStyle}>
          Mindmap Actions
        </button>
        
        <button onClick={testLongDurationToast} style={buttonStyle}>
          Long Duration
        </button>
        
        <button onClick={testMultipleToasts} style={buttonStyle}>
          Multiple Toasts
        </button>
        
        <button onClick={clearAllToasts} style={buttonStyle}>
          Clear All
        </button>
      </div>
      
      <div style={{
        marginTop: '12px',
        padding: '8px',
        background: '#f5f5f5',
        borderRadius: '4px',
        fontSize: '11px',
        color: '#666'
      }}>
        <strong>Note:</strong> This panel is for development testing only. 
        Remove before production.
      </div>
    </div>
  );
};

const buttonStyle: React.CSSProperties = {
  padding: '6px 12px',
  border: '1px solid #ddd',
  borderRadius: '4px',
  background: '#f8f9fa',
  cursor: 'pointer',
  fontSize: '12px',
  color: '#333',
  transition: 'all 0.2s ease'
};

export default ToastTestPanel;