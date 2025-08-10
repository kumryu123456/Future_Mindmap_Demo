import { useCallback, useMemo } from 'react';
import { useMindmapStore } from '../store/mindmapStore';
import type {
  MindmapNode,
  MindmapStoreSelectors
} from '../types/store';

/**
 * Custom hook for accessing mindmap store with selectors
 */
export const useMindmap = () => {
  // Store state
  const store = useMindmapStore();
  
  // Selectors
  const selectors: MindmapStoreSelectors = useMemo(() => ({
    // Node Selectors
    getNode: (id: string) => store.nodes[id],
    getNodes: () => Object.values(store.nodes),
    getSelectedNodes: () => store.selection.nodes.map(id => store.nodes[id]).filter(Boolean),
    getVisibleNodes: () => Object.values(store.nodes).filter(node => node.isVisible),
    getNodesByType: (type: MindmapNode['type']) => 
      Object.values(store.nodes).filter(node => node.type === type),
    getNodesByLevel: (level: number) => 
      Object.values(store.nodes).filter(node => node.level === level),
    getNodeChildren: (id: string) => {
      const node = store.nodes[id];
      return node ? node.children.map(childId => store.nodes[childId]).filter(Boolean) : [];
    },
    getNodeParent: (id: string) => {
      const node = store.nodes[id];
      return node?.parentId ? store.nodes[node.parentId] : undefined;
    },
    getNodeSiblings: (id: string) => {
      const node = store.nodes[id];
      if (!node?.parentId) return [];
      const parent = store.nodes[node.parentId];
      return parent ? parent.children.map(childId => store.nodes[childId]).filter(Boolean) : [];
    },
    getNodePath: (id: string) => {
      const path: MindmapNode[] = [];
      let currentId: string | undefined = id;
      
      while (currentId && store.nodes[currentId]) {
        path.unshift(store.nodes[currentId]);
        currentId = store.nodes[currentId].parentId;
      }
      
      return path;
    },
    getRootNodes: () => Object.values(store.nodes).filter(node => !node.parentId),
    
    // Connection Selectors
    getConnection: (id: string) => store.connections[id],
    getConnections: () => Object.values(store.connections),
    getNodeConnections: (nodeId: string) => 
      Object.values(store.connections).filter(
        conn => conn.sourceNodeId === nodeId || conn.targetNodeId === nodeId
      ),
    getConnectedNodes: (nodeId: string) => {
      const connections = Object.values(store.connections).filter(
        conn => conn.sourceNodeId === nodeId || conn.targetNodeId === nodeId
      );
      return connections.map(conn => {
        const connectedId = conn.sourceNodeId === nodeId ? conn.targetNodeId : conn.sourceNodeId;
        return store.nodes[connectedId];
      }).filter(Boolean);
    },
    
    // Search Selectors
    getSearchResults: () => store.search.results,
    getCurrentSearchResult: () => {
      const { results, currentIndex } = store.search;
      return currentIndex >= 0 && currentIndex < results.length ? results[currentIndex] : undefined;
    },
    
    // Analytics Selectors
    getAnalytics: () => store.analytics,
    getNodeCount: () => Object.keys(store.nodes).length,
    getConnectionCount: () => Object.keys(store.connections).length,
    getMaxDepth: () => Math.max(...Object.values(store.nodes).map(n => n.level), 0),
    
    // UI State Selectors
    isLoading: () => store.ui.isLoading,
    getError: () => store.ui.error,
    getMode: () => store.ui.mode,
    isCanvasGridVisible: () => store.canvas.gridEnabled,
    
    // History Selectors
    canUndo: () => store.history.past.length > 0,
    canRedo: () => store.history.future.length > 0,
    getHistorySize: () => store.history.past.length + store.history.future.length + 1
  }), [store]);
  
  return {
    // State
    state: store,
    
    // Actions (already available in store)
    actions: {
      // Node actions
      createNode: store.createNode,
      updateNode: store.updateNode,
      deleteNode: store.deleteNode,
      selectNode: store.selectNode,
      deselectNode: store.deselectNode,
      moveNode: store.moveNode,
      startNodeEdit: store.startNodeEdit,
      endNodeEdit: store.endNodeEdit,
      expandNode: store.expandNode,
      collapseNode: store.collapseNode,
      changeNodeType: store.changeNodeType,
      addNodeTag: store.addNodeTag,
      removeNodeTag: store.removeNodeTag,
      attachFileToNode: store.attachFileToNode,
      removeNodeAttachment: store.removeNodeAttachment,
      
      // Connection actions
      createConnection: store.createConnection,
      updateConnection: store.updateConnection,
      deleteConnection: store.deleteConnection,
      selectConnection: store.selectConnection,
      deselectConnection: store.deselectConnection,
      
      // Layout actions
      updateLayout: store.updateLayout,
      autoArrange: store.autoArrange,
      changeLayoutType: store.changeLayoutType,
      resetLayout: store.resetLayout,
      
      // Canvas actions
      panCanvas: store.panCanvas,
      zoomCanvas: store.zoomCanvas,
      resizeCanvas: store.resizeCanvas,
      resetCanvasView: store.resetCanvasView,
      toggleGrid: store.toggleGrid,
      changeCanvasBackground: store.changeCanvasBackground,
      
      // Selection actions
      selectAll: store.selectAll,
      selectNone: store.selectNone,
      selectArea: store.selectArea,
      selectConnected: store.selectConnected,
      selectSiblings: store.selectSiblings,
      
      // Clipboard actions
      copy: store.copy,
      cut: store.cut,
      paste: store.paste,
      duplicate: store.duplicate,
      
      // History actions
      undo: store.undo,
      redo: store.redo,
      clearHistory: store.clearHistory,
      
      // Theme actions
      applyTheme: store.applyTheme,
      updateTheme: store.updateTheme,
      resetTheme: store.resetTheme,
      
      // Search actions
      startSearch: store.startSearch,
      updateSearch: store.updateSearch,
      clearSearch: store.clearSearch,
      searchNext: store.searchNext,
      searchPrevious: store.searchPrevious,
      
      // Collaboration actions
      joinCollaboration: store.joinCollaboration,
      leaveCollaboration: store.leaveCollaboration,
      updateCursor: store.updateCursor,
      applyCollaborationChange: store.applyCollaborationChange,
      syncCollaboration: store.syncCollaboration,
      
      // Data actions
      loadMindmap: store.loadMindmap,
      saveMindmap: store.saveMindmap,
      importMindmap: store.importMindmap,
      exportMindmap: store.exportMindmap,
      newMindmap: store.newMindmap,
      clearMindmap: store.clearMindmap
    },
    
    // Selectors
    selectors
  };
};

