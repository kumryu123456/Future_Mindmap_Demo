import type { ModalConfig, ModalSize, ModalPosition, ModalBehavior } from '../ui';

/**
 * Size states for DetailModal expand/collapse functionality
 */
export type DetailModalSize = 'compact' | 'normal' | 'expanded' | 'fullscreen';

/**
 * Content types that can be displayed in DetailModal
 */
export type DetailModalContentType = 
  | 'node'
  | 'connection' 
  | 'analytics'
  | 'settings'
  | 'help'
  | 'custom';

/**
 * Animation states for expand/collapse transitions
 */
export type DetailModalAnimationState = 'idle' | 'expanding' | 'collapsing' | 'transitioning';

/**
 * Configuration for expand/collapse behavior
 */
export interface DetailModalExpandConfig {
  /** Enable expand/collapse functionality */
  enabled: boolean;
  /** Default size when modal opens */
  defaultSize: DetailModalSize;
  /** Animation duration in milliseconds */
  animationDuration: number;
  /** Allow keyboard shortcuts for expand/collapse */
  keyboardShortcuts: boolean;
  /** Sizes available for expansion */
  availableSizes: DetailModalSize[];
  /** Auto-expand based on content */
  autoExpand: boolean;
}

/**
 * Content configuration for different detail modal types
 */
export interface DetailModalContentConfig {
  /** Type of content being displayed */
  type: DetailModalContentType;
  /** Title for the modal */
  title: string;
  /** Subtitle or description */
  subtitle?: string;
  /** Icon name or component */
  icon?: string | React.ComponentType;
  /** Whether content can be edited */
  editable: boolean;
  /** Whether to show expand/collapse controls */
  expandable: boolean;
  /** Custom CSS classes */
  className?: string;
}

/**
 * Data structure for node detail content
 */
export interface NodeDetailData {
  nodeId: string;
  text: string;
  type: string;
  position: { x: number; y: number };
  color: string;
  tags?: string[];
  metadata?: Record<string, any>;
  connections?: Array<{
    id: string;
    type: string;
    targetNodeId: string;
    targetNodeText: string;
  }>;
}

/**
 * Data structure for connection detail content
 */
export interface ConnectionDetailData {
  connectionId: string;
  type: string;
  sourceNodeId: string;
  targetNodeId: string;
  sourceNodeText: string;
  targetNodeText: string;
  label?: string;
  style: {
    color: string;
    width: number;
    arrowType: string;
  };
}

/**
 * Main props interface for DetailModal component
 */
export interface DetailModalProps {
  /** Unique identifier for the modal */
  id: string;
  /** Whether modal is open */
  isOpen: boolean;
  /** Content configuration */
  content: DetailModalContentConfig;
  /** Data to display */
  data: NodeDetailData | ConnectionDetailData | Record<string, any>;
  /** Expand/collapse configuration */
  expandConfig?: DetailModalExpandConfig;
  /** Base modal configuration */
  modalConfig?: Partial<ModalConfig>;
  /** Current size state */
  currentSize?: DetailModalSize;
  /** Animation state */
  animationState?: DetailModalAnimationState;
  /** Custom styling */
  style?: React.CSSProperties;
  /** CSS classes */
  className?: string;
  
  /** Event handlers */
  onClose: () => void;
  onExpand?: (size: DetailModalSize) => void;
  onCollapse?: (size: DetailModalSize) => void;
  onSizeChange?: (newSize: DetailModalSize, previousSize: DetailModalSize) => void;
  onDataChange?: (newData: any) => void;
  onEdit?: () => void;
  onSave?: (data: any) => void;
  onCancel?: () => void;
}

/**
 * Props for DetailModal content renderer components
 */
export interface DetailModalContentProps<T = any> {
  /** Data to display */
  data: T;
  /** Content configuration */
  config: DetailModalContentConfig;
  /** Current modal size */
  size: DetailModalSize;
  /** Whether content is in edit mode */
  isEditing: boolean;
  /** Whether modal is expanded */
  isExpanded: boolean;
  
  /** Event handlers */
  onDataChange?: (newData: T) => void;
  onEdit?: () => void;
  onSave?: (data: T) => void;
  onCancel?: () => void;
  onExpand?: () => void;
  onCollapse?: () => void;
}

/**
 * State interface for DetailModal hook
 */
export interface DetailModalState {
  /** Current size */
  size: DetailModalSize;
  /** Animation state */
  animationState: DetailModalAnimationState;
  /** Whether in edit mode */
  isEditing: boolean;
  /** Whether modal is expanded */
  isExpanded: boolean;
  /** Current data */
  data: any;
  /** Whether data has been modified */
  isDirty: boolean;
}

/**
 * Actions for DetailModal hook
 */
export interface DetailModalActions {
  /** Expand modal to specified size */
  expand: (size?: DetailModalSize) => void;
  /** Collapse modal to smaller size */
  collapse: (size?: DetailModalSize) => void;
  /** Toggle between expanded/collapsed states */
  toggle: () => void;
  /** Set specific size */
  setSize: (size: DetailModalSize) => void;
  /** Enter edit mode */
  startEdit: () => void;
  /** Exit edit mode and save */
  saveEdit: (data?: any) => void;
  /** Exit edit mode without saving */
  cancelEdit: () => void;
  /** Update data */
  updateData: (newData: any) => void;
  /** Reset to original data */
  resetData: () => void;
}

/**
 * Hook return type for useDetailModal
 */
export interface UseDetailModalReturn {
  /** Current state */
  state: DetailModalState;
  /** Available actions */
  actions: DetailModalActions;
  /** Props to spread to DetailModal component */
  modalProps: Partial<DetailModalProps>;
}

/**
 * Configuration for useDetailModal hook
 */
export interface UseDetailModalConfig {
  /** Initial size */
  initialSize?: DetailModalSize;
  /** Expand configuration */
  expandConfig?: Partial<DetailModalExpandConfig>;
  /** Content configuration */
  contentConfig: DetailModalContentConfig;
  /** Initial data */
  initialData: any;
  /** Auto-save changes */
  autoSave?: boolean;
  /** Debounce time for auto-save (ms) */
  autoSaveDelay?: number;
}

/**
 * Default expand configuration
 */
export const DEFAULT_EXPAND_CONFIG: DetailModalExpandConfig = {
  enabled: true,
  defaultSize: 'normal',
  animationDuration: 300,
  keyboardShortcuts: true,
  availableSizes: ['compact', 'normal', 'expanded', 'fullscreen'],
  autoExpand: false
};

/**
 * Size configurations for different modal sizes
 */
export const DETAIL_MODAL_SIZES: Record<DetailModalSize, { width: string | number; height: string | number }> = {
  compact: { width: 400, height: 300 },
  normal: { width: 600, height: 400 },
  expanded: { width: 800, height: 600 },
  fullscreen: { width: '95vw', height: '95vh' }
};

/**
 * Animation class names for different states
 */
export const DETAIL_MODAL_ANIMATIONS = {
  expanding: 'detail-modal--expanding',
  collapsing: 'detail-modal--collapsing',
  transitioning: 'detail-modal--transitioning'
} as const;