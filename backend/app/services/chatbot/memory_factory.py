"""
Conversation Memory Factory

Creates appropriate memory instance based on configuration.
Supports dependency injection pattern.
"""

from typing import Protocol

from app.core.config import settings
from app.core.logging import get_logger
from app.services.chatbot.memory import ConversationMemory
from app.services.chatbot.redis_memory import RedisConversationMemory, get_redis_memory

logger = get_logger(__name__)


class ConversationMemoryProtocol(Protocol):
    """
    Protocol for conversation memory implementations.

    Allows dependency injection with different backends.
    """

    async def add_message(self, session_id: str, role: str, content: str) -> None:
        """Add a message to conversation."""
        ...

    async def get_history(self, session_id: str, limit: int | None = None) -> list[dict[str, str]]:
        """Get conversation history."""
        ...

    async def clear(self, session_id: str) -> None:
        """Clear conversation."""
        ...


class InMemoryMemoryAdapter:
    """
    Adapter for in-memory ConversationMemory to match async protocol.

    Wraps synchronous in-memory implementation to provide async interface.
    """

    def __init__(self, memory: ConversationMemory) -> None:
        self._memory = memory

    async def add_message(self, session_id: str, role: str, content: str) -> None:
        """Add a message (async wrapper)."""
        self._memory.add_message(session_id, role, content)

    async def get_history(self, session_id: str, limit: int | None = None) -> list[dict[str, str]]:
        """Get history (async wrapper)."""
        return self._memory.get_history(session_id, limit)

    async def clear(self, session_id: str) -> None:
        """Clear conversation (async wrapper)."""
        self._memory.clear(session_id)


def create_memory() -> ConversationMemoryProtocol:
    """
    Factory function to create appropriate memory instance based on config.

    Returns:
        ConversationMemoryProtocol: Memory implementation (Redis or in-memory)
    """
    if settings.REDIS_USE_FOR_MEMORY:
        logger.info("memory_factory_creating_redis_backend")
        return get_redis_memory()
    else:
        logger.info("memory_factory_creating_in_memory_backend")
        return InMemoryMemoryAdapter(ConversationMemory())


async def get_memory() -> ConversationMemoryProtocol:
    """
    Dependency injection function for FastAPI.

    Returns:
        ConversationMemoryProtocol: Initialized memory instance
    """
    memory = create_memory()

    # Initialize if it's Redis
    if isinstance(memory, RedisConversationMemory) and memory._redis is None:
        await memory.initialize()

    return memory
