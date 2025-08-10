import type { MindmapNode, MindmapConnection, MindmapLayout, MindmapCanvas } from '../types/store';
import { Node, Edge, ReactFlowInstance } from '@xyflow/react';

// Canvas utility functions for mindmap operations

/**
 * Calculate optimal layout positions for nodes
 */
export const calculateLayout = (
  nodes: Record<string, MindmapNode>,
  connections: Record<string, MindmapConnection>,
  layout: MindmapLayout
): Record<string, { x: number; y: number }> => {
  const positions: Record<string, { x: number; y: number }> = {};
  const nodeArray = Object.values(nodes);
  
  // Find root nodes (no parent or central type)
  const rootNodes = nodeArray.filter(node => !node.parentId || node.type === 'central');
  const centralNode = rootNodes.find(node => node.type === 'central');

  if (centralNode) {
    // Place central node at center
    positions[centralNode.id] = { x: layout.centerX, y: layout.centerY };
    
    switch (layout.type) {
      case 'radial':
        return calculateRadialLayout(nodes, connections, layout, centralNode, positions);
      case 'tree':
        return calculateTreeLayout(nodes, connections, layout, centralNode, positions);
      case 'organic':
        return calculateOrganicLayout(nodes, connections, layout, centralNode, positions);
      case 'grid':
        return calculateGridLayout(nodes, layout, positions);
      default:
        return positions;
    }
  }

  return positions;
};

/**
 * Calculate radial layout positions
 */
const calculateRadialLayout = (
  nodes: Record<string, MindmapNode>,
  connections: Record<string, MindmapConnection>,
  layout: MindmapLayout,
  centralNode: MindmapNode,
  positions: Record<string, { x: number; y: number }>
): Record<string, { x: number; y: number }> => {
  const { centerX, centerY, spacing } = layout;
  const children = centralNode.children.map(id => nodes[id]).filter(Boolean);
  
  if (children.length === 0) return positions;

  const angleStep = (2 * Math.PI) / children.length;
  const radius = spacing.radial;

  children.forEach((child, index) => {
    const angle = index * angleStep;
    positions[child.id] = {
      x: centerX + Math.cos(angle) * radius,
      y: centerY + Math.sin(angle) * radius
    };

    // Position children of main nodes
    positionChildrenRecursively(child, nodes, positions, angle, radius + spacing.radial, layout);
  });

  return positions;
};

/**
 * Calculate tree layout positions
 */
const calculateTreeLayout = (
  nodes: Record<string, MindmapNode>,
  connections: Record<string, MindmapConnection>,
  layout: MindmapLayout,
  centralNode: MindmapNode,
  positions: Record<string, { x: number; y: number }>
): Record<string, { x: number; y: number }> => {
  const { centerX, centerY, spacing } = layout;
  const children = centralNode.children.map(id => nodes[id]).filter(Boolean);
  
  if (children.length === 0) return positions;

  const startY = centerY - ((children.length - 1) * spacing.vertical) / 2;

  children.forEach((child, index) => {
    positions[child.id] = {
      x: centerX + spacing.horizontal,
      y: startY + index * spacing.vertical
    };

    // Position children of main nodes
    positionChildrenTreeStyle(child, nodes, positions, spacing.horizontal, startY + index * spacing.vertical, layout);
  });

  return positions;
};

/**
 * Calculate organic layout positions using force-directed algorithm
 */
