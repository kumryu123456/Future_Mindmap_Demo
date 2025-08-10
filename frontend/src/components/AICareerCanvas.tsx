import React, { useState, useCallback, createContext, useContext, useEffect } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Node,
  Edge,
  Connection,
  NodeTypes,
  ReactFlowProvider,
  Handle,
  Position,
  reconnectEdge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useToast } from './ui/ToastNotification';
import { mockData } from '../services/careerApi';
import { CareerNode as CareerNodeType } from '../types/career';
import { createSmartMindmapSimple, convertToXYFlowNodes, convertToXYFlowEdges } from '../services/smartMindmapApi';
import { autoExpand } from '../services/autoExpandApi';
import { ragDetail } from '../services/ragDetailApi';
import './AICareerCanvas.css';

// Theme Context
interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  toggleTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

// Add invisible handle styles to document
const addInvisibleHandleStyles = () => {
  if (typeof document !== 'undefined') {
    const existingStyle = document.querySelector('#invisible-handle-styles');
    if (!existingStyle) {
      const style = document.createElement('style');
      style.id = 'invisible-handle-styles';
      style.textContent = `
        .react-flow__handle.invisible-handle {
          background: transparent !important;
          background-color: transparent !important;
          border: none !important;
          border-radius: 0 !important;
          box-shadow: none !important;
          width: 1px !important;
          height: 1px !important;
          min-width: 1px !important;
          min-height: 1px !important;
          opacity: 0 !important;
          visibility: hidden !important;
        }
        .react-flow__handle.invisible-handle:hover {
          background: transparent !important;
          background-color: transparent !important;
          border: none !important;
        }
      `;
      document.head.appendChild(style);
    }
  }
};

// Normal Handle with drag functionality
const DragHandle: React.FC<{
  type: "source" | "target";
  position: Position;
  id: string;
}> = ({ type, position, id }) => {
  return (
    <Handle 
      type={type} 
      position={position} 
      id={id}
      style={{
        width: '12px',
        height: '12px',
        border: '2px solid #1f2937',
        background: '#374151',
        cursor: 'crosshair',
        zIndex: 1000,
      }}
      isConnectable={true}
      isValidConnection={() => true}
    />
  );
};


// Simple context for connection mode
const NodeContext = React.createContext<{
  isConnectMode: boolean;
}>({
  isConnectMode: false
});

// Custom Node Components
const CenterNode = ({ data, selected, id }: { data: any; selected: boolean; id: string }) => {
  const { theme } = useTheme();
  const { isConnectMode } = React.useContext(NodeContext);
  
  return (
    <div className={`career-node center-node ${theme} ${selected ? 'selected' : ''}`}>
      {/* 연결 핸들 (클릭으로 노드 생성) */}
      <DragHandle type="source" position={Position.Top} id="source-top" />
      <DragHandle type="source" position={Position.Right} id="source-right" />
      <DragHandle type="source" position={Position.Bottom} id="source-bottom" />
      <DragHandle type="source" position={Position.Left} id="source-left" />
      <DragHandle type="target" position={Position.Top} id="target-top" />
      <DragHandle type="target" position={Position.Right} id="target-right" />
      <DragHandle type="target" position={Position.Bottom} id="target-bottom" />
      <DragHandle type="target" position={Position.Left} id="target-left" />
      
      <div className="node-content">
        <div className="node-title">{data.label}</div>
        <div className="node-subtitle">{data.subtitle || '커리어 목표'}</div>
        {data.progress !== undefined && (
          <div className="node-progress">
            <div className="progress-bar" style={{ width: `${data.progress}%` }} />
            <span className="progress-text">{data.progress}%</span>
          </div>
        )}
      </div>
    </div>
  );
};

const MajorNode = ({ data, id }: { data: any; id: string }) => {
  const { theme } = useTheme();
  const { isConnectMode } = React.useContext(NodeContext);
  
  return (
    <div className={`career-node major-node ${theme}`}>
      {/* 연결 핸들 (클릭으로 노드 생성) */}
      <DragHandle type="source" position={Position.Top} id="source-top" />
      <DragHandle type="source" position={Position.Right} id="source-right" />
      <DragHandle type="source" position={Position.Bottom} id="source-bottom" />
      <DragHandle type="source" position={Position.Left} id="source-left" />
      <DragHandle type="target" position={Position.Top} id="target-top" />
      <DragHandle type="target" position={Position.Right} id="target-right" />
      <DragHandle type="target" position={Position.Bottom} id="target-bottom" />
      <DragHandle type="target" position={Position.Left} id="target-left" />
      
      <div className="node-content">
        <div className="node-title">{data.label}</div>
        <div className="node-level">{data.subtitle || '주요 영역'}</div>
      </div>
    </div>
  );
};

const DetailNode = ({ data, id }: { data: any; id: string }) => {
  const { theme } = useTheme();
  const { isConnectMode } = React.useContext(NodeContext);
  
  return (
    <div className={`career-node detail-node ${theme}`}>
      {/* 연결 핸들 (클릭으로 노드 생성) */}
      <DragHandle type="source" position={Position.Top} id="source-top" />
      <DragHandle type="source" position={Position.Right} id="source-right" />
      <DragHandle type="source" position={Position.Bottom} id="source-bottom" />
      <DragHandle type="source" position={Position.Left} id="source-left" />
      <DragHandle type="target" position={Position.Top} id="target-top" />
      <DragHandle type="target" position={Position.Right} id="target-right" />
      <DragHandle type="target" position={Position.Bottom} id="target-bottom" />
      <DragHandle type="target" position={Position.Left} id="target-left" />
      
      <div className="node-content">
        <div className="node-title">{data.label}</div>
        <div className="node-level">{data.subtitle || '세부 단계'}</div>
      </div>
    </div>
  );
};

const GoalNode = ({ data, id }: { data: any; id: string }) => {
  const { theme } = useTheme();
  const { isConnectMode } = React.useContext(NodeContext);
  
  return (
    <div className={`career-node goal-node ${theme}`}>
      {/* 연결 핸들 (클릭으로 노드 생성) */}
      <DragHandle type="source" position={Position.Top} id="source-top" />
      <DragHandle type="source" position={Position.Right} id="source-right" />
      <DragHandle type="source" position={Position.Bottom} id="source-bottom" />
      <DragHandle type="source" position={Position.Left} id="source-left" />
      <DragHandle type="target" position={Position.Top} id="target-top" />
      <DragHandle type="target" position={Position.Right} id="target-right" />
      <DragHandle type="target" position={Position.Bottom} id="target-bottom" />
      <DragHandle type="target" position={Position.Left} id="target-left" />
      
      <div className="node-content">
        <div className="node-title">{data.label}</div>
        <div className="node-level">{data.subtitle || '최종 목표'}</div>
      </div>
    </div>
  );
};

// Node Types Registry
const nodeTypes: NodeTypes = {
  centerNode: CenterNode,
  majorNode: MajorNode,
  detailNode: DetailNode,
  goalNode: GoalNode,
};

