import { apiService } from './api';
import type { ApiResponse } from '../types/api';

// Types for Node Auto-Expand API
export interface NodeExpandRequest {
  parentNodeId: string;
  parentNodeType?: 'mindmap_node' | 'plan_node' | 'custom';
  maxChildren?: number;
  similarityThreshold?: number;
  expansionStyle?: 'comprehensive' | 'focused' | 'creative' | 'analytical';
  useLLM?: boolean;
}

export interface ParentNode {
  id: string;
  title: string;
  content: string;
  x: number;
  y: number;
  type: string;
}

export interface ChildNodeSuggestion {
  title: string;
  content: string;
  reasoning: string;
  x: number;
  y: number;
  priority: number;
  confidence: number;
}

export interface SimilarContent {
  id: string;
  content_text: string;
  content_type: string;
  similarity_score: number;
  metadata?: Record<string, any>;
}

export interface NodeExpandResponse {
  parent_node: ParentNode;
  similar_content: SimilarContent[];
  generated_children: ChildNodeSuggestion[];
  expansion_context: Record<string, any>;
  created_mindmap_nodes?: any[];
  expansion_id: string;
}

/**
 * Expand a mindmap node with AI-generated child nodes
 * 
 * @param request - The auto-expand request parameters
 * @returns Promise with expanded node data and suggestions
 */
export async function expandNode(
  request: NodeExpandRequest
): Promise<ApiResponse<NodeExpandResponse>> {
  try {
    // Validate input
    if (!request.parentNodeId || request.parentNodeId.trim() === '') {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Parent node ID is required for auto-expansion',
        }
      };
    }

    console.log('[Node Expand] Expanding node:', request.parentNodeId);

    // Call the auto-expand API
    const response = await apiService.post<NodeExpandResponse>(
      '/functions/v1/auto-expand',
      {
        parentNodeId: request.parentNodeId.trim(),
        parentNodeType: request.parentNodeType || 'mindmap_node',
        maxChildren: request.maxChildren || 4,
        similarityThreshold: request.similarityThreshold || 0.7,
        expansionStyle: request.expansionStyle || 'comprehensive',
        useLLM: request.useLLM ?? true
      }
    );

    // Debug: 실제 응답 구조 확인
    console.log('[Node Expand] API Response:', JSON.stringify(response, null, 2));

    if (response.success && response.data) {
      // Fix: 이중 중첩 구조 처리
      const actualData = response.data.data || response.data;

      console.log('[Node Expand] Successfully expanded node:', {
        parentId: request.parentNodeId,
        childrenGenerated: actualData.generated_children?.length || 0,
        nodesCreated: actualData.created_mindmap_nodes?.length || 0,
        expansionStyle: actualData.expansion_context?.expansion_style
      });

      // 정규화된 응답 구조 반환
      return {
        success: true,
        data: actualData
      };
    }

    return response;

  } catch (error) {
    console.error('[Node Expand] API error:', error);
    
    return {
      success: false,
      error: {
        code: 'API_ERROR',
        message: 'Failed to auto-expand node',
        details: { error: String(error) }
      }
    };
  }
}

/**
 * Auto-expand a node with creative suggestions
 * 
 * @param parentNodeId - ID of the parent node to expand
 * @returns Promise with creative expansion suggestions
 */
export async function expandNodeCreative(
  parentNodeId: string
): Promise<ApiResponse<NodeExpandResponse>> {
  return expandNode({
    parentNodeId,
    maxChildren: 5,
    expansionStyle: 'creative',
    useLLM: true
  });
}

/**
 * Auto-expand a node with focused, actionable suggestions
 * 
 * @param parentNodeId - ID of the parent node to expand
 * @returns Promise with focused expansion suggestions
 */
export async function expandNodeFocused(
  parentNodeId: string
): Promise<ApiResponse<NodeExpandResponse>> {
  return expandNode({
    parentNodeId,
    maxChildren: 3,
    expansionStyle: 'focused',
    useLLM: true
  });
}

/**
 * Auto-expand a node with comprehensive coverage
 * 
 * @param parentNodeId - ID of the parent node to expand
 * @returns Promise with comprehensive expansion suggestions
 */
