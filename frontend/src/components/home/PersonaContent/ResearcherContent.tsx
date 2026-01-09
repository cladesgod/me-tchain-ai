import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { PERSONAS } from '@/store'
import { publications, publicationTypeColors, publicationStats } from '@/data'

export function ResearcherContent() {
  const { t } = useTranslation()
  const persona = PERSONAS.researcher

  return (
    <>
      {/* Publication Stats */}
      <section className="py-8 px-4">
        <div className="container-custom">
          <div className="flex justify-center gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold" style={{ color: persona.color }}>
                {publicationStats.total}
              </div>
              <div className="text-sm text-gray-400">Total Publications</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold" style={{ color: persona.color }}>
                {publicationStats.conferences}
              </div>
              <div className="text-sm text-gray-400">{t('publications.conference')}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold" style={{ color: persona.color }}>
                {publicationStats.bookChapters}
              </div>
              <div className="text-sm text-gray-400">{t('publications.book')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Publications Section */}
      <section className="py-16 px-4">
        <div className="container-custom">
          <h2 className="text-3xl font-bold text-white mb-8">
            {t('publications.title')}
          </h2>

          <div className="space-y-6">
            {publications.map((pub) => (
              <div
                key={pub.id}
                className="group bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 hover:border-[var(--persona-primary)]/50 transition-all duration-300"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full border ${publicationTypeColors[pub.type]}`}
                      >
                        {t(pub.typeKey)}
                      </span>
                      <span className="text-sm text-gray-500">{t(pub.yearKey)}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-[var(--persona-primary)] transition-colors">
                      {t(pub.titleKey)}
                    </h3>
                    <p className="text-sm text-gray-400 mb-2">{t(pub.authorsKey)}</p>
                    <p className="text-sm mb-3" style={{ color: persona.color }}>
                      {t(pub.venueKey)}
                    </p>
                    <p className="text-sm text-gray-500">{t(pub.abstractKey)}</p>

                    {/* Links */}
                    <div className="flex gap-4 mt-4">
                      {pub.doi && (
                        <a
                          href={`https://doi.org/${pub.doi}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-gray-400 hover:text-white flex items-center gap-1 transition-colors"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            />
                          </svg>
                          DOI
                        </a>
                      )}
                      {pub.pdfUrl && (
                        <a
                          href={pub.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-gray-400 hover:text-white flex items-center gap-1 transition-colors"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                          PDF
                        </a>
                      )}
                    </div>
                  </div>
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
