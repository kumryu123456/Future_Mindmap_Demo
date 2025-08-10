import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useUIStore as useUIState } from '../../hooks/useUIStore';
import {
  NodeDetailContent,
  ConnectionDetailContent,
  GenericDetailContent
} from './DetailModalContent';
import type {
  DetailModalProps,
  DetailModalSize
} from '../../types/components/detailModal';
import { DETAIL_MODAL_SIZES } from '../../types/components/detailModal';

/**
 * DetailModal component with expand/collapse functionality
 * Integrates with the existing UI store modal system
 */
export const DetailModal: React.FC<DetailModalProps> = ({
  id,
  isOpen,
  content,
  data,
  expandConfig,
  modalConfig,
  currentSize = expandConfig?.defaultSize || 'normal',
  // animationState = 'idle',
  style,
  className = '',
  onClose,
  onExpand,
  onCollapse,
  onSizeChange,
  onDataChange,
  onEdit,
  onSave,
  onCancel
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [internalSize, setInternalSize] = useState<DetailModalSize>(currentSize);
  
  // Get UI store for theme
  const { state: uiState } = useUIState();
  const { theme } = uiState;

  // Get size configuration
  const sizeConfig = DETAIL_MODAL_SIZES[internalSize];

  // Handle size changes
  const handleSizeChange = useCallback((newSize: DetailModalSize) => {
    if (newSize === internalSize || isAnimating) return;

    setIsAnimating(true);
    const previousSize = internalSize;
    
    // Trigger size change callback
    onSizeChange?.(newSize, previousSize);
    
    // Update internal size
    setInternalSize(newSize);
    
    // Notify expand/collapse handlers
    if (newSize > previousSize) {
      onExpand?.(newSize);
    } else {
      onCollapse?.(newSize);
    }

    // Reset animation state after duration
    setTimeout(() => {
      setIsAnimating(false);
    }, expandConfig?.animationDuration || 300);
  }, [internalSize, isAnimating, expandConfig?.animationDuration, onExpand, onCollapse, onSizeChange]);

  // Handle keyboard shortcuts
  useEffect(() => {
    if (!isOpen || !expandConfig?.keyboardShortcuts) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.target !== modalRef.current && !modalRef.current?.contains(event.target as Node)) {
        return;
      }

      switch (event.key) {
        case 'Escape':
          onClose();
          break;
        case '=':
        case '+':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            const currentIndex = expandConfig.availableSizes.indexOf(internalSize);
            const nextIndex = Math.min(currentIndex + 1, expandConfig.availableSizes.length - 1);
            const nextSize = expandConfig.availableSizes[nextIndex];
            if (nextSize !== internalSize) {
              handleSizeChange(nextSize);
            }
          }
          break;
        case '-':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            const currentIndex = expandConfig.availableSizes.indexOf(internalSize);
            const prevIndex = Math.max(currentIndex - 1, 0);
            const prevSize = expandConfig.availableSizes[prevIndex];
            if (prevSize !== internalSize) {
              handleSizeChange(prevSize);
            }
          }
          break;
        case 'f':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            const fullscreenSize = expandConfig.availableSizes.includes('fullscreen') ? 'fullscreen' : expandConfig.availableSizes[expandConfig.availableSizes.length - 1];
            handleSizeChange(fullscreenSize);
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, expandConfig, internalSize, handleSizeChange, onClose]);

  // Handle focus management
  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus();
    }
  }, [isOpen]);

  // Handle click outside to close
  const handleBackdropClick = useCallback((event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  }, [onClose]);

  if (!isOpen) return null;

  const modalClasses = [
    'detail-modal',
    `detail-modal--${internalSize}`,
    `detail-modal--${content.type}`,
    isAnimating && 'detail-modal--animating',
    className
  ].filter(Boolean).join(' ');

  const modalStyles: React.CSSProperties = {
    width: sizeConfig.width,
    height: sizeConfig.height,
    maxWidth: '95vw',
    maxHeight: '95vh',
    ...style
  };

  const modalContent = (
    <div
      className="detail-modal-backdrop"
      onClick={handleBackdropClick}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        transition: `opacity ${expandConfig?.animationDuration || 300}ms ease-in-out`
      }}
    >
      <div
        ref={modalRef}
        className={modalClasses}
        style={{
          backgroundColor: theme.colors.surface,
          borderRadius: 12,
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          border: `1px solid ${theme.colors.border}`,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          transition: `all ${expandConfig?.animationDuration || 300}ms ease-in-out`,
          ...modalStyles
        }}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${id}-title`}
        aria-describedby={`${id}-content`}
        aria-expanded={internalSize === 'expanded' || internalSize === 'fullscreen'}
        aria-live="polite"
      >
        {/* Modal Header */}
        <div
          className="detail-modal-header"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: `1px solid ${theme.colors.border}`,
            flexShrink: 0
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {content.icon && (
              <div style={{ color: theme.colors.primary }}>
                {typeof content.icon === 'string' ? (
                  <span>{content.icon}</span>
                ) : (
                  <content.icon />
                )}
              </div>
            )}
            <div>
              <h2
                id={`${id}-title`}
                style={{
                  margin: 0,
                  fontSize: '18px',
                  fontWeight: '600',
                  color: theme.colors.text
                }}
              >
                {content.title}
              </h2>
              {content.subtitle && (
                <p
                  style={{
                    margin: '4px 0 0 0',
                    fontSize: '14px',
                    color: theme.colors.textSecondary
                  }}
                >
                  {content.subtitle}
                </p>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Expand/Collapse Controls */}
            {expandConfig?.enabled && (
              <div style={{ display: 'flex', gap: 4 }}>
                {expandConfig.availableSizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => handleSizeChange(size)}
                    disabled={size === internalSize || isAnimating}
                    title={`Resize to ${size}`}
                    aria-label={`Resize modal to ${size} view`}
                    aria-pressed={size === internalSize}
                    style={{
                      padding: '4px 8px',
                      border: 'none',
                      borderRadius: 4,
                      backgroundColor: size === internalSize ? theme.colors.primary : 'transparent',
                      color: size === internalSize ? 'white' : theme.colors.text,
                      cursor: size === internalSize ? 'default' : 'pointer',
                      fontSize: '12px',
                      opacity: isAnimating ? 0.5 : 1,
                      transition: 'all 150ms ease'
                    }}
                  >
                    {size.charAt(0).toUpperCase()}
                  </button>
                ))}
              </div>
            )}

            {/* Close Button */}
            <button
              onClick={onClose}
              style={{
                padding: '8px',
                border: 'none',
                borderRadius: 4,
                backgroundColor: 'transparent',
                color: theme.colors.textSecondary,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 150ms ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme.colors.error + '10';
                e.currentTarget.style.color = theme.colors.error;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = theme.colors.textSecondary;
              }}
              title="Close (Esc)"
              aria-label="Close modal"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.3 5.71a1 1 0 0 0-1.41 0L12 10.59 7.11 5.7A1 1 0 1 0 5.7 7.11L10.59 12 5.7 16.89a1 1 0 0 0 1.41 1.41L12 13.41l4.89 4.88a1 1 0 0 0 1.41-1.41L13.41 12l4.88-4.89a1 1 0 0 0 0-1.4z"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div
          id={`${id}-content`}
          className="detail-modal-content"
          style={{
            flex: 1,
            overflow: 'auto',
            padding: '20px'
          }}
        >
          {/* Content will be rendered by specific content components */}
          <DetailModalContent
            type={content.type}
            data={data}
            config={content}
            size={internalSize}
            isExpanded={internalSize === 'expanded' || internalSize === 'fullscreen'}
            onDataChange={onDataChange}
            onEdit={onEdit}
            onSave={onSave}
            onCancel={onCancel}
            onExpand={() => {
              const expandedSize = expandConfig?.availableSizes.includes('expanded') ? 'expanded' : 'fullscreen';
              handleSizeChange(expandedSize);
            }}
            onCollapse={() => {
              const collapsedSize = expandConfig?.availableSizes.includes('normal') ? 'normal' : 'compact';
              handleSizeChange(collapsedSize);
            }}
          />
        </div>

        {/* Resize Handle (for manual resizing) */}
        {internalSize !== 'fullscreen' && (
          <div
            className="detail-modal-resize-handle"
            role="button"
            tabIndex={0}
            aria-label="Resize modal by dragging"
            style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              width: 16,
              height: 16,
              cursor: 'se-resize',
              background: `linear-gradient(135deg, transparent 50%, ${theme.colors.border} 50%)`,
              opacity: 0.5
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                // Could trigger resize mode or show resize options
              }
            }}
          />
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

/**
 * Content renderer for different modal types
 */
interface DetailModalContentInternalProps {
  type: string;
  data: unknown;
  config: unknown;
  size: DetailModalSize;
  isExpanded: boolean;
  isEditing?: boolean;
  onDataChange?: (data: unknown) => void;
  onEdit?: () => void;
  onSave?: (data: unknown) => void;
  onCancel?: () => void;
  onExpand?: () => void;
  onCollapse?: () => void;
}

const DetailModalContent: React.FC<DetailModalContentInternalProps> = ({
  type,
  data,
  config,
  size,
  isExpanded,
  isEditing = false,
  onDataChange,
  onEdit,
  onSave,
  onCancel,
  onExpand,
  onCollapse
}) => {
  const contentProps = {
    data,
    config,
    size,
    isEditing,
    isExpanded,
    onDataChange,
    onEdit,
    onSave,
    onCancel,
    onExpand,
    onCollapse
  };

  switch (type) {
    case 'node':
      return <NodeDetailContent {...contentProps} data={data as any} config={config as any} />;
      
    case 'connection':
      return <ConnectionDetailContent {...contentProps} data={data as any} config={config as any} />;
      
    default:
      return <GenericDetailContent {...contentProps} data={data as Record<string, unknown>} config={config as any} />;
  }
};

export default DetailModal;