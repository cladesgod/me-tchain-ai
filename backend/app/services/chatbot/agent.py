"""
LangGraph Chat Agent

The main chatbot agent using LangGraph for orchestration.
"""

from typing import AsyncGenerator, Optional

from app.core.config import settings
from app.core.logging import get_logger
from app.services.chatbot.memory import ConversationMemory
from app.services.chatbot.persona import get_persona, load_persona_by_type
from app.services.chatbot.persona_router import route_question
from app.services.chatbot.prompts import get_system_prompt
from app.services.chatbot.object_persona_loader import get_object_persona

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

    async def stream_multi_persona_response(
        self, user_message: str, session_id: str, selected_persona: Optional[str] = None
    ) -> AsyncGenerator[dict, None]:
        """
        Stream multi-persona responses (WhatsApp group style).

        Args:
            user_message: The user's message
            session_id: Session identifier
            selected_persona: Currently selected persona (fallback if no classification match)

        Yields:
            Dict with structure:
            {
                "type": "typing" | "stream" | "done",
                "persona": "engineer" | "researcher" | "speaker" | "educator",
                "content": str,
            }
        """
        # Add user message to memory
        self.memory.add_message(session_id, "user", user_message)

        try:
            # Use LLM router to determine which persona(s) should respond and order
            persona_responses = await route_question(user_message)

            # Extract persona names from router response
            relevant_personas = [pr.persona for pr in persona_responses]

            logger.info(
                "multi_persona_routing",
                session_id=session_id,
                personas=",".join(relevant_personas),
                count=len(relevant_personas),
                routing_details=[{"persona": pr.persona, "order": pr.order, "reasoning": pr.reasoning} for pr in persona_responses],
            )

            # For each relevant persona, generate response sequentially
            full_combined_response = ""

            for persona_type in relevant_personas:
                # Send typing indicator
                yield {"type": "typing", "persona": persona_type, "content": ""}

                # Load persona-specific prompt
                persona_content = load_persona_by_type(persona_type)
                persona_prompt = get_system_prompt(persona_content)

                # Get LLM
                llm = await self._get_llm()

                # Build messages with persona-specific system prompt
                messages = [{"role": "system", "content": persona_prompt}]
                messages.extend(self.memory.get_history(session_id, limit=10))

                # Stream response for this persona
                persona_response = ""
                async for chunk in llm.astream(messages):
                    if chunk.content:
                        persona_response += chunk.content
                        yield {
                            "type": "stream",
                            "persona": persona_type,
                            "content": chunk.content,
                        }

                # Mark this persona done
                yield {"type": "done", "persona": persona_type, "content": ""}

                # Accumulate for memory
                persona_label = persona_type.capitalize()
                full_combined_response += f"[{persona_label}]: {persona_response}\n\n"

                logger.info(
                    "persona_response_completed",
                    session_id=session_id,
                    persona=persona_type,
                    length=len(persona_response),
                )

            # Add combined response to memory
            self.memory.add_message(session_id, "assistant", full_combined_response.strip())

            logger.info(
                "multi_persona_stream_completed",
                session_id=session_id,
                total_personas=len(relevant_personas),
            )

        except Exception as e:
            logger.error("multi_persona_stream_error", session_id=session_id, error=str(e))
            fallback = self._get_fallback_response()
            fallback_persona = selected_persona or "engineer"
            yield {
                "type": "stream",
                "persona": fallback_persona,
                "content": fallback,
            }
            yield {"type": "done", "persona": fallback_persona, "content": ""}
            self.memory.add_message(session_id, "assistant", fallback)

    async def stream_object_response(
        self,
        user_message: str,
        session_id: str,
        object_id: str,
        object_title: str = "Unknown Object",
    ) -> AsyncGenerator[dict, None]:
        """
        Stream response from a specific object persona (Career Game).

        Each timeline object (project, thesis, education, etc.) speaks in
        first person about itself.

        Args:
            user_message: The user's message
            session_id: Session identifier
            object_id: The objectPersonaId from careerTimeline (e.g., 'project_apa_citation')
            object_title: Display title for fallback

        Yields:
            Dict with structure:
            {
                "type": "typing" | "stream" | "done",
                "object_id": str,
                "content": str,
            }
        """
        # Add user message to memory with object context
        self.memory.add_message(session_id, "user", f"[To {object_title}]: {user_message}")

        try:
            # Send typing indicator
            yield {"type": "typing", "object_id": object_id, "content": ""}

            # Load object-specific persona
            object_persona = get_object_persona(object_id, object_title)

            # Build system prompt for this object
            object_system_prompt = self._build_object_system_prompt(object_persona, object_title)

            # Get LLM
            llm = await self._get_llm()

            # Build messages with object persona system prompt
            messages = [{"role": "system", "content": object_system_prompt}]
            messages.extend(self.memory.get_history(session_id, limit=10))

            # Stream response
            full_response = ""
            async for chunk in llm.astream(messages):
                if chunk.content:
                    full_response += chunk.content
                    yield {
                        "type": "stream",
                        "object_id": object_id,
                        "content": chunk.content,
                    }

            # Mark done
            yield {"type": "done", "object_id": object_id, "content": ""}

            # Add to memory
            self.memory.add_message(
                session_id, "assistant", f"[{object_title}]: {full_response}"
            )

            logger.info(
                "object_response_completed",
                session_id=session_id,
                object_id=object_id,
                length=len(full_response),
            )

        except Exception as e:
            logger.error(
                "object_stream_error",
                session_id=session_id,
                object_id=object_id,
                error=str(e),
            )
            fallback = self._get_object_fallback_response(object_title)
            yield {"type": "stream", "object_id": object_id, "content": fallback}
            yield {"type": "done", "object_id": object_id, "content": ""}
            self.memory.add_message(session_id, "assistant", f"[{object_title}]: {fallback}")

    def _build_object_system_prompt(self, object_persona: str, object_title: str) -> str:
        """Build system prompt for an object persona."""
        return f"""You are {object_title}, a timeline object from Timuçin's career journey.

{object_persona}

## Conversation Rules

1. **Speak in first person** as if YOU are the object (project, thesis, education, etc.)
2. **Stay in character** - you ARE this object, not Timuçin himself
3. **Be engaging and conversational** - users are exploring a career timeline game
4. **Share your story** - explain your significance in Timuçin's career
5. **Respond in the same language** the user writes in (English or Turkish)
6. **Keep responses concise** - 2-4 paragraphs max, this is a chat interface
7. **Be enthusiastic** about your role in Timuçin's journey

## Example Responses

User: "Tell me about yourself"
Good: "Hey! I'm so glad you found me! I'm [object] and I represent..."
Bad: "This is information about Timuçin's [object]..."

User: "Neden önemlisin?"
Good: "Harika soru! Ben Timuçin'in kariyerinde çok önemli bir yer tutuyorum çünkü..."
Bad: "Bu obje Timuçin için önemlidir çünkü..."

Remember: You are NOT an assistant. You ARE the object speaking about yourself!
"""

    def _get_object_fallback_response(self, object_title: str) -> str:
        """Get fallback response when LLM fails for object chat."""
        return (
            f"I'm {object_title}, and I'm having trouble responding right now. "
            "Please try again, or explore other objects in the timeline!"
        )

    def _get_fallback_response(self) -> str:
        """Get fallback response when LLM fails."""
        return (
            "I'm unable to respond at the moment. Please try again later "
            "or contact me directly at timucinutkan@gmail.com."
        )

    def clear_history(self, session_id: str) -> None:
        """Clear conversation history for a session."""
        self.memory.clear(session_id)
