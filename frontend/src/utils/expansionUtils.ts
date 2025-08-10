import type { 
  ExpandedContent, 
  ContentNode, 
  NodeRelationship,
  AutoExpandRequest
} from '../types/api';

/**
 * Content expansion utilities and helper functions
 */
export class ExpansionUtils {
  /**
   * Calculate expansion metrics and statistics
   */
  static calculateExpansionMetrics(content: ExpandedContent): {
    expansionRatio: number;
    depthIncrease: number;
    breadthIncrease: number;
    categoryDistribution: Record<string, number>;
    confidenceAverage: number;
    relevanceAverage: number;
  } {
    const originalCount = content.originalNodes.length;
    const expandedCount = content.expandedNodes.length;

    const expansionRatio = originalCount > 0 ? expandedCount / originalCount : 0;

    // Calculate depth and breadth increases
    const originalMaxLevel = Math.max(...content.originalNodes.map(n => n.level), 0);
    const expandedMaxLevel = Math.max(...content.expandedNodes.map(n => n.level), 0);
    const depthIncrease = expandedMaxLevel - originalMaxLevel;

    // Count nodes at each level for breadth calculation
    const levelCounts: Record<number, number> = {};
    [...content.originalNodes, ...content.expandedNodes].forEach(node => {
      levelCounts[node.level] = (levelCounts[node.level] || 0) + 1;
    });
    const maxNodesAtLevel = Math.max(...Object.values(levelCounts));
    const originalMaxAtLevel = Math.max(...content.originalNodes.map(n => 
      content.originalNodes.filter(on => on.level === n.level).length
    ));
    const breadthIncrease = maxNodesAtLevel - originalMaxAtLevel;

    // Category distribution
    const categoryDistribution: Record<string, number> = {};
    [...content.originalNodes, ...content.expandedNodes].forEach(node => {
      if (node.category) {
        categoryDistribution[node.category] = (categoryDistribution[node.category] || 0) + 1;
      }
    });

    // Average confidence and relevance
    const expandedWithMetrics = content.expandedNodes.filter(n => n.confidence !== undefined);
    const confidenceAverage = expandedWithMetrics.length > 0 
      ? expandedWithMetrics.reduce((sum, n) => sum + (n.confidence || 0), 0) / expandedWithMetrics.length 
      : 0;

    const relevantWithMetrics = content.expandedNodes.filter(n => n.relevance !== undefined);
    const relevanceAverage = relevantWithMetrics.length > 0
      ? relevantWithMetrics.reduce((sum, n) => sum + (n.relevance || 0), 0) / relevantWithMetrics.length
      : 0;

    return {
      expansionRatio,
      depthIncrease,
      breadthIncrease,
      categoryDistribution,
      confidenceAverage,
      relevanceAverage
    };
  }

