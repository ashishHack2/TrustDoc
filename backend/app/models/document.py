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
    SELFIE = "selfie"
    UNKNOWN = "unknown"

# Plain VARCHAR storage (native_enum=False) so new enum values work on both
# SQLite dev databases and existing PostgreSQL deployments without a migration.
_DOCUMENT_TYPE_ENUM = Enum(
    DocumentType,
    values_callable=lambda e: [m.value for m in e],
    native_enum=False,
    length=20,
)

class Document(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "documents"

    case_id = Column(ForeignKey("cases.id"), nullable=False, index=True)
    
    file_name = Column(String(255), nullable=False)
    mime_type = Column(String(100), nullable=False)
    file_size = Column(Integer, nullable=False)
    file_hash = Column(String(64), nullable=False, index=True) # SHA-256
    storage_key = Column(String(500), nullable=False) # MinIO path
    
    document_type = Column(_DOCUMENT_TYPE_ENUM, default=DocumentType.UNKNOWN)
    country = Column(String(50), nullable=True)
    confidence = Column(Float, nullable=True)
    
    # Store different processed versions
    processed_storage_key = Column(String(500), nullable=True)
    ocr_storage_key = Column(String(500), nullable=True)
    forensic_storage_key = Column(String(500), nullable=True)

    case = relationship("Case", back_populates="documents")
