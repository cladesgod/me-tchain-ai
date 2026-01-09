# me.tchain.ai Frontend

React frontend for the AI portfolio website.

## Features

- Modern React 18 with TypeScript
- Tailwind CSS for styling
- Three.js for 3D animations (transformer background)
- Real-time chat widget with WebSocket
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
│   ├── components/    # UI components
│   ├── pages/         # Page components
│   ├── hooks/         # Custom React hooks
│   ├── store/         # Zustand state management
│   ├── services/      # API client
│   ├── types/         # TypeScript types
│   └── utils/         # Utility functions
├── public/            # Static assets
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