/**
 * Hook for node-specific operations
 */
export const useNode = (nodeId?: string) => {
  const { actions, selectors } = useMindmap();
  
  const node = useMemo(() => 
    nodeId ? selectors.getNode(nodeId) : undefined, 
    [nodeId, selectors]
  );
  
  const nodeActions = useMemo(() => ({
    update: (updates: Partial<MindmapNode>) => 
      nodeId && actions.updateNode(nodeId, updates),
    delete: () => 
      nodeId && actions.deleteNode(nodeId),
    select: (addToSelection = false) => 
      nodeId && actions.selectNode(nodeId, addToSelection),
    deselect: () => 
      nodeId && actions.deselectNode(nodeId),
    move: (x: number, y: number) => 
      nodeId && actions.moveNode(nodeId, x, y),
    startEdit: () => 
      nodeId && actions.startNodeEdit(nodeId),
    endEdit: (text?: string) => 
      nodeId && actions.endNodeEdit(nodeId, text),
    expand: () => 
      nodeId && actions.expandNode(nodeId),
    collapse: () => 
      nodeId && actions.collapseNode(nodeId),
    changeType: (type: MindmapNode['type']) => 
      nodeId && actions.changeNodeType(nodeId, type),
    addTag: (tag: string) => 
      nodeId && actions.addNodeTag(nodeId, tag),
    removeTag: (tag: string) => 
      nodeId && actions.removeNodeTag(nodeId, tag)
  }), [nodeId, actions]);
  
  const nodeSelectors = useMemo(() => ({
    getChildren: () => nodeId ? selectors.getNodeChildren(nodeId) : [],
    getParent: () => nodeId ? selectors.getNodeParent(nodeId) : undefined,
    getSiblings: () => nodeId ? selectors.getNodeSiblings(nodeId) : [],
    getPath: () => nodeId ? selectors.getNodePath(nodeId) : [],
    getConnections: () => nodeId ? selectors.getNodeConnections(nodeId) : [],
    getConnectedNodes: () => nodeId ? selectors.getConnectedNodes(nodeId) : []
  }), [nodeId, selectors]);
  
  return {
    node,
    actions: nodeActions,
    selectors: nodeSelectors,
    isSelected: node?.isSelected || false,
    isEditing: node?.isEditing || false,
    isExpanded: node?.isExpanded || true,
    isVisible: node?.isVisible || true
  };
};

