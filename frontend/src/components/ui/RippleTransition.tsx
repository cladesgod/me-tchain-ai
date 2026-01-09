import { useEffect } from 'react'

interface RippleTransitionProps {
  isActive: boolean
  color: string
  onComplete: () => void
}

export function RippleTransition({ isActive, color, onComplete }: RippleTransitionProps) {
  useEffect(() => {
    if (isActive) {
      const timer = setTimeout(onComplete, 900) // Match animation duration
      return () => clearTimeout(timer)
    }
  }, [isActive, onComplete])

  if (!isActive) return null

  return (
    <div
      className="ripple-overlay active"
      style={{ backgroundColor: color }}
    />
  )
}
