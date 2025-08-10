import type {
  MindmapNode,
  MindmapConnection,
  MindmapStoreState,
  SearchResult,
  SearchFilters,
  SearchOptions
} from '../types/store';

/**
 * Store utility functions for mindmap operations
 */
export class MindmapStoreUtils {
  
  /**
   * Calculate optimal position for new node
   */
  static calculateNewNodePosition(
    parentNode: MindmapNode,
    existingSiblings: MindmapNode[],
    layout: MindmapStoreState['layout']
  ): { x: number; y: number } {
    if (existingSiblings.length === 0) {
      // First child - position based on layout type
      switch (layout.type) {
        case 'radial':
          return {
            x: parentNode.x + layout.spacing.horizontal,
            y: parentNode.y
          };
        case 'tree':
          return {
            x: parentNode.x,
            y: parentNode.y + layout.spacing.vertical
          };
        default:
          return {
            x: parentNode.x + layout.spacing.horizontal,
            y: parentNode.y + layout.spacing.vertical
          };
      }
    }
    
    // Position relative to existing siblings
    const avgSiblingX = existingSiblings.reduce((sum, node) => sum + node.x, 0) / existingSiblings.length;
    const avgSiblingY = existingSiblings.reduce((sum, node) => sum + node.y, 0) / existingSiblings.length;
    
    return {
      x: avgSiblingX + (Math.random() - 0.5) * layout.spacing.horizontal,
      y: avgSiblingY + layout.spacing.vertical
    };
  }
  
  /**
   * Find shortest path between two nodes
   */
  static findShortestPath(
    startNodeId: string,
    endNodeId: string,
    nodes: Record<string, MindmapNode>,
    connections: Record<string, MindmapConnection>
  ): string[] {
    if (startNodeId === endNodeId) return [startNodeId];
    
    const visited = new Set<string>();
    const queue: { nodeId: string; path: string[] }[] = [{ nodeId: startNodeId, path: [startNodeId] }];
    
    while (queue.length > 0) {
      const { nodeId, path } = queue.shift()!;
      
      if (visited.has(nodeId)) continue;
      visited.add(nodeId);
      
      // Find connected nodes
      const connectedNodes = Object.values(connections)
        .filter(conn => conn.sourceNodeId === nodeId || conn.targetNodeId === nodeId)
        .map(conn => conn.sourceNodeId === nodeId ? conn.targetNodeId : conn.sourceNodeId)
        .filter(id => !visited.has(id));
      
      for (const connectedNodeId of connectedNodes) {
        const newPath = [...path, connectedNodeId];
        
        if (connectedNodeId === endNodeId) {
          return newPath;
        }
        
        queue.push({ nodeId: connectedNodeId, path: newPath });
      }
    }
    
    return []; // No path found
  }
  
  /**
   * Calculate node hierarchy levels
   */
  static calculateNodeLevels(
    nodes: Record<string, MindmapNode>,
    rootNodeId?: string
  ): Record<string, number> {
    const levels: Record<string, number> = {};
    
    // Find root nodes (nodes without parents or specified root)
    const rootNodes = rootNodeId 
      ? [rootNodeId]
      : Object.values(nodes).filter(node => !node.parentId).map(node => node.id);
    
    // BFS to calculate levels
    const queue: { nodeId: string; level: number }[] = rootNodes.map(id => ({ nodeId: id, level: 0 }));
    
    while (queue.length > 0) {
      const { nodeId, level } = queue.shift()!;
      
      if (levels[nodeId] !== undefined) continue;
      
      levels[nodeId] = level;
      
      // Add children to queue
      const node = nodes[nodeId];
      if (node) {
        node.children.forEach(childId => {
          if (levels[childId] === undefined) {
            queue.push({ nodeId: childId, level: level + 1 });
          }
        });
      }
    }
    
    return levels;
  }
  
