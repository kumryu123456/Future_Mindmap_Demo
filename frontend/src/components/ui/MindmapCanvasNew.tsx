import React, { useCallback, useMemo, useEffect, useRef, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Connection,
  type Edge,
  type Node,
  ReactFlowProvider,
  Panel,
  type ReactFlowInstance,
  type OnConnect,
  type OnEdgesChange,
  type OnNodesChange,
  type NodeChange,
  type EdgeChange,
  SelectionMode,
  ConnectionMode
} from '@xyflow/react';
import { useMindmap } from '../../hooks/useMindmapStore';
import { nodeTypes } from './MindmapNode';
import { edgeTypes } from './MindmapEdge';
import type { ReactFlowNodeData } from './MindmapNode';
import type { ReactFlowEdgeData } from './MindmapEdge';
import type { MindmapNode as MindmapNodeType, MindmapConnection } from '../../types/store';

// Import React Flow styles
import '@xyflow/react/dist/style.css';

interface MindmapCanvasProps {
  className?: string;
  style?: React.CSSProperties;
  onNodeClick?: (node: MindmapNodeType) => void;
  onNodeDoubleClick?: (node: MindmapNodeType) => void;
  onConnectionClick?: (connection: MindmapConnection) => void;
  onCanvasClick?: (event: React.MouseEvent) => void;
  showMinimap?: boolean;
  showControls?: boolean;
  showBackground?: boolean;
  readonly?: boolean;
}

