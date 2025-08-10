import type { 
  DetailedResponse, 
  RetrievedSource,
  RAGDetailRequest
} from '../types/api';

/**
 * RAG (Retrieval-Augmented Generation) utilities and helper functions
 */
export class RAGUtils {
  /**
   * Calculate RAG response quality metrics
   */
  static calculateQualityMetrics(response: DetailedResponse, sources: RetrievedSource[]): {
    overallQuality: number;
    metrics: {
      sourceReliability: number;
      contentCoverage: number;
      responseCoherence: number;
      citationAccuracy: number;
      informationRecency: number;
    };
    recommendations: string[];
  } {
    // Source reliability (average authority score)
    const sourceReliability = sources.length > 0 
      ? sources.reduce((sum, s) => sum + s.authorityScore, 0) / sources.length 
      : 0;

    // Content coverage (sections with sources / total sections)
    const sectionsWithSources = response.sections.filter(s => s.sources.length > 0).length;
    const contentCoverage = response.sections.length > 0 
      ? sectionsWithSources / response.sections.length 
      : 0;

    // Response coherence (average section confidence)
    const responseCoherence = response.sections.length > 0
      ? response.sections.reduce((sum, s) => sum + s.confidence, 0) / response.sections.length
      : 0;

    // Citation accuracy (sources with citations / total sources)
    const sourcesWithCitations = sources.filter(s => s.citations && s.citations.length > 0).length;
    const citationAccuracy = sources.length > 0 
      ? sourcesWithCitations / sources.length 
      : 0;

    // Information recency (average recency score)
    const informationRecency = sources.length > 0
      ? sources.reduce((sum, s) => sum + s.recencyScore, 0) / sources.length
      : 0;

    const overallQuality = (
      sourceReliability + 
      contentCoverage + 
      responseCoherence + 
      citationAccuracy + 
      informationRecency
    ) / 5;

    // Generate recommendations
    const recommendations: string[] = [];
    if (sourceReliability < 0.7) recommendations.push('Consider using more authoritative sources');
    if (contentCoverage < 0.8) recommendations.push('Add more sources to support all sections');
    if (responseCoherence < 0.7) recommendations.push('Improve section coherence and clarity');
    if (citationAccuracy < 0.6) recommendations.push('Add more precise citations');
    if (informationRecency < 0.5) recommendations.push('Include more recent sources');

    return {
      overallQuality,
      metrics: {
        sourceReliability,
        contentCoverage,
        responseCoherence,
        citationAccuracy,
        informationRecency
      },
      recommendations
    };
  }

  /**
   * Filter sources by criteria
   */
  static filterSources(
    sources: RetrievedSource[],
    filters: {
      minRelevance?: number;
      minAuthority?: number;
      sourceTypes?: string[];
      domains?: string[];
      languages?: string[];
      dateRange?: { startDate: string; endDate: string };
      quality?: ('high' | 'medium' | 'low')[];
    }
  ): RetrievedSource[] {
    return sources.filter(source => {
      // Relevance filter
      if (filters.minRelevance && source.relevanceScore < filters.minRelevance) {
        return false;
      }

      // Authority filter
      if (filters.minAuthority && source.authorityScore < filters.minAuthority) {
        return false;
      }

      // Source type filter
      if (filters.sourceTypes && !filters.sourceTypes.includes(source.type)) {
        return false;
      }

      // Domain filter
      if (filters.domains && source.domain && !filters.domains.includes(source.domain)) {
        return false;
      }

      // Language filter
      if (filters.languages && source.metadata?.language && 
          !filters.languages.includes(source.metadata.language)) {
        return false;
      }

      // Date range filter
      if (filters.dateRange && source.publishDate) {
        const publishDate = new Date(source.publishDate);
        const startDate = new Date(filters.dateRange.startDate);
        const endDate = new Date(filters.dateRange.endDate);
        if (publishDate < startDate || publishDate > endDate) {
          return false;
        }
      }

      // Quality filter
      if (filters.quality && source.metadata?.sourceQuality && 
          !filters.quality.includes(source.metadata.sourceQuality)) {
        return false;
      }

      return true;
    });
  }

