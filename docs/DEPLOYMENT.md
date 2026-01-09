# Deployment Guide

## Prerequisites

- Docker and Docker Compose
- Domain configured (me.tchain.ai)
- SSL certificate
- API keys (Azure OpenAI, LangSmith)

## Environment Setup

1. Copy environment example:
```bash
cp .env.example .env
```

2. Fill in required values:
```
AZURE_OPENAI_ENDPOINT=your-endpoint
AZURE_OPENAI_API_KEY=your-api-key
LANGCHAIN_API_KEY=your-langsmith-key
```

## Docker Deployment

### Build and Run

```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# View logs
docker-compose logs -f
```

### Production Deployment

```bash
# Use production compose file
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## Manual Deployment

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### Frontend

```bash
cd frontend
pnpm install
pnpm build
# Serve dist/ with nginx
```

## Nginx Configuration

```nginx
server {
    listen 443 ssl http2;
    server_name me.tchain.ai;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # Frontend
    location / {
        root /var/www/metchain/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # API
    location /api {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }

    # WebSocket
    location /api/v1/chat {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

## Health Checks

- Backend: `GET /api/v1/health`
- Frontend: Check HTTP 200 on `/`

## Monitoring

- LangSmith: Check traces at smith.langchain.com
- Logs: `docker-compose logs -f`
