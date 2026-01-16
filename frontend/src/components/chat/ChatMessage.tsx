import { cn } from '@/utils'
import { PersonaMiniAvatar } from './PersonaMiniAvatar'
import type { PersonaType } from '@/store/chatStore'

interface ChatMessageProps {
  content: string
  role: 'user' | 'assistant'
  persona?: PersonaType
  isStreaming?: boolean
}

const personaColors = {
  engineer: {
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/30',
    text: 'text-cyan-400',
    label: 'Engineer',
  },
  researcher: {
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
    text: 'text-purple-400',
    label: 'Researcher',
  },
  speaker: {
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/30',
    text: 'text-orange-400',
    label: 'Speaker',
  },
  educator: {
    bg: 'bg-teal-500/10',
    border: 'border-teal-500/30',
    text: 'text-teal-400',
    label: 'Educator',
  },
}

export function ChatMessage({ content, role, persona, isStreaming }: ChatMessageProps) {
  const isUser = role === 'user'
  const personaConfig = persona ? personaColors[persona] : null

  return (
    <div className={cn('flex gap-2', isUser ? 'justify-end' : 'justify-start')}>
      {/* Assistant persona avatar (left side) */}
      {!isUser && persona && (
        <div className="flex-shrink-0 pt-1">
          <PersonaMiniAvatar persona={persona} size="sm" />
        </div>
      )}

      {/* Message bubble */}
      <div className="flex flex-col gap-1 max-w-[75%]">
        {/* Persona name label for assistant */}
        {!isUser && persona && personaConfig && (
          <span className={cn('text-xs font-medium', personaConfig.text)}>
            Timuçin ({personaConfig.label})
          </span>
        )}

        {/* Message content */}
        <div
          className={cn(
            'rounded-2xl px-4 py-2',
            isUser
              ? 'bg-gray-700 text-white rounded-br-md'
              : persona && personaConfig
                ? `${personaConfig.bg} ${personaConfig.border} border text-gray-200 rounded-bl-md`
                : 'bg-gray-800/50 text-gray-200 border border-gray-700 rounded-bl-md'
          )}
        >
          <p className="text-sm whitespace-pre-wrap">{content}</p>
          {isStreaming && (
            <span className="inline-block w-2 h-4 ml-1 bg-current animate-pulse rounded-sm" />
          )}
        </div>
      </div>
    </div>
  )
}
