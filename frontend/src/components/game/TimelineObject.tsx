/**
 * Timeline Object Component
 *
 * Interactive 3D object representing a career milestone
 * Supports GLB model loading with fallback to primitive geometries
 */

import { useRef, useState, Suspense, useMemo } from 'react'
import { useFrame, ThreeEvent } from '@react-three/fiber'
import { useGLTF, Billboard, Text } from '@react-three/drei'
import { useTranslation } from 'react-i18next'
import * as THREE from 'three'
import type { TimelineObject as TimelineObjectType } from '@/types/game'
import { useGameStore } from '@/store/gameStore'

// Object type to geometry mapping (fallback when no GLB model)
const OBJECT_GEOMETRIES: Record<TimelineObjectType['type'], { geometry: 'box' | 'cylinder' | 'octahedron' | 'cone' | 'torus'; scale: [number, number, number] }> = {
  education: { geometry: 'octahedron', scale: [0.8, 0.8, 0.8] },
  work_experience: { geometry: 'box', scale: [1, 0.8, 1] },
  project: { geometry: 'cylinder', scale: [0.6, 1, 0.6] },
  thesis: { geometry: 'octahedron', scale: [1, 1.2, 1] },
  publication: { geometry: 'box', scale: [0.8, 0.4, 1] },
  talk: { geometry: 'cone', scale: [0.7, 1, 0.7] },
  milestone: { geometry: 'torus', scale: [0.8, 0.8, 0.8] },
}

// Check if GLB file exists (simple validation based on known files)
const AVAILABLE_MODELS = new Set([
  '/assets/game/objects/university.glb',
])

// GLB Model component - renders model with original materials
interface GLBModelProps {
  url: string
}

function GLBModel({ url }: GLBModelProps) {
  const { scene } = useGLTF(url)

  // Clone the scene to avoid sharing state between instances
  const clonedScene = useMemo(() => {
    const clone = scene.clone()
    clone.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true
        child.receiveShadow = true
      }
    })
    return clone
  }, [scene])

  return <primitive object={clonedScene} />
}

// Check if model URL is available
function isModelAvailable(url: string | undefined): url is string {
  return !!url && AVAILABLE_MODELS.has(url)
}

interface TimelineObjectProps {
  object: TimelineObjectType
  playerPosition: { x: number; z: number }
}

