import { Routes, Route } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { Layout } from './components/layout'
import { ChatWidget } from './components/chat'

// Lazy load pages for code splitting
const Landing = lazy(() => import('./pages/Landing'))
const About = lazy(() => import('./pages/About'))
const Projects = lazy(() => import('./pages/Projects'))
const Talks = lazy(() => import('./pages/Talks'))
const Publications = lazy(() => import('./pages/Publications'))
const Blog = lazy(() => import('./pages/Blog'))
const Contact = lazy(() => import('./pages/Contact'))
const NotFound = lazy(() => import('./pages/NotFound'))

// Loading fallback
const PageLoader = () => (
  <div className="flex h-screen items-center justify-center bg-gray-950">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--persona-primary)] border-t-transparent" />
  </div>
)

function App() {
  return (
    <>
      <Layout>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Landing page - Single page with all personas */}
            <Route path="/" element={<Landing />} />

            {/* Secondary pages */}
            <Route path="/about" element={<About />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/talks" element={<Talks />} />
            <Route path="/publications" element={<Publications />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/contact" element={<Contact />} />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </Layout>

      {/* Floating Chat Widget */}
      <ChatWidget />
    </>
  )
}

export default App
