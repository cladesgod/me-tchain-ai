import { useTranslation } from 'react-i18next'
import { projects, statusColors } from '@/data'
import { usePersonaStore } from '@/store'

export default function Projects() {
  const { t } = useTranslation()
  const { selectedPersona: persona } = usePersonaStore()

  // Sort projects: featured first, then by persona relevance
  const sortedProjects = [...projects].sort((a, b) => {
    // Featured projects first
    if (a.featured && !b.featured) return -1
    if (!a.featured && b.featured) return 1

    // Then by persona relevance if a persona is selected
    if (persona) {
      const aHasPersona = a.personas?.includes(persona) ?? false
      const bHasPersona = b.personas?.includes(persona) ?? false
      if (aHasPersona && !bHasPersona) return -1
      if (!aHasPersona && bHasPersona) return 1
    }

    return 0
  })

  return (
    <div className="min-h-screen bg-gray-950 py-20">
      <div className="container-custom">
        {/* Header */}
        <div className="max-w-3xl mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            {t('projects.title')}
          </h1>
          <p className="text-xl text-gray-400">
            {t('projects.subtitle')}
          </p>
        </div>

        {/* Projects Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {sortedProjects.map((project) => (
            <div
              key={project.id}
              className="group relative bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 hover:border-gray-700 transition-all duration-300"
            >
              {/* Featured badge */}
              {project.featured && (
                <div className="absolute -top-3 right-4">
                  <span className="px-3 py-1 text-xs font-medium rounded-full bg-[var(--persona-primary)]/20 text-[var(--persona-primary)] border border-[var(--persona-primary)]/30">
                    {t('projects.featured')}
                  </span>
                </div>
              )}

              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-white group-hover:text-[var(--persona-primary)] transition-colors">
                    {t(project.titleKey)}
                  </h3>
                  <span className="text-sm text-gray-500">{project.platform}</span>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full border ${statusColors[project.status]}`}>
                  {project.status}
                </span>
              </div>

              <p className="text-gray-400 mb-4">{t(project.descKey)}</p>

              <div className="flex flex-wrap gap-2 mb-4">
                {project.tech.map((tech) => (
                  <span
                    key={tech}
                    className="px-2 py-1 text-xs bg-gray-800 text-gray-300 rounded border border-gray-700"
                  >
                    {tech}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                <span className="text-sm text-[var(--persona-primary)] font-medium">
                  {t(project.statsKey)}
                </span>
                {project.link && (
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-gray-400 hover:text-white flex items-center gap-1 transition-colors"
                  >
                    {t('projects.viewProject')}
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
