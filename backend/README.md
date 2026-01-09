# me.tchain.ai Backend

FastAPI backend for the AI portfolio website.

## Features

- AI Chatbot with WebSocket support
- Contact form with email notifications
- RESTful API with OpenAPI documentation
- LangChain + LangGraph integration
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
│   ├── api/           # API endpoints
│   ├── core/          # Config, logging, exceptions
│   ├── models/        # Pydantic schemas
│   ├── services/      # Business logic
│   └── main.py        # FastAPI app
├── data/              # Static data (persona, content)
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
- `AZURE_OPENAI_ENDPOINT`: Azure OpenAI endpoint
- `AZURE_OPENAI_API_KEY`: API key
- `LANGCHAIN_API_KEY`: LangSmith API key
