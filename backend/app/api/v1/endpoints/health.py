"""
Health Check Endpoint

Simple health check for monitoring and load balancers.
"""

from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class HealthResponse(BaseModel):
    """Health check response schema."""

    status: str
    version: str


@router.get("/health", response_model=HealthResponse)
async def health_check() -> HealthResponse:
    """Check if the API is healthy."""
    return HealthResponse(status="healthy", version="0.1.0")
