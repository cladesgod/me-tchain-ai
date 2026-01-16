"""
LLM-Based Persona Router

Routes user questions to the appropriate persona(s) using LLM intelligence.
Replaces keyword-based PersonaClassifier with intelligent routing.
"""

from typing import Literal, Optional

from langchain_core.output_parsers import PydanticOutputParser
from pydantic import BaseModel, Field

from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)

# Persona type
PersonaType = Literal["engineer", "researcher", "speaker", "educator"]


class PersonaResponse(BaseModel):
    """Single persona response decision."""

    persona: PersonaType
    order: int = Field(description="Speaking order (1-4)")
    reasoning: str = Field(description="Why this persona should respond")


class RouterDecision(BaseModel):
    """Router LLM decision output."""

    personas: list[PersonaResponse] = Field(description="List of personas that should respond, in order")


class PersonaRouter:
    """
    LLM-based router for multi-persona chat.

    Uses an LLM to intelligently decide which persona(s) should respond
    to a user question and in what order they should speak.
    """

    ROUTER_SYSTEM_PROMPT = """You are a routing assistant for a WhatsApp-style group chat with 4 personas representing different aspects of Kazım Timuçin Utkan:

1. **Engineer** - Technical projects, code, LangChain, FastAPI, system architecture, RAG pipelines, ML engineering
2. **Researcher** - PhD research on LLM agent autonomy, academic publications, research methodologies
3. **Speaker** - Conference talks, public speaking, presentations, AI ethics and philosophy
4. **Educator** - Teaching at İstinye University, courses (Intelligent Agents, Machine Learning, Game AI), student projects

Given a user question, decide:
- Which persona(s) should respond (1-4 personas)
- In what order they should speak (if multiple)

Guidelines:
- General questions ("who are you?", "tell me about yourself") → all 4 personas respond
- Technical project questions ("tell me about X project", "how did you build Y") → Engineer
- Research/academic questions ("what's your PhD about?", "tell me about your research") → Researcher
- Speaking/presentation questions ("where have you spoken?", "tell me about your talks") → Speaker
- Teaching/course questions ("what do you teach?", "tell me about your students") → Educator
- Career journey questions ("how did you get into AI?") → Engineer + Researcher (both relevant)
- Hybrid questions (e.g., "tell me about your work at MLPCare") → multiple relevant personas

If multiple personas should respond, order them by relevance (most relevant first).

Output your decision in JSON format with the structure provided."""

    def __init__(self) -> None:
        """Initialize the router."""
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
                    temperature=0.3,  # Lower temp for more consistent routing decisions
                    streaming=False,  # No streaming needed for routing
                )
                logger.info("router_llm_initialized", provider="azure_ai_foundry")
            except Exception as e:
                logger.error("router_llm_initialization_failed", error=str(e))
                raise

        return self._llm

    async def route(self, question: str, history: Optional[list] = None) -> list[PersonaResponse]:
        """
        Use LLM to decide which persona(s) should respond and in what order.

        Args:
            question: User's question
            history: Optional conversation history for context (not currently used)

        Returns:
            List of PersonaResponse objects, sorted by speaking order
        """
        try:
            # Create LLM with structured output
            llm = await self._get_llm()
            parser = PydanticOutputParser(pydantic_object=RouterDecision)

            # Build prompt
            format_instructions = parser.get_format_instructions()
            system_content = f"{self.ROUTER_SYSTEM_PROMPT}\n\n{format_instructions}"

            messages = [
                {"role": "system", "content": system_content},
                {"role": "user", "content": f"User question: {question}"},
            ]

            # Get routing decision
            response = await llm.ainvoke(messages)
            decision = parser.parse(response.content)

            # Sort by order and return
            sorted_personas = sorted(decision.personas, key=lambda x: x.order)

            logger.info(
                "llm_routing_decision",
                question_length=len(question),
                personas=[p.persona for p in sorted_personas],
                count=len(sorted_personas),
            )

            return sorted_personas

        except Exception as e:
            logger.error("llm_routing_error", error=str(e), question_length=len(question))
            # Fallback: return engineer persona
            logger.info("llm_routing_fallback", fallback_to="engineer")
            return [PersonaResponse(persona="engineer", order=1, reasoning="Fallback due to routing error")]


# Global router instance
router = PersonaRouter()


async def route_question(question: str, history: Optional[list] = None) -> list[PersonaResponse]:
    """
    Route a question to determine which persona(s) should respond.

    Args:
        question: The user's question
        history: Optional conversation history for context

    Returns:
        List of PersonaResponse objects with persona and order info
    """
    return await router.route(question, history)
