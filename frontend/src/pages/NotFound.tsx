import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export default function NotFound() {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen bg-gray-950 flex items-center">
      <div className="container-custom text-center">
        <h1 className="text-9xl font-bold text-gray-800 mb-4">404</h1>
        <h2 className="text-3xl font-bold text-white mb-4">
          {t('notFound.title')}
        </h2>
        <p className="text-lg text-gray-400 mb-8 max-w-md mx-auto">
          {t('notFound.description')}
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--persona-primary)] text-gray-900 font-semibold rounded-xl hover:opacity-90 transition-opacity"
        >
          {t('notFound.backHome')}
        </Link>
      </div>
    </div>
  )
}
