"""
LangGraph Chat Agent

The main chatbot agent using LangGraph for orchestration.
"""

from typing import AsyncGenerator, Optional

from app.core.config import settings
from app.core.logging import get_logger
from app.services.chatbot.memory import ConversationMemory
from app.services.chatbot.persona import get_persona
from app.services.chatbot.prompts import get_system_prompt

logger = get_logger(__name__)


class ChatAgent:
    """
    Chat agent using LangGraph for conversation management.

    This is a simplified version. For production, integrate with:
    - LangGraph StateGraph for complex flows
    - LangSmith for monitoring
    - Microsoft AI Foundry for DeepSeek access
    """

    def __init__(self, memory: Optional[ConversationMemory] = None) -> None:
        self.memory = memory or ConversationMemory()
        self.persona = get_persona()
        self.system_prompt = get_system_prompt(self.persona)
        self._llm = None

    async def _get_llm(self):
        """Lazy-load LLM client."""
        if self._llm is None:
            try:
                from langchain_openai import AzureChatOpenAI

                self._llm = AzureChatOpenAI(
                    azure_endpoint=settings.AZURE_AI_ENDPOINT.rstrip("/"),
                    azure_deployment=settings.DEEPSEEK_DEPLOYMENT_NAME,
                    api_version=settings.AZURE_API_VERSION,
                    api_key=settings.AZURE_AI_CREDENTIAL,
                    temperature=0.7,
                    streaming=True,
                )
                logger.info("llm_initialized", provider="azure_ai_foundry")
            except Exception as e:
                logger.error("llm_initialization_failed", error=str(e))
                raise

        return self._llm

    async def chat(self, user_message: str, session_id: str) -> str:
        """
        Send a message and get a response.

        Args:
            user_message: The user's message
            session_id: Session identifier for conversation tracking

        Returns:
            The assistant's response
        """
        # Add user message to memory
        self.memory.add_message(session_id, "user", user_message)

        try:
            llm = await self._get_llm()

            # Build messages
            messages = [{"role": "system", "content": self.system_prompt}]
            messages.extend(self.memory.get_history(session_id, limit=10))

            # Get response
            response = await llm.ainvoke(messages)
            assistant_message = response.content

            # Add to memory
            self.memory.add_message(session_id, "assistant", assistant_message)

            logger.info(
                "chat_response_generated",
                session_id=session_id,
                input_length=len(user_message),
                output_length=len(assistant_message),
            )

            return assistant_message

        except Exception as e:
            logger.error("chat_error", session_id=session_id, error=str(e))
            return self._get_fallback_response()

    async def stream_response(
        self, user_message: str, session_id: str
    ) -> AsyncGenerator[str, None]:
        """
        Stream a response chunk by chunk.

        Args:
            user_message: The user's message
            session_id: Session identifier

        Yields:
            Response chunks as they're generated
        """
        # Add user message to memory
        self.memory.add_message(session_id, "user", user_message)

        try:
            llm = await self._get_llm()

            # Build messages
            messages = [{"role": "system", "content": self.system_prompt}]
            messages.extend(self.memory.get_history(session_id, limit=10))

            # Stream response
            full_response = ""
            async for chunk in llm.astream(messages):
                if chunk.content:
                    full_response += chunk.content
                    yield chunk.content

            # Add complete response to memory
            self.memory.add_message(session_id, "assistant", full_response)

            logger.info(
                "chat_stream_completed",
                session_id=session_id,
                response_length=len(full_response),
            )

        except Exception as e:
            logger.error("chat_stream_error", session_id=session_id, error=str(e))
            fallback = self._get_fallback_response()
            yield fallback
            self.memory.add_message(session_id, "assistant", fallback)

    def _get_fallback_response(self) -> str:
        """Get fallback response when LLM fails."""
        return (
            "I'm unable to respond at the moment. Please try again later "
            "or contact me directly at timucinutkan@gmail.com."
        )

    def clear_history(self, session_id: str) -> None:
        """Clear conversation history for a session."""
        self.memory.clear(session_id)
