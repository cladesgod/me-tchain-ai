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
  company?: string
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
  // ============== tchain.ai (Personal Projects - Top) ==============
  {
    id: 'apa-citation-helper',
    titleKey: 'projects.project1Title',
    descKey: 'projects.project1Desc',
    tech: ['GPT-4', 'Custom GPT', 'Prompt Engineering'],
    status: 'Live',
    statsKey: 'projects.project1Stats',
    link: 'https://chatgpt.com/g/g-p4EdxSPHT-apa-7-citation-helper',
    platform: 'GPT Store',
    company: 'tchain.ai',
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
    company: 'tchain.ai',
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
    company: 'tchain.ai',
    featured: true,
    personas: ['engineer', 'educator'],
  },
  // ============== Turkcell & İTÜ (July 2025 - Present) ==============
  {
    id: 'turkcell-ensemble',
    titleKey: 'projects.project7Title',
    descKey: 'projects.project7Desc',
    tech: ['XGBoost', 'LightGBM', 'CatBoost', 'LangChain', 'Python'],
    status: 'Production',
    statsKey: 'projects.project7Stats',
    link: null,
    platform: 'Enterprise',
    company: 'Turkcell & İTÜ',
    personas: ['engineer', 'researcher'],
  },
  // ============== MLPCare (Aug 2024 - July 2025) ==============
  {
    id: 'rag-translation-pipeline',
    titleKey: 'projects.project4Title',
    descKey: 'projects.project4Desc',
    tech: ['LangChain', 'OpenAI', 'FastAPI', 'Docker', 'RAG'],
    status: 'Production',
    statsKey: 'projects.project4Stats',
    link: null,
    platform: 'Enterprise',
    company: 'MLPCare',
    personas: ['engineer'],
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
    company: 'MLPCare',
    personas: ['engineer', 'researcher'],
  },
  {
    id: 'lstm-revenue-forecast',
    titleKey: 'projects.project8Title',
    descKey: 'projects.project8Desc',
    tech: ['LSTM', 'PyTorch', 'Time-series', 'Python'],
    status: 'Completed',
    statsKey: 'projects.project8Stats',
    link: null,
    platform: 'Healthcare',
    company: 'MLPCare',
    personas: ['engineer', 'researcher'],
  },
  // ============== Istinye University (Aug 2022 - July 2024) ==============
  {
    id: 'company-agent-swarm',
    titleKey: 'projects.project5Title',
    descKey: 'projects.project5Desc',
    tech: ['AutoGen', 'Multi-Agent', 'Email Automation', 'Python'],
    status: 'Completed',
    statsKey: 'projects.project5Stats',
    link: null,
    platform: 'Research',
    company: 'Istinye University',
    personas: ['researcher'],
  },
  {
    id: 'social-media-agents',
    titleKey: 'projects.project9Title',
    descKey: 'projects.project9Desc',
    tech: ['LLMs', 'Python', 'Automation', 'NLP'],
    status: 'Completed',
    statsKey: 'projects.project9Stats',
    link: null,
    platform: 'Research',
    company: 'Istinye University',
    personas: ['engineer'],
  },
  // ============== Istinye University MIS Lab (Dec 2022 - March 2024) ==============
  {
    id: 'audience-psychology-sim',
    titleKey: 'projects.project10Title',
    descKey: 'projects.project10Desc',
    tech: ['Python', 'State-machine', 'Simulation'],
    status: 'Research',
    statsKey: 'projects.project10Stats',
    link: null,
    platform: 'Research',
    company: 'Istinye University MIS Lab',
    personas: ['researcher'],
  },
  {
    id: 'semantic-category-matching',
    titleKey: 'projects.project11Title',
    descKey: 'projects.project11Desc',
    tech: ['NLP', 'Feature Extraction', 'Python', 'Scikit-Learn'],
    status: 'Completed',
    statsKey: 'projects.project11Stats',
    link: null,
    platform: 'Enterprise',
    company: 'Entegra Bilişim',
    personas: ['engineer'],
  },
  // ============== Datafirst.store (Sep 2021 - May 2022) ==============
  {
    id: 'ebebek-sales-forecast',
    titleKey: 'projects.project12Title',
    descKey: 'projects.project12Desc',
    tech: ['XGBoost', 'LightGBM', 'Scikit-Learn', 'Python'],
    status: 'Completed',
    statsKey: 'projects.project12Stats',
    link: null,
    platform: 'E-commerce',
    company: 'Datafirst.store',
    personas: ['engineer'],
  },
  {
    id: 'stress-detection',
    titleKey: 'projects.project13Title',
    descKey: 'projects.project13Desc',
    tech: ['ML', 'Biometrics', 'Swift', 'Apple Watch'],
    status: 'Completed',
    statsKey: 'projects.project13Stats',
    link: null,
    platform: 'Mobile',
    company: 'Datafirst.store',
    personas: ['researcher'],
  },
  {
    id: 'license-plate-recognition',
    titleKey: 'projects.project14Title',
    descKey: 'projects.project14Desc',
    tech: ['OpenCV', 'Tesseract OCR', 'Python', 'Computer Vision'],
    status: 'Completed',
    statsKey: 'projects.project14Stats',
    link: null,
    platform: 'Edge Computing',
    company: 'Datafirst.store',
    personas: ['engineer'],
  },
]

// Status colors for UI
export const statusColors: Record<ProjectStatus, string> = {
  Live: 'bg-green-500/20 text-green-400 border-green-500/30',
  Beta: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  Production: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  Completed: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  Research: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
}

// Project stats for Engineer persona
export const projectStats = {
  total: projects.filter((p) => !p.personas || p.personas.includes('engineer')).length,
  production: projects.filter((p) => p.status === 'Production' && (!p.personas || p.personas.includes('engineer'))).length,
  gptStoreUsers: '100K+',
}
