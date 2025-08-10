import React, { useState } from 'react';
import { DetailModal } from './DetailModal';
// import { useMindmapStore } from '../../hooks/useMindmapStore';
import { 
  useNodeDetailModal, 
  useConnectionDetailModal,
  useAnalyticsDetailModal 
} from '../../hooks/useDetailModal';
// import type { MindmapNode, MindmapConnection } from '../../types/store';

/**
 * Example component demonstrating DetailModal usage
 */
export const DetailModalExample: React.FC = () => {
  const [activeModal, setActiveModal] = useState<string | null>(null);
  
  // Get mindmap data for examples - commented out unused variables
  // const { nodes, connections, analytics } = useMindmapStore();
  
  // Sample data for examples
  const sampleNodeData = {
    nodeId: 'example-node',
    text: 'Sample Node',
    type: 'main',
    position: { x: 400, y: 300 },
    color: '#667eea',
    tags: ['example', 'demo', 'react'],
    metadata: {
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      attachments: [
        { id: '1', name: 'document.pdf', type: 'pdf', size: 1024 }
      ]
    },
    connections: [
      {
        id: 'conn-1',
        type: 'associative',
        targetNodeId: 'target-1',
        targetNodeText: 'Related Node 1'
      },
      {
        id: 'conn-2', 
        type: 'dependency',
        targetNodeId: 'target-2',
        targetNodeText: 'Dependent Node'
      }
    ]
  };

  const sampleConnectionData = {
    connectionId: 'example-connection',
    type: 'associative',
    sourceNodeId: 'node-1',
    targetNodeId: 'node-2',
    sourceNodeText: 'Source Node',
    targetNodeText: 'Target Node',
    label: 'relates to',
    style: {
      color: '#764ba2',
      width: 2,
      arrowType: 'arrow'
    }
  };

  const sampleAnalyticsData = {
    overview: {
      totalNodes: 25,
      totalConnections: 18,
      averageDepth: 3.2,
      lastModified: new Date().toISOString()
    },
    performance: {
      renderTime: 120,
      memoryUsage: 15.6,
      cacheHitRate: 0.85
    },
    usage: {
      mostEditedNode: 'central-node',
      recentActivity: [
        { action: 'node_created', timestamp: Date.now() - 300000 },
        { action: 'connection_added', timestamp: Date.now() - 600000 }
      ]
    }
  };

  // Initialize modal hooks
  const nodeModal = useNodeDetailModal(sampleNodeData, {
    initialSize: 'normal',
    autoSave: true
  });

  const connectionModal = useConnectionDetailModal(sampleConnectionData, {
    initialSize: 'normal'
  });

  const analyticsModal = useAnalyticsDetailModal(sampleAnalyticsData, {
    initialSize: 'expanded'
  });

  // Handle modal actions
  const openModal = (modalType: string) => {
    setActiveModal(modalType);
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  return (
    <div style={{ 
      padding: '40px', 
      maxWidth: '1200px', 
      margin: '0 auto',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Header */}
      <div style={{ marginBottom: '40px', textAlign: 'center' }}>
        <h1 style={{ 
          fontSize: '32px', 
          fontWeight: '700',
          color: '#1a202c',
          marginBottom: '12px'
        }}>
          DetailModal Component Examples
        </h1>
        <p style={{ 
          fontSize: '18px', 
          color: '#718096',
          lineHeight: '1.6'
        }}>
          Interactive examples showing DetailModal with expand/collapse functionality
        </p>
      </div>

      {/* Example Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
        gap: '24px',
        marginBottom: '40px'
      }}>
        
        {/* Node Detail Modal Example */}
        <div style={{
          background: 'white',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
        }}>
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ 
              fontSize: '20px', 
              fontWeight: '600',
              color: '#2d3748',
              marginBottom: '8px'
            }}>
              Node Details Modal
            </h3>
            <p style={{ 
              fontSize: '14px', 
              color: '#718096',
              lineHeight: '1.5'
            }}>
              Display detailed information about mindmap nodes with editing capabilities.
              Supports expand/collapse for additional metadata and connections.
            </p>
          </div>
          
          <div style={{ marginBottom: '16px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#4a5568' }}>
              Features:
            </h4>
            <ul style={{ 
              fontSize: '13px', 
              color: '#718096',
              paddingLeft: '16px',
              margin: 0
            }}>
              <li>Editable text and properties</li>
              <li>Tag management</li>
              <li>Connection overview</li>
              <li>Metadata display</li>
            </ul>
          </div>

          <button
            onClick={() => openModal('node')}
            style={{
              width: '100%',
              padding: '12px 20px',
              background: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#5a67d8';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#667eea';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            Open Node Details
          </button>
        </div>

        {/* Connection Detail Modal Example */}
        <div style={{
          background: 'white',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
        }}>
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ 
              fontSize: '20px', 
              fontWeight: '600',
              color: '#2d3748',
              marginBottom: '8px'
            }}>
              Connection Details Modal
            </h3>
            <p style={{ 
              fontSize: '14px', 
              color: '#718096',
              lineHeight: '1.5'
            }}>
              View and edit connection properties between nodes.
              Shows connection path, type, and styling information.
            </p>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#4a5568' }}>
              Features:
            </h4>
            <ul style={{ 
              fontSize: '13px', 
              color: '#718096',
              paddingLeft: '16px',
              margin: 0
            }}>
              <li>Connection path visualization</li>
              <li>Type and label editing</li>
              <li>Style properties</li>
              <li>Visual color/width preview</li>
            </ul>
          </div>

          <button
            onClick={() => openModal('connection')}
            style={{
              width: '100%',
              padding: '12px 20px',
              background: '#764ba2',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#6b46c1';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#764ba2';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            Open Connection Details
          </button>
        </div>

        {/* Analytics Modal Example */}
        <div style={{
          background: 'white',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
        }}>
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ 
              fontSize: '20px', 
              fontWeight: '600',
              color: '#2d3748',
              marginBottom: '8px'
            }}>
              Analytics Dashboard Modal
            </h3>
            <p style={{ 
              fontSize: '14px', 
              color: '#718096',
              lineHeight: '1.5'
            }}>
              Comprehensive analytics and performance metrics.
              Opens in expanded view by default for better data visibility.
            </p>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#4a5568' }}>
              Features:
            </h4>
            <ul style={{ 
              fontSize: '13px', 
              color: '#718096',
              paddingLeft: '16px',
              margin: 0
            }}>
              <li>Performance metrics</li>
              <li>Usage statistics</li>
              <li>Memory and render data</li>
              <li>Activity timeline</li>
            </ul>
          </div>

          <button
            onClick={() => openModal('analytics')}
            style={{
              width: '100%',
              padding: '12px 20px',
              background: '#48bb78',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#38a169';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#48bb78';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            Open Analytics Dashboard
          </button>
        </div>
      </div>

      {/* Usage Instructions */}
      <div style={{
        background: '#f7fafc',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '40px'
      }}>
        <h3 style={{ 
          fontSize: '18px', 
          fontWeight: '600',
          color: '#2d3748',
          marginBottom: '16px'
        }}>
          Modal Controls & Keyboard Shortcuts
        </h3>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '16px'
        }}>
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#4a5568' }}>
              Size Controls:
            </h4>
            <ul style={{ fontSize: '13px', color: '#718096', paddingLeft: '16px', margin: 0 }}>
              <li>Click size buttons (C/N/E/F) in header</li>
              <li><code>Ctrl/Cmd + +</code> - Expand</li>
              <li><code>Ctrl/Cmd + -</code> - Collapse</li>
              <li><code>Ctrl/Cmd + F</code> - Fullscreen</li>
            </ul>
          </div>
          
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#4a5568' }}>
              Navigation:
            </h4>
            <ul style={{ fontSize: '13px', color: '#718096', paddingLeft: '16px', margin: 0 }}>
              <li><code>Escape</code> - Close modal</li>
              <li><code>Tab</code> - Navigate elements</li>
              <li>Click backdrop to close</li>
              <li>Focus management</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Render Active Modals */}
      {activeModal === 'node' && (
        <DetailModal
          id="node-example"
          isOpen={true}
          onClose={closeModal}
          content={nodeModal.modalProps.content!}
          data={nodeModal.modalProps.data!}
          expandConfig={nodeModal.modalProps.expandConfig}
          currentSize={nodeModal.modalProps.currentSize}
          animationState={nodeModal.modalProps.animationState}
          onExpand={nodeModal.modalProps.onExpand}
          onCollapse={nodeModal.modalProps.onCollapse}
          onSizeChange={nodeModal.modalProps.onSizeChange}
          onDataChange={nodeModal.modalProps.onDataChange}
          onEdit={nodeModal.modalProps.onEdit}
          onSave={nodeModal.modalProps.onSave}
          onCancel={nodeModal.modalProps.onCancel}
        />
      )}

      {activeModal === 'connection' && (
        <DetailModal
          id="connection-example"
          isOpen={true}
          onClose={closeModal}
          content={connectionModal.modalProps.content!}
          data={connectionModal.modalProps.data!}
          expandConfig={connectionModal.modalProps.expandConfig}
          currentSize={connectionModal.modalProps.currentSize}
          animationState={connectionModal.modalProps.animationState}
          onExpand={connectionModal.modalProps.onExpand}
          onCollapse={connectionModal.modalProps.onCollapse}
          onSizeChange={connectionModal.modalProps.onSizeChange}
          onDataChange={connectionModal.modalProps.onDataChange}
          onEdit={connectionModal.modalProps.onEdit}
          onSave={connectionModal.modalProps.onSave}
          onCancel={connectionModal.modalProps.onCancel}
        />
      )}

      {activeModal === 'analytics' && (
        <DetailModal
          id="analytics-example"
          isOpen={true}
          onClose={closeModal}
          content={analyticsModal.modalProps.content!}
          data={analyticsModal.modalProps.data!}
          expandConfig={analyticsModal.modalProps.expandConfig}
          currentSize={analyticsModal.modalProps.currentSize}
          animationState={analyticsModal.modalProps.animationState}
          onExpand={analyticsModal.modalProps.onExpand}
          onCollapse={analyticsModal.modalProps.onCollapse}
          onSizeChange={analyticsModal.modalProps.onSizeChange}
          onDataChange={analyticsModal.modalProps.onDataChange}
          onEdit={analyticsModal.modalProps.onEdit}
          onSave={analyticsModal.modalProps.onSave}
          onCancel={analyticsModal.modalProps.onCancel}
        />
      )}
    </div>
  );
};

export default DetailModalExample;