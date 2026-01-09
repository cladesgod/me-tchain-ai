import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { PERSONAS } from '@/store'
import { projects, statusColors } from '@/data'

export function EngineerContent() {
  const { t } = useTranslation()
  const persona = PERSONAS.engineer

  // Filter projects for engineer persona
  const engineerProjects = projects.filter(
    (p) => !p.personas || p.personas.includes('engineer')
  )

  return (
    <>
      {/* Projects Section */}
      <section className="py-16 px-4">
        <div className="container-custom">
          <h2 className="text-3xl font-bold text-white mb-8">
            {t('projects.title')}
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {engineerProjects.map((project) => (
              <div
                key={project.id}
                className="group bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 hover:border-[var(--persona-primary)]/50 transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-3">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full border ${statusColors[project.status]}`}
                  >
                    {project.status}
                  </span>
                  <span className="text-sm text-gray-500">{project.platform}</span>
                </div>

                <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-[var(--persona-primary)] transition-colors">
                  {t(project.titleKey)}
                </h3>
                <p className="text-sm text-gray-400 mb-4">{t(project.descKey)}</p>

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

                <div className="flex gap-3">
                  {project.link && (
                    <a
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-[var(--persona-primary)] hover:underline"
                    >
                      {t('projects.viewProject')} →
                    </a>
                  )}
                  {project.github && (
                    <a
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-gray-400 hover:text-white"
                    >
                      GitHub →
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4">
        <div className="container-custom text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            {t('home.letsWork')}
          </h2>
          <p className="text-gray-400 mb-8 max-w-xl mx-auto">
            {t('home.letsWorkDesc')}
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-white transition-all hover:brightness-110"
            style={{ backgroundColor: persona.color }}
          >
            {t('home.contactMe')}
          </Link>
        </div>
      </section>
    </>
  )
}
