// Export stores
export { useMindmapStore } from './mindmapStore';
export type { MindmapStore } from './mindmapStore';
export { useSessionStore } from './sessionStore';
export type { SessionStore } from '../types/session';
export { useUIStore } from './uiStore';
export type { UIStore } from '../types/ui';

// Export selectors with specific names to avoid conflicts
export {
  useNode as useStoreNode,
  useNodeText,
  useNodePosition,
  useNodeSelection,
  useNodeVisibility,
  useNodeChildren,
  useNodeParent,
  useAllNodes,
  useVisibleNodes,
  useSelectedNodes,
  useNodesByType,
  useNodesByLevel,
  useRootNodes,
  useConnection,
  useAllConnections,
  useNodeConnections,
  useConnectedNodes,
  useSelection as useStoreSelection,
  useSelectedNodeIds,
  useSelectedConnectionIds,
  useIsMultiSelect,
  useSelectionCount,
  useHasSelection,
  useCanvasState,
  useCanvasScale,
  useCanvasOffset,
  useCanvasSize,
  useIsGridVisible,
  useLayoutState,
  useLayoutType,
  useLayoutCenter,
  useTheme as useStoreTheme,
  useThemeColors,
  useThemeFonts,
  useSearchState,
  useSearchQuery,
  useSearchResults,
  useCurrentSearchResult,
  useIsSearchActive,
  useHistoryState,
  useCanUndo,
  useCanRedo,
  useHistorySize,
  useUIState,
  useIsLoading,
  useError,
  useMode,
  useIsSidebarOpen,
  useIsToolbarVisible,
  useAnalytics,
  useNodeCount,
  useConnectionCount,
  useMaxDepth,
  usePerformanceMetrics,
  useCollaborationState,
  useIsCollaborationEnabled,
  useCollaborators,
  useCollaboratorCount,
  useSettings,
  useAutoSaveEnabled,
  useAutoSaveInterval,
  useIsDirty,
  useLastSaved,
  useMindmapId,
  useMindmapName,
  useMindmapDescription,
  useBoundingBox,
  useNodeStats,
  useConnectionStats,
  useNodePage,
  useVisibleNodesInViewport,
  useNodeHierarchy,
  useNodeDependencies,
  useNodeDependents
} from './selectors';

// Export session selectors
export * from './sessionSelectors';

// Export UI selectors
export * from './uiSelectors';

// Export hooks with main names
export {
  useMindmap,
  useNode,
  useSelection,
  useCanvas,
  useSearch,
  useTheme,
  useCollaboration,
  useHistory,
  useKeyboardShortcuts,
  usePerformance
} from '../hooks/useMindmapStore';

// Export session hooks
export * from '../hooks/useSessionStore';

// Export UI hooks
export * from '../hooks/useUIStore';

// Export utilities
export { MindmapStoreUtils } from '../utils/storeUtils';
export { SessionStoreUtils } from '../utils/sessionStoreUtils';
export { UIStoreUtils } from '../utils/uiStoreUtils';

// Export UI components
export { default as ThemeProvider } from '../components/ui/ThemeProvider';
export { default as NotificationContainer } from '../components/ui/NotificationContainer';
export { default as ModalContainer } from '../components/ui/ModalContainer';
export { 
  default as LoadingIndicator,
  GlobalLoadingIndicator,
  OperationsIndicator,
  PageLoadingOverlay,
  InlineLoading,
  LoadingButton
} from '../components/ui/LoadingIndicator';
export { default as KeywordInput } from '../components/ui/KeywordInput';
export { default as KeywordInputExample } from '../components/ui/KeywordInputExample';
export { default as MindmapCanvas } from '../components/ui/MindmapCanvasNew';
export { default as MindmapCanvasExample } from '../components/ui/MindmapCanvasExample';
export { nodeTypes } from '../components/ui/MindmapNode';
export { edgeTypes } from '../components/ui/MindmapEdge';
export { DetailModal } from '../components/ui/DetailModal';
export { 
  NodeDetailContent,
  ConnectionDetailContent, 
  GenericDetailContent
} from '../components/ui/DetailModalContent';

// Export types
export type {
  MindmapStoreState,
  MindmapStoreActions,
  MindmapStoreSelectors,
  MindmapNode,
  MindmapConnection,
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
  ActivityLogEntry,
  PerformanceMetrics,
  ExportOptions
} from '../types/store';

// Export component types
export type {
  KeywordInputProps,
  KeywordInputState,
  KeywordValidationResult,
  KeywordInputMethods,
  UseKeywordInputProps,
  UseKeywordInputReturn,
  KeywordTagProps
} from '../types/components';

// Export hooks
export { useKeywordInput } from '../hooks/useKeywordInput';
export { default as useMindmapAccessibility } from '../hooks/useMindmapAccessibility';
export { 
  useDetailModal,
  useNodeDetailModal,
  useConnectionDetailModal,
  useAnalyticsDetailModal
} from '../hooks/useDetailModal';

// Export utilities
export { CanvasUtils } from '../utils/canvasUtils';