const calculateOrganicLayout = (
  nodes: Record<string, MindmapNode>,
  connections: Record<string, MindmapConnection>,
  layout: MindmapLayout,
  centralNode: MindmapNode,
  positions: Record<string, { x: number; y: number }>
): Record<string, { x: number; y: number }> => {
  // Simplified force-directed layout
  const nodeArray = Object.values(nodes);
  const connectionArray = Object.values(connections);
  
  // Initialize random positions for non-positioned nodes
  nodeArray.forEach(node => {
    if (!positions[node.id] && node.id !== centralNode.id) {
      positions[node.id] = {
        x: layout.centerX + (Math.random() - 0.5) * 400,
        y: layout.centerY + (Math.random() - 0.5) * 400
      };
    }
  });

  // Simplified force simulation
  for (let iteration = 0; iteration < 50; iteration++) {
    const forces: Record<string, { x: number; y: number }> = {};
    
    // Initialize forces
    nodeArray.forEach(node => {
      forces[node.id] = { x: 0, y: 0 };
    });

    // Repulsion forces between all nodes
    for (let i = 0; i < nodeArray.length; i++) {
      for (let j = i + 1; j < nodeArray.length; j++) {
        const nodeA = nodeArray[i];
        const nodeB = nodeArray[j];
        const posA = positions[nodeA.id];
        const posB = positions[nodeB.id];
        
        if (posA && posB) {
          const dx = posA.x - posB.x;
          const dy = posA.y - posB.y;
          const distance = Math.sqrt(dx * dx + dy * dy) || 1;
          const force = 1000 / (distance * distance);
          
          forces[nodeA.id].x += (dx / distance) * force;
          forces[nodeA.id].y += (dy / distance) * force;
          forces[nodeB.id].x -= (dx / distance) * force;
          forces[nodeB.id].y -= (dy / distance) * force;
        }
      }
    }

    // Attraction forces between connected nodes
    connectionArray.forEach(connection => {
      const nodeA = nodes[connection.sourceNodeId];
      const nodeB = nodes[connection.targetNodeId];
      const posA = positions[nodeA?.id];
      const posB = positions[nodeB?.id];
      
      if (posA && posB) {
        const dx = posB.x - posA.x;
        const dy = posB.y - posA.y;
        const distance = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = distance * 0.01;
        
        forces[nodeA.id].x += (dx / distance) * force;
        forces[nodeA.id].y += (dy / distance) * force;
        forces[nodeB.id].x -= (dx / distance) * force;
        forces[nodeB.id].y -= (dy / distance) * force;
      }
    });

    // Apply forces (except to central node)
    nodeArray.forEach(node => {
      if (node.id !== centralNode.id && positions[node.id]) {
        positions[node.id].x += forces[node.id].x * 0.1;
        positions[node.id].y += forces[node.id].y * 0.1;
      }
    });
  }

  return positions;
};

/**
 * Calculate grid layout positions
 */
const calculateGridLayout = (
  nodes: Record<string, MindmapNode>,
  layout: MindmapLayout,
  positions: Record<string, { x: number; y: number }>
): Record<string, { x: number; y: number }> => {
  const nodeArray = Object.values(nodes);
  const gridSize = Math.ceil(Math.sqrt(nodeArray.length));
  const { spacing } = layout;
  
  let index = 0;
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      if (index >= nodeArray.length) break;
      
      const node = nodeArray[index];
      positions[node.id] = {
        x: layout.centerX + (col - gridSize / 2) * spacing.horizontal,
        y: layout.centerY + (row - gridSize / 2) * spacing.vertical
      };
      
      index++;
    }
  }
  
  return positions;
};

/**
 * Position children recursively for radial layout
 */
const positionChildrenRecursively = (
  parent: MindmapNode,
  nodes: Record<string, MindmapNode>,
  positions: Record<string, { x: number; y: number }>,
  parentAngle: number,
  radius: number,
  layout: MindmapLayout
): void => {
  const children = parent.children.map(id => nodes[id]).filter(Boolean);
  if (children.length === 0) return;

  const angleSpread = Math.PI / 6; // 30 degrees spread
  const startAngle = parentAngle - angleSpread / 2;
  const angleStep = angleSpread / Math.max(children.length - 1, 1);

  const parentPos = positions[parent.id];
  
  children.forEach((child, index) => {
    const angle = children.length === 1 ? parentAngle : startAngle + index * angleStep;
    positions[child.id] = {
      x: parentPos.x + Math.cos(angle) * radius,
      y: parentPos.y + Math.sin(angle) * radius
    };

    // Recursively position children
    positionChildrenRecursively(child, nodes, positions, angle, radius * 0.8, layout);
  });
};

/**
 * Position children in tree style
 */
const positionChildrenTreeStyle = (
  parent: MindmapNode,
  nodes: Record<string, MindmapNode>,
  positions: Record<string, { x: number; y: number }>,
  level: number,
  baseY: number,
  layout: MindmapLayout
): void => {
  const children = parent.children.map(id => nodes[id]).filter(Boolean);
  if (children.length === 0) return;

  const startY = baseY - ((children.length - 1) * layout.spacing.vertical) / 2;

  children.forEach((child, index) => {
    const childY = startY + index * layout.spacing.vertical;
    positions[child.id] = {
      x: layout.centerX + level + layout.spacing.horizontal,
      y: childY
    };

    // Recursively position children
    positionChildrenTreeStyle(child, nodes, positions, level + layout.spacing.horizontal, childY, layout);
  });
};

/**
 * Calculate bounding box for a set of nodes
 */
export const calculateBoundingBox = (nodes: MindmapNode[]): {
  x: number;
  y: number;
  width: number;
  height: number;
} => {
  if (nodes.length === 0) {
    return { x: 0, y: 0, width: 0, height: 0 };
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  nodes.forEach(node => {
    const nodeWidth = node.width || 120;
    const nodeHeight = node.height || 60;
    
    minX = Math.min(minX, node.x - nodeWidth / 2);
    minY = Math.min(minY, node.y - nodeHeight / 2);
    maxX = Math.max(maxX, node.x + nodeWidth / 2);
    maxY = Math.max(maxY, node.y + nodeHeight / 2);
  });

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY
  };
};

