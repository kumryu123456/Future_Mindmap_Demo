// Career API service layer for backend communication

import {
  CareerMap,
  CareerNode,
  NodeDetails,
  ReviewData,
  InfoData,
  UserProfile,
  GenerateCareerMapRequest,
  GenerateCareerMapResponse,
  UpdateNodeRequest,
  UpdateNodeResponse,
  FilterOptions,
  CareerListResponse,
  SimilarityScore
} from '../types/career';

// API Configuration - Simple fallback without environment variables for now
const API_BASE_URL = 'http://localhost:8000/api';
const SUPABASE_URL = '';
const SUPABASE_ANON_KEY = '';

// API Client Setup
class CareerApiClient {
  private baseURL: string;
  private headers: Record<string, string>;

  constructor() {
    this.baseURL = API_BASE_URL;
    this.headers = {
      'Content-Type': 'application/json',
    };
    
    // Add authorization header if available
    try {
      const token = typeof localStorage !== 'undefined' ? localStorage.getItem('auth_token') : null;
      if (token) {
        this.headers['Authorization'] = `Bearer ${token}`;
      }
    } catch (error) {
      // localStorage might not be available (SSR, etc.)
      console.warn('localStorage not available:', error);
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    // Get the latest token on each request
    const latestHeaders = { ...this.headers };
    try {
      const token = typeof localStorage !== 'undefined' ? localStorage.getItem('auth_token') : null;
      if (token) {
        latestHeaders['Authorization'] = `Bearer ${token}`;
      }
    } catch (error) {
      console.warn('localStorage not available:', error);
    }
    
    const config: RequestInit = {
      headers: latestHeaders,
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new CareerApiError(
          `API Error: ${response.status} ${response.statusText}`,
          response.status
        );
      }

      // Handle 204 No Content responses
      if (response.status === 204) {
        return {} as T;
      }

      // Check if response has content before parsing JSON
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        return data;
      } else {
        // For non-JSON responses, return empty object
        return {} as T;
      }
    } catch (error) {
      console.error('API Request failed:', error);
      
      // Re-throw CareerApiError as-is, wrap other errors
      if (error instanceof CareerApiError) {
        throw error;
      } else {
        throw new CareerApiError(
          `Request failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          undefined,
          error
        );
      }
    }
  }

  // Career Map Generation
  async generateCareerMap(request: GenerateCareerMapRequest): Promise<GenerateCareerMapResponse> {
    return this.request<GenerateCareerMapResponse>('/career/generate', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // Career Map Management
  async getCareerMap(id: string): Promise<CareerMap> {
    return this.request<CareerMap>(`/career/maps/${id}`);
  }

  async saveCareerMap(careerMap: Partial<CareerMap>): Promise<CareerMap> {
    if (careerMap.id) {
      return this.request<CareerMap>(`/career/maps/${careerMap.id}`, {
        method: 'PUT',
        body: JSON.stringify(careerMap),
      });
    } else {
      return this.request<CareerMap>('/career/maps', {
        method: 'POST',
        body: JSON.stringify(careerMap),
      });
    }
  }

  async deleteCareerMap(id: string): Promise<void> {
    await this.request(`/career/maps/${id}`, {
      method: 'DELETE',
    });
  }

  // Node Management
  async getNodeDetails(nodeId: string): Promise<NodeDetails> {
    return this.request<NodeDetails>(`/career/nodes/${nodeId}/details`);
  }

  async updateNode(request: UpdateNodeRequest): Promise<UpdateNodeResponse> {
    return this.request<UpdateNodeResponse>(`/career/nodes/${request.nodeId}`, {
      method: 'PUT',
      body: JSON.stringify(request),
    });
  }

  async deleteNode(nodeId: string): Promise<void> {
    await this.request(`/career/nodes/${nodeId}`, {
      method: 'DELETE',
    });
  }

  async addNode(careerMapId: string, node: Partial<CareerNode>): Promise<CareerNode> {
    return this.request<CareerNode>(`/career/maps/${careerMapId}/nodes`, {
      method: 'POST',
      body: JSON.stringify(node),
    });
  }

  // Information and Reviews
  async getNodeInfo(nodeId: string): Promise<InfoData> {
    return this.request<InfoData>(`/career/nodes/${nodeId}/info`);
  }

  async getNodeReviews(nodeId: string): Promise<ReviewData[]> {
    return this.request<ReviewData[]>(`/career/nodes/${nodeId}/reviews`);
  }

  async addReview(nodeId: string, review: Partial<ReviewData>): Promise<ReviewData> {
    return this.request<ReviewData>(`/career/nodes/${nodeId}/reviews`, {
      method: 'POST',
      body: JSON.stringify(review),
    });
  }

  async updateReview(reviewId: string, review: Partial<ReviewData>): Promise<ReviewData> {
    return this.request<ReviewData>(`/career/reviews/${reviewId}`, {
      method: 'PUT',
      body: JSON.stringify(review),
    });
  }

  async deleteReview(reviewId: string): Promise<void> {
    await this.request(`/career/reviews/${reviewId}`, {
      method: 'DELETE',
    });
  }

  // Career List and Search
  async getCareerList(filters?: FilterOptions): Promise<CareerListResponse> {
    const params = new URLSearchParams();
    
    if (filters) {
      if (filters.search) params.append('search', filters.search);
      if (filters.tags) params.append('tags', filters.tags.join(','));
      if (filters.difficulty) params.append('difficulty', filters.difficulty.join(','));
      if (filters.timeframe) params.append('timeframe', filters.timeframe.join(','));
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.offset) params.append('offset', filters.offset.toString());
    }

    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request<CareerListResponse>(`/career/browse${query}`);
  }

  async searchCareerMaps(query: string): Promise<CareerMap[]> {
    return this.request<CareerMap[]>(`/career/search?q=${encodeURIComponent(query)}`);
  }

  // Similarity and Recommendations
  async getSimilarCareerMaps(careerMapId: string): Promise<SimilarityScore[]> {
    return this.request<SimilarityScore[]>(`/career/maps/${careerMapId}/similar`);
  }

  async getRecommendedCareerMaps(userId?: string): Promise<CareerMap[]> {
    const endpoint = userId 
      ? `/career/recommendations?userId=${userId}`
      : '/career/recommendations';
    return this.request<CareerMap[]>(endpoint);
  }

  // User Management
  async getUserProfile(userId: string): Promise<UserProfile> {
    return this.request<UserProfile>(`/users/${userId}`);
  }

  async updateUserProfile(userId: string, profile: Partial<UserProfile>): Promise<UserProfile> {
    return this.request<UserProfile>(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(profile),
    });
  }

  async getUserCareerMaps(userId: string): Promise<CareerMap[]> {
    return this.request<CareerMap[]>(`/users/${userId}/career-maps`);
  }

  // Engagement
  async likeCareerMap(careerMapId: string): Promise<{ likes: number }> {
    return this.request<{ likes: number }>(`/career/maps/${careerMapId}/like`, {
      method: 'POST',
    });
  }

  async unlikeCareerMap(careerMapId: string): Promise<{ likes: number }> {
    return this.request<{ likes: number }>(`/career/maps/${careerMapId}/like`, {
      method: 'DELETE',
    });
  }

  async markReviewHelpful(reviewId: string): Promise<{ helpful: number }> {
    return this.request<{ helpful: number }>(`/career/reviews/${reviewId}/helpful`, {
      method: 'POST',
    });
  }
}

// Create singleton instance
export const careerApi = new CareerApiClient();

// Utility functions for local development and testing
export const mockData = {
  // Mock data for development when backend is not available
  generateMockCareerMap: (input: string): CareerMap => ({
    id: `mock-${Date.now()}`,
    userId: 'mock-user',
    title: `${input} 커리어 로드맵`,
    description: `AI가 생성한 ${input} 분야의 커리어 설계`,
    nodes: [
      {
        id: '1',
        type: 'center' as const,
        title: input,
        x: 400,
        y: 300,
        color: '#bfdbfe',
        connections: ['2', '3', '4'],
        level: 0
      },
      {
        id: '2',
        type: 'major' as const,
        title: '기초 역량 강화',
        x: 200,
        y: 200,
        color: '#3b82f6',
        connections: ['5'],
        level: 1
      },
      {
        id: '3',
        type: 'major' as const,
        title: '전문 기술 습득',
        x: 400,
        y: 150,
        color: '#3b82f6',
        connections: ['6'],
        level: 1
      },
      {
        id: '4',
        type: 'major' as const,
        title: '실무 경험 쌓기',
        x: 600,
        y: 200,
        color: '#3b82f6',
        connections: ['7'],
        level: 1
      },
      {
        id: '5',
        type: 'detail' as const,
        title: '기본 이론 학습',
        x: 200,
        y: 100,
        color: '#60a5fa',
        connections: ['8'],
        level: 2
      },
      {
        id: '6',
        type: 'detail' as const,
        title: '도구 및 프레임워크',
        x: 400,
        y: 50,
        color: '#60a5fa',
        connections: ['8'],
        level: 2
      },
      {
        id: '7',
        type: 'detail' as const,
        title: '프로젝트 참여',
        x: 600,
        y: 100,
        color: '#60a5fa',
        connections: ['8'],
        level: 2
      },
      {
        id: '8',
        type: 'goal' as const,
        title: '전문가 달성',
        x: 400,
        y: 500,
        color: '#1f2937',
        connections: [],
        level: 3
      }
    ],
    connections: [
      { id: 'c1', fromNodeId: '1', toNodeId: '2', type: 'sequential' },
      { id: 'c2', fromNodeId: '1', toNodeId: '3', type: 'sequential' },
      { id: 'c3', fromNodeId: '1', toNodeId: '4', type: 'sequential' },
      { id: 'c4', fromNodeId: '2', toNodeId: '5', type: 'sequential' },
      { id: 'c5', fromNodeId: '3', toNodeId: '6', type: 'sequential' },
      { id: 'c6', fromNodeId: '4', toNodeId: '7', type: 'sequential' },
      { id: 'c7', fromNodeId: '5', toNodeId: '8', type: 'sequential' },
      { id: 'c8', fromNodeId: '6', toNodeId: '8', type: 'sequential' },
      { id: 'c9', fromNodeId: '7', toNodeId: '8', type: 'sequential' }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isPublic: true,
    likes: 0,
    tags: [input.toLowerCase(), '초보자']
  }),

  generateMockCareerList: (count: number = 10): CareerMap[] => {
    const careers = ['데이터 분석가', '프론트엔드 개발자', 'UX 디자이너', '프로덕트 매니저', 'DevOps 엔지니어'];
    return Array.from({ length: count }, (_, i) => 
      mockData.generateMockCareerMap(careers[i % careers.length])
    );
  }
};

// Error handling utility
export class CareerApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'CareerApiError';
  }
}

export default careerApi;