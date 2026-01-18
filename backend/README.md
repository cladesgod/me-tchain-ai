# me.tchain.ai Backend

FastAPI backend for the AI portfolio website with production-ready resilience patterns.

## Features

### Core Features
- 🤖 AI Chatbot with WebSocket support (streaming responses)
- 👤 Multi-Persona System (engineer, researcher, speaker, educator)
- 🎮 Object Persona System (Career Game objelerinin kendi ağzından konuşması)
- 📞 Contact API endpoint
- 📚 RESTful API with OpenAPI documentation
- 🔗 LangChain + LangGraph integration
- 🧠 DeepSeek LLM via Microsoft AI Foundry

### Production Features (NEW ✨)
- 🔒 **Security & Resilience**
  - WebSocket connection management with health monitoring
  - Rate limiting (100 req/min per IP)
  - Circuit breaker pattern for LLM calls
  - Automatic retry with exponential backoff

- 💾 **Persistence & Scaling**
  - Redis-based conversation storage
  - Horizontal scaling ready
  - Graceful degradation (automatic fallback to in-memory)

- 🏗️ **Architecture**
  - Dependency injection pattern
  - Thread-safe LLM client singleton
  - Protocol-based design for testability

- 📊 **Observability**
  - Structured logging with structlog
  - Circuit breaker state monitoring
  - Retry attempt logging

📖 **See [IMPROVEMENTS_IMPLEMENTED.md](./IMPROVEMENTS_IMPLEMENTED.md) for detailed documentation**

## Quick Start

### Prerequisites
- Python 3.14+
- Redis (optional, for production features)

### Installation

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv ../.venv
source ../.venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy and configure environment
cp .env.example .env
# Edit .env with your API keys
```

### Configuration

Required environment variables in `.env`:
```bash
# LLM Configuration
AZURE_AI_ENDPOINT=your_endpoint
AZURE_AI_CREDENTIAL=your_api_key
DEEPSEEK_MODEL_NAME=DeepSeek-V3.2
DEEPSEEK_DEPLOYMENT_NAME=DeepSeek-V3.2

# Optional: Redis (for production features)
REDIS_URL=redis://localhost:6379/0
REDIS_USE_FOR_MEMORY=true  # Set to false to use in-memory storage

# Optional: LangSmith (for tracing)
LANGCHAIN_API_KEY=your_langsmith_key
```

### Running with Redis (Recommended for Production)

```bash
# Option 1: Using Homebrew (macOS)
brew install redis
brew services start redis

# Option 2: Using Docker
docker run -d -p 6379:6379 redis:alpine

# Option 3: Disable Redis (development only)
# Set REDIS_USE_FOR_MEMORY=false in .env
```

### Start Development Server

```bash
uvicorn app.main:app --reload --port 8000
```

The server will start with:
- ✅ WebSocket connection manager
- ✅ LLM client singleton
- ✅ Rate limiting middleware
- ✅ Redis memory (if available, otherwise in-memory fallback)
- ✅ Circuit breaker protection

## API Documentation

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Project Structure

```
backend/
├── app/
│   ├── api/           # API endpoints (versioned)
│   │   └── v1/
│   │       ├── endpoints/
│   │       │   └── chat.py          # WebSocket chat endpoint
│   │       └── router.py
│   ├── core/          # Core infrastructure
│   │   ├── config.py               # Configuration management
│   │   ├── logging.py              # Structured logging
│   │   ├── websocket.py            # ✨ WebSocket manager (NEW)
│   │   ├── rate_limit.py           # ✨ Rate limiting (NEW)
│   │   └── resilience.py           # ✨ Circuit breaker & retry (NEW)
│   ├── models/        # Pydantic schemas
│   ├── services/      # Business logic
│   │   ├── chatbot/
│   │   │   ├── agent.py            # LangGraph chat agent
│   │   │   ├── memory.py           # In-memory storage
│   │   │   ├── redis_memory.py     # ✨ Redis storage (NEW)
│   │   │   ├── memory_factory.py   # ✨ DI factory (NEW)
│   │   │   ├── persona_loader.py
│   │   │   └── object_persona_loader.py
│   │   └── llm/
│   │       ├── client.py           # ✨ LLM singleton + resilience (NEW)
│   │       ├── factory.py
│   │       └── deepseek.py
│   └── main.py        # FastAPI app with lifecycle management
├── data/
│   ├── persona.md     # Ana chatbot kişiliği
│   ├── personas/      # Persona varyasyonları
│   └── objects/       # Object persona markdown dosyaları
├── tests/             # Test files
├── IMPROVEMENTS_IMPLEMENTED.md  # ✨ Full documentation (NEW)
└── requirements.txt   # Dependencies (updated)
```

**✨ NEW** files implement Phase 1 & 2 improvements (security, resilience, scaling)

## Testing

```bash
# Install dev dependencies
pip install -r requirements-dev.txt

