export type PublicationType = 'Conference Paper' | 'Book Chapter' | 'Journal Article' | 'Preprint'

export interface Publication {
  id: string
  titleKey: string
  authorsKey: string
  venueKey: string
  yearKey: string
  typeKey: string
  abstractKey: string
  type: PublicationType
  // Optional links
  doi?: string
  pdfUrl?: string
  arxivUrl?: string
  codeUrl?: string
  // Citation info
  citations?: number
}

export const publications: Publication[] = [
  {
    id: 'infus-2025-sql',
    titleKey: 'publications.pub1Title',
    authorsKey: 'publications.pub1Authors',
    venueKey: 'publications.pub1Venue',
    yearKey: 'publications.pub1Year',
    typeKey: 'publications.pub1Type',
    abstractKey: 'publications.pub1Abstract',
    type: 'Conference Paper',
  },
  {
    id: 'crc-2024-gpt-audience',
    titleKey: 'publications.pub2Title',
    authorsKey: 'publications.pub2Authors',
    venueKey: 'publications.pub2Venue',
    yearKey: 'publications.pub2Year',
    typeKey: 'publications.pub2Type',
    abstractKey: 'publications.pub2Abstract',
    type: 'Book Chapter',
  },
  {
    id: 'crc-2024-bias',
    titleKey: 'publications.pub3Title',
    authorsKey: 'publications.pub3Authors',
    venueKey: 'publications.pub3Venue',
    yearKey: 'publications.pub3Year',
    typeKey: 'publications.pub3Type',
    abstractKey: 'publications.pub3Abstract',
    type: 'Book Chapter',
  },
]

// Type colors for UI
export const publicationTypeColors: Record<PublicationType, string> = {
  'Conference Paper': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'Book Chapter': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  'Journal Article': 'bg-green-500/20 text-green-400 border-green-500/30',
  Preprint: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
}

// Stats
export const publicationStats = {
  total: 3,
  conferences: 1,
  bookChapters: 2,
}
