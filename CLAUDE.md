# CLAUDE.md - AI Assistant Project Guide

Bu dosya, Claude AI'ın bu projeyi anlaması ve etkili bir şekilde katkıda bulunması için bir rehberdir.

## Proje Özeti

**me.tchain.ai** - Kazım Timuçin Utkan için kişisel AI portfolio sitesi.

- **Amaç:** Yapay zeka araştırma mühendisi olarak profesyonel kimliği sergilemek
- **Özellikler:** AI chatbot, interaktif görselleştirmeler, persona-based content
- **Hedef Kitle:** İşverenler ve profesyoneller

## Tech Stack

### Backend
- **Framework:** FastAPI (Python 3.14+)
- **AI/LLM:** LangChain, LangGraph, LangSmith
- **LLM Provider:** Microsoft AI Foundry → DeepSeek
- **Database:** SQLite (dev) / PostgreSQL (prod)
- **Rate Limiting:** SlowAPI
- **Caching:** Redis (conversation storage)
- **Testing:** pytest, pytest-asyncio

### Frontend
- **Framework:** React 18 + TypeScript (Strict Mode)
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **3D/Animation:** Three.js, Framer Motion
- **Charts:** D3.js
- **State:** Zustand
- **Validation:** Zod (schema validation)
- **i18n:** i18next (en/tr)
- **Testing:** Vitest, Playwright
- **Code Quality:** ESLint, Prettier, Husky, lint-staged

## Proje Yapısı

```
me-tchain-ai/
├── backend/           # FastAPI backend
│   ├── app/
│   │   ├── api/       # API endpoints (versioned)
│   │   ├── core/      # Config, security, logging, websocket, rate_limit
│   │   ├── models/    # Domain models & Pydantic schemas
│   │   ├── services/  # Business logic (chatbot, llm)
│   │   └── repositories/  # Data access layer
│   ├── data/          # Static content
│   │   ├── persona.md     # Ana chatbot kişiliği
│   │   ├── personas/      # Persona varyasyonları (educator, engineer, researcher, speaker)
│   │   └── objects/       # Object persona markdown dosyaları
│   ├── tests/         # Unit, integration, e2e tests
│   ├── IMPROVEMENTS_IMPLEMENTED.md  # Backend iyileştirmeleri dökümantasyonu
│   └── requirements.txt   # Python dependencies (slowapi, redis eklendi)
│
├── frontend/          # React frontend
│   ├── src/
│   │   ├── components/  # UI components by feature
│   │   ├── pages/       # Page components
│   │   ├── hooks/       # Custom React hooks
│   │   ├── lib/         # Configuration & validation (Zod schemas)
│   │   ├── services/    # API client, WebSocket
│   │   ├── store/       # Zustand stores
│   │   ├── types/       # TypeScript types
│   │   ├── data/        # Static data files
│   │   └── i18n/        # Çoklu dil desteği (en/tr)
│   └── tests/
│
└── docs/              # Documentation
```

## Geliştirme Komutları

### Backend
```bash
cd backend
source ../.venv/bin/activate  # venv aktifleştir
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# Tests
pytest
pytest --cov=app tests/
```

### Frontend
```bash
cd frontend
pnpm install
pnpm dev          # Development server (port 5173)
pnpm build        # Production build
pnpm test         # Run tests
pnpm lint         # Lint check
pnpm lint:fix     # Fix lint errors
pnpm type-check   # TypeScript check
pnpm validate     # Lint + type-check (CI/CD)
pnpm format       # Prettier format
```

## Career Game (Ana Feature)

İzometrik 2.5D oyun deneyimi - kullanıcılar timeline'da gezinip objelerle sohbet edebilir.

📋 **Detaylı Plan:** [docs/CAREER_GAME_PLAN.md](docs/CAREER_GAME_PLAN.md)

**Route:** `/career-game`

**Temel Dosyalar:**
- `frontend/src/pages/CareerGame.tsx` - Ana oyun sayfası
- `frontend/src/components/game/GameCanvas.tsx` - 3D canvas ve sahne yönetimi
- `frontend/src/components/game/ObjectDetailPanel.tsx` - Side panel (info + chat modu)
- `frontend/src/components/game/TimelineObject.tsx` - 3D timeline objeleri
- `frontend/src/components/game/CharacterController.tsx` - Oyuncu hareketi
- `frontend/src/components/game/IsometricCamera.tsx` - İzometrik kamera
- `frontend/src/components/game/controls/TouchJoystick.tsx` - Mobil touch kontrolleri
- `frontend/src/store/gameStore.ts` - Zustand state
- `frontend/src/data/careerTimeline.ts` - Timeline objeleri
- `frontend/src/types/game.ts` - TypeScript game tipleri
- `frontend/src/hooks/useKeyboardControls.ts` - WASD/Arrow kontrolleri
- `frontend/src/hooks/useObjectInteraction.ts` - Obje etkileşim logic
- `backend/data/objects/` - Object persona markdown dosyaları

