import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { v4 as uuidv4 } from 'uuid';
import type {
  MindmapStoreState,
  MindmapStoreActions,
  MindmapNode,
  MindmapConnection,
  MindmapAction,
  MindmapHistoryEntry,
  MindmapTheme,
  NodeAttachment,
  CollaborationChange,
  Collaborator,
  ExportOptions
} from '../types/store';

// Default theme
const defaultTheme: MindmapTheme = {
  id: 'default',
  name: 'Default Theme',
  description: 'Clean and modern default theme',
  colors: {
    primary: '#667eea',
    secondary: '#764ba2',
    accent: '#f093fb',
    background: '#ffffff',
    surface: '#f8f9fa',
    text: '#2d3748',
    textSecondary: '#718096',
    border: '#e2e8f0',
    success: '#48bb78',
    warning: '#ed8936',
    error: '#f56565'
  },
  nodeStyles: {
    central: {
      gradient: { start: '#667eea', end: '#764ba2', direction: 45 },
      shadow: { enabled: true, color: 'rgba(0,0,0,0.1)', blur: 8, offsetX: 0, offsetY: 4 }
    },
    main: {
      gradient: { start: '#764ba2', end: '#667eea', direction: 135 },
      shadow: { enabled: true, color: 'rgba(0,0,0,0.08)', blur: 6, offsetX: 0, offsetY: 2 }
    },
    sub: {
      shadow: { enabled: true, color: 'rgba(0,0,0,0.05)', blur: 4, offsetX: 0, offsetY: 1 }
    },
    note: {
      shadow: { enabled: false, color: 'rgba(0,0,0,0.05)', blur: 2, offsetX: 0, offsetY: 1 }
    }
  },
  connectionStyles: {
    default: { color: '#a0aec0', width: 2, style: 'curved', arrowType: 'arrow', arrowSize: 8, opacity: 0.8 },
    highlighted: { color: '#667eea', width: 3, style: 'curved', arrowType: 'arrow', arrowSize: 10, opacity: 1 },
    selected: { color: '#f093fb', width: 3, style: 'curved', arrowType: 'arrow', arrowSize: 10, opacity: 1 }
  },
  fonts: {
    primary: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
    secondary: 'Monaco, Menlo, Consolas, monospace',
    sizes: {
      central: 18,
      main: 14,
      sub: 12,
      note: 11
    }
  }
};

// Initial state
const initialState: MindmapStoreState = {
  id: uuidv4(),
  name: 'New Mindmap',
  description: undefined,
  nodes: {},
  connections: {},
  
  layout: {
    type: 'radial',
    centerX: 400,
    centerY: 300,
    spacing: { horizontal: 200, vertical: 150, radial: 180 },
    autoLayout: true,
    preserveManualPositions: false,
    algorithm: 'force-directed'
  },
  
  canvas: {
    width: 1200,
    height: 800,
    scale: 1,
    offsetX: 0,
    offsetY: 0,
    minScale: 0.1,
    maxScale: 3,
    backgroundColor: '#ffffff',
    gridEnabled: true,
    gridSize: 20,
    gridColor: '#f0f0f0',
    snapToGrid: false,
    showMinimap: false,
    showToolbar: true,
    showStatusBar: true
  },
  
  theme: defaultTheme,
  
  selection: {
    nodes: [],
    connections: [],
    bbox: undefined,
    isMultiSelect: false,
    lastSelectedId: undefined
  },
  
  clipboard: {
    nodes: [],
    connections: [],
    type: 'copy',
    timestamp: ''
  },
  
  search: {
    query: '',
    results: [],
    currentIndex: -1,
    isActive: false,
    filters: {
      nodeTypes: [],
      levels: [],
      tags: [],
      dateRange: undefined,
      hasAttachments: undefined,
      status: []
    },
    options: {
      caseSensitive: false,
      wholeWords: false,
      regex: false,
      includeMetadata: false,
      maxResults: 100
    }
  },
  
  history: {
    past: [],
    present: {} as MindmapHistoryEntry,
    future: [],
    maxSize: 50,
    currentIndex: -1
  },
  
  isDirty: false,
  lastSaved: undefined,
  
  collaboration: {
    isEnabled: false,
    sessionId: undefined,
    collaborators: [],
    cursors: {},
    changes: [],
    conflictResolution: 'last-write-wins'
  },
  
  analytics: {
    nodeCount: 0,
    connectionCount: 0,
    maxDepth: 0,
    branchingFactor: 0,
    createdAt: new Date().toISOString(),
    lastModified: new Date().toISOString(),
    editCount: 0,
    viewCount: 0,
    collaboratorCount: 0,
    tags: {},
    nodeTypes: {},
    activityLog: [],
    performance: {
      renderTime: 0,
      layoutTime: 0,
      searchTime: 0,
      saveTime: 0,
      loadTime: 0,
      memoryUsage: 0
    }
  },
  
  export: {
    format: 'json',
    options: {},
    status: 'idle',
    progress: 0,
    result: undefined
  },
  
  ui: {
    isLoading: false,
    error: undefined,
    mode: 'edit',
    sidebarOpen: false,
    toolbarVisible: true,
    statusBarVisible: true,
    shortcuts: {
      'Ctrl+Z': 'undo',
      'Ctrl+Y': 'redo',
      'Ctrl+C': 'copy',
      'Ctrl+V': 'paste',
      'Ctrl+X': 'cut',
      'Delete': 'delete',
      'Ctrl+A': 'selectAll',
      'Ctrl+S': 'save'
    },
    tooltips: true,
    animations: true
  },
  
  settings: {
    autoSave: true,
    autoSaveInterval: 30000, // 30 seconds
    maxHistorySize: 50,
    showGrid: true,
    snapToGrid: false,
    magneticNodes: true,
    smoothAnimations: true,
    highPerformanceMode: false,
    debugMode: false,
    accessibility: {
      highContrast: false,
      screenReader: false,
      keyboardNavigation: true
    }
  }
};

