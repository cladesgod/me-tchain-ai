/**
 * Object Detail Panel Component
 *
 * Slide-in panel showing timeline object details and integrated chat
 * Features: Object info, embedded chat with object persona, external links
 * Two modes: "info" (default) and "chat" (when talking to object)
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ExternalLink, MessageCircle, Calendar, Tag, ArrowLeft, Send } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { useGameStore } from '@/store/gameStore'
import { cn } from '@/utils'

// Type icon mapping
const TYPE_ICONS: Record<string, string> = {
  education: '🎓',
  work_experience: '💼',
  project: '🚀',
  thesis: '📚',
  publication: '📄',
  talk: '🎤',
  milestone: '🏆',
}

// Type labels
const TYPE_LABELS: Record<string, { en: string; tr: string }> = {
  education: { en: 'Education', tr: 'Eğitim' },
  work_experience: { en: 'Work Experience', tr: 'İş Deneyimi' },
  project: { en: 'Project', tr: 'Proje' },
  thesis: { en: 'Thesis', tr: 'Tez' },
  publication: { en: 'Publication', tr: 'Yayın' },
  talk: { en: 'Talk', tr: 'Konuşma' },
  milestone: { en: 'Milestone', tr: 'Dönüm Noktası' },
}

// Chat message interface
interface ObjectMessage {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: Date
  isStreaming?: boolean
}

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/api/v1/chat'

type PanelMode = 'info' | 'chat'

export function ObjectDetailPanel() {
  const { i18n } = useTranslation()
  const selectedObject = useGameStore((state) => state.selectedObject)
  const selectObject = useGameStore((state) => state.selectObject)
  const visitedObjectIds = useGameStore((state) => state.visitedObjectIds)
  const playerPosition = useGameStore((state) => state.playerPosition)

  const lang = i18n.language as 'en' | 'tr'
  const isOpen = selectedObject !== null
  const isVisited = selectedObject ? visitedObjectIds.includes(selectedObject.id) : false

  // Auto-close panel when player moves too far from object
  useEffect(() => {
    if (!selectedObject) return

    const dx = selectedObject.gridPosition.x - playerPosition.x
    const dz = selectedObject.gridPosition.z - playerPosition.z
    const distance = Math.sqrt(dx * dx + dz * dz)

    // Close if player is more than 2x interaction radius away
    const closeDistance = selectedObject.interactionRadius * 2
    if (distance > closeDistance) {
      selectObject(null)
    }
  }, [selectedObject, playerPosition, selectObject])

  // Panel mode state
  const [panelMode, setPanelMode] = useState<PanelMode>('info')

  // Chat state
  const [messages, setMessages] = useState<ObjectMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const wsRef = useRef<WebSocket | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Smooth typewriter buffer system
  const tokenBufferRef = useRef<string>('')
  const typewriterIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Typewriter effect - drain buffer at consistent speed
  useEffect(() => {
    // Characters per tick and interval for smooth typing
    const CHARS_PER_TICK = 2
    const TICK_INTERVAL_MS = 20 // 100 chars/sec at 2 chars per 20ms

    typewriterIntervalRef.current = setInterval(() => {
      if (tokenBufferRef.current.length > 0) {
        // Take chars from buffer
        const chars = tokenBufferRef.current.slice(0, CHARS_PER_TICK)
        tokenBufferRef.current = tokenBufferRef.current.slice(CHARS_PER_TICK)

        // Update displayed message
        setMessages((prev) => {
          if (prev.length === 0) return prev
          const lastMsg = prev[prev.length - 1]
          if (lastMsg && lastMsg.role === 'assistant' && lastMsg.isStreaming) {
            return [
              ...prev.slice(0, -1),
              { ...lastMsg, content: lastMsg.content + chars }
            ]
          }
          return prev
        })
      }
    }, TICK_INTERVAL_MS)

    return () => {
      if (typewriterIntervalRef.current) {
        clearInterval(typewriterIntervalRef.current)
      }
    }
  }, [])

  // Reset panel mode when object changes
  useEffect(() => {
    setPanelMode('info')
    setMessages([])
    setInputValue('')
    tokenBufferRef.current = '' // Clear buffer
  }, [selectedObject?.id])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  // WebSocket connection for chat mode
  useEffect(() => {
    if (panelMode !== 'chat' || !selectedObject) {
      // Clean up when not in chat mode
      if (wsRef.current) {
        wsRef.current.close()
        wsRef.current = null
      }
      setIsConnected(false)
      return
    }

    // Build WebSocket URL with object_id parameter
    const objectTitle = selectedObject.title[lang]
    const wsUrl = `${WS_URL}?object_id=${encodeURIComponent(selectedObject.objectPersonaId)}&object_title=${encodeURIComponent(objectTitle)}`

    const socket = new WebSocket(wsUrl)
    wsRef.current = socket

    socket.onopen = () => {
      setIsConnected(true)
      console.log(`Object chat connected: ${selectedObject.objectPersonaId}`)
      // Focus input when connected
      setTimeout(() => inputRef.current?.focus(), 100)
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
          // Add to buffer for smooth typewriter effect
          setIsTyping(false)
          tokenBufferRef.current += data.content
        } else if (data.type === 'done') {
          // Object finished - flush remaining buffer then mark complete
          setIsTyping(false)

          // Wait for buffer to drain before marking as done
          const checkBufferAndFinish = () => {
            if (tokenBufferRef.current.length === 0) {
              setMessages((prev) => {
                if (prev.length === 0) return prev
                const lastMsg = prev[prev.length - 1]
                if (lastMsg && lastMsg.isStreaming) {
                  return [
                    ...prev.slice(0, -1),
                    { ...lastMsg, isStreaming: false }
                  ]
                }
                return prev
              })
            } else {
              // Buffer not empty yet, check again
              setTimeout(checkBufferAndFinish, 50)
            }
          }
          checkBufferAndFinish()
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
  }, [panelMode, selectedObject, lang])

  // Handle ESC key - different behavior based on mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        if (panelMode === 'chat') {
          // Chat mode: ESC goes back to info mode
          setPanelMode('info')
        } else {
          // Info mode: ESC closes the panel
          selectObject(null)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, panelMode, selectObject])

  // Add message helper
  const addMessage = useCallback((message: ObjectMessage) => {
    setMessages((prev) => [...prev, message])
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

  // Handle chat input key press
  const handleChatKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
    // ESC is handled by the window listener
  }

  // Handlers
  const handleClose = () => {
    selectObject(null)
  }

  const handleTalkTo = () => {
    setPanelMode('chat')
  }

  const handleBackToInfo = () => {
    setPanelMode('info')
  }

  const handleExternalLink = () => {
    if (selectedObject?.externalLink) {
      window.open(selectedObject.externalLink, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <AnimatePresence>
      {isOpen && selectedObject && (
        <motion.div
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="absolute right-0 top-0 bottom-0 z-30 w-full max-w-md"
        >
          <div className="h-full bg-gray-900/95 backdrop-blur-lg border-l border-gray-800 shadow-2xl flex flex-col">
            {/* Header - Different for info vs chat mode */}
            {panelMode === 'info' ? (
              // INFO MODE HEADER
              <div
                className="relative p-6 border-b border-gray-800"
                style={{
                  background: `linear-gradient(135deg, ${selectedObject.color}20 0%, transparent 50%)`,
                }}
              >
                {/* Close button */}
                <button
                  onClick={handleClose}
                  className="absolute top-4 right-4 p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-colors"
                  aria-label="Close panel"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>

                {/* Object icon and type */}
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl"
                    style={{ backgroundColor: `${selectedObject.color}30` }}
                  >
                    {selectedObject.iconEmoji}
                  </div>
                  <div>
                    <span
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: `${selectedObject.color}20`,
                        color: selectedObject.color,
                      }}
                    >
                      {TYPE_ICONS[selectedObject.type]} {TYPE_LABELS[selectedObject.type][lang]}
                    </span>
                    {isVisited && (
                      <span className="ml-2 text-xs text-green-400">Visited</span>
                    )}
                  </div>
                </div>

                {/* Title */}
                <h2 className="text-xl font-bold text-white mb-2">
                  {selectedObject.title[lang]}
                </h2>

                {/* Year */}
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {selectedObject.month
                      ? `${selectedObject.month}/${selectedObject.year}`
                      : selectedObject.year}
                  </span>
                </div>
              </div>
            ) : (
              // CHAT MODE HEADER - Compact
              <div
                className="flex items-center gap-3 px-4 py-3 border-b border-gray-800"
                style={{
                  background: `linear-gradient(to right, ${selectedObject.color}15, transparent)`,
                }}
              >
                {/* Back button */}
                <button
                  onClick={handleBackToInfo}
                  className="p-2 rounded-lg hover:bg-gray-800 transition-colors text-gray-400 hover:text-white"
                  aria-label="Back to info"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>

                {/* Mini avatar */}
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0"
                  style={{ backgroundColor: `${selectedObject.color}30` }}
                >
                  {selectedObject.iconEmoji}
                </div>

                {/* Title and year */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-white truncate">
                    {selectedObject.title[lang]}
                  </h3>
                  <p className="text-xs text-gray-400">{selectedObject.year}</p>
                </div>

                {/* Connection status */}
                <div className="flex items-center gap-1.5">
                  <div
                    className={cn(
                      'w-2 h-2 rounded-full',
                      isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-500'
                    )}
                  />
                </div>

                {/* Close button */}
                <button
                  onClick={handleClose}
                  className="p-2 rounded-lg hover:bg-gray-800 transition-colors text-gray-400 hover:text-white"
                  aria-label="Close panel"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* Content - Different for info vs chat mode */}
            {panelMode === 'info' ? (
              // INFO MODE CONTENT
              <>
                <div className="flex-1 overflow-y-auto p-6">
                  {/* Description */}
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-400 mb-2 uppercase tracking-wider">
                      Description
                    </h3>
                    <p className="text-gray-300 leading-relaxed">
                      {selectedObject.shortDescription[lang]}
                    </p>
                  </div>

                  {/* Tags */}
                  {selectedObject.tags && selectedObject.tags.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-sm font-medium text-gray-400 mb-2 uppercase tracking-wider flex items-center gap-2">
                        <Tag className="w-4 h-4" />
                        Tags
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedObject.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 rounded-md bg-gray-800 text-gray-300 text-sm"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Related Personas */}
                  {selectedObject.relatedPersonas && selectedObject.relatedPersonas.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-sm font-medium text-gray-400 mb-2 uppercase tracking-wider">
                        Related To
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedObject.relatedPersonas.filter(Boolean).map((persona) => (
                          <span
                            key={persona}
                            className={cn(
                              'px-3 py-1 rounded-full text-sm font-medium',
                              persona === 'engineer' && 'bg-cyan-500/20 text-cyan-400',
                              persona === 'researcher' && 'bg-purple-500/20 text-purple-400',
                              persona === 'speaker' && 'bg-orange-500/20 text-orange-400',
                              persona === 'educator' && 'bg-green-500/20 text-green-400'
                            )}
                          >
                            {persona!.charAt(0).toUpperCase() + persona!.slice(1)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="p-6 border-t border-gray-800 space-y-3">
                  {/* Talk to button */}
                  <button
                    onClick={handleTalkTo}
                    className={cn(
                      'w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl',
                      'bg-gradient-to-r from-cyan-500 to-cyan-600',
                      'hover:from-cyan-400 hover:to-cyan-500',
                      'text-white font-semibold text-lg',
                      'transition-all duration-200 hover:scale-[1.02]',
                      'shadow-lg shadow-cyan-500/25'
                    )}
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span>Talk to {selectedObject.title[lang].split(' ')[0]}...</span>
                  </button>

                  {/* External link button */}
                  {selectedObject.externalLink && (
                    <button
                      onClick={handleExternalLink}
                      className={cn(
                        'w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl',
                        'bg-gray-800 hover:bg-gray-700',
                        'text-gray-300 font-medium',
                        'transition-colors duration-200',
                        'border border-gray-700'
                      )}
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>View External Link</span>
                    </button>
                  )}

                  {/* ESC hint */}
                  <p className="text-xs text-gray-500 text-center pt-2">
                    Press <kbd className="px-1.5 py-0.5 bg-gray-800 rounded text-gray-400">Esc</kbd> to close
                  </p>
                </div>
              </>
            ) : (
              // CHAT MODE CONTENT
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.length === 0 && !isTyping ? (
                    <div className="text-center text-gray-500 py-8">
                      <p className="text-3xl mb-3">{selectedObject.iconEmoji}</p>
                      <p className="text-sm">
                        Start chatting with {selectedObject.title[lang]}!
                      </p>
                      <p className="text-xs mt-1 text-gray-600">
                        Ask me about my story, impact, or anything else...
                      </p>
                    </div>
                  ) : (
                    <>
                      {messages.map((msg) => {
                        // Don't render empty streaming messages (typing indicator handles this)
                        if (msg.isStreaming && !msg.content) return null

                        return (
                        <div
                          key={msg.id}
                          className={cn(
                            'flex gap-2',
                            msg.role === 'user' ? 'justify-end' : 'justify-start'
                          )}
                        >
                          {/* Object Avatar (left side for assistant) */}
                          {msg.role === 'assistant' && (
                            <div
                              className="flex-shrink-0 w-7 h-7 rounded-md flex items-center justify-center text-sm"
                              style={{ backgroundColor: `${selectedObject.color}30` }}
                            >
                              {selectedObject.iconEmoji}
                            </div>
                          )}

                          {/* Message Bubble */}
                          <div
                            className={cn(
                              'max-w-[85%] rounded-xl px-3 py-2',
                              msg.role === 'user'
                                ? 'bg-cyan-600 text-white rounded-br-sm'
                                : 'bg-gray-800 text-gray-200 rounded-bl-sm border border-gray-700'
                            )}
                            style={
                              msg.role === 'assistant'
                                ? { borderColor: `${selectedObject.color}40` }
                                : undefined
                            }
                          >
                            {msg.role === 'assistant' ? (
                              <div className="text-sm leading-relaxed [&_p]:my-1 [&_ul]:my-1 [&_ul]:pl-4 [&_ul]:list-disc [&_ol]:my-1 [&_ol]:pl-4 [&_ol]:list-decimal [&_strong]:font-bold [&_strong]:text-white [&_em]:italic [&_code]:bg-gray-700 [&_code]:px-1 [&_code]:rounded">
                                <ReactMarkdown>
                                  {msg.content || (msg.isStreaming ? '' : '...')}
                                </ReactMarkdown>
                              </div>
                            ) : (
                              <p className="text-sm whitespace-pre-wrap leading-relaxed">
                                {msg.content}
                              </p>
                            )}
                            {msg.isStreaming && (
                              <span className="inline-block w-1.5 h-4 ml-0.5 bg-current animate-pulse rounded-sm" />
                            )}
                          </div>
                        </div>
                        )
                      })}

                      {/* Typing Indicator */}
                      {isTyping && messages[messages.length - 1]?.content === '' && (
                        <div className="flex gap-2 justify-start">
                          <div
                            className="flex-shrink-0 w-7 h-7 rounded-md flex items-center justify-center text-sm"
                            style={{ backgroundColor: `${selectedObject.color}30` }}
                          >
                            {selectedObject.iconEmoji}
                          </div>
                          <div className="bg-gray-800 rounded-xl rounded-bl-sm px-3 py-2 border border-gray-700">
                            <div className="flex gap-1">
                              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
                              <span
                                className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                                style={{ animationDelay: '0.1s' }}
                              />
                              <span
                                className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
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

                {/* Chat Input */}
                <div className="border-t border-gray-800 p-3 bg-gray-900/80">
                  <div className="flex items-end gap-2">
                    <textarea
                      ref={inputRef}
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={handleChatKeyDown}
                      placeholder={`Ask ${selectedObject.title[lang].split(' ')[0]} anything...`}
                      disabled={!isConnected}
                      rows={1}
                      className={cn(
                        'flex-1 resize-none rounded-lg border border-gray-700 bg-gray-800 px-3 py-2',
                        'text-sm text-white placeholder:text-gray-500',
                        'focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none',
                        'disabled:bg-gray-800/50 disabled:cursor-not-allowed',
                        'max-h-24'
                      )}
                      style={{ minHeight: '40px' }}
                    />
                    <button
                      onClick={handleSend}
                      disabled={!isConnected || !inputValue.trim()}
                      className={cn(
                        'flex h-10 w-10 items-center justify-center rounded-lg flex-shrink-0',
                        'bg-cyan-600 text-white',
                        'hover:bg-cyan-500 transition-colors',
                        'disabled:bg-gray-700 disabled:cursor-not-allowed'
                      )}
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Keyboard Hint */}
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    <kbd className="px-1 py-0.5 bg-gray-800 rounded text-gray-400">Enter</kbd> send •
                    <kbd className="px-1 py-0.5 bg-gray-800 rounded text-gray-400 ml-1">Esc</kbd> back
                  </p>
                </div>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
