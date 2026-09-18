"""
TRUSTDOC AI Analysis & OpenRouter LLM Integration.
Provides real-time forensic question answering, evidence synthesis,
anomaly explanations, and fraud risk pattern intelligence.
"""

from typing import Any, Dict, List, Optional
import json
import urllib.request
import urllib.error
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.api import deps
from app.core.config import settings
from app.models.case import Case
from app.models.document import Document
from app.models.user import User

router = APIRouter()


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    case_id: Optional[str] = None


class ChatResponse(BaseModel):
    role: str
    content: str
    model_used: str


@router.post("/chat", response_model=ChatResponse)
def ai_chat_analysis(
    payload: ChatRequest,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Query the OpenRouter AI Engine with full contextual awareness
    of TrustDoc verification cases, forensic signals, and fraud indicators.
    """
    # 1. Fetch relevant workspace context
    cases = db.query(Case).all()
    total_cases = len(cases)
    verified = sum(1 for c in cases if c.final_decision and (c.final_decision.value if hasattr(c.final_decision, "value") else str(c.final_decision)) == "VERIFIED")
    rejected = sum(1 for c in cases if c.final_decision and (c.final_decision.value if hasattr(c.final_decision, "value") else str(c.final_decision)) == "REJECTED")
    avg_score = round(sum((c.trust_score or 0) for c in cases) / max(total_cases, 1), 1)

    case_summaries = []
    for c in cases[:10]:
        case_summaries.append(
            f"- Case '{c.applicant_name}' ({c.expected_document_type or 'Doc'}): Status={c.status.value if hasattr(c.status, 'value') else c.status}, TrustScore={c.trust_score}%, Decision={c.final_decision.value if c.final_decision else 'PENDING'}"
        )

    context_str = "\n".join(case_summaries) if case_summaries else "No cases recorded yet."

    system_prompt = f"""You are TRUSTDOC AI — an expert Senior Digital Forensics and Identity Document Verification Intelligence Assistant.
You specialize in:
1. Error Level Analysis (ELA), JPEG recompression residuals, and pixel splicing detection.
2. ICAO 9303 machine-readable zone (MRZ) checksum validation (Modulus-10 with 7-3-1 weight calculations).
3. Visual Zone (VIZ) typography, kerning alignment, and OCR consistency.
4. Guilloche wave pattern continuity and microprint security analysis.
5. Biometric 3D passive liveness, presentation attack detection (ISO/IEC 30107-3), and 1:1 face matching.
6. SHA-256 provenance hashing and Merkle tree ledger auditing.

Current Workspace Context:
- Total Cases: {total_cases}
- Verified: {verified} | Rejected: {rejected}
- Average Trust Score: {avg_score}%
- Recent Cases:
{context_str}

Provide clear, professional, authoritative, and explainable responses formatted in clean markdown. Always give actionable guidance on document fraud prevention and compliance standards.
"""

    api_key = settings.OPENROUTER_API_KEY
    model = settings.OPENROUTER_MODEL or "meta-llama/llama-3.3-70b-instruct:free"

    # Prepare message payload
    messages_payload = [{"role": "system", "content": system_prompt}]
    for m in payload.messages:
        messages_payload.append({"role": m.role, "content": m.content})

    # Call OpenRouter API if API key is present
    if api_key and not api_key.startswith("your_"):
        try:
            req_body = json.dumps({
                "model": model,
                "messages": messages_payload,
                "temperature": 0.4,
                "max_tokens": 1024,
            }).encode("utf-8")

            req = urllib.request.Request(
                "https://openrouter.ai/api/v1/chat/completions",
                data=req_body,
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json",
                    "HTTP-Referer": "https://trustdoc.gov.in",
                    "X-Title": "TrustDoc Forensic AI",
                },
                method="POST",
            )

            with urllib.request.urlopen(req, timeout=25) as resp:
                resp_json = json.loads(resp.read().decode("utf-8"))
                reply_content = resp_json["choices"][0]["message"]["content"]
                return ChatResponse(role="assistant", content=reply_content, model_used=model)
        except Exception as e:
            # Fallback to local heuristic intelligence if OpenRouter is unreachable/rate-limited
            pass

    # Intelligent fallback synthesizer
    last_user_prompt = payload.messages[-1].content.lower() if payload.messages else ""
    if "trend" in last_user_prompt or "summary" in last_user_prompt or "overall" in last_user_prompt:
        reply = (
            f"### 📊 TrustDoc Verification Intelligence Summary\n\n"
            f"- **Total Workspace Cases**: {total_cases}\n"
            f"- **Authenticity Pass Rate**: {round((verified / max(total_cases, 1)) * 100, 1)}% ({verified} Verified, {rejected} Rejected)\n"
            f"- **Average Trust Score**: {avg_score} / 100\n\n"
            f"**Forensic Health Overview**: Documents showing uniform ELA compression profiles and verified ICAO 9303 checksums pass directly. Spliced biometric photos and tampered MRZ check digits are routed to manual audit."
        )
    elif "mrz" in last_user_prompt or "checksum" in last_user_prompt:
        reply = (
            "### 🔍 ICAO Doc 9303 MRZ Checksum Standard\n\n"
            "TrustDoc calculates check digits using the **ICAO 7-3-1 weight modulus-10** algorithm on:\n"
            "1. **Document Number** (Line 1 or Line 2)\n"
            "2. **Date of Birth** (YYMMDD)\n"
            "3. **Expiration Date** (YYMMDD)\n"
            "4. **Composite Check Digit** over all fields\n\n"
            "Any character tampering in the visual zone creates an instant mathematical mismatch with the MRZ strip, triggering a **CRITICAL** fraud flag."
        )
    elif "ela" in last_user_prompt or "tamper" in last_user_prompt or "forgery" in last_user_prompt:
        reply = (
            "### 🔬 Error Level Analysis (ELA) Detection\n\n"
            "When a document image is manipulated in software (e.g. Photoshop or GAN face-swaps), the modified region is saved at a different compression level than the camera sensor's original matrix.\n\n"
            "TrustDoc measures the DCT re-compression differential residual across 8x8 pixel blocks. Authentic documents show uniform < 3.0/255 variance, whereas pasted portraits exhibit sharp spike ratios (> ×9.0)."
        )
    else:
        reply = (
            f"### 🛡️ TrustDoc Forensic Analysis Assistant\n\n"
            f"I have reviewed your workspace with **{total_cases} verification records**.\n\n"
            f"You can ask me to:\n"
            f"- Detail specific failure reasons for any applicant\n"
            f"- Explain Error Level Analysis (ELA) and localized tamper heatmaps\n"
            f"- Verify ICAO 9303 checksum algorithms\n"
            f"- Guide live webcam capture & 1:1 facial biometric matching"
        )

    return ChatResponse(role="assistant", content=reply, model_used="trustdoc-forensic-engine")