// Helper functions
const updateAnalytics = (state: MindmapStoreState) => {
  const nodes = Object.values(state.nodes);
  const connections = Object.values(state.connections);
  
  state.analytics.nodeCount = nodes.length;
  state.analytics.connectionCount = connections.length;
  state.analytics.maxDepth = Math.max(...nodes.map(n => n.level), 0);
  state.analytics.branchingFactor = nodes.length > 0 ? 
    connections.length / Math.max(nodes.length - 1, 1) : 0;
  state.analytics.lastModified = new Date().toISOString();
  state.analytics.editCount++;
  
  // Update node types count
  state.analytics.nodeTypes = nodes.reduce((acc, node) => {
    acc[node.type] = (acc[node.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  // Update tags count
  state.analytics.tags = nodes.reduce((acc, node) => {
    node.tags?.forEach(tag => {
      acc[tag] = (acc[tag] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);
};

const generateNodeId = (): string => `node_${uuidv4()}`;
const generateConnectionId = (): string => `conn_${uuidv4()}`;

// Create the store
export const useMindmapStore = create<MindmapStoreState & MindmapStoreActions>()(
  devtools(
    subscribeWithSelector(
      immer((set, get) => ({
        ...initialState,
        
        // Node Actions
        createNode: (nodeData: Partial<MindmapNode>) => {
          set((state) => {
            const id = nodeData.id || generateNodeId();
            const parentId = nodeData.parentId;
            const level = parentId ? (state.nodes[parentId]?.level || 0) + 1 : 0;
            
            const newNode: MindmapNode = {
              id,
              text: nodeData.text || 'New Node',
              x: nodeData.x || state.layout.centerX,
              y: nodeData.y || state.layout.centerY,
              width: nodeData.width || 120,
              height: nodeData.height || 60,
              color: nodeData.color || state.theme.colors.primary,
              backgroundColor: nodeData.backgroundColor,
              fontSize: nodeData.fontSize || state.theme.fonts.sizes.main,
              fontWeight: nodeData.fontWeight || 'normal',
              borderRadius: nodeData.borderRadius || 8,
              borderWidth: nodeData.borderWidth || 2,
              borderColor: nodeData.borderColor || state.theme.colors.border,
              parentId,
              children: [],
              level,
              type: nodeData.type || (level === 0 ? 'central' : level === 1 ? 'main' : 'sub'),
              isExpanded: nodeData.isExpanded ?? true,
              isSelected: false,
              isEditing: false,
              isVisible: nodeData.isVisible ?? true,
              tags: nodeData.tags || [],
              metadata: {
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                ...nodeData.metadata
              },
              style: nodeData.style,
              animation: nodeData.animation
            };
            
            state.nodes[id] = newNode;
            
            // Update parent's children array
            if (parentId && state.nodes[parentId]) {
              state.nodes[parentId].children.push(id);
            }
            
            // Create connection to parent
            if (parentId && state.nodes[parentId]) {
              const connectionId = generateConnectionId();
              state.connections[connectionId] = {
                id: connectionId,
                sourceNodeId: parentId,
                targetNodeId: id,
                type: 'hierarchical',
                style: state.theme.connectionStyles.default,
                strength: 1,
                isVisible: true,
                isSelected: false,
                metadata: {
                  createdAt: new Date().toISOString()
                }
              };
            }
            
            state.isDirty = true;
            updateAnalytics(state);
          });
        },
        
        updateNode: (id: string, updates: Partial<MindmapNode>) => {
          set((state) => {
            if (state.nodes[id]) {
              Object.assign(state.nodes[id], {
                ...updates,
                metadata: {
                  ...state.nodes[id].metadata,
                  updatedAt: new Date().toISOString(),
                  ...updates.metadata
                }
              });
              
              state.isDirty = true;
              updateAnalytics(state);
            }
          });
        },
        
        deleteNode: (id: string) => {
          set((state) => {
            const node = state.nodes[id];
            if (!node) return;
            
            // Remove from parent's children
            if (node.parentId && state.nodes[node.parentId]) {
              state.nodes[node.parentId].children = 
                state.nodes[node.parentId].children.filter(childId => childId !== id);
            }
            
            // Recursively delete children
            node.children.forEach(childId => {
              get().deleteNode(childId);
            });
            
            // Delete associated connections
            Object.values(state.connections).forEach(conn => {
              if (conn.sourceNodeId === id || conn.targetNodeId === id) {
                delete state.connections[conn.id];
              }
            });
            
            // Remove from selection
            state.selection.nodes = state.selection.nodes.filter(nodeId => nodeId !== id);
            
            delete state.nodes[id];
            state.isDirty = true;
            updateAnalytics(state);
          });
        },
        
        selectNode: (id: string, addToSelection = false) => {
          set((state) => {
            if (!state.nodes[id]) return;
            
            if (addToSelection) {
              if (!state.selection.nodes.includes(id)) {
                state.selection.nodes.push(id);
              }
            } else {
              // Clear previous selection
              state.selection.nodes.forEach(nodeId => {
                if (state.nodes[nodeId]) {
                  state.nodes[nodeId].isSelected = false;
                }
              });
              state.selection.nodes = [id];
            }
            
            state.nodes[id].isSelected = true;
            state.selection.lastSelectedId = id;
            state.selection.isMultiSelect = state.selection.nodes.length > 1;
          });
        },
        
        deselectNode: (id: string) => {
          set((state) => {
            if (state.nodes[id]) {
              state.nodes[id].isSelected = false;
            }
            state.selection.nodes = state.selection.nodes.filter(nodeId => nodeId !== id);
            state.selection.isMultiSelect = state.selection.nodes.length > 1;
          });
        },
        
        moveNode: (id: string, x: number, y: number) => {
          set((state) => {
            if (state.nodes[id]) {
              state.nodes[id].x = x;
              state.nodes[id].y = y;
              state.nodes[id].metadata!.updatedAt = new Date().toISOString();
              state.isDirty = true;
            }
          });
        },
        
        startNodeEdit: (id: string) => {
          set((state) => {
            if (state.nodes[id]) {
              // End editing for all other nodes
              Object.values(state.nodes).forEach(node => {
                node.isEditing = false;
              });
              state.nodes[id].isEditing = true;
            }
          });
        },
        
        endNodeEdit: (id: string, text?: string) => {
          set((state) => {
            if (state.nodes[id]) {
              state.nodes[id].isEditing = false;
              if (text !== undefined && text !== state.nodes[id].text) {
                state.nodes[id].text = text;
                state.nodes[id].metadata!.updatedAt = new Date().toISOString();
                state.isDirty = true;
              }
            }
          });
        },
        
        expandNode: (id: string) => {
          set((state) => {
            if (state.nodes[id]) {
              state.nodes[id].isExpanded = true;
              // Show children
              state.nodes[id].children.forEach(childId => {
                if (state.nodes[childId]) {
                  state.nodes[childId].isVisible = true;
                }
              });
            }
          });
        },
        
        collapseNode: (id: string) => {
          set((state) => {
            if (state.nodes[id]) {
              state.nodes[id].isExpanded = false;
              // Hide children recursively
              const hideChildren = (nodeId: string) => {
                const node = state.nodes[nodeId];
                if (node) {
                  node.isVisible = false;
                  node.children.forEach(hideChildren);
                }
              };
              state.nodes[id].children.forEach(hideChildren);
            }
          });
        },
        
        changeNodeType: (id: string, type: MindmapNode['type']) => {
          set((state) => {
            if (state.nodes[id]) {
              state.nodes[id].type = type;
              state.nodes[id].fontSize = state.theme.fonts.sizes[type];
              state.nodes[id].metadata!.updatedAt = new Date().toISOString();
              state.isDirty = true;
              updateAnalytics(state);
            }
          });
        },
        
        addNodeTag: (id: string, tag: string) => {
          set((state) => {
            if (state.nodes[id] && tag.trim()) {
              if (!state.nodes[id].tags) {
                state.nodes[id].tags = [];
              }
              if (!state.nodes[id].tags!.includes(tag)) {
                state.nodes[id].tags!.push(tag);
                state.nodes[id].metadata!.updatedAt = new Date().toISOString();
                state.isDirty = true;
                updateAnalytics(state);
              }
            }
          });
        },
        
        removeNodeTag: (id: string, tag: string) => {
          set((state) => {
            if (state.nodes[id] && state.nodes[id].tags) {
              state.nodes[id].tags = state.nodes[id].tags!.filter(t => t !== tag);
              state.nodes[id].metadata!.updatedAt = new Date().toISOString();
              state.isDirty = true;
              updateAnalytics(state);
            }
          });
        },
        
        attachFileToNode: (id: string, attachment: NodeAttachment) => {
          set((state) => {
            if (state.nodes[id]) {
              if (!state.nodes[id].metadata!.attachments) {
                state.nodes[id].metadata!.attachments = [];
              }
              state.nodes[id].metadata!.attachments!.push(attachment);
              state.nodes[id].metadata!.updatedAt = new Date().toISOString();
              state.isDirty = true;
            }
          });
        },
        
        removeNodeAttachment: (id: string, attachmentId: string) => {
          set((state) => {
            if (state.nodes[id] && state.nodes[id].metadata!.attachments) {
              state.nodes[id].metadata!.attachments = 
                state.nodes[id].metadata!.attachments!.filter(a => a.id !== attachmentId);
              state.nodes[id].metadata!.updatedAt = new Date().toISOString();
              state.isDirty = true;
            }
          });
        },
        
        // Connection Actions
        createConnection: (sourceId: string, targetId: string, type = 'associative') => {
          set((state) => {
            if (!state.nodes[sourceId] || !state.nodes[targetId]) return;
            if (sourceId === targetId) return; // No self-connections
            
            // Check if connection already exists
            const existingConnection = Object.values(state.connections).find(
              conn => (conn.sourceNodeId === sourceId && conn.targetNodeId === targetId) ||
                     (conn.sourceNodeId === targetId && conn.targetNodeId === sourceId)
            );
            
            if (existingConnection) return;
            
            const id = generateConnectionId();
            state.connections[id] = {
              id,
              sourceNodeId: sourceId,
              targetNodeId: targetId,
              type,
              style: state.theme.connectionStyles.default,
              strength: 0.8,
              isVisible: true,
              isSelected: false,
              metadata: {
                createdAt: new Date().toISOString()
              }
            };
            
            state.isDirty = true;
            updateAnalytics(state);
          });
        },
        
        updateConnection: (id: string, updates: Partial<MindmapConnection>) => {
          set((state) => {
            if (state.connections[id]) {
              Object.assign(state.connections[id], {
                ...updates,
                metadata: {
                  ...state.connections[id].metadata,
                  ...updates.metadata
                }
              });
              state.isDirty = true;
            }
          });
        },
        
        deleteConnection: (id: string) => {
          set((state) => {
            delete state.connections[id];
            state.selection.connections = state.selection.connections.filter(connId => connId !== id);
            state.isDirty = true;
            updateAnalytics(state);
          });
        },
        
        selectConnection: (id: string) => {
          set((state) => {
            if (!state.connections[id]) return;
            
            // Clear previous connection selection
            state.selection.connections.forEach(connId => {
              if (state.connections[connId]) {
                state.connections[connId].isSelected = false;
              }
            });
            
            state.selection.connections = [id];
            state.connections[id].isSelected = true;
          });
        },
        
        deselectConnection: (id: string) => {
          set((state) => {
            if (state.connections[id]) {
              state.connections[id].isSelected = false;
            }
            state.selection.connections = state.selection.connections.filter(connId => connId !== id);
          });
        },
        
        // Layout Actions
        updateLayout: (updates: Partial<MindmapLayout>) => {
          set((state) => {
            Object.assign(state.layout, updates);
            state.isDirty = true;
          });
        },
        
        autoArrange: (algorithm = 'force-directed') => {
          set((state) => {
            // This would integrate with a layout algorithm library
            // For now, we'll just update the algorithm setting
            state.layout.algorithm = algorithm;
            state.layout.autoLayout = true;
            state.isDirty = true;
          });
        },
        
        changeLayoutType: (type: MindmapLayout['type']) => {
          set((state) => {
            state.layout.type = type;
            state.layout.autoLayout = true;
            state.isDirty = true;
          });
        },
        
        resetLayout: () => {
          set((state) => {
            state.layout = { ...initialState.layout };
            state.isDirty = true;
          });
        },
        
        // Canvas Actions
        panCanvas: (deltaX: number, deltaY: number) => {
          set((state) => {
            state.canvas.offsetX += deltaX;
            state.canvas.offsetY += deltaY;
          });
        },
        
        zoomCanvas: (scale: number, centerX = state.canvas.width / 2, centerY = state.canvas.height / 2) => {
          set((state) => {
            const newScale = Math.max(state.canvas.minScale, 
                           Math.min(state.canvas.maxScale, scale));
            
            if (newScale !== state.canvas.scale) {
              const scaleDiff = newScale / state.canvas.scale;
              state.canvas.offsetX = centerX - (centerX - state.canvas.offsetX) * scaleDiff;
              state.canvas.offsetY = centerY - (centerY - state.canvas.offsetY) * scaleDiff;
              state.canvas.scale = newScale;
            }
          });
        },
        
        resizeCanvas: (width: number, height: number) => {
          set((state) => {
            state.canvas.width = width;
            state.canvas.height = height;
          });
        },
        
        resetCanvasView: () => {
          set((state) => {
            state.canvas.scale = 1;
            state.canvas.offsetX = 0;
            state.canvas.offsetY = 0;
          });
        },
        
        toggleGrid: () => {
          set((state) => {
            state.canvas.gridEnabled = !state.canvas.gridEnabled;
          });
        },
        
        changeCanvasBackground: (color: string) => {
          set((state) => {
            state.canvas.backgroundColor = color;
            state.isDirty = true;
          });
        },
        
        // Selection Actions
        selectAll: () => {
          set((state) => {
            const nodeIds = Object.keys(state.nodes);
            state.selection.nodes = nodeIds;
            nodeIds.forEach(id => {
              state.nodes[id].isSelected = true;
            });
            state.selection.isMultiSelect = nodeIds.length > 1;
          });
        },
        
        selectNone: () => {
          set((state) => {
            state.selection.nodes.forEach(id => {
              if (state.nodes[id]) {
                state.nodes[id].isSelected = false;
              }
            });
            state.selection.connections.forEach(id => {
              if (state.connections[id]) {
                state.connections[id].isSelected = false;
              }
            });
            state.selection.nodes = [];
            state.selection.connections = [];
            state.selection.isMultiSelect = false;
            state.selection.lastSelectedId = undefined;
          });
        },
        
        selectArea: (x1: number, y1: number, x2: number, y2: number) => {
          set((state) => {
            const minX = Math.min(x1, x2);
            const maxX = Math.max(x1, x2);
            const minY = Math.min(y1, y2);
            const maxY = Math.max(y1, y2);
            
            const selectedNodes: string[] = [];
            Object.values(state.nodes).forEach(node => {
              if (node.x >= minX && node.x <= maxX && 
                  node.y >= minY && node.y <= maxY) {
                selectedNodes.push(node.id);
                node.isSelected = true;
              } else {
                node.isSelected = false;
              }
            });
            
            state.selection.nodes = selectedNodes;
            state.selection.isMultiSelect = selectedNodes.length > 1;
            state.selection.bbox = { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
          });
        },
        
        selectConnected: (nodeId: string) => {
          set((state) => {
            const connectedNodes = new Set([nodeId]);
            
            // Find all connected nodes
            Object.values(state.connections).forEach(conn => {
              if (conn.sourceNodeId === nodeId) {
                connectedNodes.add(conn.targetNodeId);
              } else if (conn.targetNodeId === nodeId) {
                connectedNodes.add(conn.sourceNodeId);
              }
            });
            
            // Update selection
            Object.values(state.nodes).forEach(node => {
              node.isSelected = connectedNodes.has(node.id);
            });
            
            state.selection.nodes = Array.from(connectedNodes);
            state.selection.isMultiSelect = connectedNodes.size > 1;
          });
        },
        
        selectSiblings: (nodeId: string) => {
          set((state) => {
            const node = state.nodes[nodeId];
            if (!node || !node.parentId) return;
            
            const siblings = state.nodes[node.parentId].children;
            
            // Update selection
            Object.values(state.nodes).forEach(node => {
              node.isSelected = siblings.includes(node.id);
            });
            
            state.selection.nodes = siblings;
            state.selection.isMultiSelect = siblings.length > 1;
          });
        },
        
        // Clipboard Actions
        copy: () => {
          set((state) => {
            const selectedNodes = state.selection.nodes.map(id => state.nodes[id]).filter(Boolean);
            const selectedConnections = Object.values(state.connections).filter(
              conn => state.selection.nodes.includes(conn.sourceNodeId) && 
                     state.selection.nodes.includes(conn.targetNodeId)
            );
            
            state.clipboard = {
              nodes: selectedNodes,
              connections: selectedConnections,
              type: 'copy',
              timestamp: new Date().toISOString()
            };
          });
        },
        
        cut: () => {
          set((state) => {
            get().copy();
            state.clipboard.type = 'cut';
            
            // Delete selected nodes and connections
            state.selection.nodes.forEach(id => {
              get().deleteNode(id);
            });
          });
        },
        
        paste: (x = state.canvas.width / 2, y = state.canvas.height / 2) => {
          set((state) => {
            if (state.clipboard.nodes.length === 0) return;
            
            const idMap = new Map<string, string>();
            const offset = 50;
            
            // Paste nodes
            state.clipboard.nodes.forEach(node => {
              const newId = generateNodeId();
              idMap.set(node.id, newId);
              
              const newNode: MindmapNode = {
                ...node,
                id: newId,
                x: x + offset,
                y: y + offset,
                isSelected: false,
                children: [], // Will be updated when pasting connections
                metadata: {
                  ...node.metadata,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString()
                }
              };
              
              state.nodes[newId] = newNode;
            });
            
            // Paste connections
            state.clipboard.connections.forEach(conn => {
              const sourceId = idMap.get(conn.sourceNodeId);
              const targetId = idMap.get(conn.targetNodeId);
              
              if (sourceId && targetId) {
                const newId = generateConnectionId();
                state.connections[newId] = {
                  ...conn,
                  id: newId,
                  sourceNodeId: sourceId,
                  targetNodeId: targetId,
                  isSelected: false,
                  metadata: {
                    ...conn.metadata,
                    createdAt: new Date().toISOString()
                  }
                };
                
                // Update children relationships
                state.nodes[sourceId].children.push(targetId);
              }
            });
            
            // Clear clipboard if it was a cut operation
            if (state.clipboard.type === 'cut') {
              state.clipboard.nodes = [];
              state.clipboard.connections = [];
            }
            
            state.isDirty = true;
            updateAnalytics(state);
          });
        },
        
        duplicate: () => {
          set(() => {
            get().copy();
            get().paste();
          });
        },
        
        // History Actions - Simplified implementation
        undo: () => {
          // Implementation would require more sophisticated state tracking
          console.log('Undo not yet implemented');
        },
        
        redo: () => {
          // Implementation would require more sophisticated state tracking
          console.log('Redo not yet implemented');
        },
        
        clearHistory: () => {
          set((state) => {
            state.history = { ...initialState.history };
          });
        },
        
        // Theme Actions
        applyTheme: (theme: MindmapTheme) => {
          set((state) => {
            state.theme = theme;
            state.isDirty = true;
          });
        },
        
        updateTheme: (updates: Partial<MindmapTheme>) => {
          set((state) => {
            Object.assign(state.theme, updates);
            state.isDirty = true;
          });
        },
        
        resetTheme: () => {
          set((state) => {
            state.theme = { ...defaultTheme };
            state.isDirty = true;
          });
        },
        
        // Search Actions - Simplified implementation
        startSearch: (query: string) => {
          set((state) => {
            state.search.query = query;
            state.search.isActive = true;
            // Implementation would include actual search logic
          });
        },
        
        updateSearch: (query: string, filters?: Partial<SearchFilters>) => {
          set((state) => {
            state.search.query = query;
            if (filters) {
              Object.assign(state.search.filters, filters);
            }
            // Implementation would include actual search logic
          });
        },
        
        clearSearch: () => {
          set((state) => {
            state.search = { ...initialState.search };
          });
        },
        
        searchNext: () => {
          set((state) => {
            if (state.search.results.length > 0) {
              state.search.currentIndex = 
                (state.search.currentIndex + 1) % state.search.results.length;
            }
          });
        },
        
        searchPrevious: () => {
          set((state) => {
            if (state.search.results.length > 0) {
              state.search.currentIndex = 
                (state.search.currentIndex - 1 + state.search.results.length) % state.search.results.length;
            }
          });
        },
        
        // Collaboration Actions - Simplified implementation
        joinCollaboration: (sessionId: string, user: Collaborator) => {
          set((state) => {
            state.collaboration.isEnabled = true;
            state.collaboration.sessionId = sessionId;
            if (!state.collaboration.collaborators.find(c => c.id === user.id)) {
              state.collaboration.collaborators.push(user);
            }
          });
        },
        
        leaveCollaboration: () => {
          set((state) => {
            state.collaboration = { ...initialState.collaboration };
          });
        },
        
        updateCursor: (x: number, y: number) => {
          // Implementation would update cursor position for current user
          console.log('Cursor update:', x, y);
        },
        
        applyCollaborationChange: (change: CollaborationChange) => {
          // Implementation would apply remote changes
          console.log('Applying collaboration change:', change);
        },
        
        syncCollaboration: () => {
          // Implementation would sync with collaboration server
          console.log('Syncing collaboration');
        },
        
        // Data Actions
        loadMindmap: (data: Partial<MindmapStoreState>) => {
          set((state) => {
            // Merge loaded data with current state
            Object.assign(state, data);
            state.isDirty = false;
            state.lastSaved = new Date().toISOString();
            updateAnalytics(state);
          });
        },
        
        saveMindmap: async () => {
          const state = get();
          try {
            // Implementation would call save API
            console.log('Saving mindmap:', state.name);
            
            set((draft) => {
              draft.isDirty = false;
              draft.lastSaved = new Date().toISOString();
            });
            
          } catch (error) {
            set((draft) => {
              draft.ui.error = 'Failed to save mindmap';
            });
            throw error;
          }
        },
        
        importMindmap: (data: unknown, format: string) => {
          // Implementation would parse and import data based on format
          console.log('Importing mindmap:', format, data);
        },
        
        exportMindmap: (format: MindmapExport['format'], options?: ExportOptions) => {
          set((state) => {
            state.export.format = format;
            state.export.options = options || {};
            state.export.status = 'processing';
            state.export.progress = 0;
          });
          
          // Implementation would handle export process
          console.log('Exporting mindmap:', format, options);
        },
        
        newMindmap: () => {
          set(() => ({
            ...initialState,
            id: uuidv4(),
            name: `New Mindmap ${new Date().toLocaleDateString()}`
          }));
        },
        
        clearMindmap: () => {
          set(() => ({ ...initialState }));
        }
      })),
      {
        name: 'mindmap-store',
        partialize: (state) => ({
          // Only persist essential data, not UI state
          id: state.id,
          name: state.name,
          description: state.description,
          nodes: state.nodes,
          connections: state.connections,
          layout: state.layout,
          theme: state.theme,
          settings: state.settings
        })
      }
    )
  )
);

export type MindmapStore = typeof useMindmapStore;