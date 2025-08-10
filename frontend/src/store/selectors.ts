import { useMindmapStore } from './mindmapStore';
import type { MindmapNode } from '../types/store';

/**
 * Zustand selectors for optimal re-rendering performance
 */

// Node selectors with fine-grained subscriptions
export const useNode = (id: string) => 
  useMindmapStore(state => state.nodes[id]);

export const useNodeText = (id: string) => 
  useMindmapStore(state => state.nodes[id]?.text);

export const useNodePosition = (id: string) => 
  useMindmapStore(state => {
    const node = state.nodes[id];
    return node ? { x: node.x, y: node.y } : undefined;
  });

export const useNodeSelection = (id: string) => 
  useMindmapStore(state => state.nodes[id]?.isSelected || false);

export const useNodeVisibility = (id: string) => 
  useMindmapStore(state => state.nodes[id]?.isVisible || false);

export const useNodeChildren = (id: string) => 
  useMindmapStore(state => {
    const node = state.nodes[id];
    return node ? node.children.map(childId => state.nodes[childId]).filter(Boolean) : [];
  });

export const useNodeParent = (id: string) => 
  useMindmapStore(state => {
    const node = state.nodes[id];
    return node?.parentId ? state.nodes[node.parentId] : undefined;
  });

// Collection selectors
export const useAllNodes = () => 
  useMindmapStore(state => Object.values(state.nodes));

export const useVisibleNodes = () => 
  useMindmapStore(state => Object.values(state.nodes).filter(node => node.isVisible));

export const useSelectedNodes = () => 
  useMindmapStore(state => 
    state.selection.nodes.map(id => state.nodes[id]).filter(Boolean)
  );

export const useNodesByType = (type: MindmapNode['type']) => 
  useMindmapStore(state => 
    Object.values(state.nodes).filter(node => node.type === type)
  );

export const useNodesByLevel = (level: number) => 
  useMindmapStore(state => 
    Object.values(state.nodes).filter(node => node.level === level)
  );

export const useRootNodes = () => 
  useMindmapStore(state => 
    Object.values(state.nodes).filter(node => !node.parentId)
  );

// Connection selectors
export const useConnection = (id: string) => 
  useMindmapStore(state => state.connections[id]);

export const useAllConnections = () => 
  useMindmapStore(state => Object.values(state.connections));

export const useNodeConnections = (nodeId: string) => 
  useMindmapStore(state => 
    Object.values(state.connections).filter(
      conn => conn.sourceNodeId === nodeId || conn.targetNodeId === nodeId
    )
  );

export const useConnectedNodes = (nodeId: string) => 
  useMindmapStore(state => {
    const connections = Object.values(state.connections).filter(
      conn => conn.sourceNodeId === nodeId || conn.targetNodeId === nodeId
    );
    return connections.map(conn => {
      const connectedId = conn.sourceNodeId === nodeId ? conn.targetNodeId : conn.sourceNodeId;
      return state.nodes[connectedId];
    }).filter(Boolean);
  });

// Selection selectors
export const useSelection = () => 
  useMindmapStore(state => state.selection);

export const useSelectedNodeIds = () => 
  useMindmapStore(state => state.selection.nodes);

export const useSelectedConnectionIds = () => 
  useMindmapStore(state => state.selection.connections);

export const useIsMultiSelect = () => 
  useMindmapStore(state => state.selection.isMultiSelect);

export const useSelectionCount = () => 
  useMindmapStore(state => 
    state.selection.nodes.length + state.selection.connections.length
  );

export const useHasSelection = () => 
  useMindmapStore(state => 
    state.selection.nodes.length > 0 || state.selection.connections.length > 0
  );

// Canvas selectors
export const useCanvasState = () => 
  useMindmapStore(state => state.canvas);

export const useCanvasScale = () => 
  useMindmapStore(state => state.canvas.scale);

export const useCanvasOffset = () => 
  useMindmapStore(state => ({ x: state.canvas.offsetX, y: state.canvas.offsetY }));

