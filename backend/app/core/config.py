"""
Application Configuration

Uses Pydantic Settings for type-safe configuration management.
"""

from functools import lru_cache
from typing import List

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    # General
    ENVIRONMENT: str = "development"
    DEBUG: bool = True

    # API
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000
    API_V1_PREFIX: str = "/api/v1"

    # CORS - stored as comma-separated string
    ALLOWED_ORIGINS: str = "http://localhost:5173,http://localhost:3000"

    @property
    def allowed_origins_list(self) -> List[str]:
        """Get ALLOWED_ORIGINS as a list."""
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",")]

    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./data/app.db"

    # LLM - Azure AI Foundry / DeepSeek
    AZURE_AI_ENDPOINT: str = ""
    AZURE_AI_CREDENTIAL: str = ""  # API key
    AZURE_API_VERSION: str = "2024-12-01-preview"
    DEEPSEEK_MODEL_NAME: str = "DeepSeek-R1-0528"
    DEEPSEEK_DEPLOYMENT_NAME: str = "DeepSeek-R1-0528"

    # LangSmith (optional)
    LANGCHAIN_TRACING_V2: bool = True
    LANGCHAIN_API_KEY: str = ""
    LANGCHAIN_PROJECT: str = "me-tchain-ai"

    # Contact
    CONTACT_EMAIL: str = "timucinutkan@gmail.com"

    @property
    def is_production(self) -> bool:
        """Check if running in production."""
        return self.ENVIRONMENT == "production"


@lru_cache
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()


settings = get_settings()
