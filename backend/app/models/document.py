from sqlalchemy import Column, String, ForeignKey, Integer, Enum, Float
from sqlalchemy.orm import relationship
import enum
from app.core.database import Base
from app.models.base import UUIDMixin, TimestampMixin

class DocumentType(str, enum.Enum):
    PASSPORT = "passport"
    NATIONAL_ID = "national_id"
    DRIVING_LICENCE = "driving_licence"
    VISA = "visa"
    UNKNOWN = "unknown"

class Document(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "documents"

    case_id = Column(ForeignKey("cases.id"), nullable=False, index=True)
    
    file_name = Column(String(255), nullable=False)
    mime_type = Column(String(100), nullable=False)
    file_size = Column(Integer, nullable=False)
    file_hash = Column(String(64), nullable=False, index=True) # SHA-256
    storage_key = Column(String(500), nullable=False) # MinIO path
    
    document_type = Column(Enum(DocumentType), default=DocumentType.UNKNOWN)
    country = Column(String(50), nullable=True)
    confidence = Column(Float, nullable=True)
    
    # Store different processed versions
    processed_storage_key = Column(String(500), nullable=True)
    ocr_storage_key = Column(String(500), nullable=True)
    forensic_storage_key = Column(String(500), nullable=True)

    case = relationship("Case", back_populates="documents")
