import type { PersonaType } from '@/store/chatStore'

interface PersonaMiniAvatarProps {
  persona: PersonaType
  size?: 'xs' | 'sm' | 'md'
  showOnline?: boolean
}

const personaConfig = {
  engineer: {
    icon: '</>',
    color: 'cyan',
    bgColor: 'bg-cyan-500',
    borderColor: 'border-cyan-500',
    label: 'Engineer',
  },
  researcher: {
    icon: '🔬',
    color: 'purple',
    bgColor: 'bg-purple-500',
    borderColor: 'border-purple-500',
    label: 'Researcher',
  },
  speaker: {
    icon: '🎤',
    color: 'orange',
    bgColor: 'bg-orange-500',
    borderColor: 'border-orange-500',
    label: 'Speaker',
  },
  educator: {
    icon: '📚',
    color: 'teal',
    bgColor: 'bg-teal-500',
    borderColor: 'border-teal-500',
    label: 'Educator',
  },
}

export function PersonaMiniAvatar({
  persona,
  size = 'md',
  showOnline = false,
}: PersonaMiniAvatarProps) {
  const config = personaConfig[persona]

  // Size mappings: xs (16px) for trigger, sm (24px) for chat, md (32px) for header
  const sizeMap = {
    xs: 'w-4 h-4 text-[10px]',
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
  }
  const sizeClasses = sizeMap[size]

  // Online indicator size varies by avatar size
  const onlineIndicatorSize = size === 'xs' ? 'w-2 h-2 border' : 'w-3 h-3 border-2'

  return (
    <div className="relative inline-block">
      <div
        className={`${sizeClasses} rounded-full ${config.bgColor}/20 ${config.borderColor} border-2 flex items-center justify-center font-semibold text-${config.color}-400`}
        title={config.label}
      >
        {config.icon}
      </div>
      {showOnline && (
        <div className={`absolute -bottom-0.5 -right-0.5 ${onlineIndicatorSize} bg-green-500 rounded-full border-gray-950 animate-pulse`} />
      )}
    </div>
  )
}
