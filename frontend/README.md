# me.tchain.ai Frontend

React frontend for the AI portfolio website.

## Features

- Modern React 18 with TypeScript
- Tailwind CSS for styling
- Three.js + React Three Fiber for 3D (Career Game, avatars)
- Career Game - Interactive isometric timeline experience
- Real-time chat widget with WebSocket (streaming)
- i18n support (English/Turkish)
- Persona-based content system
- Responsive design

## Quick Start

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

## Project Structure

```
frontend/
├── src/
│   ├── components/    # UI components (by feature)
│   │   ├── chat/      # Chat widget
│   │   ├── game/      # Career Game (3D)
│   │   ├── home/      # Landing page, persona selector
│   │   ├── layout/    # Navbar, Footer
│   │   └── ui/        # Reusable UI components
│   ├── pages/         # Page components
│   ├── hooks/         # Custom React hooks
│   ├── store/         # Zustand state (game, chat, persona)
│   ├── services/      # API client
│   ├── types/         # TypeScript types
│   ├── data/          # Static data (projects, talks, timeline)
│   ├── i18n/          # Translations (en/tr)
│   └── utils/         # Utility functions
├── public/
│   └── assets/        # 3D models (GLB), avatars, images
└── tests/             # Test files
```

## Environment Variables

Create a `.env` file:

```
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000/api/v1/chat
```

## Testing

```bash
# Run unit tests
pnpm test

# Run E2E tests
pnpm test:e2e
```

## Building

```bash
# Build for production
pnpm build

# Output will be in dist/
```