// Canvas component that uses the store
const MindmapCanvasContent: React.FC<MindmapCanvasProps> = ({
  className = '',
  style = {},
  onNodeClick,
  onNodeDoubleClick,
  onConnectionClick,
  onCanvasClick,
  showMinimap = true,
  showControls = true,
  showBackground = true,
  readonly = false
}) => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  
  // Store selectors and actions
  const store = useMindmap();
  const {
    nodes: storeNodes,
    connections: storeConnections,
    canvas,
    theme,
    selection
  } = store.state;
  
  const {
    createNode,
    deleteNode,
    moveNode,
    createConnection,
    deleteConnection,
    panCanvas,
    zoomCanvas,
    resizeCanvas,
    selectNode,
    deselectNode,
    selectNone,
    startNodeEdit,
    endNodeEdit,
    expandNode,
    collapseNode,
    addNodeTag,
    removeNodeTag
  } = store.actions;

  // Transform store data to React Flow format
  const reactFlowNodes: Node<ReactFlowNodeData>[] = useMemo(() => {
    return Object.values(storeNodes).map(node => ({
      id: node.id,
      type: node.type,
      position: { x: node.x, y: node.y },
      data: {
        ...node,
        onNodeEdit: (id: string, text: string) => {
          endNodeEdit(id, text);
        },
        onNodeExpand: (id: string) => {
          expandNode(id);
        },
        onNodeCollapse: (id: string) => {
          collapseNode(id);
        },
        onTagAdd: (id: string, tag: string) => {
          addNodeTag(id, tag);
        },
        onTagRemove: (id: string, tag: string) => {
          removeNodeTag(id, tag);
        }
      },
      selected: node.isSelected,
      hidden: !node.isVisible,
      draggable: !readonly,
      selectable: !readonly,
      deletable: !readonly && node.type !== 'central'
    }));
  }, [
    storeNodes, 
    endNodeEdit, 
    expandNode, 
    collapseNode, 
    addNodeTag, 
    removeNodeTag, 
    readonly
  ]);

  const reactFlowEdges: Edge<ReactFlowEdgeData>[] = useMemo(() => {
    return Object.values(storeConnections).map(connection => ({
      id: connection.id,
      source: connection.sourceNodeId,
      target: connection.targetNodeId,
      type: connection.type,
      data: {
        ...connection,
        onConnectionEdit: (id: string, label: string) => {
          // Update connection with new label
          // updateConnection(id, { label });
        },
        onConnectionDelete: (id: string) => {
          if (!readonly) {
            deleteConnection(id);
          }
        }
      },
      selected: connection.isSelected,
      hidden: !connection.isVisible,
      deletable: !readonly,
      style: {
        stroke: connection.style.color,
        strokeWidth: connection.style.width
      },
      animated: connection.type === 'sequence',
      markerEnd: {
        type: connection.style.arrowType === 'arrow' ? 'arrowclosed' : 'none',
        color: connection.style.color
      }
    }));
  }, [storeConnections, deleteConnection, readonly]);

  // React Flow state management
  const [nodes, setNodes, onNodesChange] = useNodesState(reactFlowNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(reactFlowEdges);

  // Update React Flow state when store changes
  useEffect(() => {
    setNodes(reactFlowNodes);
  }, [reactFlowNodes, setNodes]);

  useEffect(() => {
    setEdges(reactFlowEdges);
  }, [reactFlowEdges, setEdges]);

  // Handle node changes from React Flow
  const handleNodesChange: OnNodesChange = useCallback((changes: NodeChange[]) => {
    changes.forEach(change => {
      switch (change.type) {
        case 'position':
          if (change.position && change.id) {
            moveNode(change.id, change.position.x, change.position.y);
          }
          break;
        case 'select':
          if (change.id) {
            if (change.selected) {
              selectNode(change.id);
            } else {
              deselectNode(change.id);
            }
          }
          break;
        case 'remove':
          if (change.id && !readonly) {
            deleteNode(change.id);
          }
          break;
      }
    });
    
    // Apply changes to local state for immediate UI feedback
    onNodesChange(changes);
  }, [moveNode, selectNode, deselectNode, deleteNode, onNodesChange, readonly]);

  // Handle edge changes from React Flow
  const handleEdgesChange: OnEdgesChange = useCallback((changes: EdgeChange[]) => {
    changes.forEach(change => {
      switch (change.type) {
        case 'remove':
          if (change.id && !readonly) {
            deleteConnection(change.id);
          }
          break;
      }
    });
    
    onEdgesChange(changes);
  }, [deleteConnection, onEdgesChange, readonly]);

  // Handle new connections
  const handleConnect: OnConnect = useCallback((params: Connection) => {
    if (readonly) return;
    
    if (params.source && params.target) {
      createConnection(params.source, params.target, 'associative');
    }
  }, [createConnection, readonly]);

  // Handle node click events
  const onNodeClick = useCallback((event: React.MouseEvent, node: Node<ReactFlowNodeData>) => {
    event.stopPropagation();
    if (onNodeClick) {
      const storeNode = storeNodes[node.id];
      if (storeNode) {
        onNodeClick(storeNode);
      }
    }
  }, [onNodeClick, storeNodes]);

  // Handle node double click for editing
  const onNodeDoubleClick = useCallback((event: React.MouseEvent, node: Node<ReactFlowNodeData>) => {
    event.stopPropagation();
    if (!readonly) {
      startNodeEdit(node.id);
    }
    if (onNodeDoubleClick) {
      const storeNode = storeNodes[node.id];
      if (storeNode) {
        onNodeDoubleClick(storeNode);
      }
    }
  }, [onNodeDoubleClick, storeNodes, startNodeEdit, readonly]);

  // Handle edge click events
  const onEdgeClick = useCallback((event: React.MouseEvent, edge: Edge<ReactFlowEdgeData>) => {
    event.stopPropagation();
    if (onConnectionClick) {
      const storeConnection = storeConnections[edge.id];
      if (storeConnection) {
        onConnectionClick(storeConnection);
      }
    }
  }, [onConnectionClick, storeConnections]);

  // Handle canvas click
  const handlePaneClick = useCallback((event: React.MouseEvent) => {
    selectNone();
    if (onCanvasClick) {
      onCanvasClick(event);
    }
  }, [selectNone, onCanvasClick]);

  // Handle viewport changes
  const onMove = useCallback((event: Event, viewport: { x: number; y: number; zoom: number }) => {
    // Update store canvas state
    panCanvas(viewport.x - canvas.offsetX, viewport.y - canvas.offsetY);
    zoomCanvas(viewport.zoom);
  }, [panCanvas, zoomCanvas, canvas.offsetX, canvas.offsetY]);

  // Add new node on canvas double-click
  const onPaneDoubleClick = useCallback((event: React.MouseEvent) => {
    if (readonly || !reactFlowInstance) return;

    const bounds = reactFlowWrapper.current?.getBoundingClientRect();
    if (!bounds) return;

    const position = reactFlowInstance.screenToFlowPosition({
      x: event.clientX - bounds.left,
      y: event.clientY - bounds.top
    });

    createNode({
      text: 'New Node',
      x: position.x,
      y: position.y,
      type: 'sub'
    });
  }, [readonly, reactFlowInstance, createNode]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (readonly) return;

      // Delete selected elements
      if (event.key === 'Delete' || event.key === 'Backspace') {
        const selectedNodes = Object.values(storeNodes).filter(node => node.isSelected);
        const selectedConnections = Object.values(storeConnections).filter(conn => conn.isSelected);
        
        selectedNodes.forEach(node => {
          if (node.type !== 'central') { // Don't delete central node
            deleteNode(node.id);
          }
        });
        
        selectedConnections.forEach(connection => {
          deleteConnection(connection.id);
        });
      }
      
      // Copy/Paste shortcuts would go here
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case 'a':
            event.preventDefault();
            // Select all nodes
            Object.keys(storeNodes).forEach(nodeId => {
              selectNode(nodeId, true);
            });
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [storeNodes, storeConnections, deleteNode, deleteConnection, selectNode, readonly]);

  // Canvas resize handler
  useEffect(() => {
    const handleResize = () => {
      if (reactFlowWrapper.current) {
        const { clientWidth, clientHeight } = reactFlowWrapper.current;
        resizeCanvas(clientWidth, clientHeight);
      }
    };

    const resizeObserver = new ResizeObserver(handleResize);
    if (reactFlowWrapper.current) {
      resizeObserver.observe(reactFlowWrapper.current);
    }

    return () => resizeObserver.disconnect();
  }, [resizeCanvas]);

  const canvasStyle = {
    width: '100%',
    height: '100%',
    backgroundColor: canvas.backgroundColor,
    ...style
  };

  return (
    <div 
      ref={reactFlowWrapper} 
      className={`mindmap-canvas ${className}`}
      style={canvasStyle}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={handleConnect}
        onInit={setReactFlowInstance}
        onNodeClick={onNodeClick}
        onNodeDoubleClick={onNodeDoubleClick}
        onEdgeClick={onEdgeClick}
        onPaneClick={handlePaneClick}
        onPaneDoubleClick={onPaneDoubleClick}
        onMove={onMove}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        connectionMode={ConnectionMode.Loose}
        selectionMode={SelectionMode.Partial}
        multiSelectionKeyCode="Shift"
        deleteKeyCode={["Delete", "Backspace"]}
        selectNodesOnDrag={false}
        panOnScroll={true}
        panOnDrag={true}
        zoomOnScroll={true}
        zoomOnDoubleClick={false}
        minZoom={canvas.minScale}
        maxZoom={canvas.maxScale}
        defaultViewport={{ x: canvas.offsetX, y: canvas.offsetY, zoom: canvas.scale }}
        fitView={false}
        proOptions={{ hideAttribution: true }}
      >
        {/* Background */}
        {showBackground && (
          <Background
            variant={canvas.gridEnabled ? "dots" : "lines"}
            gap={canvas.gridSize}
            size={1}
            color={canvas.gridColor}
          />
        )}

        {/* Controls */}
        {showControls && (
          <Controls
            position="bottom-left"
            showZoom={true}
            showFitView={true}
            showInteractive={!readonly}
          />
        )}

        {/* Minimap */}
        {showMinimap && (
          <MiniMap
            position="bottom-right"
            nodeColor={(node) => {
              const storeNode = storeNodes[node.id];
              return storeNode ? storeNode.color : theme.colors.primary;
            }}
            nodeStrokeWidth={3}
            zoomable
            pannable
            style={{
              backgroundColor: theme.colors.surface,
              borderRadius: 8,
              border: `2px solid ${theme.colors.border}`,
              overflow: 'hidden'
            }}
          />
        )}

        {/* Custom Panels */}
        <Panel position="top-left">
          <div className="mindmap-info-panel" style={{
            background: theme.colors.surface,
            border: `1px solid ${theme.colors.border}`,
            borderRadius: 8,
            padding: '8px 12px',
            fontSize: 12,
            color: theme.colors.text,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <div>Nodes: {Object.keys(storeNodes).length}</div>
            <div>Connections: {Object.keys(storeConnections).length}</div>
            <div>Scale: {Math.round(canvas.scale * 100)}%</div>
            {readonly && <div style={{ color: theme.colors.warning }}>Read Only</div>}
          </div>
        </Panel>

        {/* Debug Panel (development only) */}
        {typeof window !== 'undefined' && window.location.hostname === 'localhost' && (
          <Panel position="top-right">
            <details style={{
              background: theme.colors.surface,
              border: `1px solid ${theme.colors.border}`,
              borderRadius: 8,
              padding: '8px 12px',
              fontSize: 11,
              color: theme.colors.text,
              maxWidth: 300,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <summary style={{ cursor: 'pointer', marginBottom: 8 }}>Debug Info</summary>
              <pre style={{ 
                background: theme.colors.background,
                padding: 8,
                borderRadius: 4,
                overflow: 'auto',
                maxHeight: 200,
                fontSize: 10
              }}>
                {JSON.stringify({
                  canvasSize: { width: canvas.width, height: canvas.height },
                  viewport: { x: canvas.offsetX, y: canvas.offsetY, zoom: canvas.scale },
                  selectedNodes: Object.values(storeNodes).filter(n => n.isSelected).map(n => n.id),
                  theme: theme.name
                }, null, 2)}
              </pre>
            </details>
          </Panel>
        )}
      </ReactFlow>
    </div>
  );
};

// Main component wrapper with ReactFlowProvider
export const MindmapCanvas: React.FC<MindmapCanvasProps> = (props) => {
  return (
    <ReactFlowProvider>
      <MindmapCanvasContent {...props} />
    </ReactFlowProvider>
  );
};

export default MindmapCanvas;