export const useCanvasSize = () => 
  useMindmapStore(state => ({ width: state.canvas.width, height: state.canvas.height }));

export const useIsGridVisible = () => 
  useMindmapStore(state => state.canvas.gridEnabled);

// Layout selectors
export const useLayoutState = () => 
  useMindmapStore(state => state.layout);

export const useLayoutType = () => 
  useMindmapStore(state => state.layout.type);

export const useLayoutCenter = () => 
  useMindmapStore(state => ({ x: state.layout.centerX, y: state.layout.centerY }));

// Theme selectors
export const useTheme = () => 
  useMindmapStore(state => state.theme);

export const useThemeColors = () => 
  useMindmapStore(state => state.theme.colors);

export const useThemeFonts = () => 
  useMindmapStore(state => state.theme.fonts);

// Search selectors
export const useSearchState = () => 
  useMindmapStore(state => state.search);

export const useSearchQuery = () => 
  useMindmapStore(state => state.search.query);

export const useSearchResults = () => 
  useMindmapStore(state => state.search.results);

export const useCurrentSearchResult = () => 
  useMindmapStore(state => {
    const { results, currentIndex } = state.search;
    return currentIndex >= 0 && currentIndex < results.length ? results[currentIndex] : undefined;
  });

export const useIsSearchActive = () => 
  useMindmapStore(state => state.search.isActive);

// History selectors
export const useHistoryState = () => 
  useMindmapStore(state => state.history);

export const useCanUndo = () => 
  useMindmapStore(state => state.history.past.length > 0);

export const useCanRedo = () => 
  useMindmapStore(state => state.history.future.length > 0);

export const useHistorySize = () => 
  useMindmapStore(state => 
    state.history.past.length + state.history.future.length + 1
  );

// UI state selectors
export const useUIState = () => 
  useMindmapStore(state => state.ui);

export const useIsLoading = () => 
  useMindmapStore(state => state.ui.isLoading);

export const useError = () => 
  useMindmapStore(state => state.ui.error);

export const useMode = () => 
  useMindmapStore(state => state.ui.mode);

export const useIsSidebarOpen = () => 
  useMindmapStore(state => state.ui.sidebarOpen);

export const useIsToolbarVisible = () => 
  useMindmapStore(state => state.ui.toolbarVisible);

// Analytics selectors
export const useAnalytics = () => 
  useMindmapStore(state => state.analytics);

export const useNodeCount = () => 
  useMindmapStore(state => Object.keys(state.nodes).length);

export const useConnectionCount = () => 
  useMindmapStore(state => Object.keys(state.connections).length);

export const useMaxDepth = () => 
  useMindmapStore(state => 
    Math.max(...Object.values(state.nodes).map(n => n.level), 0)
  );

export const usePerformanceMetrics = () => 
  useMindmapStore(state => state.analytics.performance);

// Collaboration selectors
export const useCollaborationState = () => 
  useMindmapStore(state => state.collaboration);

export const useIsCollaborationEnabled = () => 
  useMindmapStore(state => state.collaboration.isEnabled);

export const useCollaborators = () => 
  useMindmapStore(state => state.collaboration.collaborators);

export const useCollaboratorCount = () => 
  useMindmapStore(state => state.collaboration.collaborators.length);

// Settings selectors
export const useSettings = () => 
  useMindmapStore(state => state.settings);

export const useAutoSaveEnabled = () => 
  useMindmapStore(state => state.settings.autoSave);

export const useAutoSaveInterval = () => 
  useMindmapStore(state => state.settings.autoSaveInterval);

// Data state selectors
export const useIsDirty = () => 
  useMindmapStore(state => state.isDirty);

export const useLastSaved = () => 
  useMindmapStore(state => state.lastSaved);

export const useMindmapId = () => 
  useMindmapStore(state => state.id);

export const useMindmapName = () => 
  useMindmapStore(state => state.name);

export const useMindmapDescription = () => 
  useMindmapStore(state => state.description);

