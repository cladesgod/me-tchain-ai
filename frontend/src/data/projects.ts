export type ProjectStatus = 'Live' | 'Beta' | 'Production' | 'Completed' | 'Research'

export interface Project {
  id: string
  titleKey: string
  descKey: string
  tech: string[]
  status: ProjectStatus
  statsKey: string
  link: string | null
  platform: string
  github?: string
  featured?: boolean
  // For persona filtering
  personas?: ('engineer' | 'researcher' | 'speaker' | 'educator')[]
  // Detail page fields
  fullDescriptionKey?: string
  challengeKey?: string
  solutionKey?: string
  resultsKeys?: string[]
  screenshots?: string[]
  architectureDiagram?: string
  learningsKeys?: string[]
  relatedProjectIds?: string[]
}

export const projects: Project[] = [
  {
    id: 'apa-citation-helper',
    titleKey: 'projects.project1Title',
    descKey: 'projects.project1Desc',
    tech: ['GPT-4', 'Custom GPT', 'Prompt Engineering'],
    status: 'Live',
    statsKey: 'projects.project1Stats',
    link: 'https://chatgpt.com/g/g-p4EdxSPHT-apa-7-citation-helper',
    platform: 'GPT Store',
    featured: true,
    personas: ['engineer'],
    fullDescriptionKey: 'projects.project1FullDesc',
    challengeKey: 'projects.project1Challenge',
    solutionKey: 'projects.project1Solution',
    resultsKeys: ['projects.project1Result1', 'projects.project1Result2', 'projects.project1Result3'],
    learningsKeys: ['projects.project1Learning1', 'projects.project1Learning2'],
    relatedProjectIds: ['ects-transfer-system', 'ai-exam-grading'],
  },
  {
    id: 'ects-transfer-system',
    titleKey: 'projects.project2Title',
    descKey: 'projects.project2Desc',
    tech: ['LangChain', 'LangGraph', 'Semantic Search', 'FastAPI'],
    status: 'Beta',
    statsKey: 'projects.project2Stats',
    link: 'https://bi-ml.tchain.ai',
    platform: 'Web App',
    featured: true,
    personas: ['engineer', 'researcher'],
  },
  {
    id: 'ai-exam-grading',
    titleKey: 'projects.project3Title',
    descKey: 'projects.project3Desc',
    tech: ['LangSmith', 'LangGraph', 'FastAPI', 'Python'],
    status: 'Beta',
    statsKey: 'projects.project3Stats',
    link: null,
    platform: 'API',
    featured: true,
    personas: ['engineer', 'educator'],
  },
  {
    id: 'rag-translation-pipeline',
    titleKey: 'projects.project4Title',
    descKey: 'projects.project4Desc',
    tech: ['LangChain', 'OpenAI', 'FastAPI', 'Docker', 'RAG'],
    status: 'Production',
    statsKey: 'projects.project4Stats',
    link: null,
    platform: 'Enterprise',
    personas: ['engineer'],
  },
  {
    id: 'company-agent-swarm',
    titleKey: 'projects.project5Title',
    descKey: 'projects.project5Desc',
    tech: ['AutoGen', 'Multi-Agent', 'Email Automation', 'Python'],
    status: 'Completed',
    statsKey: 'projects.project5Stats',
    link: null,
    platform: 'Research',
    personas: ['researcher'],
  },
  {
    id: 'disease-prediction',
    titleKey: 'projects.project6Title',
    descKey: 'projects.project6Desc',
    tech: ['XGBoost', 'Random Forest', 'Scikit-Learn', 'Python'],
    status: 'Completed',
    statsKey: 'projects.project6Stats',
    link: null,
    platform: 'Healthcare',
    personas: ['researcher'],
  },
]

// Helper to get featured projects
export const getFeaturedProjects = (): Project[] => {
  return projects.filter((p) => p.featured)
}

// Helper to get projects by persona
export const getProjectsByPersona = (persona: 'engineer' | 'researcher' | 'speaker' | 'educator'): Project[] => {
  return projects.filter((p) => p.personas?.includes(persona))
}

// Helper to get project by ID
export const getProjectById = (id: string): Project | undefined => {
  return projects.find((p) => p.id === id)
}

// Helper to get related projects
export const getRelatedProjects = (projectId: string): Project[] => {
  const project = getProjectById(projectId)
  if (!project?.relatedProjectIds) return []
  return project.relatedProjectIds.map((id) => getProjectById(id)).filter((p): p is Project => p !== undefined)
}

// Status colors for UI
export const statusColors: Record<ProjectStatus, string> = {
  Live: 'bg-green-500/20 text-green-400 border-green-500/30',
  Beta: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  Production: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  Completed: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  Research: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
}
