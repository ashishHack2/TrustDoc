from celery import Celery
from app.core.config import settings

celery_app = Celery(
    "trustdoc_workers",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
)

@celery_app.task(name="process_document")
def process_document_task(document_id: str):
    """
    Background task to orchestrate the AI analysis pipeline.
    UPLOAD -> PREPROCESS -> OCR -> MRZ -> CONSISTENCY -> FORENSICS -> DECISION -> EVIDENCE
    """
    print(f"Starting processing for document {document_id}")
    # TODO: Implement the AI pipeline steps here
    # 1. Fetch document from DB
    # 2. Download file from MinIO
    # 3. Call AI Providers
    # 4. Save results to DB
    # 5. Generate final evidence
    return {"status": "success", "document_id": document_id}