**Object Persona Sistemi:**
- Her timeline objesi (proje, tez, eğitim) kendi ağzından konuşur
- WebSocket: `/api/v1/chat?object_id=xxx&object_title=xxx`
- Persona dosyaları: `backend/data/objects/{object_id}.md`

**Side Panel Chat Sistemi:**
- `ObjectDetailPanel.tsx` iki mod: "info" ve "chat"
- ESC tuşu: chat → info → panel kapat
- Oyuncu uzaklaşınca panel otomatik kapanır (2x interaction radius)
- Smooth typewriter buffer: tokenler akıcı yazılır (2 char/20ms)

**GLB Model Sistemi:**
- 3D modeller: `frontend/public/assets/game/objects/`
- Whitelist: `TimelineObject.tsx` içinde `AVAILABLE_MODELS` set
- Yeni model eklemek: dosyayı koy + whitelist'e ekle
- Mevcut: `university.glb` (education objesi için)

**Label Sistemi:**
- `Billboard` + `Text` ile her zaman kameraya bakıyor
- Label'lar obje ile birlikte scale oluyor
- Objeler rotasyon yapmıyor (sadece floating + scale)

## Önemli Dosyalar

| Dosya | Açıklama |
|-------|----------|
| `backend/app/main.py` | FastAPI app factory + lifecycle management |
| `backend/app/core/websocket.py` | **YENİ:** Gelişmiş WebSocket connection manager |
| `backend/app/core/rate_limit.py` | **YENİ:** Rate limiting konfigürasyonu |
| `backend/app/services/llm/client.py` | **YENİ:** Thread-safe LLM client singleton |
| `backend/app/services/chatbot/agent.py` | LangGraph chatbot agent |
| `backend/app/services/chatbot/object_persona_loader.py` | Object persona yükleyici |
| `backend/app/services/llm/factory.py` | LLM factory pattern |
| `backend/app/services/llm/deepseek.py` | DeepSeek LLM entegrasyonu |
| `backend/data/persona.md` | Chatbot kişiliği ve bilgileri |
| `backend/data/personas/` | Persona varyasyonları (educator, engineer, researcher, speaker) |
| `backend/data/objects/` | Object persona markdown dosyaları |
| `backend/IMPROVEMENTS_IMPLEMENTED.md` | **YENİ:** Backend iyileştirmeleri dökümantasyonu |
| `frontend/src/App.tsx` | React root component (Error Boundaries ile) |
| `frontend/src/components/chat/ChatWidget.tsx` | Chatbot UI |
| `frontend/src/components/game/ObjectDetailPanel.tsx` | Career Game side panel (info + chat) |
| `frontend/src/components/game/TimelineObject.tsx` | 3D timeline objeleri |
| `frontend/src/components/ui/ErrorBoundary.tsx` | React Error Boundaries (hata yakalama) |
| `frontend/src/lib/config.ts` | Merkezi config (env validation) |
| `frontend/src/lib/schemas.ts` | Zod validation schemas (WebSocket mesajları) |
| `frontend/src/hooks/useObjectChat.ts` | Object chat WebSocket hook |
| `frontend/src/store/gameStore.ts` | Career Game Zustand store |
| `frontend/src/store/chatStore.ts` | Chat widget state |
| `frontend/src/types/game.ts` | Career Game TypeScript tipleri |
| `frontend/src/data/projects.ts` | Proje verileri |
| `frontend/src/data/talks.ts` | Konuşma verileri |
| `frontend/src/data/careerTimeline.ts` | Career Game objeleri |
| `frontend/src/i18n/locales/` | Çoklu dil dosyaları (en.json, tr.json) |

## Kod Stilleri ve Kurallar

### Python (Backend)
- Ruff + Black formatting
- Type hints zorunlu
- Docstrings (Google style)
- Pydantic models for validation
- Dependency injection pattern

### TypeScript (Frontend)
- Strict mode enabled
- Functional components only
- Custom hooks for logic
- Barrel exports (index.ts)
- Tailwind for styling (no inline styles)
- Error Boundaries for error handling
- Zod schemas for runtime validation
- Centralized config in `lib/config.ts`

### Pre-commit Hooks
- **Husky:** Git hooks yönetimi
- **lint-staged:** Commit öncesi otomatik lint + format
- Commit yapıldığında: ESLint fix + Prettier format otomatik çalışır

