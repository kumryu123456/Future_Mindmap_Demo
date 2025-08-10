import React, { useState, useCallback, useMemo, useEffect } from "react";
import {
  ReactFlow,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap,
  Panel,
  Handle,
  Position,
  type Node,
  type Edge,
  type Connection,
  type NodeTypes,
  type OnSelectionChangeFunc,
} from "@xyflow/react";
import { CareerFlow } from "../types/detailedProfile";
import { useTheme } from "@/components/theme-provider";
import "@xyflow/react/dist/style.css";
import "./InteractiveCareerFlow.css";

interface CareerStepNodeData {
  label: string;
  level: "entry" | "junior" | "mid" | "senior" | "lead";
  status: "completed" | "current" | "planned";
  period?: string;
  company?: string;
  skills?: string[];
  description?: string;
  achievements?: string[];
  technologies?: string[];
}

interface EnhancedCareerStepNodeProps {
  data: CareerStepNodeData;
  selected?: boolean;
  id: string;
}

// 향상된 노드 컴포넌트
const EnhancedCareerStepNode: React.FC<EnhancedCareerStepNodeProps> = ({
  data,
  selected,
  id,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const getStatusColor = () => {
    switch (data.status) {
      case "completed":
        return {
          border: "#10b981",
          background: isHovered
            ? "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)"
            : "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)",
          color: "#065f46",
          glow: "0 0 20px rgba(16, 185, 129, 0.5)",
        };
      case "current":
        return {
          border: "#3b82f6",
          background: isHovered
            ? "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)"
            : "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)",
          color: "#1e40af",
          glow: "0 0 30px rgba(59, 130, 246, 0.6)",
        };
      case "planned":
        return {
          border: "#6b7280",
          background: isHovered
            ? "linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)"
            : "linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)",
          color: "#374151",
          glow: "0 0 15px rgba(107, 114, 128, 0.3)",
        };
      default:
        return {
          border: "#e5e7eb",
          background: "white",
          color: "#6b7280",
          glow: "none",
        };
    }
  };

  const getLevelEmoji = () => {
    const emojis = {
      entry: "🌱",
      junior: "🚀",
      mid: "⚡",
      senior: "🎯",
      lead: "👑",
    };
    return emojis[data.level] || "📦";
  };

  const statusStyle = getStatusColor();

  return (
    <div
      className={`enhanced-career-node ${data.status} ${selected ? "selected" : ""} ${isExpanded ? "expanded" : ""}`}
      style={{
        borderColor: statusStyle.border,
        background: statusStyle.background,
        color: statusStyle.color,
        boxShadow: selected ? statusStyle.glow : "none",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      {/* 4방향 핸들 - AI커리어 설계와 동일 */}
      <Handle
        type="source"
        position={Position.Top}
        id="source-top"
        style={{
          top: "-6px",
          background: "#374151",
          width: "12px",
          height: "12px",
          border: "2px solid #1f2937",
          cursor: "crosshair",
          zIndex: 1000,
        }}
        isConnectable={true}
        isValidConnection={() => true}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="source-right"
        style={{
          right: "-6px",
          background: "#374151",
          width: "12px",
          height: "12px",
          border: "2px solid #1f2937",
          cursor: "crosshair",
          zIndex: 1000,
        }}
        isConnectable={true}
        isValidConnection={() => true}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="source-bottom"
        style={{
          bottom: "-6px",
          background: "#374151",
          width: "12px",
          height: "12px",
          border: "2px solid #1f2937",
          cursor: "crosshair",
          zIndex: 1000,
        }}
        isConnectable={true}
        isValidConnection={() => true}
      />
      <Handle
        type="source"
        position={Position.Left}
        id="source-left"
        style={{
          left: "-6px",
          background: "#374151",
          width: "12px",
          height: "12px",
          border: "2px solid #1f2937",
          cursor: "crosshair",
          zIndex: 1000,
        }}
        isConnectable={true}
        isValidConnection={() => true}
      />

      <Handle
        type="target"
        position={Position.Top}
        id="target-top"
        style={{
          top: "-6px",
          background: "#374151",
          width: "12px",
          height: "12px",
          border: "2px solid #1f2937",
          cursor: "crosshair",
          zIndex: 1000,
        }}
        isConnectable={true}
        isValidConnection={() => true}
      />
      <Handle
        type="target"
        position={Position.Right}
        id="target-right"
        style={{
          right: "-6px",
          background: "#374151",
          width: "12px",
          height: "12px",
          border: "2px solid #1f2937",
          cursor: "crosshair",
          zIndex: 1000,
        }}
        isConnectable={true}
        isValidConnection={() => true}
      />
      <Handle
        type="target"
        position={Position.Bottom}
        id="target-bottom"
        style={{
          bottom: "-6px",
          background: "#374151",
          width: "12px",
          height: "12px",
          border: "2px solid #1f2937",
          cursor: "crosshair",
          zIndex: 1000,
        }}
        isConnectable={true}
        isValidConnection={() => true}
      />
      <Handle
        type="target"
        position={Position.Left}
        id="target-left"
        style={{
          left: "-6px",
          background: "#374151",
          width: "12px",
          height: "12px",
          border: "2px solid #1f2937",
          cursor: "crosshair",
          zIndex: 1000,
        }}
        isConnectable={true}
        isValidConnection={() => true}
      />
      {/* 노드 헤더 */}
      <div className="node-header">
        <span className="level-icon">{getLevelEmoji()}</span>
        <div className="node-info">
          <div className="node-title">{data.label}</div>
          {data.company && <div className="node-company">{data.company}</div>}
        </div>
        {(data.description || data.achievements || data.technologies) && (
          <button
            className="expand-btn"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            aria-expanded={isExpanded}
            aria-label={`${isExpanded ? "Collapse" : "Expand"} details for ${data.label}`}
            title={`${isExpanded ? "Collapse" : "Expand"} details`}
          >
            {isExpanded ? "−" : "+"}
          </button>
        )}
      </div>

      {/* 기간 표시 */}
      {data.period && <div className="node-period">{data.period}</div>}

      {/* 현재 상태 표시 */}
      {data.status === "current" && (
        <div className="current-indicator">
          <div className="pulse-dot"></div>
          <span>현재</span>
        </div>
      )}

      {/* 확장 콘텐츠 */}
      {isExpanded && (
        <div className="expanded-content">
          {data.description && (
            <div className="node-description">
              <p>{data.description}</p>
            </div>
          )}

          {data.achievements && data.achievements.length > 0 && (
            <div className="node-achievements">
              <h5>주요 성과</h5>
              <ul>
                {data.achievements.map((achievement, index) => (
                  <li key={index}>{achievement}</li>
                ))}
              </ul>
            </div>
          )}

          {data.technologies && data.technologies.length > 0 && (
            <div className="node-technologies">
              <h5>기술 스택</h5>
              <div className="tech-tags">
                {data.technologies.map((tech, index) => (
                  <span key={index} className="tech-tag">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}

          {data.skills && data.skills.length > 0 && (
            <div className="node-skills">
              <h5>핵심 역량</h5>
              <div className="skill-tags">
                {data.skills.map((skill, index) => (
                  <span key={index} className="skill-tag">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const nodeTypes: NodeTypes = {
  careerStep: EnhancedCareerStepNode,
};

interface InteractiveCareerFlowProps {
  careerFlow: CareerFlow;
  title: string;
  onNodeClick?: (nodeId: string) => void;
  onNodeAdd?: (nodeData: any) => void;
  onNodeDelete?: (nodeId: string) => void;
  onEdgeUpdate?: (edge: Edge) => void;
  readOnly?: boolean;
  height?: number;
}

const InteractiveCareerFlow: React.FC<InteractiveCareerFlowProps> = ({
  careerFlow,
  title,
  onNodeClick,
  onNodeAdd,
  onNodeDelete,
  onEdgeUpdate,
  readOnly = false,
  height = 600,
}) => {
  const { theme } = useTheme();
  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"default" | "timeline" | "skills">(
    "default",
  );
  const [showMiniMap, setShowMiniMap] = useState(false);

  // 노드 초기화
  const initialNodes: Node[] = useMemo(
    () =>
      careerFlow.nodes.map((node) => ({
        ...node,
        type: "careerStep",
        draggable: !readOnly,
      })),
    [careerFlow.nodes, readOnly],
  );

  // 방향별 색상 결정 함수 (AI커리어 설계와 동일)
  const getConnectionStyle = useCallback(
    (
      sourceHandle: string | null | undefined,
      targetHandle: string | null | undefined,
    ) => {
      let strokeColor = "#3b82f6";
      let strokeWidth = 2;

      // source handle을 우선으로 색상 결정 (연결의 시작점 기준)
      if (sourceHandle === "source-top") {
        strokeColor = "#10b981"; // 위쪽: 녹색
      } else if (sourceHandle === "source-right") {
        strokeColor = "#f59e0b"; // 오른쪽: 주황색
      } else if (sourceHandle === "source-bottom") {
        strokeColor = "#ef4444"; // 아래쪽: 빨간색
      } else if (sourceHandle === "source-left") {
        strokeColor = "#8b5cf6"; // 왼쪽: 보라색
      } else if (targetHandle === "target-top") {
        strokeColor = "#10b981"; // 위쪽: 녹색
      } else if (targetHandle === "target-right") {
        strokeColor = "#f59e0b"; // 오른쪽: 주황색
      } else if (targetHandle === "target-bottom") {
        strokeColor = "#ef4444"; // 아래쪽: 빨간색
      } else if (targetHandle === "target-left") {
        strokeColor = "#8b5cf6"; // 왼쪽: 보라색
      }

      return { strokeColor, strokeWidth };
    },
    [],
  );

  // 엣지 초기화
  const initialEdges: Edge[] = useMemo(
    () =>
      careerFlow.edges.map((edge) => {
        const { strokeColor, strokeWidth } = getConnectionStyle(
          edge.sourceHandle,
          edge.targetHandle,
        );
        return {
          ...edge,
          type: "smoothstep",
          animated: true,
          style: {
            stroke: strokeColor,
            strokeWidth: strokeWidth,
          },
          markerEnd: {
            type: "arrowclosed" as const,
            color: strokeColor,
          },
        };
      }),
    [careerFlow.edges, getConnectionStyle],
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // careerFlow 변경 시 nodes와 edges 동기화
  useEffect(() => {
    setNodes(initialNodes);
  }, [initialNodes, setNodes]);

  useEffect(() => {
    setEdges(initialEdges);
  }, [initialEdges, setEdges]);

  // 연결 처리
  const onConnect = useCallback(
    (params: Connection) => {
      if (!readOnly) {
        const { strokeColor, strokeWidth } = getConnectionStyle(
          params.sourceHandle,
          params.targetHandle,
        );
        const newEdge = {
          ...params,
          type: "smoothstep",
          animated: true,
          style: { stroke: strokeColor, strokeWidth: strokeWidth },
          markerEnd: {
            type: "arrowclosed" as const,
            color: strokeColor,
          },
        };
        setEdges((eds) => addEdge(newEdge, eds));
        onEdgeUpdate?.(newEdge as Edge);
      }
    },
    [readOnly, setEdges, onEdgeUpdate, getConnectionStyle],
  );

  // 선택 변경 처리
  const onSelectionChange: OnSelectionChangeFunc = useCallback(
    ({ nodes: selectedNodesList }) => {
      const selectedIds = selectedNodesList.map((node) => node.id);
      setSelectedNodes(selectedIds);
    },
    [],
  );

  // 노드 클릭 처리
  const onNodeClickHandler = useCallback(
    (event: React.MouseEvent, node: Node) => {
      onNodeClick?.(node.id);
    },
    [onNodeClick],
  );

  // 노드 추가
  const handleAddNode = useCallback(() => {
    if (!readOnly && onNodeAdd) {
      const newNode = {
        id: `node-${Date.now()}`,
        position: { x: 250, y: nodes.length * 150 },
        data: {
          label: "새 경력 단계",
          level: "junior",
          status: "planned",
          period: "계획 중",
        },
        type: "careerStep",
      };
      setNodes((nds) => [...nds, newNode]);
      onNodeAdd(newNode);
    }
  }, [readOnly, nodes.length, setNodes, onNodeAdd]);

  // 노드 삭제
  const handleDeleteNode = useCallback(() => {
    if (!readOnly && selectedNodes.length > 0 && onNodeDelete) {
      setNodes((nds) => nds.filter((node) => !selectedNodes.includes(node.id)));
      setEdges((eds) =>
        eds.filter(
          (edge) =>
            !selectedNodes.includes(edge.source) &&
            !selectedNodes.includes(edge.target),
        ),
      );
      selectedNodes.forEach((nodeId) => onNodeDelete(nodeId));
      setSelectedNodes([]);
    }
  }, [readOnly, selectedNodes, setNodes, setEdges, onNodeDelete]);

  // 키보드 이벤트 처리 (Delete 키로 노드 삭제)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Delete" && selectedNodes.length > 0) {
        event.preventDefault();
        handleDeleteNode();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedNodes, handleDeleteNode]);

  // 뷰 모드 변경
  const handleViewModeChange = (mode: "default" | "timeline" | "skills") => {
    setViewMode(mode);

    // 뷰 모드에 따른 노드 재배치
    if (mode === "timeline") {
      // 타임라인 뷰: 수평 정렬
      setNodes((nds) =>
        nds.map((node, index) => ({
          ...node,
          position: { x: index * 300, y: 200 },
        })),
      );
    } else if (mode === "skills") {
      // 스킬 뷰: 스킬별 그룹화
      // 여기서는 예시로 간단한 그룹화만 구현
      setNodes((nds) =>
        nds.map((node, index) => ({
          ...node,
          position: {
            x: (index % 3) * 250 + 100,
            y: Math.floor(index / 3) * 200 + 100,
          },
        })),
      );
    }
  };

  return (
    <div className={`interactive-career-flow ${theme}`} style={{ height }}>
      {/* 헤더 및 컨트롤 */}
      <div className="flow-header">
        <h3>{title}</h3>

        <div className="flow-controls">
          {/* 뷰 모드 선택 */}
          <div className="view-mode-selector">
            <button
              className={viewMode === "default" ? "active" : ""}
              onClick={() => handleViewModeChange("default")}
            >
              🔀 기본
            </button>
            <button
              className={viewMode === "timeline" ? "active" : ""}
              onClick={() => handleViewModeChange("timeline")}
            >
              📅 타임라인
            </button>
            <button
              className={viewMode === "skills" ? "active" : ""}
              onClick={() => handleViewModeChange("skills")}
            >
              💡 스킬 뷰
            </button>
          </div>

          {/* 미니맵 토글 */}
          <button
            onClick={() => setShowMiniMap(!showMiniMap)}
            className="minimap-toggle"
          >
            {showMiniMap ? "🗺️ 미니맵 숨기기" : "🗺️ 미니맵 보기"}
          </button>
        </div>
      </div>

      {/* 범례 */}
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

      {/* React Flow 차트 */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={!readOnly ? onNodesChange : undefined}
        onEdgesChange={!readOnly ? onEdgesChange : undefined}
        onConnect={onConnect}
        onSelectionChange={onSelectionChange}
        onNodeClick={onNodeClickHandler}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-left"
        proOptions={{ hideAttribution: true }}
        nodesDraggable={!readOnly}
        nodesConnectable={!readOnly}
        elementsSelectable={true}
        zoomOnScroll={true}
        zoomOnPinch={true}
        panOnScroll={false}
        panOnDrag={true}
        minZoom={0.3}
        maxZoom={3}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
      >
        <Background color="#f1f5f9" gap={16} variant="dots" />
        <Controls showZoom={false} showFitView={true} showInteractive={false} />
        {showMiniMap && (
          <MiniMap
            nodeColor={(node) => {
              const data = node.data as CareerStepNodeData;
              switch (data.status) {
                case "completed":
                  return "#10b981";
                case "current":
                  return "#3b82f6";
                case "planned":
                  return "#6b7280";
                default:
                  return "#e5e7eb";
              }
            }}
            nodeStrokeWidth={3}
            pannable
            zoomable
          />
        )}
      </ReactFlow>
    </div>
  );
};

export default InteractiveCareerFlow;
