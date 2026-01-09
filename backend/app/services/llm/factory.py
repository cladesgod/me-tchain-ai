"""
LLM Factory

Factory pattern for creating LLM clients.
"""

from typing import Literal, Optional

from app.services.llm.base import BaseLLM
from app.services.llm.deepseek import DeepSeekClient


def create_llm(
    provider: Literal["deepseek"] = "deepseek",
    **kwargs,
) -> BaseLLM:
    """
    Create an LLM client instance.

    Args:
        provider: LLM provider name
        **kwargs: Provider-specific configuration

    Returns:
        LLM client instance

    Raises:
        ValueError: If provider is not supported
    """
    if provider == "deepseek":
        return DeepSeekClient(**kwargs)

    raise ValueError(f"Unsupported LLM provider: {provider}")
