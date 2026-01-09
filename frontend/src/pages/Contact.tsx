import { useTranslation } from 'react-i18next'

const contactInfo = [
  {
    labelKey: 'contact.email',
    value: 'timucinutkan@gmail.com',
    href: 'mailto:timucinutkan@gmail.com',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    label: 'LinkedIn',
    value: 'linkedin.com/in/timucinutkan',
    href: 'https://linkedin.com/in/timucinutkan',
    icon: (
      <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
      </svg>
    ),
  },
  {
    label: 'GitHub',
    value: 'github.com/timucinutkan',
    href: 'https://github.com/timucinutkan',
    icon: (
      <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
        <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
      </svg>
    ),
  },
  {
    label: 'Website',
    value: 'tchain.ai',
    href: 'https://tchain.ai',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
      </svg>
    ),
  },
]

export default function Contact() {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen bg-gray-950 py-20">
      <div className="container-custom">
        {/* Header */}
        <div className="max-w-3xl mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            {t('contact.title')}
          </h1>
          <p className="text-xl text-gray-400">
            {t('contact.subtitle')}
          </p>
        </div>

        {/* Contact Links */}
        <div className="max-w-2xl">
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-8">
            <h2 className="text-xl font-semibold text-white mb-6">
              {t('contact.getInTouch')}
            </h2>
            <div className="space-y-4">
              {contactInfo.map((info) => (
                <a
                  key={info.value}
                  href={info.href}
                  target={info.href.startsWith('http') ? '_blank' : undefined}
                  rel={info.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="flex items-center gap-4 p-4 rounded-xl border border-gray-800 hover:border-[var(--persona-primary)]/50 hover:bg-gray-800/50 transition-all group"
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[var(--persona-primary)]/20 flex items-center justify-center text-[var(--persona-primary)] group-hover:bg-[var(--persona-primary)]/30 transition-colors">
                    {info.icon}
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">
                      {info.labelKey ? t(info.labelKey) : info.label}
                    </div>
                    <div className="font-medium text-white group-hover:text-[var(--persona-primary)] transition-colors">
                      {info.value}
                    </div>
                  </div>
                  <svg
                    className="ml-auto h-5 w-5 text-gray-600 group-hover:text-[var(--persona-primary)] transition-colors"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              ))}
            </div>

            {/* Additional Info */}
            <div className="mt-8 pt-6 border-t border-gray-800">
              <p className="text-gray-400 text-center">
                {t('contact.linkedinTip')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
