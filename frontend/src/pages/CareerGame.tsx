/**
 * Career Game Page
 *
 * Interactive timeline game where users explore Timuçin's career through 3D objects
 */

import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft } from 'lucide-react'
import { GameCanvas } from '@/components/game/GameCanvas'
import { TouchJoystick } from '@/components/game/controls/TouchJoystick'
import { ObjectDetailPanel } from '@/components/game/ObjectDetailPanel'
import { useGameStore } from '@/store/gameStore'
import { useKeyboardControls } from '@/hooks/useKeyboardControls'
import { useObjectInteraction } from '@/hooks/useObjectInteraction'
import { careerTimeline } from '@/data/careerTimeline'

export default function CareerGame() {
  useTranslation() // For language detection
  const pressedKeys = useKeyboardControls()
  const [joystickKeys, setJoystickKeys] = useState<Set<string>>(new Set())

  const isMobile = useGameStore((state) => state.isMobile)
  const setIsMobile = useGameStore((state) => state.setIsMobile)
  const visitedObjectIds = useGameStore((state) => state.visitedObjectIds)
  const isMoving = useGameStore((state) => state.isMoving)
  const selectedObject = useGameStore((state) => state.selectedObject)

  // Object interaction hook
  const { nearestObject, isNearObject } = useObjectInteraction()

  // Detect mobile on mount
  useEffect(() => {
    const isMobileDevice = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
    setIsMobile(isMobileDevice)
  }, [setIsMobile])

  // Handle joystick movement for mobile
  const handleJoystickMove = useCallback((direction: { x: number; y: number }) => {
    const newKeys = new Set<string>()

    // Map joystick direction to WASD keys
    if (direction.y > 0.3) newKeys.add('w')
    if (direction.y < -0.3) newKeys.add('s')
    if (direction.x < -0.3) newKeys.add('a')
    if (direction.x > 0.3) newKeys.add('d')

    setJoystickKeys(newKeys)
  }, [])

  // Combine keyboard and joystick inputs
  const combinedKeys = new Set([...pressedKeys, ...joystickKeys])

  return (
    <div className="relative w-full h-screen bg-gray-950 select-none">
      {/* Game Canvas (fullscreen) */}
      <GameCanvas pressedKeys={combinedKeys} />

      {/* UI Overlay - Top */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Back button + Title */}
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="bg-gray-900/80 backdrop-blur-sm rounded-lg p-2 border border-gray-800 hover:bg-gray-800/80 transition-colors"
              aria-label="Back to home"
            >
              <ArrowLeft className="w-5 h-5 text-gray-400" />
            </Link>
            <div className="bg-gray-900/80 backdrop-blur-sm rounded-lg px-4 py-2 border border-gray-800">
              <h1 className="text-lg font-bold text-white">Career Timeline</h1>
              <p className="text-xs text-gray-400">Explore my journey</p>
            </div>
          </div>

          {/* Progress */}
          <div className="bg-gray-900/80 backdrop-blur-sm rounded-lg px-4 py-2 border border-gray-800">
            <p className="text-sm text-gray-400">
              Visited:{' '}
              <span className="text-white font-semibold">{visitedObjectIds.length} / {careerTimeline.length}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Object Detail Panel (includes integrated chat) */}
      <ObjectDetailPanel />

      {/* UI Overlay - Bottom (Desktop) */}
      {!isMobile && !selectedObject && (
        <div className="absolute bottom-0 left-0 right-0 z-10 p-4">
          <div className="max-w-7xl mx-auto">
            <div className="bg-gray-900/80 backdrop-blur-sm rounded-lg px-6 py-4 border border-gray-800">
              {isNearObject && nearestObject ? (
                <p className="text-center text-sm text-cyan-400 animate-pulse">
                  <kbd className="px-2 py-1 bg-cyan-500/20 rounded text-xs mr-2">E</kbd>
                  Press E to interact with <span className="font-semibold">{nearestObject.iconEmoji} {nearestObject.title.en}</span>
                </p>
              ) : (
                <p className="text-center text-sm text-gray-400">
                  <span className="font-medium text-cyan-400">Controls:</span> Use{' '}
                  <kbd className="px-2 py-1 bg-gray-800 rounded text-xs">WASD</kbd> or{' '}
                  <kbd className="px-2 py-1 bg-gray-800 rounded text-xs">Arrow Keys</kbd> to move
                </p>
              )}
              {isMoving && !isNearObject && (
                <p className="text-center text-xs text-green-400 mt-1 animate-pulse">Moving...</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Joystick */}
      {isMobile && (
        <div className="absolute bottom-8 left-8 z-20">
          <TouchJoystick onMove={handleJoystickMove} size={120} />
        </div>
      )}

      {/* Mobile hint */}
      {isMobile && (
        <div className="absolute bottom-8 right-8 z-10">
          <div className="bg-gray-900/80 backdrop-blur-sm rounded-lg px-4 py-2 border border-gray-800">
            <p className="text-xs text-gray-400">Use joystick to move</p>
          </div>
        </div>
      )}
    </div>
  )
}
