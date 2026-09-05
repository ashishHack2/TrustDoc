from pydantic import BaseModel
from typing import Optional, List, Union
from uuid import UUID
from datetime import datetime
from app.models.case import CaseStatus, DecisionStatus

class CaseCreate(BaseModel):
    applicant_name: str
    reference_number: Optional[str] = None
    expected_document_type: Optional[str] = None

class CaseResponse(BaseModel):
    id: Union[UUID, str]
    applicant_name: str
    operator_id: Union[UUID, str]
    reference_number: Optional[str] = None
    expected_document_type: Optional[str] = None
    status: CaseStatus
    trust_score: Optional[float] = None
    risk_level: Optional[str] = None
    final_decision: Optional[DecisionStatus] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