# Run tests
pytest -v

# Run with coverage
pytest --cov=app tests/
```

## Environment Variables

See `.env.example` for all available configuration options.

### Required Variables
- `AZURE_AI_ENDPOINT`: Microsoft AI Foundry endpoint
- `AZURE_AI_CREDENTIAL`: API credential
- `DEEPSEEK_MODEL_NAME`: DeepSeek model name
- `DEEPSEEK_DEPLOYMENT_NAME`: Deployment name

### Optional Variables (Production Features)
- `REDIS_URL`: Redis connection URL (default: `redis://localhost:6379/0`)
- `REDIS_USE_FOR_MEMORY`: Use Redis for storage (default: `true`, set `false` for in-memory)
- `LANGCHAIN_API_KEY`: LangSmith API key (for tracing)
- `ALLOWED_ORIGINS`: CORS allowed origins (comma-separated)

### Feature Flags
- `DEBUG`: Debug mode (default: `true` in development)
- `ENVIRONMENT`: Environment name (`development`, `production`)

## Architecture & Design Patterns

### Resilience Patterns
- **Circuit Breaker**: Prevents cascading failures (5 failures → 60s recovery for LLM)
- **Retry Logic**: Exponential backoff (3 attempts, 1s → 2s → 4s)
- **Health Monitoring**: WebSocket ping/pong every 30s
- **TTL Management**: Auto-cleanup after 1 hour idle

### Scalability Features
- **Thread-Safe Singleton**: Shared LLM client across all requests
- **Connection Pooling**: Managed WebSocket connections
- **Horizontal Scaling**: Redis-based session storage
- **Graceful Degradation**: Automatic fallback to in-memory

### Code Quality
- **Dependency Injection**: Protocol-based design for testability
- **Factory Pattern**: Runtime backend selection
- **Async/Await**: Full async support throughout
- **Structured Logging**: JSON logs with correlation IDs

## Monitoring & Observability

### Log Events
```python
# Application Lifecycle
"application_starting"
"llm_manager_initialized"
"redis_memory_initialized"
"websocket_manager_started"

# Circuit Breaker
"circuit_breaker_opened"      # Too many failures
"circuit_breaker_half_open"   # Testing recovery
"circuit_breaker_closed"      # Recovered

# Retry Attempts
"llm_call_retry"              # LLM retry attempt
"redis_call_retry"            # Redis retry attempt

# WebSocket
"websocket_connected"
"websocket_disconnected"
"connection_ttl_expired"
"heartbeat_timeout"
```

### Health Checks
- WebSocket manager status
- LLM circuit breaker state
- Redis connection status
- Active connection count

## Troubleshooting

### Redis Connection Issues
```bash
# Check if Redis is running
redis-cli ping
# Should return: PONG

# If Redis not available, disable in .env
REDIS_USE_FOR_MEMORY=false

# Application will automatically fall back to in-memory storage
```

### Circuit Breaker Open
```bash
# Check logs for circuit breaker status
tail -f logs/app.log | grep circuit_breaker

# Circuit will auto-recover after timeout
# Or manually restart the application
```

### Rate Limit Exceeded
```bash
# Default: 100 requests per minute per IP
# Wait 1 minute or adjust in app/core/rate_limit.py
```

## Production Deployment

### Recommended Setup
1. **Use Redis** for conversation storage
2. **Enable Circuit Breaker** (default: enabled)
3. **Configure Rate Limiting** based on your needs
4. **Set DEBUG=false** in production
5. **Use HTTPS** for WebSocket connections
6. **Monitor Circuit Breaker** state in logs

### Performance Tips
- Redis connection pooling is automatic
- LLM client is singleton (shared across requests)
- WebSocket connections auto-cleanup after TTL
- Rate limiting uses efficient ASGI middleware

## Contributing

When making changes:
1. Read `IMPROVEMENTS_IMPLEMENTED.md` for architecture details
2. Follow existing patterns (DI, protocols, async)
3. Add tests for new features
4. Update documentation

## License

See main repository for license information.
