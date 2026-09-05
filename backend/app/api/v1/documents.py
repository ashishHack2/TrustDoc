import hashlib
import os
from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session
from app.api import deps
from app.models.case import Case, CaseStatus
from app.models.document import Document, DocumentType
from app.models.user import User, RoleEnum
from app.schemas.document import DocumentResponse
from app.core.config import settings
import uuid

router = APIRouter()

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".pdf"}

def get_file_extension(filename: str) -> str:
    _, ext = os.path.splitext(filename)
    return ext.lower()

@router.post("/cases/{case_id}/documents", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
async def upload_document(
    case_id: str,
    file: UploadFile = File(...),
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Upload a new document for a verification case.
    """
    # 1. Check case exists and permissions
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
        
    if current_user.role not in [RoleEnum.ADMIN, RoleEnum.OPERATOR] and case.operator_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions to upload to this case")

    # 2. File Validation
    ext = get_file_extension(file.filename)
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"Unsupported file extension. Allowed: {ALLOWED_EXTENSIONS}")
        
    # Read file content for hashing and size check
    content = await file.read()
    file_size = len(content)
    
    if file_size > settings.MAX_UPLOAD_SIZE:
        raise HTTPException(status_code=400, detail=f"File too large. Max size is {settings.MAX_UPLOAD_SIZE} bytes.")
        
    file_hash = hashlib.sha256(content).hexdigest()
    
    # 3. Store file locally (with MinIO compatibility)
    upload_dir = os.path.join(settings.LOCAL_STORAGE_DIR, case_id)
    os.makedirs(upload_dir, exist_ok=True)
    storage_key = os.path.join(upload_dir, f"{uuid.uuid4()}{ext}")
    with open(storage_key, "wb") as f:
        f.write(content)
    
    # 4. Save to Database
    document = Document(
        case_id=case.id,
        file_name=file.filename,
        mime_type=file.content_type,
        file_size=file_size,
        file_hash=file_hash,
        storage_key=storage_key,
        document_type=DocumentType.UNKNOWN
    )
    db.add(document)
    
    # 5. Automatically execute the multi-layer Verification Pipeline
    from app.services.verification_engine import VerificationEngine
    from app.api.v1.verification import _VERIFICATION_CACHE
    from app.models.case import DecisionStatus
    
    ver_res = VerificationEngine.run_pipeline(
        case_id=case.id,
        applicant_name=case.applicant_name,
        doc_type=case.expected_document_type or "Passport",
        file_path=storage_key,
        file_hash=file_hash
    )
    
    case.status = CaseStatus.COMPLETED
    case.trust_score = ver_res["trust_score"]
    case.risk_level = ver_res["risk_level"]
    case.final_decision = DecisionStatus(ver_res["final_decision"])
    
    ver_res["id"] = str(uuid.uuid4())
    _VERIFICATION_CACHE[case.id] = ver_res
    
    db.add(case)
    db.commit()
    db.refresh(document)
    
    return document

@router.get("/cases/{case_id}/documents", response_model=List[DocumentResponse])
def get_case_documents(
    case_id: str,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Get all documents for a case.
    """
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
        
    if current_user.role not in [RoleEnum.ADMIN, RoleEnum.AUDITOR, RoleEnum.REVIEWER] and case.operator_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
        
    documents = db.query(Document).filter(Document.case_id == case_id).all()
    return documents
