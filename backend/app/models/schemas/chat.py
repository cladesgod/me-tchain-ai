"""Chat-related schemas."""

from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, Field


class ChatMessage(BaseModel):
    """Chat message schema."""

    type: Literal["message", "system", "error"] = "message"
    content: str
    session_id: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class ChatResponse(BaseModel):
    """Chat response schema."""

    type: Literal["response", "stream", "error"] = "response"
    content: str
    done: bool = True
    session_id: Optional[str] = None


class ChatHistoryItem(BaseModel):
    """Single item in chat history."""

    role: Literal["user", "assistant"]
    content: str
    timestamp: datetime
