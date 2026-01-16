/**
 * Career Game - Timeline Objects Data
 */

import type { TimelineObject } from '@/types/game'

export const careerTimeline: TimelineObject[] = [
  // Education
  {
    id: 'edu-trakya-bsc',
    type: 'education',
    year: 2020,
    title: { en: 'B.Sc. Mechanical Engineering', tr: 'Makine Mühendisliği Lisans' },
    shortDescription: {
      en: 'Trakya University - Foundation in engineering',
      tr: 'Trakya Üniversitesi - Mühendislik temeli',
    },
    gridPosition: { x: 0, y: 0, z: 0 },
    modelUrl: '/assets/game/objects/university.glb', // Placeholder for now
    iconEmoji: '🎓',
    color: '#3b82f6',
    objectPersonaId: 'edu_trakya_bsc',
    interactionRadius: 2.5,
  },

  // Project
  {
    id: 'project-apa-citation',
    type: 'project',
    year: 2024,
    title: { en: 'APA 7 Citation Helper', tr: 'APA 7 Atıf Yardımcısı' },
    shortDescription: {
      en: '50K+ users on GPT Store',
      tr: "GPT Store'da 50K+ kullanıcı",
    },
    gridPosition: { x: 15, y: 0, z: 0 },
    modelUrl: '/assets/game/objects/project_trophy.glb',
    iconEmoji: '🏆',
    color: '#22d3ee',
    objectPersonaId: 'project_apa_citation',
    interactionRadius: 2,
    externalLink: 'https://chatgpt.com/g/g-p4EdxSPHT-apa-7-citation-helper',
    relatedPersonas: ['engineer'],
  },

  // Thesis
  {
    id: 'thesis-msc',
    type: 'thesis',
    year: 2024,
    month: 6,
    title: {
      en: 'M.Sc. Thesis - LLM B2B Communication',
      tr: 'Yüksek Lisans Tezi - LLM B2B İletişim',
    },
    shortDescription: {
      en: 'Investigating LLMs for automated B2B communications',
      tr: "LLM'lerin otomatik B2B iletişimi araştırması",
    },
    gridPosition: { x: 30, y: 0, z: 0.5 },
    scale: 1.2,
    modelUrl: '/assets/game/objects/thesis_monument.glb',
    iconEmoji: '📚',
    color: '#8b5cf6',
    objectPersonaId: 'thesis_msc_llm',
    interactionRadius: 3,
    relatedPersonas: ['researcher'],
  },
]

// Helper functions
export const getObjectById = (id: string): TimelineObject | undefined => {
  return careerTimeline.find((obj) => obj.id === id)
}

export const getObjectsByType = (type: TimelineObject['type']): TimelineObject[] => {
  return careerTimeline.filter((obj) => obj.type === type)
}

export const getObjectsByYear = (year: number): TimelineObject[] => {
  return careerTimeline.filter((obj) => obj.year === year)
}

export const getChronologicalTimeline = (): TimelineObject[] => {
  return [...careerTimeline].sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year
    return (a.month || 0) - (b.month || 0)
  })
}
