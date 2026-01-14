import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { cn } from '@/utils'
import { PERSONAS, PersonaType, usePersonaStore } from '@/store'
import { PersonaAvatar } from '@/components/home/PersonaSelector/PersonaAvatar'
import { PersonaContent } from '@/components/home/PersonaContent'

const personaOrder: Exclude<PersonaType, null>[] = ['engineer', 'researcher', 'speaker', 'educator']

// Hook to dynamically calculate card center positions for SVG alignment
function useCardPositions() {
  const svgContainerRef = useRef<HTMLDivElement>(null)
  const cardsContainerRef = useRef<HTMLDivElement>(null)
  const [positions, setPositions] = useState<number[]>([100, 300, 500, 700]) // Fallback positions

  useEffect(() => {
    const updatePositions = () => {
      const svgContainer = svgContainerRef.current
      const cardsContainer = cardsContainerRef.current

      if (!svgContainer || !cardsContainer) return

      const svgRect = svgContainer.getBoundingClientRect()
      const svgWidth = svgRect.width

      // Get all card elements from the grid
      const cards = cardsContainer.querySelectorAll('[data-card]')
      if (cards.length === 0) return

      const newPositions = Array.from(cards).map(card => {
        const cardRect = card.getBoundingClientRect()
        // Calculate card center relative to SVG container, normalized to 0-800
        const cardCenterX = cardRect.left + cardRect.width / 2 - svgRect.left
        return Math.round((cardCenterX / svgWidth) * 800)
      })

      // Only update if we have valid positions (allow edge positions)
      if (newPositions.length === 4 && newPositions.every(p => p >= 0 && p <= 800)) {
        setPositions(newPositions)
      }
    }

    // Multiple attempts to ensure layout is stable
    const timers = [
      setTimeout(updatePositions, 0),
      setTimeout(updatePositions, 100),
      setTimeout(updatePositions, 300),
    ]

    // Update on resize
    window.addEventListener('resize', updatePositions)

    // Use ResizeObserver for container size changes
    const resizeObserver = new ResizeObserver(updatePositions)
    if (svgContainerRef.current) {
      resizeObserver.observe(svgContainerRef.current)
    }

    return () => {
      timers.forEach(clearTimeout)
      window.removeEventListener('resize', updatePositions)
      resizeObserver.disconnect()
    }
  }, [])

  return { svgContainerRef, cardsContainerRef, positions }
}

