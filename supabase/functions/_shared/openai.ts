// OpenAI integration utility for Supabase Edge Functions
// ===================================================

import { OpenAIResponse, DenoGlobal } from './types.js';

export interface OpenAIConfig {
  apiKey: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

// Type guard to safely check if globalThis has Deno
function hasDenoEnv(global: typeof globalThis): global is typeof globalThis & { Deno: DenoGlobal } {
  return (
    'Deno' in global &&
    typeof global.Deno === 'object' &&
    global.Deno !== null &&
    'env' in global.Deno &&
    typeof global.Deno.env === 'object'
  )
}

// 환경변수에서 OpenAI API 키 가져오기 - Deno 네이티브 API 사용  
const OPENAI_API_KEY = hasDenoEnv(globalThis) ? (globalThis as { Deno?: DenoGlobal }).Deno?.env?.get('OPENAI_API_KEY') : undefined

if (!OPENAI_API_KEY || OPENAI_API_KEY === 'your_openai_key_here') {
  console.error('⚠️ OPENAI_API_KEY not configured properly');
} else {
  console.log('✅ OpenAI API Key configured: Environment variable is present');
}

const DEFAULT_CONFIG: Omit<OpenAIConfig, 'apiKey'> = {
  model: 'gpt-3.5-turbo',
  temperature: 0.7,
  maxTokens: 1000
};

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// OpenAIResponse interface is now imported from types.js

/**
 * OpenAI API wrapper class
 */
export class OpenAIClient {
  private config: OpenAIConfig;

  constructor(config?: Partial<OpenAIConfig>) {
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key is required but not found in environment variables');
    }

    this.config = {
      apiKey: OPENAI_API_KEY,
      ...DEFAULT_CONFIG,
      ...config
    };

    console.log(`🤖 OpenAI Client initialized with model: ${this.config.model}`);
  }

  /**
   * Send chat completion request to OpenAI
   */
  async createChatCompletion(
    messages: ChatMessage[],
    options?: Partial<OpenAIConfig>
  ): Promise<OpenAIResponse> {
    const config = { ...this.config, ...options };
    
    const requestBody = {
      model: config.model,
      messages,
      temperature: config.temperature,
      max_tokens: config.maxTokens
    };

    console.log('📤 OpenAI Request:', {
      model: config.model,
      messagesCount: messages.length,
      temperature: config.temperature,
      maxTokens: config.maxTokens
    });

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Authorization': `Bearer ${config.apiKey}`
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        // 🔧 FIX: Enhanced error logging with safe error handling
        let errorDetails: Record<string, unknown> = {}
        let errorText = 'Unknown error'
        
        try {
          errorText = await response.text()
          
          // Try to parse as JSON for structured error information
          try {
            const errorJson = JSON.parse(errorText)
            errorDetails = {
              type: errorJson.error?.type || 'unknown',
              code: errorJson.error?.code || response.status,
              message: errorJson.error?.message || errorText
            }
          } catch {
            // If not JSON, use raw text
            errorDetails = { message: errorText }
          }
        } catch (textError) {
          console.warn('Failed to read error response text:', textError)
          errorDetails = { message: 'Unable to read error response' }
        }

        console.error('❌ OpenAI API Error:', {
          status: response.status,
          statusText: response.statusText,
          url: response.url,
          timestamp: new Date().toISOString(),
          errorDetails,
          // Include request info (without sensitive data)
          requestModel: config.model,
          requestMessageCount: messages.length
        })

        // Create user-friendly error message
        const userMessage = response.status === 401 
          ? 'OpenAI API key is invalid or expired'
          : response.status === 429
          ? 'OpenAI API rate limit exceeded. Please try again later.'
          : response.status === 500
          ? 'OpenAI service is temporarily unavailable'
          : `OpenAI API error (${response.status}): ${errorDetails.message || errorText}`

        throw new Error(userMessage)
      }

      const result = await response.json() as OpenAIResponse;
      
      console.log('📥 OpenAI Response:', {
        id: result.id,
        model: result.model,
        usage: result.usage,
        finishReason: result.choices[0]?.finish_reason
      });

