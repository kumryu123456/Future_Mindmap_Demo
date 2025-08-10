// Mindmap Store Types
export interface MindmapNode {
  id: string;
  text: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  color: string;
  backgroundColor?: string;
  fontSize?: number;
  fontWeight?: 'normal' | 'bold';
  borderRadius?: number;
  borderWidth?: number;
  borderColor?: string;
  parentId?: string;
  children: string[];
  level: number;
  type: 'central' | 'main' | 'sub' | 'note';
  isExpanded: boolean;
  isSelected: boolean;
  isEditing: boolean;
  isVisible: boolean;
  tags?: string[];
  metadata?: {
    createdAt: string;
    updatedAt: string;
    createdBy?: string;
    priority?: 'low' | 'medium' | 'high';
    status?: 'draft' | 'completed' | 'archived';
    notes?: string;
    attachments?: NodeAttachment[];
  };
  style?: NodeStyle;
  animation?: NodeAnimation;
}

export interface NodeStyle {
  theme?: string;
  gradient?: {
    start: string;
    end: string;
    direction: number;
  };
  shadow?: {
    enabled: boolean;
    color: string;
    blur: number;
    offsetX: number;
    offsetY: number;
  };
  icon?: {
    name: string;
    color: string;
    size: number;
  };
}

export interface NodeAnimation {
  type?: 'none' | 'pulse' | 'bounce' | 'shake' | 'glow';
  duration?: number;
  iterations?: number;
  isActive?: boolean;
}

export interface NodeAttachment {
  id: string;
  type: 'image' | 'link' | 'document' | 'note';
  url?: string;
  content?: string;
  title: string;
  metadata?: Record<string, unknown>;
}

export interface MindmapConnection {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  type: 'hierarchical' | 'associative' | 'dependency' | 'sequence';
  style: ConnectionStyle;
  label?: string;
  strength: number; // 0-1
  isVisible: boolean;
  isSelected: boolean;
  metadata?: {
    createdAt: string;
    description?: string;
    category?: string;
  };
}

export interface ConnectionStyle {
  color: string;
  width: number;
  style: 'solid' | 'dashed' | 'dotted' | 'curved';
  arrowType: 'none' | 'arrow' | 'circle' | 'diamond';
  arrowSize: number;
  opacity: number;
}

export interface MindmapLayout {
  type: 'radial' | 'tree' | 'organic' | 'grid' | 'manual';
  centerX: number;
  centerY: number;
  spacing: {
    horizontal: number;
    vertical: number;
    radial: number;
  };
  autoLayout: boolean;
  preserveManualPositions: boolean;
  algorithm?: 'force-directed' | 'hierarchical' | 'circular';
  parameters?: Record<string, unknown>;
}

export interface MindmapCanvas {
  width: number;
  height: number;
  scale: number;
  offsetX: number;
  offsetY: number;
  minScale: number;
  maxScale: number;
  backgroundColor: string;
  gridEnabled: boolean;
  gridSize: number;
  gridColor: string;
  snapToGrid: boolean;
  showMinimap: boolean;
  showToolbar: boolean;
  showStatusBar: boolean;
}

export interface MindmapTheme {
  id: string;
  name: string;
  description?: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    success: string;
    warning: string;
    error: string;
  };
  nodeStyles: {
    central: Partial<NodeStyle>;
    main: Partial<NodeStyle>;
    sub: Partial<NodeStyle>;
    note: Partial<NodeStyle>;
  };
  connectionStyles: {
    default: Partial<ConnectionStyle>;
    highlighted: Partial<ConnectionStyle>;
    selected: Partial<ConnectionStyle>;
  };
  fonts: {
    primary: string;
    secondary: string;
    sizes: {
      central: number;
      main: number;
      sub: number;
      note: number;
    };
  };
}

export interface MindmapHistory {
  past: MindmapHistoryEntry[];
  present: MindmapHistoryEntry;
  future: MindmapHistoryEntry[];
  maxSize: number;
  currentIndex: number;
}

export interface MindmapHistoryEntry {
  id: string;
  timestamp: string;
  action: MindmapAction;
  nodes: Record<string, MindmapNode>;
  connections: Record<string, MindmapConnection>;
  layout: MindmapLayout;
  canvas: MindmapCanvas;
  description: string;
}

export interface MindmapSelection {
  nodes: string[];
  connections: string[];
  bbox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  isMultiSelect: boolean;
  lastSelectedId?: string;
}

