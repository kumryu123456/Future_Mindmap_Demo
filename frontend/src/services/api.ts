import type { 
  ApiResponse, 
  ApiConfig, 
  RequestOptions
} from '../types/api';
import { globalErrorHandler } from '../utils/errorHandler';

// Default API configuration for Supabase Edge Functions
const DEFAULT_CONFIG: Required<ApiConfig> = {
  baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:54321',
  timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '10000'),
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'}`,
  },
};

class ApiService {
  private config: Required<ApiConfig>;

  constructor(config: Partial<ApiConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Generic HTTP request method
   */
  private async request<T>(
    endpoint: string, 
    options: RequestOptions
  ): Promise<ApiResponse<T>> {
    const url = `${this.config.baseUrl}${endpoint}`;
    const timeout = options.timeout || this.config.timeout;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const headers = {
        ...this.config.headers,
        ...options.headers,
      };

      const requestInit: RequestInit = {
        method: options.method,
        headers,
        signal: controller.signal,
      };

      // Add body for POST, PUT, PATCH methods
      if (options.body && ['POST', 'PUT', 'PATCH'].includes(options.method)) {
        requestInit.body = JSON.stringify(options.body);
      }

      const response = await fetch(url, requestInit);
      clearTimeout(timeoutId);

      let responseData;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        responseData = await response.text();
      }

      if (!response.ok) {
        const apiResponse = {
          success: false,
          error: {
            code: response.status.toString(),
            message: responseData.message || `HTTP ${response.status}`,
            details: responseData
          }
        } as ApiResponse<T>;
        
        // Automatically handle common API errors with toast notifications
        if (response.status >= 500) {
          globalErrorHandler.handleApiError(apiResponse, 'API Server Error');
        }
        
        return apiResponse;
      }

      return {
        success: true,
        data: responseData
      };

    } catch (error) {
      clearTimeout(timeoutId);
      
      let apiResponse: ApiResponse<T>;
      
      if (error instanceof Error) {
        apiResponse = {
          success: false,
          error: {
            code: error.name === 'AbortError' ? 'TIMEOUT' : 'NETWORK_ERROR',
            message: error.message,
            details: { name: error.name, stack: error.stack }
          }
        };
      } else {
        apiResponse = {
          success: false,
          error: {
            code: 'UNKNOWN_ERROR',
            message: 'An unknown error occurred',
            details: { error: String(error) }
          }
        };
      }
      
      // Automatically handle network errors
      globalErrorHandler.handleApiError(apiResponse, 'Network Request');
      
      return apiResponse;
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'GET',
      headers
    });
  }

  /**
   * POST request
   */
  async post<T>(
    endpoint: string, 
    body?: Record<string, unknown> | string, 
    headers?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body,
      headers
    });
  }

  /**
   * PUT request
   */
  async put<T>(
    endpoint: string, 
    body?: Record<string, unknown> | string, 
    headers?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body,
      headers
    });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
      headers
    });
  }

  /**
   * Update API configuration
   */
  updateConfig(newConfig: Partial<ApiConfig>) {
    this.config = { ...this.config, ...newConfig };
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default ApiService;