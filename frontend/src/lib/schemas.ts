import { z } from 'zod'

/**
 * WebSocket Message Schemas
 *
 * Zod schemas for validating incoming WebSocket messages.
 * Provides type safety and runtime validation.
 */

// System message (welcome, info)
export const SystemMessageSchema = z.object({
  type: z.literal('system'),
  content: z.string(),
  session_id: z.string().optional(),
})

// Typing indicator
export const TypingMessageSchema = z.object({
  type: z.literal('typing'),
  persona: z.string().optional(),
  object_id: z.string().optional(),
})

// Streaming content
export const StreamMessageSchema = z.object({
  type: z.literal('stream'),
  content: z.string(),
  persona: z.string().optional(),
  object_id: z.string().optional(),
})

// Done signal
export const DoneMessageSchema = z.object({
  type: z.literal('done'),
  persona: z.string().optional(),
  object_id: z.string().optional(),
  content: z.string().optional(),
})

// Error message
export const ErrorMessageSchema = z.object({
  type: z.literal('error'),
  content: z.string(),
})

// Union of all message types
export const WebSocketMessageSchema = z.discriminatedUnion('type', [
  SystemMessageSchema,
  TypingMessageSchema,
  StreamMessageSchema,
  DoneMessageSchema,
  ErrorMessageSchema,
])

// Export types derived from schemas
export type SystemMessage = z.infer<typeof SystemMessageSchema>
export type TypingMessage = z.infer<typeof TypingMessageSchema>
export type StreamMessage = z.infer<typeof StreamMessageSchema>
export type DoneMessage = z.infer<typeof DoneMessageSchema>
export type ErrorMessage = z.infer<typeof ErrorMessageSchema>
export type WebSocketMessage = z.infer<typeof WebSocketMessageSchema>

/**
 * Safely parse a WebSocket message with validation
 *
 * @param data - Raw message data (string or object)
 * @returns Parsed and validated message, or null if invalid
 */
export function parseWebSocketMessage(data: unknown): WebSocketMessage | null {
  try {
    // If string, parse JSON first
    const parsed = typeof data === 'string' ? JSON.parse(data) : data

    // Validate against schema
    const result = WebSocketMessageSchema.safeParse(parsed)

    if (!result.success) {
      if (import.meta.env.DEV) {
        console.warn('Invalid WebSocket message:', result.error.flatten())
      }
      return null
    }

    return result.data
  } catch (err) {
    if (import.meta.env.DEV) {
      console.error('Failed to parse WebSocket message:', err)
    }
    return null
  }
}
