/**
 * Character Controller Component
 *
 * Player avatar with movement controls for isometric game
 */

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore } from '@/store/gameStore'

const MOVE_SPEED = 5 // Units per second
const ROTATION_SPEED = 10 // Radians per second

// Movement direction based on isometric view (WASD mapped to isometric grid)
const DIRECTIONS = {
  forward: new THREE.Vector3(-1, 0, -1).normalize(), // W - up-left in isometric
  backward: new THREE.Vector3(1, 0, 1).normalize(), // S - down-right in isometric
  left: new THREE.Vector3(-1, 0, 1).normalize(), // A - down-left in isometric
  right: new THREE.Vector3(1, 0, -1).normalize(), // D - up-right in isometric
}

interface CharacterControllerProps {
  pressedKeys: Set<string>
}

export function CharacterController({ pressedKeys }: CharacterControllerProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const targetRotation = useRef(0)

  const playerPosition = useGameStore((state) => state.playerPosition)
  const setPlayerPosition = useGameStore((state) => state.setPlayerPosition)
  const setPlayerRotation = useGameStore((state) => state.setPlayerRotation)
  const setIsMoving = useGameStore((state) => state.setIsMoving)

  // Calculate movement direction from pressed keys
  const getMovementDirection = (): THREE.Vector3 => {
    const direction = new THREE.Vector3()

    if (pressedKeys.has('w') || pressedKeys.has('arrowup')) {
      direction.add(DIRECTIONS.forward)
    }
    if (pressedKeys.has('s') || pressedKeys.has('arrowdown')) {
      direction.add(DIRECTIONS.backward)
    }
    if (pressedKeys.has('a') || pressedKeys.has('arrowleft')) {
      direction.add(DIRECTIONS.left)
    }
    if (pressedKeys.has('d') || pressedKeys.has('arrowright')) {
      direction.add(DIRECTIONS.right)
    }

    if (direction.length() > 0) {
      direction.normalize()
    }

    return direction
  }

  // Animation loop
  useFrame((state, delta) => {
    if (!meshRef.current) return

    const direction = getMovementDirection()
    const isMoving = direction.length() > 0

    setIsMoving(isMoving)

    if (isMoving) {
      // Calculate new position
      const movement = direction.clone().multiplyScalar(MOVE_SPEED * delta)
      const newPosition = {
        x: playerPosition.x + movement.x,
        y: playerPosition.y,
        z: playerPosition.z + movement.z,
      }

      // Update store
      setPlayerPosition(newPosition)

      // Calculate target rotation (face movement direction)
      targetRotation.current = Math.atan2(direction.x, direction.z)
    }

    // Update mesh position
    meshRef.current.position.set(playerPosition.x, playerPosition.y + 0.5, playerPosition.z)

    // Smooth rotation interpolation
    const currentRotation = meshRef.current.rotation.y
    const rotationDiff = targetRotation.current - currentRotation

    // Handle rotation wrapping
    let shortestRotation = rotationDiff
    if (Math.abs(rotationDiff) > Math.PI) {
      shortestRotation = rotationDiff - Math.sign(rotationDiff) * Math.PI * 2
    }

    meshRef.current.rotation.y += shortestRotation * ROTATION_SPEED * delta
    setPlayerRotation(meshRef.current.rotation.y)

    // Bobbing animation when moving
    if (isMoving) {
      meshRef.current.position.y += Math.sin(state.clock.elapsedTime * 10) * 0.02
    }
  })

  return (
    <mesh ref={meshRef} position={[playerPosition.x, 0.5, playerPosition.z]} castShadow>
      {/* Simple capsule-like character */}
      <group>
        {/* Body */}
        <mesh position={[0, 0.3, 0]}>
          <capsuleGeometry args={[0.3, 0.6, 8, 16]} />
          <meshStandardMaterial color="#22d3ee" metalness={0.3} roughness={0.7} />
        </mesh>

        {/* Head */}
        <mesh position={[0, 0.9, 0]}>
          <sphereGeometry args={[0.25, 16, 16]} />
          <meshStandardMaterial color="#f8fafc" metalness={0.1} roughness={0.8} />
        </mesh>

        {/* Direction indicator (small cone pointing forward) */}
        <mesh position={[0, 0.5, -0.35]} rotation={[-Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.1, 0.2, 8]} />
          <meshStandardMaterial color="#f97316" metalness={0.5} roughness={0.5} />
        </mesh>
      </group>
    </mesh>
  )
}
