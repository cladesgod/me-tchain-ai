"""
⚠️ DEPRECATED: Persona Classification Service

This module uses keyword-based classification and is deprecated.
Use PersonaRouter (persona_router.py) instead for LLM-based intelligent routing.

Kept for backward compatibility only.

---

Analyzes user questions to determine which persona(s) should respond.
Uses keyword matching with optional LLM enhancement for better accuracy.
"""

from typing import Literal, Optional
from enum import Enum

from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)

# Persona types
PersonaType = Literal["engineer", "researcher", "speaker", "educator"]


class Persona(str, Enum):
    """Enum for persona types."""

    ENGINEER = "engineer"
    RESEARCHER = "researcher"
    SPEAKER = "speaker"
    EDUCATOR = "educator"


class PersonaClassifier:
    """
    Classifies user questions to determine which persona(s) should respond.

    Uses a hybrid approach:
    1. Keyword matching for fast, reliable classification
    2. Optional LLM-based classification for complex queries
    """

    # Keywords associated with each persona
    PERSONA_KEYWORDS = {
        Persona.ENGINEER: [
            # English
            "project",
            "build",
            "code",
            "api",
            "langchain",
            "langgraph",
            "fastapi",
            "docker",
            "deployment",
            "implementation",
            "technical",
            "system",
            "architecture",
            "pipeline",
            "rag",
            "develop",
            "engineering",
            # Turkish
            "proje",
            "kod",
            "geliştir",
            "teknik",
            "sistem",
            "mimari",
        ],
        Persona.RESEARCHER: [
            # English
            "research",
            "phd",
            "doctorate",
            "thesis",
            "paper",
            "publication",
            "academic",
            "study",
            "experiment",
            "methodology",
            "autonomy",
            "agent",
            "finding",
            "analysis",
            # Turkish
            "araştırma",
            "doktora",
            "tez",
            "yayın",
            "makale",
            "akademik",
            "çalışma",
        ],
        Persona.SPEAKER: [
            # English
            "talk",
            "presentation",
            "conference",
            "speak",
            "lecture",
            "speech",
            "event",
            "audience",
            "public",
            "present",
            "keynote",
            # Turkish
            "konuşma",
            "sunum",
            "konferans",
            "etkinlik",
            "dinleyici",
        ],
        Persona.EDUCATOR: [
            # English
            "teach",
            "course",
            "class",
            "student",
            "education",
            "learning",
            "lesson",
            "assignment",
            "university",
            "lecture",
            "professor",
            "instructor",
            # Turkish
            "ders",
            "öğrenci",
            "eğitim",
            "öğretim",
            "üniversite",
            "sınıf",
        ],
    }

    # General question keywords that trigger all personas
    GENERAL_KEYWORDS = [
        # English
        "who are you",
        "about you",
        "tell me about yourself",
        "introduce",
        "background",
        "experience",
        "bio",
        "profile",
        # Turkish
        "kimsin",
        "hakkında",
        "kendini tanıt",
        "deneyim",
        "geçmiş",
    ]

    def __init__(self, use_llm: bool = False) -> None:
        """
        Initialize the classifier.

        Args:
            use_llm: Whether to use LLM for classification (fallback to keywords if False)
        """
        self.use_llm = use_llm
        self._llm = None

    def classify(self, question: str, selected_persona: Optional[str] = None) -> list[PersonaType]:
        """
        Classify a user question to determine which persona(s) should respond.

        Args:
            question: The user's question
            selected_persona: The currently selected persona (fallback if no match)

        Returns:
            List of persona types that should respond (1-4 personas)
        """
        question_lower = question.lower()

        # Check for general questions that all personas should answer
        if self._is_general_question(question_lower):
            logger.info("persona_classification", question_length=len(question), result="all_personas")
            return [Persona.ENGINEER, Persona.RESEARCHER, Persona.SPEAKER, Persona.EDUCATOR]

        # Use keyword-based classification
        personas = self._classify_by_keywords(question_lower)

        # If no match and we have a selected persona, use that
        if not personas and selected_persona:
            personas = [selected_persona]
            logger.info(
                "persona_classification_fallback",
                question_length=len(question),
                fallback_to=selected_persona,
            )
        # If still no match, default to engineer
        elif not personas:
            personas = [Persona.ENGINEER]
            logger.info("persona_classification_default", question_length=len(question))

        logger.info(
            "persona_classification",
            question_length=len(question),
            result=",".join(personas),
        )

        return personas

    def _is_general_question(self, question: str) -> bool:
        """Check if question is general and should trigger all personas."""
        return any(keyword in question for keyword in self.GENERAL_KEYWORDS)

    def _classify_by_keywords(self, question: str) -> list[PersonaType]:
        """
        Classify using keyword matching.

        Returns:
            List of matching personas, sorted by match score
        """
        scores = {persona: 0 for persona in Persona}

        # Count keyword matches for each persona
        for persona, keywords in self.PERSONA_KEYWORDS.items():
            for keyword in keywords:
                if keyword in question:
                    scores[persona] += 1

        # Get personas with matches, sorted by score
        matched_personas = [
            persona for persona, score in sorted(scores.items(), key=lambda x: x[1], reverse=True) if score > 0
        ]

        # Return top 2 personas if multiple matches, or just the top one
        if len(matched_personas) > 2:
            return matched_personas[:2]
        elif matched_personas:
            return matched_personas
        else:
            return []

    async def _classify_by_llm(self, question: str) -> list[PersonaType]:
        """
        Classify using LLM (advanced, optional).

        This is a placeholder for future LLM-based classification.
        Would use a small, fast model to classify questions.
        """
        # TODO: Implement LLM-based classification
        # For now, fallback to keyword classification
        return self._classify_by_keywords(question.lower())


# Global classifier instance
classifier = PersonaClassifier(use_llm=False)


def classify_question(question: str, selected_persona: Optional[str] = None) -> list[PersonaType]:
    """
    Classify a question to determine which persona(s) should respond.

    Args:
        question: The user's question
        selected_persona: Currently selected persona (optional fallback)

    Returns:
        List of persona types that should respond
    """
    return classifier.classify(question, selected_persona)
