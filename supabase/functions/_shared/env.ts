/**
 * Shared environment variable access utility
 */

import type { DenoGlobal } from './types.ts'

/**
 * Type guard to safely check for Deno environment
 */
function isDeno(): boolean {
  return typeof globalThis !== 'undefined' && 
         'Deno' in globalThis && 
         globalThis.Deno !== undefined
}

/**
 * Safe environment variable access with Deno and Node.js fallback
 */
export function getEnv(key: string): string | undefined {
  if (isDeno()) {
    return (globalThis as { Deno?: DenoGlobal }).Deno?.env?.get(key)
  }
  // Fallback to process.env in Node.js environments
  return typeof process !== 'undefined' ? process.env[key] : undefined
}

/**
 * Get environment variable with validation
 * Throws an error if the variable is not set
 */
export function getRequiredEnv(key: string, errorMessage?: string): string {
  const value = getEnv(key)
  if (!value) {
    throw new Error(errorMessage || `Environment variable ${key} is required`)
  }
  return value
}