export function TimelineObject({ object, playerPosition }: TimelineObjectProps) {
  const meshRef = useRef<THREE.Group>(null)
  const [isHovered, setIsHovered] = useState(false)
  const { i18n } = useTranslation()
  const lang = i18n.language === 'tr' ? 'tr' : 'en'

  const selectObject = useGameStore((state) => state.selectObject)
  const selectedObject = useGameStore((state) => state.selectedObject)
  const hoverObject = useGameStore((state) => state.hoverObject)
  const visitedObjectIds = useGameStore((state) => state.visitedObjectIds)

  const isSelected = selectedObject?.id === object.id
  const isVisited = visitedObjectIds.includes(object.id)

  // Calculate distance to player
  const dx = object.gridPosition.x - playerPosition.x
  const dz = object.gridPosition.z - playerPosition.z
  const distanceToPlayer = Math.sqrt(dx * dx + dz * dz)
  const isNearby = distanceToPlayer <= object.interactionRadius

  // Get geometry config
  const geoConfig = OBJECT_GEOMETRIES[object.type]
  const baseScale = object.scale || 1

  // Animation - floating and scaling only
  useFrame((state) => {
    if (!meshRef.current) return

    // Floating animation
    const floatOffset = Math.sin(state.clock.elapsedTime * 2 + object.gridPosition.x) * 0.15
    meshRef.current.position.y = 1 + floatOffset

    // Scale pulse when hovered or nearby
    const targetScale = isHovered ? 1.2 : isNearby ? 1.1 : 1
    const currentScale = meshRef.current.scale.x
    const newScale = THREE.MathUtils.lerp(currentScale, targetScale, 0.1)

    meshRef.current.scale.setScalar(newScale)
  })

  // Event handlers
  const handlePointerOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    setIsHovered(true)
    hoverObject(object)
    document.body.style.cursor = 'pointer'
  }

  const handlePointerOut = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    setIsHovered(false)
    hoverObject(null)
    document.body.style.cursor = 'auto'
  }

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    selectObject(object)
  }

  // Render geometry based on type
  const renderGeometry = () => {
    switch (geoConfig.geometry) {
      case 'box':
        return <boxGeometry args={[1, 1, 1]} />
      case 'cylinder':
        return <cylinderGeometry args={[0.5, 0.5, 1, 16]} />
      case 'octahedron':
        return <octahedronGeometry args={[0.7]} />
      case 'cone':
        return <coneGeometry args={[0.5, 1, 16]} />
      case 'torus':
        return <torusGeometry args={[0.5, 0.2, 16, 32]} />
      default:
        return <boxGeometry args={[1, 1, 1]} />
    }
  }

  // Calculate label height based on whether it's a GLB model
  const hasGLBModel = isModelAvailable(object.modelUrl)
  // Label Y offset relative to object (inside the scaling group)
  const labelYOffset = hasGLBModel ? 2.5 : 1.5

  return (
    <group position={[object.gridPosition.x, 0, object.gridPosition.z]}>
      {/* Base pedestal */}
      <mesh position={[0, 0.15, 0]} receiveShadow>
        <cylinderGeometry args={[0.8, 1, 0.3, 8]} />
        <meshStandardMaterial
          color={isVisited ? '#374151' : '#1f2937'}
          metalness={0.5}
          roughness={0.5}
        />
      </mesh>

      {/* Glow ring on ground */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.9, 1.2, 32]} />
        <meshBasicMaterial
          color={object.color}
          transparent
          opacity={isHovered ? 0.8 : isNearby ? 0.5 : 0.2}
        />
      </mesh>

      {/* Main object with label - scales together */}
      <group
        ref={meshRef}
        position={[0, 1, 0]}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onClick={handleClick}
      >
        {/* Floating Label - always visible */}
        <Billboard position={[0, labelYOffset, 0]} follow={true}>
            <Text
              fontSize={0.3}
              color="white"
              anchorX="center"
              anchorY="middle"
              outlineWidth={0.02}
              outlineColor={object.color}
            >
              {object.iconEmoji} {object.title[lang]}
            </Text>
            <Text
              fontSize={0.15}
              color="#9ca3af"
              anchorX="center"
              anchorY="middle"
              position={[0, -0.3, 0]}
            >
              {object.year}
            </Text>
          </Billboard>

        {isModelAvailable(object.modelUrl) ? (
          // GLB Model (only if model file exists)
          <Suspense fallback={
            <mesh scale={[geoConfig.scale[0] * baseScale, geoConfig.scale[1] * baseScale, geoConfig.scale[2] * baseScale]}>
              {renderGeometry()}
              <meshStandardMaterial color={object.color} metalness={0.4} roughness={0.6} />
            </mesh>
          }>
            <group scale={[baseScale * 0.12, baseScale * 0.12, baseScale * 0.12]}>
              <GLBModel url={object.modelUrl} />
            </group>
          </Suspense>
        ) : (
          // Fallback primitive geometry
          <mesh
            scale={[
              geoConfig.scale[0] * baseScale,
              geoConfig.scale[1] * baseScale,
              geoConfig.scale[2] * baseScale,
            ]}
            castShadow
          >
            {renderGeometry()}
            <meshStandardMaterial
              color={object.color}
              metalness={0.4}
              roughness={0.6}
              emissive={object.color}
              emissiveIntensity={isHovered ? 0.5 : isNearby ? 0.3 : isSelected ? 0.4 : 0.1}
            />
          </mesh>
        )}
      </group>
    </group>
  )
}