export interface MindmapClipboard {
  nodes: MindmapNode[];
  connections: MindmapConnection[];
  type: 'cut' | 'copy';
  timestamp: string;
}

export interface MindmapSearch {
  query: string;
  results: SearchResult[];
  currentIndex: number;
  isActive: boolean;
  filters: SearchFilters;
  options: SearchOptions;
}

export interface SearchResult {
  nodeId: string;
  type: 'text' | 'tag' | 'metadata';
  field: string;
  match: string;
  context: string;
  score: number;
}

export interface SearchFilters {
  nodeTypes: string[];
  levels: number[];
  tags: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  hasAttachments?: boolean;
  status?: string[];
}

export interface SearchOptions {
  caseSensitive: boolean;
  wholeWords: boolean;
  regex: boolean;
  includeMetadata: boolean;
  maxResults: number;
}

export interface MindmapCollaboration {
  isEnabled: boolean;
  sessionId?: string;
  collaborators: Collaborator[];
  cursors: Record<string, CollaboratorCursor>;
  changes: CollaborationChange[];
  conflictResolution: 'last-write-wins' | 'operational-transform';
}

export interface Collaborator {
  id: string;
  name: string;
  avatar?: string;
  color: string;
  isActive: boolean;
  lastSeen: string;
  permissions: ('read' | 'write' | 'admin')[];
}

export interface CollaboratorCursor {
  userId: string;
  x: number;
  y: number;
  isVisible: boolean;
  timestamp: string;
}

export interface CollaborationChange {
  id: string;
  userId: string;
  timestamp: string;
  type: 'node' | 'connection' | 'layout' | 'canvas';
  operation: 'create' | 'update' | 'delete' | 'move';
  targetId: string;
  data: Record<string, unknown>;
  applied: boolean;
}

export interface MindmapAnalytics {
  nodeCount: number;
  connectionCount: number;
  maxDepth: number;
  branchingFactor: number;
  createdAt: string;
  lastModified: string;
  editCount: number;
  viewCount: number;
  collaboratorCount: number;
  tags: Record<string, number>;
  nodeTypes: Record<string, number>;
  activityLog: ActivityLogEntry[];
  performance: PerformanceMetrics;
}

export interface ActivityLogEntry {
  id: string;
  timestamp: string;
  userId?: string;
  action: string;
  targetType: 'node' | 'connection' | 'layout' | 'canvas';
  targetId?: string;
  description: string;
  metadata?: Record<string, unknown>;
}

export interface PerformanceMetrics {
  renderTime: number;
  layoutTime: number;
  searchTime: number;
  saveTime: number;
  loadTime: number;
  memoryUsage: number;
}

export interface MindmapExport {
  format: 'json' | 'png' | 'svg' | 'pdf' | 'html' | 'markdown' | 'txt';
  options: ExportOptions;
  status: 'idle' | 'processing' | 'completed' | 'error';
  progress: number;
  result?: {
    url?: string;
    data?: string;
    blob?: Blob;
  };
}

export interface ExportOptions {
  includeHiddenNodes?: boolean;
  includeConnections?: boolean;
  includeMetadata?: boolean;
  quality?: number; // for image exports
  paperSize?: 'A4' | 'A3' | 'letter' | 'custom';
  orientation?: 'portrait' | 'landscape';
  margins?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  backgroundColor?: string;
  transparent?: boolean;
}

// Action Types
export interface MindmapAction {
  type: MindmapActionType;
  payload: unknown;
  timestamp: string;
  userId?: string;
  id: string;
}

