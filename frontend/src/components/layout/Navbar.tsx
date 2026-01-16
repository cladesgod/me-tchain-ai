import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { cn } from '@/utils'
import LanguageToggle from '@/components/ui/LanguageToggle'
import { usePersonaStore, PERSONAS } from '@/store'

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [showChangeButton, setShowChangeButton] = useState(false)
  const location = useLocation()
  const { t } = useTranslation()
  const { selectedPersona } = usePersonaStore()

  // Track scroll position for "Change Character" button visibility
  useEffect(() => {
    const handleScroll = () => {
      // Show button when scrolled past half viewport
      setShowChangeButton(window.scrollY > window.innerHeight * 0.5)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <nav className="fixed top-0 z-50 w-full bg-gray-950/80 backdrop-blur-md border-b border-gray-800">
      <div className="container-custom">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span
              className="text-xl font-bold transition-colors duration-300"
              style={{ color: selectedPersona ? PERSONAS[selectedPersona].color : 'white' }}
            >
              tchain.ai
            </span>
          </Link>

          {/* Center: Change Character Button (on landing page, when scrolled, and persona selected) */}
          {location.pathname === '/' && showChangeButton && selectedPersona && (
            <button
              onClick={scrollToTop}
              className={cn(
                'absolute left-1/2 -translate-x-1/2',
                'hidden md:flex items-center gap-2',
                'px-4 py-2 rounded-lg',
                'bg-gray-900/90 backdrop-blur-sm border-2',
                'text-sm font-medium',
                'hover:scale-105 hover:bg-gray-800/90 active:scale-95',
                'transition-all duration-200 cursor-pointer'
              )}
              style={{
                boxShadow: `0 0 15px ${PERSONAS[selectedPersona].color}30`,
                borderColor: PERSONAS[selectedPersona].color,
                color: PERSONAS[selectedPersona].color,
              }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
              <span>Change Character</span>
            </button>
          )}

          {/* Center: Back to Characters Button (on non-landing pages) */}
          {location.pathname !== '/' && (
            <Link
              to="/"
              className={cn(
                'absolute left-1/2 -translate-x-1/2',
                'hidden md:flex items-center gap-2',
                'px-4 py-2 rounded-lg',
                'bg-gray-900/90 backdrop-blur-sm border-2',
                'text-sm font-medium',
                'hover:scale-105 hover:bg-gray-800/90 active:scale-95',
                'transition-all duration-200',
                selectedPersona
                  ? ''
                  : 'border-purple-500 text-purple-400'
              )}
              style={
                selectedPersona
                  ? {
                      boxShadow: `0 0 15px ${PERSONAS[selectedPersona].color}30`,
                      borderColor: PERSONAS[selectedPersona].color,
                      color: PERSONAS[selectedPersona].color,
                    }
                  : {
                      boxShadow: '0 0 15px rgba(168, 85, 247, 0.3)',
                    }
              }
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>{t('landing.backToCharacters')}</span>
            </Link>
          )}

          {/* Desktop: Right side */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              to="/resume"
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                location.pathname === '/resume'
                  ? 'text-[var(--persona-primary)] bg-gray-800'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              )}
            >
              {t('nav.resume')}
            </Link>
            <Link
              to="/contact"
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                location.pathname === '/contact'
                  ? 'text-[var(--persona-primary)] bg-gray-800'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              )}
            >
              {t('nav.contact')}
            </Link>
            <div className="pl-2 border-l border-gray-700">
              <LanguageToggle />
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <LanguageToggle />
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white"
              aria-label="Toggle menu"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMobileMenuOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-800">
            <div className="flex flex-col gap-1">
              <Link
                to="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  location.pathname === '/'
                    ? 'text-[var(--persona-primary)] bg-gray-800'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                )}
              >
                {t('nav.home')}
              </Link>
              <Link
                to="/resume"
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  location.pathname === '/resume'
                    ? 'text-[var(--persona-primary)] bg-gray-800'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                )}
              >
                {t('nav.resume')}
              </Link>
              <Link
                to="/contact"
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  location.pathname === '/contact'
                    ? 'text-[var(--persona-primary)] bg-gray-800'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                )}
              >
                {t('nav.contact')}
              </Link>
              {/* Mobile: Change Character button (on landing page) */}
              {location.pathname === '/' && selectedPersona && (
                <button
                  onClick={() => {
                    scrollToTop()
                    setIsMobileMenuOpen(false)
                  }}
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-medium transition-colors text-left',
                    'text-gray-400 hover:text-white hover:bg-gray-800/50'
                  )}
                  style={{ color: PERSONAS[selectedPersona].color }}
                >
                  {t('landing.changeCharacterLong')}
                </button>
              )}
              {/* Mobile: Back to Characters button (on non-landing pages) */}
              {location.pathname !== '/' && (
                <Link
                  to="/"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2',
                    selectedPersona
                      ? ''
                      : 'text-purple-400 hover:text-purple-300 hover:bg-gray-800/50'
                  )}
                  style={selectedPersona ? { color: PERSONAS[selectedPersona].color } : {}}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  {t('landing.backToCharacters')}
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
