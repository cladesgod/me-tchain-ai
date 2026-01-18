"""
FastAPI Application Factory

Main entry point for the me.tchain.ai backend.
"""

from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIASGIMiddleware
from starlette.middleware.base import BaseHTTPMiddleware

from app.api.v1.endpoints.chat import init_manager
from app.api.v1.router import api_router
from app.core.config import settings
from app.core.logging import get_logger, setup_logging
from app.core.rate_limit import get_limiter
from app.services.chatbot.redis_memory import get_redis_memory
from app.services.llm.client import get_llm_manager

logger = get_logger(__name__)


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Add security headers to all responses."""

    async def dispatch(self, request: Request, call_next) -> Response:
        response = await call_next(request)

        # Prevent clickjacking
        response.headers["X-Frame-Options"] = "DENY"

        # Prevent MIME type sniffing
        response.headers["X-Content-Type-Options"] = "nosniff"

        # XSS protection (legacy but still useful)
        response.headers["X-XSS-Protection"] = "1; mode=block"

        # Referrer policy
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"

        # Permissions policy (restrict browser features)
        response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"

        # HSTS for production
        if not settings.DEBUG:
            response.headers["Strict-Transport-Security"] = (
                "max-age=31536000; includeSubDomains"
            )

        return response


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Application lifespan handler for startup and shutdown events."""
    # Startup
    setup_logging()
    logger.info("application_starting")

    # Initialize Redis memory (if enabled)
    redis_memory = None
    if settings.REDIS_USE_FOR_MEMORY:
        try:
            redis_memory = get_redis_memory()
            await redis_memory.initialize()
            logger.info("redis_memory_initialized")
        except Exception as e:
            logger.warning(
                "redis_memory_initialization_failed_fallback_to_in_memory",
                error=str(e),
            )
            # Will fall back to in-memory storage

    # Initialize LLM client (shared singleton)
    llm_manager = get_llm_manager()
    await llm_manager.initialize()
    logger.info("llm_manager_initialized")

    # Initialize WebSocket connection manager
    ws_manager = init_manager()
    await ws_manager.start()
    logger.info("websocket_manager_started")

    yield

    # Shutdown
    logger.info("application_shutting_down")

    # Stop WebSocket connection manager
    await ws_manager.stop()
    logger.info("websocket_manager_stopped")

    # Shutdown LLM client
    await llm_manager.shutdown()
    logger.info("llm_manager_shutdown")

    # Close Redis connection (if initialized)
    if redis_memory:
        await redis_memory.close()
        logger.info("redis_memory_closed")


def create_app() -> FastAPI:
    """Create and configure the FastAPI application."""
    app = FastAPI(
        title="me.tchain.ai API",
        description="AI Portfolio Backend - Kazım Timuçin Utkan",
        version="0.1.0",
        docs_url="/docs" if settings.DEBUG else None,
        redoc_url="/redoc" if settings.DEBUG else None,
        lifespan=lifespan,
    )

    # Rate limiter setup
    limiter = get_limiter()
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

    # Rate limiting middleware (ASGI for better performance)
    app.add_middleware(SlowAPIASGIMiddleware)

    # Security headers middleware (applied first, so headers are on all responses)
    app.add_middleware(SecurityHeadersMiddleware)

    # CORS middleware with restricted methods and headers
    # Note: WebSocket connections require additional headers
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.allowed_origins_list,
        allow_credentials=True,
        allow_methods=["GET", "POST", "OPTIONS"],
        allow_headers=[
            "Content-Type",
            "Authorization",
            "Accept",
            # WebSocket headers
            "Sec-WebSocket-Key",
            "Sec-WebSocket-Version",
            "Sec-WebSocket-Extensions",
            "Sec-WebSocket-Protocol",
            "Connection",
            "Upgrade",
        ],
    )

    # Include API router
    app.include_router(api_router, prefix=settings.API_V1_PREFIX)

    return app


# Application instance
app = create_app()
