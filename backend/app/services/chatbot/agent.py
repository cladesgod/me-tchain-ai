"""
LangGraph Chat Agent

The main chatbot agent using LangGraph for orchestration.
"""

import asyncio
from typing import AsyncGenerator, Optional

from app.core.logging import get_logger
from app.services.chatbot.memory_factory import ConversationMemoryProtocol, get_memory
from app.services.chatbot.object_persona_loader import get_object_persona
from app.services.chatbot.persona import get_persona, load_persona_by_type
from app.services.chatbot.persona_router import route_question
from app.services.chatbot.prompts import get_system_prompt
from app.services.llm.client import get_llm_client

logger = get_logger(__name__)


class ChatAgent:
    """
    Chat agent using LangGraph for conversation management.

    This is a simplified version. For production, integrate with:
    - LangGraph StateGraph for complex flows
    - LangSmith for monitoring
    - Microsoft AI Foundry for DeepSeek access
    """

    def __init__(self, memory: Optional[ConversationMemoryProtocol] = None) -> None:
        self.memory = memory
        self.persona = get_persona()
        self.system_prompt = get_system_prompt(self.persona)

    async def _get_memory(self) -> ConversationMemoryProtocol:
        """Get or create memory instance."""
        if self.memory is None:
            self.memory = await get_memory()
        return self.memory

    async def chat(self, user_message: str, session_id: str) -> str:
        """
        Send a message and get a response.

        Args:
            user_message: The user's message
            session_id: Session identifier for conversation tracking

        Returns:
            The assistant's response
        """
        # Get memory instance
        memory = await self._get_memory()

        # Add user message to memory
        await memory.add_message(session_id, "user", user_message)

        try:
            llm = await get_llm_client()

            # Build messages
            messages = [{"role": "system", "content": self.system_prompt}]
            history = await memory.get_history(session_id, limit=10)
            messages.extend(history)

            # Get response
            response = await llm.ainvoke(messages)
            assistant_message = response.content

            # Add to memory
            await memory.add_message(session_id, "assistant", assistant_message)

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
        # Get memory instance
        memory = await self._get_memory()

        # Add user message to memory
        await memory.add_message(session_id, "user", user_message)

        try:
            llm = await get_llm_client()

            # Build messages
            messages = [{"role": "system", "content": self.system_prompt}]
            history = await memory.get_history(session_id, limit=10)
            messages.extend(history)

            # Stream response
            full_response = ""
            async for chunk in llm.astream(messages):
                if chunk.content:
                    full_response += chunk.content
                    yield chunk.content

            # Add complete response to memory
            await memory.add_message(session_id, "assistant", full_response)

            logger.info(
                "chat_stream_completed",
                session_id=session_id,
                response_length=len(full_response),
            )

        except Exception as e:
            logger.error("chat_stream_error", session_id=session_id, error=str(e))
            fallback = self._get_fallback_response()
            yield fallback
            await memory.add_message(session_id, "assistant", fallback)

    async def stream_multi_persona_response(
        self, user_message: str, session_id: str, selected_persona: Optional[str] = None
    ) -> AsyncGenerator[dict, None]:
        """
        Stream multi-persona responses in PARALLEL (WhatsApp group style).

        All personas stream simultaneously for faster total response time.

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
        # Get memory instance
        memory = await self._get_memory()

        # Add user message to memory
        await memory.add_message(session_id, "user", user_message)

        try:
            # Use LLM router to determine which persona(s) should respond
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

            # Queue to collect chunks from all persona streams
            chunk_queue: asyncio.Queue[dict] = asyncio.Queue()

            # Track responses for memory
            persona_responses_text: dict[str, str] = {p: "" for p in relevant_personas}

            async def stream_persona(persona_type: str) -> None:
                """Stream a single persona's response to the queue."""
                try:
                    # Send typing indicator
                    await chunk_queue.put({"type": "typing", "persona": persona_type, "content": ""})

                    # Load persona-specific prompt
                    persona_content = load_persona_by_type(persona_type)
                    persona_prompt = get_system_prompt(persona_content)

                    # Get LLM
                    llm = await get_llm_client()

                    # Build messages with persona-specific system prompt
                    messages = [{"role": "system", "content": persona_prompt}]
                    history = await memory.get_history(session_id, limit=10)
                    messages.extend(history)

                    # Stream response
                    async for chunk in llm.astream(messages):
                        if chunk.content:
                            persona_responses_text[persona_type] += chunk.content
                            await chunk_queue.put({
                                "type": "stream",
                                "persona": persona_type,
                                "content": chunk.content,
                            })

                    # Mark done
                    await chunk_queue.put({"type": "done", "persona": persona_type, "content": ""})

                    logger.info(
                        "persona_response_completed",
                        session_id=session_id,
                        persona=persona_type,
                        length=len(persona_responses_text[persona_type]),
                    )

                except Exception as e:
                    logger.error(
                        "persona_stream_error",
                        session_id=session_id,
                        persona=persona_type,
                        error=str(e),
                    )
                    # Send error as done
                    await chunk_queue.put({"type": "done", "persona": persona_type, "content": ""})

            # Start all persona streams concurrently
            tasks = [asyncio.create_task(stream_persona(p)) for p in relevant_personas]

            # Track completed personas
            completed_count = 0
            total_personas = len(relevant_personas)

            # Yield chunks as they arrive until all personas complete
            while completed_count < total_personas:
                try:
                    # Wait for next chunk with timeout
                    chunk = await asyncio.wait_for(chunk_queue.get(), timeout=60.0)
                    yield chunk

                    # Track completions
                    if chunk["type"] == "done":
                        completed_count += 1

                except asyncio.TimeoutError:
                    logger.warning("multi_persona_stream_timeout", session_id=session_id)
                    break

            # Wait for all tasks to finish (cleanup)
            await asyncio.gather(*tasks, return_exceptions=True)

            # Build combined response for memory
            full_combined_response = ""
            for persona_type in relevant_personas:
                persona_label = persona_type.capitalize()
                full_combined_response += f"[{persona_label}]: {persona_responses_text[persona_type]}\n\n"

            # Add combined response to memory
            await memory.add_message(session_id, "assistant", full_combined_response.strip())

            logger.info(
                "multi_persona_stream_completed",
                session_id=session_id,
                total_personas=total_personas,
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
            await memory.add_message(session_id, "assistant", fallback)

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
        # Get memory instance
        memory = await self._get_memory()

        # Add user message to memory with object context
        await memory.add_message(session_id, "user", f"[To {object_title}]: {user_message}")

        try:
            # Send typing indicator
            yield {"type": "typing", "object_id": object_id, "content": ""}

            # Load object-specific persona
            object_persona = get_object_persona(object_id, object_title)

            # Build system prompt for this object
            object_system_prompt = self._build_object_system_prompt(object_persona, object_title)

            # Get LLM
            llm = await get_llm_client()

            # Build messages with object persona system prompt
            messages = [{"role": "system", "content": object_system_prompt}]
            history = await memory.get_history(session_id, limit=10)
            messages.extend(history)

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
            await memory.add_message(
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
            await memory.add_message(session_id, "assistant", f"[{object_title}]: {fallback}")

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

    async def clear_history(self, session_id: str) -> None:
        """Clear conversation history for a session."""
        memory = await self._get_memory()
        await memory.clear(session_id)
