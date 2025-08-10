// OpenAI integration utility for Supabase Edge Functions
// ===================================================

export interface OpenAIConfig {
  apiKey: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

// 환경변수에서 OpenAI API 키 가져오기 또는 하드코딩된 키 사용
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY') || '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';

if (!OPENAI_API_KEY || OPENAI_API_KEY === 'your_openai_key_here') {
  console.error('⚠️ OPENAI_API_KEY not configured properly');
} else {
  console.log('✅ OpenAI API Key configured:', `${OPENAI_API_KEY.substring(0, 8)}...${OPENAI_API_KEY.substring(OPENAI_API_KEY.length - 4)}`);
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

export interface OpenAIResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

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
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ OpenAI API Error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText} - ${errorText}`);
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
      console.error('💥 OpenAI Request failed:', error);
      throw error;
    }
  }

  /**
   * Generate mindmap content using OpenAI
   */
  async generateMindmapContent(
    userInput: string,
    parsedData?: any,
    enterpriseData?: any,
    options?: {
      maxNodes?: number;
      language?: 'korean' | 'english';
      includeMetadata?: boolean;
    }
  ): Promise<any> {
    const opts = {
      maxNodes: 12,
      language: 'korean',
      includeMetadata: true,
      ...options
    };

    const systemPrompt = `You are an expert mindmap generator that creates structured, hierarchical mindmaps.

REQUIREMENTS:
1. Generate exactly ${opts.maxNodes} nodes maximum
2. Create a hierarchical structure with 1 center node, 2-4 major nodes, and supporting minor nodes
3. Use ${opts.language === 'korean' ? 'Korean' : 'English'} language
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
      console.error('❌ Failed to parse OpenAI response as JSON:', parseError);
      console.error('Raw response:', content);
      
      // Fallback: create a simple mindmap
      return {
        nodes: [
          {
            id: 'center',
            title: userInput || 'Main Topic',
            content: 'AI 생성 중 오류가 발생했습니다',
            x: 0,
            y: 0,
            type: 'center',
            level: 0,
            metadata: {
              source: 'fallback',
              confidence: 0.5,
              keywords: ['오류', '재시도']
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
   * Get masked API key for logging
   */
  getMaskedApiKey(): string {
    if (!this.config.apiKey) return 'Not configured';
    return `${this.config.apiKey.substring(0, 8)}...${this.config.apiKey.substring(this.config.apiKey.length - 4)}`;
  }
}

// Export singleton instance
export const openAIClient = OPENAI_API_KEY ? new OpenAIClient() : null;

// Export utility functions
export function isOpenAIEnabled(): boolean {
  return OpenAIClient.isAvailable();
}

export function getOpenAIStatus(): { available: boolean; keyMasked?: string } {
  if (!OPENAI_API_KEY) {
    return { available: false };
  }
  
  return {
    available: true,
    keyMasked: `${OPENAI_API_KEY.substring(0, 8)}...${OPENAI_API_KEY.substring(OPENAI_API_KEY.length - 4)}`
  };
}