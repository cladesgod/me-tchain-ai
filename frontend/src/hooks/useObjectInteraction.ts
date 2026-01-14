/**
 * Object Interaction Hook
 *
 * Handles proximity detection and keyboard interaction for timeline objects
 */

import { useEffect, useCallback, useMemo } from 'react'
import { useGameStore } from '@/store/gameStore'
import { careerTimeline } from '@/data/careerTimeline'
import type { TimelineObject } from '@/types/game'

interface UseObjectInteractionOptions {
  interactionKey?: string // Key to trigger interaction (default: 'e')
  autoSelectNearest?: boolean // Auto-select nearest object when in range
}

export function useObjectInteraction(options: UseObjectInteractionOptions = {}) {
  const { interactionKey = 'e', autoSelectNearest = false } = options

  const playerPosition = useGameStore((state) => state.playerPosition)
  const selectedObject = useGameStore((state) => state.selectedObject)
  const selectObject = useGameStore((state) => state.selectObject)
  const setNearbyObjects = useGameStore((state) => state.setNearbyObjects)
  const isChatting = useGameStore((state) => state.isChatting)

  // Calculate distance between player and an object
  const getDistance = useCallback(
    (object: TimelineObject): number => {
      const dx = object.gridPosition.x - playerPosition.x
      const dz = object.gridPosition.z - playerPosition.z
      return Math.sqrt(dx * dx + dz * dz)
    },
    [playerPosition.x, playerPosition.z]
  )

  // Find all nearby objects (within interaction radius)
  const nearbyObjects = useMemo(() => {
    return careerTimeline
      .filter((object) => {
        const distance = getDistance(object)
        return distance <= object.interactionRadius
      })
      .sort((a, b) => getDistance(a) - getDistance(b))
  }, [getDistance])

  // Get the nearest interactable object
  const nearestObject = nearbyObjects.length > 0 ? nearbyObjects[0] : null

  // Update store with nearby objects
  useEffect(() => {
    setNearbyObjects(nearbyObjects)
  }, [nearbyObjects, setNearbyObjects])

  // Auto-select nearest object if enabled and no object is selected
  useEffect(() => {
    if (autoSelectNearest && !selectedObject && nearestObject) {
      selectObject(nearestObject)
    }
  }, [autoSelectNearest, selectedObject, nearestObject, selectObject])

  // Handle keyboard interaction (E key to select objects)
  // Note: ESC key is handled by ObjectDetailPanel for proper chat→info→close flow
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't handle if chatting or panel is open
      if (isChatting || selectedObject) return

      const key = event.key.toLowerCase()

      // E key to select nearest object
      if (key === interactionKey && nearestObject) {
        event.preventDefault()
        selectObject(nearestObject)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [interactionKey, nearestObject, selectObject, isChatting, selectedObject])

  return {
    nearbyObjects,
    nearestObject,
    isNearObject: nearbyObjects.length > 0,
    canInteract: nearestObject !== null || selectedObject !== null,
  }
}

/**
 * Get all objects with their distances from a position
 */
export function getObjectsWithDistances(
  position: { x: number; z: number }
): Array<{ object: TimelineObject; distance: number }> {
  return careerTimeline.map((object) => {
    const dx = object.gridPosition.x - position.x
    const dz = object.gridPosition.z - position.z
    const distance = Math.sqrt(dx * dx + dz * dz)
    return { object, distance }
  })
}

/**
 * Find the nearest object to a position
 */
export function findNearestObject(
  position: { x: number; z: number }
): TimelineObject | null {
  const objectsWithDistances = getObjectsWithDistances(position)
  if (objectsWithDistances.length === 0) return null

  const nearest = objectsWithDistances.reduce((prev, curr) =>
    curr.distance < prev.distance ? curr : prev
  )

  return nearest.object
}

/**
 * Check if a position is within interaction range of any object
 */
export function isWithinInteractionRange(position: { x: number; z: number }): boolean {
  return careerTimeline.some((object) => {
    const dx = object.gridPosition.x - position.x
    const dz = object.gridPosition.z - position.z
    const distance = Math.sqrt(dx * dx + dz * dz)
    return distance <= object.interactionRadius
  })
}
