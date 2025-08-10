import React, { useEffect, useRef } from 'react';
import { useNotificationManager } from '../../hooks/useUIStore';
import { 
  useActiveNotifications, 
  useNotificationPosition, 
  useNotificationConfig 
} from '../../store/uiSelectors';
import { NotificationUtils } from '../../utils/uiStoreUtils';
import type { UINotification, NotificationAction } from '../../types/ui';

interface NotificationProps {
  notification: UINotification;
  onDismiss: (id: string) => void;
  onAction: (action: NotificationAction) => void;
}

const NotificationItem: React.FC<NotificationProps> = ({ notification, onDismiss, onAction }) => {
  const progressRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = React.useState(false);

  const handleMouseEnter = () => {
    if (notification.pauseOnHover) {
      setIsPaused(true);
    }
  };

  const handleMouseLeave = () => {
    if (notification.pauseOnHover) {
      setIsPaused(false);
    }
  };

  const handleActionClick = (action: NotificationAction) => {
    onAction(action);
    if (action.closeOnClick) {
      onDismiss(notification.id);
    }
  };

  // Progress bar animation
  useEffect(() => {
    if (!notification.duration || notification.duration <= 0 || !progressRef.current) return;

    const progressBar = progressRef.current;
    const duration = notification.duration;

    if (!isPaused) {
      progressBar.style.animation = `notification-progress ${duration}ms linear forwards`;
    } else {
      progressBar.style.animationPlayState = 'paused';
    }

    return () => {
      progressBar.style.animation = '';
    };
  }, [notification.duration, isPaused]);

  const typeColors = {
    success: 'border-green-500 bg-green-50 text-green-900',
    error: 'border-red-500 bg-red-50 text-red-900',
    warning: 'border-yellow-500 bg-yellow-50 text-yellow-900',
    info: 'border-blue-500 bg-blue-50 text-blue-900',
    default: 'border-gray-500 bg-gray-50 text-gray-900'
  };

  const typeColorsDark = {
    success: 'border-green-400 bg-green-900 text-green-100',
    error: 'border-red-400 bg-red-900 text-red-100',
    warning: 'border-yellow-400 bg-yellow-900 text-yellow-100',
    info: 'border-blue-400 bg-blue-900 text-blue-100',
    default: 'border-gray-400 bg-gray-900 text-gray-100'
  };

  return (
    <div
      className={`
        notification-item
        max-w-sm w-full shadow-lg rounded-lg pointer-events-auto
        border-l-4 p-4 mb-4 relative overflow-hidden
        transition-all duration-300 ease-in-out
        transform translate-x-0 opacity-100
        ${typeColors[notification.type]}
        dark:${typeColorsDark[notification.type]}
      `}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      role="alert"
      aria-live={notification.type === 'error' ? 'assertive' : 'polite'}
    >
      {/* Progress bar */}
      {notification.duration && notification.duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black bg-opacity-20">
          <div
            ref={progressRef}
            className="h-full bg-current opacity-60"
            style={{ width: '0%' }}
          />
        </div>
      )}

      <div className="flex items-start">
        {/* Icon */}
        <div className="flex-shrink-0">
          {notification.icon ? (
            <span className="text-xl" role="img" aria-hidden="true">
              {notification.icon}
            </span>
          ) : (
            <span className="text-xl" role="img" aria-hidden="true">
              {NotificationUtils.getDefaultIcon(notification.type)}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="ml-3 w-0 flex-1">
          <p className="text-sm font-medium">
            {notification.title}
          </p>
          <p className="mt-1 text-sm opacity-90">
            {notification.message}
          </p>

          {/* Progress indicator */}
          {notification.progress && notification.progress.showProgress && (
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs">
                <span>Progress</span>
                <span>{Math.round((notification.progress.value / notification.progress.max) * 100)}%</span>
              </div>
              <div className="mt-1 bg-black bg-opacity-20 rounded-full h-2">
                <div
                  className="bg-current h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${(notification.progress.value / notification.progress.max) * 100}%`
                  }}
                />
              </div>
            </div>
          )}

          {/* Actions */}
          {notification.actions.length > 0 && (
            <div className="mt-3 flex space-x-2">
              {notification.actions.map((action) => (
                <button
                  key={action.id}
                  onClick={() => handleActionClick(action)}
                  className={`
                    px-3 py-1 text-xs font-medium rounded-md
                    transition-colors duration-200
                    ${action.style === 'primary' 
                      ? 'bg-current text-white hover:opacity-80'
                      : action.style === 'danger'
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-white bg-opacity-20 hover:bg-opacity-30'
                    }
                  `}
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}

          {/* Timestamp */}
          <div className="mt-2 text-xs opacity-60">
            {NotificationUtils.formatTimestamp(notification.timestamp)}
          </div>
        </div>

        {/* Dismiss button */}
        {notification.dismissible && (
          <div className="ml-4 flex-shrink-0">
            <button
              onClick={() => onDismiss(notification.id)}
              className="
                inline-flex text-gray-400 hover:text-gray-600
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
                rounded-md p-1 hover:bg-white hover:bg-opacity-20
                transition-colors duration-200
              "
              aria-label="Dismiss notification"
            >
              <span className="sr-only">Dismiss</span>
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export const NotificationContainer: React.FC = () => {
  const notificationManager = useNotificationManager();
  const notifications = useActiveNotifications();
  const position = useNotificationPosition();
  const config = useNotificationConfig();

  const handleActionClick = (action: NotificationAction) => {
    if (typeof action.handler === 'string') {
      // Dispatch custom event
      window.dispatchEvent(new CustomEvent(action.handler, {
        detail: { action }
      }));
    } else if (typeof action.handler === 'function') {
      action.handler();
    }
  };

  // Position classes
  const positionClasses = {
    'top-left': 'top-0 left-0',
    'top-center': 'top-0 left-1/2 transform -translate-x-1/2',
    'top-right': 'top-0 right-0',
    'bottom-left': 'bottom-0 left-0',
    'bottom-center': 'bottom-0 left-1/2 transform -translate-x-1/2',
    'bottom-right': 'bottom-0 right-0'
  };

  // Auto-dismiss notifications
  useEffect(() => {
    const timeouts: NodeJS.Timeout[] = [];

    notifications.forEach((notification) => {
      if (notification.duration && notification.duration > 0) {
        const timeout = setTimeout(() => {
          notificationManager.hide(notification.id);
        }, notification.duration);
        timeouts.push(timeout);
      }
    });

    return () => {
      timeouts.forEach(timeout => clearTimeout(timeout));
    };
  }, [notifications, notificationManager]);

  if (notifications.length === 0) {
    return null;
  }

  return (
    <>
      {/* CSS animations */}
      <style>{`
        @keyframes notification-progress {
          from { width: 100%; }
          to { width: 0%; }
        }
        
        .notification-enter {
          opacity: 0;
          transform: translateY(-100%) scale(0.95);
        }
        
        .notification-enter-active {
          opacity: 1;
          transform: translateY(0) scale(1);
          transition: all 300ms ease-out;
        }
        
        .notification-exit {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
        
        .notification-exit-active {
          opacity: 0;
          transform: translateX(100%) scale(0.95);
          transition: all 200ms ease-in;
        }
      `}</style>

      <div
        className={`
          fixed z-50 pointer-events-none p-4 w-full max-w-sm
          ${positionClasses[position]}
        `}
        role="region"
        aria-label="Notifications"
        aria-live="polite"
      >
        {notifications
          .slice(0, config.maxNotifications)
          .map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onDismiss={notificationManager.hide}
              onAction={handleActionClick}
            />
          ))}
          
        {notifications.length > config.maxNotifications && (
          <div className="notification-item max-w-sm w-full shadow-lg rounded-lg pointer-events-auto bg-gray-800 text-white p-4 mb-4">
            <p className="text-sm">
              {notifications.length - config.maxNotifications} more notifications
            </p>
            <button
              onClick={notificationManager.clearAll}
              className="mt-2 text-xs text-blue-300 hover:text-blue-200"
            >
              Clear all
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default NotificationContainer;