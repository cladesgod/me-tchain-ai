import { PersonaType } from '@/store'
import { EngineerContent } from './EngineerContent'
import { ResearcherContent } from './ResearcherContent'
import { SpeakerContent } from './SpeakerContent'
import { EducatorContent } from './EducatorContent'

interface PersonaContentProps {
  persona: Exclude<PersonaType, null>
}

export function PersonaContent({ persona }: PersonaContentProps) {
  switch (persona) {
    case 'engineer':
      return <EngineerContent />
    case 'researcher':
      return <ResearcherContent />
    case 'speaker':
      return <SpeakerContent />
    case 'educator':
      return <EducatorContent />
    default:
      return null
  }
}