export type MindmapActionType =
  // Node Actions
  | 'NODE_CREATE'
  | 'NODE_UPDATE'
  | 'NODE_DELETE'
  | 'NODE_SELECT'
  | 'NODE_DESELECT'
  | 'NODE_MOVE'
  | 'NODE_EDIT_START'
  | 'NODE_EDIT_END'
  | 'NODE_EXPAND'
  | 'NODE_COLLAPSE'
  | 'NODE_CHANGE_TYPE'
  | 'NODE_ADD_TAG'
  | 'NODE_REMOVE_TAG'
  | 'NODE_ATTACH_FILE'
  | 'NODE_REMOVE_ATTACHMENT'
  // Connection Actions
  | 'CONNECTION_CREATE'
  | 'CONNECTION_UPDATE'
  | 'CONNECTION_DELETE'
  | 'CONNECTION_SELECT'
  | 'CONNECTION_DESELECT'
  // Layout Actions
  | 'LAYOUT_UPDATE'
  | 'LAYOUT_AUTO_ARRANGE'
  | 'LAYOUT_CHANGE_TYPE'
  | 'LAYOUT_RESET'
  // Canvas Actions
  | 'CANVAS_PAN'
  | 'CANVAS_ZOOM'
  | 'CANVAS_RESIZE'
  | 'CANVAS_RESET_VIEW'
  | 'CANVAS_TOGGLE_GRID'
  | 'CANVAS_CHANGE_BACKGROUND'
  // Selection Actions
  | 'SELECT_ALL'
  | 'SELECT_NONE'
  | 'SELECT_AREA'
  | 'SELECT_CONNECTED'
  | 'SELECT_SIBLINGS'
  // Clipboard Actions
  | 'COPY'
  | 'CUT'
  | 'PASTE'
  | 'DUPLICATE'
  // History Actions
  | 'UNDO'
  | 'REDO'
  | 'CLEAR_HISTORY'
  // Theme Actions
  | 'THEME_APPLY'
  | 'THEME_UPDATE'
  | 'THEME_RESET'
  // Search Actions
  | 'SEARCH_START'
  | 'SEARCH_UPDATE'
  | 'SEARCH_CLEAR'
  | 'SEARCH_NEXT'
  | 'SEARCH_PREVIOUS'
  // Collaboration Actions
  | 'COLLAB_JOIN'
  | 'COLLAB_LEAVE'
  | 'COLLAB_CURSOR_UPDATE'
  | 'COLLAB_CHANGE_APPLY'
  | 'COLLAB_SYNC'
  // Data Actions
  | 'MINDMAP_LOAD'
  | 'MINDMAP_SAVE'
  | 'MINDMAP_IMPORT'
  | 'MINDMAP_EXPORT'
  | 'MINDMAP_NEW'
  | 'MINDMAP_CLEAR';

// Main Store State
export interface MindmapStoreState {
  // Core Data
  id: string;
  name: string;
  description?: string;
  nodes: Record<string, MindmapNode>;
  connections: Record<string, MindmapConnection>;
  
  // Visual Configuration
  layout: MindmapLayout;
  canvas: MindmapCanvas;
  theme: MindmapTheme;
  
  // Interaction State
  selection: MindmapSelection;
  clipboard: MindmapClipboard;
  search: MindmapSearch;
  
  // History & Versioning
  history: MindmapHistory;
  isDirty: boolean;
  lastSaved?: string;
  
  // Collaboration
  collaboration: MindmapCollaboration;
  
  // Analytics & Performance
  analytics: MindmapAnalytics;
  
  // Export/Import
  export: MindmapExport;
  
  // UI State
  ui: {
    isLoading: boolean;
    error?: string;
    mode: 'view' | 'edit' | 'present' | 'collaborate';
    sidebarOpen: boolean;
    toolbarVisible: boolean;
    statusBarVisible: boolean;
    shortcuts: Record<string, string>;
    tooltips: boolean;
    animations: boolean;
  };
  
  // Settings
  settings: {
    autoSave: boolean;
    autoSaveInterval: number;
    maxHistorySize: number;
    showGrid: boolean;
    snapToGrid: boolean;
    magneticNodes: boolean;
    smoothAnimations: boolean;
    highPerformanceMode: boolean;
    debugMode: boolean;
    accessibility: {
      highContrast: boolean;
      screenReader: boolean;
      keyboardNavigation: boolean;
    };
  };
}

// Store Action Creators
export interface MindmapStoreActions {
  // Node Actions
  createNode: (node: Partial<MindmapNode>) => void;
  updateNode: (id: string, updates: Partial<MindmapNode>) => void;
  deleteNode: (id: string) => void;
  selectNode: (id: string, addToSelection?: boolean) => void;
  deselectNode: (id: string) => void;
  moveNode: (id: string, x: number, y: number) => void;
  startNodeEdit: (id: string) => void;
  endNodeEdit: (id: string, text?: string) => void;
  expandNode: (id: string) => void;
  collapseNode: (id: string) => void;
  changeNodeType: (id: string, type: MindmapNode['type']) => void;
  addNodeTag: (id: string, tag: string) => void;
  removeNodeTag: (id: string, tag: string) => void;
  attachFileToNode: (id: string, attachment: NodeAttachment) => void;
  removeNodeAttachment: (id: string, attachmentId: string) => void;
  