## Backend İyileştirmeleri (2026-01-19)

### ✅ Faz 1: Kritik Güvenlik ve Bellek Sorunları (TAMAMLANDI)

1. **WebSocket Memory Leak Düzeltildi**
   - Connection cleanup ile TTL-based (1 saat) timeout
   - Ping/pong heartbeat (30 saniyede bir)
   - Bağlantı limitleri: 5/client, 1000/toplam
   - Arka plan temizleme görevi (60 saniyede bir)
   - Dosya: `backend/app/core/websocket.py`

2. **Thread-Safe LLM Client Singleton**
   - Tüm istekler için tek paylaşılan LLM client
   - Async lock ile race condition koruması
   - Uygulama başlangıcında initialize edilir
   - Dosya: `backend/app/services/llm/client.py`

3. **Rate Limiting Eklendi**
   - SlowAPI ile 100 istek/dakika/IP limiti
   - ASGI middleware (yüksek performans)
   - Proxy desteği (X-Forwarded-For)
   - Dosya: `backend/app/core/rate_limit.py`

### ✅ Faz 2: Performans ve Mimari İyileştirmeleri (TAMAMLANDI)

4. **Redis-Based Conversation Storage**
   - Persistent conversation storage (TTL: 1 saat)
   - Otomatik fallback (Redis yoksa in-memory)
   - Async API, horizontal scaling ready
   - Dosyalar: `backend/app/services/chatbot/redis_memory.py`, `memory_factory.py`

5. **Dependency Injection Pattern**
   - Protocol-based design (`ConversationMemoryProtocol`)
   - Factory pattern ile backend seçimi
   - Test edilebilir, decoupled mimari
   - Dosya: `backend/app/services/chatbot/memory_factory.py`

6. **Error Handling & Circuit Breaker**
   - Circuit breaker pattern (3 state: CLOSED/OPEN/HALF_OPEN)
   - Retry logic (Tenacity ile exponential backoff)
   - LLM: 5 failure threshold, 60s recovery
   - Redis: 3 failure threshold, 30s recovery
   - Dosya: `backend/app/core/resilience.py`

**Detaylar:** `backend/IMPROVEMENTS_IMPLEMENTED.md`

### ⏳ Bekleyen İyileştirmeler (Faz 3-4)

- Rate limiting Redis backend (şu an in-memory)
- LangGraph StateGraph migration
- Observability (Prometheus metrics, tracing)
- Kapsamlı test suite

---

## API Endpoints

```
GET  /api/v1/health          # Health check
WS   /api/v1/chat            # WebSocket chatbot (rate limited, health monitored)
GET  /api/v1/contact         # Contact info (email, LinkedIn, GitHub, website)
```

## Environment Variables

### Backend (.env)
```
ENVIRONMENT=development
DEBUG=true
API_V1_PREFIX=/api/v1
ALLOWED_ORIGINS=http://localhost:5173

# LLM (Microsoft AI Foundry / DeepSeek)
AZURE_AI_ENDPOINT=
AZURE_AI_CREDENTIAL=
AZURE_API_VERSION=2024-12-01-preview
DEEPSEEK_MODEL_NAME=DeepSeek-R1-0528
DEEPSEEK_DEPLOYMENT_NAME=DeepSeek-R1-0528

# LangSmith
LANGCHAIN_API_KEY=
LANGCHAIN_PROJECT=me-tchain-ai

# Database
DATABASE_URL=sqlite:///./data/app.db
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000
```

## Chatbot Persona

Chatbot, Timuçin'in kişiliğini yansıtır:
- **Ton:** Profesyonel ama sıcak
- **Şahıs:** Birinci tekil ("Ben...")
- **Bilgi Kapsamı:** CV, projeler, konuşmalar, kişisel hikaye
- **Fallback:** Bilinmeyen sorularda LinkedIn/email yönlendirmesi

Persona detayları: `backend/data/persona.md`

## Görsel Tasarım

- **Tema:** Açık/minimalist, temiz
- **Estetik:** Transformer/LLM mimarisi esintileri
  - Attention pattern animasyonları
  - Token akışı efektleri
  - Neural network node bağlantıları
