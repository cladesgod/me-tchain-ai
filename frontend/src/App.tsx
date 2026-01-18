import { Routes, Route, useLocation } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { Layout } from './components/layout'
import { ChatWidget } from './components/chat'
import { ErrorBoundary, GameErrorFallback, PageErrorFallback } from './components/ui'

// Lazy load pages for code splitting
const Landing = lazy(() => import('./pages/Landing'))
const Talks = lazy(() => import('./pages/Talks'))
const Publications = lazy(() => import('./pages/Publications'))
const Contact = lazy(() => import('./pages/Contact'))
const Resume = lazy(() => import('./pages/Resume'))
const CareerGame = lazy(() => import('./pages/CareerGame'))
const NotFound = lazy(() => import('./pages/NotFound'))

// Loading fallback
const PageLoader = () => (
  <div className="flex h-screen items-center justify-center bg-gray-950">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--persona-primary)] border-t-transparent" />
  </div>
)

function App() {
  const location = useLocation()
  const isGamePage = location.pathname === '/career-game'

  // Game page renders without Layout (fullscreen)
  if (isGamePage) {
    return (
      <ErrorBoundary fallback={<GameErrorFallback />}>
        <Suspense fallback={<PageLoader />}>
          <CareerGame />
        </Suspense>
      </ErrorBoundary>
    )
  }

  return (
    <>
      <Layout>
        <ErrorBoundary fallback={<PageErrorFallback />}>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Landing page - Single page with all personas */}
              <Route path="/" element={<Landing />} />

              {/* Secondary pages */}
              <Route path="/talks" element={<Talks />} />
              <Route path="/publications" element={<Publications />} />
              <Route path="/resume" element={<Resume />} />
              <Route path="/contact" element={<Contact />} />

              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </Layout>

      {/* Floating Chat Widget */}
      <ChatWidget />
    </>
  )
}

export default App
