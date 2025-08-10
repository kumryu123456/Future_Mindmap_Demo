import React, { memo, useState, useRef, useEffect } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import type { MindmapNode as MindmapNodeType } from '../../types/store';

// Node data interface for React Flow
export interface ReactFlowNodeData extends Omit<MindmapNodeType, 'x' | 'y'> {
  onNodeEdit: (id: string, text: string) => void;
  onNodeExpand: (id: string) => void;
  onNodeCollapse: (id: string) => void;
  onTagAdd: (id: string, tag: string) => void;
  onTagRemove: (id: string, tag: string) => void;
}

// Base Node Component
const BaseNode: React.FC<NodeProps<ReactFlowNodeData>> = ({ 
  data, 
  selected, 
  dragging,
  id 
}) => {
  const [isEditing, setIsEditing] = useState(data.isEditing);
  const [editText, setEditText] = useState(data.text);
  const [showTagInput, setShowTagInput] = useState(false);
  const [newTag, setNewTag] = useState('');
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const tagInputRef = useRef<HTMLInputElement>(null);

  // Sync editing state
  useEffect(() => {
    setIsEditing(data.isEditing);
    if (data.isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [data.isEditing]);

  // Focus tag input when shown
  useEffect(() => {
    if (showTagInput && tagInputRef.current) {
      tagInputRef.current.focus();
    }
  }, [showTagInput]);

  const handleEditStart = () => {
    if (!isEditing) {
      setIsEditing(true);
      setEditText(data.text);
    }
  };

  const handleEditEnd = () => {
    if (isEditing) {
      setIsEditing(false);
      if (editText.trim() !== data.text) {
        data.onNodeEdit(data.id, editText.trim());
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleEditEnd();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditText(data.text);
    }
  };

  const handleToggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (data.isExpanded) {
      data.onNodeCollapse(data.id);
    } else {
      data.onNodeExpand(data.id);
    }
  };

  const handleAddTag = () => {
    if (newTag.trim()) {
      data.onTagAdd(data.id, newTag.trim());
      setNewTag('');
      setShowTagInput(false);
    }
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddTag();
    } else if (e.key === 'Escape') {
      setNewTag('');
      setShowTagInput(false);
    }
  };

  const nodeStyle = {
    width: data.width || 120,
    minHeight: data.height || 60,
    backgroundColor: data.backgroundColor || data.color,
    borderRadius: data.borderRadius || 8,
    borderWidth: data.borderWidth || 2,
    borderColor: selected ? '#667eea' : (data.borderColor || '#e2e8f0'),
    borderStyle: 'solid',
    color: data.color === data.backgroundColor ? '#2d3748' : '#ffffff',
    fontSize: data.fontSize || 14,
    fontWeight: data.fontWeight || 'normal',
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
    boxShadow: selected ? '0 0 0 2px #667eea40' : 
               dragging ? '0 8px 25px rgba(0,0,0,0.15)' : 
               '0 2px 8px rgba(0,0,0,0.1)',
    transform: dragging ? 'scale(1.02)' : 'scale(1)',
    transition: dragging ? 'none' : 'all 0.2s ease',
    opacity: data.isVisible ? 1 : 0.3,
    position: 'relative' as const
  };

  // Apply custom gradient if available
  if (data.style?.gradient) {
    const { start, end, direction } = data.style.gradient;
    nodeStyle.background = `linear-gradient(${direction}deg, ${start}, ${end})`;
  }

  // Apply custom shadow if available
  if (data.style?.shadow?.enabled) {
    const { color, blur, offsetX, offsetY } = data.style.shadow;
    nodeStyle.boxShadow = selected ? 
      `0 0 0 2px #667eea40, ${offsetX}px ${offsetY}px ${blur}px ${color}` :
      `${offsetX}px ${offsetY}px ${blur}px ${color}`;
  }

  const getNodeTypeClass = () => {
    switch (data.type) {
      case 'central':
        return 'mindmap-node-central';
      case 'main':
        return 'mindmap-node-main';
      case 'sub':
        return 'mindmap-node-sub';
      case 'note':
        return 'mindmap-node-note';
      default:
        return 'mindmap-node-default';
    }
  };

  const shouldShowHandles = data.type !== 'central' || data.children.length > 0;
  const hasChildren = data.children.length > 0;

  return (
    <div 
      className={`mindmap-node ${getNodeTypeClass()}`}
      style={nodeStyle}
    >
      {/* Input Handle - Only show for non-central nodes */}
      {data.type !== 'central' && (
        <Handle
          type="target"
          position={Position.Left}
          style={{
            background: data.borderColor || '#e2e8f0',
            width: 8,
            height: 8,
            border: `2px solid ${data.backgroundColor || data.color}`,
            left: -6
          }}
        />
      )}

      {/* Node Content */}
      <div className="mindmap-node-content" style={{ padding: '8px 12px' }}>
        {/* Expansion Toggle */}
        {hasChildren && (
          <button
            onClick={handleToggleExpand}
            className="mindmap-node-expand-btn"
            style={{
              position: 'absolute',
              top: -8,
              right: -8,
              width: 20,
              height: 20,
              borderRadius: '50%',
              border: `2px solid ${data.backgroundColor || data.color}`,
              background: data.isExpanded ? '#48bb78' : '#ed8936',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: 'bold',
              zIndex: 10
            }}
            aria-label={data.isExpanded ? 'Collapse node' : 'Expand node'}
          >
            {data.isExpanded ? '−' : '+'}
          </button>
        )}

        {/* Icon */}
        {data.style?.icon && (
          <div 
            className="mindmap-node-icon"
            style={{ 
              marginBottom: 4,
              fontSize: data.style.icon.size || 16,
              color: data.style.icon.color || 'currentColor'
            }}
          >
            {data.style.icon.name}
          </div>
        )}

        {/* Text Content */}
        {isEditing ? (
          <textarea
            ref={textareaRef}
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onBlur={handleEditEnd}
            onKeyDown={handleKeyDown}
            style={{
              width: '100%',
              minHeight: '1.5em',
              border: 'none',
              outline: 'none',
              background: 'transparent',
              color: 'inherit',
              fontSize: 'inherit',
              fontFamily: 'inherit',
              fontWeight: 'inherit',
              resize: 'none',
              padding: 0,
              margin: 0
            }}
            aria-label="Edit node text"
          />
        ) : (
          <div
            onDoubleClick={handleEditStart}
            style={{
              cursor: 'text',
              wordBreak: 'break-word',
              lineHeight: '1.4',
              minHeight: '1.5em'
            }}
          >
            {data.text}
          </div>
        )}

        {/* Tags */}
        {data.tags && data.tags.length > 0 && (
          <div className="mindmap-node-tags" style={{ marginTop: 6, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {data.tags.map((tag, index) => (
              <span
                key={index}
                className="mindmap-node-tag"
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  color: 'currentColor',
                  fontSize: '10px',
                  padding: '2px 6px',
                  borderRadius: '10px',
                  border: '1px solid rgba(255,255,255,0.3)',
                  cursor: 'pointer',
                  position: 'relative'
                }}
                onClick={() => data.onTagRemove(data.id, tag)}
                title={`Remove tag: ${tag}`}
              >
                {tag} ×
              </span>
            ))}
          </div>
        )}

        {/* Tag Input */}
        {showTagInput && (
          <div style={{ marginTop: 6 }}>
            <input
              ref={tagInputRef}
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={handleTagKeyDown}
              onBlur={() => setShowTagInput(false)}
              placeholder="Add tag..."
              style={{
                width: '100%',
                padding: '2px 4px',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: '4px',
                background: 'rgba(255,255,255,0.1)',
                color: 'inherit',
                fontSize: '10px',
                outline: 'none'
              }}
            />
          </div>
        )}

        {/* Add Tag Button */}
        {!showTagInput && (
          <button
            onClick={() => setShowTagInput(true)}
            style={{
              position: 'absolute',
              bottom: -8,
              left: -8,
              width: 16,
              height: 16,
              borderRadius: '50%',
              border: 'none',
              background: '#667eea',
              color: 'white',
              cursor: 'pointer',
              fontSize: '10px',
              fontWeight: 'bold',
              display: selected ? 'flex' : 'none',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Add tag"
          >
            #
          </button>
        )}

        {/* Attachments Indicator */}
        {data.metadata?.attachments && data.metadata.attachments.length > 0 && (
          <div
            style={{
              position: 'absolute',
              top: -8,
              left: -8,
              width: 16,
              height: 16,
              borderRadius: '50%',
              background: '#f093fb',
              color: 'white',
              fontSize: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold'
            }}
            title={`${data.metadata.attachments.length} attachment(s)`}
          >
            📎
          </div>
        )}
      </div>

      {/* Output Handle - Show for all nodes that can have children */}
      {shouldShowHandles && (
        <Handle
          type="source"
          position={Position.Right}
          style={{
            background: data.borderColor || '#e2e8f0',
            width: 8,
            height: 8,
            border: `2px solid ${data.backgroundColor || data.color}`,
            right: -6
          }}
        />
      )}
    </div>
  );
};

// Specialized Node Components
export const CentralNode = memo((props: NodeProps<ReactFlowNodeData>) => (
  <BaseNode {...props} />
));

export const MainNode = memo((props: NodeProps<ReactFlowNodeData>) => (
  <BaseNode {...props} />
));

export const SubNode = memo((props: NodeProps<ReactFlowNodeData>) => (
  <BaseNode {...props} />
));

export const NoteNode = memo((props: NodeProps<ReactFlowNodeData>) => (
  <BaseNode {...props} />
));

// Node type mapping for React Flow
export const nodeTypes = {
  central: CentralNode,
  main: MainNode,
  sub: SubNode,
  note: NoteNode
};

export default BaseNode;