export async function expandNodeComprehensive(
  parentNodeId: string
): Promise<ApiResponse<NodeExpandResponse>> {
  return expandNode({
    parentNodeId,
    maxChildren: 6,
    expansionStyle: 'comprehensive',
    useLLM: true
  });
}

/**
 * Auto-expand a node with analytical breakdown
 * 
 * @param parentNodeId - ID of the parent node to expand
 * @returns Promise with analytical expansion suggestions
 */
export async function expandNodeAnalytical(
  parentNodeId: string
): Promise<ApiResponse<NodeExpandResponse>> {
  return expandNode({
    parentNodeId,
    maxChildren: 4,
    expansionStyle: 'analytical',
    useLLM: true
  });
}

/**
 * Convert child suggestions to XYFlow node format
 * 
 * @param children - Child node suggestions from API
 * @param parentId - ID of the parent node
 * @returns XYFlow compatible nodes
 */
export function convertChildSuggestionsToNodes(
  children: ChildNodeSuggestion[],
  parentId: string
) {
  return children.map((child, index) => ({
    id: `expanded-${parentId}-${index}`,
    type: 'expandedNode',
    position: { x: child.x, y: child.y },
    data: {
      label: child.title,
      content: child.content,
      reasoning: child.reasoning,
      priority: child.priority,
      confidence: child.confidence,
      parentId: parentId,
      isExpanded: true,
      nodeType: 'expanded'
    },
    draggable: true,
    selectable: true,
    style: {
      border: `2px solid ${child.confidence > 0.8 ? '#10b981' : child.confidence > 0.6 ? '#f59e0b' : '#6b7280'}`,
      borderRadius: '8px',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      minWidth: '120px',
      minHeight: '60px'
    }
  }));
}

/**
 * Convert child suggestions to XYFlow edges format
 * 
 * @param children - Child node suggestions from API
 * @param parentId - ID of the parent node
 * @returns XYFlow compatible edges
 */
export function convertChildSuggestionsToEdges(
  children: ChildNodeSuggestion[],
  parentId: string
) {
  return children.map((child, index) => ({
    id: `edge-${parentId}-expanded-${index}`,
    source: parentId,
    target: `expanded-${parentId}-${index}`,
    type: 'smoothstep',
    animated: false,
    style: {
      stroke: child.priority >= 4 ? '#3b82f6' : child.priority >= 3 ? '#10b981' : '#6b7280',
      strokeWidth: child.priority >= 4 ? 2 : 1,
      strokeDasharray: child.confidence < 0.7 ? '5,5' : undefined
    },
    markerEnd: {
      type: 'arrowclosed',
      color: child.priority >= 4 ? '#3b82f6' : child.priority >= 3 ? '#10b981' : '#6b7280'
    }
  }));
}

/**
 * Get expansion history for a specific parent node
 * 
 * @param parentNodeId - ID of the parent node
 * @param limit - Maximum number of history entries to retrieve
 * @returns Promise with expansion history
 */
export async function getNodeExpansionHistory(
  parentNodeId: string,
  limit: number = 10
): Promise<ApiResponse<any[]>> {
  try {
    const response = await apiService.get<any[]>(
      `/functions/v1/auto-expand?parentNodeId=${encodeURIComponent(parentNodeId)}&limit=${limit}`
    );

    return response;
  } catch (error) {
    console.error('[Node Expand] Failed to get expansion history:', error);
    
    return {
      success: false,
      error: {
        code: 'API_ERROR',
        message: 'Failed to retrieve expansion history',
        details: { error: String(error) }
      }
    };
  }
}

/**
 * Quick expand utility that handles database node expansion
 * This creates new nodes in the database and returns them formatted for XYFlow
 * 
 * @param nodeId - ID of the node to expand (must exist in database)
 * @param style - Expansion style preference
 * @returns Promise with XYFlow-ready nodes and edges
 */
