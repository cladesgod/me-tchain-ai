export type TalkType = 'Workshop' | 'Keynote' | 'Talk' | 'Panel' | 'Seminar'

export interface Talk {
  id: string
  titleKey: string
  venueKey: string
  dateKey: string
  typeKey: string
  type: TalkType
  // For map visualization
  location?: {
    lat: number
    lng: number
    city: string
  }
  // Optional media
  videoUrl?: string
  slidesUrl?: string
  photoUrl?: string
}

export interface Course {
  id: string
  courseKey: string
  uniKey: string
  deptKey: string
  periodKey: string
  // Additional metadata
  semester?: string
  students?: number
}

export const talks: Talk[] = [
  {
    id: 'unesco-istinye-2025',
    titleKey: 'talks.talk1Title',
    venueKey: 'talks.talk1Venue',
    dateKey: 'talks.talk1Date',
    typeKey: 'talks.talk1Type',
    type: 'Keynote',
    location: {
      lat: 41.1067,
      lng: 29.0237,
      city: 'Istanbul',
    },
  },
  {
    id: 'uludag-2025',
    titleKey: 'talks.talk2Title',
    venueKey: 'talks.talk2Venue',
    dateKey: 'talks.talk2Date',
    typeKey: 'talks.talk2Type',
    type: 'Keynote',
    location: {
      lat: 40.2269,
      lng: 28.8786,
      city: 'Bursa',
    },
  },
  {
    id: 'gedik-2025',
    titleKey: 'talks.talk3Title',
    venueKey: 'talks.talk3Venue',
    dateKey: 'talks.talk3Date',
    typeKey: 'talks.talk3Type',
    type: 'Workshop',
    location: {
      lat: 40.9632,
      lng: 29.2494,
      city: 'Istanbul',
    },
  },
  {
    id: 'ataturk-2024',
    titleKey: 'talks.talk4Title',
    venueKey: 'talks.talk4Venue',
    dateKey: 'talks.talk4Date',
    typeKey: 'talks.talk4Type',
    type: 'Keynote',
    location: {
      lat: 39.9042,
      lng: 41.2679,
      city: 'Erzurum',
    },
  },
  {
    id: 'trakya-2024',
    titleKey: 'talks.talk5Title',
    venueKey: 'talks.talk5Venue',
    dateKey: 'talks.talk5Date',
    typeKey: 'talks.talk5Type',
    type: 'Keynote',
    location: {
      lat: 41.6818,
      lng: 26.5623,
      city: 'Edirne',
    },
  },
  {
    id: 'istinye-2024',
    titleKey: 'talks.talk6Title',
    venueKey: 'talks.talk6Venue',
    dateKey: 'talks.talk6Date',
    typeKey: 'talks.talk6Type',
    type: 'Workshop',
    location: {
      lat: 41.1067,
      lng: 29.0237,
      city: 'Istanbul',
    },
  },
  {
    id: 'erzincan-2025',
    titleKey: 'talks.talk7Title',
    venueKey: 'talks.talk7Venue',
    dateKey: 'talks.talk7Date',
    typeKey: 'talks.talk7Type',
    type: 'Keynote',
    location: {
      lat: 39.7500,
      lng: 39.5000,
      city: 'Erzincan',
    },
  },
]

export const courses: Course[] = [
  {
    id: 'intelligent-agents',
    courseKey: 'talks.course1Name',
    uniKey: 'talks.course1Uni',
    deptKey: 'talks.course1Dept',
    periodKey: 'talks.course1Period',
    semester: 'Fall 2024',
  },
  {
    id: 'machine-learning',
    courseKey: 'talks.course2Name',
    uniKey: 'talks.course2Uni',
    deptKey: 'talks.course2Dept',
    periodKey: 'talks.course2Period',
    semester: 'Fall 2024',
  },
  {
    id: 'basic-programming',
    courseKey: 'talks.course3Name',
    uniKey: 'talks.course3Uni',
    deptKey: 'talks.course3Dept',
    periodKey: 'talks.course3Period',
    semester: 'Fall 2024, Spring 2025',
  },
  {
    id: 'gedik-ai',
    courseKey: 'talks.course4Name',
    uniKey: 'talks.course4Uni',
    deptKey: 'talks.course4Dept',
    periodKey: 'talks.course4Period',
    semester: 'Spring 2026',
  },
]

// Type colors for UI
export const talkTypeColors: Record<TalkType, string> = {
  Workshop: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  Keynote: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  Talk: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  Panel: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  Seminar: 'bg-green-500/20 text-green-400 border-green-500/30',
}

// Stats
export const talkStats = {
  keynotes: 5,
  workshops: 2,
  universities: 6,
  totalTalks: 7,
  studentsReached: '500+',
}

export const courseStats = {
  courses: 4,
  universities: 2,
}
