/**
 * Object Chat Modal
 *
 * Fullscreen modal for chatting with a specific timeline object.
 * Each object has its own persona and speaks in first person about itself.
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send } from 'lucide-react'
import { cn } from '@/utils'
import { useGameStore } from '@/store/gameStore'

interface ObjectMessage {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: Date
  isStreaming?: boolean
}

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/api/v1/chat'

export function ObjectChatModal() {
  const { i18n } = useTranslation()
  const lang = i18n.language === 'tr' ? 'tr' : 'en'

  // Game store
  const isChatting = useGameStore((state) => state.isChatting)
  const chattingWithObject = useGameStore((state) => state.chattingWithObject)
  const endChat = useGameStore((state) => state.endChat)

  // Local chat state
  const [messages, setMessages] = useState<ObjectMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const wsRef = useRef<WebSocket | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  // Connect to WebSocket when modal opens
  useEffect(() => {
    if (!isChatting || !chattingWithObject) {
      // Clean up when modal closes
      if (wsRef.current) {
        wsRef.current.close()
        wsRef.current = null
      }
      setIsConnected(false)
      return
    }

    // Build WebSocket URL with object_id parameter
    const objectTitle = chattingWithObject.title[lang]
    const wsUrl = `${WS_URL}?object_id=${encodeURIComponent(chattingWithObject.objectPersonaId)}&object_title=${encodeURIComponent(objectTitle)}`

    const socket = new WebSocket(wsUrl)
    wsRef.current = socket

    socket.onopen = () => {
      setIsConnected(true)
      console.log(`Object chat connected: ${chattingWithObject.objectPersonaId}`)
    }

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)

        if (data.type === 'system') {
          // Welcome message from object
          addMessage({
            id: crypto.randomUUID(),
            content: data.content,
            role: 'assistant',
            timestamp: new Date(),
          })
        } else if (data.type === 'typing') {
          // Object is typing
          setIsTyping(true)
          // Add placeholder message if not already streaming
          setMessages((prev) => {
            const lastMsg = prev[prev.length - 1]
            if (!lastMsg || lastMsg.role !== 'assistant' || !lastMsg.isStreaming) {
              return [
                ...prev,
                {
                  id: crypto.randomUUID(),
                  content: '',
                  role: 'assistant',
                  timestamp: new Date(),
                  isStreaming: true,
                },
              ]
            }
            return prev
          })
        } else if (data.type === 'stream') {
          // Streaming content
          setIsTyping(false)
          updateLastMessage(data.content)
        } else if (data.type === 'done') {
          // Object finished
          setIsTyping(false)
          setMessages((prev) => {
            const updated = [...prev]
            const lastMsg = updated[updated.length - 1]
            if (lastMsg) {
              lastMsg.isStreaming = false
            }
            return updated
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
        console.error('Failed to parse object chat message:', err)
      }
    }

    socket.onclose = () => {
      setIsConnected(false)
      console.log('Object chat disconnected')
    }

    socket.onerror = (error) => {
      console.error('Object chat WebSocket error:', error)
    }

    return () => {
      socket.close()
    }
  }, [isChatting, chattingWithObject, lang])

  // Add message helper
  const addMessage = useCallback((message: ObjectMessage) => {
    setMessages((prev) => [...prev, message])
  }, [])

  // Update last message helper (for streaming)
  const updateLastMessage = useCallback((content: string) => {
    setMessages((prev) => {
      const updated = [...prev]
      const lastMsg = updated[updated.length - 1]
      if (lastMsg && lastMsg.role === 'assistant') {
        lastMsg.content += content
      }
      return updated
    })
  }, [])

  // Send message handler
  const handleSend = useCallback(() => {
    if (!inputValue.trim() || !wsRef.current || !isConnected) return

    // Add user message
    addMessage({
      id: crypto.randomUUID(),
      content: inputValue.trim(),
      role: 'user',
      timestamp: new Date(),
    })

    // Send to server
    wsRef.current.send(JSON.stringify({ content: inputValue.trim() }))
    setInputValue('')
  }, [inputValue, isConnected, addMessage])

  // Handle key press
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
    if (e.key === 'Escape') {
      endChat()
    }
  }

  // Handle close
  const handleClose = useCallback(() => {
    // Clear messages when closing
    setMessages([])
    endChat()
  }, [endChat])

  if (!chattingWithObject) return null

  return (
    <AnimatePresence>
      {isChatting && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-4 md:inset-10 lg:inset-20 z-50 flex flex-col bg-gray-900 rounded-2xl border border-gray-800 shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div
              className="flex items-center gap-4 px-6 py-4 border-b border-gray-800"
              style={{
                background: `linear-gradient(to right, ${chattingWithObject.color}15, transparent)`,
              }}
            >
              {/* Object Icon */}
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                style={{ backgroundColor: `${chattingWithObject.color}30` }}
              >
                {chattingWithObject.iconEmoji}
              </div>

              {/* Object Info */}
              <div className="flex-1">
                <h2 className="text-lg font-bold text-white">
                  {chattingWithObject.title[lang]}
                </h2>
                <p className="text-sm text-gray-400">
                  {chattingWithObject.year} • {chattingWithObject.type}
                </p>
              </div>

              {/* Connection Status */}
              <div className="flex items-center gap-2 mr-4">
                <div
                  className={cn(
                    'w-2 h-2 rounded-full',
                    isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-500'
                  )}
                />
                <span className="text-xs text-gray-400">
                  {isConnected ? 'Connected' : 'Connecting...'}
                </span>
              </div>

              {/* Close Button */}
              <button
                onClick={handleClose}
                className="p-2 rounded-lg hover:bg-gray-800 transition-colors text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.length === 0 && !isTyping ? (
                <div className="text-center text-gray-500 py-12">
                  <p className="text-4xl mb-4">{chattingWithObject.iconEmoji}</p>
                  <p className="text-sm">
                    Start chatting with {chattingWithObject.title[lang]}!
                  </p>
                  <p className="text-xs mt-2 text-gray-600">
                    Ask me about my story, impact, or anything else...
                  </p>
                </div>
              ) : (
                <>
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={cn(
                        'flex gap-3',
                        msg.role === 'user' ? 'justify-end' : 'justify-start'
                      )}
                    >
                      {/* Object Avatar (left side for assistant) */}
                      {msg.role === 'assistant' && (
                        <div
                          className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-lg"
                          style={{ backgroundColor: `${chattingWithObject.color}30` }}
                        >
                          {chattingWithObject.iconEmoji}
                        </div>
                      )}

                      {/* Message Bubble */}
                      <div
                        className={cn(
                          'max-w-[70%] rounded-2xl px-4 py-3',
                          msg.role === 'user'
                            ? 'bg-cyan-600 text-white rounded-br-md'
                            : 'bg-gray-800 text-gray-200 rounded-bl-md border border-gray-700'
                        )}
                        style={
                          msg.role === 'assistant'
                            ? { borderColor: `${chattingWithObject.color}50` }
                            : undefined
                        }
                      >
                        <p className="text-sm whitespace-pre-wrap">
                          {msg.content || (msg.isStreaming ? '' : '...')}
                        </p>
                        {msg.isStreaming && (
                          <span className="inline-block w-2 h-4 ml-1 bg-current animate-pulse rounded-sm" />
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Typing Indicator */}
                  {isTyping && messages[messages.length - 1]?.content === '' && (
                    <div className="flex gap-3 justify-start">
                      <div
                        className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-lg"
                        style={{ backgroundColor: `${chattingWithObject.color}30` }}
                      >
                        {chattingWithObject.iconEmoji}
                      </div>
                      <div className="bg-gray-800 rounded-2xl rounded-bl-md px-4 py-3 border border-gray-700">
                        <div className="flex gap-1">
                          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                          <span
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: '0.1s' }}
                          />
                          <span
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: '0.2s' }}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input */}
            <div className="border-t border-gray-800 p-4 bg-gray-900/80">
              <div className="flex items-end gap-3">
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`Ask ${chattingWithObject.title[lang]} anything...`}
                  disabled={!isConnected}
                  rows={1}
                  className={cn(
                    'flex-1 resize-none rounded-xl border border-gray-700 bg-gray-800 px-4 py-3',
                    'text-sm text-white placeholder:text-gray-500',
                    'focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none',
                    'disabled:bg-gray-800/50 disabled:cursor-not-allowed',
                    'max-h-32'
                  )}
                  style={{ minHeight: '48px' }}
                />
                <button
                  onClick={handleSend}
                  disabled={!isConnected || !inputValue.trim()}
                  className={cn(
                    'flex h-12 w-12 items-center justify-center rounded-xl',
                    'bg-cyan-600 text-white',
                    'hover:bg-cyan-500 transition-colors',
                    'disabled:bg-gray-700 disabled:cursor-not-allowed'
                  )}
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>

              {/* Keyboard Hint */}
              <p className="text-xs text-gray-500 mt-2 text-center">
                Press <kbd className="px-1.5 py-0.5 bg-gray-800 rounded text-gray-400">Enter</kbd> to send,{' '}
                <kbd className="px-1.5 py-0.5 bg-gray-800 rounded text-gray-400">Esc</kbd> to close
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
