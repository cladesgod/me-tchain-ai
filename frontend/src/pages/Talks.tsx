import { useTranslation } from 'react-i18next'
import { talks, courses, talkTypeColors, talkStats } from '@/data'

export default function Talks() {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen bg-gray-950 py-20">
      <div className="container-custom">
        {/* Header */}
        <div className="max-w-3xl mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            {t('talks.title')}
          </h1>
          <p className="text-xl text-gray-400">
            {t('talks.subtitle')}
          </p>

          {/* Stats */}
          <div className="flex gap-8 mt-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-[var(--persona-primary)]">{talkStats.universities}</div>
              <div className="text-sm text-gray-400">{t('talks.universities')}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[var(--persona-primary)]">{talkStats.totalTalks}</div>
              <div className="text-sm text-gray-400">{t('talks.totalTalks')}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[var(--persona-primary)]">{talkStats.studentsReached}</div>
              <div className="text-sm text-gray-400">{t('talks.studentsReached')}</div>
            </div>
          </div>
        </div>

        {/* Talks */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-6">{t('talks.invitedTalks')}</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {talks.map((talk) => (
              <div
                key={talk.id}
                className="group bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 hover:border-gray-700 transition-all duration-300"
              >
                <div className="flex justify-between items-start mb-3">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full border ${talkTypeColors[talk.type]}`}>
                    {t(talk.typeKey)}
                  </span>
                  <span className="text-sm text-gray-500">{t(talk.dateKey)}</span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-[var(--persona-primary)] transition-colors">
                  "{t(talk.titleKey)}"
                </h3>
                <p className="text-gray-400">{t(talk.venueKey)}</p>
                {talk.location && (
                  <div className="flex items-center gap-1 mt-2 text-sm text-gray-500">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {talk.location.city}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Teaching */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">{t('talks.teaching')}</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {courses.map((course) => (
              <div
                key={course.id}
                className="group bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 hover:border-gray-700 transition-all duration-300"
              >
                <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-[var(--persona-primary)] transition-colors">
                  {t(course.courseKey)}
                </h3>
                <p className="text-[var(--persona-primary)]">{t(course.uniKey)}</p>
                <p className="text-sm text-gray-500">{t(course.deptKey)}</p>
                <p className="text-sm text-gray-400 mt-2">{t(course.periodKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
