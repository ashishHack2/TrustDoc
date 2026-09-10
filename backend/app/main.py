import logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.core.database import engine, Base, SessionLocal
from app.models.user import User, RoleEnum
from app.models.case import Case, CaseStatus, DecisionStatus
from app.models.document import Document
from app.core import security

# Setup logging
logging.basicConfig(
    level=settings.LOG_LEVEL,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger("trustdoc")

def init_db():
    """Auto-create tables and seed demo admin user & cases."""
    try:
        Base.metadata.create_all(bind=engine)
        db = SessionLocal()
        try:
            admin_email = "admin@trustdoc.gov.in"
            admin = db.query(User).filter(User.email == admin_email).first()
            if not admin:
                admin = User(
                    email=admin_email,
                    hashed_password=security.get_password_hash("TrustDoc2026!"),
                    full_name="Chief Verification Officer",
                    role=RoleEnum.ADMIN,
                    is_active=True
                )
                db.add(admin)
                db.commit()
                db.refresh(admin)
                logger.info(f"Initialized demo administrator: {admin_email}")

                # Seed sample cases for reviewer demonstration
                c1 = Case(
                    applicant_name="Rajesh Kumar Sharma",
                    operator_id=admin.id,
                    reference_number="DOC-2026-IND-0812",
                    expected_document_type="Passport",
                    status=CaseStatus.COMPLETED,
                    trust_score=94.5,
                    risk_level="LOW",
                    final_decision=DecisionStatus.VERIFIED
                )
                c2 = Case(
                    applicant_name="Elena Rostova",
                    operator_id=admin.id,
                    reference_number="DOC-2026-EU-9411",
                    expected_document_type="National ID",
                    status=CaseStatus.COMPLETED,
                    trust_score=71.2,
                    risk_level="MEDIUM",
                    final_decision=DecisionStatus.SUSPICIOUS
                )
                c3 = Case(
                    applicant_name="Aarav Patel",
                    operator_id=admin.id,
                    reference_number="DOC-2026-IND-3301",
                    expected_document_type="Driving Licence",
                    status=CaseStatus.PENDING,
                    trust_score=None,
                    risk_level=None,
                    final_decision=None
                )
                db.add_all([c1, c2, c3])
                db.commit()
                logger.info("Seeded initial demo verification cases.")
        finally:
            db.close()
    except Exception as e:
        logger.error(f"Error during startup initialization: {e}")

# Run immediate table initialization
init_db()

app = FastAPI(
    title="TRUSTDOC API",
    description="AI-powered identity-document verification and forensic analysis platform",
    version="1.0.0",
)

# Robust CORS middleware configuration
origins = settings.CORS_ORIGINS
if isinstance(origins, str):
    if origins.strip() == "*":
        allow_origins = ["*"]
        allow_credentials = False
    else:
        allow_origins = [o.strip() for o in origins.split(",") if o.strip()]
        allow_credentials = True
elif isinstance(origins, list):
    if "*" in origins:
        allow_origins = ["*"]
        allow_credentials = False
    else:
        allow_origins = origins
        allow_credentials = True
else:
    allow_origins = ["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:5173"]
    allow_credentials = True

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=allow_credentials,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    init_db()

@app.get("/", tags=["Health"])
async def root():
    return {
        "status": "ok",
        "service": "TRUSTDOC Forensics API",
        "version": "1.0.0",
        "docs": "/docs",
        "redoc": "/redoc"
    }

@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "ok", "service": "TRUSTDOC API", "version": "1.0.0"}

@app.get("/ready", tags=["Health"])
async def readiness_check():
    return {"status": "ready"}

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": {
                "code": "INTERNAL_ERROR",
                "message": "An unexpected error occurred."
            }
        }
    )

from app.api.v1.router import api_router
app.include_router(api_router, prefix="/api/v1")
