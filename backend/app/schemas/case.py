from pydantic import BaseModel, field_validator
from typing import Optional, List, Union
from uuid import UUID
from datetime import datetime
from app.models.case import CaseStatus, DecisionStatus

class CaseCreate(BaseModel):
    applicant_name: str
    reference_number: Optional[str] = None
    expected_document_type: Optional[str] = None

    @field_validator("applicant_name")
    @classmethod
    def name_must_not_be_blank(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("applicant_name must not be empty")
        if len(v) > 120:
            raise ValueError("applicant_name too long")
        return v

    @field_validator("reference_number", "expected_document_type")
    @classmethod
    def strip_optional(cls, v: Optional[str]) -> Optional[str]:
        return v.strip() if isinstance(v, str) else v

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
