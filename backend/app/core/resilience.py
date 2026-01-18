"""
Resilience Patterns: Circuit Breaker and Retry Logic

Implements circuit breaker pattern and retry logic with exponential backoff
for external service calls (LLM, Redis, etc.).
"""

import asyncio
from datetime import datetime, timedelta
from enum import Enum
from typing import Any, Callable, Optional

from tenacity import (
    AsyncRetrying,
    retry_if_exception_type,
    stop_after_attempt,
    wait_exponential,
)

from app.core.logging import get_logger

logger = get_logger(__name__)


class CircuitState(Enum):
    """Circuit breaker states."""

    CLOSED = "closed"  # Normal operation
    OPEN = "open"  # Failing, reject requests
    HALF_OPEN = "half_open"  # Testing recovery


class CircuitBreaker:
    """
    Circuit breaker pattern implementation for async functions.

    Prevents cascading failures by stopping requests to a failing service
    and allowing it time to recover.
    """

    def __init__(
        self,
        failure_threshold: int = 5,
        recovery_timeout: int = 60,
        half_open_max_calls: int = 1,
        name: str = "unnamed",
    ) -> None:
        """
        Initialize circuit breaker.

        Args:
            failure_threshold: Number of failures before opening circuit
            recovery_timeout: Seconds to wait before attempting recovery
            half_open_max_calls: Max calls allowed in half-open state
            name: Name for logging purposes
        """
        self.failure_threshold = failure_threshold
        self.recovery_timeout = recovery_timeout
        self.half_open_max_calls = half_open_max_calls
        self.name = name

        self._state = CircuitState.CLOSED
        self._failure_count = 0
        self._last_failure_time: Optional[datetime] = None
        self._half_open_calls = 0
        self._lock = asyncio.Lock()

    @property
    def state(self) -> CircuitState:
        """Get current circuit state."""
        return self._state

    def _should_attempt_recovery(self) -> bool:
        """Check if enough time has passed to attempt recovery."""
        if not self._last_failure_time:
            return False

        elapsed = datetime.utcnow() - self._last_failure_time
        return elapsed > timedelta(seconds=self.recovery_timeout)

    async def _on_success(self) -> None:
        """Handle successful call."""
        async with self._lock:
            if self._state == CircuitState.HALF_OPEN:
                # Successful call in half-open state -> close circuit
                self._state = CircuitState.CLOSED
                self._failure_count = 0
                self._half_open_calls = 0
                logger.info(
                    "circuit_breaker_closed",
                    name=self.name,
                    previous_failures=self._failure_count,
                )
            elif self._state == CircuitState.CLOSED:
                # Reset failure count on success
                self._failure_count = 0

    async def _on_failure(self) -> None:
        """Handle failed call."""
        async with self._lock:
            self._failure_count += 1
            self._last_failure_time = datetime.utcnow()

            if self._state == CircuitState.HALF_OPEN:
                # Failed in half-open state -> reopen circuit
                self._state = CircuitState.OPEN
                logger.warning(
                    "circuit_breaker_reopened",
                    name=self.name,
                    failures=self._failure_count,
                )
            elif self._state == CircuitState.CLOSED:
                if self._failure_count >= self.failure_threshold:
                    # Too many failures -> open circuit
                    self._state = CircuitState.OPEN
                    logger.error(
                        "circuit_breaker_opened",
                        name=self.name,
                        failures=self._failure_count,
                        threshold=self.failure_threshold,
                    )

    async def call(self, func: Callable, *args, **kwargs) -> Any:
        """
        Execute function with circuit breaker protection.

        Args:
            func: Async function to execute
            *args: Positional arguments for func
            **kwargs: Keyword arguments for func

        Returns:
            Result of func

        Raises:
            CircuitBreakerError: If circuit is open
            Exception: Any exception raised by func
        """
        # Check circuit state
        async with self._lock:
            if self._state == CircuitState.OPEN:
                if self._should_attempt_recovery():
                    # Attempt recovery
                    self._state = CircuitState.HALF_OPEN
                    self._half_open_calls = 0
                    logger.info(
                        "circuit_breaker_half_open",
                        name=self.name,
                        recovery_attempt=True,
                    )
                else:
                    # Circuit still open
                    raise CircuitBreakerError(
                        f"Circuit breaker '{self.name}' is OPEN. "
                        f"Service unavailable. Try again later."
                    )

            if self._state == CircuitState.HALF_OPEN:
                if self._half_open_calls >= self.half_open_max_calls:
                    raise CircuitBreakerError(
                        f"Circuit breaker '{self.name}' is HALF_OPEN. "
                        f"Maximum test calls ({self.half_open_max_calls}) exceeded."
                    )
                self._half_open_calls += 1

        # Execute function
        try:
            result = await func(*args, **kwargs)
            await self._on_success()
            return result
        except Exception as e:
            await self._on_failure()
            raise

    def reset(self) -> None:
        """Manually reset circuit breaker to closed state."""
        self._state = CircuitState.CLOSED
        self._failure_count = 0
        self._last_failure_time = None
        self._half_open_calls = 0
        logger.info("circuit_breaker_manually_reset", name=self.name)