  /**
   * Sort sources by criteria
   */
  static sortSources(
    sources: RetrievedSource[],
    sortBy: 'relevance' | 'authority' | 'recency' | 'title' | 'date',
    sortOrder: 'asc' | 'desc' = 'desc'
  ): RetrievedSource[] {
    return [...sources].sort((a, b) => {
      let valueA: string | number;
      let valueB: string | number;

      switch (sortBy) {
        case 'relevance':
          valueA = a.relevanceScore;
          valueB = b.relevanceScore;
          break;
        case 'authority':
          valueA = a.authorityScore;
          valueB = b.authorityScore;
          break;
        case 'recency':
          valueA = a.recencyScore;
          valueB = b.recencyScore;
          break;
        case 'title':
          valueA = a.title.toLowerCase();
          valueB = b.title.toLowerCase();
          break;
        case 'date':
          valueA = new Date(a.publishDate || '1970-01-01').getTime();
          valueB = new Date(b.publishDate || '1970-01-01').getTime();
          break;
        default:
          valueA = a.relevanceScore;
          valueB = b.relevanceScore;
      }

      if (valueA < valueB) return sortOrder === 'asc' ? -1 : 1;
      if (valueA > valueB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }

  /**
   * Group sources by category
   */
  static groupSources(
    sources: RetrievedSource[],
    groupBy: 'type' | 'domain' | 'quality' | 'language' | 'author'
  ): Record<string, RetrievedSource[]> {
    const groups: Record<string, RetrievedSource[]> = {};

    sources.forEach(source => {
      let groupKey: string;

      switch (groupBy) {
        case 'type':
          groupKey = source.type;
          break;
        case 'domain':
          groupKey = source.domain || 'unknown';
          break;
        case 'quality':
          groupKey = source.metadata?.sourceQuality || 'unrated';
          break;
        case 'language':
          groupKey = source.metadata?.language || 'unknown';
          break;
        case 'author':
          groupKey = source.author || 'unknown';
          break;
        default:
          groupKey = 'unknown';
      }

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(source);
    });

    return groups;
  }

  /**
   * Extract key insights from RAG response
   */
  static extractInsights(response: DetailedResponse): {
    mainThemes: string[];
    evidenceStrength: 'weak' | 'moderate' | 'strong';
    consensusLevel: 'low' | 'medium' | 'high';
    knowledgeGaps: string[];
    actionableItems: string[];
  } {
    // Extract main themes from key points and section titles
    const mainThemes = [
      ...response.keyPoints.slice(0, 3),
      ...response.sections.map(s => s.title).slice(0, 3)
    ].filter((theme, index, arr) => arr.indexOf(theme) === index);

    // Assess evidence strength based on section confidence
    const avgConfidence = response.sections.reduce((sum, s) => sum + s.confidence, 0) / 
                         response.sections.length;
    const evidenceStrength: 'weak' | 'moderate' | 'strong' = 
      avgConfidence >= 0.8 ? 'strong' : avgConfidence >= 0.6 ? 'moderate' : 'weak';

    // Determine consensus level based on contradictions
    const consensusLevel: 'low' | 'medium' | 'high' = 
      (response.analysis?.contradictions?.length || 0) > 2 ? 'low' :
      (response.analysis?.contradictions?.length || 0) > 0 ? 'medium' : 'high';

    // Extract knowledge gaps
    const knowledgeGaps = response.analysis?.gaps || [];

    // Extract actionable items from recommendations
    const actionableItems = response.recommendations || [];

    return {
      mainThemes,
      evidenceStrength,
      consensusLevel,
      knowledgeGaps,
      actionableItems
    };
  }

  /**
   * Generate citation bibliography
   */
  static generateBibliography(
    sources: RetrievedSource[],
    citationStyle: 'apa' | 'mla' | 'chicago' | 'harvard' | 'ieee' = 'apa'
  ): string[] {
    return sources.map(source => {
      switch (citationStyle) {
        case 'apa':
          return this.generateAPACitation(source);
        case 'mla':
          return this.generateMLACitation(source);
        case 'chicago':
          return this.generateChicagoCitation(source);
        case 'harvard':
          return this.generateHarvardCitation(source);
        case 'ieee':
          return this.generateIEEECitation(source);
        default:
          return this.generateAPACitation(source);
      }
    });
  }

  /**
   * Analyze source diversity
   */
  static analyzeSourceDiversity(sources: RetrievedSource[]): {
    typeDistribution: Record<string, number>;
    domainDistribution: Record<string, number>;
    authorDistribution: Record<string, number>;
    languageDistribution: Record<string, number>;
    diversityScore: number;
  } {
    const typeDistribution = this.getDistribution(sources, s => s.type);
    const domainDistribution = this.getDistribution(sources, s => s.domain || 'unknown');
    const authorDistribution = this.getDistribution(sources, s => s.author || 'unknown');
    const languageDistribution = this.getDistribution(sources, s => s.metadata?.language || 'unknown');

    // Calculate diversity score (higher is more diverse)
    const typeEntropy = this.calculateEntropy(Object.values(typeDistribution));
    const domainEntropy = this.calculateEntropy(Object.values(domainDistribution));
    const authorEntropy = this.calculateEntropy(Object.values(authorDistribution));
    
    const diversityScore = (typeEntropy + domainEntropy + authorEntropy) / 3;

    return {
      typeDistribution,
      domainDistribution,
      authorDistribution,
      languageDistribution,
      diversityScore
    };
  }

  /**
   * Build RAG request with defaults
   */
  static buildRAGRequest(
    query: string,
    intent: 'research' | 'explanation' | 'analysis' | 'comparison' | 'summary' = 'explanation',
    overrides: Partial<RAGDetailRequest> = {}
  ): RAGDetailRequest {
    return {
      query: {
        text: query,
        context: {
          domain: 'general',
          scope: 'broad' as const,
          intent,
          ...overrides.query?.context
        }
      },
      retrievalOptions: {
        sources: ['documents', 'web', 'knowledge_base'],
        maxSources: 10,
        relevanceThreshold: 0.7,
        recency: 'any',
        languages: ['en'],
        includeMetadata: true,
        ...overrides.retrievalOptions
      },
      generationOptions: {
        detailLevel: 'standard',
        perspective: 'neutral',
        format: 'structured',
        includeReferences: true,
        includeCitations: true,
        includeRelated: true,
        ...overrides.generationOptions
      },
      filters: {
        authorityLevel: 'any',
        contentTypes: [],
        excludeDomains: [],
        includeDomains: [],
        ...overrides.filters
      }
    };
  }

  /**
   * Validate RAG request
   */
  static validateRAGRequest(request: Partial<RAGDetailRequest>): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required fields
    if (!request.query?.text) {
      errors.push('Query text is required');
    }

    // Retrieval options validation
    if (request.retrievalOptions?.maxSources && request.retrievalOptions.maxSources > 50) {
      warnings.push('Large number of sources may impact performance');
    }

    if (request.retrievalOptions?.relevanceThreshold && 
        request.retrievalOptions.relevanceThreshold < 0.5) {
      warnings.push('Low relevance threshold may include less relevant sources');
    }

    // Generation options validation
    if (request.generationOptions?.detailLevel === 'exhaustive') {
      warnings.push('Exhaustive detail level may result in very long responses');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  // Private helper methods
  private static generateAPACitation(source: RetrievedSource): string {
    const author = source.author || 'Unknown Author';
    const year = source.publishDate ? new Date(source.publishDate).getFullYear() : 'n.d.';
    const title = source.title;
    const url = source.url;
    
    return `${author} (${year}). ${title}. ${url ? `Retrieved from ${url}` : 'No URL available'}.`;
  }

  private static generateMLACitation(source: RetrievedSource): string {
    const author = source.author || 'Unknown Author';
    const title = `"${source.title}"`;
    const date = source.publishDate ? new Date(source.publishDate).toLocaleDateString() : 'No Date';
    const url = source.url;
    
    return `${author}. ${title} ${date}. Web. ${url || 'No URL'}.`;
  }

  private static generateChicagoCitation(source: RetrievedSource): string {
    const author = source.author || 'Unknown Author';
    const title = `"${source.title}"`;
    const url = source.url;
    const accessDate = new Date().toLocaleDateString();
    
    return `${author}. ${title} Accessed ${accessDate}. ${url || 'No URL'}.`;
  }

  private static generateHarvardCitation(source: RetrievedSource): string {
    const author = source.author || 'Unknown Author';
    const year = source.publishDate ? new Date(source.publishDate).getFullYear() : 'n.d.';
    const title = source.title;
    const url = source.url;
    
    return `${author} ${year}, '${title}', viewed ${new Date().toLocaleDateString()}, <${url || 'No URL'}>.`;
  }

  private static generateIEEECitation(source: RetrievedSource): string {
    const author = source.author || 'Unknown Author';
    const title = `"${source.title}"`;
    const url = source.url;
    
    return `${author}, ${title} [Online]. Available: ${url || 'No URL'}`;
  }

  private static getDistribution<T>(
    items: T[], 
    keySelector: (item: T) => string
  ): Record<string, number> {
    const distribution: Record<string, number> = {};
    items.forEach(item => {
      const key = keySelector(item);
      distribution[key] = (distribution[key] || 0) + 1;
    });
    return distribution;
  }

  private static calculateEntropy(values: number[]): number {
    const total = values.reduce((sum, val) => sum + val, 0);
    if (total === 0) return 0;
    
    return -values.reduce((entropy, val) => {
      if (val === 0) return entropy;
      const probability = val / total;
      return entropy + probability * Math.log2(probability);
    }, 0);
  }
}