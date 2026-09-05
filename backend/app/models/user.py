from sqlalchemy import Column, String, Boolean, Enum
import enum
from app.core.database import Base
from app.models.base import UUIDMixin, TimestampMixin

class RoleEnum(str, enum.Enum):
    ADMIN = "ADMIN"
    OPERATOR = "OPERATOR"
    REVIEWER = "REVIEWER"
    AUDITOR = "AUDITOR"

class User(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "users"

    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(Enum(RoleEnum), default=RoleEnum.OPERATOR, nullable=False)
    is_active = Column(Boolean, default=True)
