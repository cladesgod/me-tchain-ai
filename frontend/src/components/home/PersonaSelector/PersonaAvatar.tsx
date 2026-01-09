import { Suspense, useRef, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, Environment, ContactShadows } from '@react-three/drei'
import { Group, Mesh } from 'three'
import { PersonaType } from '@/store'

// Per-persona Y offset to align all characters at same level
// Adjust these values based on each GLB model's origin point
// More negative = move model down, less negative = move model up
const PERSONA_Y_OFFSETS: Record<Exclude<PersonaType, null>, number> = {
  engineer: 0,
  researcher: 0,
  speaker: 0,
  educator: 0,
}

interface AvatarModelProps {
  url: string
  isSelected: boolean
  isHovered: boolean
  yOffset: number
}

function AvatarModel({ url, isSelected, isHovered, yOffset }: AvatarModelProps) {
  const groupRef = useRef<Group>(null)
  const { scene } = useGLTF(url)

  // Subtle animation
  useFrame((state) => {
    if (!groupRef.current) return

    // Gentle floating animation when selected
    if (isSelected) {
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.02
    }

    // Subtle rotation when hovered
    if (isHovered && !isSelected) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 3) * 0.1
    }
  })

  // Reset position when not selected
  useEffect(() => {
    if (groupRef.current && !isSelected) {
      groupRef.current.position.y = 0
      groupRef.current.rotation.y = 0
    }
  }, [isSelected])

  return (
    <group ref={groupRef}>
      <primitive
        object={scene}
        scale={isSelected ? 1.1 : isHovered ? 1.05 : 1}
        position={[0, yOffset, 0]}
      />
    </group>
  )
}

// Loading placeholder
function LoadingAvatar() {
  const meshRef = useRef<Mesh>(null)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime
    }
  })

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[0.5, 0.5, 0.5]} />
      <meshStandardMaterial color="#22d3ee" wireframe />
    </mesh>
  )
}

interface PersonaAvatarProps {
  persona: Exclude<PersonaType, null>
  isSelected: boolean
  isHovered: boolean
  glowColor: string
}

export function PersonaAvatar({ persona, isSelected, isHovered, glowColor }: PersonaAvatarProps) {
  const avatarUrl = `/assets/avatars/${persona}.glb`
  const yOffset = PERSONA_Y_OFFSETS[persona]

  return (
    <div
      className="w-full h-full rounded-xl overflow-hidden"
      style={{
        boxShadow: isSelected
          ? `0 0 30px ${glowColor}60, 0 0 60px ${glowColor}30`
          : isHovered
            ? `0 0 20px ${glowColor}40`
            : 'none',
      }}
    >
      <Canvas
        camera={{ position: [0, 0.3, 2.5], fov: 50 }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <spotLight
          position={[0, 5, 0]}
          intensity={0.5}
          color={glowColor}
          penumbra={1}
        />

        <Suspense fallback={<LoadingAvatar />}>
          <AvatarModel
            url={avatarUrl}
            isSelected={isSelected}
            isHovered={isHovered}
            yOffset={yOffset}
          />
          <Environment preset="city" />
        </Suspense>

        <ContactShadows
          position={[0, -1, 0]}
          opacity={0.4}
          scale={2}
          blur={2}
        />

        {/* Disable orbit controls - avatars are for display only */}
        {/* <OrbitControls enableZoom={false} enablePan={false} /> */}
      </Canvas>
    </div>
  )
}

// Preload all avatars for better performance
useGLTF.preload('/assets/avatars/engineer.glb')
useGLTF.preload('/assets/avatars/researcher.glb')
useGLTF.preload('/assets/avatars/speaker.glb')
useGLTF.preload('/assets/avatars/educator.glb')