/**
 * Fit canvas view to show all nodes
 */
export const fitViewToNodes = (
  reactFlowInstance: ReactFlowInstance,
  nodes: MindmapNode[],
  padding = 50
): void => {
  if (nodes.length === 0) return;

  const bbox = calculateBoundingBox(nodes);
  
  reactFlowInstance.fitBounds(
    {
      x: bbox.x - padding,
      y: bbox.y - padding,
      width: bbox.width + 2 * padding,
      height: bbox.height + 2 * padding
    },
    { padding: 0.1 }
  );
};

/**
 * Convert screen coordinates to flow coordinates
 */
export const screenToFlowPosition = (
  reactFlowInstance: ReactFlowInstance,
  screenX: number,
  screenY: number,
  containerBounds: DOMRect
): { x: number; y: number } => {
  return reactFlowInstance.screenToFlowPosition({
    x: screenX - containerBounds.left,
    y: screenY - containerBounds.top
  });
};

/**
 * Find the closest node to a given position
 */
export const findClosestNode = (
  nodes: MindmapNode[],
  x: number,
  y: number,
  maxDistance = 100
): MindmapNode | null => {
  let closestNode: MindmapNode | null = null;
  let minDistance = maxDistance;

  nodes.forEach(node => {
    const distance = Math.sqrt(
      Math.pow(node.x - x, 2) + Math.pow(node.y - y, 2)
    );
    
    if (distance < minDistance) {
      minDistance = distance;
      closestNode = node;
    }
  });

  return closestNode;
};

/**
 * Check if two nodes would overlap
 */
export const checkNodeOverlap = (
  nodeA: { x: number; y: number; width?: number; height?: number },
  nodeB: { x: number; y: number; width?: number; height?: number },
  margin = 20
): boolean => {
  const widthA = (nodeA.width || 120) / 2 + margin;
  const heightA = (nodeA.height || 60) / 2 + margin;
  const widthB = (nodeB.width || 120) / 2 + margin;
  const heightB = (nodeB.height || 60) / 2 + margin;

  return Math.abs(nodeA.x - nodeB.x) < (widthA + widthB) &&
         Math.abs(nodeA.y - nodeB.y) < (heightA + heightB);
};

/**
 * Find a non-overlapping position for a new node
 */
export const findNonOverlappingPosition = (
  existingNodes: MindmapNode[],
  preferredPosition: { x: number; y: number },
  nodeSize = { width: 120, height: 60 }
): { x: number; y: number } => {
  let position = { ...preferredPosition };
  const attempts = 20;
  const radius = 50;

  for (let attempt = 0; attempt < attempts; attempt++) {
    const hasOverlap = existingNodes.some(node => 
      checkNodeOverlap(position, node)
    );

    if (!hasOverlap) {
      return position;
    }

    // Try spiral pattern
    const angle = (attempt * 137.508) * (Math.PI / 180); // Golden angle
    const distance = radius * Math.sqrt(attempt);
    
    position = {
      x: preferredPosition.x + Math.cos(angle) * distance,
      y: preferredPosition.y + Math.sin(angle) * distance
    };
  }

  return position;
};

/**
 * Get optimal zoom level to fit content
 */
export const getOptimalZoom = (
  canvasSize: { width: number; height: number },
  contentBounds: { width: number; height: number },
  padding = 50
): number => {
  const availableWidth = canvasSize.width - 2 * padding;
  const availableHeight = canvasSize.height - 2 * padding;
  
  const zoomX = availableWidth / contentBounds.width;
  const zoomY = availableHeight / contentBounds.height;
  
  return Math.min(zoomX, zoomY, 1); // Don't zoom in beyond 100%
};

/**
 * Smooth animation helper
 */
export const animateToPosition = (
  reactFlowInstance: ReactFlowInstance,
  targetPosition: { x: number; y: number; zoom: number },
  duration = 800
): void => {
  const viewport = reactFlowInstance.getViewport();
  const startTime = Date.now();

  const animate = () => {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Easing function (ease out)
    const eased = 1 - Math.pow(1 - progress, 3);
    
    const currentPosition = {
      x: viewport.x + (targetPosition.x - viewport.x) * eased,
      y: viewport.y + (targetPosition.y - viewport.y) * eased,
      zoom: viewport.zoom + (targetPosition.zoom - viewport.zoom) * eased
    };
    
    reactFlowInstance.setViewport(currentPosition);
    
    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  };
  
  animate();
};

/**
 * Export utilities
 */
export const CanvasUtils = {
  calculateLayout,
  calculateBoundingBox,
  fitViewToNodes,
  screenToFlowPosition,
  findClosestNode,
  checkNodeOverlap,
  findNonOverlappingPosition,
  getOptimalZoom,
  animateToPosition
};