// Engineer: Lightning/zigzag electric effect
function EngineerPath({ d, color, pathLength, delay, duration }: PathProps) {
  const [drawn, setDrawn] = useState(false)
  const [lightningKey, setLightningKey] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDrawn(true)
    }, delay)
    return () => clearTimeout(timer)
  }, [delay])

  // Re-trigger lightning animation periodically
  useEffect(() => {
    if (drawn) {
      const interval = setInterval(() => {
        setLightningKey(k => k + 1)
      }, 800)
      return () => clearInterval(interval)
    }
  }, [drawn])

  // Generate zigzag points along the path
  const generateLightningPath = (originalD: string) => {
    // Parse the path to get start and end points (supports floating point)
    const match = originalD.match(/M([\d.]+)\s+([\d.]+)\s+L([\d.]+)\s+([\d.]+)/)
    if (!match) return originalD

    const [, x1Str, y1Str, x2Str, y2Str] = match
    const x1 = Number(x1Str)
    const y1 = Number(y1Str)
    const x2 = Number(x2Str)
    const y2 = Number(y2Str)
    const isVertical = x1 === x2
    const length = isVertical ? Math.abs(y2 - y1) : Math.abs(x2 - x1)
    const segments = Math.max(3, Math.floor(length / 15))

    let path = `M${x1} ${y1}`
    const zigzagAmount = 6 + Math.random() * 4

    for (let i = 1; i <= segments; i++) {
      const t = i / segments
      const baseX = x1 + (x2 - x1) * t
      const baseY = y1 + (y2 - y1) * t

      // Add zigzag perpendicular to the line direction
      const offset = (i % 2 === 0 ? 1 : -1) * zigzagAmount * (i < segments ? 1 : 0)
      const finalX = isVertical ? baseX + offset : baseX
      const finalY = isVertical ? baseY : baseY + offset

      path += ` L${finalX} ${finalY}`
    }

    return path
  }

  return (
    <g>
      {/* Base glow path */}
      <path
        d={d}
        stroke={color}
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
        opacity={0.3}
        style={{
          strokeDasharray: pathLength,
          strokeDashoffset: drawn ? 0 : pathLength,
          transition: `stroke-dashoffset ${duration}ms ease-out`,
          filter: `blur(3px)`,
        }}
      />
      {/* Lightning zigzag path */}
      {drawn && (
        <path
          key={lightningKey}
          d={generateLightningPath(d)}
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          style={{
            filter: `drop-shadow(0 0 4px ${color}) drop-shadow(0 0 8px ${color}) drop-shadow(0 0 12px ${color})`,
            animation: 'electric-flicker 0.15s ease-in-out',
          }}
        />
      )}
      {/* Core bright line */}
      <path
        d={d}
        stroke="white"
        strokeWidth="1"
        strokeLinecap="round"
        fill="none"
        opacity={drawn ? 0.8 : 0}
        style={{
          transition: `opacity ${duration}ms ease-out`,
          filter: `drop-shadow(0 0 2px ${color})`,
        }}
      />
    </g>
  )
}

// Researcher: Floating particles along the path
function ResearcherPath({ d, color, pathLength, delay, duration }: PathProps) {
  const [drawn, setDrawn] = useState(false)
  const [particles, setParticles] = useState<{ pos: number; size: number }[]>([])

  useEffect(() => {
    const timer = setTimeout(() => {
      setDrawn(true)
      setParticles([
        { pos: 0.15, size: 3 },
        { pos: 0.35, size: 2 },
        { pos: 0.55, size: 4 },
        { pos: 0.75, size: 2 },
        { pos: 0.9, size: 3 },
      ])
    }, delay)
    return () => clearTimeout(timer)
  }, [delay])

  return (
    <g>
      <path
        d={d}
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        style={{
          strokeDasharray: pathLength,
          strokeDashoffset: drawn ? 0 : pathLength,
          transition: `stroke-dashoffset ${duration}ms ease-out`,
          filter: `drop-shadow(0 0 6px ${color})`,
        }}
      />
      {/* Floating particles */}
      {drawn && particles.map((p, i) => (
        <circle
          key={i}
          r={p.size}
          fill={color}
          opacity={0.8}
          style={{
            offsetPath: `path('${d}')`,
            offsetDistance: `${p.pos * 100}%`,
            animation: `float-particle 2s ease-in-out ${i * 0.2}s infinite alternate`,
            filter: `drop-shadow(0 0 4px ${color})`,
          }}
        />
      ))}
    </g>
  )
}

