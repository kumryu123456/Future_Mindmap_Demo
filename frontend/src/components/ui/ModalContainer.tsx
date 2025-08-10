import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useModalManager } from '../../hooks/useUIStore';
import { useOpenModals, useActiveModal, useModalStack } from '../../store/uiSelectors';
import { ModalUtils } from '../../utils/uiStoreUtils';
import type { UIModal } from '../../types/ui';

interface ModalWrapperProps {
  modal: UIModal;
  isActive: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const ModalWrapper: React.FC<ModalWrapperProps> = ({ modal, isActive, onClose, children }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Focus management
  useEffect(() => {
    if (!modal.isOpen || !isActive) return;

    // Store previous focus
    previousFocusRef.current = document.activeElement as HTMLElement;

    // Focus the modal
    const focusModal = () => {
      const modalEl = modalRef.current;
      if (!modalEl) return;

      // Find first focusable element
      const focusableElements = modalEl.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );

      const firstFocusable = focusableElements[0] as HTMLElement;
      if (firstFocusable) {
        firstFocusable.focus();
      } else {
        modalEl.focus();
      }
    };

    // Delay focus to ensure modal is rendered
    setTimeout(focusModal, 100);

    // Trap focus within modal
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!modal.config.trapFocus) return;

      const modalEl = modalRef.current;
      if (!modalEl || event.key !== 'Tab') return;

      const focusableElements = Array.from(
        modalEl.querySelectorAll(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      ) as HTMLElement[];

      if (focusableElements.length === 0) return;

      const firstFocusable = focusableElements[0];
      const lastFocusable = focusableElements[focusableElements.length - 1];

      if (event.shiftKey) {
        if (document.activeElement === firstFocusable) {
          event.preventDefault();
          lastFocusable.focus();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          event.preventDefault();
          firstFocusable.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      
      // Restore focus
      if (modal.config.restoreFocus && previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    };
  }, [modal.isOpen, isActive, modal.config.trapFocus, modal.config.restoreFocus]);

  // Handle escape key
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && modal.config.closeOnEscape && isActive) {
        onClose();
      }
    };

    if (modal.isOpen && isActive) {
      document.addEventListener('keydown', handleEscapeKey);
      return () => document.removeEventListener('keydown', handleEscapeKey);
    }
  }, [modal.isOpen, isActive, modal.config.closeOnEscape, onClose]);

  // Handle backdrop click
  const handleBackdropClick = (event: React.MouseEvent) => {
    if (event.target === backdropRef.current && modal.config.closeOnBackdrop) {
      onClose();
    }
  };

  // Calculate position and size
  const viewport = {
    width: window.innerWidth,
    height: window.innerHeight
  };

  const dimensions = ModalUtils.calculatePosition(modal, viewport);

  const modalStyle: React.CSSProperties = {
    position: 'absolute',
    left: dimensions.x,
    top: dimensions.y,
    width: dimensions.width,
    height: modal.size === 'auto' ? 'auto' : dimensions.height,
    maxWidth: '90vw',
    maxHeight: '90vh',
    zIndex: 1000 + (modal.config.animation ? 10 : 0)
  };

  if (!modal.isOpen) return null;

  return (
    <div
      ref={backdropRef}
      className={`
        fixed inset-0 z-40 overflow-y-auto
        ${modal.config.backdrop ? 'bg-black bg-opacity-50' : ''}
        ${modal.config.backdropBlur ? 'backdrop-blur-sm' : ''}
        transition-opacity duration-300
        ${modal.isOpen ? 'opacity-100' : 'opacity-0'}
      `}
      onClick={handleBackdropClick}
      aria-hidden={!isActive}
    >
      <div
        ref={modalRef}
        className={`
          relative bg-white dark:bg-gray-800
          shadow-xl transform transition-all duration-300
          ${modal.config.borderRadius ? `rounded-${modal.config.borderRadius}` : 'rounded-lg'}
          ${modal.config.shadow ? `shadow-${modal.config.shadow}` : 'shadow-xl'}
          ${modal.isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}
          ${modal.isMinimized ? 'scale-75' : ''}
          ${modal.isMaximized ? 'fixed inset-4' : ''}
        `}
        style={modal.isMaximized ? undefined : modalStyle}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`modal-title-${modal.id}`}
        tabIndex={-1}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2
            id={`modal-title-${modal.id}`}
            className="text-lg font-semibold text-gray-900 dark:text-gray-100"
          >
            {modal.title}
          </h2>
          
          <div className="flex items-center space-x-2">
            {/* Minimize button */}
            {modal.config.minimizable && (
              <button
                onClick={() => {
                  // Would call minimizeModal action
                }}
                className="p-1 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                aria-label="Minimize modal"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 9h12v2H4V9z" clipRule="evenodd" />
                </svg>
              </button>
            )}
            
            {/* Maximize button */}
            {modal.config.maximizable && (
              <button
                onClick={() => {
                  // Would call maximizeModal action
                }}
                className="p-1 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                aria-label={modal.isMaximized ? "Restore modal" : "Maximize modal"}
              >
                {modal.isMaximized ? (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4h5v2H6v3H4V4zm12 0v5h-2V6h-3V4h5zm-5 12v-5h2v3h3v2h-5zM4 16v-5h2v3h3v2H4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 01-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 01-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15 13.586V12a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            )}
            
            {/* Close button */}
            {modal.config.closable && (
              <button
                onClick={onClose}
                className="p-1 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                aria-label="Close modal"
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
        </div>

        {/* Modal Content */}
        <div className="p-4 overflow-y-auto max-h-[calc(90vh-8rem)]">
          {modal.isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600 dark:text-gray-400">Loading...</span>
            </div>
          ) : (
            children
          )}
        </div>
      </div>
    </div>
  );
};

export const ModalContainer: React.FC = () => {
  const modalManager = useModalManager();
  const openModals = useOpenModals();
  const modalStack = useModalStack();
  const activeModal = useActiveModal();

  // Create portal container
  const [portalContainer, setPortalContainer] = React.useState<HTMLElement | null>(null);

  useEffect(() => {
    // Create or get portal container
    let container = document.getElementById('modal-portal');
    if (!container) {
      container = document.createElement('div');
      container.id = 'modal-portal';
      document.body.appendChild(container);
    }
    setPortalContainer(container);

    return () => {
      // Cleanup when no modals are open
      if (openModals.length === 0 && container && container.parentNode) {
        container.parentNode.removeChild(container);
      }
    };
  }, [openModals.length]);

  // Prevent body scroll when modals are open
  useEffect(() => {
    if (openModals.length > 0) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [openModals.length]);

  if (!portalContainer || openModals.length === 0) {
    return null;
  }

  return createPortal(
    <div className="modal-container">
      {modalStack.map((modal, index) => {
        const isActive = activeModal?.id === modal.id;
        
        return (
          <ModalWrapper
            key={modal.id}
            modal={modal}
            isActive={isActive}
            onClose={() => modalManager.closeModal(modal.id)}
          >
            {/* Modal content would be rendered based on modal.component */}
            <div>
              <p>Modal content for: {modal.title}</p>
              <p>Component: {modal.component}</p>
              <pre className="text-xs bg-gray-100 dark:bg-gray-900 p-2 rounded mt-2">
                {JSON.stringify(modal.props, null, 2)}
              </pre>
            </div>
          </ModalWrapper>
        );
      })}
    </div>,
    portalContainer
  );
};

export default ModalContainer;