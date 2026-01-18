"""
Rate Limiting Configuration

Implements rate limiting for API endpoints and WebSocket connections
using slowapi.
"""

from fastapi import Request
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.core.logging import get_logger

logger = get_logger(__name__)


def get_identifier(request: Request) -> str:
    """
    Get rate limit identifier for a request.

    Uses IP address from X-Forwarded-For header if available (for proxy/load balancer),
    otherwise falls back to direct connection IP.

    Args:
        request: The incoming request

    Returns:
        str: The client identifier for rate limiting
    """
    # Check for X-Forwarded-For header (proxy/load balancer)
    forwarded_for = request.headers.get("X-Forwarded-For")
    if forwarded_for:
        # X-Forwarded-For can contain multiple IPs, use the first one (original client)
        client_ip = forwarded_for.split(",")[0].strip()
        logger.debug("rate_limit_identifier_from_header", ip=client_ip, header="X-Forwarded-For")
        return client_ip

    # Fall back to direct connection IP
    client_ip = get_remote_address(request)
    logger.debug("rate_limit_identifier_from_connection", ip=client_ip)
    return client_ip


# Initialize rate limiter
# Default limit: 100 requests per minute per IP
limiter = Limiter(
    key_func=get_identifier,
    default_limits=["100/minute"],
    storage_uri="memory://",  # Use in-memory storage (will upgrade to Redis later)
    strategy="fixed-window",  # Simple fixed-window strategy
    headers_enabled=True,  # Send rate limit headers in response
)


def get_limiter() -> Limiter:
    """Get the global rate limiter instance."""
    return limiter
