// Legacy types - these are kept for backwards compatibility
// New projects should use the comprehensive types from './store'
export interface MindmapNode {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  width?: number;
  height?: number;
}

export interface Connection {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  color?: string;
}

export interface MindmapData {
  nodes: MindmapNode[];
  connections: Connection[];
}

// Re-export API types
export * from './api';

// Re-export store types (avoiding conflicts)
export type {
  MindmapStoreState,
  MindmapStoreActions,
  MindmapStoreSelectors,
  MindmapNode as StoreMindmapNode,
  MindmapConnection as StoreMindmapConnection,
  MindmapLayout,
  MindmapCanvas,
  MindmapTheme,
  MindmapHistory,
  MindmapSelection,
  MindmapClipboard,
  MindmapSearch,
  MindmapCollaboration,
  MindmapAnalytics,
  MindmapExport,
  MindmapAction,
  MindmapActionType,
  NodeStyle,
  NodeAnimation,
  NodeAttachment,
  ConnectionStyle,
  SearchResult,
  SearchFilters,
  SearchOptions,
  Collaborator,
  CollaboratorCursor,
  CollaborationChange,
  PerformanceMetrics,
  ExportOptions
} from './store';