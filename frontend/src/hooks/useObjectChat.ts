import { useState, useRef, useCallback, useEffect } from 'react'
import type { TimelineObject } from '@/types/game'

interface ChatMessage {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: Date
  isStreaming?: boolean
}

interface UseObjectChatOptions {
  object: TimelineObject | null
  onConnect?: () => void
  onDisconnect?: () => void
  onMessage?: (message: ChatMessage) => void
}

interface UseObjectChatReturn {
  messages: ChatMessage[]
  isConnected: boolean
  isStreaming: boolean
  currentStreamingContent: string
  sendMessage: (content: string) => void
  clearMessages: () => void
  disconnect: () => void
}

/**
 * Custom hook for managing WebSocket chat connections with timeline objects.
 * This eliminates duplication between ObjectDetailPanel and ObjectChatModal.
 */
export function useObjectChat(options: UseObjectChatOptions): UseObjectChatReturn {
  const { object, onConnect, onDisconnect, onMessage } = options

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const [currentStreamingContent, setCurrentStreamingContent] = useState('')

  const wsRef = useRef<WebSocket | null>(null)
  const bufferRef = useRef('')
  const bufferTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Helper function to add a message
  const addMessage = useCallback((message: ChatMessage) => {
    setMessages((prev) => [...prev, message])
    onMessage?.(message)
  }, [onMessage])

  // Helper function to update the last message (for streaming)
  const updateLastMessage = useCallback((content: string) => {
    setMessages((prev) => {
      if (prev.length === 0) return prev
      const lastMsg = prev[prev.length - 1]
      if (!lastMsg.isStreaming) return prev

      return [
        ...prev.slice(0, -1),
        { ...lastMsg, content: lastMsg.content + content }
      ]
    })
  }, [])

  // Smooth typewriter effect for streaming
  const processBuffer = useCallback(() => {
    if (bufferRef.current) {
      const charsToAdd = Math.min(2, bufferRef.current.length)
      const content = bufferRef.current.slice(0, charsToAdd)
      bufferRef.current = bufferRef.current.slice(charsToAdd)

      updateLastMessage(content)
      setCurrentStreamingContent((prev) => prev + content)

      if (bufferRef.current) {
        bufferTimerRef.current = setTimeout(processBuffer, 20)
      } else {
        bufferTimerRef.current = null
      }
    }
  }, [updateLastMessage])

  // Send a message
  const sendMessage = useCallback((content: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN || !content.trim()) {
      return
    }

    // Add user message
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      content: content.trim(),
      role: 'user',
      timestamp: new Date(),
    }
    addMessage(userMessage)

    // Send to server
    wsRef.current.send(content.trim())
  }, [addMessage])

  // Clear messages
  const clearMessages = useCallback(() => {
    setMessages([])
    setCurrentStreamingContent('')
    bufferRef.current = ''
    if (bufferTimerRef.current) {
      clearTimeout(bufferTimerRef.current)
      bufferTimerRef.current = null
    }
  }, [])

  // Disconnect WebSocket
  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
  }, [])

  // WebSocket connection effect
  useEffect(() => {
    if (!object?.objectPersonaId) {
      return
    }

    // Clear any existing buffer timer
    if (bufferTimerRef.current) {
      clearTimeout(bufferTimerRef.current)
      bufferTimerRef.current = null
    }

    // Close existing connection if any
    if (wsRef.current) {
      wsRef.current.close()
    }

    // Reset state
    clearMessages()
    setIsStreaming(false)

    // Create WebSocket URL
    const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000'
    // Use English title for the URL
    const title = typeof object.title === 'string' ? object.title : object.title.en
    const wsUrl = `${WS_URL}/api/v1/chat?object_id=${object.objectPersonaId}&object_title=${encodeURIComponent(
      title
    )}`

    const socket = new WebSocket(wsUrl)
    wsRef.current = socket

    socket.onopen = () => {
      setIsConnected(true)
      if (import.meta.env.DEV) {
        console.log(`Object chat connected: ${object.objectPersonaId}`)
      }
      onConnect?.()
    }

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)

        if (data.type === 'system') {
          // System message (e.g., welcome message)
          addMessage({
            id: crypto.randomUUID(),
            content: data.content,
            role: 'assistant',
            timestamp: new Date(),
          })
        } else if (data.type === 'typing') {
          // Start streaming
          setIsStreaming(true)
          setCurrentStreamingContent('')
          bufferRef.current = ''

          // Add placeholder message for streaming
          addMessage({
            id: crypto.randomUUID(),
            content: '',
            role: 'assistant',
            timestamp: new Date(),
            isStreaming: true,
          })
        } else if (data.type === 'stream') {
          // Add to buffer for smooth typewriter effect
          bufferRef.current += data.content
          if (!bufferTimerRef.current) {
            processBuffer()
          }
        } else if (data.type === 'done') {
          // Flush any remaining buffer
          if (bufferRef.current) {
            updateLastMessage(bufferRef.current)
            setCurrentStreamingContent((prev) => prev + bufferRef.current)
            bufferRef.current = ''
          }

          // Mark streaming as complete
          setIsStreaming(false)
          setMessages((prev) => {
            if (prev.length === 0) return prev
            const lastMsg = prev[prev.length - 1]
            if (!lastMsg.isStreaming) return prev

            return [
              ...prev.slice(0, -1),
              { ...lastMsg, isStreaming: false }
            ]
          })
        } else if (data.type === 'error') {
          addMessage({
            id: crypto.randomUUID(),
            content: data.content,
            role: 'assistant',
            timestamp: new Date(),
          })
        }
      } catch (err) {
        if (import.meta.env.DEV) {
          console.error('Failed to parse object chat message:', err)
        }
      }
    }

    socket.onclose = () => {
      setIsConnected(false)
      if (import.meta.env.DEV) {
        console.log('Object chat disconnected')
      }
      onDisconnect?.()
    }

    socket.onerror = (error) => {
      if (import.meta.env.DEV) {
        console.error('Object chat WebSocket error:', error)
      }
    }

    return () => {
      socket.close()
      if (bufferTimerRef.current) {
        clearTimeout(bufferTimerRef.current)
        bufferTimerRef.current = null
      }
    }
  }, [object?.objectPersonaId, object?.title, addMessage, updateLastMessage, processBuffer, clearMessages, onConnect, onDisconnect])

  return {
    messages,
    isConnected,
    isStreaming,
    currentStreamingContent,
    sendMessage,
    clearMessages,
    disconnect,
  }
}