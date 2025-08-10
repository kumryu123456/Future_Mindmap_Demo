import { useState, useCallback, useEffect, useRef } from 'react';
import type {
  DetailModalSize,
  DetailModalAnimationState,
  DetailModalState,
  DetailModalActions,
  UseDetailModalReturn,
  UseDetailModalConfig,
  DEFAULT_EXPAND_CONFIG
} from '../types/components/detailModal';

/**
 * Custom hook for managing DetailModal state and expand/collapse functionality
 */
export const useDetailModal = (config: UseDetailModalConfig): UseDetailModalReturn => {
  const {
    initialSize = 'normal',
    expandConfig = DEFAULT_EXPAND_CONFIG,
    contentConfig,
    initialData,
    autoSave = false,
    autoSaveDelay = 1000
  } = config;

  // Core state
  const [size, setSize] = useState<DetailModalSize>(initialSize);
  const [animationState, setAnimationState] = useState<DetailModalAnimationState>('idle');
  const [isEditing, setIsEditing] = useState(false);
  const [data, setData] = useState(initialData);
  const [originalData, setOriginalData] = useState(initialData);
  const [isDirty, setIsDirty] = useState(false);

  // Auto-save timer ref
  const autoSaveTimer = useRef<NodeJS.Timeout>();

  // Derived state
  const isExpanded = size === 'expanded' || size === 'fullscreen';

  // Auto-save functionality
  const triggerAutoSave = useCallback((newData: any) => {
    if (!autoSave) return;

    if (autoSaveTimer.current) {
      clearTimeout(autoSaveTimer.current);
    }

    autoSaveTimer.current = setTimeout(() => {
      // Here you would typically call an API or update the store
      console.log('Auto-saving data:', newData);
      setOriginalData(newData);
      setIsDirty(false);
    }, autoSaveDelay);
  }, [autoSave, autoSaveDelay]);

  // Actions
  const expand = useCallback((targetSize?: DetailModalSize) => {
    if (animationState !== 'idle') return;

    const availableSizes = expandConfig.availableSizes;
    const currentIndex = availableSizes.indexOf(size);
    let nextSize: DetailModalSize;

    if (targetSize && availableSizes.includes(targetSize)) {
      nextSize = targetSize;
    } else {
      // Get next larger size
      const nextIndex = Math.min(currentIndex + 1, availableSizes.length - 1);
      nextSize = availableSizes[nextIndex];
    }

    if (nextSize === size) return;

    setAnimationState('expanding');
    setSize(nextSize);

    setTimeout(() => {
      setAnimationState('idle');
    }, expandConfig.animationDuration);
  }, [size, animationState, expandConfig]);

  const collapse = useCallback((targetSize?: DetailModalSize) => {
    if (animationState !== 'idle') return;

    const availableSizes = expandConfig.availableSizes;
    const currentIndex = availableSizes.indexOf(size);
    let nextSize: DetailModalSize;

    if (targetSize && availableSizes.includes(targetSize)) {
      nextSize = targetSize;
    } else {
      // Get next smaller size
      const nextIndex = Math.max(currentIndex - 1, 0);
      nextSize = availableSizes[nextIndex];
    }

    if (nextSize === size) return;

    setAnimationState('collapsing');
    setSize(nextSize);

    setTimeout(() => {
      setAnimationState('idle');
    }, expandConfig.animationDuration);
  }, [size, animationState, expandConfig]);

  const toggle = useCallback(() => {
    const availableSizes = expandConfig.availableSizes;
    const currentIndex = availableSizes.indexOf(size);
    const midIndex = Math.floor(availableSizes.length / 2);

    if (currentIndex < midIndex) {
      expand();
    } else {
      collapse();
    }
  }, [size, expandConfig.availableSizes, expand, collapse]);

  const setSizeDirectly = useCallback((newSize: DetailModalSize) => {
    if (newSize === size || !expandConfig.availableSizes.includes(newSize)) return;

    const currentIndex = expandConfig.availableSizes.indexOf(size);
    const newIndex = expandConfig.availableSizes.indexOf(newSize);
    
    if (newIndex > currentIndex) {
      setAnimationState('expanding');
    } else {
      setAnimationState('collapsing');
    }

    setSize(newSize);

    setTimeout(() => {
      setAnimationState('idle');
    }, expandConfig.animationDuration);
  }, [size, expandConfig]);

  const startEdit = useCallback(() => {
    setIsEditing(true);
  }, []);

  const saveEdit = useCallback((newData?: any) => {
    const dataToSave = newData !== undefined ? newData : data;
    setData(dataToSave);
    setOriginalData(dataToSave);
    setIsEditing(false);
    setIsDirty(false);

    // Clear auto-save timer since we're manually saving
    if (autoSaveTimer.current) {
      clearTimeout(autoSaveTimer.current);
    }
  }, [data]);

  const cancelEdit = useCallback(() => {
    setData(originalData);
    setIsEditing(false);
    setIsDirty(false);

    // Clear auto-save timer
    if (autoSaveTimer.current) {
      clearTimeout(autoSaveTimer.current);
    }
  }, [originalData]);

  const updateData = useCallback((newData: any) => {
    setData(newData);
    setIsDirty(JSON.stringify(newData) !== JSON.stringify(originalData));

    if (autoSave) {
      triggerAutoSave(newData);
    }
  }, [originalData, autoSave, triggerAutoSave]);

  const resetData = useCallback(() => {
    setData(originalData);
    setIsDirty(false);

    // Clear auto-save timer
    if (autoSaveTimer.current) {
      clearTimeout(autoSaveTimer.current);
    }
  }, [originalData]);

  // Auto-expand based on content if enabled
  useEffect(() => {
    if (expandConfig.autoExpand && data) {
      const contentSize = JSON.stringify(data).length;
      const hasComplexData = typeof data === 'object' && data !== null;
      
      // Auto-expand for complex or large content
      if (hasComplexData && contentSize > 500 && size === 'compact') {
        expand('normal');
      } else if (contentSize > 2000 && size === 'normal') {
        expand('expanded');
      }
    }
  }, [data, expandConfig.autoExpand, size, expand]);

  // Clean up auto-save timer on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current);
      }
    };
  }, []);

  // State object
  const state: DetailModalState = {
    size,
    animationState,
    isEditing,
    isExpanded,
    data,
    isDirty
  };

  // Actions object
  const actions: DetailModalActions = {
    expand,
    collapse,
    toggle,
    setSize: setSizeDirectly,
    startEdit,
    saveEdit,
    cancelEdit,
    updateData,
    resetData
  };

  // Modal props to spread to DetailModal component
  const modalProps = {
    content: contentConfig,
    data,
    expandConfig: { ...DEFAULT_EXPAND_CONFIG, ...expandConfig },
    currentSize: size,
    animationState,
    onExpand: expand,
    onCollapse: collapse,
    onSizeChange: setSizeDirectly,
    onDataChange: updateData,
    onEdit: startEdit,
    onSave: saveEdit,
    onCancel: cancelEdit
  };

  return {
    state,
    actions,
    modalProps
  };
};