  /**
   * Get node descendants (all children recursively)
   */
  static getNodeDescendants(
    nodeId: string,
    nodes: Record<string, MindmapNode>
  ): string[] {
    const descendants: string[] = [];
    const visited = new Set<string>();
    
    const traverse = (id: string) => {
      if (visited.has(id)) return;
      visited.add(id);
      
      const node = nodes[id];
      if (node) {
        node.children.forEach(childId => {
          descendants.push(childId);
          traverse(childId);
        });
      }
    };
    
    traverse(nodeId);
    return descendants;
  }
  
  /**
   * Get node ancestors (all parents recursively)
   */
  static getNodeAncestors(
    nodeId: string,
    nodes: Record<string, MindmapNode>
  ): string[] {
    const ancestors: string[] = [];
    let currentId: string | undefined = nodeId;
    
    while (currentId && nodes[currentId]?.parentId) {
      const parentId = nodes[currentId].parentId!;
      ancestors.push(parentId);
      currentId = parentId;
    }
    
    return ancestors;
  }
  
  /**
   * Search nodes based on query and filters
   */
  static searchNodes(
    query: string,
    nodes: Record<string, MindmapNode>,
    filters: SearchFilters,
    options: SearchOptions
  ): SearchResult[] {
    if (!query.trim()) return [];
    
    const results: SearchResult[] = [];
    const searchQuery = options.caseSensitive ? query : query.toLowerCase();
    
    Object.values(nodes).forEach(node => {
      // Apply filters
      if (filters.nodeTypes.length > 0 && !filters.nodeTypes.includes(node.type)) return;
      if (filters.levels.length > 0 && !filters.levels.includes(node.level)) return;
      if (filters.tags.length > 0 && !filters.tags.some(tag => node.tags?.includes(tag))) return;
      if (filters.hasAttachments !== undefined) {
        const hasAttachments = (node.metadata?.attachments?.length || 0) > 0;
        if (filters.hasAttachments !== hasAttachments) return;
      }
      if (filters.status && filters.status.length > 0 && 
          !filters.status.includes(node.metadata?.status || 'draft')) return;
      
      // Date range filter
      if (filters.dateRange) {
        const nodeDate = new Date(node.metadata?.updatedAt || node.metadata?.createdAt || '');
        const startDate = new Date(filters.dateRange.start);
        const endDate = new Date(filters.dateRange.end);
        if (nodeDate < startDate || nodeDate > endDate) return;
      }
      
      // Text search
      const nodeText = options.caseSensitive ? node.text : node.text.toLowerCase();
      
      let match = false;
      let matchType: 'text' | 'tag' | 'metadata' = 'text';
      let field = 'text';
      let matchText = '';
      let context = '';
      
      if (options.regex) {
        try {
          const regex = new RegExp(searchQuery, options.caseSensitive ? 'g' : 'gi');
          if (regex.test(nodeText)) {
            match = true;
            matchText = query;
            context = node.text;
          }
        } catch {
          // Invalid regex, fall back to normal search
        }
      }
      
      if (!match) {
        if (options.wholeWords) {
          const wordBoundaryRegex = new RegExp(`\\b${searchQuery}\\b`, options.caseSensitive ? '' : 'i');
          if (wordBoundaryRegex.test(nodeText)) {
            match = true;
            matchText = query;
            context = node.text;
          }
        } else {
          if (nodeText.includes(searchQuery)) {
            match = true;
            matchText = query;
            context = node.text;
          }
        }
      }
      
      // Search in tags
      if (!match && node.tags) {
        const matchingTag = node.tags.find(tag => {
          const tagText = options.caseSensitive ? tag : tag.toLowerCase();
          return tagText.includes(searchQuery);
        });
        
        if (matchingTag) {
          match = true;
          matchType = 'tag';
          field = 'tags';
          matchText = matchingTag;
          context = `Tags: ${node.tags.join(', ')}`;
        }
      }
      
      // Search in metadata
      if (!match && options.includeMetadata && node.metadata) {
        const metadataText = options.caseSensitive 
          ? JSON.stringify(node.metadata)
          : JSON.stringify(node.metadata).toLowerCase();
        
        if (metadataText.includes(searchQuery)) {
          match = true;
          matchType = 'metadata';
          field = 'metadata';
          matchText = query;
          context = node.metadata.notes || 'Found in metadata';
        }
      }
      
      if (match) {
        // Calculate relevance score
        let score = 0;
        if (matchType === 'text') score = 1;
        else if (matchType === 'tag') score = 0.8;
        else if (matchType === 'metadata') score = 0.6;
        
        // Boost score for exact matches
        if (nodeText === searchQuery) score += 0.5;
        else if (nodeText.startsWith(searchQuery)) score += 0.3;
        else if (nodeText.endsWith(searchQuery)) score += 0.2;
        
        results.push({
          nodeId: node.id,
          type: matchType,
          field,
          match: matchText,
          context: context.length > 100 ? context.substring(0, 100) + '...' : context,
          score
        });
      }
    });
    
    // Sort by score and limit results
    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, options.maxResults);
  }
  
  /**
   * Calculate bounding box for a set of nodes
   */
  static calculateBoundingBox(nodes: MindmapNode[]): {
    x: number;
    y: number;
    width: number;
    height: number;
  } {
    if (nodes.length === 0) {
      return { x: 0, y: 0, width: 0, height: 0 };
    }
    
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
  }
  
  /**
   * Generate color palette for node types
   */
  static generateColorPalette(baseColor: string, count: number): string[] {
    const colors: string[] = [];
    const hsl = this.hexToHsl(baseColor);
    
    for (let i = 0; i < count; i++) {
      const hue = (hsl.h + (360 / count) * i) % 360;
      colors.push(this.hslToHex(hue, hsl.s, hsl.l));
    }
    
    return colors;
  }
  
  /**
   * Convert hex color to HSL
   */
  static hexToHsl(hex: string): { h: number; s: number; l: number } {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const diff = max - min;
    const sum = max + min;
    const l = sum / 2;
    
    let h = 0;
    let s = 0;
    
    if (diff !== 0) {
      s = l > 0.5 ? diff / (2 - sum) : diff / sum;
      
      switch (max) {
        case r:
          h = ((g - b) / diff) + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / diff + 2;
          break;
        case b:
          h = (r - g) / diff + 4;
          break;
      }
      h /= 6;
    }
    
    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  }
  
  /**
   * Convert HSL color to hex
   */
  static hslToHex(h: number, s: number, l: number): string {
    h /= 360;
    s /= 100;
    l /= 100;
    
    const hueToRgb = (p: number, q: number, t: number): number => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    
    let r, g, b;
    
    if (s === 0) {
      r = g = b = l;
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hueToRgb(p, q, h + 1/3);
      g = hueToRgb(p, q, h);
      b = hueToRgb(p, q, h - 1/3);
    }
    
    const toHex = (c: number): string => {
      const hex = Math.round(c * 255).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }
  
  /**
   * Validate node data structure
   */
  static validateNode(node: Partial<MindmapNode>): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    
    if (!node.id || typeof node.id !== 'string') {
      errors.push('Node ID is required and must be a string');
    }
    
    if (!node.text || typeof node.text !== 'string') {
      errors.push('Node text is required and must be a string');
    }
    
    if (typeof node.x !== 'number' || isNaN(node.x)) {
      errors.push('Node X coordinate must be a valid number');
    }
    
    if (typeof node.y !== 'number' || isNaN(node.y)) {
      errors.push('Node Y coordinate must be a valid number');
    }
    
    if (node.level !== undefined && (typeof node.level !== 'number' || node.level < 0)) {
      errors.push('Node level must be a non-negative number');
    }
    
    if (node.type && !['central', 'main', 'sub', 'note'].includes(node.type)) {
      errors.push('Node type must be one of: central, main, sub, note');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  /**
   * Validate connection data structure
   */
  static validateConnection(connection: Partial<MindmapConnection>): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    
    if (!connection.id || typeof connection.id !== 'string') {
      errors.push('Connection ID is required and must be a string');
    }
    
    if (!connection.sourceNodeId || typeof connection.sourceNodeId !== 'string') {
      errors.push('Source node ID is required and must be a string');
    }
    
    if (!connection.targetNodeId || typeof connection.targetNodeId !== 'string') {
      errors.push('Target node ID is required and must be a string');
    }
    
    if (connection.sourceNodeId === connection.targetNodeId) {
      errors.push('Source and target node IDs cannot be the same');
    }
    
    if (connection.type && !['hierarchical', 'associative', 'dependency', 'sequence'].includes(connection.type)) {
      errors.push('Connection type must be one of: hierarchical, associative, dependency, sequence');
    }
    
    if (connection.strength !== undefined && 
        (typeof connection.strength !== 'number' || connection.strength < 0 || connection.strength > 1)) {
      errors.push('Connection strength must be a number between 0 and 1');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  /**
   * Calculate mindmap statistics
   */
  static calculateMindmapStats(state: MindmapStoreState): {
    totalNodes: number;
    totalConnections: number;
    nodesByType: Record<string, number>;
    nodesByLevel: Record<number, number>;
    avgNodesPerLevel: number;
    maxDepth: number;
    branchingFactor: number;
    density: number; // connections / possible connections
    centralityScores: Record<string, number>;
  } {
    const nodes = Object.values(state.nodes);
    const connections = Object.values(state.connections);
    
    const nodesByType = nodes.reduce((acc, node) => {
      acc[node.type] = (acc[node.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const nodesByLevel = nodes.reduce((acc, node) => {
      acc[node.level] = (acc[node.level] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);
    
    const maxDepth = Math.max(...nodes.map(n => n.level), 0);
    const avgNodesPerLevel = nodes.length / (maxDepth + 1);
    
    // Calculate branching factor (average number of children per non-leaf node)
    const nonLeafNodes = nodes.filter(n => n.children.length > 0);
    const branchingFactor = nonLeafNodes.length > 0 
      ? nonLeafNodes.reduce((sum, n) => sum + n.children.length, 0) / nonLeafNodes.length
      : 0;
    
    // Calculate density (actual connections / possible connections)
    const possibleConnections = nodes.length * (nodes.length - 1) / 2;
    const density = possibleConnections > 0 ? connections.length / possibleConnections : 0;
    
    // Calculate centrality scores (degree centrality)
    const centralityScores: Record<string, number> = {};
    nodes.forEach(node => {
      const degree = connections.filter(
        conn => conn.sourceNodeId === node.id || conn.targetNodeId === node.id
      ).length;
      centralityScores[node.id] = degree;
    });
    
    return {
      totalNodes: nodes.length,
      totalConnections: connections.length,
      nodesByType,
      nodesByLevel,
      avgNodesPerLevel,
      maxDepth,
      branchingFactor,
      density,
      centralityScores
    };
  }
  
  /**
   * Export mindmap data to various formats
   */
  static exportToFormat(
    state: MindmapStoreState,
    format: 'json' | 'csv' | 'markdown' | 'outline'
  ): string {
    const nodes = Object.values(state.nodes);
    const connections = Object.values(state.connections);
    
    switch (format) {
      case 'json':
        return JSON.stringify({
          id: state.id,
          name: state.name,
          nodes,
          connections,
          layout: state.layout,
          theme: state.theme
        }, null, 2);
        
      case 'csv': {
        const csvHeaders = 'ID,Text,Type,Level,X,Y,Parent ID,Created At\n';
        const csvRows = nodes.map(node => 
          `"${node.id}","${node.text}","${node.type}",${node.level},${node.x},${node.y},"${node.parentId || ''}","${node.metadata?.createdAt || ''}"`
        ).join('\n');
        return csvHeaders + csvRows;
      }
        
      case 'markdown': {
        const rootNodes = nodes.filter(n => n.level === 0);
        
        const nodeToMarkdown = (nodeId: string, depth: number = 0): string => {
          const node = state.nodes[nodeId];
          if (!node) return '';
          
          const indent = '  '.repeat(depth);
          const prefix = depth === 0 ? '# ' : '- ';
          let result = `${indent}${prefix}${node.text}\n`;
          
          node.children.forEach(childId => {
            result += nodeToMarkdown(childId, depth + 1);
          });
          
          return result;
        };
        
        return `# ${state.name}\n\n${rootNodes.map(n => nodeToMarkdown(n.id)).join('\n')}`;
      }
        
      case 'outline': {
        const outlineNodes = [...nodes].sort((a, b) => a.level - b.level);
        return outlineNodes.map(node => {
          const indent = '  '.repeat(node.level);
          return `${indent}${node.text}`;
        }).join('\n');
      }
        
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }
  
  /**
   * Import mindmap data from various formats
   */
  static importFromFormat(
    data: string,
    format: 'json' | 'csv' | 'markdown'
  ): Partial<MindmapStoreState> | null {
    try {
      switch (format) {
        case 'json':
          return JSON.parse(data);
          
        case 'csv': {
          const csvLines = data.split('\n');
          const headers = csvLines[0].split(',').map(h => h.replace(/"/g, ''));
          const rows = csvLines.slice(1).filter(line => line.trim());
          
          const importedNodes: Record<string, MindmapNode> = {};
          
          rows.forEach(row => {
            const values = row.split(',').map(v => v.replace(/"/g, ''));
            const nodeData = Object.fromEntries(
              headers.map((header, index) => [header, values[index]])
            );
            
            const node: MindmapNode = {
              id: nodeData['ID'],
              text: nodeData['Text'],
              type: nodeData['Type'] as MindmapNode['type'],
              level: parseInt(nodeData['Level']),
              x: parseFloat(nodeData['X']),
              y: parseFloat(nodeData['Y']),
              parentId: nodeData['Parent ID'] || undefined,
              children: [],
              color: '#667eea',
              isExpanded: true,
              isSelected: false,
              isEditing: false,
              isVisible: true,
              metadata: {
                createdAt: nodeData['Created At'] || new Date().toISOString(),
                updatedAt: new Date().toISOString()
              }
            };
            
            importedNodes[node.id] = node;
          });
          
          return { nodes: importedNodes };
        }
          
        case 'markdown': {
          // Basic markdown parsing - would need more sophisticated parsing
          const mdLines = data.split('\n').filter(line => line.trim());
          const nodes: Record<string, MindmapNode> = {};
          let nodeCounter = 0;
          
          mdLines.forEach((line, index) => {
            if (line.startsWith('#') || line.trim().startsWith('-')) {
              const text = line.replace(/^#+\s*/, '').replace(/^-\s*/, '').trim();
              const level = line.startsWith('#') ? 0 : 
                          (line.match(/^\s*/) || [''])[0].length / 2;
              
              const nodeId = `imported_${nodeCounter++}`;
              nodes[nodeId] = {
                id: nodeId,
                text,
                type: level === 0 ? 'central' : level === 1 ? 'main' : 'sub',
                level,
                x: 400 + level * 200,
                y: 300 + index * 100,
                children: [],
                color: '#667eea',
                isExpanded: true,
                isSelected: false,
                isEditing: false,
                isVisible: true,
                metadata: {
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString()
                }
              };
            }
          });
          
          return { nodes };
        }
          
        default:
          throw new Error(`Unsupported import format: ${format}`);
      }
    } catch (error) {
      console.error('Import error:', error);
      return null;
    }
  }
}