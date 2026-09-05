from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api import deps
from app.models.case import Case, CaseStatus
from app.models.user import User, RoleEnum
from app.schemas.case import CaseCreate, CaseResponse

router = APIRouter()

@router.post("", response_model=CaseResponse, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=CaseResponse, status_code=status.HTTP_201_CREATED)
def create_case(
    *,
    db: Session = Depends(deps.get_db),
    case_in: CaseCreate,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Create new verification case.
    """
    if current_user.role not in [RoleEnum.ADMIN, RoleEnum.OPERATOR]:
        raise HTTPException(
            status_code=403, detail="Not enough permissions to create a case"
        )
        
    case = Case(
        applicant_name=case_in.applicant_name,
        operator_id=current_user.id,
        reference_number=case_in.reference_number,
        expected_document_type=case_in.expected_document_type,
        status=CaseStatus.PENDING,
    )
    db.add(case)
    db.commit()
    db.refresh(case)
    return case

@router.get("", response_model=List[CaseResponse])
@router.get("/", response_model=List[CaseResponse])
def read_cases(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Retrieve cases.
    """
    if current_user.role in [RoleEnum.ADMIN, RoleEnum.AUDITOR]:
        cases = db.query(Case).offset(skip).limit(limit).all()
    else:
        cases = db.query(Case).filter(Case.operator_id == current_user.id).offset(skip).limit(limit).all()
    return cases

@router.get("/{id}", response_model=CaseResponse)
def read_case(
    *,
    db: Session = Depends(deps.get_db),
    id: str,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Get case by ID.
    """
    case = db.query(Case).filter(Case.id == id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    # Check permissions
    if (
        current_user.role not in [RoleEnum.ADMIN, RoleEnum.AUDITOR, RoleEnum.REVIEWER]
        and case.operator_id != current_user.id
    ):
        raise HTTPException(status_code=403, detail="Not enough permissions")
        
    return case
