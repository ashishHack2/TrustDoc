from app.models.base import Base
from app.models.user import User, RoleEnum
from app.models.case import Case, CaseStatus, DecisionStatus
from app.models.document import Document, DocumentType

# This allows alembic to find all models metadata easily
__all__ = [
    "Base",
    "User",
    "RoleEnum",
    "Case",
    "CaseStatus",
    "DecisionStatus",
    "Document",
    "DocumentType"
]
