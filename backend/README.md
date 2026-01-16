# me.tchain.ai Backend

FastAPI backend for the AI portfolio website.

## Features

- AI Chatbot with WebSocket support (streaming responses)
- Object Persona System (Career Game objelerinin kendi ağzından konuşması)
- Contact API endpoint
- RESTful API with OpenAPI documentation
- LangChain + LangGraph integration
- DeepSeek LLM via Microsoft AI Foundry
- Structured logging with structlog

## Quick Start

```bash
# Create virtual environment
python -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy and configure environment
cp .env.example .env
# Edit .env with your API keys

# Run development server
uvicorn app.main:app --reload --port 8000
```

## API Documentation

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Project Structure

```
backend/
├── app/
│   ├── api/           # API endpoints (versioned)
│   ├── core/          # Config, logging, exceptions
│   ├── models/        # Pydantic schemas
│   ├── services/      # Business logic
│   │   ├── chatbot/   # LangGraph agent, persona loader
│   │   └── llm/       # LLM integrations (DeepSeek)
│   └── main.py        # FastAPI app
├── data/
│   ├── persona.md     # Ana chatbot kişiliği
│   ├── personas/      # Persona varyasyonları
│   └── objects/       # Object persona markdown dosyaları
└── tests/             # Test files
```

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

Key variables:
- `AZURE_AI_ENDPOINT`: Microsoft AI Foundry endpoint
- `AZURE_AI_CREDENTIAL`: API credential
- `DEEPSEEK_MODEL_NAME`: DeepSeek model name
- `LANGCHAIN_API_KEY`: LangSmith API key (for tracing)
