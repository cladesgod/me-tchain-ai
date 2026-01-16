"""
Persona Management

Loads and manages the chatbot persona from markdown files.
"""

from pathlib import Path
from typing import Optional

from app.core.logging import get_logger

logger = get_logger(__name__)

# Default persona path
PERSONA_PATH = Path(__file__).parent.parent.parent.parent / "data" / "persona.md"
PERSONAS_DIR = Path(__file__).parent.parent.parent.parent / "data" / "personas"


class PersonaLoader:
    """Load and manage chatbot persona."""

    def __init__(self, persona_path: Optional[Path] = None) -> None:
        self.persona_path = persona_path or PERSONA_PATH
        self._persona_content: Optional[str] = None

    def load(self) -> str:
        """Load persona from markdown file."""
        if self._persona_content is not None:
            return self._persona_content

        try:
            if self.persona_path.exists():
                self._persona_content = self.persona_path.read_text(encoding="utf-8")
                logger.info("persona_loaded", path=str(self.persona_path))
            else:
                self._persona_content = self._get_default_persona()
                logger.warning(
                    "persona_file_not_found",
                    path=str(self.persona_path),
                    using="default",
                )
        except Exception as e:
            logger.error("persona_load_error", error=str(e))
            self._persona_content = self._get_default_persona()

        return self._persona_content

    def reload(self) -> str:
        """Force reload persona from file."""
        self._persona_content = None
        return self.load()

    def _get_default_persona(self) -> str:
        """Return default persona if file not found."""
        return """
# Timuçin Persona

## Temel Bilgiler
- İsim: Kazım Timuçin Utkan
- Unvan: AI Research Engineer
- Lokasyon: İstanbul, Türkiye
- Email: timucinutkan@gmail.com

## Profesyonel Kimlik
Ben bir yapay zeka araştırma mühendisiyim. İstanbul Teknik Üniversitesi'nde
Endüstri Mühendisliği doktorası yapıyorum. Araştırma alanım LLM agent'larının
otonomisi üzerine.

## Uzmanlık Alanları
- Large Language Models (LLM)
- LangChain, LangGraph, LangSmith
- Machine Learning & Deep Learning
- FastAPI, Python
- NLP ve Conversational AI

## Projeler
1. APA 7 Citation Helper - GPT Store'da 50K+ kullanıcı
2. Automated ECTS Transfer System
3. AI-Powered Exam Grading Pipeline

## Konuşma Tonu
Profesyonel ama sıcak. Birinci tekil şahıs kullanıyorum.
Türkçe ve İngilizce konuşabilirim.

## Yönlendirmeler
Bilmediğim konularda LinkedIn veya email'e yönlendiriyorum:
- LinkedIn: linkedin.com/in/timucinutkan
- Email: timucinutkan@gmail.com
"""


# Global persona loader instance
persona_loader = PersonaLoader()


def get_persona() -> str:
    """Get the loaded persona content."""
    return persona_loader.load()


def load_persona_by_type(persona_type: str) -> str:
    """
    Load a specific persona file by type.

    Args:
        persona_type: One of 'engineer', 'researcher', 'speaker', 'educator'

    Returns:
        Persona content as string

    Raises:
        FileNotFoundError: If persona file doesn't exist
    """
    persona_file = PERSONAS_DIR / f"{persona_type}.md"

    try:
        if persona_file.exists():
            content = persona_file.read_text(encoding="utf-8")
            logger.info("persona_loaded_by_type", type=persona_type, path=str(persona_file))
            return content
        else:
            logger.error("persona_file_not_found", type=persona_type, path=str(persona_file))
            # Fallback to default persona
            return persona_loader.load()
    except Exception as e:
        logger.error("persona_load_by_type_error", type=persona_type, error=str(e))
        # Fallback to default persona
        return persona_loader.load()
