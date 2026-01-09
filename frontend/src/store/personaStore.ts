import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type PersonaType = 'engineer' | 'researcher' | 'speaker' | 'educator' | null

export interface PersonaInfo {
  id: PersonaType
  title: string
  titleTR: string
  subtitle: string
  subtitleTR: string
  color: string
  colorRGB: string
  icon: string
  stats: {
    value: string
    label: string
    labelTR: string
  }[]
}

export const PERSONAS: Record<Exclude<PersonaType, null>, PersonaInfo> = {
  engineer: {
    id: 'engineer',
    title: 'AI Engineer',
    titleTR: 'Yapay Zeka Mühendisi',
    subtitle: 'Building intelligent systems with LLMs, LangChain, and modern AI tools',
    subtitleTR: 'LLM, LangChain ve modern AI araçlarıyla akıllı sistemler geliştiriyorum',
    color: '#22d3ee',
    colorRGB: '34, 211, 238',
    icon: '</>',
    stats: [
      { value: '50K+', label: 'GPT Store Users', labelTR: 'GPT Store Kullanıcısı' },
      { value: '10+', label: 'AI Projects', labelTR: 'AI Projesi' },
      { value: '5+', label: 'Years Experience', labelTR: 'Yıl Deneyim' },
    ],
  },
  researcher: {
    id: 'researcher',
    title: 'AI Researcher',
    titleTR: 'Yapay Zeka Araştırmacısı',
    subtitle: 'PhD candidate at ITU, exploring LLM agents and cognitive architectures',
    subtitleTR: 'İTÜ\'de doktora öğrencisi, LLM ajanları ve bilişsel mimariler üzerine çalışıyorum',
    color: '#8b5cf6',
    colorRGB: '139, 92, 246',
    icon: '🔬',
    stats: [
      { value: '3', label: 'Publications', labelTR: 'Yayın' },
      { value: 'PhD', label: 'Candidate at ITU', labelTR: 'İTÜ Adayı' },
      { value: 'LLM', label: 'Focus Area', labelTR: 'Odak Alanı' },
    ],
  },
  speaker: {
    id: 'speaker',
    title: 'Tech Speaker',
    titleTR: 'Teknoloji Konuşmacısı',
    subtitle: 'Sharing AI insights at universities and tech conferences across Turkey',
    subtitleTR: 'Türkiye genelinde üniversitelerde ve teknoloji konferanslarında AI paylaşımları',
    color: '#f97316',
    colorRGB: '249, 115, 22',
    icon: '🎤',
    stats: [
      { value: '6+', label: 'University Talks', labelTR: 'Üniversite Konuşması' },
      { value: '500+', label: 'Audience Reached', labelTR: 'Ulaşılan Kişi' },
      { value: 'AI', label: 'Focus Topics', labelTR: 'Odak Konular' },
    ],
  },
  educator: {
    id: 'educator',
    title: 'Educator',
    titleTR: 'Eğitimci',
    subtitle: 'Teaching AI and game design at Istinye University, mentoring next generation',
    subtitleTR: 'İstinye Üniversitesi\'nde AI ve oyun tasarımı dersleri veriyorum',
    color: '#14b8a6',
    colorRGB: '20, 184, 166',
    icon: '📚',
    stats: [
      { value: '100+', label: 'Students Taught', labelTR: 'Öğrenci' },
      { value: '2+', label: 'Courses', labelTR: 'Ders' },
      { value: 'IU', label: 'Istinye University', labelTR: 'İstinye Üniversitesi' },
    ],
  },
}

interface PersonaState {
  selectedPersona: PersonaType
  isHovering: PersonaType

  // Actions
  setPersona: (persona: PersonaType) => void
  setHovering: (persona: PersonaType) => void
  clearPersona: () => void

  // Getters
  getActivePersona: () => PersonaInfo | null
  getThemeClass: () => string
}

export const usePersonaStore = create<PersonaState>()(
  persist(
    (set, get) => ({
      selectedPersona: null,
      isHovering: null,

      setPersona: (persona) => {
        set({ selectedPersona: persona })
        // Apply theme class to document
        if (persona) {
          document.documentElement.className = `theme-${persona}`
        } else {
          document.documentElement.className = ''
        }
      },

      setHovering: (persona) => {
        set({ isHovering: persona })
      },

      clearPersona: () => {
        set({ selectedPersona: null })
        document.documentElement.className = ''
      },

      getActivePersona: () => {
        const { selectedPersona } = get()
        return selectedPersona ? PERSONAS[selectedPersona] : null
      },

      getThemeClass: () => {
        const { selectedPersona } = get()
        return selectedPersona ? `theme-${selectedPersona}` : ''
      },
    }),
    {
      name: 'persona-storage',
      partialize: (state) => ({ selectedPersona: state.selectedPersona }),
      onRehydrateStorage: () => (state) => {
        // Re-apply theme class on page load
        if (state?.selectedPersona) {
          document.documentElement.className = `theme-${state.selectedPersona}`
        }
      },
    }
  )
)
