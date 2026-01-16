/**
 * Touch Joystick Component
 *
 * Virtual joystick for mobile touch controls
 */

import { useState, useRef, useCallback, useEffect } from 'react'
import { cn } from '@/utils'

interface TouchJoystickProps {
  onMove: (direction: { x: number; y: number }) => void
  size?: number
}

export function TouchJoystick({ onMove, size = 120 }: TouchJoystickProps) {
  const [isActive, setIsActive] = useState(false)
  const [knobPosition, setKnobPosition] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)
  const centerRef = useRef({ x: 0, y: 0 })

  const maxDistance = size / 2 - 20 // Knob can move this far from center

  const handleStart = useCallback(
    (clientX: number, clientY: number) => {
      if (!containerRef.current) return

      const rect = containerRef.current.getBoundingClientRect()
      centerRef.current = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      }
      setIsActive(true)

      // Calculate initial position
      const deltaX = clientX - centerRef.current.x
      const deltaY = clientY - centerRef.current.y
      const distance = Math.min(Math.sqrt(deltaX * deltaX + deltaY * deltaY), maxDistance)
      const angle = Math.atan2(deltaY, deltaX)

      const x = Math.cos(angle) * distance
      const y = Math.sin(angle) * distance

      setKnobPosition({ x, y })
      onMove({
        x: x / maxDistance,
        y: -y / maxDistance, // Invert Y for game coordinates
      })
    },
    [maxDistance, onMove]
  )

  const handleMove = useCallback(
    (clientX: number, clientY: number) => {
      if (!isActive) return

      const deltaX = clientX - centerRef.current.x
      const deltaY = clientY - centerRef.current.y
      const distance = Math.min(Math.sqrt(deltaX * deltaX + deltaY * deltaY), maxDistance)
      const angle = Math.atan2(deltaY, deltaX)

      const x = Math.cos(angle) * distance
      const y = Math.sin(angle) * distance

      setKnobPosition({ x, y })
      onMove({
        x: x / maxDistance,
        y: -y / maxDistance,
      })
    },
    [isActive, maxDistance, onMove]
  )

  const handleEnd = useCallback(() => {
    setIsActive(false)
    setKnobPosition({ x: 0, y: 0 })
    onMove({ x: 0, y: 0 })
  }, [onMove])

  // Touch event handlers
  const onTouchStart = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault()
      const touch = e.touches[0]
      handleStart(touch.clientX, touch.clientY)
    },
    [handleStart]
  )

  const onTouchMove = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault()
      const touch = e.touches[0]
      handleMove(touch.clientX, touch.clientY)
    },
    [handleMove]
  )

  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault()
      handleEnd()
    },
    [handleEnd]
  )

  // Mouse event handlers (for testing on desktop)
  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      handleStart(e.clientX, e.clientY)
    },
    [handleStart]
  )

  useEffect(() => {
    if (!isActive) return

    const onMouseMove = (e: MouseEvent) => {
      handleMove(e.clientX, e.clientY)
    }

    const onMouseUp = () => {
      handleEnd()
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [isActive, handleMove, handleEnd])

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative rounded-full',
        'bg-gray-800/50 backdrop-blur-sm',
        'border-2 border-gray-700/50',
        isActive && 'border-cyan-500/50'
      )}
      style={{ width: size, height: size }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onMouseDown={onMouseDown}
    >
      {/* Center dot */}
      <div
        className="absolute w-3 h-3 bg-gray-600 rounded-full"
        style={{
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      />

      {/* Knob */}
      <div
        className={cn(
          'absolute w-12 h-12 rounded-full',
          'bg-gradient-to-br from-cyan-400 to-cyan-600',
          'shadow-lg shadow-cyan-500/30',
          'transition-transform duration-75',
          isActive && 'scale-110'
        )}
        style={{
          left: '50%',
          top: '50%',
          transform: `translate(calc(-50% + ${knobPosition.x}px), calc(-50% + ${knobPosition.y}px))`,
        }}
      />
    </div>
  )
}
