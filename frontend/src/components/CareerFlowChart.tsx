import React, { useCallback, useMemo, useEffect } from 'react';
import {
  ReactFlow,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  type Node,
  type Edge,
  type Connection,
  type NodeTypes,
} from '@xyflow/react';
import { CareerFlow } from '../types/detailedProfile';
import '@xyflow/react/dist/style.css';
import './CareerFlowChart.css';

interface CareerStepNodeData {
  label: string;
  level: 'entry' | 'junior' | 'mid' | 'senior' | 'lead';
  status: 'completed' | 'current' | 'planned';
  period?: string;
  company?: string;
  skills?: string[];
}

interface CareerStepNodeProps {
  data: CareerStepNodeData;
  selected?: boolean;
}

const CareerStepNode: React.FC<CareerStepNodeProps> = ({ data, selected }) => {
  const getStatusColor = () => {
    switch (data.status) {
      case 'completed':
        return {
          border: '#10b981',
          background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
          color: '#065f46'
        };
      case 'current':
        return {
          border: '#3b82f6',
          background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
          color: '#1e40af'
        };
      case 'planned':
        return {
          border: '#6b7280',
          background: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)',
          color: '#374151'
        };
      default:
        return {
          border: '#e5e7eb',
          background: 'white',
          color: '#6b7280'
        };
    }
  };

  const getLevelEmoji = () => {
    switch (data.level) {
      case 'entry':
        return '🌱';
      case 'junior':
        return '🚀';
      case 'mid':
        return '⚡';
      case 'senior':
        return '🎯';
      case 'lead':
        return '👑';
      default:
        return '📦';
    }
  };

  const statusStyle = getStatusColor();

  return (
    <div 
      className={`career-step-node ${data.status} ${selected ? 'selected' : ''}`}
      style={{
        borderColor: statusStyle.border,
        background: statusStyle.background,
        color: statusStyle.color,
      }}
    >
      <div className="node-header">
        <span className="level-icon">{getLevelEmoji()}</span>
        <div className="node-info">
          <div className="node-title">{data.label}</div>
          {data.company && (
            <div className="node-company">{data.company}</div>
          )}
        </div>
      </div>
      
      {data.period && (
        <div className="node-period">{data.period}</div>
      )}
      
      {data.status === 'current' && (
        <div className="current-indicator">
          <div className="pulse-dot"></div>
          <span>현재</span>
        </div>
      )}
    </div>
  );
};

const nodeTypes: NodeTypes = {
  careerStep: CareerStepNode,
};

interface CareerFlowChartProps {
  careerFlow: CareerFlow;
  title: string;
  interactive?: boolean;
  height?: number;
}

const CareerFlowChart: React.FC<CareerFlowChartProps> = ({ 
  careerFlow, 
  title, 
  interactive = false,
  height = 400 
}) => {
  const initialNodes: Node[] = useMemo(() => 
    careerFlow.nodes.map(node => ({
      ...node,
      type: 'careerStep',
      draggable: interactive,
    })), [careerFlow.nodes, interactive]);

  const initialEdges: Edge[] = useMemo(() => 
    careerFlow.edges.map(edge => ({
      ...edge,
      style: { stroke: '#94a3b8', strokeWidth: 2 },
      markerEnd: {
        type: 'arrowclosed',
        color: '#94a3b8',
      },
    })), [careerFlow.edges]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Sync nodes and edges when careerFlow changes
  useEffect(() => {
    setNodes(initialNodes);
  }, [initialNodes, setNodes]);

  useEffect(() => {
    setEdges(initialEdges);
  }, [initialEdges, setEdges]);

  const onConnect = useCallback(
    (params: Connection) => {
      if (interactive) {
        setEdges((eds) => addEdge(params, eds));
      }
    },
    [interactive, setEdges]
  );

  return (
    <div className="career-flow-chart" style={{ height }}>
      <div className="chart-header">
        <h3>{title}</h3>
        <div className="chart-legend">
          <div className="legend-item">
            <div className="legend-dot completed"></div>
            <span>완료</span>
          </div>
          <div className="legend-item">
            <div className="legend-dot current"></div>
            <span>현재</span>
          </div>
          <div className="legend-item">
            <div className="legend-dot planned"></div>
            <span>계획</span>
          </div>
        </div>
      </div>
      
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={interactive ? onNodesChange : undefined}
        onEdgesChange={interactive ? onEdgesChange : undefined}
        onConnect={interactive ? onConnect : undefined}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-left"
        proOptions={{ hideAttribution: true }}
        nodesDraggable={interactive}
        nodesConnectable={interactive}
        elementsSelectable={interactive}
      >
        <Background color="#f1f5f9" gap={16} />
        {interactive && <Controls />}
      </ReactFlow>
    </div>
  );
};

export default CareerFlowChart;