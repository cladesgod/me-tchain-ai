"""
Contact Information Endpoint

Provides contact information.
"""

from fastapi import APIRouter
from pydantic import BaseModel

from app.core.config import settings
from app.core.logging import get_logger

router = APIRouter()
logger = get_logger(__name__)


class ContactInfo(BaseModel):
    """Contact information schema."""

    email: str
    linkedin: str
    github: str
    website: str


@router.get("", response_model=ContactInfo)
async def get_contact_info() -> ContactInfo:
    """
    Get contact information.

    Returns links to email, LinkedIn, GitHub, and website.
    """
    logger.info("contact_info_requested")

    return ContactInfo(
        email=settings.CONTACT_EMAIL,
        linkedin="https://www.linkedin.com/in/timuçin-utkan-602504167/",
        github="https://github.com/cladesgod",
        website="https://tchain.ai",
    )
