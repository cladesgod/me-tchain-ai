import { useTranslation } from 'react-i18next'

const RESUME_URL = '/assets/documents/resume.pdf'

export default function Resume() {
  const { t } = useTranslation()

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = RESUME_URL
    link.download = 'Kazim_Timucin_Utkan_CV.pdf'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="min-h-screen bg-gray-950 py-20">
      <div className="container-custom">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
              {t('resume.title')}
            </h1>
            <p className="text-gray-400">
              {t('resume.subtitle')}
            </p>
          </div>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-6 py-3 bg-[var(--persona-primary)] hover:bg-[var(--persona-primary)]/80 text-white font-medium rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            {t('resume.download')}
          </button>
        </div>

        {/* PDF Viewer */}
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl overflow-hidden">
          <iframe
            src={`${RESUME_URL}#toolbar=0&navpanes=0`}
            className="w-full h-[80vh] min-h-[600px]"
            title="Resume"
          />
        </div>

        {/* Fallback for mobile */}
        <div className="mt-4 text-center text-gray-500 text-sm">
          {t('resume.viewIssue')}{' '}
          <a
            href={RESUME_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--persona-primary)] hover:underline"
          >
            {t('resume.openNewTab')}
          </a>
        </div>
      </div>
    </div>
  )
}
