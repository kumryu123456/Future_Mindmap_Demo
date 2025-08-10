import React, { memo } from 'react';
import { EdgeProps, getBezierPath, EdgeLabelRenderer } from '@xyflow/react';
import type { MindmapConnection, ConnectionStyle } from '../../types/store';

// Edge data interface for React Flow
export interface ReactFlowEdgeData extends Omit<MindmapConnection, 'sourceNodeId' | 'targetNodeId'> {
  onConnectionEdit?: (id: string, label: string) => void;
  onConnectionDelete?: (id: string) => void;
}

// Base Edge Component
const BaseEdge: React.FC<EdgeProps<ReactFlowEdgeData>> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style,
  data,
  markerEnd,
  selected
}) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const connectionStyle: ConnectionStyle = data?.style || {
    color: '#a0aec0',
    width: 2,
    style: 'curved',
    arrowType: 'arrow',
    arrowSize: 8,
    opacity: 0.8
  };

  // Generate SVG path based on connection style
  const getPathStyle = () => {
    const baseStyle = {
      stroke: selected ? '#667eea' : connectionStyle.color,
      strokeWidth: selected ? connectionStyle.width + 1 : connectionStyle.width,
      opacity: data?.isVisible !== false ? connectionStyle.opacity : 0.3,
      fill: 'none',
      transition: 'all 0.2s ease'
    };

    switch (connectionStyle.style) {
      case 'dashed':
        return { ...baseStyle, strokeDasharray: '5,5' };
      case 'dotted':
        return { ...baseStyle, strokeDasharray: '2,3' };
      case 'solid':
      case 'curved':
      default:
        return baseStyle;
    }
  };

  // Generate marker for arrow types
  const getMarkerEnd = () => {
    if (connectionStyle.arrowType === 'none') return undefined;
    
    const markerId = `${connectionStyle.arrowType}-${selected ? 'selected' : 'normal'}-${id}`;
    return `url(#${markerId})`;
  };

  const pathStyle = getPathStyle();
  const currentMarkerEnd = markerEnd || getMarkerEnd();

  return (
    <>
      {/* Custom marker definitions */}
      <defs>
        <marker
          id={`arrow-${selected ? 'selected' : 'normal'}-${id}`}
          markerWidth={connectionStyle.arrowSize}
          markerHeight={connectionStyle.arrowSize}
          refX={connectionStyle.arrowSize - 1}
          refY={connectionStyle.arrowSize / 2}
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path
            d={`M0,0 L0,${connectionStyle.arrowSize} L${connectionStyle.arrowSize},${connectionStyle.arrowSize / 2} z`}
            fill={selected ? '#667eea' : connectionStyle.color}
            opacity={connectionStyle.opacity}
          />
        </marker>
        
        <marker
          id={`circle-${selected ? 'selected' : 'normal'}-${id}`}
          markerWidth={connectionStyle.arrowSize}
          markerHeight={connectionStyle.arrowSize}
          refX={connectionStyle.arrowSize / 2}
          refY={connectionStyle.arrowSize / 2}
          orient="auto"
          markerUnits="strokeWidth"
        >
          <circle
            cx={connectionStyle.arrowSize / 2}
            cy={connectionStyle.arrowSize / 2}
            r={connectionStyle.arrowSize / 3}
            fill={selected ? '#667eea' : connectionStyle.color}
            opacity={connectionStyle.opacity}
          />
        </marker>
        
        <marker
          id={`diamond-${selected ? 'selected' : 'normal'}-${id}`}
          markerWidth={connectionStyle.arrowSize}
          markerHeight={connectionStyle.arrowSize}
          refX={connectionStyle.arrowSize / 2}
          refY={connectionStyle.arrowSize / 2}
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path
            d={`M${connectionStyle.arrowSize / 2},0 L${connectionStyle.arrowSize},${connectionStyle.arrowSize / 2} L${connectionStyle.arrowSize / 2},${connectionStyle.arrowSize} L0,${connectionStyle.arrowSize / 2} z`}
            fill={selected ? '#667eea' : connectionStyle.color}
            opacity={connectionStyle.opacity}
          />
        </marker>
      </defs>

      {/* Main path */}
      <path
        id={id}
        style={pathStyle}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={currentMarkerEnd}
      />

      {/* Connection strength indicator */}
      {data?.strength !== undefined && data.strength < 1 && (
        <path
          d={edgePath}
          stroke="rgba(255,255,255,0.5)"
          strokeWidth={1}
          strokeDasharray={`${data.strength * 10},${(1 - data.strength) * 10}`}
          fill="none"
          opacity={0.6}
        />
      )}

      {/* Label */}
      {data?.label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              fontSize: 12,
              fontWeight: 500,
              background: 'rgba(255, 255, 255, 0.9)',
              padding: '2px 6px',
              borderRadius: 4,
              border: '1px solid #e2e8f0',
              color: '#4a5568',
              pointerEvents: 'all',
              cursor: 'pointer',
              userSelect: 'none'
            }}
            className="nodrag nopan"
            onClick={() => data?.onConnectionEdit?.(data.id, data.label!)}
          >
            {data.label}
          </div>
        </EdgeLabelRenderer>
      )}

      {/* Connection type indicator */}
      {data?.type && data.type !== 'hierarchical' && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY - 20}px)`,
              fontSize: 10,
              background: getTypeColor(data.type),
              color: 'white',
              padding: '1px 4px',
              borderRadius: 8,
              fontWeight: 'bold',
              textTransform: 'uppercase',
              opacity: selected ? 1 : 0.7,
              pointerEvents: 'none',
              userSelect: 'none'
            }}
          >
            {data.type}
          </div>
        </EdgeLabelRenderer>
      )}

      {/* Delete button when selected */}
      {selected && data?.onConnectionDelete && (
        <EdgeLabelRenderer>
          <button
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX + 15}px, ${labelY}px)`,
              width: 16,
              height: 16,
              borderRadius: '50%',
              border: 'none',
              background: '#f56565',
              color: 'white',
              cursor: 'pointer',
              fontSize: '10px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
            className="nodrag nopan"
            onClick={() => data.onConnectionDelete!(data.id)}
            title="Delete connection"
          >
            ×
          </button>
        </EdgeLabelRenderer>
      )}
    </>
  );
};

