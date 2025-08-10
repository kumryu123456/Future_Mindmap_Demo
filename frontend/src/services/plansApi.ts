import type { 
  Plan, 
  PlanPhase, 
  PlanTask, 
  PlanMilestone, 
  PlanTemplate,
  PlansStoreState
} from '../types/plans';

/**
 * Plans API service for backend integration
 * Following patterns from existing API services in the codebase
 */

// Base API configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
const API_TIMEOUT = 30000; // 30 seconds

// API endpoints
const ENDPOINTS = {
  plans: '/plans',
  phases: '/phases',
  tasks: '/tasks',
  milestones: '/milestones',
  templates: '/templates',
  users: '/users',
  upload: '/upload',
  export: '/export',
  import: '/import'
} as const;

// Request types
interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
  metadata?: {
    total?: number;
    page?: number;
    limit?: number;
    hasMore?: boolean;
  };
}

interface ApiError {
  message: string;
  code: string;
  statusCode: number;
  details?: any;
}

// Request configuration
interface RequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  retries?: number;
}

/**
 * Plans API client class
 */
export class PlansApi {
  private static baseHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };

  private static authToken: string | null = null;

  /**
   * Set authentication token
   */
  static setAuthToken(token: string) {
    this.authToken = token;
  }

  /**
   * Clear authentication token
   */
  static clearAuthToken() {
    this.authToken = null;
  }

  /**
   * Get authentication headers
   */
  private static getAuthHeaders(): Record<string, string> {
    const headers = { ...this.baseHeaders };
    if (this.authToken) {
      headers.Authorization = `Bearer ${this.authToken}`;
    }
    return headers;
  }

  /**
   * Make HTTP request with retry logic and error handling
   */
  private static async makeRequest<T>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const {
      method = 'GET',
      headers = {},
      body,
      timeout = API_TIMEOUT,
      retries = 3
    } = config;

    const url = `${API_BASE_URL}${endpoint}`;
    const requestHeaders = { ...this.getAuthHeaders(), ...headers };

    const requestConfig: RequestInit = {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(timeout)
    };

    let lastError: Error;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await fetch(url, requestConfig);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message || 
            errorData.error || 
            `HTTP ${response.status}: ${response.statusText}`
          );
        }

        const data = await response.json();
        return data;
      } catch (error) {
        lastError = error as Error;
        
        // Don't retry on client errors (4xx) or authentication errors
        if (error instanceof Error && 
            (error.message.includes('40') || error.message.includes('401') || error.message.includes('403'))) {
          break;
        }

        if (attempt < retries) {
          // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
      }
    }

    throw lastError!;
  }

  // Plan CRUD operations
  /**
   * Get all plans with optional filters and pagination
   */
  static async getPlans(params?: {
    page?: number;
    limit?: number;
    type?: string;
    status?: string;
    priority?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<ApiResponse<Plan[]>> {
    const query = params ? '?' + new URLSearchParams(
      Object.entries(params)
        .filter(([_, value]) => value != null)
        .map(([key, value]) => [key, String(value)])
    ).toString() : '';

    return this.makeRequest<Plan[]>(`${ENDPOINTS.plans}${query}`);
  }

  /**
   * Get plan by ID
   */
  static async getPlan(id: string): Promise<ApiResponse<Plan>> {
    return this.makeRequest<Plan>(`${ENDPOINTS.plans}/${id}`);
  }

  /**
   * Create new plan
   */
  static async createPlan(plan: Omit<Plan, 'id' | 'metadata'>): Promise<ApiResponse<Plan>> {
    return this.makeRequest<Plan>(ENDPOINTS.plans, {
      method: 'POST',
      body: plan
    });
  }

  /**
   * Update existing plan
   */
  static async updatePlan(id: string, updates: Partial<Plan>): Promise<ApiResponse<Plan>> {
    return this.makeRequest<Plan>(`${ENDPOINTS.plans}/${id}`, {
      method: 'PUT',
      body: updates
    });
  }

  /**
   * Delete plan
   */
  static async deletePlan(id: string): Promise<ApiResponse<void>> {
    return this.makeRequest<void>(`${ENDPOINTS.plans}/${id}`, {
      method: 'DELETE'
    });
  }

  /**
   * Duplicate plan
   */
  static async duplicatePlan(id: string, name?: string): Promise<ApiResponse<Plan>> {
    return this.makeRequest<Plan>(`${ENDPOINTS.plans}/${id}/duplicate`, {
      method: 'POST',
      body: { name }
    });
  }

  // Phase operations
  /**
   * Create new phase
   */
  static async createPhase(planId: string, phase: Omit<PlanPhase, 'id' | 'metadata'>): Promise<ApiResponse<PlanPhase>> {
    return this.makeRequest<PlanPhase>(`${ENDPOINTS.plans}/${planId}/phases`, {
      method: 'POST',
      body: phase
    });
  }

  /**
   * Update phase
   */
  static async updatePhase(planId: string, phaseId: string, updates: Partial<PlanPhase>): Promise<ApiResponse<PlanPhase>> {
    return this.makeRequest<PlanPhase>(`${ENDPOINTS.plans}/${planId}/phases/${phaseId}`, {
      method: 'PUT',
      body: updates
    });
  }

  /**
   * Delete phase
   */
  static async deletePhase(planId: string, phaseId: string): Promise<ApiResponse<void>> {
    return this.makeRequest<void>(`${ENDPOINTS.plans}/${planId}/phases/${phaseId}`, {
      method: 'DELETE'
    });
  }

  /**
   * Reorder phases
   */
  static async reorderPhases(planId: string, phaseIds: string[]): Promise<ApiResponse<Plan>> {
    return this.makeRequest<Plan>(`${ENDPOINTS.plans}/${planId}/phases/reorder`, {
      method: 'PUT',
      body: { phaseIds }
    });
  }

  // Task operations
  /**
   * Create new task
   */
  static async createTask(planId: string, phaseId: string, task: Omit<PlanTask, 'id' | 'metadata'>): Promise<ApiResponse<PlanTask>> {
    return this.makeRequest<PlanTask>(`${ENDPOINTS.plans}/${planId}/phases/${phaseId}/tasks`, {
      method: 'POST',
      body: task
    });
  }

  /**
   * Update task
   */
  static async updateTask(planId: string, taskId: string, updates: Partial<PlanTask>): Promise<ApiResponse<PlanTask>> {
    return this.makeRequest<PlanTask>(`${ENDPOINTS.plans}/${planId}/tasks/${taskId}`, {
      method: 'PUT',
      body: updates
    });
  }

  /**
   * Delete task
   */
  static async deleteTask(planId: string, taskId: string): Promise<ApiResponse<void>> {
    return this.makeRequest<void>(`${ENDPOINTS.plans}/${planId}/tasks/${taskId}`, {
      method: 'DELETE'
    });
  }

  /**
   * Move task to different phase
   */
  static async moveTask(planId: string, taskId: string, targetPhaseId: string): Promise<ApiResponse<PlanTask>> {
    return this.makeRequest<PlanTask>(`${ENDPOINTS.plans}/${planId}/tasks/${taskId}/move`, {
      method: 'PUT',
      body: { targetPhaseId }
    });
  }

  /**
   * Assign task to user
   */
  static async assignTask(planId: string, taskId: string, userId: string): Promise<ApiResponse<PlanTask>> {
    return this.makeRequest<PlanTask>(`${ENDPOINTS.plans}/${planId}/tasks/${taskId}/assign`, {
      method: 'PUT',
      body: { userId }
    });
  }

  /**
   * Update task status
   */
  static async updateTaskStatus(planId: string, taskId: string, status: PlanTask['status']): Promise<ApiResponse<PlanTask>> {
    return this.makeRequest<PlanTask>(`${ENDPOINTS.plans}/${planId}/tasks/${taskId}/status`, {
      method: 'PUT',
      body: { status }
    });
  }

  /**
   * Add task comment
   */
  static async addTaskComment(planId: string, taskId: string, comment: string): Promise<ApiResponse<PlanTask>> {
    return this.makeRequest<PlanTask>(`${ENDPOINTS.plans}/${planId}/tasks/${taskId}/comments`, {
      method: 'POST',
      body: { content: comment }
    });
  }

  /**
   * Log time entry
   */
  static async logTimeEntry(planId: string, taskId: string, timeEntry: {
    hours: number;
    date: string;
    description?: string;
    billable?: boolean;
  }): Promise<ApiResponse<PlanTask>> {
    return this.makeRequest<PlanTask>(`${ENDPOINTS.plans}/${planId}/tasks/${taskId}/time`, {
      method: 'POST',
      body: timeEntry
    });
  }

  // Milestone operations
  /**
   * Create milestone
   */
  static async createMilestone(planId: string, phaseId: string, milestone: Omit<PlanMilestone, 'id' | 'metadata'>): Promise<ApiResponse<PlanMilestone>> {
    return this.makeRequest<PlanMilestone>(`${ENDPOINTS.plans}/${planId}/phases/${phaseId}/milestones`, {
      method: 'POST',
      body: milestone
    });
  }

  /**
   * Update milestone
   */
  static async updateMilestone(planId: string, milestoneId: string, updates: Partial<PlanMilestone>): Promise<ApiResponse<PlanMilestone>> {
    return this.makeRequest<PlanMilestone>(`${ENDPOINTS.plans}/${planId}/milestones/${milestoneId}`, {
      method: 'PUT',
      body: updates
    });
  }

  /**
   * Delete milestone
   */
  static async deleteMilestone(planId: string, milestoneId: string): Promise<ApiResponse<void>> {
    return this.makeRequest<void>(`${ENDPOINTS.plans}/${planId}/milestones/${milestoneId}`, {
      method: 'DELETE'
    });
  }

  /**
   * Mark milestone as completed
   */
  static async completeMilestone(planId: string, milestoneId: string): Promise<ApiResponse<PlanMilestone>> {
    return this.makeRequest<PlanMilestone>(`${ENDPOINTS.plans}/${planId}/milestones/${milestoneId}/complete`, {
      method: 'PUT'
    });
  }

  // Template operations
  /**
   * Get plan templates
   */
  static async getTemplates(): Promise<ApiResponse<PlanTemplate[]>> {
    return this.makeRequest<PlanTemplate[]>(ENDPOINTS.templates);
  }

  /**
   * Get template by ID
   */
  static async getTemplate(id: string): Promise<ApiResponse<PlanTemplate>> {
    return this.makeRequest<PlanTemplate>(`${ENDPOINTS.templates}/${id}`);
  }

  /**
   * Create plan from template
   */
  static async createPlanFromTemplate(templateId: string, planData: {
    name: string;
    description?: string;
    startDate?: string;
  }): Promise<ApiResponse<Plan>> {
    return this.makeRequest<Plan>(`${ENDPOINTS.templates}/${templateId}/create-plan`, {
      method: 'POST',
      body: planData
    });
  }

  /**
   * Save plan as template
   */
  static async saveAsTemplate(planId: string, templateData: {
    name: string;
    description: string;
    category: string;
    isPublic: boolean;
  }): Promise<ApiResponse<PlanTemplate>> {
    return this.makeRequest<PlanTemplate>(`${ENDPOINTS.plans}/${planId}/save-as-template`, {
      method: 'POST',
      body: templateData
    });
  }

  // Import/Export operations
  /**
   * Export plan
   */
  static async exportPlan(planId: string, format: 'json' | 'csv' | 'pdf' | 'xlsx' | 'mpp'): Promise<ApiResponse<{ downloadUrl: string }>> {
    return this.makeRequest<{ downloadUrl: string }>(`${ENDPOINTS.export}/${planId}`, {
      method: 'POST',
      body: { format }
    });
  }

  /**
   * Import plan
   */
  static async importPlan(file: File, format: 'json' | 'csv' | 'xml'): Promise<ApiResponse<Plan>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('format', format);

    return this.makeRequest<Plan>(ENDPOINTS.import, {
      method: 'POST',
      headers: {
        ...this.getAuthHeaders(),
        'Content-Type': undefined as any // Let browser set multipart boundary
      },
      body: formData
    });
  }

  // Analytics and reporting
  /**
   * Get plan analytics
   */
  static async getPlanAnalytics(planId: string): Promise<ApiResponse<{
    progress: number;
    health: any;
    risks: any;
    budget: any;
    velocity: any;
  }>> {
    return this.makeRequest(`${ENDPOINTS.plans}/${planId}/analytics`);
  }

  /**
   * Get dashboard data
   */
  static async getDashboardData(): Promise<ApiResponse<{
    plans: any;
    tasks: any;
    budget: any;
    team: any;
    overdue: any;
  }>> {
    return this.makeRequest('/dashboard');
  }

  // Team and collaboration
  /**
   * Add team member to plan
   */
  static async addTeamMember(planId: string, userData: {
    userId: string;
    role: string;
    allocation: number;
    startDate: string;
    endDate?: string;
  }): Promise<ApiResponse<Plan>> {
    return this.makeRequest<Plan>(`${ENDPOINTS.plans}/${planId}/team`, {
      method: 'POST',
      body: userData
    });
  }

  /**
   * Remove team member from plan
   */
  static async removeTeamMember(planId: string, userId: string): Promise<ApiResponse<Plan>> {
    return this.makeRequest<Plan>(`${ENDPOINTS.plans}/${planId}/team/${userId}`, {
      method: 'DELETE'
    });
  }

  /**
   * Update team member role
   */
  static async updateTeamMemberRole(planId: string, userId: string, role: string): Promise<ApiResponse<Plan>> {
    return this.makeRequest<Plan>(`${ENDPOINTS.plans}/${planId}/team/${userId}/role`, {
      method: 'PUT',
      body: { role }
    });
  }

  // Risk management
  /**
   * Add risk to plan
   */
  static async addRisk(planId: string, riskData: any): Promise<ApiResponse<Plan>> {
    return this.makeRequest<Plan>(`${ENDPOINTS.plans}/${planId}/risks`, {
      method: 'POST',
      body: riskData
    });
  }

  /**
   * Update risk
   */
  static async updateRisk(planId: string, riskId: string, updates: any): Promise<ApiResponse<Plan>> {
    return this.makeRequest<Plan>(`${ENDPOINTS.plans}/${planId}/risks/${riskId}`, {
      method: 'PUT',
      body: updates
    });
  }

  /**
   * Delete risk
   */
  static async deleteRisk(planId: string, riskId: string): Promise<ApiResponse<Plan>> {
    return this.makeRequest<Plan>(`${ENDPOINTS.plans}/${planId}/risks/${riskId}`, {
      method: 'DELETE'
    });
  }

  // File and attachment operations
  /**
   * Upload file attachment
   */
  static async uploadAttachment(file: File, planId?: string, taskId?: string): Promise<ApiResponse<{
    id: string;
    name: string;
    url: string;
    size: number;
    type: string;
  }>> {
    const formData = new FormData();
    formData.append('file', file);
    if (planId) formData.append('planId', planId);
    if (taskId) formData.append('taskId', taskId);

    return this.makeRequest(`${ENDPOINTS.upload}`, {
      method: 'POST',
      headers: {
        ...this.getAuthHeaders(),
        'Content-Type': undefined as any
      },
      body: formData
    });
  }

  /**
   * Delete attachment
   */
  static async deleteAttachment(attachmentId: string): Promise<ApiResponse<void>> {
    return this.makeRequest<void>(`${ENDPOINTS.upload}/${attachmentId}`, {
      method: 'DELETE'
    });
  }

  // User operations
  /**
   * Search users for team assignment
   */
  static async searchUsers(query: string): Promise<ApiResponse<Array<{
    id: string;
    name: string;
    email: string;
    avatar?: string;
    skills: string[];
  }>>> {
    return this.makeRequest(`${ENDPOINTS.users}/search?q=${encodeURIComponent(query)}`);
  }

  /**
   * Get user details
   */
  static async getUser(userId: string): Promise<ApiResponse<{
    id: string;
    name: string;
    email: string;
    avatar?: string;
    skills: string[];
    capacity: number;
    timezone: string;
  }>> {
    return this.makeRequest(`${ENDPOINTS.users}/${userId}`);
  }

  // Batch operations
  /**
   * Batch update tasks
   */
  static async batchUpdateTasks(planId: string, updates: Array<{
    taskId: string;
    updates: Partial<PlanTask>;
  }>): Promise<ApiResponse<PlanTask[]>> {
    return this.makeRequest<PlanTask[]>(`${ENDPOINTS.plans}/${planId}/tasks/batch`, {
      method: 'PUT',
      body: { updates }
    });
  }

  /**
   * Batch delete items
   */
  static async batchDelete(planId: string, items: Array<{
    type: 'task' | 'milestone' | 'phase';
    id: string;
  }>): Promise<ApiResponse<void>> {
    return this.makeRequest<void>(`${ENDPOINTS.plans}/${planId}/batch-delete`, {
      method: 'DELETE',
      body: { items }
    });
  }

  // Synchronization and offline support
  /**
   * Sync local changes with server
   */
  static async syncChanges(changes: Array<{
    type: 'create' | 'update' | 'delete';
    entity: 'plan' | 'phase' | 'task' | 'milestone';
    entityId: string;
    data: any;
    timestamp: string;
  }>): Promise<ApiResponse<{
    applied: string[];
    conflicts: string[];
    errors: string[];
  }>> {
    return this.makeRequest(`/sync`, {
      method: 'POST',
      body: { changes }
    });
  }

  /**
   * Get server changes since timestamp
   */
  static async getChanges(since: string): Promise<ApiResponse<Array<{
    id: string;
    type: 'create' | 'update' | 'delete';
    entity: 'plan' | 'phase' | 'task' | 'milestone';
    entityId: string;
    data: any;
    timestamp: string;
    userId: string;
  }>>> {
    return this.makeRequest(`/changes?since=${encodeURIComponent(since)}`);
  }

  // Health check
  /**
   * Check API health
   */
  static async healthCheck(): Promise<ApiResponse<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    timestamp: string;
    version: string;
  }>> {
    return this.makeRequest('/health');
  }
}

