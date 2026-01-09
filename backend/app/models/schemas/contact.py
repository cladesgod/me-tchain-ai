"""Contact information schemas."""

from pydantic import BaseModel


class ContactInfo(BaseModel):
    """Contact information schema."""

    email: str
    linkedin: str
    github: str
    website: str
