import { apiService } from './api';
import type { ApiResponse } from '../types/api';

// Types for Smart Mindmap API
export interface SmartMindmapRequest {
  input: string;
  options?: {
    maxNodes?: number;
    includeEnterpriseData?: boolean;
    includeRAG?: boolean;
    layout?: 'hierarchical' | 'radial' | 'force';
    language?: string;
  };
}

export interface MindmapNode {
  id: string;
  title: string;
  content: string;
  x: number;
  y: number;
  type: 'center' | 'major' | 'minor' | 'detail';
  parentId?: string;
  level: number;
  metadata?: {
    source?: 'parsed' | 'enterprise' | 'rag' | 'ai';
    confidence?: number;
    relatedCompanies?: string[];
    keywords?: string[];
  };
}

export interface MindmapConnection {
  id: string;
  sourceId: string;
  targetId: string;
  type: string;
}

export interface SmartMindmapResponse {
  success: boolean;
  data?: {
    nodes: MindmapNode[];
    connections: MindmapConnection[];
    metadata: {
      processingTime: number;
      sources: string[];
      totalNodes: number;
      parseResults: any;
      enterpriseResults: any;
    };
  };
  error?: string;
}

/**
 * Create a smart mindmap from user input
 * Combines Korean NLP parsing + enterprise data + AI generation
 * 
 * @param request - The smart mindmap creation request
 * @returns Promise with generated mindmap structure
 */
export async function createSmartMindmap(
  request: SmartMindmapRequest
): Promise<ApiResponse<SmartMindmapResponse['data']>> {
  try {
    // Validate input
    if (!request.input || request.input.trim() === '') {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Input text is required for mindmap generation',
        }
      };
    }

    console.log('[Smart Mindmap] Creating from input:', request.input.substring(0, 100));

    // Call the integrated backend API
    const response = await apiService.post<SmartMindmapResponse['data']>(
      '/functions/v1/create-smart-mindmap',
      {
        input: request.input.trim(),
        options: {
          maxNodes: request.options?.maxNodes || 12,
          includeEnterpriseData: request.options?.includeEnterpriseData ?? true,
          includeRAG: request.options?.includeRAG ?? false,
          layout: request.options?.layout || 'hierarchical',
          language: request.options?.language || 'korean',
          ...request.options
        }
      }
    );

    // Debug: 실제 응답 구조 확인
    console.log('[Smart Mindmap] Full API response:', JSON.stringify(response, null, 2));
    
    if (response.success && response.data) {
      console.log('[Smart Mindmap] Response data keys:', Object.keys(response.data));
      console.log('[Smart Mindmap] Response data:', JSON.stringify(response.data, null, 2));
      
      // Fix: 이중 중첩 구조 처리
      const actualData = response.data.data || response.data;
      
      console.log('[Smart Mindmap] Generated successfully:', {
        nodes: actualData.nodes?.length || 0,
        connections: actualData.connections?.length || 0,
        processingTime: actualData.metadata?.processingTime || 0
      });

      // 정규화된 응답 구조 반환
      return {
        success: true,
        data: actualData
      };
    }

    return response;

  } catch (error) {
    console.error('[Smart Mindmap] API error:', error);
    
    return {
      success: false,
      error: {
        code: 'API_ERROR',
        message: 'Failed to generate smart mindmap',
        details: { error: String(error) }
      }
    };
  }
}

/**
 * Create a smart mindmap with default options (convenience function)
 * 
 * @param inputText - User input text
 * @param includeEnterpriseData - Whether to include enterprise data (default: true)
 * @returns Promise with generated mindmap
 */
export async function createSmartMindmapSimple(
  inputText: string,
  includeEnterpriseData: boolean = true
): Promise<ApiResponse<SmartMindmapResponse['data']>> {
  return createSmartMindmap({
    input: inputText,
    options: {
      maxNodes: 12,
      includeEnterpriseData,
      includeRAG: false, // Will be used in detailed sidebar
      layout: 'hierarchical',
      language: 'korean'
    }
  });
}

/**
 * Create a mindmap optimized for Korean startup/business content
 * 
 * @param inputText - Business-related input text
 * @returns Promise with business-focused mindmap
 */
export async function createBusinessMindmap(
  inputText: string
): Promise<ApiResponse<SmartMindmapResponse['data']>> {
  return createSmartMindmap({
    input: inputText,
    options: {
      maxNodes: 15,
      includeEnterpriseData: true, // Essential for business context
      includeRAG: false,
      layout: 'hierarchical',
      language: 'korean'
    }
  });
}

/**
 * Convert backend mindmap nodes to XYFlow nodes format
 * 
 * @param mindmapNodes - Nodes from backend
 * @returns XYFlow compatible nodes
 */
export function convertToXYFlowNodes(mindmapNodes: MindmapNode[]) {
  return mindmapNodes.map(node => ({
    id: node.id,
    type: node.type === 'center' ? 'centerNode' : 
          node.type === 'major' ? 'majorNode' : 'minorNode',
    position: { x: node.x, y: node.y },
    data: {
      label: node.title,
      content: node.content,
      level: node.level,
      nodeType: node.type,
      metadata: node.metadata
    },
    draggable: true,
    selectable: true
  }));
}

/**
 * Convert backend connections to XYFlow edges format
 * 
 * @param connections - Connections from backend
 * @returns XYFlow compatible edges
 */
export function convertToXYFlowEdges(connections: MindmapConnection[]) {
  return connections.map(conn => ({
    id: conn.id,
    source: conn.sourceId,
    target: conn.targetId,
    type: 'smoothstep',
    animated: false,
    style: {
      stroke: conn.type === 'main' ? '#3b82f6' : '#6b7280',
      strokeWidth: conn.type === 'main' ? 2 : 1
    }
  }));
}