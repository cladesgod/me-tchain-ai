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
- **Testing:** pytest, pytest-asyncio

### Frontend
- **Framework:** React 18 + TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **3D/Animation:** Three.js, Framer Motion
- **Charts:** D3.js
- **State:** Zustand
- **Testing:** Vitest, Playwright

## Proje Yapısı

```
me-tchain-ai/
├── backend/           # FastAPI backend
│   ├── app/
│   │   ├── api/       # API endpoints (versioned)
│   │   ├── core/      # Config, security, logging
│   │   ├── models/    # Domain models & Pydantic schemas
│   │   ├── services/  # Business logic (chatbot, llm)
│   │   └── repositories/  # Data access layer
│   ├── data/          # Static content (persona.md)
│   └── tests/         # Unit, integration, e2e tests
│
├── frontend/          # React frontend
│   ├── src/
│   │   ├── components/  # UI components by feature
│   │   ├── pages/       # Page components
│   │   ├── hooks/       # Custom React hooks
│   │   ├── services/    # API client, WebSocket
│   │   ├── store/       # Zustand stores
│   │   ├── types/       # TypeScript types
│   │   └── data/        # Static data files
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
```

### Docker
```bash
docker-compose up -d              # Start all services
docker-compose -f docker-compose.prod.yml up -d  # Production
```

## Career Game (Ana Feature)

İzometrik 2.5D oyun deneyimi - kullanıcılar timeline'da gezinip objelerle sohbet edebilir.

📋 **Detaylı Plan:** [docs/CAREER_GAME_PLAN.md](docs/CAREER_GAME_PLAN.md)

**Route:** `/career-game`

**Temel Dosyalar:**
- `frontend/src/pages/CareerGame.tsx` - Ana oyun sayfası
- `frontend/src/components/game/ObjectDetailPanel.tsx` - Side panel (info + chat modu)
- `frontend/src/components/game/TimelineObject.tsx` - 3D timeline objeleri
- `frontend/src/store/gameStore.ts` - Zustand state
- `frontend/src/data/careerTimeline.ts` - Timeline objeleri
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
| `backend/app/main.py` | FastAPI app factory |
| `backend/app/services/chatbot/agent.py` | LangGraph chatbot agent |
| `backend/app/services/chatbot/object_persona_loader.py` | Object persona yükleyici |
| `backend/data/persona.md` | Chatbot kişiliği ve bilgileri |
| `backend/data/objects/` | Object persona markdown dosyaları |
| `frontend/src/App.tsx` | React root component |
| `frontend/src/components/chat/ChatWidget.tsx` | Chatbot UI |
| `frontend/src/components/game/ObjectDetailPanel.tsx` | Career Game side panel (info + chat) |
| `frontend/src/components/game/TimelineObject.tsx` | 3D timeline objeleri |
| `frontend/src/data/projects.ts` | Proje verileri |
| `frontend/src/data/talks.ts` | Konuşma verileri |
| `frontend/src/data/careerTimeline.ts` | Career Game objeleri |

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

## API Endpoints

```
GET  /api/v1/health          # Health check
WS   /api/v1/chat            # WebSocket chatbot
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
