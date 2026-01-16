/**
 * Career Game - Type Definitions
 */

import type { PersonaType } from '@/store/personaStore'

export type TimelineObjectType =
  | 'project'
  | 'thesis'
  | 'publication'
  | 'talk'
  | 'milestone'
  | 'education'
  | 'work_experience'

export interface Vector3 {
  x: number
  y: number
  z: number
}

export interface TimelineObject {
  // Identity
  id: string
  type: TimelineObjectType
  year: number
  month?: number

  // Content
  title: { en: string; tr: string }
  shortDescription: { en: string; tr: string }

  // 3D Positioning (grid-based, 1 unit = 1 meter)
  gridPosition: Vector3
  rotation?: number
  scale?: number

  // Visual
  modelUrl: string // Path to GLB file
  iconEmoji: string // For minimap/UI
  color: string // Accent color for glow effects

  // Interaction
  objectPersonaId: string // Maps to backend/data/objects/{id}.md
  interactionRadius: number // Distance to trigger (default: 2)

  // Progression (optional)
  isUnlocked?: boolean
  requiredObjectIds?: string[]

  // Metadata
  relatedPersonas?: PersonaType[]
  externalLink?: string
  images?: string[]
  tags?: string[]
}

export interface GameState {
  // Player state
  playerPosition: Vector3
  playerRotation: number
  isMoving: boolean

  // Interaction state
  selectedObject: TimelineObject | null
  hoveredObject: TimelineObject | null
  nearbyObjects: TimelineObject[]

  // Chat state
  isChatting: boolean
  chattingWithObject: TimelineObject | null

  // Progression
  visitedObjectIds: string[]
  unlockedObjectIds: string[]

  // Camera state
  cameraPosition: Vector3
  cameraTarget: Vector3
  cameraZoom: number

  // UI state
  showMinimap: boolean
  showControls: boolean
  isMobile: boolean

  // Actions
  setPlayerPosition: (position: Vector3) => void
  setPlayerRotation: (rotation: number) => void
  setIsMoving: (moving: boolean) => void

  selectObject: (object: TimelineObject | null) => void
  hoverObject: (object: TimelineObject | null) => void
  setNearbyObjects: (objects: TimelineObject[]) => void

  startChat: (object: TimelineObject) => void
  endChat: () => void

  markObjectVisited: (objectId: string) => void
  unlockObject: (objectId: string) => void

  setCameraPosition: (position: Vector3) => void
  setCameraTarget: (target: Vector3) => void
  setCameraZoom: (zoom: number) => void

  toggleMinimap: () => void
  toggleControls: () => void
  setIsMobile: (mobile: boolean) => void

  resetGame: () => void
}