/**
 * Hook for selection operations
 */
export const useSelection = () => {
  const { state, actions, selectors } = useMindmap();
  
  const selectedNodes = useMemo(() => 
    selectors.getSelectedNodes(), 
    [selectors, state.selection.nodes]
  );
  
  const selectionActions = useMemo(() => ({
    selectAll: actions.selectAll,
    selectNone: actions.selectNone,
    selectArea: actions.selectArea,
    selectConnected: (nodeId: string) => actions.selectConnected(nodeId),
    selectSiblings: (nodeId: string) => actions.selectSiblings(nodeId),
    deleteSelected: () => {
      state.selection.nodes.forEach(nodeId => actions.deleteNode(nodeId));
    },
    moveSelected: (deltaX: number, deltaY: number) => {
      state.selection.nodes.forEach(nodeId => {
        const node = state.nodes[nodeId];
        if (node) {
          actions.moveNode(nodeId, node.x + deltaX, node.y + deltaY);
        }
      });
    }
  }), [actions, state]);
  
  return {
    selectedNodes,
    selectionCount: selectedNodes.length,
    hasSelection: selectedNodes.length > 0,
    isMultiSelect: state.selection.isMultiSelect,
    lastSelectedId: state.selection.lastSelectedId,
    boundingBox: state.selection.bbox,
    actions: selectionActions
  };
};

/**
 * Hook for canvas operations
 */
export const useCanvas = () => {
  const { state, actions } = useMindmap();
  
  const canvasActions = useMemo(() => ({
    pan: actions.panCanvas,
    zoom: actions.zoomCanvas,
    resize: actions.resizeCanvas,
    resetView: actions.resetCanvasView,
    toggleGrid: actions.toggleGrid,
    changeBackground: actions.changeCanvasBackground,
    
    // Convenience methods
    zoomIn: (factor = 1.2) => {
      actions.zoomCanvas(state.canvas.scale * factor);
    },
    zoomOut: (factor = 0.8) => {
      actions.zoomCanvas(state.canvas.scale * factor);
    },
    fitToScreen: () => {
      // Implementation would calculate optimal zoom and position
      actions.resetCanvasView();
    },
    centerOnNode: (nodeId: string) => {
      const node = state.nodes[nodeId];
      if (node) {
        const centerX = state.canvas.width / 2;
        const centerY = state.canvas.height / 2;
        actions.panCanvas(centerX - node.x, centerY - node.y);
      }
    }
  }), [actions, state]);
  
  return {
    canvas: state.canvas,
    actions: canvasActions,
    isGridVisible: state.canvas.gridEnabled,
    scale: state.canvas.scale,
    canZoomIn: state.canvas.scale < state.canvas.maxScale,
    canZoomOut: state.canvas.scale > state.canvas.minScale
  };
};

/**
 * Hook for search operations
 */
export const useSearch = () => {
  const { state, actions, selectors } = useMindmap();
  
  const searchActions = useMemo(() => ({
    start: actions.startSearch,
    update: actions.updateSearch,
    clear: actions.clearSearch,
    next: actions.searchNext,
    previous: actions.searchPrevious,
    
    // Navigate to search result
    goToResult: (index: number) => {
      const result = state.search.results[index];
      if (result) {
        actions.selectNode(result.nodeId);
        // Could also center canvas on node
      }
    }
  }), [actions, state]);
  
  return {
    search: state.search,
    results: selectors.getSearchResults(),
    currentResult: selectors.getCurrentSearchResult(),
    actions: searchActions,
    isActive: state.search.isActive,
    hasResults: state.search.results.length > 0,
    resultCount: state.search.results.length,
    currentIndex: state.search.currentIndex
  };
};

/**
 * Hook for theme operations
 */
export const useTheme = () => {
  const { state, actions } = useMindmap();
  
  const themeActions = useMemo(() => ({
    apply: actions.applyTheme,
    update: actions.updateTheme,
    reset: actions.resetTheme,
    
    // Convenience methods
    setColorScheme: (colors: Partial<typeof state.theme.colors>) => {
      actions.updateTheme({
        colors: { ...state.theme.colors, ...colors }
      });
    },
    setFontSizes: (sizes: Partial<typeof state.theme.fonts.sizes>) => {
      actions.updateTheme({
        fonts: {
          ...state.theme.fonts,
          sizes: { ...state.theme.fonts.sizes, ...sizes }
        }
      });
    }
  }), [actions, state.theme]);
  
  return {
    theme: state.theme,
    actions: themeActions
  };
};