- **Renkler:** (tailwind.config.js'de tanımlı)

## Test Stratejisi

### Backend
- Unit: Services, utilities
- Integration: API endpoints
- E2E: Chat conversation flows

### Frontend
- Component: UI components
- E2E: User journeys (Playwright)

## Frontend Routes

| Route | Sayfa | Açıklama |
|-------|-------|----------|
| `/` | `Landing.tsx` | Ana sayfa (persona-based content sistemi) |
| `/about` | `About.tsx` | Hakkında sayfası |
| `/talks` | `Talks.tsx` | Konuşmalar ve kurslar |
| `/publications` | `Publications.tsx` | Yayınlar |
| `/contact` | `Contact.tsx` | İletişim |
| `/career-game` | `CareerGame.tsx` | Kariyer oyunu (fullscreen, Layout dışında) |
| `*` | `NotFound.tsx` | 404 sayfası |

**Not:** `Projects.tsx` sayfası **silindi** - projeler artık Landing sayfasındaki persona sistemine entegre edildi.

## Common Tasks

### Yeni sayfa eklemek
1. `frontend/src/pages/NewPage.tsx` oluştur
2. `frontend/src/App.tsx`'e route ekle
3. Navbar'a link ekle

### Yeni API endpoint eklemek
1. `backend/app/api/v1/endpoints/` altına dosya ekle
2. `backend/app/api/v1/router.py`'e include et
3. Pydantic schema ekle
4. Test yaz

### İçerik güncellemek
- Projeler: `frontend/src/data/projects.ts`
- Konuşmalar: `frontend/src/data/talks.ts`
- Yayınlar: `frontend/src/data/publications.ts`
- Persona: `backend/data/persona.md`

## Dikkat Edilmesi Gerekenler

1. **Secrets:** `.env` dosyaları commit edilmez, `.env.example` kullan
2. **Types:** Her yeni veri yapısı için TypeScript type tanımla
3. **Tests:** Her yeni feature için test yaz
4. **Async:** Backend'de tüm I/O işlemleri async olmalı
5. **Error Handling:** Custom exceptions kullan, generic catch yapma
6. **Validation:** WebSocket mesajları için Zod schema kullan (`lib/schemas.ts`)
7. **Config:** Environment variables için merkezi config kullan (`lib/config.ts`)
8. **Error Boundaries:** Yeni sayfalar/componentler için Error Boundary ekle

## Error Boundaries & Validation

### Error Boundaries
React Error Boundaries hataları yakalar ve güzel bir fallback UI gösterir:

```tsx
import { ErrorBoundary, PageErrorFallback } from '@/components/ui'

<ErrorBoundary fallback={<PageErrorFallback />}>
  <MyComponent />
</ErrorBoundary>
```

**Mevcut Fallback'ler:**
- `PageErrorFallback` - Sayfa hataları için
- `GameErrorFallback` - 3D oyun hataları için

### WebSocket Validation
Zod ile WebSocket mesajlarını validate et:

```tsx
import { parseWebSocketMessage } from '@/lib/schemas'

socket.onmessage = (event) => {
  const message = parseWebSocketMessage(event.data)
  if (!message) return // Invalid message

  switch (message.type) {
    case 'system': // ...
    case 'stream': // ...
  }
}
```

### Centralized Config
Environment variables için merkezi config:

```tsx
import { WS_URL, WS_CHAT_ENDPOINT, IS_DEV } from '@/lib/config'

// Artık her yerde aynı URL kullanılır
const socket = new WebSocket(WS_CHAT_ENDPOINT)
```

## ⚠️ Geçmişte Yapılan Hatalar (Tekrarlanmaması İçin)

### 1. Three.js - Html Component Mavi Ekran Sorunu
**Tarih:** 2026-01-14
**Dosya:** `frontend/src/components/game/TimelineObject.tsx`

**Sorun:** `@react-three/drei`'den `Html` component kullanıldığında TÜM 3D sahne mavi renkte render oldu.

**Yanlış Kullanım:**
```tsx
import { Html } from '@react-three/drei'
// ...
<Html position={[0, 2, 0]} center>
  <div className="...">Label</div>
</Html>
```

**Çözüm:** `Html` yerine `Billboard` + `Text` kullan:
```tsx
import { Billboard, Text } from '@react-three/drei'
// ...
<Billboard position={[0, 2, 0]} follow={true}>
  <Text fontSize={0.3} color="white">{label}</Text>
</Billboard>
```

**Not:** `Html` component CSS DOM overlay oluşturur ve bazı durumlarda WebGL canvas ile çakışır. `Billboard` + `Text` tamamen 3D içinde kalır.

---

### 2. Environment Preset Yansıma Sorunu
**Dosya:** `frontend/src/components/game/GameCanvas.tsx`

**Sorun:** `<Environment preset="city" />` mavi gökyüzü yansımaları ekler ve metalik materyaller bunu yansıtır.

**Çözüm:** Karanlık sahnelerde Environment preset kullanma veya daha koyu preset seç.

---

### 3. React State Mutation (Concurrent Mode) Sorunu
**Tarih:** 2026-01-14
**Dosya:** `frontend/src/components/game/ObjectDetailPanel.tsx`

**Sorun:** Streaming chat'te mesajlar garip/duplicate geliyordu. Sebep: State mutation.

**Yanlış Kullanım:**
```tsx
setMessages((prev) => {
  const lastMsg = prev[prev.length - 1]
  lastMsg.content += newContent  // ❌ Mutation!
  return prev
})
```

**Çözüm:** Her zaman yeni obje ve array oluştur:
```tsx
setMessages((prev) => {
  const lastMsg = prev[prev.length - 1]
  return [
    ...prev.slice(0, -1),
    { ...lastMsg, content: lastMsg.content + newContent }  // ✅ Yeni obje
  ]
})
```

---

### 4. Keyboard Controls Input Capture Sorunu
**Dosya:** `frontend/src/hooks/useKeyboardControls.ts`

**Sorun:** Chat input'a yazarken karakter hareket ediyordu.

**Çözüm:** Input/Textarea elementlerini kontrol et:
```tsx
const handleKeyDown = (event: KeyboardEvent) => {
  const target = event.target as HTMLElement
  if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
    return  // Input'larda hareket tuşlarını yakala
  }
  // ... normal hareket logic
}
```

---

### 5. WebSocket CORS ve Environment Variable Cache Sorunu
**Tarih:** 2026-01-19
**Dosyalar:** `backend/app/main.py`, `frontend/src/lib/config.ts`, `backend/.env`

**Sorun:** Chatbot WebSocket bağlantısı kurulamıyor, textarea disabled durumda. Browser console'da farklı URL'ler görünüyor.

**Alt Problemler:**
1. **CORS Headers:** WebSocket handshake başarısız oluyor
2. **Eksik persona.md:** Backend `persona_file_not_found` hatası veriyor
3. **Redis Config:** Backend Redis'e bağlanmaya çalışıyor ama Redis yok
4. **Port Mismatch:** Farklı `.env` dosyalarında farklı port numaraları
5. **Vite Cache:** Browser cached JavaScript'te eski environment variables kalıyor

**Çözümler:**

**1. CORS Headers Ekleme:**
```python
# backend/app/main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=[
        "Content-Type",
        "Authorization",
        "Accept",
        # WebSocket headers - ÖNEMLİ!
        "Sec-WebSocket-Key",
        "Sec-WebSocket-Version",
        "Sec-WebSocket-Extensions",
        "Sec-WebSocket-Protocol",
        "Connection",
        "Upgrade",
    ],
)
```

**2. Persona.md Oluşturma:**
```bash
# backend/data/persona.md dosyası yoksa engineer.md'den kopyala
cp backend/data/personas/engineer.md backend/data/persona.md
```

**3. Redis Devre Dışı Bırakma:**
```bash
# backend/.env
REDIS_USE_FOR_MEMORY=false
```

**4. Port Tutarlılığı:**
Tüm `.env` dosyalarında aynı port kullan:
```bash
# backend/.env ve root .env
API_PORT=8000
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000
```

**5. Vite Cache Temizleme ve Explicit Env Variables:**
```bash
# Cache temizle
cd frontend
rm -rf node_modules/.vite dist .vite

# Explicit env variables ile başlat
VITE_API_URL=http://localhost:8000 VITE_WS_URL=ws://localhost:8000 pnpm dev
```

**Ders:**
- WebSocket CORS için özel headers gerekli
- Vite aggressive caching yapıyor - değişiklikler için cache temizliği şart
- Explicit env variables ile başlatmak en güvenilir yöntem
- Multiple `.env` dosyaları senkronize tutulmalı

## MCP Araçları Kullanım Kuralları

**Her zaman en güncel bilgileri al:**

1. **context7:** Kütüphane dokümantasyonu için kullan
   - `resolve-library-id` ile kütüphane ID'sini bul
   - `query-docs` ile güncel API ve kullanım örneklerini al

2. **exa:** Kod örnekleri ve güncel pratikler için kullan
   - `get_code_context_exa` ile framework/library kullanım örneklerini al
   - `web_search_exa` ile güncel best practices araştır

**Ne zaman kullanılmalı:**
- Yeni bir kütüphane entegre ederken
- API kullanımı yazarken
- Best practices kontrol ederken
- Hata çözümlerinde

**Versiyonlama kuralı:**
- `requirements.txt` ve `package.json`'da sabit versiyon KOYMA
- Sadece paket isimlerini yaz, pip/pnpm en güncel versiyonu alacak
- Breaking change riski varsa minimum versiyon belirt (>=)
