"""
Conversation Memory Management

Handles short-term and long-term conversation memory.
"""

from dataclasses import dataclass, field
from datetime import datetime
from typing import Dict, List, Optional

from app.core.logging import get_logger

logger = get_logger(__name__)


@dataclass
class Message:
    """Single conversation message."""

    role: str  # "user" or "assistant"
    content: str
    timestamp: datetime = field(default_factory=datetime.utcnow)


@dataclass
class Conversation:
    """A conversation thread with message history."""

    session_id: str
    messages: List[Message] = field(default_factory=list)
    created_at: datetime = field(default_factory=datetime.utcnow)
    updated_at: datetime = field(default_factory=datetime.utcnow)

    def add_message(self, role: str, content: str) -> None:
        """Add a message to the conversation."""
        self.messages.append(Message(role=role, content=content))
        self.updated_at = datetime.utcnow()

    def get_history(self, limit: Optional[int] = None) -> List[Dict[str, str]]:
        """Get conversation history in LangChain format."""
        messages = self.messages[-limit:] if limit else self.messages
        return [{"role": msg.role, "content": msg.content} for msg in messages]

    def clear(self) -> None:
        """Clear conversation history."""
        self.messages = []
        self.updated_at = datetime.utcnow()


class ConversationMemory:
    """
    In-memory conversation storage.

    For production, this should be replaced with Redis or database storage.
    """

    def __init__(self, max_history: int = 20) -> None:
        self.conversations: Dict[str, Conversation] = {}
        self.max_history = max_history

    def get_or_create(self, session_id: str) -> Conversation:
        """Get existing conversation or create new one."""
        if session_id not in self.conversations:
            self.conversations[session_id] = Conversation(session_id=session_id)
            logger.info("conversation_created", session_id=session_id)
        return self.conversations[session_id]

    def add_message(self, session_id: str, role: str, content: str) -> None:
        """Add a message to a conversation."""
        conversation = self.get_or_create(session_id)
        conversation.add_message(role, content)

        # Trim history if needed
        if len(conversation.messages) > self.max_history:
            conversation.messages = conversation.messages[-self.max_history :]

        logger.debug(
            "message_added",
            session_id=session_id,
            role=role,
            message_count=len(conversation.messages),
        )

    def get_history(
        self, session_id: str, limit: Optional[int] = None
    ) -> List[Dict[str, str]]:
        """Get conversation history."""
        conversation = self.get_or_create(session_id)
        return conversation.get_history(limit)

    def clear(self, session_id: str) -> None:
        """Clear a conversation."""
        if session_id in self.conversations:
            self.conversations[session_id].clear()
            logger.info("conversation_cleared", session_id=session_id)

    def delete(self, session_id: str) -> None:
        """Delete a conversation entirely."""
        if session_id in self.conversations:
            del self.conversations[session_id]
            logger.info("conversation_deleted", session_id=session_id)
