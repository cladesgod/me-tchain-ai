"""
API v1 Router

Aggregates all v1 API endpoints.
"""

from fastapi import APIRouter

from app.api.v1.endpoints import chat, contact, health

api_router = APIRouter()

# Health check
api_router.include_router(
    health.router,
    tags=["Health"],
)

# Chat endpoints
api_router.include_router(
    chat.router,
    prefix="/chat",
    tags=["Chat"],
)

# Contact form
api_router.include_router(
    contact.router,
    prefix="/contact",
    tags=["Contact"],
)
