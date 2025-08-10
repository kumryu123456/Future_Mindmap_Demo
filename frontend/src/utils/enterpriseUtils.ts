import type { 
  EnterpriseItem, 
  EnterpriseOrganization, 
  EnterpriseDataRequest 
} from '../types/api';

/**
 * Enterprise data utilities and helper functions
 */
export class EnterpriseUtils {
  /**
   * Validate organization ID format
   */
  static validateOrganizationId(orgId: string): boolean {
    // Organization ID should be alphanumeric with optional hyphens
    const orgIdPattern = /^[a-zA-Z0-9-]+$/;
    return Boolean(orgId && orgId.length >= 3 && orgIdPattern.test(orgId));
  }

  /**
   * Generate date range for common periods
   */
  static getDateRange(period: 'today' | 'week' | 'month' | 'quarter' | 'year'): {
    startDate: string;
    endDate: string;
  } {
    const now = new Date();
    const endDate = now.toISOString().split('T')[0];
    let startDate: Date;

    switch (period) {
      case 'today':
        startDate = new Date(now);
        break;
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        startDate = new Date(now);
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
    }

    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate
    };
  }

  /**
   * Filter enterprise items by criteria
   */
  static filterItems(
    items: EnterpriseItem[],
    filters: {
      search?: string;
      tags?: string[];
      status?: string;
      createdBy?: string;
      dateRange?: { startDate: string; endDate: string };
    }
  ): EnterpriseItem[] {
    return items.filter(item => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(searchLower);
        const matchesTags = item.tags?.some(tag => 
          tag.toLowerCase().includes(searchLower)
        );
        if (!matchesName && !matchesTags) return false;
      }

      // Tags filter
      if (filters.tags && filters.tags.length > 0) {
        if (!item.tags || !filters.tags.some(tag => item.tags!.includes(tag))) {
          return false;
        }
      }

      // Status filter
      if (filters.status && item.status !== filters.status) {
        return false;
      }

      // Creator filter
      if (filters.createdBy && item.createdBy !== filters.createdBy) {
        return false;
      }

      // Date range filter
      if (filters.dateRange) {
        const itemDate = new Date(item.createdAt);
        const startDate = new Date(filters.dateRange.startDate);
        const endDate = new Date(filters.dateRange.endDate);
        if (itemDate < startDate || itemDate > endDate) {
          return false;
        }
      }

      return true;
    });
  }

  /**
   * Sort enterprise items
   */
  static sortItems(
    items: EnterpriseItem[],
    sortBy: 'name' | 'createdAt' | 'updatedAt' | 'usage',
    sortOrder: 'asc' | 'desc' = 'desc'
  ): EnterpriseItem[] {
    return [...items].sort((a, b) => {
      let valueA: string | number;
      let valueB: string | number;

      switch (sortBy) {
        case 'name':
          valueA = a.name.toLowerCase();
          valueB = b.name.toLowerCase();
          break;
        case 'createdAt':
          valueA = new Date(a.createdAt).getTime();
          valueB = new Date(b.createdAt).getTime();
          break;
        case 'updatedAt':
          valueA = new Date(a.updatedAt).getTime();
          valueB = new Date(b.updatedAt).getTime();
          break;
        case 'usage':
          valueA = a.analytics?.viewCount || 0;
          valueB = b.analytics?.viewCount || 0;
          break;
        default:
          valueA = new Date(a.updatedAt).getTime();
          valueB = new Date(b.updatedAt).getTime();
      }

      if (valueA < valueB) return sortOrder === 'asc' ? -1 : 1;
      if (valueA > valueB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }

  /**
   * Group items by a specific field
   */
  static groupItemsBy(
    items: EnterpriseItem[],
    groupBy: 'status' | 'type' | 'createdBy' | 'month'
  ): Record<string, EnterpriseItem[]> {
    const groups: Record<string, EnterpriseItem[]> = {};

    items.forEach(item => {
      let groupKey: string;

      switch (groupBy) {
        case 'status':
          groupKey = item.status;
          break;
        case 'type':
          groupKey = item.type;
          break;
        case 'createdBy':
          groupKey = item.createdBy;
          break;
        case 'month':
          groupKey = new Date(item.createdAt).toISOString().substring(0, 7);
          break;
        default:
          groupKey = 'unknown';
      }

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(item);
    });

    return groups;
  }

  /**
   * Calculate enterprise analytics summary
   */
  static calculateAnalyticsSummary(items: EnterpriseItem[]): {
    totalItems: number;
    totalViews: number;
    totalEdits: number;
    uniqueCollaborators: number;
    averageViews: number;
    mostPopular: EnterpriseItem | null;
    recentlyUpdated: EnterpriseItem[];
  } {
    const totalItems = items.length;
    let totalViews = 0;
    let totalEdits = 0;
    const collaborators = new Set<string>();

    let mostPopular: EnterpriseItem | null = null;
    let maxViews = 0;

    items.forEach(item => {
      const views = item.analytics?.viewCount || 0;
      const edits = item.analytics?.editCount || 0;

      totalViews += views;
      totalEdits += edits;

      if (views > maxViews) {
        maxViews = views;
        mostPopular = item;
      }

      collaborators.add(item.createdBy);
    });

    const recentlyUpdated = items
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5);

    return {
      totalItems,
      totalViews,
      totalEdits,
      uniqueCollaborators: collaborators.size,
      averageViews: totalItems > 0 ? Math.round(totalViews / totalItems) : 0,
      mostPopular,
      recentlyUpdated
    };
  }

  /**
   * Build enterprise request with common defaults
   */
  static buildEnterpriseRequest(
    organizationId: string,
    dataType: EnterpriseDataRequest['dataType'],
    overrides: Partial<EnterpriseDataRequest> = {}
  ): EnterpriseDataRequest {
    return {
      organizationId,
      dataType,
      filters: {
        status: 'active',
        ...overrides.filters
      },
      options: {
        includeMetadata: true,
        includeShared: true,
        pagination: {
          page: 1,
          limit: 50
        },
        sortBy: 'updatedAt',
        sortOrder: 'desc',
        ...overrides.options
      },
      ...overrides
    };
  }

  /**
   * Validate enterprise organization data
   */
  static validateOrganization(org: Partial<EnterpriseOrganization>): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!org.id || !this.validateOrganizationId(org.id)) {
      errors.push('Invalid organization ID');
    }

    if (!org.name || org.name.trim().length < 2) {
      errors.push('Organization name must be at least 2 characters');
    }

    if (!org.plan || !['starter', 'professional', 'enterprise'].includes(org.plan)) {
      errors.push('Invalid organization plan');
    }

    if (!org.limits) {
      errors.push('Organization limits are required');
    } else {
      if (!org.limits.maxUsers || org.limits.maxUsers < 1) {
        errors.push('Max users must be at least 1');
      }
      if (!org.limits.maxProjects || org.limits.maxProjects < 1) {
        errors.push('Max projects must be at least 1');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}