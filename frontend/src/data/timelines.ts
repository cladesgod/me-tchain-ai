/**
 * Timeline data for each persona
 * - Engineer: Employment history
 * - Researcher: Education history
 * - Educator: Teaching history
 * - Speaker: No timeline
 */

export interface TimelineItem {
  id: string
  year: string | { en: string; tr: string }
  title: { en: string; tr: string }
  subtitle: { en: string; tr: string }
}

// Engineer - Employment Timeline
export const engineerTimeline: TimelineItem[] = [
  {
    id: 'emp-datafirst',
    year: '2021-2022',
    title: { en: 'Data Scientist', tr: 'Data Scientist' },
    subtitle: { en: 'Datafirst.store', tr: 'Datafirst.store' },
  },
  {
    id: 'emp-istinye',
    year: '2022-2024',
    title: { en: 'Research Engineer', tr: 'Araştırma Mühendisi' },
    subtitle: { en: 'İstinye Uni. MIS Lab', tr: 'İstinye Üni. MIS Lab' },
  },
  {
    id: 'emp-mlpcare',
    year: '2024-2025',
    title: { en: 'AI R&D Team Lead', tr: 'AI Ar-Ge Takım Lideri' },
    subtitle: { en: 'MLPCare', tr: 'MLPCare' },
  },
  {
    id: 'emp-turkcell',
    year: '2025-Now',
    title: { en: 'R&D Researcher', tr: 'Ar-Ge Araştırmacısı' },
    subtitle: { en: 'Turkcell & Istanbul Tech. Uni.', tr: 'Turkcell & İTÜ' },
  },
]

// Researcher - Education Timeline
export const researcherTimeline: TimelineItem[] = [
  {
    id: 'edu-trakya',
    year: '2020',
    title: { en: 'B.Sc. Mechanical Eng.', tr: 'Makine Müh. Lisans' },
    subtitle: { en: 'Trakya University', tr: 'Trakya Üniversitesi' },
  },
  {
    id: 'edu-uskudar',
    year: '2024',
    title: { en: 'M.Sc. AI Engineering', tr: 'YZ Müh. Yüksek Lisans' },
    subtitle: { en: 'Üsküdar University', tr: 'Üsküdar Üniversitesi' },
  },
  {
    id: 'edu-itu',
    year: '2024+',
    title: { en: 'Ph.D. Industrial Eng.', tr: 'Endüstri Müh. Doktora' },
    subtitle: { en: 'Istanbul Tech. Uni.', tr: 'İTÜ' },
  },
]

// Educator - Teaching Timeline
export const educatorTimeline: TimelineItem[] = [
  {
    id: 'teach-prog1-2024',
    year: { en: 'Fall 2024', tr: 'Güz 2024' },
    title: { en: 'Basic Programming 1', tr: 'Temel Programlama 1' },
    subtitle: { en: 'İstinye University', tr: 'İstinye Üniversitesi' },
  },
  {
    id: 'teach-ml-2024',
    year: { en: 'Fall 2024', tr: 'Güz 2024' },
    title: { en: 'Machine Learning', tr: 'Makine Öğrenmesi' },
    subtitle: { en: 'İstinye University', tr: 'İstinye Üniversitesi' },
  },
  {
    id: 'teach-prog2-2025',
    year: { en: 'Spring 2025', tr: 'Bahar 2025' },
    title: { en: 'Basic Programming 2', tr: 'Temel Programlama 2' },
    subtitle: { en: 'İstinye University', tr: 'İstinye Üniversitesi' },
  },
  {
    id: 'teach-agents-2025',
    year: { en: 'Spring 2025', tr: 'Bahar 2025' },
    title: { en: 'Intelligent Agents', tr: 'Akıllı Ajanlar' },
    subtitle: { en: 'İstinye University', tr: 'İstinye Üniversitesi' },
  },
  {
    id: 'teach-ml-2025',
    year: { en: 'Fall 2025', tr: 'Güz 2025' },
    title: { en: 'Machine Learning', tr: 'Makine Öğrenmesi' },
    subtitle: { en: 'İstinye University', tr: 'İstinye Üniversitesi' },
  },
  {
    id: 'teach-ai-2026',
    year: { en: 'Spring 2026', tr: 'Bahar 2026' },
    title: { en: 'Artificial Intelligence', tr: 'Yapay Zeka' },
    subtitle: { en: 'Gedik University', tr: 'Gedik Üniversitesi' },
  },
  {
    id: 'teach-agents-2026',
    year: { en: 'Spring 2026', tr: 'Bahar 2026' },
    title: { en: 'Intelligent Agents', tr: 'Akıllı Ajanlar' },
    subtitle: { en: 'İstinye University', tr: 'İstinye Üniversitesi' },
  },
]