// Computed selectors
export const useBoundingBox = () => 
  useMindmapStore(state => {
    const nodes = Object.values(state.nodes);
    if (nodes.length === 0) return { x: 0, y: 0, width: 0, height: 0 };
    
    const minX = Math.min(...nodes.map(n => n.x - (n.width || 60)));
    const maxX = Math.max(...nodes.map(n => n.x + (n.width || 60)));
    const minY = Math.min(...nodes.map(n => n.y - (n.height || 30)));
    const maxY = Math.max(...nodes.map(n => n.y + (n.height || 30)));
    
    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    };
  });

export const useNodeStats = () => 
  useMindmapStore(state => {
    const nodes = Object.values(state.nodes);
    const nodesByType = nodes.reduce((acc, node) => {
      acc[node.type] = (acc[node.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const nodesByLevel = nodes.reduce((acc, node) => {
      acc[node.level] = (acc[node.level] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);
    
    return {
      total: nodes.length,
      byType: nodesByType,
      byLevel: nodesByLevel,
      maxLevel: Math.max(...nodes.map(n => n.level), 0),
      rootCount: nodes.filter(n => !n.parentId).length
    };
  });

export const useConnectionStats = () => 
  useMindmapStore(state => {
    const connections = Object.values(state.connections);
    const connectionsByType = connections.reduce((acc, conn) => {
      acc[conn.type] = (acc[conn.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      total: connections.length,
      byType: connectionsByType
    };
  });

// Performance optimized selectors for large datasets
export const useNodePage = (page: number, pageSize: number = 50) => 
  useMindmapStore(state => {
    const nodes = Object.values(state.nodes);
    const startIndex = page * pageSize;
    const endIndex = startIndex + pageSize;
    return nodes.slice(startIndex, endIndex);
  });

export const useVisibleNodesInViewport = (viewport: {
  x: number;
  y: number;
  width: number;
  height: number;
}) => 
  useMindmapStore(state => {
    const { x, y, width, height } = viewport;
    return Object.values(state.nodes).filter(node => {
      if (!node.isVisible) return false;
      
      const nodeWidth = node.width || 120;
      const nodeHeight = node.height || 60;
      
      return !(
        node.x + nodeWidth < x ||
        node.x > x + width ||
        node.y + nodeHeight < y ||
        node.y > y + height
      );
    });
  });

// Memoized complex selectors
export const useNodeHierarchy = () => 
  useMindmapStore(state => {
    const nodes = Object.values(state.nodes);
    const hierarchy: Record<string, MindmapNode[]> = {};
    
    // Group by level
    nodes.forEach(node => {
      if (!hierarchy[node.level]) {
        hierarchy[node.level] = [];
      }
      hierarchy[node.level].push(node);
    });
    
    return hierarchy;
  });

export const useNodeDependencies = (nodeId: string) => 
  useMindmapStore(state => {
    const dependencies = new Set<string>();
    const visited = new Set<string>();
    
    const findDependencies = (id: string) => {
      if (visited.has(id)) return;
      visited.add(id);
      
      const connections = Object.values(state.connections).filter(
        conn => conn.targetNodeId === id && conn.type === 'dependency'
      );
      
      connections.forEach(conn => {
        dependencies.add(conn.sourceNodeId);
        findDependencies(conn.sourceNodeId);
      });
    };
    
    findDependencies(nodeId);
    return Array.from(dependencies).map(id => state.nodes[id]).filter(Boolean);
  });

export const useNodeDependents = (nodeId: string) => 
  useMindmapStore(state => {
    const dependents = new Set<string>();
    const visited = new Set<string>();
    
    const findDependents = (id: string) => {
      if (visited.has(id)) return;
      visited.add(id);
      
      const connections = Object.values(state.connections).filter(
        conn => conn.sourceNodeId === id && conn.type === 'dependency'
      );
      
      connections.forEach(conn => {
        dependents.add(conn.targetNodeId);
        findDependents(conn.targetNodeId);
      });
    };
    
    findDependents(nodeId);
    return Array.from(dependents).map(id => state.nodes[id]).filter(Boolean);
  });