  // Connection Actions
  createConnection: (sourceId: string, targetId: string, type?: MindmapConnection['type']) => void;
  updateConnection: (id: string, updates: Partial<MindmapConnection>) => void;
  deleteConnection: (id: string) => void;
  selectConnection: (id: string) => void;
  deselectConnection: (id: string) => void;
  
  // Layout Actions
  updateLayout: (updates: Partial<MindmapLayout>) => void;
  autoArrange: (algorithm?: MindmapLayout['algorithm']) => void;
  changeLayoutType: (type: MindmapLayout['type']) => void;
  resetLayout: () => void;
  
  // Canvas Actions
  panCanvas: (deltaX: number, deltaY: number) => void;
  zoomCanvas: (scale: number, centerX?: number, centerY?: number) => void;
  resizeCanvas: (width: number, height: number) => void;
  resetCanvasView: () => void;
  toggleGrid: () => void;
  changeCanvasBackground: (color: string) => void;
  
  // Selection Actions
  selectAll: () => void;
  selectNone: () => void;
  selectArea: (x1: number, y1: number, x2: number, y2: number) => void;
  selectConnected: (nodeId: string) => void;
  selectSiblings: (nodeId: string) => void;
  
  // Clipboard Actions
  copy: () => void;
  cut: () => void;
  paste: (x?: number, y?: number) => void;
  duplicate: () => void;
  
  // History Actions
  undo: () => void;
  redo: () => void;
  clearHistory: () => void;
  
  // Theme Actions
  applyTheme: (theme: MindmapTheme) => void;
  updateTheme: (updates: Partial<MindmapTheme>) => void;
  resetTheme: () => void;
  
  // Search Actions
  startSearch: (query: string) => void;
  updateSearch: (query: string, filters?: Partial<SearchFilters>) => void;
  clearSearch: () => void;
  searchNext: () => void;
  searchPrevious: () => void;
  
  // Collaboration Actions
  joinCollaboration: (sessionId: string, user: Collaborator) => void;
  leaveCollaboration: () => void;
  updateCursor: (x: number, y: number) => void;
  applyCollaborationChange: (change: CollaborationChange) => void;
  syncCollaboration: () => void;
  
  // Data Actions
  loadMindmap: (data: Partial<MindmapStoreState>) => void;
  saveMindmap: () => Promise<void>;
  importMindmap: (data: unknown, format: string) => void;
  exportMindmap: (format: MindmapExport['format'], options?: ExportOptions) => void;
  newMindmap: (template?: string) => void;
  clearMindmap: () => void;
}

// Store Selectors
export interface MindmapStoreSelectors {
  // Node Selectors
  getNode: (id: string) => MindmapNode | undefined;
  getNodes: () => MindmapNode[];
  getSelectedNodes: () => MindmapNode[];
  getVisibleNodes: () => MindmapNode[];
  getNodesByType: (type: MindmapNode['type']) => MindmapNode[];
  getNodesByLevel: (level: number) => MindmapNode[];
  getNodeChildren: (id: string) => MindmapNode[];
  getNodeParent: (id: string) => MindmapNode | undefined;
  getNodeSiblings: (id: string) => MindmapNode[];
  getNodePath: (id: string) => MindmapNode[];
  getRootNodes: () => MindmapNode[];
  
  // Connection Selectors
  getConnection: (id: string) => MindmapConnection | undefined;
  getConnections: () => MindmapConnection[];
  getNodeConnections: (nodeId: string) => MindmapConnection[];
  getConnectedNodes: (nodeId: string) => MindmapNode[];
  
  // Search Selectors
  getSearchResults: () => SearchResult[];
  getCurrentSearchResult: () => SearchResult | undefined;
  
  // Analytics Selectors
  getAnalytics: () => MindmapAnalytics;
  getNodeCount: () => number;
  getConnectionCount: () => number;
  getMaxDepth: () => number;
  
  // UI State Selectors
  isLoading: () => boolean;
  getError: () => string | undefined;
  getMode: () => MindmapStoreState['ui']['mode'];
  isCanvasGridVisible: () => boolean;
  
  // History Selectors
  canUndo: () => boolean;
  canRedo: () => boolean;
  getHistorySize: () => number;
}