// Helper function to get type-specific colors
const getTypeColor = (type: string): string => {
  switch (type) {
    case 'hierarchical':
      return '#667eea';
    case 'associative':
      return '#48bb78';
    case 'dependency':
      return '#ed8936';
    case 'sequence':
      return '#f093fb';
    default:
      return '#a0aec0';
  }
};

// Specialized Edge Components
export const HierarchicalEdge = memo((props: EdgeProps<ReactFlowEdgeData>) => (
  <BaseEdge {...props} />
));

export const AssociativeEdge = memo((props: EdgeProps<ReactFlowEdgeData>) => (
  <BaseEdge {...props} />
));

export const DependencyEdge = memo((props: EdgeProps<ReactFlowEdgeData>) => (
  <BaseEdge {...props} />
));

export const SequenceEdge = memo((props: EdgeProps<ReactFlowEdgeData>) => (
  <BaseEdge {...props} />
));

// Straight line edge for performance
export const StraightEdge: React.FC<EdgeProps<ReactFlowEdgeData>> = memo(({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  style,
  data,
  selected
}) => {
  const connectionStyle: ConnectionStyle = data?.style || {
    color: '#a0aec0',
    width: 2,
    style: 'solid',
    arrowType: 'arrow',
    arrowSize: 8,
    opacity: 0.8
  };

  return (
    <g>
      <line
        x1={sourceX}
        y1={sourceY}
        x2={targetX}
        y2={targetY}
        stroke={selected ? '#667eea' : connectionStyle.color}
        strokeWidth={selected ? connectionStyle.width + 1 : connectionStyle.width}
        opacity={data?.isVisible !== false ? connectionStyle.opacity : 0.3}
        strokeDasharray={connectionStyle.style === 'dashed' ? '5,5' : undefined}
      />
      {/* Simple arrow */}
      {connectionStyle.arrowType === 'arrow' && (
        <polygon
          points={`${targetX-5},${targetY-3} ${targetX},${targetY} ${targetX-5},${targetY+3}`}
          fill={selected ? '#667eea' : connectionStyle.color}
          opacity={connectionStyle.opacity}
        />
      )}
    </g>
  );
});

// Edge type mapping for React Flow
export const edgeTypes = {
  hierarchical: HierarchicalEdge,
  associative: AssociativeEdge,
  dependency: DependencyEdge,
  sequence: SequenceEdge,
  straight: StraightEdge,
  default: BaseEdge
};

export default BaseEdge;