/**
 * Career Game - Zustand Store
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { TimelineObject, Vector3, GameState } from '@/types/game'

const initialState = {
  // Player state
  playerPosition: { x: 0, y: 0, z: 0 },
  playerRotation: 0,
  isMoving: false,

  // Interaction state
  selectedObject: null,
  hoveredObject: null,
  nearbyObjects: [],

  // Chat state
  isChatting: false,
  chattingWithObject: null,

  // Progression
  visitedObjectIds: [],
  unlockedObjectIds: [],

  // Camera state
  cameraPosition: { x: 10, y: 10, z: 10 },
  cameraTarget: { x: 0, y: 0, z: 0 },
  cameraZoom: 1,

  // UI state
  showMinimap: true,
  showControls: true,
  isMobile: false,
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Player actions
      setPlayerPosition: (position: Vector3) => set({ playerPosition: position }),
      setPlayerRotation: (rotation: number) => set({ playerRotation: rotation }),
      setIsMoving: (moving: boolean) => set({ isMoving: moving }),

      // Interaction actions
      selectObject: (object: TimelineObject | null) => {
        set({ selectedObject: object })
        if (object) {
          get().markObjectVisited(object.id)
        }
      },

      hoverObject: (object: TimelineObject | null) => set({ hoveredObject: object }),
      setNearbyObjects: (objects: TimelineObject[]) => set({ nearbyObjects: objects }),

      // Chat actions
      startChat: (object: TimelineObject) => {
        set({
          isChatting: true,
          chattingWithObject: object,
          selectedObject: object,
        })
      },

      endChat: () => {
        set({
          isChatting: false,
          chattingWithObject: null,
        })
      },

      // Progression actions
      markObjectVisited: (objectId: string) => {
        const { visitedObjectIds } = get()
        if (!visitedObjectIds.includes(objectId)) {
          set({ visitedObjectIds: [...visitedObjectIds, objectId] })
        }
      },

      unlockObject: (objectId: string) => {
        const { unlockedObjectIds } = get()
        if (!unlockedObjectIds.includes(objectId)) {
          set({ unlockedObjectIds: [...unlockedObjectIds, objectId] })
        }
      },

      // Camera actions
      setCameraPosition: (position: Vector3) => set({ cameraPosition: position }),
      setCameraTarget: (target: Vector3) => set({ cameraTarget: target }),
      setCameraZoom: (zoom: number) => set({ cameraZoom: zoom }),

      // UI actions
      toggleMinimap: () => set((state) => ({ showMinimap: !state.showMinimap })),
      toggleControls: () => set((state) => ({ showControls: !state.showControls })),
      setIsMobile: (mobile: boolean) => set({ isMobile: mobile }),

      // Reset
      resetGame: () => set(initialState),
    }),
    {
      name: 'career-game-storage',
      partialize: (state) => ({
        visitedObjectIds: state.visitedObjectIds,
        unlockedObjectIds: state.unlockedObjectIds,
      }),
    }
  )
)
