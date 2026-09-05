from pydantic import BaseModel
from typing import Optional, Union
from uuid import UUID
from datetime import datetime
from app.models.document import DocumentType

class DocumentResponse(BaseModel):
    id: Union[UUID, str]
    case_id: Union[UUID, str]
    file_name: str
    mime_type: str
    file_size: int
    file_hash: str
    document_type: DocumentType
    country: Optional[str] = None
    confidence: Optional[float] = None
    created_at: datetime

    class Config:
        from_attributes = True
