import { useEffect, useCallback, useRef } from 'react';
import { useMindmapStore } from './useMindmapStore';
import type { MindmapNode } from '../types/store';

/**
 * Custom hook for accessibility features in the mindmap canvas
 */
export const useMindmapAccessibility = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const lastAnnouncementRef = useRef<string>('');
  
  const {
    nodes,
    connections,
    selection,
    selectNode,
    deselectNode,
    selectNone,
    startNodeEdit,
    endNodeEdit,
    createNode,
    deleteNode,
    moveNode,
    expandNode,
    collapseNode
  } = useMindmapStore();

  // Create live region for announcements
  const announceToScreenReader = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (message === lastAnnouncementRef.current) return;
    lastAnnouncementRef.current = message;

    // Find or create live region
    let liveRegion = document.getElementById('mindmap-announcements');
    if (!liveRegion) {
      liveRegion = document.createElement('div');
      liveRegion.id = 'mindmap-announcements';
      liveRegion.setAttribute('aria-live', priority);
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.style.position = 'absolute';
      liveRegion.style.left = '-10000px';
      liveRegion.style.width = '1px';
      liveRegion.style.height = '1px';
      liveRegion.style.overflow = 'hidden';
      document.body.appendChild(liveRegion);
    }

    // Update the message
    liveRegion.textContent = message;

    // Clear after a delay to prevent repetitive announcements
    setTimeout(() => {
      if (liveRegion) {
        liveRegion.textContent = '';
      }
      lastAnnouncementRef.current = '';
    }, 1000);
  }, []);

  // Keyboard navigation
  const handleKeyNavigation = useCallback((event: KeyboardEvent) => {
    if (!containerRef.current) return;

    const selectedNodes = Object.values(nodes).filter(node => node.isSelected);
    const currentNode = selectedNodes[0];
    const allVisibleNodes = Object.values(nodes).filter(node => node.isVisible);

    // Prevent default for handled keys
    const handledKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter', 'Space', 'Delete', 'Backspace', 'Escape'];
    if (handledKeys.includes(event.key)) {
      event.preventDefault();
    }

    switch (event.key) {
      case 'Tab':
        // Navigate between nodes
        if (event.shiftKey) {
          navigateToPreviousNode(currentNode, allVisibleNodes);
        } else {
          navigateToNextNode(currentNode, allVisibleNodes);
        }
        break;

      case 'ArrowUp':
      case 'ArrowDown':
      case 'ArrowLeft':
      case 'ArrowRight':
        if (currentNode) {
          if (event.ctrlKey || event.metaKey) {
            // Move node
            moveNodeWithKeyboard(currentNode, event.key, event.shiftKey ? 50 : 10);
          } else {
            // Navigate to connected node
            navigateToConnectedNode(currentNode, event.key);
          }
        }
        break;

      case 'Enter':
        if (currentNode) {
          if (currentNode.isEditing) {
            endNodeEdit(currentNode.id);
            announceToScreenReader(`Finished editing ${currentNode.text}`);
          } else {
            startNodeEdit(currentNode.id);
            announceToScreenReader(`Started editing ${currentNode.text}`);
          }
        }
        break;

      case 'Space':
        if (currentNode && currentNode.children.length > 0) {
          if (currentNode.isExpanded) {
            collapseNode(currentNode.id);
            announceToScreenReader(`Collapsed ${currentNode.text}`);
          } else {
            expandNode(currentNode.id);
            announceToScreenReader(`Expanded ${currentNode.text}`);
          }
        }
        break;

      case 'Delete':
      case 'Backspace':
        if (currentNode && currentNode.type !== 'central' && !currentNode.isEditing) {
          const nodeText = currentNode.text;
          deleteNode(currentNode.id);
          announceToScreenReader(`Deleted node ${nodeText}`);
        }
        break;

      case 'Escape':
        if (selectedNodes.length > 0) {
          selectNone();
          announceToScreenReader('Cleared selection');
        }
        break;

      case 'n':
        if (event.ctrlKey || event.metaKey) {
          // Create new node
          const position = currentNode ? 
            { x: currentNode.x + 150, y: currentNode.y } :
            { x: 400, y: 300 };
          
          createNode({
            text: 'New Node',
            x: position.x,
            y: position.y,
            parentId: currentNode?.id
          });
          
          announceToScreenReader('Created new node');
        }
        break;

      case 'Home':
        // Navigate to central node
        const centralNode = Object.values(nodes).find(node => node.type === 'central');
        if (centralNode) {
          selectNode(centralNode.id);
          announceToScreenReader(`Selected central node: ${centralNode.text}`);
        }
        break;
    }
  }, [
    nodes,
    selectNode,
    deselectNode,
    selectNone,
    startNodeEdit,
    endNodeEdit,
    createNode,
    deleteNode,
    moveNode,
    expandNode,
    collapseNode,
    announceToScreenReader
  ]);

  // Navigate to next node in tab order
  const navigateToNextNode = useCallback((currentNode: MindmapNode | undefined, allNodes: MindmapNode[]) => {
    if (allNodes.length === 0) return;

    if (!currentNode) {
      // Select first node
      const firstNode = allNodes[0];
      selectNode(firstNode.id);
      announceToScreenReader(`Selected ${firstNode.text}, ${getNodeDescription(firstNode)}`);
      return;
    }

    // Find current node index and select next
    const currentIndex = allNodes.findIndex(node => node.id === currentNode.id);
    const nextIndex = (currentIndex + 1) % allNodes.length;
    const nextNode = allNodes[nextIndex];
    
    selectNode(nextNode.id);
    announceToScreenReader(`Selected ${nextNode.text}, ${getNodeDescription(nextNode)}`);
  }, [selectNode, announceToScreenReader]);

  // Navigate to previous node in tab order
  const navigateToPreviousNode = useCallback((currentNode: MindmapNode | undefined, allNodes: MindmapNode[]) => {
    if (allNodes.length === 0) return;

    if (!currentNode) {
      // Select last node
      const lastNode = allNodes[allNodes.length - 1];
      selectNode(lastNode.id);
      announceToScreenReader(`Selected ${lastNode.text}, ${getNodeDescription(lastNode)}`);
      return;
    }

    // Find current node index and select previous
    const currentIndex = allNodes.findIndex(node => node.id === currentNode.id);
    const prevIndex = currentIndex === 0 ? allNodes.length - 1 : currentIndex - 1;
    const prevNode = allNodes[prevIndex];
    
    selectNode(prevNode.id);
    announceToScreenReader(`Selected ${prevNode.text}, ${getNodeDescription(prevNode)}`);
  }, [selectNode, announceToScreenReader]);

  // Navigate to connected node based on arrow key
  const navigateToConnectedNode = useCallback((currentNode: MindmapNode, direction: string) => {
    const connectedNodes = getConnectedNodes(currentNode);
    if (connectedNodes.length === 0) return;

    let targetNode: MindmapNode | undefined;

    switch (direction) {
      case 'ArrowRight':
        // Find rightmost connected node
        targetNode = connectedNodes.reduce((rightmost, node) => 
          node.x > rightmost.x ? node : rightmost
        );
        break;
      case 'ArrowLeft':
        // Find leftmost connected node
        targetNode = connectedNodes.reduce((leftmost, node) => 
          node.x < leftmost.x ? node : leftmost
        );
        break;
      case 'ArrowUp':
        // Find topmost connected node
        targetNode = connectedNodes.reduce((topmost, node) => 
          node.y < topmost.y ? node : topmost
        );
        break;
      case 'ArrowDown':
        // Find bottommost connected node
        targetNode = connectedNodes.reduce((bottommost, node) => 
          node.y > bottommost.y ? node : bottommost
        );
        break;
    }

    if (targetNode) {
      selectNode(targetNode.id);
      announceToScreenReader(`Navigated to ${targetNode.text}, ${getNodeDescription(targetNode)}`);
    }
  }, [selectNode, announceToScreenReader, nodes, connections]);

  // Move node with keyboard
  const moveNodeWithKeyboard = useCallback((node: MindmapNode, direction: string, distance: number) => {
    let newX = node.x;
    let newY = node.y;

    switch (direction) {
      case 'ArrowRight':
        newX += distance;
        break;
      case 'ArrowLeft':
        newX -= distance;
        break;
      case 'ArrowUp':
        newY -= distance;
        break;
      case 'ArrowDown':
        newY += distance;
        break;
    }

    moveNode(node.id, newX, newY);
    announceToScreenReader(`Moved ${node.text} to position ${Math.round(newX)}, ${Math.round(newY)}`);
  }, [moveNode, announceToScreenReader]);

  // Get connected nodes
  const getConnectedNodes = useCallback((node: MindmapNode): MindmapNode[] => {
    const connectedNodeIds = new Set<string>();
    
    // Add children
    node.children.forEach(childId => connectedNodeIds.add(childId));
    
    // Add parent
    if (node.parentId) {
      connectedNodeIds.add(node.parentId);
    }

    // Add nodes connected via associative connections
    Object.values(connections).forEach(connection => {
      if (connection.sourceNodeId === node.id) {
        connectedNodeIds.add(connection.targetNodeId);
      } else if (connection.targetNodeId === node.id) {
        connectedNodeIds.add(connection.sourceNodeId);
      }
    });

    return Array.from(connectedNodeIds)
      .map(id => nodes[id])
      .filter(Boolean)
      .filter(n => n.isVisible);
  }, [nodes, connections]);

  // Generate node description for screen readers
  const getNodeDescription = useCallback((node: MindmapNode): string => {
    const parts: string[] = [];
    
    parts.push(`${node.type} node`);
    parts.push(`level ${node.level}`);
    
    if (node.children.length > 0) {
      parts.push(`${node.children.length} children`);
      parts.push(node.isExpanded ? 'expanded' : 'collapsed');
    }
    
    if (node.tags && node.tags.length > 0) {
      parts.push(`tagged with ${node.tags.join(', ')}`);
    }
    
    if (node.metadata?.attachments && node.metadata.attachments.length > 0) {
      parts.push(`${node.metadata.attachments.length} attachments`);
    }

    return parts.join(', ');
  }, []);

  // Set up keyboard event listeners
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Make container focusable
    container.setAttribute('tabindex', '0');
    container.setAttribute('role', 'application');
    container.setAttribute('aria-label', 'Mindmap Canvas - Use Tab to navigate nodes, Arrow keys to move between connected nodes, Enter to edit, Space to expand/collapse, Delete to remove nodes');

    container.addEventListener('keydown', handleKeyNavigation);
    
    return () => {
      container.removeEventListener('keydown', handleKeyNavigation);
    };
  }, [handleKeyNavigation]);

  // Announce selection changes
  useEffect(() => {
    const selectedNodes = Object.values(nodes).filter(node => node.isSelected);
    
    if (selectedNodes.length === 1) {
      const node = selectedNodes[0];
      announceToScreenReader(`Selected ${node.text}, ${getNodeDescription(node)}`);
    } else if (selectedNodes.length > 1) {
      announceToScreenReader(`Selected ${selectedNodes.length} nodes`);
    }
  }, [selection.nodes, nodes, announceToScreenReader, getNodeDescription]);

  // Generate ARIA description for the canvas
  const getCanvasAriaDescription = useCallback((): string => {
    const nodeCount = Object.keys(nodes).length;
    const connectionCount = Object.keys(connections).length;
    const selectedCount = selection.nodes.length;
    
    return `Mindmap with ${nodeCount} nodes and ${connectionCount} connections. ${selectedCount} nodes selected.`;
  }, [nodes, connections, selection.nodes.length]);

  return {
    containerRef,
    announceToScreenReader,
    getCanvasAriaDescription,
    getNodeDescription
  };
};

export default useMindmapAccessibility;