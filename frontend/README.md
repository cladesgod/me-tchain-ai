# me.tchain.ai Frontend

Interactive portfolio website for Kazım Timuçin Utkan - AI Research Engineer.

## Tech Stack

- **Framework:** React 18 + TypeScript (Strict Mode)
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **3D/Animation:** Three.js (React Three Fiber), Framer Motion
- **State Management:** Zustand
- **i18n:** i18next (English/Turkish)
- **Validation:** Zod

## Quick Start

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build
```

The app will be available at `http://localhost:5173`

## Environment Variables

Create a `.env` file (see `.env.example`):

```
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm preview` | Preview production build |
| `pnpm lint` | Run ESLint |
| `pnpm lint:fix` | Fix ESLint issues |
| `pnpm format` | Format code with Prettier |
| `pnpm type-check` | Run TypeScript type checking |
| `pnpm validate` | Run lint + type-check |
| `pnpm test` | Run unit tests (Vitest) |
| `pnpm test:e2e` | Run E2E tests (Playwright) |

## Project Structure

```
src/
├── components/           # React components
│   ├── chat/            # Chat widget components
│   ├── game/            # Career Game 3D components
│   ├── home/            # Landing page components
│   ├── layout/          # Navbar, Footer, Layout
│   └── ui/              # Reusable UI (Button, Card, ErrorBoundary)
├── data/                # Static data (projects, talks, timeline)
├── hooks/               # Custom React hooks
├── i18n/                # Internationalization
│   └── locales/         # Translation files (en.json, tr.json)
├── lib/                 # Utilities and configuration
│   ├── config.ts        # Environment configuration
│   └── schemas.ts       # Zod validation schemas
├── pages/               # Page components
├── services/            # API services
├── store/               # Zustand stores
├── styles/              # Global styles
└── types/               # TypeScript type definitions
```

## Key Features

### Career Game (`/career-game`)

Interactive 3D timeline game built with React Three Fiber:
- Isometric camera perspective
- WASD/Arrow key controls
- Mobile touch joystick
- Object interaction with chat capabilities
- WebSocket-based conversations with streaming

### Persona System

Four professional personas with unique content:
- **Engineer** - Technical projects and code
- **Researcher** - Academic work and publications
- **Speaker** - Talks and presentations
- **Educator** - Courses and teaching

### Internationalization

Full support for English and Turkish languages.

## Code Quality

### Pre-commit Hooks

Husky + lint-staged automatically run on commit:
- ESLint for code quality
- Prettier for formatting

### Error Boundaries

React Error Boundaries catch and handle errors gracefully:
- `ErrorBoundary` - Generic error boundary
- `GameErrorFallback` - 3D game specific errors
- `PageErrorFallback` - Page-level errors

### Validation

Zod schemas validate:
- Environment variables at startup
- WebSocket messages for type safety
- External URLs before opening

## Architecture

1. **Feature-based folder structure** - Components organized by feature
2. **Zustand for state** - Simple, TypeScript-first state management
3. **Custom hooks** - Business logic extracted into reusable hooks
4. **Lazy loading** - Route-based code splitting for performance
5. **Centralized config** - Environment variables validated at startup

## Contributing

1. Create a feature branch
2. Make your changes
3. Run `pnpm validate` to check for issues
4. Commit (pre-commit hooks will run automatically)
5. Create a pull request
