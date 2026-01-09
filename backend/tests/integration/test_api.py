"""Integration tests for API endpoints."""

import pytest
from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


class TestHealthEndpoint:
    """Test health check endpoint."""

    def test_health_check(self):
        """Test that health endpoint returns healthy status."""
        response = client.get("/api/v1/health")

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "version" in data


class TestContactEndpoint:
    """Test contact info endpoint."""

    def test_get_contact_info(self):
        """Test that contact endpoint returns contact information."""
        response = client.get("/api/v1/contact")

        assert response.status_code == 200
        data = response.json()
        assert "email" in data
        assert "linkedin" in data
        assert "github" in data
        assert "website" in data
        assert data["email"] == "timucinutkan@gmail.com"
