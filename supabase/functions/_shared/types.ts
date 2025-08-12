// Shared TypeScript types for Supabase Edge Functions
// ===================================================

/**
 * Deno global environment interface for accessing environment variables in Supabase Edge Functions.
 * Provides typed access to Deno.env.get() functionality with proper null handling.
 * 
 * @example
 * ```typescript
 * const deno = (globalThis as { Deno?: DenoGlobal }).Deno
 * const apiKey = deno?.env?.get('OPENAI_API_KEY')
 * ```
 */
export interface DenoGlobal {
  env?: {
    get(key: string): string | undefined;
  };
}

/**
 * Complete OpenAI chat completion API response structure.
 * Contains full response metadata, usage statistics, and generated content.
 * Use this type when you need access to token usage or response metadata.
 * 
 * @example
 * ```typescript
 * const response: OpenAIResponse = await openaiClient.createChatCompletion(messages)
 * console.log('Tokens used:', response.usage?.total_tokens)
 * const content = response.choices[0]?.message?.content
 * ```
 */
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
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Simplified OpenAI response type for functions that only need the generated content.
 * All fields are optional and require null/undefined checking before access.
 * 
 * ⚠️ IMPORTANT: All nested fields (choices, message, content) are optional.
 * Always check for existence before accessing to avoid runtime errors.
 * 
 * @example
 * ```typescript
 * const data: SimpleOpenAIResponse = await response.json()
 * 
 * // ✅ Safe access pattern (recommended)
 * if (data.choices?.[0]?.message?.content) {
 *   const content = data.choices[0].message.content
 *   // Use content safely
 * } else {
 *   throw new Error('No content in OpenAI response')
 * }
 * 
 * // 💡 Helper utility approach:
 * function getOpenAIContent(response: SimpleOpenAIResponse): string {
 *   return response.choices?.[0]?.message?.content || ''
 * }
 * ```
 */
export interface SimpleOpenAIResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
}