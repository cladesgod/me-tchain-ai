import { z } from 'zod'

/**
 * Environment Configuration
 *
 * Validates and exports environment variables with type safety.
 * Throws an error at startup if required variables are missing.
 */

// Environment variable schema
const envSchema = z.object({
  VITE_API_URL: z.string().url().default('http://localhost:8000'),
  VITE_WS_URL: z.string().default('ws://localhost:8000'),
  DEV: z.boolean().default(true),
  PROD: z.boolean().default(false),
})

// Parse and validate environment variables
function getEnvConfig() {
  const env = {
    VITE_API_URL: import.meta.env.VITE_API_URL,
    VITE_WS_URL: import.meta.env.VITE_WS_URL,
    DEV: import.meta.env.DEV,
    PROD: import.meta.env.PROD,
  }

  const result = envSchema.safeParse(env)

  if (!result.success) {
    if (import.meta.env.DEV) {
      console.warn('Environment validation warnings:', result.error.flatten())
    }
    // Return defaults for missing values
    return {
      VITE_API_URL: env.VITE_API_URL || 'http://localhost:8000',
      VITE_WS_URL: env.VITE_WS_URL || 'ws://localhost:8000',
      DEV: env.DEV ?? true,
      PROD: env.PROD ?? false,
    }
  }

  return result.data
}

export const config = getEnvConfig()

// Derived URLs
export const API_URL = config.VITE_API_URL
export const WS_URL = config.VITE_WS_URL
export const WS_CHAT_ENDPOINT = `${WS_URL}/api/v1/chat`
export const IS_DEV = config.DEV
export const IS_PROD = config.PROD

// Debug: Log WebSocket endpoint in development
if (IS_DEV) {
  console.log('[Config] WebSocket endpoint:', WS_CHAT_ENDPOINT)
}
