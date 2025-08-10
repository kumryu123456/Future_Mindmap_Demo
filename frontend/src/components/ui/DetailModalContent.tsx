import React, { useState, useCallback } from 'react';
import { useUIStore as useUIState } from '../../hooks/useUIStore';
import type {
  DetailModalContentProps,
  NodeDetailData,
  ConnectionDetailData
} from '../../types/components/detailModal';

/**
 * Node Detail Content Component
 */
export const NodeDetailContent: React.FC<DetailModalContentProps<NodeDetailData>> = ({
  data,
  config,
  size,
  isEditing,
  isExpanded,
  onDataChange,
  onEdit,
  onSave,
  onCancel
}) => {
  const { state: uiState } = useUIState();
  const { theme } = uiState;
  const [editData, setEditData] = useState(data);

  const handleSave = useCallback(() => {
    onSave?.(editData);
  }, [editData, onSave]);

  const handleCancel = useCallback(() => {
    setEditData(data);
    onCancel?.();
  }, [data, onCancel]);

  const handleFieldChange = useCallback((field: string, value: unknown) => {
    const newData = { ...editData, [field]: value };
    setEditData(newData);
    onDataChange?.(newData);
  }, [editData, onDataChange]);

  return (
    <div className="node-detail-content">
      {/* Basic Information */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ 
          margin: '0 0 16px 0', 
          color: theme.colors.text,
          fontSize: '16px',
          fontWeight: '600'
        }}>
          Node Information
        </h3>

        {/* Node Text */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{
            display: 'block',
            marginBottom: '6px',
            fontSize: '14px',
            fontWeight: '500',
            color: theme.colors.text
          }}>
            Text
          </label>
          {isEditing ? (
            <input
              type="text"
              value={editData.text || ''}
              onChange={(e) => handleFieldChange('text', e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: `1px solid ${theme.colors.border}`,
                borderRadius: '6px',
                backgroundColor: theme.colors.background,
                color: theme.colors.text,
                fontSize: '14px'
              }}
            />
          ) : (
            <div style={{
              padding: '8px 12px',
              backgroundColor: theme.colors.background,
              borderRadius: '6px',
              border: `1px solid ${theme.colors.border}`,
              fontSize: '14px',
              color: theme.colors.text
            }}>
              {data.text}
            </div>
          )}
        </div>

        {/* Node Type */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{
            display: 'block',
            marginBottom: '6px',
            fontSize: '14px',
            fontWeight: '500',
            color: theme.colors.text
          }}>
            Type
          </label>
          <div style={{
            padding: '8px 12px',
            backgroundColor: theme.colors.background,
            borderRadius: '6px',
            border: `1px solid ${theme.colors.border}`,
            fontSize: '14px',
            color: theme.colors.text
          }}>
            <span style={{
              padding: '2px 8px',
              backgroundColor: theme.colors.primary + '20',
              color: theme.colors.primary,
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: '500'
            }}>
              {data.type}
            </span>
          </div>
        </div>

        {/* Position */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          gap: '12px',
          marginBottom: '16px'
        }}>
          <div>
            <label style={{
              display: 'block',
              marginBottom: '6px',
              fontSize: '14px',
              fontWeight: '500',
              color: theme.colors.text
            }}>
              X Position
            </label>
            <div style={{
              padding: '8px 12px',
              backgroundColor: theme.colors.background,
              borderRadius: '6px',
              border: `1px solid ${theme.colors.border}`,
              fontSize: '14px',
              color: theme.colors.text
            }}>
              {Math.round(data.position?.x || 0)}
            </div>
          </div>
          <div>
            <label style={{
              display: 'block',
              marginBottom: '6px',
              fontSize: '14px',
              fontWeight: '500',
              color: theme.colors.text
            }}>
              Y Position
            </label>
            <div style={{
              padding: '8px 12px',
              backgroundColor: theme.colors.background,
              borderRadius: '6px',
              border: `1px solid ${theme.colors.border}`,
              fontSize: '14px',
              color: theme.colors.text
            }}>
              {Math.round(data.position?.y || 0)}
            </div>
          </div>
        </div>

        {/* Color */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{
            display: 'block',
            marginBottom: '6px',
            fontSize: '14px',
            fontWeight: '500',
            color: theme.colors.text
          }}>
            Color
          </label>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 12px',
            backgroundColor: theme.colors.background,
            borderRadius: '6px',
            border: `1px solid ${theme.colors.border}`
          }}>
            <div style={{
              width: '20px',
              height: '20px',
              borderRadius: '4px',
              backgroundColor: data.color,
              border: `1px solid ${theme.colors.border}`
            }} />
            <span style={{ fontSize: '14px', color: theme.colors.text }}>
              {data.color}
            </span>
          </div>
        </div>

        {/* Tags */}
        {data.tags && data.tags.length > 0 && (
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              marginBottom: '6px',
              fontSize: '14px',
              fontWeight: '500',
              color: theme.colors.text
            }}>
              Tags
            </label>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '6px'
            }}>
              {data.tags.map((tag, index) => (
                <span key={index} style={{
                  padding: '4px 8px',
                  backgroundColor: theme.colors.accent + '20',
                  color: theme.colors.accent,
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: '500'
                }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Connections (if expanded) */}
      {isExpanded && data.connections && data.connections.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <h4 style={{ 
            margin: '0 0 12px 0', 
            color: theme.colors.text,
            fontSize: '14px',
            fontWeight: '600'
          }}>
            Connections ({data.connections.length})
          </h4>
          <div style={{ 
            maxHeight: size === 'fullscreen' ? '400px' : '200px',
            overflow: 'auto'
          }}>
            {data.connections.map((connection) => (
              <div key={connection.id} style={{
                padding: '8px 12px',
                backgroundColor: theme.colors.background,
                borderRadius: '6px',
                border: `1px solid ${theme.colors.border}`,
                marginBottom: '8px'
              }}>
                <div style={{ 
                  fontSize: '12px', 
                  color: theme.colors.textSecondary,
                  marginBottom: '4px'
                }}>
                  {connection.type} connection
                </div>
                <div style={{ fontSize: '14px', color: theme.colors.text }}>
                  → {connection.targetNodeText}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Metadata (if expanded and available) */}
      {isExpanded && data.metadata && Object.keys(data.metadata).length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <h4 style={{ 
            margin: '0 0 12px 0', 
            color: theme.colors.text,
            fontSize: '14px',
            fontWeight: '600'
          }}>
            Metadata
          </h4>
          <pre style={{
            backgroundColor: theme.colors.background,
            padding: '12px',
            borderRadius: '6px',
            border: `1px solid ${theme.colors.border}`,
            fontSize: '12px',
            color: theme.colors.text,
            overflow: 'auto',
            maxHeight: size === 'fullscreen' ? '300px' : '150px',
            fontFamily: 'monospace'
          }}>
            {JSON.stringify(data.metadata, null, 2)}
          </pre>
        </div>
      )}

      {/* Action Buttons */}
      {config.editable && (
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '8px',
          paddingTop: '16px',
          borderTop: `1px solid ${theme.colors.border}`
        }}>
          {isEditing ? (
            <>
              <button
                onClick={handleCancel}
                style={{
                  padding: '8px 16px',
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: '6px',
                  backgroundColor: 'transparent',
                  color: theme.colors.text,
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: '6px',
                  backgroundColor: theme.colors.primary,
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Save Changes
              </button>
            </>
          ) : (
            <button
              onClick={onEdit}
              style={{
                padding: '8px 16px',
                border: `1px solid ${theme.colors.primary}`,
                borderRadius: '6px',
                backgroundColor: 'transparent',
                color: theme.colors.primary,
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Edit Node
            </button>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * Connection Detail Content Component
 */
export const ConnectionDetailContent: React.FC<DetailModalContentProps<ConnectionDetailData>> = ({
  data,
  config,
  size,
  isEditing,
  isExpanded,
  onDataChange,
  onEdit,
  onSave,
  onCancel
}) => {
  const { state: uiState } = useUIState();
  const { theme } = uiState;
  const [editData, setEditData] = useState(data);

  const handleSave = useCallback(() => {
    onSave?.(editData);
  }, [editData, onSave]);

  const handleCancel = useCallback(() => {
    setEditData(data);
    onCancel?.();
  }, [data, onCancel]);

  const handleFieldChange = useCallback((field: string, value: unknown) => {
    const newData = { ...editData, [field]: value };
    setEditData(newData);
    onDataChange?.(newData);
  }, [editData, onDataChange]);

  return (
    <div className="connection-detail-content">
      {/* Basic Information */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ 
          margin: '0 0 16px 0', 
          color: theme.colors.text,
          fontSize: '16px',
          fontWeight: '600'
        }}>
          Connection Information
        </h3>

        {/* Connection Type */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{
            display: 'block',
            marginBottom: '6px',
            fontSize: '14px',
            fontWeight: '500',
            color: theme.colors.text
          }}>
            Type
          </label>
          <div style={{
            padding: '8px 12px',
            backgroundColor: theme.colors.background,
            borderRadius: '6px',
            border: `1px solid ${theme.colors.border}`,
            fontSize: '14px',
            color: theme.colors.text
          }}>
            <span style={{
              padding: '2px 8px',
              backgroundColor: theme.colors.secondary + '20',
              color: theme.colors.secondary,
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: '500'
            }}>
              {data.type}
            </span>
          </div>
        </div>

        {/* Source and Target Nodes */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{
            display: 'block',
            marginBottom: '6px',
            fontSize: '14px',
            fontWeight: '500',
            color: theme.colors.text
          }}>
            Connection Path
          </label>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px',
            backgroundColor: theme.colors.background,
            borderRadius: '6px',
            border: `1px solid ${theme.colors.border}`
          }}>
            <div style={{
              padding: '6px 10px',
              backgroundColor: theme.colors.primary + '20',
              color: theme.colors.primary,
              borderRadius: '4px',
              fontSize: '13px',
              fontWeight: '500'
            }}>
              {data.sourceNodeText}
            </div>
            <div style={{
              fontSize: '18px',
              color: theme.colors.textSecondary
            }}>
              →
            </div>
            <div style={{
              padding: '6px 10px',
              backgroundColor: theme.colors.accent + '20',
              color: theme.colors.accent,
              borderRadius: '4px',
              fontSize: '13px',
              fontWeight: '500'
            }}>
              {data.targetNodeText}
            </div>
          </div>
        </div>

        {/* Label (if exists) */}
        {data.label && (
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              marginBottom: '6px',
              fontSize: '14px',
              fontWeight: '500',
              color: theme.colors.text
            }}>
              Label
            </label>
            {isEditing ? (
              <input
                type="text"
                value={editData.label || ''}
                onChange={(e) => handleFieldChange('label', e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: '6px',
                  backgroundColor: theme.colors.background,
                  color: theme.colors.text,
                  fontSize: '14px'
                }}
              />
            ) : (
              <div style={{
                padding: '8px 12px',
                backgroundColor: theme.colors.background,
                borderRadius: '6px',
                border: `1px solid ${theme.colors.border}`,
                fontSize: '14px',
                color: theme.colors.text
              }}>
                {data.label}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Style Information (if expanded) */}
      {isExpanded && data.style && (
        <div style={{ marginBottom: '24px' }}>
          <h4 style={{ 
            margin: '0 0 12px 0', 
            color: theme.colors.text,
            fontSize: '14px',
            fontWeight: '600'
          }}>
            Style Properties
          </h4>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: size === 'fullscreen' ? '1fr 1fr 1fr' : '1fr 1fr', 
            gap: '12px'
          }}>
            {/* Color */}
            <div>
              <label style={{
                display: 'block',
                marginBottom: '6px',
                fontSize: '12px',
                fontWeight: '500',
                color: theme.colors.text
              }}>
                Color
              </label>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 8px',
                backgroundColor: theme.colors.background,
                borderRadius: '4px',
                border: `1px solid ${theme.colors.border}`
              }}>
                <div style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '2px',
                  backgroundColor: data.style.color,
                  border: `1px solid ${theme.colors.border}`
                }} />
                <span style={{ fontSize: '12px', color: theme.colors.text }}>
                  {data.style.color}
                </span>
              </div>
            </div>

            {/* Width */}
            <div>
              <label style={{
                display: 'block',
                marginBottom: '6px',
                fontSize: '12px',
                fontWeight: '500',
                color: theme.colors.text
              }}>
                Width
              </label>
              <div style={{
                padding: '6px 8px',
                backgroundColor: theme.colors.background,
                borderRadius: '4px',
                border: `1px solid ${theme.colors.border}`,
                fontSize: '12px',
                color: theme.colors.text
              }}>
                {data.style.width}px
              </div>
            </div>

            {/* Arrow Type */}
            {size === 'fullscreen' && (
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '6px',
                  fontSize: '12px',
                  fontWeight: '500',
                  color: theme.colors.text
                }}>
                  Arrow
                </label>
                <div style={{
                  padding: '6px 8px',
                  backgroundColor: theme.colors.background,
                  borderRadius: '4px',
                  border: `1px solid ${theme.colors.border}`,
                  fontSize: '12px',
                  color: theme.colors.text
                }}>
                  {data.style.arrowType}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {config.editable && (
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '8px',
          paddingTop: '16px',
          borderTop: `1px solid ${theme.colors.border}`
        }}>
          {isEditing ? (
            <>
              <button
                onClick={handleCancel}
                style={{
                  padding: '8px 16px',
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: '6px',
                  backgroundColor: 'transparent',
                  color: theme.colors.text,
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: '6px',
                  backgroundColor: theme.colors.primary,
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Save Changes
              </button>
            </>
          ) : (
            <button
              onClick={onEdit}
              style={{
                padding: '8px 16px',
                border: `1px solid ${theme.colors.primary}`,
                borderRadius: '6px',
                backgroundColor: 'transparent',
                color: theme.colors.primary,
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Edit Connection
            </button>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * Generic Content Component for other types
 */
export const GenericDetailContent: React.FC<DetailModalContentProps<Record<string, unknown>>> = ({
  data,
  config,
  size,
  isExpanded
}) => {
  const { state: uiState } = useUIState();
  const { theme } = uiState;

  return (
    <div className="generic-detail-content">
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ 
          margin: '0 0 16px 0', 
          color: theme.colors.text,
          fontSize: '16px',
          fontWeight: '600'
        }}>
          {config.title}
        </h3>
        
        {config.subtitle && (
          <p style={{
            margin: '0 0 16px 0',
            color: theme.colors.textSecondary,
            fontSize: '14px'
          }}>
            {config.subtitle}
          </p>
        )}

        {isExpanded && (
          <div>
            <h4 style={{
              margin: '0 0 12px 0',
              color: theme.colors.text,
              fontSize: '14px',
              fontWeight: '600'
            }}>
              Raw Data
            </h4>
            <pre style={{
              backgroundColor: theme.colors.background,
              padding: '12px',
              borderRadius: '6px',
              border: `1px solid ${theme.colors.border}`,
              fontSize: '12px',
              color: theme.colors.text,
              overflow: 'auto',
              maxHeight: size === 'fullscreen' ? '400px' : '200px',
              fontFamily: 'monospace'
            }}>
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default {
  NodeDetailContent,
  ConnectionDetailContent,
  GenericDetailContent
};