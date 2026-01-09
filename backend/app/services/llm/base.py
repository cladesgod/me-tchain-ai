"""
Base LLM Interface

Abstract base class for LLM providers.
"""

from abc import ABC, abstractmethod
from typing import Any, AsyncGenerator, Dict, List


class BaseLLM(ABC):
    """Abstract base class for LLM clients."""

    @abstractmethod
    async def invoke(self, messages: List[Dict[str, str]]) -> str:
        """
        Send messages and get a response.

        Args:
            messages: List of message dicts with 'role' and 'content'

        Returns:
            The assistant's response
        """
        pass

    @abstractmethod
    async def stream(
        self, messages: List[Dict[str, str]]
    ) -> AsyncGenerator[str, None]:
        """
        Stream a response chunk by chunk.

        Args:
            messages: List of message dicts

        Yields:
            Response chunks
        """
        pass

    @abstractmethod
    def get_config(self) -> Dict[str, Any]:
        """Get current configuration."""
        pass
