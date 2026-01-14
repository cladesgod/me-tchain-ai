/**
 * Keyboard Controls Hook
 *
 * Tracks currently pressed keys for game movement
 */

import { useState, useEffect, useCallback } from 'react'

const MOVEMENT_KEYS = new Set([
  'w',
  'a',
  's',
  'd',
  'arrowup',
  'arrowdown',
  'arrowleft',
  'arrowright',
])

export function useKeyboardControls() {
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set())

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Don't capture keys when typing in input fields
    const target = event.target as HTMLElement
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable
    ) {
      return
    }

    const key = event.key.toLowerCase()

    if (MOVEMENT_KEYS.has(key)) {
      event.preventDefault()
      setPressedKeys((prev) => {
        const next = new Set(prev)
        next.add(key)
        return next
      })
    }
  }, [])

  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    const key = event.key.toLowerCase()

    // Always handle keyup to prevent stuck keys
    if (MOVEMENT_KEYS.has(key)) {
      setPressedKeys((prev) => {
        const next = new Set(prev)
        next.delete(key)
        return next
      })
    }
  }, [])

  // Handle window blur (release all keys when window loses focus)
  const handleBlur = useCallback(() => {
    setPressedKeys(new Set())
  }, [])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    window.addEventListener('blur', handleBlur)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      window.removeEventListener('blur', handleBlur)
    }
  }, [handleKeyDown, handleKeyUp, handleBlur])

  return pressedKeys
}