export async function quickExpandNode(
  nodeId: string,
  style: 'comprehensive' | 'focused' | 'creative' | 'analytical' = 'comprehensive'
): Promise<{
  success: boolean;
  nodes?: any[];
  edges?: any[];
  data?: NodeExpandResponse;
  error?: any;
}> {
  try {
    // Call the appropriate expansion function based on style
    let response: ApiResponse<NodeExpandResponse>;
    
    switch (style) {
      case 'creative':
        response = await expandNodeCreative(nodeId);
        break;
      case 'focused':
        response = await expandNodeFocused(nodeId);
        break;
      case 'analytical':
        response = await expandNodeAnalytical(nodeId);
        break;
      case 'comprehensive':
      default:
        response = await expandNodeComprehensive(nodeId);
        break;
    }

    if (!response.success || !response.data) {
      return {
        success: false,
        error: response.error
      };
    }

    // Convert suggestions to XYFlow format
    const newNodes = convertChildSuggestionsToNodes(response.data.generated_children, nodeId);
    const newEdges = convertChildSuggestionsToEdges(response.data.generated_children, nodeId);

    console.log(`[Quick Expand] Generated ${newNodes.length} nodes and ${newEdges.length} edges for node ${nodeId}`);

    return {
      success: true,
      nodes: newNodes,
      edges: newEdges,
      data: response.data
    };

  } catch (error) {
    console.error('[Quick Expand] Error:', error);
    return {
      success: false,
      error: { message: String(error) }
    };
  }
}

/**
 * Expand memory-only node (for non-database nodes like career map nodes)
 * This generates AI suggestions without database operations
 * 
 * @param nodeData - Node data from React Flow
 * @param style - Expansion style preference
 * @returns Promise with XYFlow-ready nodes and edges
 */
