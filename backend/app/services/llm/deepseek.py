"""
DeepSeek LLM Client

Client for DeepSeek models via Microsoft AI Foundry.
"""

from typing import Any, AsyncGenerator, Dict, List

from app.core.config import settings
from app.core.logging import get_logger
from app.services.llm.base import BaseLLM

logger = get_logger(__name__)


class DeepSeekClient(BaseLLM):
    """DeepSeek client via Azure AI Foundry."""

    def __init__(
        self,
        endpoint: str = "",
        deployment_name: str = "",
        temperature: float = 0.6,
    ) -> None:
        self.endpoint = endpoint or settings.AZURE_AI_ENDPOINT
        self.deployment_name = deployment_name or settings.DEEPSEEK_DEPLOYMENT_NAME
        self.temperature = temperature
        self._client = None

    async def _get_client(self):
        """Lazy-load the LangChain client."""
        if self._client is None:
            from langchain_openai import AzureChatOpenAI

            self._client = AzureChatOpenAI(
                azure_endpoint=self.endpoint.rstrip("/"),
                azure_deployment=self.deployment_name,
                api_version=settings.AZURE_API_VERSION,
                api_key=settings.AZURE_AI_CREDENTIAL,
                temperature=self.temperature,
                streaming=True,
            )
            logger.info(
                "deepseek_client_initialized",
                endpoint=self.endpoint,
                deployment=self.deployment_name,
            )

        return self._client

    async def invoke(self, messages: List[Dict[str, str]]) -> str:
        """Send messages and get a response."""
        client = await self._get_client()
        response = await client.ainvoke(messages)
        return response.content

    async def stream(
        self, messages: List[Dict[str, str]]
    ) -> AsyncGenerator[str, None]:
        """Stream a response chunk by chunk."""
        client = await self._get_client()
        async for chunk in client.astream(messages):
            if chunk.content:
                yield chunk.content

    def get_config(self) -> Dict[str, Any]:
        """Get current configuration."""
        return {
            "provider": "deepseek",
            "model": settings.DEEPSEEK_MODEL_NAME,
            "endpoint": self.endpoint,
            "deployment_name": self.deployment_name,
            "temperature": self.temperature,
        }
