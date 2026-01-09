import { cn } from '@/utils'

interface ChatMessageProps {
  content: string
  role: 'user' | 'assistant'
  isStreaming?: boolean
}

export function ChatMessage({ content, role, isStreaming }: ChatMessageProps) {
  const isUser = role === 'user'

  return (
    <div className={cn('flex', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[80%] rounded-2xl px-4 py-2',
          isUser
            ? 'bg-[var(--persona-primary)] text-white rounded-br-md'
            : 'bg-gray-800/50 text-gray-200 border border-gray-700 rounded-bl-md'
        )}
      >
        <p className="text-sm whitespace-pre-wrap">{content}</p>
        {isStreaming && (
          <span className="inline-block w-2 h-4 ml-1 bg-current animate-pulse rounded-sm" />
        )}
      </div>
    </div>
  )
}
