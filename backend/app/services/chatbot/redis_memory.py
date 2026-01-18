"""
Redis-Based Conversation Memory

Persistent conversation storage using Redis with TTL support.
"""

import json
from datetime import datetime
from typing import Dict, List, Optional

import redis.asyncio as aioredis

from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)

# Configuration
DEFAULT_TTL = 3600  # 1 hour in seconds
MAX_HISTORY = 20  # Maximum messages to keep per conversation


class RedisConversationMemory:
    """
    Redis-based conversation storage with TTL support.

    Stores conversation history in Redis with automatic expiration.
    Each conversation is stored as a JSON list of messages.
    """

    def __init__(
        self,
        redis_url: Optional[str] = None,
        ttl: int = DEFAULT_TTL,
        max_history: int = MAX_HISTORY,
    ) -> None:
        """
        Initialize Redis conversation memory.

        Args:
            redis_url: Redis connection URL (defaults to settings)
            ttl: Time-to-live for conversations in seconds
            max_history: Maximum number of messages to keep per conversation
        """
        self.redis_url = redis_url or getattr(
            settings, "REDIS_URL", "redis://localhost:6379/0"
        )
        self.ttl = ttl
        self.max_history = max_history
        self._redis: Optional[aioredis.Redis] = None

    async def initialize(self) -> None:
        """
        Initialize Redis connection.

        Should be called during application startup.
        """
        if self._redis is not None:
            return

        try:
            self._redis = await aioredis.from_url(
                self.redis_url,
                encoding="utf-8",
                decode_responses=True,
                socket_connect_timeout=5,
                socket_keepalive=True,
            )
            # Test connection
            await self._redis.ping()
            logger.info(
                "redis_memory_initialized",
                url=self.redis_url,
                ttl=self.ttl,
                max_history=self.max_history,
            )
        except Exception as e:
            logger.error("redis_memory_initialization_failed", error=str(e))
            raise

    async def close(self) -> None:
        """
        Close Redis connection.

        Should be called during application shutdown.
        """
        if self._redis:
            await self._redis.aclose()
            self._redis = None
            logger.info("redis_memory_closed")

    def _get_key(self, session_id: str) -> str:
        """Get Redis key for a conversation."""
        return f"conversation:{session_id}"

    async def add_message(self, session_id: str, role: str, content: str) -> None:
        """
        Add a message to a conversation.

        Args:
            session_id: Conversation session identifier
            role: Message role ("user" or "assistant")
            content: Message content
        """
        if not self._redis:
            raise RuntimeError("Redis not initialized. Call initialize() first.")

        key = self._get_key(session_id)

        # Create message object
        message = {
            "role": role,
            "content": content,
            "timestamp": datetime.utcnow().isoformat(),
        }

        try:
            # Get existing messages
            existing = await self._redis.get(key)
            messages = json.loads(existing) if existing else []

            # Add new message
            messages.append(message)

            # Trim history if needed
            if len(messages) > self.max_history:
                messages = messages[-self.max_history :]

            # Store back to Redis with TTL
            await self._redis.setex(
                key,
                self.ttl,
                json.dumps(messages),
            )

            logger.debug(
                "message_added_to_redis",
                session_id=session_id,
                role=role,
                message_count=len(messages),
            )

        except Exception as e:
            logger.error(
                "add_message_failed",
                session_id=session_id,
                error=str(e),
            )
            raise

    async def get_history(
        self, session_id: str, limit: Optional[int] = None
    ) -> List[Dict[str, str]]:
        """
        Get conversation history.

        Args:
            session_id: Conversation session identifier
            limit: Maximum number of messages to return (None = all)

        Returns:
            List of messages in LangChain format
        """
        if not self._redis:
            raise RuntimeError("Redis not initialized. Call initialize() first.")

        key = self._get_key(session_id)

        try:
            # Get messages from Redis
            existing = await self._redis.get(key)
            messages = json.loads(existing) if existing else []

            # Apply limit if specified
            if limit:
                messages = messages[-limit:]

            # Convert to LangChain format (remove timestamp)
            return [{"role": msg["role"], "content": msg["content"]} for msg in messages]

        except Exception as e:
            logger.error(
                "get_history_failed",
                session_id=session_id,
                error=str(e),
            )
            # Return empty history on error
            return []

    async def clear(self, session_id: str) -> None:
        """
        Clear a conversation (delete all messages).

        Args:
            session_id: Conversation session identifier
        """
        if not self._redis:
            raise RuntimeError("Redis not initialized. Call initialize() first.")

        key = self._get_key(session_id)

        try:
            await self._redis.delete(key)
            logger.info("conversation_cleared", session_id=session_id)
        except Exception as e:
            logger.error("clear_conversation_failed", session_id=session_id, error=str(e))
            raise

    async def exists(self, session_id: str) -> bool:
        """
        Check if a conversation exists.

        Args:
            session_id: Conversation session identifier

        Returns:
            True if conversation exists, False otherwise
        """
        if not self._redis:
            raise RuntimeError("Redis not initialized. Call initialize() first.")

        key = self._get_key(session_id)
        return await self._redis.exists(key) > 0

    async def get_ttl(self, session_id: str) -> int:
        """
        Get remaining TTL for a conversation.

        Args:
            session_id: Conversation session identifier

        Returns:
            Remaining seconds (-1 if no expiration, -2 if key doesn't exist)
        """
        if not self._redis:
            raise RuntimeError("Redis not initialized. Call initialize() first.")

        key = self._get_key(session_id)
        return await self._redis.ttl(key)

    async def extend_ttl(self, session_id: str, ttl: Optional[int] = None) -> None:
        """
        Extend TTL for a conversation.

        Args:
            session_id: Conversation session identifier
            ttl: New TTL in seconds (defaults to instance TTL)
        """
        if not self._redis:
            raise RuntimeError("Redis not initialized. Call initialize() first.")

        key = self._get_key(session_id)
        await self._redis.expire(key, ttl or self.ttl)
        logger.debug("conversation_ttl_extended", session_id=session_id, ttl=ttl or self.ttl)


# Global instance
_redis_memory: Optional[RedisConversationMemory] = None


def get_redis_memory() -> RedisConversationMemory:
    """
    Get the global Redis memory instance.

    Returns:
        RedisConversationMemory: The singleton instance
    """
    global _redis_memory
    if _redis_memory is None:
        _redis_memory = RedisConversationMemory()
    return _redis_memory
