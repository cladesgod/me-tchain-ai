import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { PERSONAS } from '@/store'
import { talks, talkTypeColors, talkStats } from '@/data'

export function SpeakerContent() {
  const { t } = useTranslation()
  const persona = PERSONAS.speaker

  return (
    <>
      {/* Stats Section */}
      <section className="py-8 px-4">
        <div className="container-custom">
          <div className="flex justify-center gap-8 md:gap-12">
            <div className="text-center">
              <div
                className="text-3xl md:text-4xl font-bold"
                style={{ color: persona.color }}
              >
                {talkStats.universities}
              </div>
              <div className="text-sm text-gray-400">{t('talks.universities')}</div>
            </div>
            <div className="text-center">
              <div
                className="text-3xl md:text-4xl font-bold"
                style={{ color: persona.color }}
              >
                {talkStats.totalTalks}
              </div>
              <div className="text-sm text-gray-400">{t('talks.totalTalks')}</div>
            </div>
            <div className="text-center">
              <div
                className="text-3xl md:text-4xl font-bold"
                style={{ color: persona.color }}
              >
                {talkStats.studentsReached}
              </div>
              <div className="text-sm text-gray-400">{t('talks.studentsReached')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Talks Section */}
      <section className="py-16 px-4">
        <div className="container-custom">
          <h2 className="text-3xl font-bold text-white mb-8">
            {t('talks.invitedTalks')}
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {talks.map((talk) => (
              <div
                key={talk.id}
                className="group bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 hover:border-[var(--persona-primary)]/50 transition-all duration-300"
              >
                <div className="flex justify-between items-start mb-3">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full border ${talkTypeColors[talk.type]}`}
                  >
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
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    {talk.location.city}
                  </div>
                )}
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
