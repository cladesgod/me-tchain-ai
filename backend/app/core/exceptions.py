"""
Custom Exception Classes

Centralized exception handling for the application.
"""

from typing import Any, Dict, Optional


class AppException(Exception):
    """Base application exception."""

    def __init__(
        self,
        message: str,
        status_code: int = 500,
        details: Optional[Dict[str, Any]] = None,
    ) -> None:
        self.message = message
        self.status_code = status_code
        self.details = details or {}
        super().__init__(self.message)


class NotFoundError(AppException):
    """Resource not found."""

    def __init__(self, resource: str, identifier: Any) -> None:
        super().__init__(
            message=f"{resource} not found: {identifier}",
            status_code=404,
            details={"resource": resource, "identifier": str(identifier)},
        )


class ValidationError(AppException):
    """Input validation failed."""

    def __init__(self, message: str, errors: Optional[Dict[str, Any]] = None) -> None:
        super().__init__(
            message=message,
            status_code=422,
            details={"errors": errors or {}},
        )


class ChatbotError(AppException):
    """Chatbot-related error."""

    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None) -> None:
        super().__init__(
            message=f"Chatbot error: {message}",
            status_code=500,
            details=details,
        )


class LLMConnectionError(AppException):
    """LLM provider connection error."""

    def __init__(self, provider: str, message: str) -> None:
        super().__init__(
            message=f"Failed to connect to {provider}: {message}",
            status_code=503,
            details={"provider": provider},
        )


class RateLimitError(AppException):
    """Rate limit exceeded."""

    def __init__(self, limit: int, window: str = "minute") -> None:
        super().__init__(
            message=f"Rate limit exceeded: {limit} requests per {window}",
            status_code=429,
            details={"limit": limit, "window": window},
        )