// Speaker: Equalizer bars effect
function SpeakerPath({ d, color, pathLength, delay, duration }: PathProps) {
  const [drawn, setDrawn] = useState(false)
  const [bars, setBars] = useState<{ x: number; y: number; height: number; delay: number }[]>([])

  useEffect(() => {
    const timer = setTimeout(() => {
      setDrawn(true)
    }, delay)
    return () => clearTimeout(timer)
  }, [delay])

  // Parse path and generate bar positions
  useEffect(() => {
    if (!drawn) return

    const match = d.match(/M([\d.]+)\s+([\d.]+)\s+L([\d.]+)\s+([\d.]+)/)
    if (!match) return

    const [, x1Str, y1Str, x2Str, y2Str] = match
    const x1 = Number(x1Str)
    const y1 = Number(y1Str)
    const x2 = Number(x2Str)
    const y2 = Number(y2Str)

    const numBars = Math.max(4, Math.floor(pathLength / 20))
    const newBars = Array.from({ length: numBars }, (_, i) => {
      const t = (i + 0.5) / numBars
      return {
        x: x1 + (x2 - x1) * t,
        y: y1 + (y2 - y1) * t,
        height: 6 + Math.random() * 10,
        delay: i * 0.06,
      }
    })
    setBars(newBars)
  }, [drawn, d, pathLength])

  // Parse path to get direction
  const dirMatch = d.match(/M([\d.]+)\s+([\d.]+)\s+L([\d.]+)\s+([\d.]+)/)
  const isVertical = dirMatch ? Math.abs(Number(dirMatch[1]) - Number(dirMatch[3])) < 1 : false

  return (
    <g>
      {/* Base path */}
      <path
        d={d}
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        style={{
          strokeDasharray: pathLength,
          strokeDashoffset: drawn ? 0 : pathLength,
          transition: `stroke-dashoffset ${duration}ms ease-out`,
          filter: `drop-shadow(0 0 4px ${color})`,
        }}
      />
      {/* Equalizer bars */}
      {bars.map((bar, i) => (
        <rect
          key={i}
          x={isVertical ? bar.x - bar.height / 2 : bar.x - 1.5}
          y={isVertical ? bar.y - 1.5 : bar.y - bar.height / 2}
          width={isVertical ? bar.height : 3}
          height={isVertical ? 3 : bar.height}
          rx="1.5"
          fill={color}
          style={{
            animation: `equalizer-bounce 0.4s ease-in-out ${bar.delay}s infinite alternate`,
            transformOrigin: isVertical ? `${bar.x}px ${bar.y}px` : `${bar.x}px ${bar.y}px`,
            filter: `drop-shadow(0 0 3px ${color})`,
          }}
        />
      ))}
    </g>
  )
}

// Educator: Smooth warm glow
function EducatorPath({ d, color, pathLength, delay, duration }: PathProps) {
  const [drawn, setDrawn] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setDrawn(true), delay)
    return () => clearTimeout(timer)
  }, [delay])

  return (
    <g>
      {/* Soft outer glow */}
      <path
        d={d}
        stroke={color}
        strokeWidth="8"
        strokeLinecap="round"
        fill="none"
        opacity={0.2}
        style={{
          strokeDasharray: pathLength,
          strokeDashoffset: drawn ? 0 : pathLength,
          transition: `stroke-dashoffset ${duration * 1.2}ms ease-out`,
          filter: `blur(4px)`,
        }}
      />
      {/* Medium glow */}
      <path
        d={d}
        stroke={color}
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
        opacity={0.4}
        style={{
          strokeDasharray: pathLength,
          strokeDashoffset: drawn ? 0 : pathLength,
          transition: `stroke-dashoffset ${duration * 1.1}ms ease-out`,
          filter: `blur(2px)`,
        }}
      />
      {/* Core line */}
      <path
        d={d}
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
        style={{
          strokeDasharray: pathLength,
          strokeDashoffset: drawn ? 0 : pathLength,
          transition: `stroke-dashoffset ${duration}ms ease-out`,
          filter: `drop-shadow(0 0 6px ${color})`,
          animation: drawn ? 'warm-pulse 2s ease-in-out infinite' : 'none',
        }}
      />
    </g>
  )
}

interface PathProps {
  d: string
  color: string
  pathLength: number
  delay: number
  duration: number
}

// Path component that renders based on persona type
function PersonaPath({
  persona,
  ...props
}: PathProps & { persona: Exclude<PersonaType, null> }) {
  switch (persona) {
    case 'engineer':
      return <EngineerPath {...props} />
    case 'researcher':
      return <ResearcherPath {...props} />
    case 'speaker':
      return <SpeakerPath {...props} />
    case 'educator':
      return <EducatorPath {...props} />
  }
}