class CircuitBreakerError(Exception):
    """Raised when circuit breaker is open."""

    pass


# Retry configuration for LLM calls
def get_llm_retry_config():
    """
    Get retry configuration for LLM calls.

    Returns:
        AsyncRetrying: Configured retry instance
    """
    return AsyncRetrying(
        # Retry on common LLM exceptions
        retry=retry_if_exception_type((TimeoutError, ConnectionError, Exception)),
        # Stop after 3 attempts
        stop=stop_after_attempt(3),
        # Exponential backoff: 1s, 2s, 4s
        wait=wait_exponential(multiplier=1, min=1, max=10),
        # Callback on retry
        before_sleep=lambda retry_state: logger.warning(
            "llm_call_retry",
            attempt=retry_state.attempt_number,
            exception=str(retry_state.outcome.exception()),
        ),
    )


# Retry configuration for Redis calls
def get_redis_retry_config():
    """
    Get retry configuration for Redis calls.

    Returns:
        AsyncRetrying: Configured retry instance
    """
    return AsyncRetrying(
        # Retry on connection errors
        retry=retry_if_exception_type((ConnectionError, TimeoutError)),
        # Stop after 2 attempts (Redis should be fast)
        stop=stop_after_attempt(2),
        # Shorter backoff for Redis: 0.5s, 1s
        wait=wait_exponential(multiplier=0.5, min=0.5, max=2),
        # Callback on retry
        before_sleep=lambda retry_state: logger.warning(
            "redis_call_retry",
            attempt=retry_state.attempt_number,
            exception=str(retry_state.outcome.exception()),
        ),
    )


# Global circuit breakers
_llm_circuit_breaker: Optional[CircuitBreaker] = None
_redis_circuit_breaker: Optional[CircuitBreaker] = None


def get_llm_circuit_breaker() -> CircuitBreaker:
    """
    Get global LLM circuit breaker instance.

    Returns:
        CircuitBreaker: Singleton instance for LLM calls
    """
    global _llm_circuit_breaker
    if _llm_circuit_breaker is None:
        _llm_circuit_breaker = CircuitBreaker(
            failure_threshold=5,  # Open after 5 failures
            recovery_timeout=60,  # Wait 60s before retry
            half_open_max_calls=1,  # Test with 1 call
            name="llm",
        )
    return _llm_circuit_breaker


def get_redis_circuit_breaker() -> CircuitBreaker:
    """
    Get global Redis circuit breaker instance.

    Returns:
        CircuitBreaker: Singleton instance for Redis calls
    """
    global _redis_circuit_breaker
    if _redis_circuit_breaker is None:
        _redis_circuit_breaker = CircuitBreaker(
            failure_threshold=3,  # Open after 3 failures
            recovery_timeout=30,  # Wait 30s before retry
            half_open_max_calls=1,  # Test with 1 call
            name="redis",
        )
    return _redis_circuit_breaker
