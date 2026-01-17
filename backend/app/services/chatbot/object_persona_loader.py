"""
Object Persona Loader

Loads persona content for Career Game timeline objects.
Each object (project, thesis, education, etc.) speaks in first person about itself.
"""

import re
from pathlib import Path
from typing import Optional

from app.core.logging import get_logger

logger = get_logger(__name__)

# Objects persona directory
OBJECTS_DIR = Path(__file__).parent.parent.parent.parent / "data" / "objects"

# Valid object_id pattern: alphanumeric, underscore, hyphen only
VALID_OBJECT_ID_PATTERN = re.compile(r"^[a-zA-Z0-9_-]+$")


def validate_object_id(object_id: str) -> bool:
    """
    Validate object_id to prevent path traversal attacks.

    Args:
        object_id: The object ID to validate

    Returns:
        True if valid, False otherwise
    """
    if not object_id or not VALID_OBJECT_ID_PATTERN.match(object_id):
        return False

    # Additional check: ensure no path components
    if ".." in object_id or "/" in object_id or "\\" in object_id:
        return False

    return True


def load_object_persona(object_id: str) -> Optional[str]:
    """
    Load persona content for a specific timeline object.

    Args:
        object_id: The objectPersonaId from careerTimeline.ts (e.g., 'project_apa_citation')

    Returns:
        Persona content as string, or None if not found or invalid
    """
    # Security: Validate object_id to prevent path traversal
    if not validate_object_id(object_id):
        logger.warning("invalid_object_id_rejected", object_id=object_id)
        return None

    persona_file = OBJECTS_DIR / f"{object_id}.md"

    # Security: Double-check resolved path is within OBJECTS_DIR
    try:
        resolved_path = persona_file.resolve()
        objects_dir_resolved = OBJECTS_DIR.resolve()
        if not str(resolved_path).startswith(str(objects_dir_resolved)):
            logger.error("path_traversal_attempt_blocked", object_id=object_id)
            return None
    except (OSError, ValueError) as e:
        logger.error("path_resolution_error", object_id=object_id, error=str(e))
        return None

    try:
        if persona_file.exists():
            content = persona_file.read_text(encoding="utf-8")
            logger.info("object_persona_loaded", object_id=object_id, path=str(persona_file))
            return content
        else:
            logger.warning("object_persona_not_found", object_id=object_id, path=str(persona_file))
            return None
    except Exception as e:
        logger.error("object_persona_load_error", object_id=object_id, error=str(e))
        return None


def list_available_objects() -> list[str]:
    """
    List all available object persona IDs.

    Returns:
        List of object IDs (filenames without .md extension)
    """
    if not OBJECTS_DIR.exists():
        logger.warning("objects_directory_not_found", path=str(OBJECTS_DIR))
        return []

    objects = [f.stem for f in OBJECTS_DIR.glob("*.md")]
    logger.debug("available_objects_listed", count=len(objects), objects=objects)
    return objects


def get_default_object_persona(object_id: str, object_title: str = "Unknown Object") -> str:
    """
    Return a default persona for objects without a dedicated persona file.

    Args:
        object_id: The object ID
        object_title: Display title for the object

    Returns:
        Default persona content
    """
    return f"""
# Object: {object_title}

I am part of Timuçin's career journey!

## About Me

I'm {object_title}, and while I don't have a detailed story yet, I'm an important part of Timuçin's professional timeline.

Feel free to ask me general questions about Timuçin's career, and I'll do my best to help!

## Contact

For more details about me, you can reach Timuçin directly:
- **LinkedIn:** linkedin.com/in/timucinutkan
- **Email:** timucinutkan@gmail.com

---

**Language:** I respond in the same language you write in (English or Turkish).
"""


class ObjectPersonaManager:
    """
    Manages loading and caching of object personas.
    """

    def __init__(self) -> None:
        self._cache: dict[str, str] = {}

    def get_persona(self, object_id: str, object_title: str = "Unknown Object") -> str:
        """
        Get persona content for an object, with caching.

        Args:
            object_id: The object ID
            object_title: Display title for fallback

        Returns:
            Persona content string
        """
        if object_id in self._cache:
            return self._cache[object_id]

        content = load_object_persona(object_id)

        if content is None:
            content = get_default_object_persona(object_id, object_title)
            logger.info("using_default_object_persona", object_id=object_id)

        self._cache[object_id] = content
        return content

    def clear_cache(self) -> None:
        """Clear the persona cache."""
        self._cache.clear()
        logger.info("object_persona_cache_cleared")

    def reload_persona(self, object_id: str, object_title: str = "Unknown Object") -> str:
        """Force reload a specific object persona."""
        if object_id in self._cache:
            del self._cache[object_id]
        return self.get_persona(object_id, object_title)


# Global instance
object_persona_manager = ObjectPersonaManager()


def get_object_persona(object_id: str, object_title: str = "Unknown Object") -> str:
    """
    Convenience function to get an object persona.

    Args:
        object_id: The object ID (e.g., 'project_apa_citation')
        object_title: Display title for fallback

    Returns:
        Persona content string
    """
    return object_persona_manager.get_persona(object_id, object_title)