/**
 * Utility hook for creating node detail modals
 */
export const useNodeDetailModal = (nodeData: any, options: Partial<UseDetailModalConfig> = {}) => {
  return useDetailModal({
    contentConfig: {
      type: 'node',
      title: `Node: ${nodeData?.text || 'Untitled'}`,
      subtitle: `Type: ${nodeData?.type || 'unknown'}`,
      icon: '🔍',
      editable: true,
      expandable: true
    },
    initialData: nodeData,
    ...options
  });
};

/**
 * Utility hook for creating connection detail modals  
 */
export const useConnectionDetailModal = (connectionData: any, options: Partial<UseDetailModalConfig> = {}) => {
  return useDetailModal({
    contentConfig: {
      type: 'connection',
      title: `Connection: ${connectionData?.type || 'Unknown'}`,
      subtitle: `${connectionData?.sourceNodeText} → ${connectionData?.targetNodeText}`,
      icon: '🔗',
      editable: true,
      expandable: true
    },
    initialData: connectionData,
    ...options
  });
};

/**
 * Utility hook for creating analytics detail modals
 */
export const useAnalyticsDetailModal = (analyticsData: any, options: Partial<UseDetailModalConfig> = {}) => {
  return useDetailModal({
    contentConfig: {
      type: 'analytics',
      title: 'Analytics Details',
      subtitle: 'Mindmap performance and usage statistics',
      icon: '📊',
      editable: false,
      expandable: true
    },
    initialData: analyticsData,
    initialSize: 'expanded',
    ...options
  });
};

export default useDetailModal;