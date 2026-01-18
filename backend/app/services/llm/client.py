"""
Thread-Safe LLM Client Manager

Provides a singleton LLM client that is safely shared across all requests.
"""

import asyncio
from typing import Any, Optional

from langchain_openai import AzureChatOpenAI

from app.core.config import settings
from app.core.logging import get_logger
from app.core.resilience import (
    CircuitBreakerError,
    get_llm_circuit_breaker,
    get_llm_retry_config,
)

logger = get_logger(__name__)


class LLMClientManager:
    """
    Thread-safe singleton manager for LLM client.

    Ensures only one LLM client is created and safely shared across
    all concurrent requests and agent instances.
    """

    _instance: Optional["LLMClientManager"] = None
    _lock: asyncio.Lock = asyncio.Lock()
    _client: Optional[AzureChatOpenAI] = None
    _initialized: bool = False

    def __new__(cls) -> "LLMClientManager":
        """Ensure only one instance exists (singleton pattern)."""
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    async def initialize(self) -> None:
        """
        Initialize the LLM client.

        This should be called once during application startup.
        Safe to call multiple times - subsequent calls are no-ops.
        """
        if self._initialized:
            return

        async with self._lock:
            # Double-check after acquiring lock
            if self._initialized:
                return

            try:
                logger.info("llm_client_initializing")

                self._client = AzureChatOpenAI(
                    azure_endpoint=settings.AZURE_AI_ENDPOINT.rstrip("/"),
                    azure_deployment=settings.DEEPSEEK_DEPLOYMENT_NAME,
                    api_version=settings.AZURE_API_VERSION,
                    api_key=settings.AZURE_AI_CREDENTIAL,
                    temperature=0.7,
                    streaming=True,
                    # Connection pooling settings
                    max_retries=3,
                    request_timeout=60.0,
                )

                self._initialized = True
                logger.info(
                    "llm_client_initialized",
                    provider="azure_ai_foundry",
                    deployment=settings.DEEPSEEK_DEPLOYMENT_NAME,
                )

            except Exception as e:
                logger.error("llm_client_initialization_failed", error=str(e))
                raise

    async def get_client(self) -> AzureChatOpenAI:
        """
        Get the shared LLM client instance.

        Automatically initializes if not already done.

        Returns:
            AzureChatOpenAI: The shared LLM client

        Raises:
            RuntimeError: If initialization fails
        """
        if not self._initialized:
            await self.initialize()

        if self._client is None:
            raise RuntimeError("LLM client not initialized properly")

        return self._client

    async def shutdown(self) -> None:
        """
        Shutdown the LLM client and cleanup resources.

        Should be called during application shutdown.
        """
        async with self._lock:
            if self._client is not None:
                # Close any open connections
                # AzureChatOpenAI doesn't have an explicit close method,
                # but we set to None to release resources
                self._client = None
                self._initialized = False
                logger.info("llm_client_shutdown_complete")


# Global singleton instance
_llm_manager: Optional[LLMClientManager] = None


def get_llm_manager() -> LLMClientManager:
    """
    Get the global LLM client manager instance.

    Returns:
        LLMClientManager: The singleton manager instance
    """
    global _llm_manager
    if _llm_manager is None:
        _llm_manager = LLMClientManager()
    return _llm_manager


class ResilientLLMClient:
    """
    Wrapper around AzureChatOpenAI with retry logic and circuit breaker.

    Provides resilience patterns for LLM calls to handle transient failures.
    """

    def __init__(self, client: AzureChatOpenAI) -> None:
        self.client = client
        self._circuit_breaker = get_llm_circuit_breaker()
        self._retry_config = get_llm_retry_config()

    async def ainvoke(self, *args, **kwargs) -> Any:
        """
        Invoke LLM with retry logic and circuit breaker.

        Args:
            *args: Positional arguments for client.ainvoke
            **kwargs: Keyword arguments for client.ainvoke

        Returns:
            LLM response

        Raises:
            CircuitBreakerError: If circuit is open
            Exception: On final failure after retries
        """

        async def _call():
            return await self.client.ainvoke(*args, **kwargs)

        try:
            # Wrap with circuit breaker and retry logic
            async for attempt in self._retry_config:
                with attempt:
                    result = await self._circuit_breaker.call(_call)
                    return result
        except CircuitBreakerError:
            logger.error(
                "llm_circuit_breaker_open",
                state=self._circuit_breaker.state.value,
            )
            raise
        except Exception as e:
            logger.error("llm_call_failed_after_retries", error=str(e))
            raise

    async def astream(self, *args, **kwargs):
        """
        Stream LLM response with retry logic and circuit breaker.

        Args:
            *args: Positional arguments for client.astream
            **kwargs: Keyword arguments for client.astream

        Yields:
            Response chunks

        Raises:
            CircuitBreakerError: If circuit is open
            Exception: On final failure after retries
        """

        async def _call():
            # For streaming, we return the async generator
            return self.client.astream(*args, **kwargs)

        try:
            # Get the stream generator through circuit breaker
            async for attempt in self._retry_config:
                with attempt:
                    stream_generator = await self._circuit_breaker.call(_call)
                    # Yield from the stream
                    async for chunk in stream_generator:
                        yield chunk
                    # Mark success after complete stream
                    return
        except CircuitBreakerError:
            logger.error(
                "llm_circuit_breaker_open_streaming",
                state=self._circuit_breaker.state.value,
            )
            raise
        except Exception as e:
            logger.error("llm_stream_failed_after_retries", error=str(e))
            raise


async def get_llm_client() -> ResilientLLMClient:
    """
    Convenience function to get the resilient LLM client.

    Returns:
        ResilientLLMClient: The wrapped LLM client with retry and circuit breaker
    """
    manager = get_llm_manager()
    base_client = await manager.get_client()
    return ResilientLLMClient(base_client)
