import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/utils'
import { ChatMessage } from './ChatMessage'
import { ChatInput } from './ChatInput'
import { useChatStore } from '@/store/chatStore'

export function ChatWidget() {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const { messages, isConnected, sendMessage } = useChatStore()

  return (
    <>
      {/* Chat Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center',
          'rounded-full bg-[var(--persona-primary)] text-white shadow-lg',
          'hover:brightness-110 transition-all duration-200',
          'hover:scale-105 active:scale-95'
        )}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
      >
        {isOpen ? (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )}

        {/* Notification dot when connected */}
        {isConnected && !isOpen && (
          <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-green-500 border-2 border-gray-950" />
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div
          className={cn(
            'fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-3rem)]',
            'rounded-2xl bg-gray-900/95 backdrop-blur-sm shadow-2xl border border-gray-800',
            'flex flex-col overflow-hidden',
            'animate-in slide-in-from-bottom-4 fade-in duration-300'
          )}
          style={{ height: '500px' }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-gray-800 bg-gray-800/50 px-4 py-3">
            <div className="relative">
              <div className="h-10 w-10 rounded-full bg-[var(--persona-primary)] flex items-center justify-center text-white font-semibold">
                TU
              </div>
              <span
                className={cn(
                  'absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-gray-800',
                  isConnected ? 'bg-green-500' : 'bg-gray-500'
                )}
              />
            </div>
            <div>
              <h3 className="font-semibold text-white">{t('chat.title')}</h3>
              <p className="text-xs text-gray-400">
                {isConnected ? 'Online' : 'Connecting...'}
              </p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-950/50">
            {messages.length === 0 ? (
              <div className="text-center text-gray-400 text-sm py-8">
                <p>{t('chat.welcome')}</p>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <ChatMessage
                  key={idx}
                  content={msg.content}
                  role={msg.role}
                  isStreaming={msg.isStreaming}
                />
              ))
            )}
          </div>

          {/* Input */}
          <ChatInput onSend={sendMessage} disabled={!isConnected} />
        </div>
      )}
    </>
  )
}
