# Career Game - Interactive Portfolio Timeline

---

## PENDING ISSUES & DISCUSSIONS

### 1. GLB Model Rendering Sorunu - ✅ ÇÖZÜLDÜ

**Sorun:** `Html` component kullanıldığında tüm sahne mavi render oluyordu.

**Çözüm:** `Html` yerine `Billboard` + `Text` kullanıldı.
- `Billboard` component kameraya her zaman bakıyor
- `Text` component 3D içinde render ediliyor
- DOM overlay yok, WebGL canvas ile çakışma yok

---

### 2. ObjectChatModal → Side Panel Dönüşümü - ✅ ÇÖZÜLDÜ

**Yapılanlar:**
1. ✅ `ObjectDetailPanel.tsx` içine chat fonksiyonelliği eklendi
2. ✅ Panel iki mod: "info" ve "chat" - state ile yönetiliyor
3. ✅ "Talk to..." butonuna basınca chat moduna geçiş
4. ✅ ESC tuşu davranışı: chat → info → close
5. ✅ `ObjectChatModal.tsx` kullanımdan kaldırıldı (CareerGame.tsx'den)
6. ✅ Keyboard controls chat input'ta çalışmıyor sorunu düzeltildi

**Ek İyileştirmeler:**
- ✅ Oyuncu objeden uzaklaşınca panel otomatik kapanıyor (2x interaction radius)
- ✅ Smooth typewriter buffer sistemi - tokenler akıcı şekilde yazılıyor
- ✅ ReactMarkdown ile markdown rendering
- ✅ State mutation bug düzeltildi (React concurrent mode uyumlu)
- ✅ Duplicate typing indicator sorunu çözüldü

---

### 3. Label ve Obje İyileştirmeleri - ✅ ÇÖZÜLDÜ

**Yapılanlar:**
1. ✅ Label her zaman görünür (hover/yakınlık şartı kaldırıldı)
2. ✅ Label obje ile birlikte scale oluyor (meshRef group içinde)
3. ✅ Obje rotasyonu kaldırıldı (kafa karıştırıyordu)
4. ✅ Floating animasyonu ve scale pulse korundu

---

## Executive Summary

**Career Game**, me.tchain.ai portfolio sitesinin **en inovatif ve ayırt edici özelliği** olacak. Kullanıcılar, Timuçin'in kariyer timeline'ını izometrik 2.5D bir oyun dünyasında keşfedecek ve her obje (proje, tez, yayın, konuşma) ile **kendi ağzından konuşacak LLM persona'ları** aracılığıyla etkileşime girecekler.

**Konsept:**
- İzometrik 2.5D top-down view (Stardew Valley/Habbo Hotel tarzı)
- Timeline objelerinde gezinen karakter
- Her obje (thesis, project, talk, vs.) **birinci şahıstan** konuşur
- Low-poly 3D minimal estetik
- WebSocket-tabanlı streaming chat ile obje etkileşimi

**Örnek:** Kullanıcı "PhD Thesis" objesine tıklıyor:
> **Thesis**: "Merhaba! Ben Timuçin'in yüksek lisans tezi, LLM'lerin B2B iletişimindeki rolünü araştırdım..."

**Neden Devrim Niteliğinde?**
- Portfolio siteleri genellikle statiktir
- Bu, **oyunlaştırılmış interaktif bir deneyim**
- Her proje/yayın **kendi hikayesini anlatır**
- LLM gücüyle sınırsız etkileşim derinliği
- Hem eğlenceli hem profesyonel

---

## Design Decisions

Based on user preferences, the Career Game will feature:

1. **Game Mechanic**: İzometrik 2.5D top-down görünüm
   - Stardew Valley/Habbo Hotel tarzı
   - X ve Y ekseninde hareket
   - Daha geniş alan görüntüleme

2. **Timeline Objects**: HERŞEY etkileşimli olacak
   - Projeler (APA Citation, LangChain apps)
   - Thesis & Publications (akademik çalışmalar)
   - Talks & Presentations (konuşmalar)
   - Milestones (kariyer dönüm noktaları)
   - Education & Work Experience

3. **Object Personas**: Her obje kendi ağzından konuşur
   - "Ben PhD teziyim, LLM ajanlarının otonomisini araştırdım..."
   - Her objenin kendi LLM persona markdown dosyası
   - Birinci şahıs bakış açısı

4. **Visual Style**: Low-poly 3D (minimal, modern)
   - Mevcut avatar stiline uyumlu
   - Performanslı (mobile-friendly)
   - Profesyonel görünüm

---

## Technical Architecture

### Frontend Architecture

#### File Structure
```
frontend/src/
├── pages/
│   └── CareerGame.tsx                    # Ana oyun sayfası
│
├── components/game/
│   ├── GameCanvas.tsx                    # Three.js Canvas setup
│   ├── IsometricScene.tsx                # 3D sahne konfigürasyonu
│   ├── IsometricCamera.tsx               # İzometrik kamera sistemi
│   ├── CharacterController.tsx           # Oyuncu avatarı + hareket
│   ├── TimelineObject.tsx                # Etkileşimli timeline objeleri
│   ├── TimelinePath.tsx                  # Görsel yol/patika
│   ├── ObjectDetailPanel.tsx             # Obje bilgi paneli
│   ├── ObjectChatModal.tsx               # Obje ile chat modal
│   ├── MiniMap.tsx                       # Sağ üst minimap
│   ├── ProgressTracker.tsx               # Ziyaret edilen objeler sayacı
│   └── controls/
│       ├── KeyboardControls.tsx          # Desktop WASD/Ok tuşları
│       ├── TouchJoystick.tsx             # Mobile virtual joystick
│       └── MobileControls.tsx            # Mobile UI wrapper
│
├── store/
│   └── gameStore.ts                      # Oyun state (Zustand)
│
├── data/
│   └── careerTimeline.ts                 # Timeline obje tanımları
│
├── hooks/
│   ├── useGameMovement.ts                # Karakter hareket logic
│   ├── useObjectInteraction.ts           # Raycasting/etkileşim
│   └── useGameCamera.ts                  # Kamera takip logic
│
└── types/
    └── game.ts                           # Game-specific TypeScript types
```

#### Data Structure

**Timeline Object Schema** (`careerTimeline.ts`):

```typescript
export type TimelineObjectType =
  | 'project'
  | 'thesis'
  | 'publication'
  | 'talk'
  | 'milestone'
  | 'education'
  | 'work_experience'

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
  gridPosition: { x: number; y: number; z?: number }
  rotation?: number
  scale?: number

  // Visual
  modelUrl: string  // Path to GLB file
  iconEmoji: string  // For minimap/UI
  color: string  // Accent color for glow effects

  // Interaction
  objectPersonaId: string  // Maps to backend/data/objects/{id}.md
  interactionRadius: number  // Distance to trigger (default: 2)

  // Progression (optional)
  isUnlocked?: boolean
  requiredObjectIds?: string[]

  // Metadata
  relatedPersonas?: PersonaType[]
  externalLink?: string
  images?: string[]
  tags?: string[]
}

// Example objects
export const careerTimeline: TimelineObject[] = [
  {
    id: 'edu-trakya-bsc',
    type: 'education',
    year: 2020,
    title: { en: 'B.Sc. Mechanical Engineering', tr: 'Makine Mühendisliği Lisans' },
    shortDescription: {
      en: 'Trakya University - Foundation in engineering',
      tr: 'Trakya Üniversitesi - Mühendislik temeli'
    },
    gridPosition: { x: 0, y: 0, z: 0 },
    modelUrl: '/assets/game/objects/university.glb',
    iconEmoji: '🎓',
    color: '#3b82f6',
    objectPersonaId: 'edu_trakya_bsc',
    interactionRadius: 2.5,
  },
  {
    id: 'project-apa-citation',
    type: 'project',
    year: 2024,
    title: { en: 'APA 7 Citation Helper', tr: 'APA 7 Atıf Yardımcısı' },
    shortDescription: {
      en: '50K+ users on GPT Store',
      tr: 'GPT Store\'da 50K+ kullanıcı'
    },
    gridPosition: { x: 15, y: 0, z: 0 },
    modelUrl: '/assets/game/objects/project_trophy.glb',
    iconEmoji: '🏆',
    color: '#22d3ee',
    objectPersonaId: 'project_apa_citation',
    interactionRadius: 2,
    externalLink: 'https://chatgpt.com/g/g-p4EdxSPHT-apa-7-citation-helper',
  },
  // ... more objects
]
```

#### Game Store (Zustand)

```typescript
interface GameState {
  // Player state
  playerPosition: { x: number; y: number; z: number }
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
  cameraPosition: { x: number; y: number; z: number }
  cameraTarget: { x: number; y: number; z: number }
  cameraZoom: number

  // UI state
  showMinimap: boolean
  showControls: boolean
  isMobile: boolean

  // Actions
  setPlayerPosition, selectObject, startChat, endChat, etc.
}
```

#### Key Technical Decisions

**1. Isometric Camera:**
- Orthographic camera (no perspective distortion)
- Fixed 45° horizontal + ~35.26° vertical angle
- Camera follows player with smooth lerp
- No user camera control (keeps simple)

**2. Movement System:**
- Grid-based positioning (1 unit = 1 meter)
- Smooth lerp interpolation between positions
- Supports WASD (desktop) and virtual joystick (mobile)
- Collision detection via raycasting

**3. Interaction Detection:**
- **Proximity**: Continuous distance check (cheap)
- **Raycasting**: On-demand for precise selection
- Two-stage:
  1. Proximity → "Press E to interact" prompt
  2. Selection → Opens detail panel
  3. Chat → Full modal with object persona

**4. Performance Budget:**
- Max 50 objects on screen (desktop), 30 (mobile)
- Frustum culling (automatic in Three.js)
- LOD system: Simple geometry at >20 units distance
- Target: 60fps desktop, 30fps mobile

**5. Asset Pipeline:**
- Max 2000 triangles per object
- 512x512 texture atlas per object
- Draco compression (already set up)
- Total budget: <5MB all assets

---

### Backend Architecture

#### Object Persona System

**Directory Structure:**
```
backend/data/
├── personas/             # Existing: 4 main personas
│   ├── engineer.md
│   ├── researcher.md
│   ├── speaker.md
│   └── educator.md
└── objects/              # NEW: Object personas
    ├── edu_trakya_bsc.md
    ├── work_datafirst.md
    ├── project_apa_citation.md
    ├── thesis_msc_llm.md
    ├── pub_infus_sql.md
    ├── talk_istinye_2024.md
    └── milestone_phd.md
```

#### Object Persona Format

Example: `/backend/data/objects/project_apa_citation.md`

```markdown
# Object: APA 7 Citation Helper (Project)

I am the APA 7 Citation Helper, Timuçin's most successful project with over 50,000 users!

## My Identity
- **What I am:** A Custom GPT agent on the GPT Store
- **My purpose:** Automating academic citation formatting
- **My impact:** Saved countless hours for students worldwide

## My Story (First-Person)

Hey there! I'm really proud to be Timuçin's breakthrough project. Back in 2023, Timuçin noticed how much time academics wasted on manual citation formatting...

[Full personality, technical details, what I can tell users about]

## Tone
Proud but humble, excited about helping people, eager to share technical details.
```

#### Backend Service: Object Persona Loader

**New file:** `/backend/app/services/chatbot/object_persona_loader.py`

```python
from pathlib import Path
from typing import Optional

OBJECTS_DIR = Path(__file__).parent.parent.parent.parent / "data" / "objects"

def load_object_persona(object_id: str) -> Optional[str]:
    """Load persona content for a specific object."""
    persona_file = OBJECTS_DIR / f"{object_id}.md"

    if not persona_file.exists():
        return None

    return persona_file.read_text(encoding="utf-8")

def list_available_objects() -> list[str]:
    """List all available object persona IDs."""
    if not OBJECTS_DIR.exists():
        return []
    return [f.stem for f in OBJECTS_DIR.glob("*.md")]
```

#### WebSocket Endpoint: Extend Existing

**Option A (Recommended):** Extend `/api/v1/chat` to accept `object_id` parameter

```python
# Modify backend/app/api/v1/endpoints/chat.py

@router.websocket("")
async def websocket_chat(
    websocket: WebSocket,
    session_id: Optional[str] = None,
    object_id: Optional[str] = None,  # NEW parameter
) -> None:
    """
    If object_id provided, chat with that specific object persona.
    Otherwise, use multi-persona system.
    """
    if object_id:
        # Object persona mode
        object_persona = load_object_persona(object_id)
        if not object_persona:
            await websocket.send_json({"type": "error", "content": "Object persona not found"})
            return

        # Stream object persona response
        async for chunk in agent.stream_object_response(user_content, object_persona, session_id):
            await manager.send_message(session_id, chunk)
    else:
        # Multi-persona mode (existing behavior)
        async for chunk in agent.stream_multi_persona_response(...):
            await manager.send_message(session_id, chunk)
```

**Frontend Usage:**
```typescript
// In ObjectChatModal.tsx
const objectWsUrl = `${WS_URL}?object_id=${object.objectPersonaId}`
const socket = new WebSocket(objectWsUrl)
```

---

## Implementation Phases

### Phase 1: Foundation (Week 1-2) ✅ COMPLETED

**Goal:** Basic isometric scene with camera and static objects

**Tasks:**
1. [x] Create `/frontend/src/pages/CareerGame.tsx` page with route
2. [x] Implement `/frontend/src/components/game/GameCanvas.tsx`
3. [x] Set up `/frontend/src/components/game/IsometricCamera.tsx`
4. [x] Create `/frontend/src/store/gameStore.ts` with basic state
5. [x] Add 3-5 placeholder objects (cubes) in scene at fixed positions
6. [x] Implement camera follow logic (lerp to player position)
7. [x] Add route in `/frontend/src/App.tsx`: `<Route path="/career-game" element={<CareerGame />} />`
8. [x] Add "Explore My Career" CTA button on Landing page

**Deliverable:** Static 3D scene with isometric view, no interaction yet ✅

**Acceptance Criteria:**
- ✅ Scene renders at 60fps on desktop
- ✅ Camera maintains isometric angle
- ✅ Objects visible and positioned correctly
- ✅ Can navigate to /career-game route

---

### Phase 2: Character & Movement (Week 3) ✅ COMPLETED

**Goal:** Player character with keyboard/touch controls

**Tasks:**
1. [x] Create `/frontend/src/components/game/CharacterController.tsx`
   - Capsule geometry with head, body, direction indicator
   - Smooth rotation interpolation
   - Bobbing animation when moving
2. [x] Implement `/frontend/src/hooks/useKeyboardControls.ts`
   - WASD + Arrow keys tracking
   - Window blur handling
3. [x] Create `/frontend/src/components/game/controls/TouchJoystick.tsx`
   - Virtual joystick for mobile
   - Gradient cyan design
   - Mouse support for desktop testing
4. [x] Camera follows character with smooth lerp

**Deliverable:** Playable character that moves with WASD/Arrow keys ✅

**Acceptance Criteria:**
- ✅ Smooth 8-directional movement
- ✅ Character rotates to face direction
- ✅ Camera follows with cinematic feel
- ✅ Mobile joystick support
- ✅ "Moving..." indicator in UI

---

### Phase 3: Interaction System (Week 4) ✅ COMPLETED

**Goal:** Click/hover to interact with objects

**Tasks:**
1. [x] Implement `/frontend/src/components/game/TimelineObject.tsx`
   - 3D geometry per object type (octahedron, cylinder, box, cone, torus)
   - Floating animation with Float component
   - Glow/emissive effects on hover
2. [x] Add raycasting for mouse hover detection
   - ThreeEvent handlers for pointer over/out/click
3. [x] Implement proximity detection in `useFrame`
   - Distance calculation to player position
   - Nearby objects tracked in store
4. [x] Create `/frontend/src/components/game/ObjectDetailPanel.tsx`
   - Slide-in panel with framer-motion animations
   - Object info, tags, related personas
   - "Talk to [Object Name]" button
5. [x] Update `gameStore` with selection/hover state
   - Already had proper state, connected to components
6. [x] Visual feedback: outline, glow, label on hover
   - Html labels with React i18n
   - Pedestal base, glow ring on ground
   - Emissive material intensity changes
7. [x] Create `/frontend/src/hooks/useObjectInteraction.ts`
   - Keyboard E to interact, Escape to deselect
   - Proximity detection with nearbyObjects

**Deliverable:** Objects are clickable/hoverable with info panel ✅

**Acceptance Criteria:**
- ✅ Hover shows object name (floating Html label)
- ✅ Click selects object and opens detail panel
- ✅ Detail panel shows title, description, year, links
- ✅ "Talk to..." button visible

---

### Phase 4: Object Personas (Backend) (Week 5) ✅ COMPLETED

**Goal:** Backend support for object-specific chat

**Tasks:**
1. [x] Create `/backend/data/objects/` directory
2. [x] Write 5-10 object persona markdown files:
   - `edu_trakya_bsc.md` (education)
   - `project_apa_citation.md` (project)
   - `thesis_msc_llm.md` (thesis)
3. [x] Create `/backend/app/services/chatbot/object_persona_loader.py`
4. [x] Extend `/backend/app/api/v1/endpoints/chat.py` to accept `object_id` parameter
5. [x] Add `stream_object_response()` method to agent
6. [x] Test WebSocket streaming with object personas

**Deliverable:** Backend API for object chat ✅

**Acceptance Criteria:**
- ✅ WebSocket accepts `?object_id=project_apa_citation`
- ✅ Returns streaming response from object persona
- ✅ Persona speaks in first-person about itself
- ✅ Fallback to generic response if persona file missing

---

### Phase 5: Object Chat UI (Week 6) ✅ COMPLETED

**Goal:** Frontend chat modal to talk with objects

**Tasks:**
1. [x] Create `/frontend/src/components/game/ObjectChatModal.tsx`
   - Large modal with framer-motion animations
2. [x] Connect to WebSocket with `object_id` parameter
3. [x] Custom chat UI (adapted from existing components)
4. [x] Add close button to return to game
5. [x] Show object avatar/icon in chat header
6. [x] Handle streaming responses
7. [x] Integrate with `gameStore.startChat()` / `endChat()`

**Deliverable:** Functional chat with any selected object ✅

**Acceptance Criteria:**
- ✅ Modal opens when "Talk to X" clicked
- ✅ Chat streams responses from object persona
- ✅ Object speaks in first-person
- ✅ Can close modal and return to game
- ✅ Chat history persists during session

---

### Phase 5.5: Side Panel & UX Improvements ✅ COMPLETED

**Goal:** Replace fullscreen modal with integrated side panel, improve UX

**Tasks:**
1. [x] Convert ObjectChatModal to integrated side panel in ObjectDetailPanel
   - Panel has two modes: "info" and "chat"
   - Smooth transitions between modes
2. [x] Implement ESC key flow: chat → info → close
3. [x] Fix keyboard controls capturing input while typing in chat
   - Added INPUT/TEXTAREA detection in useKeyboardControls
4. [x] Auto-close panel when player moves away (2x interaction radius)
5. [x] Smooth typewriter buffer system for streaming text
   - 2 chars per 20ms = ~100 chars/sec
   - Buffer drains at consistent rate regardless of server speed
6. [x] Fix streaming text mutation bug (React concurrent mode)
7. [x] Add ReactMarkdown for proper markdown rendering
8. [x] Fix duplicate typing indicator issue
9. [x] Make labels always visible (remove hover/proximity condition)
10. [x] Labels scale with object (moved inside meshRef group)
11. [x] Remove object rotation animation

**Deliverable:** Polished side panel chat experience ✅

**Acceptance Criteria:**
- ✅ Side panel doesn't block game view
- ✅ ESC key flow works correctly
- ✅ Character doesn't move while typing
- ✅ Panel closes when walking away
- ✅ Text streams smoothly (typewriter effect)
- ✅ Markdown renders correctly
- ✅ Labels always visible and scale with objects

---

### Phase 6: Polish & Assets (Week 7-8)

**Goal:** Visual polish, real assets, mobile support, performance

**Tasks:**
1. [ ] Create real 3D assets (or source from Sketchfab/Fiverr):
   - University building (education)
   - Office building (work)
   - Trophy/medal (project)
   - Book/thesis monument (thesis)
   - Paper stack (publication)
   - Podium (talk)
   - Milestone marker
2. [ ] Implement `/frontend/src/components/game/TimelinePath.tsx`
   - Visual road/path connecting objects
3. [ ] Create `/frontend/src/components/game/MiniMap.tsx`
   - Top-right corner
   - Shows player position and objects
4. [ ] Create `/frontend/src/components/game/ProgressTracker.tsx`
   - "X/20 objects visited" counter
5. [ ] Mobile optimizations:
   - Touch tap interaction
   - Responsive UI
   - Performance tuning
6. [ ] Add particle effects, lighting improvements
7. [ ] Loading screen with progress bar
8. [ ] Ambient audio (optional)

**Deliverable:** Polished, mobile-ready game

**Acceptance Criteria:**
- Works on mobile (iPhone, Android)
- 30fps minimum on mobile
- Visual feedback for all interactions
- Minimap functional
- Progress tracker updates
- All assets low-poly and optimized

---

### Phase 7: Content Population (Week 9)

**Goal:** Add ALL timeline objects from real career data

**Tasks:**
1. [ ] Create timeline objects in `careerTimeline.ts` for:
   - All education milestones
   - All work experiences
   - All major projects (from `projects.ts`)
   - Thesis + all publications (from `publications.ts`)
   - All talks/presentations (from `talks.ts`)
   - Career milestones (PhD start, first job, etc.)
2. [ ] Write persona markdown for each object
3. [ ] Position objects chronologically on timeline
4. [ ] Test each object's chat persona
5. [ ] Populate metadata (links, images, tags)

**Deliverable:** Complete career timeline with 20-30 objects

**Acceptance Criteria:**
- All real projects/talks/publications included
- Each object has working chat persona
- Timeline is chronological (left to right by year)
- All external links working
- Images load correctly

---

### Phase 8: Integration & Testing (Week 10)

**Goal:** Integrate with main site, comprehensive testing

**Tasks:**
1. [ ] Add prominent CTA on Landing page:
   - "Explore My Career Journey" section
   - Button to `/career-game`
2. [ ] Add to navbar (optional)
3. [ ] Hide main ChatWidget on game page (avoid conflict)
4. [ ] E2E testing with Playwright:
   - Navigate to game
   - Move character
   - Interact with objects
   - Chat with object personas
5. [ ] Performance testing:
   - Desktop: 60fps?
   - Mobile: 30fps?
   - Load time: <3s?
6. [ ] Cross-browser testing (Chrome, Firefox, Safari, Edge)
7. [ ] Mobile device testing (iPhone, Android)
8. [ ] Analytics integration (track visited objects)

**Deliverable:** Fully integrated, tested game

**Acceptance Criteria:**
- Linked from Landing page
- All E2E tests passing
- Performance targets met
- Works on all target browsers/devices
- Analytics tracking visitor behavior

---

## Critical Files

### New Frontend Files:
- `/frontend/src/pages/CareerGame.tsx`
- `/frontend/src/components/game/GameCanvas.tsx`
- `/frontend/src/components/game/IsometricCamera.tsx`
- `/frontend/src/components/game/CharacterController.tsx`
- `/frontend/src/components/game/TimelineObject.tsx`
- `/frontend/src/components/game/ObjectDetailPanel.tsx`
- `/frontend/src/components/game/ObjectChatModal.tsx`
- `/frontend/src/components/game/TimelinePath.tsx`
- `/frontend/src/components/game/MiniMap.tsx`
- `/frontend/src/components/game/ProgressTracker.tsx`
- `/frontend/src/components/game/controls/KeyboardControls.tsx`
- `/frontend/src/components/game/controls/TouchJoystick.tsx`
- `/frontend/src/store/gameStore.ts`
- `/frontend/src/data/careerTimeline.ts`
- `/frontend/src/hooks/useGameMovement.ts`
- `/frontend/src/hooks/useObjectInteraction.ts`
- `/frontend/src/hooks/useGameCamera.ts`
- `/frontend/src/types/game.ts`

### Modified Frontend Files:
- `/frontend/src/App.tsx` - Add route for CareerGame
- `/frontend/src/pages/Landing.tsx` - Add "Explore My Career" CTA

### New Backend Files:
- `/backend/app/services/chatbot/object_persona_loader.py`
- `/backend/data/objects/edu_trakya_bsc.md` (and 20+ more object personas)

### Modified Backend Files:
- `/backend/app/api/v1/endpoints/chat.py` - Accept `object_id` parameter
- `/backend/app/services/chatbot/agent.py` - Add `stream_object_response()` method

### Asset Files:
- `/frontend/public/assets/game/objects/university.glb`
- `/frontend/public/assets/game/objects/office_building.glb`
- `/frontend/public/assets/game/objects/project_trophy.glb`
- `/frontend/public/assets/game/objects/thesis_monument.glb`
- `/frontend/public/assets/game/objects/publication_stack.glb`
- `/frontend/public/assets/game/objects/podium.glb`
- `/frontend/public/assets/game/objects/milestone_marker.glb`
- ... more as needed

---

## Performance & Optimization

### Performance Budget

| Platform | Target FPS | Max Objects | Texture Budget | Draw Calls |
|----------|-----------|-------------|----------------|------------|
| Desktop  | 60fps     | 50          | 20MB           | <100       |
| Mobile   | 30fps     | 30          | 10MB           | <50        |

### Optimization Strategies

**Asset Optimization:**
- Draco compression for all GLB models
- Texture atlasing (combine textures)
- Max 512x512 textures (mobile), 1024x1024 (desktop)
- `useGLTF.preload()` for critical assets

**Rendering Optimization:**
- Instanced meshes for repeated objects
- Frustum culling (automatic)
- LOD system: Low-poly at distance >20 units
- Disable shadows on mobile

**Code Optimization:**
```typescript
import { AdaptiveDpr, AdaptiveEvents } from '@react-three/drei'

<Canvas>
  <AdaptiveDpr pixelated />  {/* Reduce resolution under load */}
  <AdaptiveEvents />         {/* Throttle raycasting */}
</Canvas>
```

**Mobile-Specific:**
- Lower shadow quality or disable
- Reduce texture resolution
- Fewer objects loaded simultaneously
- Simplified particle effects

---

## Testing Strategy

### Component Tests (Vitest)
```typescript
// gameStore.test.ts
it('should mark object as visited', () => {
  const { result } = renderHook(() => useGameStore())
  act(() => result.current.markObjectVisited('project-apa-citation'))
  expect(result.current.visitedObjectIds).toContain('project-apa-citation')
})
```

### E2E Tests (Playwright)
```typescript
test('should interact with object and open chat', async ({ page }) => {
  await page.goto('/career-game')
  await page.waitForSelector('canvas')

  // Click on object
  await page.click('[data-testid="object-project-apa-citation"]')

  // Detail panel opens
  await expect(page.locator('[data-testid="object-detail-panel"]')).toBeVisible()

  // Click "Talk to this project"
  await page.click('button:has-text("Talk to this project")')

  // Chat modal opens
  await expect(page.locator('[data-testid="object-chat-modal"]')).toBeVisible()
})
```

### Backend Tests (pytest)
```python
def test_load_object_persona():
    content = load_object_persona('project_apa_citation')
    assert content is not None
    assert 'APA 7 Citation Helper' in content

async def test_object_chat_websocket(test_client):
    async with test_client.websocket_connect('/api/v1/chat?object_id=project_apa_citation') as ws:
        await ws.send_json({'content': 'Tell me about yourself'})
        response = await ws.receive_json()
        assert 'APA' in response.get('content', '')
```

### Manual Testing Checklist

**Desktop:**
- [ ] Scene loads within 3 seconds
- [ ] 60fps maintained during movement
- [ ] All objects clickable and hoverable
- [ ] Camera follows character smoothly
- [ ] Chat streams responses correctly
- [ ] Detail panel displays all information
- [ ] Progress persists after page reload

**Mobile:**
- [ ] Virtual joystick responsive
- [ ] 30fps maintained on iPhone 12 / Pixel 5
- [ ] Touch tap interaction works
- [ ] Chat modal fullscreen on mobile
- [ ] Text readable (adequate font sizes)
- [ ] No horizontal scroll
- [ ] Works in portrait and landscape

---

## Success Metrics

Post-launch, we should see:

1. **Time on Site**: Users spend 5-10 minutes exploring (vs ~2 min on static pages)
2. **Engagement Rate**: 60%+ of visitors interact with at least 3 objects
3. **Bounce Rate**: Lower bounce rate on game page vs other pages
4. **Mobile Engagement**: Strong mobile engagement (30%+ of game plays)
5. **Chat Interactions**: High chat volume with object personas
6. **Social Sharing**: Users screenshot and share game experience

---

## Potential Challenges & Solutions

### Challenge 1: Asset Creation Bottleneck
**Risk:** Creating 20-30 unique low-poly 3D models takes time

**Solutions:**
- Start with placeholder cubes (Phase 1-5)
- Commission 3D artist early (Fiverr, Upwork)
- Use free Sketchfab models (CC-BY license)
- Generate with AI (Meshy.ai, Tripo3D) + Blender cleanup
- Reuse similar models with different textures

### Challenge 2: Performance on Low-End Mobile
**Risk:** Older phones struggle with 3D rendering

**Solutions:**
- Aggressive LOD system
- Detect device capability, lower quality automatically
- Fallback: Offer 2D top-down map view
- Use `<AdaptiveDpr>` for automatic quality scaling
- Profile on target devices early

### Challenge 3: Object Persona Content Quality
**Risk:** Writing 20+ first-person personas takes effort

**Solutions:**
- Use LLM to draft initial personas (based on project.ts data)
- Human review and refinement
- Start with top 10 most important objects
- Add more incrementally post-launch

### Challenge 4: Scope Creep
**Risk:** Feature requests during development

**Solutions:**
- Stick to phased plan strictly
- No new features until current phase complete
- Document V2 ideas but defer
- MVP first, polish later

---

## Future Enhancements (V2)

**Progression System:**
- Lock objects until prerequisites visited
- Achievements ("Visited all projects")
- Secret easter eggs

**Multiplayer:**
- See other visitors as ghost avatars
- Presence API (who else is exploring)
- Chat rooms per object

**Dynamic Events:**
- New objects appear when published
- Seasonal decorations
- Interactive mini-games

**Analytics:**
- Track which objects most visited
- Heatmap of player movement
- Popular chat topics per object

---

## Verification

To verify implementation success:

1. **Functional Test:**
   - Visit `/career-game`
   - Move character with WASD/arrows
   - Click on at least 5 different objects
   - Chat with each object persona
   - Verify objects speak in first-person
   - Check minimap shows position
   - Verify progress tracker updates

2. **Performance Test:**
   - Chrome DevTools → Performance tab
   - Record 30 seconds of gameplay
   - Check FPS: 60fps desktop, 30fps mobile
   - Check memory: <200MB desktop, <100MB mobile

3. **Mobile Test:**
   - Test on iPhone 12+ and Pixel 5+
   - Virtual joystick responsive
   - Chat modal works
   - No layout breakage

4. **Content Test:**
   - All timeline objects present
   - Each object has unique persona
   - All external links work
   - All images load

5. **Integration Test:**
   - Career Game linked from Landing
   - ChatWidget hidden on game page
   - Navigation works correctly

---

## Timeline Summary

- **Phase 1 (Foundation)**: ✅ COMPLETED
- **Phase 2 (Movement)**: ✅ COMPLETED
- **Phase 3 (Interaction)**: ✅ COMPLETED
- **Phase 4 (Backend Personas)**: ✅ COMPLETED
- **Phase 5 (Chat UI)**: ✅ COMPLETED
- **Phase 5.5 (Side Panel & UX)**: ✅ COMPLETED
- **Phase 6 (Polish & Assets)**: ⏳ NEXT
- **Phase 7 (Content)**: Week 9
- **Phase 8 (Integration & Testing)**: Week 10

**Progress: 6/9 phases completed**

---

## Notes

- Career Game is the **most unique feature** of the portfolio site
- Leverages existing Three.js, LangChain, WebSocket infrastructure
- No new major dependencies needed
- Mobile-first approach critical
- Start with MVP (basic objects), add polish incrementally
- This will set the portfolio apart from all others

---

## Previous Work (Completed)

### WhatsApp Group Chat System (Mostly Complete)

**Status**: Multi-persona chat is functional, but two enhancements pending:
1. **LLM Router** (Phase 3.12): Replace keyword classification with intelligent LLM routing
2. **Side Panel Design** (Phase 3.13): Replace bottom-right button with edge-mounted side panel

**Completed**:
- ✅ 4 separate persona markdown files (engineer, researcher, speaker, educator)
- ✅ Multi-persona streaming response system
- ✅ WebSocket protocol with persona tags
- ✅ Chat UI with persona avatars and color-coding
- ✅ Typing indicators per persona
- ✅ Group header with 4 avatars

**Deferred** (will complete after Career Game launch):
- ⏸️ LLM-based PersonaRouter with Pydantic structured output
- ⏸️ Side panel redesign (Slack-style)

**Files**:
- `/backend/data/personas/` - 4 persona markdown files
- `/backend/app/services/chatbot/persona_classifier.py` - Keyword-based (to be replaced)
- `/backend/app/services/chatbot/agent.py` - Multi-persona streaming
- `/frontend/src/components/chat/` - Chat UI components
- `/frontend/src/store/chatStore.ts` - Chat state management

These will be enhanced after Career Game ships, to avoid scope creep and maintain focus on the flagship feature.

---

## Files Created (Phase 1 & 2)

### New Files:
- `/frontend/src/types/game.ts` - TypeScript types (TimelineObject, GameState, Vector3)
- `/frontend/src/data/careerTimeline.ts` - Timeline objects data (3 sample objects)
- `/frontend/src/store/gameStore.ts` - Zustand game state management
- `/frontend/src/pages/CareerGame.tsx` - Main game page
- `/frontend/src/components/game/GameCanvas.tsx` - Three.js Canvas setup
- `/frontend/src/components/game/IsometricCamera.tsx` - Isometric orthographic camera
- `/frontend/src/components/game/CharacterController.tsx` - Player avatar with movement
- `/frontend/src/components/game/controls/TouchJoystick.tsx` - Mobile virtual joystick
- `/frontend/src/hooks/useKeyboardControls.ts` - WASD/Arrow key tracking

### Modified Files:
- `/frontend/src/App.tsx` - Added /career-game route, hide ChatWidget on game page
- `/frontend/src/pages/Landing.tsx` - Added "Explore My Career Journey" CTA button