      return result;
    } catch (error) {
      // 🔧 FIX: Enhanced general error logging with context
      console.error('💥 OpenAI Request failed:', {
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack?.substring(0, 500) // Limit stack trace length
        } : error,
        timestamp: new Date().toISOString(),
        requestContext: {
          model: config.model,
          messagesCount: messages.length,
          temperature: config.temperature,
          maxTokens: config.maxTokens
        }
      })
      
      // Re-throw the original error (which may have user-friendly message from above)
      throw error
    }
  }

  /**
   * Generate mindmap content using OpenAI
   */
  async generateMindmapContent(
    userInput: string,
    parsedData?: { keywords?: { nouns?: string[] } },
    enterpriseData?: unknown,
    options?: {
      maxNodes?: number;
      language?: 'korean' | 'english';
      includeMetadata?: boolean;
    }
  ): Promise<{
    nodes: Array<{
      id: string;
      title: string;
      content: string;
      x: number;
      y: number;
      type: string;
      level: number;
      metadata: {
        source: string;
        confidence: number;
        keywords: string[];
      };
    }>;
    connections: Array<{
      id: string;
      sourceId: string;
      targetId: string;
      type: string;
    }>;
  }> {
    const opts = {
      maxNodes: 12,
      language: 'korean',
      includeMetadata: true,
      ...options
    };

    // 🔧 FIX: Enhanced Korean localization in system prompt
    const languageInstructions = opts.language === 'korean' 
      ? `한국어로만 응답해주세요. 모든 텍스트는 올바른 한국어(한글)로 작성하고, UTF-8 인코딩을 유지해주세요. 깨진 텍스트나 영어 단어가 섞이지 않도록 주의해주세요.`
      : `Respond in English only. Ensure proper UTF-8 encoding is maintained.`

    const systemPrompt = `You are an expert mindmap generator that creates structured, hierarchical mindmaps.

IMPORTANT LANGUAGE REQUIREMENT:
${languageInstructions}

REQUIREMENTS:
1. Generate exactly ${opts.maxNodes} nodes maximum
2. Create a hierarchical structure with 1 center node, 2-4 major nodes, and supporting minor nodes
3. Use ${opts.language === 'korean' ? '한국어만 사용' : 'English language only'}
4. Include metadata with source information and confidence scores
5. Position nodes in a logical hierarchy

RESPONSE FORMAT (JSON only):
{
  "nodes": [
    {
      "id": "center",
      "title": "Main Topic",
      "content": "Brief description",
      "x": 0,
      "y": 0,
      "type": "center",
      "level": 0,
      "metadata": {
        "source": "ai",
        "confidence": 0.95,
        "keywords": ["keyword1", "keyword2"]
      }
    }
  ],
  "connections": [
    {
      "id": "conn_1",
      "sourceId": "center", 
      "targetId": "node_1",
      "type": "main"
    }
  ]
}`;

    const userPrompt = `Generate a mindmap for: "${userInput}"

${parsedData ? `Parsed Analysis: ${JSON.stringify(parsedData)}` : ''}
${enterpriseData ? `Enterprise Data: ${JSON.stringify(enterpriseData)}` : ''}

Create a comprehensive mindmap with proper Korean terms and business context.`;

    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    const response = await this.createChatCompletion(messages, {
      model: 'gpt-3.5-turbo',
      temperature: 0.7,
      maxTokens: 1500
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content generated by OpenAI');
    }

    try {
      // Parse JSON response
      const mindmapData = JSON.parse(content);
      
      // Validate structure
      if (!mindmapData.nodes || !Array.isArray(mindmapData.nodes)) {
        throw new Error('Invalid mindmap structure: missing nodes array');
      }

      // Ensure we have connections
      if (!mindmapData.connections || !Array.isArray(mindmapData.connections)) {
        mindmapData.connections = [];
      }

      console.log('🎯 Generated mindmap:', {
        nodesCount: mindmapData.nodes.length,
        connectionsCount: mindmapData.connections.length
      });

      return mindmapData;

    } catch (parseError) {
      // 🔧 FIX: Enhanced JSON parsing error logging
      console.error('❌ Failed to parse OpenAI response as JSON:', {
        error: parseError instanceof Error ? {
          name: parseError.name,
          message: parseError.message
        } : parseError,
        timestamp: new Date().toISOString(),
        responseLength: content?.length || 0,
        responsePreview: content?.substring(0, 200) || 'No content',
        requestContext: {
          userInput: userInput?.substring(0, 100) || 'No input',
          language: opts.language,
          maxNodes: opts.maxNodes
        }
      })
      
      // 🔧 FIX: Enhanced Korean localization with proper UTF-8 handling
      const isKorean = options?.language === 'korean';
      
      // Localized messages with proper UTF-8 encoding
      const localizedMessages = {
        korean: {
          mainTopic: '주요 주제',
          errorContent: 'AI 생성 중 오류가 발생했습니다. 다시 시도해 주세요.',
          keywords: ['오류', '재시도', 'AI생성']
        },
        english: {
          mainTopic: 'Main Topic',
          errorContent: 'Error occurred during AI generation. Please try again.',
          keywords: ['error', 'retry', 'ai-generation']
        }
      }
      
      const messages = isKorean ? localizedMessages.korean : localizedMessages.english
      
      return {
        nodes: [
          {
            id: 'center',
            title: userInput || messages.mainTopic,
            content: messages.errorContent,
            x: 0,
            y: 0,
            type: 'center',
            level: 0,
            metadata: {
              source: 'fallback',
              confidence: 0.5,
              keywords: messages.keywords
            }
          }
        ],
        connections: []
      };
    }
  }

  /**
   * Check if OpenAI API key is available
   */
  static isAvailable(): boolean {
    return !!OPENAI_API_KEY;
  }

  /**
   * Check if API key is configured (returns boolean indicator only)
   */
  isConfigured(): boolean {
    return !!this.config.apiKey;
  }
  
  /**
   * Get safe API key status (no key material exposed)
   */
  getApiKeyStatus(): string {
    return this.config.apiKey ? 'Configured' : 'Not configured';
  }
}

// Export singleton instance
/**
 * 🔧 FIX: OpenAI client singleton instance that may be null when OPENAI_API_KEY is not set.
 * Callers must check for null before using or use helper functions that throw appropriate errors.
 */
export const openAIClient: OpenAIClient | null = OPENAI_API_KEY ? new OpenAIClient() : null;

// Export utility functions
export function isOpenAIEnabled(): boolean {
  return OpenAIClient.isAvailable();
}

export function getOpenAIStatus(): { available: boolean } {
  return {
    available: !!OPENAI_API_KEY
  };
}