# me.tchain.ai

Kazım Timuçin Utkan - AI Research Engineer Portfolio

## Overview

Personal portfolio website featuring:
- Interactive AI chatbot (powered by LangChain + DeepSeek)
- Transformer/LLM-inspired visual design
- Career timeline & skill tree visualizations
- University talks map
- Project showcase

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | FastAPI, LangChain, LangGraph |
| Frontend | React, TypeScript, Tailwind CSS |
| Animations | Three.js, Framer Motion, D3.js |
| LLM | Microsoft AI Foundry (DeepSeek) |

## Quick Start

### Prerequisites
- Python 3.14+
- Node.js 20+
- pnpm

### Setup

```bash
# 1. Environment
cp .env.example .env
# Edit .env with your AZURE_AI_ENDPOINT and AZURE_AI_CREDENTIAL

# 2. Python venv (root level)
python -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
```

### Development

```bash
# Backend
source .venv/bin/activate
cd backend
uvicorn app.main:app --reload --port 8000

# Frontend (new terminal)
cd frontend
pnpm install
pnpm dev
```

Open http://localhost:5173 (frontend) and http://localhost:8000/docs (API docs)

## Project Structure

```
├── backend/           # FastAPI backend
├── frontend/          # React frontend
├── docs/              # Documentation
└── CLAUDE.md          # AI assistant guide
```

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [API Reference](docs/API.md)

## License

Private - All rights reserved
