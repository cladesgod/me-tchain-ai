import { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: Error | null
}

/**
 * Error Boundary Component
 *
 * Catches JavaScript errors anywhere in child component tree,
 * logs them, and displays a fallback UI instead of crashing.
 *
 * Usage:
 * <ErrorBoundary fallback={<ErrorFallback />}>
 *   <MyComponent />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to console in development
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary caught an error:', error, errorInfo)
    }

    // Call optional error handler
    this.props.onError?.(error, errorInfo)
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null })
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // Return custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default fallback UI
      return (
        <div className="flex min-h-[200px] flex-col items-center justify-center rounded-lg bg-gray-900 p-8 text-center">
          <div className="mb-4 text-4xl">⚠️</div>
          <h2 className="mb-2 text-xl font-semibold text-white">
            Something went wrong
          </h2>
          <p className="mb-4 text-gray-400">
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <button
            onClick={this.handleRetry}
            className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

/**
 * Game-specific Error Fallback
 * Shows when 3D canvas fails to load
 */
export function GameErrorFallback(): JSX.Element {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-gray-950 p-8 text-center">
      <div className="mb-4 text-6xl">🎮</div>
      <h2 className="mb-2 text-2xl font-bold text-white">
        Game Loading Error
      </h2>
      <p className="mb-4 max-w-md text-gray-400">
        The 3D game couldn't load properly. This might be due to WebGL not being
        supported in your browser or a temporary issue.
      </p>
      <div className="flex gap-4">
        <button
          onClick={() => window.location.reload()}
          className="rounded-lg bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700"
        >
          Reload Page
        </button>
        <a
          href="/"
          className="rounded-lg border border-gray-600 px-6 py-2 text-gray-300 transition-colors hover:border-gray-500"
        >
          Go Home
        </a>
      </div>
    </div>
  )
}

/**
 * Page-level Error Fallback
 * Shows when a page component fails
 */
export function PageErrorFallback(): JSX.Element {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-950 p-8 text-center">
      <div className="mb-4 text-6xl">😵</div>
      <h2 className="mb-2 text-2xl font-bold text-white">
        Page Error
      </h2>
      <p className="mb-4 max-w-md text-gray-400">
        This page encountered an error. Please try again or navigate to another page.
      </p>
      <div className="flex gap-4">
        <button
          onClick={() => window.location.reload()}
          className="rounded-lg bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700"
        >
          Reload
        </button>
        <a
          href="/"
          className="rounded-lg border border-gray-600 px-6 py-2 text-gray-300 transition-colors hover:border-gray-500"
        >
          Home
        </a>
      </div>
    </div>
  )
}
