# Architecture Documentation

## Overview

me.tchain.ai is a personal AI portfolio website with an interactive chatbot.

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Client                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              React Frontend (Vite)                    │    │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌──────────┐   │    │
│  │  │  Pages  │ │Components│ │  Store  │ │ Services │   │    │
│  │  └─────────┘ └─────────┘ └─────────┘ └──────────┘   │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP / WebSocket
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                       Backend                                │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              FastAPI Application                      │    │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌──────────┐   │    │
│  │  │   API   │ │ Services│ │  Models │ │   Core   │   │    │
│  │  └─────────┘ └─────────┘ └─────────┘ └──────────┘   │    │
│  └─────────────────────────────────────────────────────┘    │
│                              │                               │
│                              ▼                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              LangChain / LangGraph                    │    │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐                │    │
│  │  │  Agent  │ │  Memory │ │ Persona │                │    │
│  │  └─────────┘ └─────────┘ └─────────┘                │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    External Services                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ Azure OpenAI│  │  LangSmith  │  │   Database  │         │
│  │  (DeepSeek) │  │ (Monitoring)│  │   (SQLite)  │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
```

## Component Details

### Frontend (React)

- **Pages**: Route-based page components
- **Components**: Reusable UI components
- **Store**: Zustand for state management
- **Services**: API client and WebSocket handler

### Backend (FastAPI)

- **API Layer**: REST endpoints and WebSocket handlers
- **Services**: Business logic (chatbot, email)
- **Models**: Pydantic schemas for validation
- **Core**: Configuration, logging, exceptions

### Chatbot (LangChain)

- **Agent**: LangGraph-based conversation agent
- **Memory**: Conversation history management
- **Persona**: Loaded from markdown file

## Data Flow

### Chat Flow

1. User sends message via WebSocket
2. Backend receives and validates message
3. Message added to conversation memory
4. LangGraph agent processes with persona context
5. Response streamed back via WebSocket
6. Frontend updates UI in real-time

### Contact Form Flow

1. User submits form
2. Backend validates input
3. Email sent via background task
4. Success response returned

## Design Decisions

### Why FastAPI?
- Async support for WebSocket
- Automatic OpenAPI documentation
- Pydantic integration for validation

### Why LangGraph?
- Stateful agent orchestration
- Better control over conversation flow
- Easy integration with LangSmith

### Why Zustand?
- Minimal boilerplate
- Built-in devtools
- TypeScript support
