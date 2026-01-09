"""
Pytest Configuration and Fixtures

Shared fixtures for all tests.
"""

import pytest
from fastapi.testclient import TestClient
from httpx import AsyncClient

from app.main import app


@pytest.fixture
def client() -> TestClient:
    """Synchronous test client."""
    return TestClient(app)


@pytest.fixture
async def async_client() -> AsyncClient:
    """Asynchronous test client."""
    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac


@pytest.fixture
def mock_llm_response():
    """Mock LLM response for testing."""
    return "Merhaba! Ben Timuçin'in AI asistanıyım. Size nasıl yardımcı olabilirim?"
