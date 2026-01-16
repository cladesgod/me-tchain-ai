import { PersonaMiniAvatar } from './PersonaMiniAvatar'
import type { PersonaType } from '@/store/chatStore'

export function ChatHeader() {
  const activePersonas: PersonaType[] = ['engineer', 'researcher', 'speaker', 'educator']

  return (
    <div className="flex items-center gap-3 p-4 border-b border-gray-800 bg-gray-900/50">
      {/* 4 mini avatars in a row */}
      <div className="flex -space-x-2">
        {activePersonas.map((persona) => (
          <PersonaMiniAvatar
            key={persona}
            persona={persona}
            size="sm"
            showOnline={true}
          />
        ))}
      </div>
      
      {/* Header info */}
      <div className="flex-1">
        <div className="font-semibold text-white text-sm">Chat with Timuçin</div>
        <div className="text-xs text-gray-400">4 personas available</div>
      </div>
    </div>
  )
}
