import { useState, type FormEvent, type KeyboardEvent } from 'react'
import { cn } from '@/utils'

interface ChatInputProps {
  onSend: (message: string) => void
  disabled?: boolean
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [message, setMessage] = useState('')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (message.trim() && !disabled) {
      onSend(message.trim())
      setMessage('')
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border-t border-gray-800 p-4 bg-gray-900/50">
      <div className="flex items-end gap-2">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Mesajınızı yazın..."
          disabled={disabled}
          rows={1}
          className={cn(
            'flex-1 resize-none rounded-xl border border-gray-700 bg-gray-800/50 px-4 py-2',
            'text-sm text-white placeholder:text-gray-500',
            'focus:border-[var(--persona-primary)] focus:ring-1 focus:ring-[var(--persona-primary)] focus:outline-none',
            'disabled:bg-gray-800 disabled:cursor-not-allowed',
            'max-h-32'
          )}
          style={{ minHeight: '40px' }}
        />
        <button
          type="submit"
          disabled={disabled || !message.trim()}
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-xl',
            'bg-[var(--persona-primary)] text-white',
            'hover:brightness-110 transition-all',
            'disabled:bg-gray-700 disabled:cursor-not-allowed'
          )}
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
            />
          </svg>
        </button>
      </div>
    </form>
  )
}
