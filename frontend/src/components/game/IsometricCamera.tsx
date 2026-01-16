/**
 * Isometric Camera Component
 *
 * Sets up orthographic camera for isometric 2.5D view
 */

import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { OrthographicCamera } from '@react-three/drei'
import * as THREE from 'three'
import { useGameStore } from '@/store/gameStore'

// Isometric angle: ~35.26 degrees (atan(1/sqrt(2))) - for reference
const CAMERA_DISTANCE = 15

export function IsometricCamera() {
  const cameraRef = useRef<THREE.OrthographicCamera>(null)

  const playerPosition = useGameStore((state) => state.playerPosition)
  const cameraZoom = useGameStore((state) => state.cameraZoom)

  // Set camera as default on mount
  useEffect(() => {
    if (cameraRef.current) {
      cameraRef.current.position.set(
        playerPosition.x + CAMERA_DISTANCE,
        CAMERA_DISTANCE,
        playerPosition.z + CAMERA_DISTANCE
      )
      cameraRef.current.lookAt(playerPosition.x, 0, playerPosition.z)
    }
  }, [playerPosition.x, playerPosition.z])

  // Smooth camera follow with lerp
  useFrame((_, delta) => {
    if (!cameraRef.current) return

    // Target camera position (follows player)
    const targetX = playerPosition.x + CAMERA_DISTANCE
    const targetY = CAMERA_DISTANCE
    const targetZ = playerPosition.z + CAMERA_DISTANCE

    // Smooth interpolation (lerp)
    const lerpFactor = 1 - Math.pow(0.001, delta)
    cameraRef.current.position.x = THREE.MathUtils.lerp(
      cameraRef.current.position.x,
      targetX,
      lerpFactor
    )
    cameraRef.current.position.y = THREE.MathUtils.lerp(
      cameraRef.current.position.y,
      targetY,
      lerpFactor
    )
    cameraRef.current.position.z = THREE.MathUtils.lerp(
      cameraRef.current.position.z,
      targetZ,
      lerpFactor
    )

    // Look at player position
    cameraRef.current.lookAt(playerPosition.x, 0, playerPosition.z)
  })

  return (
    <OrthographicCamera
      ref={cameraRef}
      makeDefault
      zoom={50 * cameraZoom}
      near={0.1}
      far={1000}
      position={[CAMERA_DISTANCE, CAMERA_DISTANCE, CAMERA_DISTANCE]}
    />
  )
}
