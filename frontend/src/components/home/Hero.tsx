import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui'
import { PersonaSelector } from './PersonaSelector'
import { usePersonaStore, PERSONAS } from '@/store'

export function Hero() {
  const { t, i18n } = useTranslation()
  const { selectedPersona } = usePersonaStore()
  const isEnglish = i18n.language === 'en'

  const activePersona = selectedPersona ? PERSONAS[selectedPersona] : null

  // Dynamic content based on persona
  const title = activePersona
    ? isEnglish
      ? activePersona.title
      : activePersona.titleTR
    : t('hero.name')

  const subtitle = activePersona
    ? isEnglish
      ? activePersona.subtitle
      : activePersona.subtitleTR
    : t('hero.description')

  const stats = activePersona?.stats || [
    { value: t('hero.stat1Value'), label: isEnglish ? t('hero.stat1Label') : t('hero.stat1Label') },
    { value: t('hero.stat2Value'), label: isEnglish ? t('hero.stat2Label') : t('hero.stat2Label') },
    { value: t('hero.stat3Value'), label: isEnglish ? t('hero.stat3Label') : t('hero.stat3Label') },
  ]

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-gray-950">
      {/* Animated gradient background */}
      <div
        className="absolute inset-0 transition-all duration-1000"
        style={{
          background: activePersona
            ? `radial-gradient(ellipse at 50% 0%, ${activePersona.color}15 0%, transparent 50%),
               radial-gradient(ellipse at 80% 50%, ${activePersona.color}10 0%, transparent 40%),
               radial-gradient(ellipse at 20% 80%, ${activePersona.color}08 0%, transparent 40%)`
            : 'radial-gradient(ellipse at 50% 0%, #22d3ee10 0%, transparent 50%)',
        }}
      />

      {/* Grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20" />

      {/* Content */}
      <div className="container-custom relative z-10 py-20">
        {/* Name - always visible */}
        <div className="text-center mb-12">
          <p className="text-gray-400 mb-2">{t('hero.greeting')}</p>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-4">
            Timuçin{' '}
            <span
              className="transition-colors duration-500"
              style={{ color: activePersona?.color || '#22d3ee' }}
            >
              Utkan
            </span>
          </h1>
        </div>

        {/* Persona Selector */}
        <div className="mb-16">
          <PersonaSelector />
        </div>

        {/* Dynamic content - shows after persona selection */}
        <div
          className={`text-center transition-all duration-500 ${
            selectedPersona ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
          }`}
        >
          {/* Role title */}
          <div
            className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm mb-6 transition-all duration-500"
            style={{
              backgroundColor: activePersona ? `${activePersona.color}20` : 'transparent',
              color: activePersona?.color || '#22d3ee',
              border: `1px solid ${activePersona?.color || '#22d3ee'}40`,
            }}
          >
            <span className="relative flex h-2 w-2">
              <span
                className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                style={{ backgroundColor: activePersona?.color || '#22d3ee' }}
              />
              <span
                className="relative inline-flex rounded-full h-2 w-2"
                style={{ backgroundColor: activePersona?.color || '#22d3ee' }}
              />
            </span>
            {title}
          </div>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-gray-300 mb-10 max-w-2xl mx-auto text-balance">
            {subtitle}
          </p>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 md:gap-12 mb-10">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div
                  className="text-3xl md:text-4xl font-bold transition-colors duration-500"
                  style={{ color: activePersona?.color || '#22d3ee' }}
                >
                  {typeof stat.value === 'string' ? stat.value : stat.value}
                </div>
                <div className="text-sm text-gray-400">
                  {isEnglish
                    ? typeof stat.label === 'string'
                      ? stat.label
                      : stat.label
                    : 'labelTR' in stat
                      ? stat.labelTR
                      : stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/projects">
              <Button
                size="lg"
                className="transition-all duration-300"
                style={{
                  backgroundColor: activePersona?.color || '#22d3ee',
                  borderColor: activePersona?.color || '#22d3ee',
                }}
              >
                {t('hero.viewProjects')}
              </Button>
            </Link>
            <Link to="/contact">
              <Button
                variant="outline"
                size="lg"
                className="transition-all duration-300 border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                {t('hero.getInTouch')}
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        className={`absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce transition-opacity duration-500 ${
          selectedPersona ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <svg
          className="h-6 w-6 text-gray-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      </div>
    </section>
  )
}
