from sqlalchemy import Column, String, ForeignKey, Enum, Float
from sqlalchemy.orm import relationship
import enum
from app.core.database import Base
from app.models.base import UUIDMixin, TimestampMixin

class CaseStatus(str, enum.Enum):
    PENDING = "PENDING"
    PROCESSING = "PROCESSING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"

class DecisionStatus(str, enum.Enum):
    VERIFIED = "VERIFIED"
    SUSPICIOUS = "SUSPICIOUS"
    REJECTED = "REJECTED"
    MANUAL_REVIEW = "MANUAL_REVIEW"

class Case(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "cases"

    applicant_name = Column(String(255), nullable=False)
    operator_id = Column(ForeignKey("users.id"), nullable=False)
    reference_number = Column(String(255), nullable=True, index=True)
    expected_document_type = Column(String(100), nullable=True)
    
    status = Column(Enum(CaseStatus), default=CaseStatus.PENDING, nullable=False)
    
    # Final Results
    trust_score = Column(Float, nullable=True)
    risk_level = Column(String(50), nullable=True)
    final_decision = Column(Enum(DecisionStatus), nullable=True)

    operator = relationship("User", backref="cases")
    documents = relationship("Document", back_populates="case", cascade="all, delete")
