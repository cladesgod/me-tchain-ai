import { useTranslation } from 'react-i18next'
import { cn } from '@/utils'
import { PersonaInfo } from '@/store'
import { PersonaAvatar } from './PersonaAvatar'

interface PersonaCardProps {
  persona: PersonaInfo
  isSelected: boolean
  isHovered: boolean
  onSelect: () => void
  onHover: (hovering: boolean) => void
}

export function PersonaCard({
  persona,
  isSelected,
  isHovered,
  onSelect,
  onHover,
}: PersonaCardProps) {
  const { i18n } = useTranslation()
  const isEnglish = i18n.language === 'en'

  const title = isEnglish ? persona.title : persona.titleTR

  return (
    <button
      onClick={onSelect}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      className={cn(
        'relative flex flex-col items-center p-4 rounded-2xl transition-all duration-500 ease-out',
        'bg-gray-900/50 backdrop-blur-sm border-2',
        'hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900',
        isSelected
          ? 'scale-110 z-10 border-current'
          : isHovered
            ? 'scale-105 border-current/50'
            : 'border-gray-700/50 hover:border-current/30',
        !isSelected && 'opacity-70 hover:opacity-100'
      )}
      style={{
        '--persona-color': persona.color,
        color: persona.color,
        boxShadow: isSelected
          ? `0 0 40px ${persona.color}40, 0 0 80px ${persona.color}20`
          : isHovered
            ? `0 0 20px ${persona.color}30`
            : 'none',
      } as React.CSSProperties}
    >
      {/* 3D Avatar */}
      <div className="w-32 h-40 mb-3">
        {persona.id && (
          <PersonaAvatar
            persona={persona.id}
            isSelected={isSelected}
            isHovered={isHovered}
            glowColor={persona.color}
          />
        )}
      </div>

      {/* Title */}
      <h3
        className={cn(
          'text-lg font-bold transition-all duration-300',
          isSelected ? 'text-current' : 'text-gray-300'
        )}
      >
        {title}
      </h3>

      {/* Selection indicator */}
      {isSelected && (
        <div
          className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full"
          style={{ backgroundColor: persona.color }}
        />
      )}
    </button>
  )
}