export async function expandMemoryNode(
  nodeData: { id: string; data: any; position: { x: number; y: number } },
  style: 'comprehensive' | 'focused' | 'creative' | 'analytical' = 'comprehensive'
): Promise<{
  success: boolean;
  nodes?: any[];
  edges?: any[];
  error?: any;
}> {
  try {
    const nodeTitle = nodeData.data.label || nodeData.data.title || 'Unknown';
    const nodeContent = nodeData.data.content || nodeData.data.subtitle || nodeData.data.description || '';
    
    console.log(`[Memory Expand] Attempting smart expansion for "${nodeTitle}"`);

    // Try to use the smart expansion API with virtual node data
    try {
      const smartExpandRequest = {
        nodeTitle,
        nodeContent,
        nodeContext: {
          id: nodeData.id,
          type: nodeData.data.type || 'career',
          category: nodeData.data.category || 'general',
          level: nodeData.data.level || 'intermediate'
        },
        expansionStyle: style,
        maxChildren: {
          focused: 2 + Math.floor(Math.random() * 2), // 2-3개
          creative: 4 + Math.floor(Math.random() * 3), // 4-6개
          analytical: 3 + Math.floor(Math.random() * 2), // 3-4개
          comprehensive: 4 + Math.floor(Math.random() * 4) // 4-7개
        }[style],
        language: 'korean',
        useRAG: true // Enable RAG for better context
      };

      // Try the new smart-expand API first
      let response = await apiService.post<any>(
        '/functions/v1/smart-expand',
        smartExpandRequest
      );

      // Fallback to create-smart-mindmap if smart-expand doesn't exist
      if (!response.success && response.error?.code === '404') {
        console.log('[Memory Expand] Smart-expand not found, trying create-smart-mindmap...');
        response = await apiService.post<any>(
          '/functions/v1/create-smart-mindmap',
          {
            input: `${nodeTitle}: ${nodeContent}`,
            options: {
              includeDetails: true,
              language: 'korean',
              maxNodes: smartExpandRequest.maxChildren,
              style: style,
              mode: 'expand' // Special mode for node expansion
            }
          }
        );
      }

      // Handle different response structures
      let childSuggestions: ChildNodeSuggestion[] = [];
      
      if (response.success && response.data) {
        if (response.data.suggestions) {
          // Smart-expand API response
          childSuggestions = response.data.suggestions.map((suggestion: any, index: number) => {
            const angle = (index * 2 * Math.PI) / response.data.suggestions.length;
            const radius = 150;
            return {
              title: suggestion.title,
              content: suggestion.content,
              reasoning: suggestion.reasoning || (suggestion.ragSource ? `RAG 기반: ${suggestion.ragSource}` : 'AI 생성'),
              x: nodeData.position.x + radius * Math.cos(angle),
              y: nodeData.position.y + radius * Math.sin(angle),
              priority: suggestion.priority || 3,
              confidence: suggestion.confidence || 0.8
            };
          });
          
          // Log RAG usage if available
          if (response.data.expansionMetadata?.ragUsed) {
            console.log(`[Memory Expand] RAG-enhanced expansion with ${response.data.ragContext?.length || 0} context items`);
          }
          
        } else if (response.data.nodes) {
          // Create-smart-mindmap API response
          childSuggestions = response.data.nodes
            .filter((n: any) => n.id !== 'center') // Exclude center node
            .map((node: any, index: number) => {
              const angle = (index * 2 * Math.PI) / response.data.nodes.length;
              const radius = 150;
              return {
                title: node.label,
                content: node.content || node.subtitle || '',
                reasoning: `AI가 "${nodeTitle}"와 연관성을 분석하여 생성`,
                x: nodeData.position.x + radius * Math.cos(angle),
                y: nodeData.position.y + radius * Math.sin(angle),
                priority: node.priority || 3,
                confidence: node.confidence || 0.8
              };
            });
        }
      }
      
      if (childSuggestions.length > 0) {

        const newNodes = convertChildSuggestionsToNodes(childSuggestions, nodeData.id);
        const newEdges = convertChildSuggestionsToEdges(childSuggestions, nodeData.id);

        console.log(`[Memory Expand] Smart expansion successful: ${newNodes.length} nodes generated`);
        
        return {
          success: true,
          nodes: newNodes,
          edges: newEdges
        };
      }
    } catch (apiError) {
      console.warn('[Memory Expand] Smart expansion failed, falling back to contextual generation:', apiError);
    }

    // Fallback: Generate contextually relevant suggestions based on node content
    const maxChildren = {
      focused: 3,
      creative: 5,
      analytical: 4,
      comprehensive: 6
    }[style];

    const childSuggestions: ChildNodeSuggestion[] = [];
    const radius = 150;
    const angleStep = (2 * Math.PI) / maxChildren;
    const baseX = nodeData.position.x;
    const baseY = nodeData.position.y;

    // Generate personalized suggestions based on node content and context
    const suggestions = generatePersonalizedSuggestions(nodeTitle, nodeContent, style, maxChildren);

    for (let i = 0; i < suggestions.length; i++) {
      const angle = i * angleStep + (Math.random() - 0.5) * 0.3; // Add slight randomness
      const radiusVariation = radius + (Math.random() - 0.5) * 40; // Vary radius
      const x = baseX + radiusVariation * Math.cos(angle);
      const y = baseY + radiusVariation * Math.sin(angle);

      childSuggestions.push({
        ...suggestions[i],
        x: Math.round(x),
        y: Math.round(y)
      });
    }

    // Convert to XYFlow format
    const newNodes = convertChildSuggestionsToNodes(childSuggestions, nodeData.id);
    const newEdges = convertChildSuggestionsToEdges(childSuggestions, nodeData.id);

    console.log(`[Memory Expand] Contextual expansion: ${newNodes.length} nodes for ${nodeData.id}`);

    return {
      success: true,
      nodes: newNodes,
      edges: newEdges
    };

  } catch (error) {
    console.error('[Memory Expand] Error:', error);
    return {
      success: false,
      error: { message: String(error) }
    };
  }
}

/**
 * Generate personalized suggestions based on node content and context
 */
