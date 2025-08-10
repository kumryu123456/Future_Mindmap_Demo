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