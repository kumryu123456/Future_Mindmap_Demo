import { apiService } from './api';
import type { 
  ParseInputRequest, 
  ParseInputResponse, 
  ApiResponse 
} from '../types/api';

/**
 * Parse input text using the backend API
 * 
 * @param request - The parse input request payload
 * @returns Promise with parsed content response
 */
export async function parseInput(
  request: ParseInputRequest
): Promise<ApiResponse<ParseInputResponse['data']>> {
  try {
    // Validate required fields
    if (!request.input || request.input.trim() === '') {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Input text is required and cannot be empty',
        }
      };
    }

    // Make POST request to the parse-input endpoint
    const response = await apiService.post<ParseInputResponse['data']>(
      '/functions/v1/parse-input',
      {
        input: request.input.trim(),
        context: request.context || '',
        options: {
          format: request.options?.format || 'json',
          includeMetadata: request.options?.includeMetadata ?? true,
          maxTokens: request.options?.maxTokens || 1000,
          ...request.options
        }
      }
    );

    return response;

  } catch (error) {
    console.error('Parse input API error:', error);
    
    return {
      success: false,
      error: {
        code: 'API_ERROR',
        message: 'Failed to parse input',
        details: { error: String(error) }
      }
    };
  }
}

/**
 * Parse input with default options (convenience function)
 * 
 * @param inputText - Text to parse
 * @param context - Optional context for parsing
 * @returns Promise with parsed content response
 */
export async function parseInputSimple(
  inputText: string,
  context?: string
): Promise<ApiResponse<ParseInputResponse['data']>> {
  return parseInput({
    input: inputText,
    context,
    options: {
      format: 'json',
      includeMetadata: true,
      maxTokens: 1000
    }
  });
}

/**
 * Parse input for mindmap generation
 * 
 * @param inputText - Text to parse for mindmap structure
 * @returns Promise with parsed mindmap data
 */
export async function parseInputForMindmap(
  inputText: string
): Promise<ApiResponse<ParseInputResponse['data']>> {
  return parseInput({
    input: inputText,
    context: 'mindmap_generation',
    options: {
      format: 'json',
      includeMetadata: true,
      maxTokens: 2000
    }
  });
}