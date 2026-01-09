import { useTranslation } from 'react-i18next'
import { usePersonaStore, PERSONAS } from '@/store'
import { PersonaCard } from './PersonaCard'

export function PersonaSelector() {
  const { t } = useTranslation()
  const { selectedPersona, isHovering, setPersona, setHovering } = usePersonaStore()

  const personas = Object.values(PERSONAS)

  return (
    <div className="w-full">
      {/* Instruction text when no persona selected */}
      {!selectedPersona && (
        <p className="text-center text-gray-400 mb-8 text-lg">
          {t('hero.selectPersona', 'Choose a role to explore')}
        </p>
      )}

      {/* Desktop: 4 cards in a row */}
      <div className="hidden md:flex justify-center items-end gap-6">
        {personas.map((persona) => (
          <PersonaCard
            key={persona.id}
            persona={persona}
            isSelected={selectedPersona === persona.id}
            isHovered={isHovering === persona.id}
            onSelect={() => setPersona(persona.id)}
            onHover={(hovering) => setHovering(hovering ? persona.id : null)}
          />
        ))}
      </div>

      {/* Mobile: Horizontal scroll */}
      <div className="md:hidden overflow-x-auto pb-4 -mx-4 px-4">
        <div className="flex gap-4 w-max">
          {personas.map((persona) => (
            <PersonaCard
              key={persona.id}
              persona={persona}
              isSelected={selectedPersona === persona.id}
              isHovered={isHovering === persona.id}
              onSelect={() => setPersona(persona.id)}
              onHover={(hovering) => setHovering(hovering ? persona.id : null)}
            />
          ))}
        </div>
      </div>

      {/* Swipe hint for mobile */}
      <div className="md:hidden text-center mt-4">
        <p className="text-gray-500 text-sm">
          ← {t('hero.swipeToExplore', 'Swipe to explore')} →
        </p>
      </div>
    </div>
  )
}
