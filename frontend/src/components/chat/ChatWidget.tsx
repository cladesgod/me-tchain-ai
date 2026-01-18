import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/utils'
import { ChatMessage } from './ChatMessage'
import { ChatInput } from './ChatInput'
import { ChatHeader } from './ChatHeader'
import { TypingIndicator } from './TypingIndicator'
import { PersonaMiniAvatar } from './PersonaMiniAvatar'
import { useChatStore } from '@/store/chatStore'
import type { PersonaType } from '@/store/chatStore'

export function ChatWidget() {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const { messages, isConnected, sendMessage, typingPersona } = useChatStore()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Debug: Log connection state
  useEffect(() => {
    console.log('[ChatWidget] isConnected:', isConnected)
  }, [isConnected])

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typingPersona])

  // Close panel on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isOpen])

  return (
    <>
      {/* Edge-Mounted Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'fixed right-0 top-1/2 -translate-y-1/2 z-40',
          'bg-gradient-to-l from-gray-800/90 to-transparent',
          'backdrop-blur-sm border-l-0 border-y border-r border-gray-700',
          'rounded-l-xl py-6 px-3',
          'hover:px-4 transition-all duration-200',
          'group',
          'shadow-lg'
        )}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
      >
        {/* 4 Stacked Persona Avatars */}
        <div className="flex flex-col items-center gap-1.5">
          {(['engineer', 'researcher', 'speaker', 'educator'] as PersonaType[]).map((persona) => (
            <PersonaMiniAvatar key={persona} persona={persona} size="xs" showOnline={false} />
          ))}
        </div>

        {/* Vertical "CHAT" Text */}
        <div
          className="text-[10px] font-semibold tracking-wider text-gray-400 mt-3 group-hover:text-gray-300 transition-colors"
          style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
        >
          CHAT
        </div>

        {/* Online Indicator Dot */}
        {isConnected && (
          <div className="absolute top-2 right-2 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        )}
      </button>

      {/* Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 animate-in fade-in duration-300"
          onClick={() => setIsOpen(false)}
          aria-label="Close chat backdrop"
        />
      )}

      {/* Side Panel */}
      <div
        className={cn(
          'fixed right-0 top-0 h-full w-96 max-w-[90vw] z-50',
          'bg-gray-900/95 backdrop-blur-md border-l border-gray-800',
          'shadow-2xl flex flex-col',
          'transform transition-transform duration-300 ease-out',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Header */}
        <ChatHeader />

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-950/50">
          {messages.length === 0 ? (
            <div className="text-center text-gray-400 text-sm py-8">
              <p>{t('chat.welcome')}</p>
              <p className="text-xs mt-2">Ask me anything about my work!</p>
            </div>
          ) : (
            <>
              {messages.map((msg) => (
                <ChatMessage
                  key={msg.id}
                  content={msg.content}
                  role={msg.role}
                  persona={msg.persona}
                  isStreaming={msg.isStreaming}
                />
              ))}
              {/* Typing indicator */}
              {typingPersona && <TypingIndicator persona={typingPersona} />}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input */}
        {/* DEBUG: Force enable for testing */}
        <ChatInput onSend={sendMessage} disabled={false} />
      </div>
    </>
  )
}
