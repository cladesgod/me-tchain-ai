import { PersonaMiniAvatar } from './PersonaMiniAvatar'
import type { PersonaType } from '@/store/chatStore'

interface TypingIndicatorProps {
  persona: PersonaType
}

const personaLabels = {
  engineer: 'Engineer',
  researcher: 'Researcher',
  speaker: 'Speaker',
  educator: 'Educator',
}

export function TypingIndicator({ persona }: TypingIndicatorProps) {
  return (
    <div className="flex items-center gap-2 px-4 py-2">
      <PersonaMiniAvatar persona={persona} size="sm" />
      <span className="text-sm text-gray-400">
        Timuçin ({personaLabels[persona]}) is typing
      </span>
      <div className="flex gap-1">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  )
}