export default function Landing() {
  const { t, i18n } = useTranslation()
  const { selectedPersona, setPersona, isHovering, setHovering } = usePersonaStore()
  const isEnglish = i18n.language === 'en'

  // Dynamic card position tracking for SVG alignment
  const { svgContainerRef, cardsContainerRef, positions } = useCardPositions()

  // Content section ref for scroll
  const contentRef = useRef<HTMLElement>(null)


  const scrollToContent = () => {
    contentRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handlePersonaSelect = (persona: Exclude<PersonaType, null>) => {
    setPersona(persona)
    // Scroll to content after a brief delay for visual feedback
    setTimeout(() => {
      scrollToContent()
    }, 300)
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {/* HERO SECTION - Full viewport height */}
      <section id="hero" className="min-h-screen flex flex-col items-center justify-center py-8 md:py-12 px-4">

        {/* Header */}
        <div className="text-center mb-4">
          <p className="text-gray-400 text-lg mb-2">{t('landing.hello')}</p>
          <h1 className="text-5xl md:text-7xl font-bold">
            <span className="text-white">Timuçin </span>
            <span
              className="transition-colors duration-300"
              style={{
                color: isHovering ? PERSONAS[isHovering].color : 'var(--persona-primary)',
              }}
            >
              Utkan
            </span>
          </h1>
        </div>

        {/* SVG + Cards Container - share same width for alignment */}
        <div className="w-full max-w-6xl flex flex-col items-center overflow-visible">
          {/* Branching Tree SVG - Hidden on mobile, dynamically aligned with cards */}
          <div ref={svgContainerRef} className="relative w-full mb-0 hidden md:block">
            <svg
              className="w-full h-44"
              viewBox="0 0 800 180"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="none"
            >
              {/* Base paths (gray, always visible) */}
              {/* Main trunk */}
              <path
                d="M400 0 L400 50"
                stroke="#4B5563"
                strokeWidth="2"
              />
              {/* Horizontal branch - spans from first to last card dynamically */}
              {positions.length === 4 && (
                <path
                  d={`M${positions[0]} 50 L${positions[3]} 50`}
                  stroke="#4B5563"
                  strokeWidth="2"
                />
              )}
              {/* Vertical branches - x positions from actual card centers */}
              {positions.map((x, idx) => (
                <path
                  key={`base-${idx}`}
                  d={`M${x} 50 L${x} 180`}
                  stroke="#4B5563"
                  strokeWidth="2"
                />
              ))}

              {/* Highlighted path overlay when hovering or selected - with drawing animation */}
              {(isHovering || selectedPersona) && positions.length === 4 && (() => {
                const activePersona = isHovering || selectedPersona
                if (!activePersona) return null
                const hoverIndex = personaOrder.indexOf(activePersona)
                const x = positions[hoverIndex] || 400
                const color = PERSONAS[activePersona].color
                const horizontalLength = Math.abs(400 - x)

                return (
                  <g key={activePersona}>
                    {/* Trunk: draws first (0-200ms) */}
                    <PersonaPath
                      persona={activePersona}
                      d="M400 0 L400 50"
                      color={color}
                      pathLength={50}
                      delay={0}
                      duration={200}
                    />
                    {/* Horizontal: draws second (150-400ms) */}
                    <PersonaPath
                      persona={activePersona}
                      d={`M400 50 L${x} 50`}
                      color={color}
                      pathLength={horizontalLength}
                      delay={150}
                      duration={250}
                    />
                    {/* Vertical: draws third (350-550ms) */}
                    <PersonaPath
                      persona={activePersona}
                      d={`M${x} 50 L${x} 180`}
                      color={color}
                      pathLength={130}
                      delay={350}
                      duration={200}
                    />
                  </g>
                )
              })()}

              {/* Dots at the end of each branch - dynamically positioned */}
              {positions.map((x, idx) => {
                const persona = personaOrder[idx]
                const isActive = isHovering === persona || selectedPersona === persona
                return (
                  <circle
                    key={`dot-${persona}`}
                    cx={x}
                    cy={180}
                    r={isActive ? 6 : 4}
                    fill={isActive ? PERSONAS[persona].color : '#4B5563'}
                    style={{
                      transition: 'all 0.3s ease',
                      filter: isActive ? `drop-shadow(0 0 10px ${PERSONAS[persona].color})` : 'none',
                    }}
                  />
                )
              })}

              {/* Center connection dot */}
              {(() => {
                const activeColor = isHovering || selectedPersona
                return (
                  <circle
                    cx={400}
                    cy={0}
                    r={activeColor ? 5 : 3}
                    fill={activeColor ? PERSONAS[activeColor].color : '#4B5563'}
                    style={{
                      transition: 'all 0.3s ease',
                      filter: activeColor ? `drop-shadow(0 0 10px ${PERSONAS[activeColor].color})` : 'none',
                    }}
                  />
                )
              })()}
            </svg>
          </div>

          {/* Character Selection - Negative margin to connect with SVG arrows */}
          <div ref={cardsContainerRef} className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10 w-full md:-mt-8 overflow-visible">
            {personaOrder.map((personaId) => {
              const persona = PERSONAS[personaId]
              const isHovered = isHovering === personaId
              const title = isEnglish ? persona.title : persona.titleTR

              return (
                <div
                  key={personaId}
                  data-card
                  className="flex justify-center overflow-visible"
                >
                  <button
                    onClick={() => handlePersonaSelect(personaId)}
                    onMouseEnter={() => setHovering(personaId)}
                    onMouseLeave={() => setHovering(null)}
                    className={cn(
                      'relative flex flex-col items-center py-4 px-2 md:py-6 md:px-4 transition-all duration-500 ease-out w-full',
                      'focus:outline-none',
                      isHovered ? 'scale-110 z-10' : 'scale-100',
                      selectedPersona === personaId ? 'ring-2 ring-offset-2 ring-offset-gray-950' : ''
                    )}
                    style={{
                      color: persona.color,
                      // Add ring color for selected persona
                      '--tw-ring-color': selectedPersona === personaId ? persona.color : undefined,
                    } as React.CSSProperties}
                  >
                    {/* Light beam effect behind character on hover or selected */}
                    {(() => {
                      const isActiveBeam = isHovered || selectedPersona === personaId
                      return (
                        <div
                          className={cn(
                            'absolute inset-0 transition-all duration-500 rounded-3xl',
                            isActiveBeam ? 'opacity-100' : 'opacity-0'
                          )}
                          style={{
                            background: isActiveBeam
                              ? `radial-gradient(ellipse 80% 60% at 50% 70%, ${persona.color}40 0%, ${persona.color}20 30%, transparent 70%)`
                              : 'none',
                            filter: isActiveBeam ? 'blur(8px)' : 'none',
                          }}
                        />
                      )
                    })()}

                    {/* Vertical light beam */}
                    {(() => {
                      const isActiveBeam = isHovered || selectedPersona === personaId
                      return (
                        <div
                          className={cn(
                            'absolute left-1/2 -translate-x-1/2 w-16 md:w-24 transition-all duration-500',
                            isActiveBeam ? 'opacity-100' : 'opacity-0'
                          )}
                          style={{
                            top: '-20%',
                            height: '140%',
                            background: isActiveBeam
                              ? `linear-gradient(to bottom, transparent 0%, ${persona.color}30 20%, ${persona.color}50 50%, ${persona.color}30 80%, transparent 100%)`
                              : 'none',
                            filter: 'blur(12px)',
                          }}
                        />
                      )
                    })()}


                    {/* 3D Avatar - larger and filling space */}
                    <div
                      className={cn(
                        'relative w-32 h-44 md:w-48 md:h-64 transition-transform duration-500',
                        isHovered ? 'scale-105' : 'scale-100'
                      )}
                    >
                      <PersonaAvatar
                        persona={personaId}
                        isSelected={false}
                        isHovered={isHovered}
                        glowColor={persona.color}
                      />
                    </div>

                    {/* Title */}
                    <h3
                      className={cn(
                        'relative text-lg md:text-xl font-bold transition-all duration-300 text-center mt-2',
                        isHovered ? 'text-current' : 'text-gray-400'
                      )}
                      style={{
                        textShadow: isHovered ? `0 0 20px ${persona.color}` : 'none'
                      }}
                    >
                      {title}
                    </h3>

                  </button>
                </div>
              )
            })}
          </div>
        </div>

        {/* Dynamic Tagline - Below cards */}
        <div className="h-12 md:h-16 mt-4 md:mt-6 flex items-center justify-center px-4">
          <p
            className={cn(
              'text-lg md:text-xl text-center transition-all duration-300 max-w-2xl',
              isHovering ? '' : 'text-gray-500 italic'
            )}
            style={isHovering ? { color: PERSONAS[isHovering].color } : undefined}
          >
            {isHovering
              ? (isEnglish ? PERSONAS[isHovering].subtitle : PERSONAS[isHovering].subtitleTR)
              : `"${t('landing.chooseCharacter')}"`}
          </p>
        </div>

        {/* Scroll hint - only show if persona selected */}
        {selectedPersona && (
          <div
            className="mt-6 md:mt-8 animate-bounce cursor-pointer"
            onClick={scrollToContent}
          >
            <svg
              className="w-6 h-6"
              style={{ color: PERSONAS[selectedPersona].color }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </div>
        )}
      </section>

      {/* CONTENT SECTION - Persona-specific content */}
      {selectedPersona && (
        <section
          ref={contentRef}
          id="content"
          className="min-h-screen bg-gray-950"
        >
          {/* Persona Badge at top of content */}
          <div className="pt-16 pb-8 px-4">
            <div className="container-custom">
              <div className="flex flex-col items-center text-center">
                <span
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-4"
                  style={{
                    backgroundColor: `${PERSONAS[selectedPersona].color}20`,
                    color: PERSONAS[selectedPersona].color,
                  }}
                >
                  <span>{PERSONAS[selectedPersona].icon}</span>
                  {isEnglish ? PERSONAS[selectedPersona].title : PERSONAS[selectedPersona].titleTR}
                </span>

                <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                  {t(`${selectedPersona}.title`)}
                </h2>
                <p className="text-lg text-gray-400 max-w-2xl">
                  {isEnglish ? PERSONAS[selectedPersona].subtitle : PERSONAS[selectedPersona].subtitleTR}
                </p>

                {/* Stats */}
                <div className="flex gap-8 md:gap-12 mt-8">
                  {PERSONAS[selectedPersona].stats.map((stat, idx) => (
                    <div key={idx} className="text-center">
                      <div
                        className="text-3xl md:text-4xl font-bold"
                        style={{ color: PERSONAS[selectedPersona].color }}
                      >
                        {stat.value}
                      </div>
                      <div className="text-sm text-gray-400">
                        {isEnglish ? stat.label : stat.labelTR}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Career Game CTA */}
                <div className="mt-12">
                  <Link
                    to="/career-game"
                    className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-cyan-500 via-purple-500 to-orange-500 rounded-xl font-bold text-white hover:scale-105 transition-transform duration-200 shadow-lg hover:shadow-cyan-500/50"
                  >
                    <span className="text-2xl">🎮</span>
                    <span>Explore My Career Journey</span>
                  </Link>
                  <p className="text-xs text-gray-500 mt-3">
                    Interactive 3D timeline - Walk through my career and chat with projects
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Persona Content */}
          <PersonaContent persona={selectedPersona} />
        </section>
      )}
    </div>
  )
}