/**
 * Hook for collaboration features
 */
export const useCollaboration = () => {
  const { state, actions } = useMindmap();
  
  const collaborationActions = useMemo(() => ({
    join: actions.joinCollaboration,
    leave: actions.leaveCollaboration,
    updateCursor: actions.updateCursor,
    applyChange: actions.applyCollaborationChange,
    sync: actions.syncCollaboration
  }), [actions]);
  
  return {
    collaboration: state.collaboration,
    actions: collaborationActions,
    isEnabled: state.collaboration.isEnabled,
    sessionId: state.collaboration.sessionId,
    collaborators: state.collaboration.collaborators,
    collaboratorCount: state.collaboration.collaborators.length
  };
};

/**
 * Hook for history operations (undo/redo)
 */
export const useHistory = () => {
  const { state, actions, selectors } = useMindmap();
  
  const historyActions = useMemo(() => ({
    undo: actions.undo,
    redo: actions.redo,
    clear: actions.clearHistory
  }), [actions]);
  
  return {
    history: state.history,
    actions: historyActions,
    canUndo: selectors.canUndo(),
    canRedo: selectors.canRedo(),
    historySize: selectors.getHistorySize()
  };
};

/**
 * Hook for keyboard shortcuts
 */
export const useKeyboardShortcuts = () => {
  const { state, actions } = useMindmap();
  
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const { ctrlKey, metaKey, key } = event;
    const isModifierPressed = ctrlKey || metaKey;
    
    if (!isModifierPressed) return;
    
    switch (key.toLowerCase()) {
      case 'z':
        event.preventDefault();
        if (event.shiftKey) {
          actions.redo();
        } else {
          actions.undo();
        }
        break;
      case 'y':
        event.preventDefault();
        actions.redo();
        break;
      case 'c':
        if (state.selection.nodes.length > 0) {
          event.preventDefault();
          actions.copy();
        }
        break;
      case 'v':
        event.preventDefault();
        actions.paste();
        break;
      case 'x':
        if (state.selection.nodes.length > 0) {
          event.preventDefault();
          actions.cut();
        }
        break;
      case 'a':
        event.preventDefault();
        actions.selectAll();
        break;
      case 's':
        event.preventDefault();
        actions.saveMindmap();
        break;
      case 'd':
        if (state.selection.nodes.length > 0) {
          event.preventDefault();
          actions.duplicate();
        }
        break;
    }
  }, [actions, state.selection.nodes]);
  
  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    switch (event.key) {
      case 'Delete':
      case 'Backspace':
        if (state.selection.nodes.length > 0) {
          event.preventDefault();
          state.selection.nodes.forEach(nodeId => actions.deleteNode(nodeId));
        }
        break;
      case 'Escape':
        event.preventDefault();
        actions.selectNone();
        break;
    }
  }, [actions, state.selection.nodes]);
  
  return {
    handleKeyDown,
    handleKeyPress,
    shortcuts: state.ui.shortcuts
  };
};

/**
 * Hook for performance monitoring
 */
export const usePerformance = () => {
  const { state } = useMindmap();
  
  const performance = useMemo(() => ({
    metrics: state.analytics.performance,
    nodeCount: Object.keys(state.nodes).length,
    connectionCount: Object.keys(state.connections).length,
    memoryUsage: state.analytics.performance.memoryUsage,
    
    // Performance recommendations
    recommendations: (() => {
      const recommendations: string[] = [];
      const nodeCount = Object.keys(state.nodes).length;
      const connectionCount = Object.keys(state.connections).length;
      
      if (nodeCount > 1000) {
        recommendations.push('Consider using virtualization for better performance with large node counts');
      }
      if (connectionCount > 2000) {
        recommendations.push('Large number of connections may impact rendering performance');
      }
      if (state.canvas.scale < 0.3) {
        recommendations.push('Very small zoom levels may cause performance issues');
      }
      if (!state.settings.highPerformanceMode && (nodeCount > 500 || connectionCount > 1000)) {
        recommendations.push('Enable high performance mode for better performance');
      }
      
      return recommendations;
    })()
  }), [state]);
  
  return performance;
};