function generatePersonalizedSuggestions(
  title: string,
  content: string,
  style: string,
  maxChildren: number
): Array<Omit<ChildNodeSuggestion, 'x' | 'y'>> {
  const suggestions: Array<Omit<ChildNodeSuggestion, 'x' | 'y'>> = [];
  
  // Domain detection based on keywords
  const fullText = `${title} ${content}`.toLowerCase();
  const isDev = /react|vue|angular|javascript|프론트엔드|백엔드|개발/.test(fullText);
  const isDesign = /디자인|ui|ux|figma|sketch/.test(fullText);
  const isData = /데이터|분석|sql|python|머신러닝/.test(fullText);
  
  if (isDev) {
    // Developer-specific suggestions
    const devSuggestions = {
      focused: [
        { title: '핵심 기술 스택', content: '필수 프로그래밍 언어와 프레임워크', priority: 5, confidence: 0.9 },
        { title: '실무 프로젝트', content: '포트폴리오용 실전 프로젝트', priority: 5, confidence: 0.85 },
        { title: '학습 로드맵', content: '단계별 학습 계획과 자료', priority: 4, confidence: 0.8 }
      ],
      creative: [
        { title: '혁신 기술 트렌드', content: 'AI, 블록체인, 메타버스 등 신기술', priority: 4, confidence: 0.75 },
        { title: '오픈소스 기여', content: '커뮤니티 참여와 기여 방법', priority: 3, confidence: 0.7 },
        { title: '스타트업 창업', content: '개발자 창업 아이디어와 방법', priority: 3, confidence: 0.65 },
        { title: '글로벌 원격근무', content: '해외 기업 원격 근무 기회', priority: 3, confidence: 0.7 },
        { title: '기술 블로그/유튜브', content: '개인 브랜딩과 지식 공유', priority: 3, confidence: 0.75 }
      ],
      analytical: [
        { title: '시장 수요 분석', content: '기술별 채용 수요와 연봉 통계', priority: 4, confidence: 0.85 },
        { title: '기업별 기술 스택', content: '주요 IT 기업 기술 요구사항', priority: 4, confidence: 0.8 },
        { title: '성장 경로 분석', content: '주니어-시니어-리드 성장 단계', priority: 4, confidence: 0.82 },
        { title: '경쟁력 평가', content: '현재 실력과 시장 요구 비교', priority: 3, confidence: 0.75 }
      ],
      comprehensive: [
        { title: '기술 역량', content: '프로그래밍 언어와 프레임워크 마스터', priority: 5, confidence: 0.9 },
        { title: '프로젝트 경험', content: '실무 프로젝트와 포트폴리오', priority: 5, confidence: 0.88 },
        { title: '소프트 스킬', content: '커뮤니케이션과 협업 능력', priority: 4, confidence: 0.8 },
        { title: '자격증/교육', content: '전문 자격증과 교육 과정', priority: 3, confidence: 0.75 },
        { title: '네트워킹', content: '개발자 커뮤니티와 컨퍼런스', priority: 3, confidence: 0.7 },
        { title: '커리어 전략', content: '장기 성장 계획과 목표 설정', priority: 4, confidence: 0.78 }
      ]
    };
    
    const selected = devSuggestions[style as keyof typeof devSuggestions] || devSuggestions.comprehensive;
    suggestions.push(...selected.slice(0, maxChildren).map(s => ({
      ...s,
      reasoning: `"${title}"의 개발 직무 특성을 고려한 ${style} 확장`
    })));
    
  } else if (isDesign) {
    // Design-specific suggestions
    suggestions.push(
      { title: '포트폴리오 구성', content: 'UI/UX 작품집 준비 전략', priority: 5, confidence: 0.9, reasoning: '디자인 직무 핵심 요소' },
      { title: '디자인 도구', content: 'Figma, Sketch, Adobe 툴 마스터', priority: 4, confidence: 0.85, reasoning: '필수 기술 스택' },
      { title: '사용자 리서치', content: 'UX 리서치와 사용성 테스트', priority: 4, confidence: 0.8, reasoning: 'UX 역량 강화' }
    );
    
  } else if (isData) {
    // Data-specific suggestions
    suggestions.push(
      { title: '데이터 분석 도구', content: 'Python, R, SQL 마스터', priority: 5, confidence: 0.9, reasoning: '데이터 직무 필수 도구' },
      { title: '머신러닝/AI', content: '예측 모델링과 딥러닝', priority: 4, confidence: 0.82, reasoning: '고급 분석 역량' },
      { title: '시각화 능력', content: 'Tableau, Power BI 활용', priority: 4, confidence: 0.78, reasoning: '인사이트 전달 능력' }
    );
    
  } else {
    // General career suggestions
    const generalSuggestions = {
      focused: [
        { title: `${title} 핵심 기술`, content: `${title} 역할에 필수적인 핵심 기술 습득`, priority: 5, confidence: 0.85 + Math.random() * 0.1 },
        { title: `${title} 실무 준비`, content: `${title} 분야 실무 경험과 전문 지식`, priority: 5, confidence: 0.82 + Math.random() * 0.1 },
        { title: `${title} 취업 전략`, content: `${title} 직무 취업을 위한 전략과 준비`, priority: 4, confidence: 0.8 + Math.random() * 0.1 }
      ],
      creative: [
        { title: `${title} 신영역`, content: `${title}에서 파생되는 새로운 기회와 영역`, priority: 3 + Math.floor(Math.random() * 2), confidence: 0.7 + Math.random() * 0.1 },
        { title: `${title} 부업`, content: `${title} 스킬을 활용한 부업과 추가 수입`, priority: 3, confidence: 0.68 + Math.random() * 0.1 },
        { title: `${title} 글로벌`, content: `${title} 분야의 해외 진출과 글로벌 기회`, priority: 3, confidence: 0.65 + Math.random() * 0.1 },
        { title: `${title} 창업`, content: `${title} 전문성을 기반으로 한 창업 아이디어`, priority: 3, confidence: 0.62 + Math.random() * 0.1 },
        { title: `${title} 브랜딩`, content: `${title} 전문가로서의 개인 브랜드 구축`, priority: 3, confidence: 0.7 + Math.random() * 0.1 }
      ],
      analytical: [
        { title: `${title} 시장 분석`, content: `${title} 분야의 시장 동향과 성장 기회`, priority: 4, confidence: 0.78 + Math.random() * 0.1 },
        { title: `${title} 역량 평가`, content: `${title} 담당자로서의 역량 진단과 개발 계획`, priority: 4, confidence: 0.75 + Math.random() * 0.1 },
        { title: `${title} 커리어 전략`, content: `${title} 분야에서의 연봉 또는 커리어 성장 전략`, priority: 3 + Math.floor(Math.random() * 2), confidence: 0.72 + Math.random() * 0.1 },
        { title: `${title} 성과 측정`, content: `${title} 역할에서의 성과 측정과 KPI 관리`, priority: 3, confidence: 0.7 + Math.random() * 0.1 }
      ],
      comprehensive: [
        { title: `${title} 전문성 강화`, content: `${title} 분야의 전문 지식과 역량 개발`, priority: 5, confidence: 0.85 },
        { title: `${title} 실무 프로젝트`, content: `${title} 영역의 실전 프로젝트 경험`, priority: 5, confidence: 0.82 },
        { title: `${title} 역량 인증`, content: `${title} 관련 자격증과 포트폴리오`, priority: Math.floor(Math.random() * 2) + 3, confidence: 0.75 + Math.random() * 0.1 },
        { title: `${title} 커뮤니티`, content: `${title} 전문가 네트워크 및 업계 관계`, priority: Math.floor(Math.random() * 2) + 3, confidence: 0.7 + Math.random() * 0.1 },
        { title: `${title} 리더십`, content: `${title} 팀 관리와 리더십 스킬`, priority: 4, confidence: 0.78 + Math.random() * 0.1 },
        { title: `${title} 트렌드`, content: `${title} 최신 트렌드와 미래 전망`, priority: 3 + Math.floor(Math.random() * 2), confidence: 0.72 + Math.random() * 0.1 }
      ]
    };
    
    const selected = generalSuggestions[style as keyof typeof generalSuggestions] || generalSuggestions.comprehensive;
    suggestions.push(...selected.slice(0, maxChildren).map(s => ({
      ...s,
      reasoning: `"${title}"와 관련된 ${style} 커리어 확장 요소`
    })));
  }

  // Ensure we have enough suggestions
  while (suggestions.length < maxChildren) {
    suggestions.push({
      title: `${title} - 관련 영역 ${suggestions.length + 1}`,
      content: `${title}와 연결된 추가 탐색 영역`,
      reasoning: `보충 확장 노드`,
      priority: 3,
      confidence: 0.6
    });
  }

  return suggestions.slice(0, maxChildren);
}