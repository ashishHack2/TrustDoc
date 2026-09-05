from fastapi import APIRouter
from app.api.v1 import auth, cases, documents, verification, analytics

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(cases.router, prefix="/cases", tags=["Cases"])
api_router.include_router(documents.router, tags=["Documents"])
api_router.include_router(verification.router, tags=["Verification"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["Analytics"])
