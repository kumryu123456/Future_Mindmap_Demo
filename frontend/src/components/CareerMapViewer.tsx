import React, { useState, useCallback } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  ConnectionMode,
  Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { CareerMap } from '../types/career';
import './CareerMapViewer.css';

interface CareerMapViewerProps {
  careerMap: CareerMap;
  readOnly?: boolean;
  onClose?: () => void;
}

const CareerMapViewer: React.FC<CareerMapViewerProps> = ({ 
  careerMap, 
  readOnly = true, 
  onClose 
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Convert CareerMap to ReactFlow format
  const convertToReactFlowNodes = useCallback((): Node[] => {
    return careerMap.nodes.map(node => ({
      id: node.id,
      type: 'default',
      position: { x: node.x, y: node.y },
      data: { 
        label: (
          <div className={`career-node career-node-${node.type}`}>
            <div className="node-title">{node.title}</div>
            {node.description && (
              <div className="node-description">{node.description}</div>
            )}
            <div className="node-level">Level {node.level}</div>
            {node.metadata?.skills && node.metadata.skills.length > 0 && (
              <div className="node-skills">
                {node.metadata.skills.slice(0, 2).map(skill => (
                  <span key={skill} className="skill-chip">{skill}</span>
                ))}
              </div>
            )}
          </div>
        )
      },
      style: {
        background: node.color || getNodeColor(node.type),
        border: selectedNodeId === node.id ? '3px solid #3b82f6' : '1px solid #e5e7eb',
        borderRadius: '12px',
        padding: '0',
        width: 'auto',
        minWidth: '150px',
        color: '#1f2937'
      },
      draggable: !readOnly,
      selectable: true
    }));
  }, [careerMap.nodes, selectedNodeId, readOnly]);

  const convertToReactFlowEdges = useCallback((): Edge[] => {
    return careerMap.connections.map(connection => ({
      id: connection.id,
      source: connection.fromNodeId,
      target: connection.toNodeId,
      type: 'default',
      style: {
        stroke: getEdgeColor(connection.type),
        strokeWidth: 2
      },
      markerEnd: {
        type: 'arrowclosed',
        color: getEdgeColor(connection.type)
      }
    }));
  }, [careerMap.connections]);

  const getNodeColor = (type: string) => {
    switch (type) {
      case 'center': return '#3b82f6';
      case 'major': return '#10b981';
      case 'detail': return '#f59e0b';
      case 'goal': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getEdgeColor = (type: string) => {
    switch (type) {
      case 'sequential': return '#3b82f6';
      case 'parallel': return '#10b981';
      case 'optional': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const [nodes, setNodes, onNodesChange] = useNodesState(convertToReactFlowNodes());
  const [edges, setEdges, onEdgesChange] = useEdgesState(convertToReactFlowEdges());

  const handleNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    if (readOnly) {
      setSelectedNodeId(node.id);
      setShowDetails(true);
    }
  }, [readOnly]);

  const selectedNode = careerMap.nodes.find(node => node.id === selectedNodeId);

  return (
    <div className="career-map-viewer">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={readOnly ? undefined : onNodesChange}
        onEdgesChange={readOnly ? undefined : onEdgesChange}
        onNodeClick={handleNodeClick}
        connectionMode={ConnectionMode.Loose}
        fitView
        attributionPosition="bottom-left"
        className="career-flow"
        nodesDraggable={!readOnly}
        nodesConnectable={!readOnly}
        elementsSelectable={true}
      >
        <Background />
        <Controls showInteractive={!readOnly} />
        <MiniMap 
          nodeColor={(node) => {
            const careerNode = careerMap.nodes.find(n => n.id === node.id);
            return careerNode ? careerNode.color : '#6b7280';
          }}
          nodeStrokeWidth={3}
          zoomable
          pannable
        />
        
        {/* Info Panel */}
        <Panel position="top-left" className="info-panel">
          <div className="map-info">
            <h3>{careerMap.title}</h3>
            <p>{careerMap.description}</p>
            <div className="map-stats">
              <span>{careerMap.nodes.length} 노드</span>
              <span>{careerMap.connections.length} 연결</span>
              <span>❤️ {careerMap.likes}</span>
            </div>
          </div>
        </Panel>

        {/* Legend Panel */}
        <Panel position="top-right" className="legend-panel">
          <div className="legend">
            <h4>노드 타입</h4>
            <div className="legend-items">
              <div className="legend-item">
                <div className="legend-color" style={{ backgroundColor: '#3b82f6' }}></div>
                <span>중심</span>
              </div>
              <div className="legend-item">
                <div className="legend-color" style={{ backgroundColor: '#10b981' }}></div>
                <span>주요</span>
              </div>
              <div className="legend-item">
                <div className="legend-color" style={{ backgroundColor: '#f59e0b' }}></div>
                <span>세부</span>
              </div>
              <div className="legend-item">
                <div className="legend-color" style={{ backgroundColor: '#ef4444' }}></div>
                <span>목표</span>
              </div>
            </div>
          </div>
        </Panel>

        {onClose && (
          <Panel position="bottom-right" className="action-panel">
            <button className="close-button" onClick={onClose}>
              닫기
            </button>
          </Panel>
        )}
      </ReactFlow>

      {/* Node Details Modal */}
      {showDetails && selectedNode && (
        <div className="node-details-modal">
          <div className="modal-overlay" onClick={() => setShowDetails(false)} />
          <div className="modal-content">
            <div className="modal-header">
              <h3>{selectedNode.title}</h3>
              <button 
                className="modal-close"
                onClick={() => setShowDetails(false)}
              >
                ✕
              </button>
            </div>
            
            <div className="modal-body">
              {selectedNode.description && (
                <div className="detail-section">
                  <h4>설명</h4>
                  <p>{selectedNode.description}</p>
                </div>
              )}

              <div className="detail-section">
                <h4>정보</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">타입:</span>
                    <span className="detail-value">{selectedNode.type}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">레벨:</span>
                    <span className="detail-value">{selectedNode.level}</span>
                  </div>
                </div>
              </div>

              {selectedNode.metadata?.skills && selectedNode.metadata.skills.length > 0 && (
                <div className="detail-section">
                  <h4>필요 스킬</h4>
                  <div className="skills-container">
                    {selectedNode.metadata.skills.map(skill => (
                      <span key={skill} className="skill-tag">{skill}</span>
                    ))}
                  </div>
                </div>
              )}

              {selectedNode.metadata?.timeframe && (
                <div className="detail-section">
                  <h4>예상 기간</h4>
                  <p>{selectedNode.metadata.timeframe}</p>
                </div>
              )}

              {selectedNode.metadata?.difficulty && (
                <div className="detail-section">
                  <h4>난이도</h4>
                  <span className={`difficulty-badge difficulty-${selectedNode.metadata.difficulty}`}>
                    {selectedNode.metadata.difficulty === 'beginner' ? '초급' :
                     selectedNode.metadata.difficulty === 'intermediate' ? '중급' : '고급'}
                  </span>
                </div>
              )}

              {selectedNode.metadata?.resources && selectedNode.metadata.resources.length > 0 && (
                <div className="detail-section">
                  <h4>추천 리소스</h4>
                  <div className="resources-list">
                    {selectedNode.metadata.resources.map(resource => (
                      <div key={resource.id} className="resource-item">
                        <div className="resource-title">{resource.title}</div>
                        <div className="resource-type">{resource.type}</div>
                        {resource.rating && (
                          <div className="resource-rating">
                            {'⭐'.repeat(Math.floor(resource.rating))} {resource.rating}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CareerMapViewer;