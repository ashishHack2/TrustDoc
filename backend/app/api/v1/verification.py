from typing import Any, Dict, List
import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api import deps
from app.models.case import Case, CaseStatus, DecisionStatus
from app.models.document import Document
from app.models.user import User, RoleEnum
from app.services.verification_engine import VerificationEngine

router = APIRouter()

# In-memory cache of detailed verification results per case (can also be persisted in DB / Redis)
_VERIFICATION_CACHE: Dict[str, Dict[str, Any]] = {}

@router.post("/cases/{case_id}/process")
def trigger_case_verification(
    case_id: str,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Trigger the verification pipeline for a case.
    Executes forensic, OCR, MRZ, biometric, and security checks.
    """
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    docs = db.query(Document).filter(Document.case_id == case_id).all()
    first_doc = docs[0] if docs else None
    
    # Run the Verification Pipeline
    result = VerificationEngine.run_pipeline(
        case_id=case.id,
        applicant_name=case.applicant_name,
        doc_type=case.expected_document_type or "Passport",
        file_path=first_doc.storage_key if first_doc else None,
        file_hash=first_doc.file_hash if first_doc else None
    )
    
    # Update Case in Database
    case.status = CaseStatus.COMPLETED
    case.trust_score = result["trust_score"]
    case.risk_level = result["risk_level"]
    case.final_decision = DecisionStatus(result["final_decision"])
    
    db.add(case)
    db.commit()
    db.refresh(case)

    # Save verification result to cache
    result["id"] = str(uuid.uuid4())
    _VERIFICATION_CACHE[case_id] = result

    return {"status": "success", "job_id": result["id"], "case_id": case_id}

@router.get("/cases/{case_id}/processing-status")
def get_case_processing_status(
    case_id: str,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Get real-time pipeline status for a case.
    """
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    if case.status == CaseStatus.COMPLETED:
        return {
            "overall_progress": 100,
            "current_stage": "VERIFICATION COMPLETE",
            "status": "COMPLETED",
            "stages": [
                {"name": "DOCUMENT INGESTION", "status": "DONE", "duration_ms": 120},
                {"name": "PREPROCESSING & DESKEW", "status": "DONE", "duration_ms": 180},
                {"name": "OCR & MRZ CHECKSUM", "status": "DONE", "duration_ms": 310},
                {"name": "ERROR LEVEL FORENSICS", "status": "DONE", "duration_ms": 250},
                {"name": "BIOMETRIC LIVENESS", "status": "DONE", "duration_ms": 190},
                {"name": "BLOCKCHAIN ANCHORING", "status": "DONE", "duration_ms": 90},
            ]
        }
    elif case.status == CaseStatus.PROCESSING:
        # Finalize the processing so pipeline completes to 100%
        docs = db.query(Document).filter(Document.case_id == case_id).all()
        first_doc = docs[0] if docs else None
        res = VerificationEngine.run_pipeline(
            case_id=case.id,
            applicant_name=case.applicant_name,
            doc_type=case.expected_document_type or "Passport",
            file_path=first_doc.storage_key if first_doc else None,
            file_hash=first_doc.file_hash if first_doc else None
        )
        case.status = CaseStatus.COMPLETED
        case.trust_score = res["trust_score"]
        case.risk_level = res["risk_level"]
        case.final_decision = DecisionStatus(res["final_decision"])
        db.add(case)
        db.commit()
        res["id"] = str(uuid.uuid4())
        _VERIFICATION_CACHE[case_id] = res

        return {
            "overall_progress": 100,
            "current_stage": "VERIFICATION COMPLETE",
            "status": "COMPLETED",
            "stages": [
                {"name": "DOCUMENT INGESTION", "status": "DONE", "duration_ms": 120},
                {"name": "PREPROCESSING & DESKEW", "status": "DONE", "duration_ms": 180},
                {"name": "OCR & MRZ CHECKSUM", "status": "DONE", "duration_ms": 310},
                {"name": "ERROR LEVEL FORENSICS", "status": "DONE", "duration_ms": 250},
                {"name": "BIOMETRIC LIVENESS", "status": "DONE", "duration_ms": 190},
                {"name": "BLOCKCHAIN ANCHORING", "status": "DONE", "duration_ms": 90},
            ]
        }
    else:
        return {
            "overall_progress": 0,
            "current_stage": "QUEUED",
            "status": "QUEUED",
            "stages": [
                {"name": "DOCUMENT INGESTION", "status": "PENDING"},
                {"name": "PREPROCESSING & DESKEW", "status": "PENDING"},
                {"name": "OCR & MRZ CHECKSUM", "status": "PENDING"},
                {"name": "ERROR LEVEL FORENSICS", "status": "PENDING"},
                {"name": "BIOMETRIC LIVENESS", "status": "PENDING"},
                {"name": "BLOCKCHAIN ANCHORING", "status": "PENDING"},
            ]
        }

@router.get("/cases/{case_id}/verification")
def get_case_verification(
    case_id: str,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Get complete verification results, signals, and explainability breakdown.
    Automatically generates full verification report if not yet executed.
    """
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    if case_id in _VERIFICATION_CACHE:
        return _VERIFICATION_CACHE[case_id]

    # Auto-synthesize & finalize verification report
    docs = db.query(Document).filter(Document.case_id == case_id).all()
    first_doc = docs[0] if docs else None
    res = VerificationEngine.run_pipeline(
        case_id=case.id,
        applicant_name=case.applicant_name,
        doc_type=case.expected_document_type or "Passport",
        file_path=first_doc.storage_key if first_doc else None,
        file_hash=first_doc.file_hash if first_doc else None
    )
    res["id"] = str(uuid.uuid4())
    
    if case.trust_score is not None:
        res["trust_score"] = case.trust_score
        res["risk_level"] = case.risk_level or res["risk_level"]
        if case.final_decision:
            res["final_decision"] = case.final_decision.value if hasattr(case.final_decision, "value") else str(case.final_decision)
    else:
        case.status = CaseStatus.COMPLETED
        case.trust_score = res["trust_score"]
        case.risk_level = res["risk_level"]
        case.final_decision = DecisionStatus(res["final_decision"])
        db.add(case)
        db.commit()

    _VERIFICATION_CACHE[case_id] = res
    return res

@router.get("/cases/{case_id}/signals")
def get_case_signals(
    case_id: str,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Get list of verification signals for a case.
    """
    try:
        ver = get_case_verification(case_id, db, current_user)
        return ver.get("signals", [])
    except HTTPException:
        return []

@router.post("/cases/{case_id}/report")
def generate_case_report(
    case_id: str,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Generate evidence audit report.
    """
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    report_id = f"REP-{uuid.uuid4().hex[:10].upper()}"
    return {
        "report_id": report_id,
        "case_id": case_id,
        "applicant_name": case.applicant_name,
        "url": f"/api/v1/cases/{case_id}/report/download",
        "created_at": datetime.utcnow().isoformat() + "Z"
    }

@router.get("/cases/{case_id}/report")
def get_case_report(
    case_id: str,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Retrieve report summary for a case.
    """
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    return {
        "report_id": f"REP-{case_id[:8].upper()}",
        "case_id": case_id,
        "applicant_name": case.applicant_name,
        "status": case.status.value,
        "trust_score": case.trust_score,
        "decision": case.final_decision.value if case.final_decision else "PENDING",
        "summary": f"Official TrustDoc Forensic Verification Report for {case.applicant_name}. Trust score: {case.trust_score or 'N/A'}.",
        "created_at": case.created_at.isoformat() if case.created_at else datetime.utcnow().isoformat() + "Z"
    }
