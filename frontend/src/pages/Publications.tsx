import { useTranslation } from 'react-i18next'
import { publications, publicationTypeColors, publicationStats } from '@/data'

export default function Publications() {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen bg-gray-950 py-20">
      <div className="container-custom">
        {/* Header */}
        <div className="max-w-3xl mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            {t('publications.title')}
          </h1>
          <p className="text-xl text-gray-400">
            {t('publications.subtitle')}
          </p>

          {/* Stats */}
          <div className="flex gap-8 mt-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-[var(--persona-primary)]">{publicationStats.total}</div>
              <div className="text-sm text-gray-400">Total</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[var(--persona-primary)]">{publicationStats.conferences}</div>
              <div className="text-sm text-gray-400">{t('publications.conference')}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[var(--persona-primary)]">{publicationStats.bookChapters}</div>
              <div className="text-sm text-gray-400">{t('publications.book')}</div>
            </div>
          </div>
        </div>

        {/* Publications List */}
        <div className="space-y-6">
          {publications.map((pub) => (
            <div
              key={pub.id}
              className="group bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 hover:border-gray-700 transition-all duration-300"
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${publicationTypeColors[pub.type]}`}>
                      {t(pub.typeKey)}
                    </span>
                    <span className="text-sm text-gray-500">{t(pub.yearKey)}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-[var(--persona-primary)] transition-colors">
                    {t(pub.titleKey)}
                  </h3>
                  <p className="text-sm text-gray-400 mb-2">{t(pub.authorsKey)}</p>
                  <p className="text-sm text-[var(--persona-primary)] mb-3">{t(pub.venueKey)}</p>
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
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
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
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
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
    </div>
  )
}
