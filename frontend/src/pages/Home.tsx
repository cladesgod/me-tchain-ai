import { useTranslation } from 'react-i18next'
import { Hero } from '@/components/home'
import { Card } from '@/components/ui'
import { Link } from 'react-router-dom'

// Skills/expertise
const skills = [
  { name: 'LangChain', category: 'LLM Framework' },
  { name: 'LangGraph', category: 'Agent Orchestration' },
  { name: 'FastAPI', category: 'Backend' },
  { name: 'PyTorch', category: 'Deep Learning' },
  { name: 'Python', category: 'Programming' },
  { name: 'Docker', category: 'DevOps' },
]

export default function Home() {
  const { t } = useTranslation()

  const featuredProjects = [
    {
      titleKey: 'home.project1Title',
      descKey: 'home.project1Desc',
      tech: ['GPT-4', 'Custom GPT'],
      link: '/projects',
      highlightKey: 'home.project1Highlight',
    },
    {
      titleKey: 'home.project2Title',
      descKey: 'home.project2Desc',
      tech: ['LangChain', 'LangGraph'],
      link: '/projects',
      highlightKey: 'home.project2Highlight',
    },
    {
      titleKey: 'home.project3Title',
      descKey: 'home.project3Desc',
      tech: ['LangSmith', 'LangGraph'],
      link: '/projects',
      highlightKey: 'home.project3Highlight',
    },
  ]

  return (
    <div>
      {/* Hero Section */}
      <Hero />

      {/* Featured Projects */}
      <section className="section">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {t('home.featuredProjects')}
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              {t('home.featuredProjectsDesc')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {featuredProjects.map((project) => (
              <Card key={project.titleKey} variant="elevated" className="group">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-semibold text-white group-hover:text-[var(--persona-primary)] transition-colors">
                    {t(project.titleKey)}
                  </h3>
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-[var(--persona-primary)]/20 text-[var(--persona-primary)]">
                    {t(project.highlightKey)}
                  </span>
                </div>
                <p className="text-gray-400 mb-4">{t(project.descKey)}</p>
                <div className="flex flex-wrap gap-2">
                  {project.tech.map((tech) => (
                    <span
                      key={tech}
                      className="px-2 py-1 text-xs bg-gray-800 text-gray-300 rounded border border-gray-700"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </Card>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link
              to="/projects"
              className="text-[var(--persona-primary)] hover:brightness-110 font-medium inline-flex items-center gap-2"
            >
              {t('home.viewAllProjects')}
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section className="section bg-gray-900/30">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {t('home.technologies')}
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              {t('home.technologiesDesc')}
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            {skills.map((skill) => (
              <div
                key={skill.name}
                className="px-6 py-3 bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 hover:border-[var(--persona-primary)]/50 transition-all"
              >
                <div className="font-semibold text-white">{skill.name}</div>
                <div className="text-xs text-gray-500">{skill.category}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--persona-primary)]/20 to-transparent" />
        <div className="container-custom text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {t('home.letsWork')}
          </h2>
          <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto">
            {t('home.letsWorkDesc')}
          </p>
          <Link to="/contact">
            <button className="btn bg-[var(--persona-primary)] text-white hover:brightness-110 px-8 py-3 text-lg">
              {t('home.contactMe')}
            </button>
          </Link>
        </div>
      </section>
    </div>
  )
}