// Error handling utilities
export class PlansApiError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number,
    public details?: any
  ) {
    super(message);
    this.name = 'PlansApiError';
  }

  static fromResponse(error: any): PlansApiError {
    return new PlansApiError(
      error.message || 'An API error occurred',
      error.code || 'UNKNOWN_ERROR',
      error.statusCode || 500,
      error.details
    );
  }

  static isNetworkError(error: any): boolean {
    return error instanceof TypeError && error.message === 'Failed to fetch';
  }

  static isTimeoutError(error: any): boolean {
    return error.name === 'AbortError' || error.message.includes('timeout');
  }
}

// Request interceptors for logging and monitoring
export const setupApiInterceptors = () => {
  // Add request logging
  const originalMakeRequest = (PlansApi as any).makeRequest;
  
  (PlansApi as any).makeRequest = async function<T>(endpoint: string, config: RequestConfig = {}) {
    const startTime = Date.now();
    
    try {
      console.log(`API Request: ${config.method || 'GET'} ${endpoint}`, config.body);
      const result = await originalMakeRequest.call(this, endpoint, config);
      console.log(`API Success: ${config.method || 'GET'} ${endpoint} (${Date.now() - startTime}ms)`, result);
      return result;
    } catch (error) {
      console.error(`API Error: ${config.method || 'GET'} ${endpoint} (${Date.now() - startTime}ms)`, error);
      throw error;
    }
  };
};

// Export default instance
export default PlansApi;