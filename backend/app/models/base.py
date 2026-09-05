import uuid
from datetime import datetime
from sqlalchemy import Column, DateTime, String
from app.core.database import Base

class TimestampMixin:
    """Mixin that adds created_at and updated_at columns."""
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

class UUIDMixin:
    """Mixin that adds a UUID primary key compatible across SQLite and PostgreSQL."""
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