// Convert CareerMap to React Flow format
const convertCareerMapToFlow = (careerMap: any, calculateOptimalConnection: Function, getConnectionStyle: Function) => {
  const nodes: Node[] = careerMap.nodes.map((node: CareerNodeType) => ({
    id: node.id,
    type: `${node.type}Node`,
    position: { x: node.x, y: node.y },
    data: { label: node.title, careerData: node },
    style: {
      background: node.color,
    },
  }));

  // 🎯 원본 연결 정보를 바로 엣지로 변환
  const edges: Edge[] = [];
  
  if (careerMap.connections && careerMap.connections.length > 0) {
    console.log('💾 원본 연결 정보 처리:', careerMap.connections.length, '개');
    
    careerMap.connections.forEach((connection: any) => {
      const sourceNode = nodes.find(n => n.id === connection.fromNodeId);
      const targetNode = nodes.find(n => n.id === connection.toNodeId);
      
      if (sourceNode && targetNode) {
        // 최적 핸들 계산
        const optimal = calculateOptimalConnection(sourceNode, targetNode);
        const { strokeColor, strokeWidth } = getConnectionStyle(optimal.sourceHandle, optimal.targetHandle);
        
        const edge: Edge = {
          id: `e${connection.fromNodeId}-${connection.toNodeId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          source: connection.fromNodeId,
          target: connection.toNodeId,
          sourceHandle: optimal.sourceHandle,
          targetHandle: optimal.targetHandle,
          type: 'smoothstep',
          animated: true,
          style: {
            stroke: strokeColor,
            strokeWidth: strokeWidth,
          },
          markerEnd: {
            type: 'arrowclosed',
            color: strokeColor,
          },
          data: {
            sourceHandle: optimal.sourceHandle,
            targetHandle: optimal.targetHandle,
            connectionType: 'auto_connect'
          },
        };
        
        edges.push(edge);
        console.log('✅ 원본 연결 처리:', {
          edge: `${sourceNode.data?.label} → ${targetNode.data?.label}`,
          handles: { source: optimal.sourceHandle, target: optimal.targetHandle }
        });
      }
    });
  }

  return { nodes, edges };
};

// Theme Toggle Component
const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <button className="theme-toggle" onClick={toggleTheme} title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  );
};

// Info/Review Sidebar Component
const Sidebar: React.FC<{ 
  isOpen: boolean; 
  onClose: () => void; 
  onClearCanvas?: () => void;
  selectedNode?: Node | null;
}> = ({ isOpen, onClose, onClearCanvas, selectedNode }) => {
  const { theme } = useTheme();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<'info' | 'review' | 'rag' | 'tools'>('info');
  const [ragData, setRagData] = useState<any>(null);
  const [isLoadingRag, setIsLoadingRag] = useState(false);
  const [unreadReviews, setUnreadReviews] = useState(3);
  
  // Mock data for career info
  const careerInfo = {
    title: 'AI 개발자',
    description: '인공지능 기술을 활용하여 어플리케이션과 시스템을 개발하는 전문가',
    avgSalary: '8,000만원 ~ 1.5억원',
    growth: '높음',
    skills: ['Python', 'TensorFlow', 'PyTorch', 'Machine Learning', 'Deep Learning'],
    certifications: ['TensorFlow Developer', 'AWS Machine Learning', 'Google Cloud AI'],
    companies: ['네이버', '카카오', '쿠팡', 'SK텔레콤', '삼성전자'],
    relatedLinks: [
      { title: 'AI 개발자 로드맵', url: '#' },
      { title: '머신러닝 학습 자료', url: '#' },
      { title: '커리어 가이드', url: '#' }
    ]
  };
  
  // Mock data for reviews
  const reviews = [
    {
      id: '1',
      author: '영우진',
      avatar: '👨‍💻',
      date: '2024-01-15',
      content: '전공 지식이 없어도 충분히 도전할 수 있는 분야인 것 같아요. 저도 비전공자로서 성공적으로 전환했습니다.',
      isRead: false
    },
    {
      id: '2', 
      author: '김정민',
      avatar: '👩‍🎓',
      date: '2024-01-14',
      content: '사업 구조 및 기술 스택에 대한 자세한 설명이 도움이 되었습니다. 감사합니다!',
      isRead: false
    },
    {
      id: '3',
      author: '박성훈',
      avatar: '🧑‍💼',
      date: '2024-01-13',
      content: 'PM으로 전환하려는 분들께 강추합니다. 실무 경험 강화 방법이 특히 유용했어요.',
      isRead: true
    }
  ];
  
  // Load RAG data when tab is selected and node is available
  const loadRagData = async (node: Node) => {
    if (!node) return;

    setIsLoadingRag(true);
    try {
      console.log('🚀 RAG Detail API 호출:', {
        nodeId: node.id,
        nodeTitle: node.data.label
      });

      const response = await ragDetail({
        query: `${node.data.label}: ${node.data.content || node.data.subtitle || ''}`,
        context: 'mindmap_node_detail',
        options: {
          maxResults: 5,
          includeMetadata: true,
          searchDepth: 'detailed'
        }
      });

      if (response.success && response.data) {
        setRagData(response.data);
        console.log('✅ RAG Detail 로드 완료:', response.data);
      } else {
        console.warn('⚠️ RAG Detail 응답 없음:', response.error);
        setRagData(null);
      }
    } catch (error) {
      console.error('❌ RAG Detail 로드 실패:', error);
      setRagData(null);
      toast.error('상세 정보를 불러올 수 없습니다');
    } finally {
      setIsLoadingRag(false);
    }
  };

  React.useEffect(() => {
    if (isOpen && activeTab === 'review') {
      setUnreadReviews(0);
    }
    
    // Load RAG data when RAG tab is selected and selectedNode exists
    if (isOpen && activeTab === 'rag' && selectedNode) {
      loadRagData(selectedNode);
    }
  }, [isOpen, activeTab, selectedNode]);

  return (
    <div className={`sidebar ${isOpen ? 'open' : 'closed'} ${theme}`}>
      <div className="sidebar-header">
        <div className="sidebar-tabs">
          <button 
            className={`tab-btn ${activeTab === 'info' ? 'active' : ''}`}
            onClick={() => setActiveTab('info')}
          >
            정보
          </button>
          <button 
            className={`tab-btn ${activeTab === 'review' ? 'active' : ''}`}
            onClick={() => setActiveTab('review')}
          >
            리뷰
            {unreadReviews > 0 && <span className="badge">{unreadReviews}</span>}
          </button>
          <button 
            className={`tab-btn ${activeTab === 'rag' ? 'active' : ''}`}
            onClick={() => setActiveTab('rag')}
            disabled={!selectedNode}
            title={selectedNode ? '선택된 노드의 상세 정보' : '노드를 선택하세요'}
          >
            🔍 상세
          </button>
        </div>
        <button className="sidebar-close" onClick={onClose}>✕</button>
      </div>

      <div className="sidebar-content">
        {/* 정보 탭 */}
        {activeTab === 'info' && (
          <div className="info-tab">
            <div className="info-section">
              <h3>{careerInfo.title}</h3>
              <p className="description">{careerInfo.description}</p>
            </div>
            
            <div className="info-section">
              <h4>💰 예상 연봉</h4>
              <p>{careerInfo.avgSalary}</p>
              <span className="growth-badge">성장성: {careerInfo.growth}</span>
            </div>
            
            <div className="info-section">
              <h4>🛠️ 필요 기술</h4>
              <div className="skill-tags">
                {careerInfo.skills.map(skill => (
                  <span key={skill} className="skill-tag">{skill}</span>
                ))}
              </div>
            </div>
            
            <div className="info-section">
              <h4>🎓 관련 자격증</h4>
              <ul className="cert-list">
                {careerInfo.certifications.map(cert => (
                  <li key={cert}>{cert}</li>
                ))}
              </ul>
            </div>
            
            <div className="info-section">
              <h4>🏭 채용 기업</h4>
              <div className="company-list">
                {careerInfo.companies.map(company => (
                  <span key={company} className="company-tag">{company}</span>
                ))}
              </div>
            </div>
            
            <div className="info-section">
              <h4>🔗 관련 링크</h4>
              <div className="link-list">
                {careerInfo.relatedLinks.map(link => (
                  <a key={link.title} href={link.url} className="related-link">
                    🔗 {link.title}
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* 리뷰 탭 */}
        {activeTab === 'review' && (
          <div className="review-tab">
            <div className="review-list">
              {reviews.map(review => (
                <div key={review.id} className={`review-item ${!review.isRead ? 'unread' : ''}`}>
                  <div className="review-header">
                    <div className="author-info">
                      <span className="author-avatar">{review.avatar}</span>
                      <span className="author-name">{review.author}</span>
                    </div>
                    <span className="review-date">{review.date}</span>
                  </div>
                  <div className="review-content">
                    {review.content}
                  </div>
                  <div className="review-actions">
                    <button className="reply-btn">💬 답글</button>
                    <button className="like-btn">👍 좋아요</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* RAG 상세 정보 탭 */}
        {activeTab === 'rag' && (
          <div className="rag-tab">
            {!selectedNode ? (
              <div className="no-selection">
                <p>노드를 선택하면 관련 상세 정보를 확인할 수 있습니다.</p>
              </div>
            ) : (
              <>
                <div className="selected-node-info">
                  <h3>📍 선택된 노드</h3>
                  <div className="node-summary">
                    <strong>{selectedNode.data.label}</strong>
                    {selectedNode.data.content && <p>{selectedNode.data.content}</p>}
                    {selectedNode.data.subtitle && <p className="subtitle">{selectedNode.data.subtitle}</p>}
                  </div>
                </div>

                {isLoadingRag ? (
                  <div className="loading-rag">
                    <p>🔍 상세 정보를 검색 중...</p>
                    <div className="loading-spinner"></div>
                  </div>
                ) : ragData ? (
                  <div className="rag-results">
                    <h4>📚 관련 정보</h4>
                    
                    {ragData.summary && (
                      <div className="rag-section">
                        <h5>요약</h5>
                        <p className="summary-text">{ragData.summary}</p>
                      </div>
                    )}

                    {ragData.relatedContent && ragData.relatedContent.length > 0 && (
                      <div className="rag-section">
                        <h5>관련 콘텐츠</h5>
                        <div className="related-content">
                          {ragData.relatedContent.slice(0, 3).map((content: any, index: number) => (
                            <div key={index} className="content-item">
                              <h6>{content.title || `관련 정보 ${index + 1}`}</h6>
                              <p className="content-text">{content.content || content.description}</p>
                              {content.source && <span className="content-source">출처: {content.source}</span>}
                              {content.confidence && (
                                <span className="confidence-score">신뢰도: {Math.round(content.confidence * 100)}%</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {ragData.suggestions && ragData.suggestions.length > 0 && (
                      <div className="rag-section">
                        <h5>💡 제안사항</h5>
                        <ul className="suggestions-list">
                          {ragData.suggestions.slice(0, 5).map((suggestion: string, index: number) => (
                            <li key={index}>{suggestion}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {ragData.keywords && ragData.keywords.length > 0 && (
                      <div className="rag-section">
                        <h5>🏷️ 관련 키워드</h5>
                        <div className="keywords-list">
                          {ragData.keywords.map((keyword: string, index: number) => (
                            <span key={index} className="keyword-tag">{keyword}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="rag-actions">
                      <button 
                        className="refresh-btn"
                        onClick={() => loadRagData(selectedNode)}
                        disabled={isLoadingRag}
                      >
                        🔄 새로고침
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="no-rag-data">
                    <p>관련 정보를 찾을 수 없습니다.</p>
                    <button 
                      className="retry-btn"
                      onClick={() => loadRagData(selectedNode)}
                    >
                      다시 시도
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

// Chat History Sidebar Component
const ChatHistorySidebar: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { theme } = useTheme();
  const [sessions, setSessions] = useState([
    { id: '1', title: 'AI 개발자 커리어', date: '2024-01-15', messages: 5 },
    { id: '2', title: '데이터 분석가 경로', date: '2024-01-14', messages: 8 },
    { id: '3', title: 'PM 전환 계획', date: '2024-01-13', messages: 12 },
  ]);
  
  return (
    <>
      <div className={`chat-history-sidebar ${isOpen ? 'open' : 'closed'} ${theme}`}>
        <div className="chat-history-header">
          <h3>💬 대화 기록</h3>
          <button className="sidebar-close" onClick={onClose}>✕</button>
        </div>
        
        <div className="chat-history-content">
          <button className="new-chat-btn">
            ➕ 새 대화 시작
          </button>
          
          <div className="session-list">
            {sessions.map(session => (
              <div key={session.id} className="session-item">
                <div className="session-info">
                  <div className="session-title">{session.title}</div>
                  <div className="session-meta">
                    <span className="session-date">{session.date}</span>
                    <span className="message-count">{session.messages} 메시지</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}
    </>
  );
};

// Chat Toggle Component
const ChatToggle: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  return (
    <button className="chat-toggle" onClick={onClick} title="대화 기록">
      💬
    </button>
  );
};

// Sidebar Toggle Component
const SidebarToggle: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  return (
    <button className="sidebar-toggle" onClick={onClick} title="도구 사이드바 열기">
      📋
    </button>
  );
};

// 노드 편집 모달 컴포넌트
const NodeEditModal: React.FC<{
  isOpen: boolean;
  node: any;
  onClose: () => void;
  onSave: (nodeId: string, data: { label: string; description: string }) => void;
}> = ({ isOpen, node, onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const { theme } = useTheme();
  
  React.useEffect(() => {
    if (node) {
      setTitle(node.data.label || '');
      setDescription(node.data.subtitle || node.data.description || '');
    }
  }, [node]);
  
  const handleSave = () => {
    if (title.trim()) {
      onSave(node.id, { 
        label: title.trim(), 
        description: description.trim()
      });
      onClose();
    }
  };
  
  if (!isOpen || !node) return null;
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={`modal-content ${theme}`} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>노드 편집</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        
        <div className="modal-body">
          <div className="form-group">
            <label>제목:</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="노드 제목을 입력하세요"
              autoFocus
            />
          </div>
          
          <div className="form-group">
            <label>설명:</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="커리어 목표, 주요 영역, 세부 단계 등"
            />
          </div>
        </div>
        
        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>취소</button>
          <button className="btn-save" onClick={handleSave}>저장</button>
        </div>
      </div>
    </div>
  );
};

const AICareerCanvasInner: React.FC = () => {
  // Add invisible handle styles on component mount
  useEffect(() => {
    addInvisibleHandleStyles();
  }, []);
  const [nodes, setNodes, onNodesChange] = useNodesState([
    {
      id: '1',
      type: 'centerNode',
      position: { x: 400, y: 300 },
      data: { label: '새 마인드맵', description: '', subtitle: '커리어 목표', progress: 0 },
    }
  ]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isChatHistoryOpen, setIsChatHistoryOpen] = useState(false);
  const [isInputExpanded, setIsInputExpanded] = useState(false);
  const [showProgress, setShowProgress] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingNode, setEditingNode] = useState<any>(null);
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    nodeId: string;
  }>({ visible: false, x: 0, y: 0, nodeId: '' });
  const [selectedNodeForSidebar, setSelectedNodeForSidebar] = useState<Node | null>(null);
  
  // 연결 모드 상태
  const [isConnectMode, setIsConnectMode] = useState(false);
  const [sourceNodeId, setSourceNodeId] = useState<string | null>(null);
  
  // 에지 편집 상태
  const [selectedEdge, setSelectedEdge] = useState<string | null>(null);
  const [isEdgeEditMode, setIsEdgeEditMode] = useState(false);
  const toast = useToast();
  
  // 두 노드 간 최적 연결 방향 계산
  const calculateOptimalConnection = useCallback((sourceNode: any, targetNode: any) => {
    const dx = targetNode.position.x - sourceNode.position.x;
    const dy = targetNode.position.y - sourceNode.position.y;
    
    // 가장 가까운 방향 결정
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
    
    let sourceHandle, targetHandle;
    
    if (angle >= -45 && angle < 45) {
      // 오른쪽
      sourceHandle = 'source-right';
      targetHandle = 'target-left';
    } else if (angle >= 45 && angle < 135) {
      // 아래쪽
      sourceHandle = 'source-bottom';
      targetHandle = 'target-top';
    } else if (angle >= 135 || angle < -135) {
      // 왼쪽
      sourceHandle = 'source-left';
      targetHandle = 'target-right';
    } else {
      // 위쪽
      sourceHandle = 'source-top';
      targetHandle = 'target-bottom';
    }
    
    return { sourceHandle, targetHandle };
  }, []);
  
  // 방향별 스타일 결정 함수 (재사용) - source handle 우선 순위
  const getConnectionStyle = (sourceHandle: string | null | undefined, targetHandle: string | null | undefined) => {
    let strokeColor = '#3b82f6';
    let strokeWidth = 2;
    
    // source handle을 우선으로 색상 결정 (연결의 시작점 기준)
    if (sourceHandle === 'source-top') {
      strokeColor = '#10b981'; // 위쪽: 녹색
    } else if (sourceHandle === 'source-right') {
      strokeColor = '#f59e0b'; // 오른쪽: 주황색
    } else if (sourceHandle === 'source-bottom') {
      strokeColor = '#ef4444'; // 아래쪽: 빨간색
    } else if (sourceHandle === 'source-left') {
      strokeColor = '#8b5cf6'; // 왼쪽: 보라색
    } else if (targetHandle === 'target-top') {
      strokeColor = '#10b981'; // 위쪽: 녹색
    } else if (targetHandle === 'target-right') {
      strokeColor = '#f59e0b'; // 오른쪽: 주황색
    } else if (targetHandle === 'target-bottom') {
      strokeColor = '#ef4444'; // 아래쪽: 빨간색
    } else if (targetHandle === 'target-left') {
      strokeColor = '#8b5cf6'; // 왼쪽: 보라색
    }
    
    return { strokeColor, strokeWidth };
  };

  // 🎯 통합 연결 생성 헬퍼 함수 - 모든 연결 타입에서 일관성 보장
  const createConsistentEdge = useCallback((
    sourceNodeId: string,
    targetNodeId: string,
    connectionType: 'handle_drag' | 'connect_button' | 'context_add' | 'auto_connect' | 'handle_add',
    userSourceHandle?: string | null,
    userTargetHandle?: string | null,
    customNodes?: Node[]  // 선택적으로 노드 배열 전달 가능
  ) => {
    const nodeList = customNodes || nodes;
    const sourceNode = nodeList.find(n => n.id === sourceNodeId);
    const targetNode = nodeList.find(n => n.id === targetNodeId);
    
    if (!sourceNode || !targetNode) {
      console.error('❌ 노드를 찾을 수 없음:', { sourceNodeId, targetNodeId });
      return null;
    }

    // 핸들 선택 로직: 사용자 선택 존중 또는 최적 계산
    let finalSourceHandle: string;
    let finalTargetHandle: string;

    // 핸들 선택 우선순위:
    // 1. 핸들 드래그: 사용자가 드래그한 핸들 정보 사용
    // 2. 핸들 추가/컨텍스트 메뉴: 사용자 지정 핸들 사용  
    // 3. 기타: 최적 방향 자동 계산
    if (connectionType === 'handle_drag') {
      // 핸들 드래그: 정확한 사용자 선택 존중
      if (userSourceHandle && userTargetHandle) {
        finalSourceHandle = userSourceHandle;
        finalTargetHandle = userTargetHandle;
        console.log('🎯 핸들 드래그 - 사용자 선택 존중:', {
          source: finalSourceHandle,
          target: finalTargetHandle
        });
      } else {
        // 핸들 정보가 없으면 최적 계산
        const optimal = calculateOptimalConnection(sourceNode, targetNode);
        finalSourceHandle = optimal.sourceHandle;
        finalTargetHandle = optimal.targetHandle;
        console.log('🎯 핸들 드래그 - 최적 계산:', {
          source: finalSourceHandle,
          target: finalTargetHandle
        });
      }
    } else if (userSourceHandle && userTargetHandle && (connectionType === 'context_add' || connectionType === 'handle_add')) {
      // 컨텍스트 메뉴 및 핸들 추가에서는 사용자 선택 존중
      finalSourceHandle = userSourceHandle;
      finalTargetHandle = userTargetHandle;
      console.log('🎯 사용자 지정 핸들 사용:', {
        source: finalSourceHandle,
        target: finalTargetHandle
      });  
    } else {
      // 버튼 방식, 자동 연결 등 - 최적 방향 계산
      const optimal = calculateOptimalConnection(sourceNode, targetNode);
      finalSourceHandle = optimal.sourceHandle;
      finalTargetHandle = optimal.targetHandle;
      console.log('🎯 최적 방향 자동 계산:', {
        source: finalSourceHandle,
        target: finalTargetHandle
      });
    }

    const { strokeColor, strokeWidth } = getConnectionStyle(finalSourceHandle, finalTargetHandle);

    return {
      id: `e${sourceNodeId}-${targetNodeId}-${Date.now()}`,
      source: sourceNodeId,
      target: targetNodeId,
      sourceHandle: finalSourceHandle,
      targetHandle: finalTargetHandle,
      type: 'smoothstep',
      animated: true,
      style: {
        stroke: strokeColor,
        strokeWidth: strokeWidth,
      },
      markerEnd: {
        type: 'arrowclosed',
        color: strokeColor,
      },
      data: {
        sourceHandle: finalSourceHandle,
        targetHandle: finalTargetHandle,
        originalSourceHandle: userSourceHandle,
        originalTargetHandle: userTargetHandle,
        connectionType: connectionType
      },
    } as Edge;
  }, [nodes, calculateOptimalConnection, getConnectionStyle]);
  
  // 핸들 클릭으로 노드 생성
  const handleAddNodeFromHandle = useCallback((nodeId: string, direction: string) => {
    console.log('🎯 핸들에서 노드 생성 시작:', { nodeId, direction });
    
    const parentNode = nodes.find(n => n.id === nodeId);
    if (!parentNode) {
      console.error('⚠️ 부모 노드를 찾을 수 없음:', nodeId);
      return;
    }
    
    // 새 노드 ID
    const newNodeId = `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    console.log('🔴 새 노드 ID 생성:', newNodeId);
    
    // 방향에 따른 위치 계산
    const distance = 180;
    let newPosition = { x: parentNode.position.x, y: parentNode.position.y };
    let sourceHandle = '';
    let targetHandle = '';
    
    switch (direction) {
      case 'top':
        newPosition.y -= distance;
        sourceHandle = 'source-top';
        targetHandle = 'target-bottom';
        break;
      case 'right':
        newPosition.x += distance;
        sourceHandle = 'source-right';
        targetHandle = 'target-left';
        break;
      case 'bottom':
        newPosition.y += distance;
        sourceHandle = 'source-bottom';
        targetHandle = 'target-top';
        break;
      case 'left':
        newPosition.x -= distance;
        sourceHandle = 'source-left';
        targetHandle = 'target-right';
        break;
    }
    
    console.log('🗺️ 새 노드 위치 계산:', { newPosition, sourceHandle, targetHandle });
    
    // 새 노드 생성
    const newNode: Node = {
      id: newNodeId,
      type: 'detailNode',
      position: newPosition,
      data: { label: '새 노드', description: '', subtitle: '세부 단계' },
    };
    
    console.log('🔵 새 노드 오브젝트 생성:', newNode);
    
    // 노드 바로 추가
    setNodes(prevNodes => {
      const updatedNodes = [...prevNodes, newNode];
      console.log('📊 노드 배열 업데이트:', updatedNodes.length, '개');
      
      // 엣지 생성 및 추가 (동기적으로 처리)
      const newEdge = createConsistentEdge(
        nodeId,
        newNodeId,
        'handle_add',
        sourceHandle,
        targetHandle,
        updatedNodes
      );

      console.log('🔗 생성된 엣지:', newEdge);

      if (newEdge) {
        setEdges(prevEdges => {
          const edgeExists = prevEdges.some(e => 
            e.source === nodeId && e.target === newNodeId
          );
          if (!edgeExists) {
            const updatedEdges = [...prevEdges, newEdge];
            console.log('✅ 엣지 배열 업데이트:', updatedEdges.length, '개');
            return updatedEdges;
          }
          console.log('⚠️ 중복 엣지 방지');
          return prevEdges;
        });
      } else {
        console.error('❌ 엣지 생성 실패');
      }
      
      return updatedNodes;
    });
    
    toast.success(`${direction} 방향에 새 노드가 생성되었습니다`);
    console.log('✨ 노드 생성 완료');
  }, [nodes, setNodes, setEdges, createConsistentEdge, toast]);
  
  // 키보드 단축키
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Delete 키로 선택된 노드 삭제
      if (e.key === 'Delete') {
        const selectedNodes = nodes.filter(n => n.selected);
        if (selectedNodes.length > 0) {
          setNodes(nodes => nodes.filter(n => !n.selected));
          toast.info(`${selectedNodes.length}개 노드가 삭제되었습니다`);
        }
      }
      // Ctrl+L로 자동 정렬
      if (e.ctrlKey && e.key === 'l') {
        autoLayout();
      }
      // ESC로 연결 모드 취소
      if (e.key === 'Escape' && isConnectMode) {
        setIsConnectMode(false);
        setSourceNodeId(null);
        // 노드 스타일 초기화
        setNodes((nodes) =>
          nodes.map(n => ({
            ...n,
            selected: false,
            style: { ...n.style, border: undefined }
          }))
        );
        toast.info('연결 모드가 취소되었습니다');
      }
      // ESC로 에지 편집 모드 취소
      if (e.key === 'Escape' && isEdgeEditMode) {
        setIsEdgeEditMode(false);
        setSelectedEdge(null);
        toast.info('에지 편집 모드가 취소되었습니다');
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nodes, isConnectMode, isEdgeEditMode, setNodes, toast]);
  
  // 방향 이름 반환 함수 (source/target 구분)
  const getDirectionName = (handle: string | null | undefined, isSource: boolean = true) => {
    if (!handle) return '기본';
    
    if (isSource) {
      // source 핸들: 시작점
      if (handle === 'source-top') return '위쪽';
      if (handle === 'source-right') return '오른쪽';
      if (handle === 'source-bottom') return '아래쪽';
      if (handle === 'source-left') return '왼쪽';
    } else {
      // target 핸들: 도착점
      if (handle === 'target-top') return '위쪽';
      if (handle === 'target-right') return '오른쪽';
      if (handle === 'target-bottom') return '아래쪽';
      if (handle === 'target-left') return '왼쪽';
    }
    
    return '기본';
  };
  
  // 에지 연결 핸들러 - React Flow가 제공하는 연결 이벤트 처리
  const onConnect = useCallback(
    (params: Edge | Connection) => {
      console.log('🔍 HANDLE DRAG CONNECTION:', {
        source: params.source,
        target: params.target,
        sourceHandle: params.sourceHandle,
        targetHandle: params.targetHandle
      });

      // React Flow 기본 동작 사용 - 별도의 방향 보정 없이
      const newEdge = createConsistentEdge(
        params.source as string,
        params.target as string,
        'handle_drag',
        params.sourceHandle,
        params.targetHandle
      );

      if (!newEdge) {
        toast.error('연결할 노드를 찾을 수 없습니다');
        return;
      }
      
      // 연결 성공
      setEdges((eds) => addEdge(newEdge, eds));
      
      // 공간적 관계 및 성공 메시지
      const sourceNode = nodes.find(n => n.id === params.source);
      const targetNode = nodes.find(n => n.id === params.target);
      
      if (sourceNode && targetNode) {
        const dx = targetNode.position.x - sourceNode.position.x;
        const dy = targetNode.position.y - sourceNode.position.y;
        
        let spatialDirection = "연결됨";
        if (Math.abs(dx) > Math.abs(dy)) {
          spatialDirection = dx > 0 ? "오른쪽으로" : "왼쪽으로";
        } else {
          spatialDirection = dy > 0 ? "아래로" : "위로";
        }
        
        const sourceDirection = getDirectionName(newEdge.sourceHandle, true);
        const targetDirection = getDirectionName(newEdge.targetHandle, false);
        
        console.log('✅ 핸들 드래그 연결 완료:', {
          connection: `${sourceDirection} → ${targetDirection}`,
          spatial: spatialDirection,
          nodes: `${sourceNode.data?.label} → ${targetNode.data?.label}`,
          handles: { source: newEdge.sourceHandle, target: newEdge.targetHandle }
        });
        
        toast.success(`핸들 드래그: ${sourceNode.data?.label || 'Node'} ${spatialDirection} ${targetNode.data?.label || 'Node'} (${sourceDirection}→${targetDirection})`);
      } else {
        toast.success(`노드 연결 완료 (핸들 드래그)`);
      }
    },
    [createConsistentEdge, getDirectionName, setEdges, toast, nodes]
  );

  const addNode = useCallback((type: string, position: { x: number; y: number }) => {
    const newNode: Node = {
      id: Date.now().toString(),
      type: `${type}Node`,
      position,
      data: { label: `새 ${type} 노드` },
    };
    setNodes((nodes) => [...nodes, newNode]);
  }, [setNodes]);

  const onPaneClick = useCallback((event: React.MouseEvent) => {
    // Canvas clicked - hide context menu and deselect edge
    setContextMenu({ visible: false, x: 0, y: 0, nodeId: '' });
    setSelectedEdge(null);
    setIsEdgeEditMode(false);
  }, []);
  
  // 에지 클릭 핸들러
  const onEdgeClick = useCallback((event: React.MouseEvent, edge: Edge) => {
    event.stopPropagation();
    
    if (isConnectMode) return; // 연결 모드에서는 에지 편집 비활성화
    
    setSelectedEdge(edge.id);
    setIsEdgeEditMode(true);
    setContextMenu({ visible: false, x: 0, y: 0, nodeId: '' }); // 컨텍스트 메뉴 숨기기
    
    toast.info('에지가 선택되었습니다. 양 끝의 조작점을 드래그하여 연결점을 변경하세요. ESC로 취소 가능');
  }, [isConnectMode, toast]);
  
  // 에지 재연결 핸들러
  const onReconnect = useCallback((oldEdge: Edge, newConnection: Connection) => {
    console.log('Reconnecting edge:', oldEdge, 'to:', newConnection);
    
    const { strokeColor } = getConnectionStyle(newConnection.sourceHandle, newConnection.targetHandle);
    
    const updatedEdge = {
      ...oldEdge,
      source: newConnection.source,
      target: newConnection.target,
      sourceHandle: newConnection.sourceHandle,
      targetHandle: newConnection.targetHandle,
      style: {
        ...oldEdge.style,
        stroke: strokeColor,
      },
      markerEnd: {
        ...oldEdge.markerEnd,
        color: strokeColor,
      },
      data: {
        sourceHandle: newConnection.sourceHandle,
        targetHandle: newConnection.targetHandle,
      },
    };
    
    setEdges((edges) => reconnectEdge(oldEdge, newConnection, edges));
    
    // 편집 모드 종료
    setIsEdgeEditMode(false);
    setSelectedEdge(null);
    
    const sourceDirection = getDirectionName(newConnection.sourceHandle, true);
    const targetDirection = getDirectionName(newConnection.targetHandle, false);
    toast.success(`에지 연결점이 변경되었습니다: ${sourceDirection} → ${targetDirection}`);
    
    return updatedEdge;
  }, [getConnectionStyle, getDirectionName, setEdges, toast]);

  const onNodeClick = useCallback((event: React.MouseEvent, node: any) => {
    event.stopPropagation();
    
    // 연결 모드일 때는 연결 로직 실행
    if (isConnectMode) {
      if (!sourceNodeId) {
        // 첫 번째 노드 선택
        setSourceNodeId(node.id);
        toast.info(`첫 번째 노드 선택됨: ${node.data.label}. 두 번째 노드를 클릭하세요.`);
        // 노드 하이라이트
        setNodes((nodes) =>
          nodes.map(n => ({
            ...n,
            selected: n.id === node.id,
            style: { 
              ...n.style, 
              border: n.id === node.id ? '3px solid #3b82f6' : undefined 
            }
          }))
        );
      } else if (sourceNodeId !== node.id) {
        // 두 번째 노드 선택 - 연결 실행 (최적 방향 계산)
        const sourceNode = nodes.find(n => n.id === sourceNodeId);
        const targetNode = node;
        
        if (!sourceNode || !targetNode) {
          toast.error('연결할 노드를 찾을 수 없습니다');
          return;
        }
        
        console.log('🔍 CONNECT BUTTON CONNECTION:', {
          sourcePosition: sourceNode.position,
          targetPosition: targetNode.position,
          connection_type: 'connect_button'
        });

        // 🎯 통합 헬퍼 함수 사용 (버튼 연결 - 최적 계산)
        const newEdge = createConsistentEdge(
          sourceNodeId,
          node.id,
          'connect_button'
        );

        if (!newEdge) {
          toast.error('연결을 생성할 수 없습니다');
          return;
        }
        
        // 연결 실행
        setEdges((prevEdges) => {
          // 중복 에지 확인 (더 엄격한 검증)
          const edgeExists = prevEdges.some(e => 
            (e.source === sourceNodeId && e.target === node.id) ||
            (e.source === node.id && e.target === sourceNodeId)
          );
          
          if (!edgeExists) {
            // 공간적 관계 계산
            const dx = targetNode.position.x - sourceNode.position.x;
            const dy = targetNode.position.y - sourceNode.position.y;
            
            let spatialDirection = "연결됨";
            if (Math.abs(dx) > Math.abs(dy)) {
              spatialDirection = dx > 0 ? "오른쪽으로" : "왼쪽으로";
            } else {
              spatialDirection = dy > 0 ? "아래로" : "위로";
            }

            const sourceDirection = getDirectionName(newEdge.sourceHandle, true);
            const targetDirection = getDirectionName(newEdge.targetHandle, false);
            
            toast.success(`연결 버튼: ${sourceNode.data.label} ${spatialDirection} ${targetNode.data.label} (${sourceDirection}→${targetDirection})`);
            return [...prevEdges, newEdge];
          } else {
            toast.warning('이미 연결된 노드입니다.');
            return prevEdges;
          }
        });
        
        // 연결 모드 종료
        setIsConnectMode(false);
        setSourceNodeId(null);
        // 노드 스타일 초기화
        setNodes((nodes) =>
          nodes.map(n => ({
            ...n,
            selected: false,
            style: { ...n.style, border: undefined }
          }))
        );
      } else {
        toast.warning('같은 노드입니다. 다른 노드를 선택하세요.');
      }
      return;
    }
    
    // 일반 모드일 때는 컨텍스트 메뉴 표시 및 노드 선택
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    setContextMenu({
      visible: true,
      x: rect.right + 10,
      y: rect.top,
      nodeId: node.id,
    });
    
    // 사이드바를 위한 노드 선택
    setSelectedNodeForSidebar(node);
  }, [isConnectMode, sourceNodeId, setNodes, setEdges, toast]);

  const handleContextAction = (action: string, nodeId: string) => {
    setContextMenu({ visible: false, x: 0, y: 0, nodeId: '' });
    
    switch (action) {
      case 'edit':
        const nodeToEdit = nodes.find(n => n.id === nodeId);
        if (nodeToEdit) {
          setEditingNode(nodeToEdit);
          setEditModalOpen(true);
        }
        break;
      case 'delete':
        setNodes((nodes) => nodes.filter(n => n.id !== nodeId));
        setEdges((edges) => edges.filter(e => e.source !== nodeId && e.target !== nodeId));
        toast.info('노드가 삭제되었습니다');
        break;
      case 'ai-expand':
        handleAiExpand(nodeId);
        break;
      case 'connect':
        setIsConnectMode(true);
        setSourceNodeId(nodeId);
        toast.info('연결 모드: 연결할 두 번째 노드를 클릭하세요. 자동으로 최적 방향이 선택됩니다. ESC키로 취소 가능');
        // 첫 번째 노드 하이라이트
        setNodes((nodes) =>
          nodes.map(n => ({
            ...n,
            selected: n.id === nodeId,
            style: { 
              ...n.style, 
              border: n.id === nodeId ? '3px solid #3b82f6' : undefined 
            }
          }))
        );
        break;
    }
  };

  const clearCanvas = () => {
    setNodes([{
      id: '1',
      type: 'centerNode',
      position: { x: 400, y: 300 },
      data: { label: '새 마인드맵', description: '', subtitle: '커리어 목표', progress: 0 },
    }]);
    setEdges([]);
    toast.info('캔버스가 초기화되었습니다', { duration: 2000 });
  };
  
  // 노드 편집 저장
  const handleNodeEdit = (nodeId: string, data: { label: string; description: string }) => {
    setNodes((nodes) =>
      nodes.map(n =>
        n.id === nodeId
          ? { ...n, data: { ...n.data, label: data.label, subtitle: data.description } }
          : n
      )
    );
    toast.success('노드가 수정되었습니다');
  };
  
  // 독립 노드 추가 (연결되지 않은 노드)
  const addStandaloneNode = () => {
    const newNodeId = Date.now().toString();
    
    const newNode: Node = {
      id: newNodeId,
      type: 'detailNode',
      position: { 
        x: 400 + (Math.random() - 0.5) * 400,
        y: 300 + (Math.random() - 0.5) * 400
      },
      data: { label: '새 노드', description: '', subtitle: '세부 단계' },
    };
    
    // 노드만 추가 (에지 연결 없음)
    setNodes((prevNodes) => [...prevNodes, newNode]);
    
    toast.success('독립 노드가 생성되었습니다. 연결하려면 🔗 연결하기 버튼을 사용하세요.');
  };
  
  // AI 노드 확장 기능
  const handleAiExpand = async (nodeId: string) => {
    const targetNode = nodes.find(n => n.id === nodeId);
    if (!targetNode) {
      toast.error('확장할 노드를 찾을 수 없습니다');
      return;
    }

    toast.info(`"${targetNode.data.label}" 노드를 AI로 확장 중...`, { duration: 3000 });

    try {
      console.log('🚀 AI Expand API 호출:', {
        nodeId,
        nodeTitle: targetNode.data.label,
        nodeContent: targetNode.data.content || targetNode.data.subtitle
      });

      // Call auto-expand API
      const response = await autoExpand({
        context: `${targetNode.data.label}: ${targetNode.data.content || targetNode.data.subtitle || ''}`,
        parentNodeId: nodeId,
        expandDirection: 'children', // 자식 노드 확장
        maxNodes: 5 // 최대 5개 노드
      });

      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Failed to expand node');
      }

      console.log('✅ AI Expand API 응답:', response.data);

      // Generate new child nodes around the parent
      const parentPosition = targetNode.position;
      const childDistance = 180;
      const angleStep = (2 * Math.PI) / Math.min(response.data.expandedNodes.length, 6);
      
      const newNodes: Node[] = [];
      const newEdges: Edge[] = [];

      response.data.expandedNodes.forEach((expandedNode: any, index: number) => {
        const angle = index * angleStep;
        const childNodeId = `expanded-${Date.now()}-${index}`;
        
        // Calculate child position
        const childPosition = {
          x: parentPosition.x + Math.cos(angle) * childDistance,
          y: parentPosition.y + Math.sin(angle) * childDistance
        };

        // Create child node
        const childNode: Node = {
          id: childNodeId,
          type: 'detailNode',
          position: childPosition,
          data: {
            label: expandedNode.title || `확장 노드 ${index + 1}`,
            content: expandedNode.content || expandedNode.description || '',
            subtitle: '확장된 단계',
            metadata: {
              source: 'ai-expand',
              parentNodeId: nodeId,
              confidence: expandedNode.confidence || 0.8
            }
          },
        };

        newNodes.push(childNode);

        // Create edge from parent to child
        const edge = createConsistentEdge(
          nodeId,
          childNodeId,
          'context_add'
        );

        if (edge) {
          newEdges.push(edge);
        }
      });

      // Add nodes and edges to the graph
      setNodes(prevNodes => [...prevNodes, ...newNodes]);
      setEdges(prevEdges => [...prevEdges, ...newEdges]);

      console.log('🎯 AI 확장 완료:', {
        parentNode: targetNode.data.label,
        newNodes: newNodes.length,
        newEdges: newEdges.length
      });

      toast.success(`"${targetNode.data.label}" 노드가 ${newNodes.length}개의 하위 노드로 확장되었습니다!`, {
        duration: 4000,
        action: {
          label: '자동 정렬',
          onClick: () => autoLayout()
        }
      });

    } catch (error) {
      console.error('❌ AI 확장 실패:', error);
      toast.error(`노드 확장에 실패했습니다: ${error.message}`, { duration: 4000 });
    }
  };

  // 자동 레이아웃 기능
  const autoLayout = () => {
    const layoutedNodes = nodes.map((node, index) => {
      const angle = (index * 360) / nodes.length;
      const radius = 200;
      const x = 400 + radius * Math.cos((angle * Math.PI) / 180);
      const y = 300 + radius * Math.sin((angle * Math.PI) / 180);
      
      if (node.type === 'centerNode') {
        return { ...node, position: { x: 400, y: 300 } };
      }
      
      return { ...node, position: { x, y } };
    });
    
    setNodes(layoutedNodes);
    toast.success('노드가 자동 정렬되었습니다', { duration: 2000 });
  };
  
  // 중앙 노드와 연결되지 않은 노드들을 자동 연결 + 원본 연결 정보 처리
  const connectNodesToCenter = (nodes: Node[], edges: Edge[], originalConnections?: any[]) => {
    const centerNode = nodes.find(n => n.type === 'centerNode');
    if (!centerNode) {
      console.log('No center node found');
      return edges;
    }
    
    console.log('🔗 자동 연결: 중앙 노드에 연결 중:', { 
      centerNode: centerNode.id, 
      totalNodes: nodes.length, 
      currentEdges: edges.length 
    });
    
    const newEdges = [...edges];
    
    // 🎯 1. 원본 연결 정보가 있으면 먼저 처리 (일관성 있는 스타일 적용)
    if (originalConnections && originalConnections.length > 0) {
      console.log('🔗 원본 연결 정보 처리:', originalConnections.length, '개');
      originalConnections.forEach(connection => {
        const sourceNode = nodes.find(n => n.id === connection.fromNodeId);
        const targetNode = nodes.find(n => n.id === connection.toNodeId);
        
        if (sourceNode && targetNode) {
          const newEdge = createConsistentEdge(
            connection.fromNodeId,
            connection.toNodeId,
            'auto_connect'
          );
          
          if (newEdge) {
            console.log('✅ 원본 연결 추가:', {
              edge: `${sourceNode.data?.label} → ${targetNode.data?.label}`,
              direction: `${getDirectionName(newEdge.sourceHandle, true)} → ${getDirectionName(newEdge.targetHandle, false)}`
            });
            newEdges.push(newEdge);
          }
        }
      });
    }
    
    // 🎯 2. 중앙 노드와 연결되지 않은 노드들을 자동 연결
    nodes.forEach(node => {
      if (node.type !== 'centerNode') {
        // 이미 연결되어 있는지 확인 (더 정확한 검사)
        const hasConnection = newEdges.some(e => 
          (e.source === node.id || e.target === node.id) ||
          (e.source === centerNode.id && e.target === node.id) ||
          (e.source === node.id && e.target === centerNode.id)
        );
        
        if (!hasConnection) {
          // 🎯 통합 헬퍼 함수 사용 (자동 연결)
          const newEdge = createConsistentEdge(
            centerNode.id,
            node.id,
            'auto_connect'
          );
          
          if (newEdge) {
            console.log('✅ 자동 연결 추가:', {
              edge: `${centerNode.data?.label} → ${node.data?.label}`,
              direction: `${getDirectionName(newEdge.sourceHandle, true)} → ${getDirectionName(newEdge.targetHandle, false)}`,
              handles: { source: newEdge.sourceHandle, target: newEdge.targetHandle }
            });
            
            newEdges.push(newEdge);
          }
        }
      }
    });
    
    return newEdges;
  };
  
  // 내보내기 기능
  const exportToPNG = () => {
    toast.info('PNG 내보내기 기능을 준비 중입니다', { duration: 2000 });
    // TODO: React Flow의 toObject() 및 html2canvas 사용
  };
  

  const { theme } = useTheme();
  const [aiInput, setAiInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // ESC 키로 입력창 닫기
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isInputExpanded) {
        setIsInputExpanded(false);
        setAiInput('');
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isInputExpanded]);

  const handleAiGenerate = async () => {
    if (!aiInput.trim()) {
      toast.warning('주제를 입력해주세요', { duration: 2000 });
      return;
    }

    setIsGenerating(true);
    toast.info('AI가 마인드맵을 생성 중입니다...', { duration: 3000 });

    try {
      console.log('🚀 Smart Mindmap API 호출:', aiInput);
      
      // Call our smart mindmap API
      const response = await createSmartMindmapSimple(aiInput, true);
      
      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Failed to generate mindmap');
      }

      console.log('✅ Smart Mindmap API 응답:', {
        nodes: response.data.nodes.length,
        connections: response.data.connections.length,
        processingTime: response.data.metadata.processingTime
      });
      
      // Convert backend nodes to XYFlow format
      const flowNodes = convertToXYFlowNodes(response.data.nodes);
      const flowEdges = convertToXYFlowEdges(response.data.connections);
      
      // Set nodes and edges
      setNodes(flowNodes);
      setEdges(flowEdges);
      
      console.log('🎯 XYFlow 노드/엣지 설정 완료:', {
        nodes: flowNodes.length,
        edges: flowEdges.length,
        sources: response.data.metadata.sources.join(', ')
      });

      toast.success(`${aiInput} 마인드맵이 생성되었습니다! (${response.data.metadata.processingTime}ms)`, {
        duration: 3000,
        action: {
          label: '저장',
          onClick: () => {
            localStorage.setItem('smart-mindmap', JSON.stringify(response.data));
            toast.info('마인드맵이 저장되었습니다');
          }
        }
      });

      // Clear input after successful generation
      setAiInput('');
      setIsInputExpanded(false);
      
    } catch (error) {
      console.error('❌ Smart Mindmap 생성 실패:', error);
      toast.error(`마인드맵 생성에 실패했습니다: ${error.message}`, { duration: 4000 });
      
      // Fallback to mock data for development
      if (import.meta.env.DEV) {
        toast.info('개발 모드: Mock 데이터로 폴백합니다...', { duration: 2000 });
        
        const mockCareerMap = mockData.generateMockCareerMap(aiInput);
        const { nodes: flowNodes, edges: flowEdges } = convertCareerMapToFlow(
          mockCareerMap, 
          calculateOptimalConnection, 
          getConnectionStyle
        );
        
        setNodes(flowNodes);
        setEdges(flowEdges);
        setAiInput('');
        setIsInputExpanded(false);
      }
      
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className={`ai-career-canvas ${theme}`}>
      {/* Top Controls - 채팅 히스토리 및 사이드바 토글 */}
      <div className="top-controls">
        <ChatToggle onClick={() => setIsChatHistoryOpen(!isChatHistoryOpen)} />
        <SidebarToggle onClick={() => setIsSidebarOpen(true)} />
      </div>
      
      {/* 연결 모드 알림 */}
      {isConnectMode && (
        <div className="connect-mode-banner">
          <span>🔗 연결 모드: {sourceNodeId ? '두 번째 노드를 선택하세요' : '첫 번째 노드를 선택하세요'}</span>
          <button 
            onClick={() => {
              setIsConnectMode(false);
              setSourceNodeId(null);
              setNodes((nodes) =>
                nodes.map(n => ({
                  ...n,
                  selected: false,
                  style: { ...n.style, border: undefined }
                }))
              );
              toast.info('연결 모드가 취소되었습니다');
            }}
            className="cancel-connect-btn"
          >
            취소
          </button>
        </div>
      )}
      
      {/* 에지 편집 모드 알림 */}
      {isEdgeEditMode && selectedEdge && (
        <div className="edge-edit-mode-banner">
          <span>✏️ 에지 편집 모드: 조작점을 드래그하여 연결점을 변경하세요</span>
          <button 
            onClick={() => {
              setIsEdgeEditMode(false);
              setSelectedEdge(null);
              toast.info('에지 편집 모드가 취소되었습니다');
            }}
            className="cancel-edge-edit-btn"
          >
            완료
          </button>
        </div>
      )}

      {/* 상단 컨트롤 바 */}
      <div className="canvas-toolbar">
        <div className="toolbar-left">
          <button className="toolbar-btn" onClick={autoLayout} title="자동 정렬 (Ctrl+L)">
            🌀 정렬
          </button>
          <button className="toolbar-btn" onClick={() => setShowProgress(!showProgress)} title="진행도 표시">
            📊 {showProgress ? '진행도 숨기기' : '진행도 보기'}
          </button>
          <button className="toolbar-btn" onClick={exportToPNG} title="PNG로 내보내기">
            📤 내보내기
          </button>
          <button className="toolbar-btn" onClick={clearCanvas} title="초기화">
            🗑️ 초기화
          </button>
        </div>
        <div className="toolbar-right">
          <button className="toolbar-btn add-node-btn" onClick={addStandaloneNode} title="노드 추가">
            ➕ 노드
          </button>
        </div>
      </div>
      
      {/* Main Canvas */}
      <div className="flow-container">
        <NodeContext.Provider value={{ isConnectMode }}>
          <ReactFlow
          nodes={nodes}
          edges={edges.map(edge => ({
            ...edge,
            // 선택된 에지 스타일링 및 재연결 활성화
            selected: selectedEdge === edge.id,
            reconnectable: selectedEdge === edge.id, // 선택된 에지만 재연결 가능
            style: selectedEdge === edge.id ? {
              ...edge.style,
              strokeWidth: 4,
              stroke: edge.style?.stroke || '#3b82f6',
              strokeDasharray: selectedEdge === edge.id ? '5,5' : undefined,
            } : edge.style,
          }))}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onReconnect={onReconnect}
          onPaneClick={onPaneClick}
          onNodeClick={onNodeClick}
          onEdgeClick={onEdgeClick}
          nodeTypes={nodeTypes}
          connectOnClick={false}
          fitView
          attributionPosition="bottom-left"
          connectionMode="loose"
          elementsSelectable={true}
          selectNodesOnDrag={false}
          connectionRadius={30}
          connectionLineType="smoothstep"
          connectionLineStyle={{
            strokeWidth: 2,
            stroke: '#3b82f6',
            strokeDasharray: '8,8'
          }}
          defaultEdgeOptions={{
            type: 'smoothstep',
            animated: true
          }}
          snapToGrid={true}
          snapGrid={[15, 15]}
          deleteKeyCode={null}
          multiSelectionKeyCode={null}
          edgesReconnectable={selectedEdge !== null}
        >
          <MiniMap
            nodeStrokeColor={(n) => {
              const colors = theme === 'light' 
                ? { center: '#bfdbfe', major: '#3b82f6', detail: '#60a5fa', goal: '#1f2937' }
                : { center: '#1e40af', major: '#1d4ed8', detail: '#2563eb', goal: '#374151' };
              
              if (n.type === 'centerNode') return colors.center;
              if (n.type === 'majorNode') return colors.major;
              if (n.type === 'detailNode') return colors.detail;
              if (n.type === 'goalNode') return colors.goal;
              return theme === 'light' ? '#fff' : '#374151';
            }}
            nodeColor={(n) => {
              const colors = theme === 'light' 
                ? { center: '#bfdbfe', major: '#3b82f6', detail: '#60a5fa', goal: '#1f2937' }
                : { center: '#1e40af', major: '#1d4ed8', detail: '#2563eb', goal: '#374151' };
              
              if (n.type === 'centerNode') return colors.center;
              if (n.type === 'majorNode') return colors.major;
              if (n.type === 'detailNode') return colors.detail;
              if (n.type === 'goalNode') return colors.goal;
              return theme === 'light' ? '#fff' : '#374151';
            }}
            nodeBorderRadius={8}
          />
          <Controls />
          <Background 
            color={theme === 'light' ? '#aaa' : '#555'} 
            gap={16} 
          />
        </ReactFlow>
        </NodeContext.Provider>
      </div>

      {/* 하단 AI 입력 패널 - 확장/축소 가능 */}
      <div className="bottom-input-panel">
        {!isInputExpanded ? (
          <button 
            className="expand-input-btn"
            onClick={() => setIsInputExpanded(true)}
            title="새 마인드맵 생성"
          >
            ➕
          </button>
        ) : (
          <div className={`input-container ${theme} expanded`}>
            <button
              className="close-input-btn"
              onClick={() => {
                setIsInputExpanded(false);
                setAiInput('');
              }}
              title="닫기"
            >
              ✕
            </button>
            <input
              type="text"
              className="ai-input-field"
              placeholder="원하는 주제 사항을 입력하셔요"
              value={aiInput}
              onChange={(e) => setAiInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !isGenerating && handleAiGenerate()}
              disabled={isGenerating}
              autoFocus
            />
            <button
              className={`generate-btn--panel ${isGenerating ? 'loading' : ''}`}
              onClick={handleAiGenerate}
              disabled={isGenerating}
            >
              {isGenerating ? '생성 중...' : '생성'}
            </button>
          </div>
        )}
      </div>

      {/* Chat History Sidebar (좌측) */}
      <ChatHistorySidebar
        isOpen={isChatHistoryOpen}
        onClose={() => setIsChatHistoryOpen(false)}
      />
      
      {/* Info/Review Sidebar (우측) */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        onClearCanvas={clearCanvas}
        selectedNode={selectedNodeForSidebar}
      />

      {/* Context Menu */}
      {contextMenu.visible && (
        <div 
          className="context-menu"
          style={{
            position: 'fixed',
            left: contextMenu.x,
            top: contextMenu.y,
            zIndex: 1002,
          }}
        >
          <button onClick={() => handleContextAction('connect', contextMenu.nodeId)}>
            🔗 연결하기
          </button>
          <button onClick={() => handleContextAction('edit', contextMenu.nodeId)}>
            ✏️ 편집
          </button>
          <button onClick={() => handleContextAction('delete', contextMenu.nodeId)}>
            🗑️ 삭제
          </button>
          <button onClick={() => handleContextAction('ai-expand', contextMenu.nodeId)}>
            🤖 AI 확장
          </button>
        </div>
      )}

      {/* Overlay when sidebar is open on mobile */}
      {isSidebarOpen && <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)} />}
      
      {/* Context menu overlay */}
      {contextMenu.visible && (
        <div 
          className="context-overlay" 
          onClick={() => setContextMenu({ visible: false, x: 0, y: 0, nodeId: '' })}
        />
      )}
      
      {/* 노드 편집 모달 */}
      <NodeEditModal
        isOpen={editModalOpen}
        node={editingNode}
        onClose={() => {
          setEditModalOpen(false);
          setEditingNode(null);
        }}
        onSave={handleNodeEdit}
      />
    </div>
  );
};

// Main Component with Theme Provider
const AICareerCanvas: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Header에서 테마 변경을 감지하고 동기화
  React.useEffect(() => {
    // data-theme 속성 감지로 테마 변경 추적
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
          const newTheme = document.documentElement.getAttribute('data-theme') as 'light' | 'dark';
          if (newTheme) {
            setTheme(newTheme);
          }
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    });

    // 초기 테마 설정
    const initialTheme = document.documentElement.getAttribute('data-theme') as 'light' | 'dark';
    if (initialTheme) {
      setTheme(initialTheme);
    } else {
      // 기본값 설정
      document.documentElement.setAttribute('data-theme', 'light');
    }

    return () => {
      observer.disconnect();
    };
  }, []); // Empty dependency array - observer created only once

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <ReactFlowProvider>
        <AICareerCanvasInner />
      </ReactFlowProvider>
    </ThemeContext.Provider>
  );
};

export default AICareerCanvas;