  /**
   * Filter nodes by criteria
   */
  static filterNodes(
    nodes: ContentNode[],
    filters: {
      type?: ('original' | 'expanded' | 'related')[];
      category?: string[];
      priority?: ('low' | 'medium' | 'high' | 'critical')[];
      minConfidence?: number;
      minRelevance?: number;
      level?: number[];
      keywords?: string[];
      search?: string;
    }
  ): ContentNode[] {
    return nodes.filter(node => {
      // Type filter
      if (filters.type && !filters.type.includes(node.type)) {
        return false;
      }

      // Category filter
      if (filters.category && node.category && !filters.category.includes(node.category)) {
        return false;
      }

      // Priority filter
      if (filters.priority && node.priority && !filters.priority.includes(node.priority)) {
        return false;
      }

      // Confidence filter
      if (filters.minConfidence && (node.confidence || 0) < filters.minConfidence) {
        return false;
      }

      // Relevance filter
      if (filters.minRelevance && (node.relevance || 0) < filters.minRelevance) {
        return false;
      }

      // Level filter
      if (filters.level && !filters.level.includes(node.level)) {
        return false;
      }

      // Keywords filter
      if (filters.keywords && filters.keywords.length > 0) {
        const nodeKeywords = node.keywords || [];
        if (!filters.keywords.some(keyword => nodeKeywords.includes(keyword))) {
          return false;
        }
      }

      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesTitle = node.title.toLowerCase().includes(searchLower);
        const matchesDescription = node.description?.toLowerCase().includes(searchLower);
        const matchesKeywords = node.keywords?.some(keyword => 
          keyword.toLowerCase().includes(searchLower)
        );
        if (!matchesTitle && !matchesDescription && !matchesKeywords) {
          return false;
        }
      }

      return true;
    });
  }

  /**
   * Sort nodes by criteria
   */
  static sortNodes(
    nodes: ContentNode[],
    sortBy: 'title' | 'level' | 'confidence' | 'relevance' | 'priority' | 'type',
    sortOrder: 'asc' | 'desc' = 'asc'
  ): ContentNode[] {
    const priorityOrder = { low: 1, medium: 2, high: 3, critical: 4 };
    const typeOrder = { original: 1, expanded: 2, related: 3 };

    return [...nodes].sort((a, b) => {
      let valueA: string | number;
      let valueB: string | number;

      switch (sortBy) {
        case 'title':
          valueA = a.title.toLowerCase();
          valueB = b.title.toLowerCase();
          break;
        case 'level':
          valueA = a.level;
          valueB = b.level;
          break;
        case 'confidence':
          valueA = a.confidence || 0;
          valueB = b.confidence || 0;
          break;
        case 'relevance':
          valueA = a.relevance || 0;
          valueB = b.relevance || 0;
          break;
        case 'priority':
          valueA = priorityOrder[a.priority || 'low'];
          valueB = priorityOrder[b.priority || 'low'];
          break;
        case 'type':
          valueA = typeOrder[a.type];
          valueB = typeOrder[b.type];
          break;
        default:
          valueA = a.title.toLowerCase();
          valueB = b.title.toLowerCase();
      }

      if (valueA < valueB) return sortOrder === 'asc' ? -1 : 1;
      if (valueA > valueB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }

  /**
   * Group nodes by category or level
   */
  static groupNodes(
    nodes: ContentNode[],
    groupBy: 'category' | 'level' | 'type' | 'priority'
  ): Record<string, ContentNode[]> {
    const groups: Record<string, ContentNode[]> = {};

    nodes.forEach(node => {
      let groupKey: string;

      switch (groupBy) {
        case 'category':
          groupKey = node.category || 'uncategorized';
          break;
        case 'level':
          groupKey = `Level ${node.level}`;
          break;
        case 'type':
          groupKey = node.type;
          break;
        case 'priority':
          groupKey = node.priority || 'unspecified';
          break;
        default:
          groupKey = 'unknown';
      }

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(node);
    });

    return groups;
  }

  /**
   * Find node relationships and connections
   */
  static analyzeNodeRelationships(
    nodes: ContentNode[],
    relationships: NodeRelationship[]
  ): {
    strongConnections: NodeRelationship[];
    weekConnections: NodeRelationship[];
    isolatedNodes: ContentNode[];
    hubNodes: ContentNode[];
    clusters: ContentNode[][];
  } {
    // Strong vs weak connections based on strength threshold
    const strongConnections = relationships.filter(rel => rel.strength >= 0.7);
    const weekConnections = relationships.filter(rel => rel.strength < 0.7);

    // Find isolated nodes (no relationships)
    const connectedNodeIds = new Set([
      ...relationships.map(r => r.fromNodeId),
      ...relationships.map(r => r.toNodeId)
    ]);
    const isolatedNodes = nodes.filter(node => !connectedNodeIds.has(node.id));

    // Find hub nodes (highly connected)
    const connectionCounts: Record<string, number> = {};
    relationships.forEach(rel => {
      connectionCounts[rel.fromNodeId] = (connectionCounts[rel.fromNodeId] || 0) + 1;
      connectionCounts[rel.toNodeId] = (connectionCounts[rel.toNodeId] || 0) + 1;
    });

    const averageConnections = Object.values(connectionCounts).reduce((a, b) => a + b, 0) / 
                              Object.keys(connectionCounts).length || 0;
    const hubNodes = nodes.filter(node => 
      (connectionCounts[node.id] || 0) > averageConnections * 1.5
    );

    // Simple clustering based on strong connections
    const clusters: ContentNode[][] = [];
    const visited = new Set<string>();

    const findCluster = (nodeId: string): ContentNode[] => {
      if (visited.has(nodeId)) return [];
      
      visited.add(nodeId);
      const node = nodes.find(n => n.id === nodeId);
      if (!node) return [];
      
      const cluster = [node];
      const strongRels = strongConnections.filter(r => 
        r.fromNodeId === nodeId || r.toNodeId === nodeId
      );
      
      strongRels.forEach(rel => {
        const connectedId = rel.fromNodeId === nodeId ? rel.toNodeId : rel.fromNodeId;
        cluster.push(...findCluster(connectedId));
      });
      
      return cluster;
    };

    nodes.forEach(node => {
      if (!visited.has(node.id)) {
        const cluster = findCluster(node.id);
        if (cluster.length > 1) {
          clusters.push(cluster);
        }
      }
    });

    return {
      strongConnections,
      weekConnections,
      isolatedNodes,
      hubNodes,
      clusters
    };
  }

  /**
   * Evaluate expansion quality
   */
  static evaluateExpansionQuality(content: ExpandedContent): {
    overallScore: number;
    metrics: {
      completeness: number;
      relevance: number;
      diversity: number;
      depth: number;
      coherence: number;
    };
    recommendations: string[];
  } {
    const metrics = this.calculateExpansionMetrics(content);
    const relationshipAnalysis = this.analyzeNodeRelationships(
      [...content.originalNodes, ...content.expandedNodes],
      content.relationships
    );

    // Calculate individual metric scores (0-1)
    const completeness = Math.min(metrics.expansionRatio / 2, 1); // Target 2x expansion
    const relevance = metrics.relevanceAverage;
    const diversity = Math.min(Object.keys(metrics.categoryDistribution).length / 5, 1); // Target 5+ categories
    const depth = Math.min(metrics.depthIncrease / 3, 1); // Target 3+ level increase
    const coherence = Math.min(content.relationships.length / content.expandedNodes.length, 1); // Well-connected nodes

    const overallScore = (completeness + relevance + diversity + depth + coherence) / 5;

    // Generate recommendations
    const recommendations: string[] = [];
    if (completeness < 0.5) recommendations.push('Consider expanding more nodes for better coverage');
    if (relevance < 0.6) recommendations.push('Focus on more relevant connections and content');
    if (diversity < 0.6) recommendations.push('Add more diverse categories and topics');
    if (depth < 0.5) recommendations.push('Explore topics in greater depth');
    if (coherence < 0.5) recommendations.push('Strengthen relationships between nodes');
    if (relationshipAnalysis.isolatedNodes.length > content.expandedNodes.length * 0.3) {
      recommendations.push('Connect isolated nodes to the main structure');
    }

    return {
      overallScore,
      metrics: { completeness, relevance, diversity, depth, coherence },
      recommendations
    };
  }

  /**
   * Generate expansion summary
   */
  static generateExpansionSummary(content: ExpandedContent): {
    title: string;
    originalNodes: number;
    expandedNodes: number;
    totalNodes: number;
    expansionRatio: number;
    categories: number;
    relationships: number;
    qualityScore: number;
    topCategories: string[];
  } {
    const metrics = this.calculateExpansionMetrics(content);
    const quality = this.evaluateExpansionQuality(content);
    
    const topCategories = Object.entries(metrics.categoryDistribution)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([category]) => category);

    return {
      title: content.title,
      originalNodes: content.originalNodes.length,
      expandedNodes: content.expandedNodes.length,
      totalNodes: content.originalNodes.length + content.expandedNodes.length,
      expansionRatio: metrics.expansionRatio,
      categories: Object.keys(metrics.categoryDistribution).length,
      relationships: content.relationships.length,
      qualityScore: quality.overallScore,
      topCategories
    };
  }

  /**
   * Build auto-expand request with defaults
   */
  static buildExpandRequest(
    contentType: AutoExpandRequest['content']['type'],
    data: Record<string, unknown>,
    overrides: Partial<AutoExpandRequest> = {}
  ): AutoExpandRequest {
    return {
      content: {
        type: contentType,
        data,
        context: {
          domain: 'general',
          audience: 'general',
          purpose: 'exploration',
          ...overrides.content?.context
        }
      },
      expansionOptions: {
        direction: 'both',
        maxNodes: 20,
        levels: 3,
        categories: [],
        includeRelated: true,
        includeExamples: true,
        includeDetails: true,
        ...overrides.expansionOptions
      },
      preferences: {
        creativity: 'moderate',
        technicality: 'intermediate',
        priority: 'relevance',
        format: 'structured',
        ...overrides.preferences
      },
      constraints: {
        excludeTopics: [],
        focusAreas: [],
        maxDepth: 5,
        timeLimit: 30000,
        ...overrides.constraints
      }
    };
  }

  /**
   * Validate expansion request
   */
  static validateExpandRequest(request: Partial<AutoExpandRequest>): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required fields
    if (!request.content?.data) {
      errors.push('Content data is required');
    }

    if (!request.content?.type) {
      errors.push('Content type is required');
    }

    // Expansion options validation
    if (request.expansionOptions?.maxNodes && request.expansionOptions.maxNodes > 100) {
      warnings.push('Large number of nodes may impact performance');
    }

    if (request.expansionOptions?.levels && request.expansionOptions.levels > 10) {
      warnings.push('Deep expansion levels may reduce relevance');
    }

    // Constraints validation
    if (request.constraints?.timeLimit && request.constraints.timeLimit < 5000) {
      warnings.push('Short time limit may result in incomplete expansion');
    }

    if (request.constraints?.maxDepth && request.constraints.maxDepth > 10) {
      warnings.push('Very deep expansion may include less relevant content');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Convert expanded content to different formats
   */
  static convertExpandedContent(
    content: ExpandedContent,
    format: 'json' | 'markdown' | 'outline' | 'mindmap'
  ): string {
    switch (format) {
      case 'json':
        return JSON.stringify(content, null, 2);
      
      case 'markdown':
        return this.contentToMarkdown(content);
      
      case 'outline':
        return this.contentToOutline(content);
      
      case 'mindmap':
        return this.contentToMindmapFormat(content);
      
      default:
        return JSON.stringify(content, null, 2);
    }
  }

  /**
   * Convert content to Markdown format
   * @private
   */
  private static contentToMarkdown(content: ExpandedContent): string {
    let markdown = `# ${content.title}\n\n`;
    
    // Group nodes by level for hierarchical display
    const nodesByLevel = this.groupNodes([...content.originalNodes, ...content.expandedNodes], 'level');
    
    Object.entries(nodesByLevel)
      .sort(([a], [b]) => parseInt(a.split(' ')[1]) - parseInt(b.split(' ')[1]))
      .forEach(([level, nodes]) => {
        const levelNum = parseInt(level.split(' ')[1]);
        const hashes = '#'.repeat(Math.min(levelNum + 1, 6));
        
        markdown += `${hashes} ${level}\n\n`;
        
        nodes.forEach(node => {
          markdown += `- **${node.title}** (${node.type})`;
          if (node.description) {
            markdown += `: ${node.description}`;
          }
          markdown += '\n';
        });
        
        markdown += '\n';
      });

    return markdown;
  }

  /**
   * Convert content to outline format
   * @private
   */
  private static contentToOutline(content: ExpandedContent): string {
    let outline = `${content.title}\n`;
    
    const buildHierarchy = (parentId?: string, level: number = 0): string => {
      const children = [...content.originalNodes, ...content.expandedNodes]
        .filter(node => node.parentId === parentId)
        .sort((a, b) => a.title.localeCompare(b.title));
      
      let result = '';
      children.forEach(node => {
        const indent = '  '.repeat(level);
        result += `${indent}- ${node.title}\n`;
        result += buildHierarchy(node.id, level + 1);
      });
      
      return result;
    };

    outline += buildHierarchy();
    return outline;
  }

  /**
   * Convert content to mindmap format
   * @private
   */
  private static contentToMindmapFormat(content: ExpandedContent): string {
    const nodes = [...content.originalNodes, ...content.expandedNodes];
    const mindmapData = {
      title: content.title,
      nodes: nodes.map(node => ({
        id: node.id,
        title: node.title,
        description: node.description,
        level: node.level,
        parentId: node.parentId,
        category: node.category,
        type: node.type
      })),
      relationships: content.relationships,
      categories: content.categories
    };

    return JSON.stringify(mindmapData, null, 2);
  }
}