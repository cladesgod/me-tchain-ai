"""
API Dependencies

Dependency injection functions for API endpoints.
"""

from typing import Annotated, AsyncGenerator

from fastapi import Depends

from app.services.chatbot.agent import ChatAgent
from app.services.chatbot.memory import ConversationMemory


async def get_chat_agent() -> AsyncGenerator[ChatAgent, None]:
    """Get ChatAgent instance with dependency injection."""
    agent = ChatAgent()
    try:
        yield agent
    finally:
        # Cleanup if needed
        pass


async def get_conversation_memory() -> AsyncGenerator[ConversationMemory, None]:
    """Get ConversationMemory instance."""
    memory = ConversationMemory()
    try:
        yield memory
    finally:
        pass


# Type aliases for cleaner dependency injection
ChatAgentDep = Annotated[ChatAgent, Depends(get_chat_agent)]
MemoryDep = Annotated[ConversationMemory, Depends(get_conversation_memory)]
