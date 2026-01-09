import { useTranslation } from 'react-i18next'

export default function Blog() {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen bg-gray-950 py-20">
      <div className="container-custom">
        {/* Header */}
        <div className="max-w-3xl mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            {t('blog.title')}
          </h1>
          <p className="text-xl text-gray-400">
            {t('blog.subtitle')}
          </p>
        </div>

        {/* Coming Soon */}
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[var(--persona-primary)]/20 mb-6">
            <svg className="h-10 w-10 text-[var(--persona-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-white mb-4">
            {t('blog.comingSoon')}
          </h2>
          <p className="text-gray-400 max-w-md mx-auto">
            {t('blog.comingSoonDesc')}
          </p>
        </div>
      </div>
    </div>
  )
}
