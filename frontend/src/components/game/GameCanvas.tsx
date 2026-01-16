/**
 * Game Canvas Component
 *
 * Main Three.js canvas setup for Career Game
 */

import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { Grid, AdaptiveDpr, AdaptiveEvents } from '@react-three/drei'
import { IsometricCamera } from './IsometricCamera'
import { CharacterController } from './CharacterController'
import { TimelineObject } from './TimelineObject'
import { careerTimeline } from '@/data/careerTimeline'
import { useGameStore } from '@/store/gameStore'

// Ground plane
function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
      <planeGeometry args={[200, 200]} />
      <meshStandardMaterial color="#1a1a2e" transparent opacity={0.8} />
    </mesh>
  )
}

// Timeline objects wrapper to access player position
function TimelineObjects() {
  const playerPosition = useGameStore((state) => state.playerPosition)

  return (
    <>
      {careerTimeline.map((object) => (
        <TimelineObject
          key={object.id}
          object={object}
          playerPosition={{ x: playerPosition.x, z: playerPosition.z }}
        />
      ))}
    </>
  )
}

interface GameCanvasProps {
  pressedKeys: Set<string>
}

export function GameCanvas({ pressedKeys }: GameCanvasProps) {
  return (
    <div className="absolute inset-0">
      <Canvas shadows>
        {/* Performance optimizations */}
        <AdaptiveDpr pixelated />
        <AdaptiveEvents />

        {/* Camera */}
        <Suspense fallback={null}>
          <IsometricCamera />
        </Suspense>

        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={1}
          castShadow
          shadow-mapSize={[1024, 1024]}
        />

        {/* Background color */}
        <color attach="background" args={['#0a0f1a']} />

        {/* Ground */}
        <Ground />

        {/* Grid helper for debugging */}
        <Grid
          args={[100, 100]}
          cellSize={1}
          cellThickness={0.5}
          cellColor="#6b7280"
          sectionSize={5}
          sectionThickness={1}
          sectionColor="#9ca3af"
          fadeDistance={50}
          fadeStrength={1}
          followCamera={false}
          infiniteGrid
        />

        {/* Player Character */}
        <Suspense fallback={null}>
          <CharacterController pressedKeys={pressedKeys} />
        </Suspense>

        {/* Timeline Objects */}
        <TimelineObjects />
      </Canvas>
    </div>
  )
}
