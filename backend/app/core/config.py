from typing import List, Optional, Union
from pydantic_settings import BaseSettings
from pydantic import field_validator

class Settings(BaseSettings):
    # Database (Default to SQLite for instant local dev, PostgreSQL when configured)
    DATABASE_URL: str = "sqlite:///./trustdoc.db"
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # Celery
    CELERY_BROKER_URL: str = "redis://localhost:6379/0"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/0"

    # JWT Authentication
    JWT_SECRET: str = "trustdoc_super_secret_jwt_key_for_development_only_2026"
    JWT_REFRESH_SECRET: str = "trustdoc_super_secret_refresh_key_for_development_only_2026"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 120
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Storage (Local fallback when MinIO is offline)
    MINIO_ENDPOINT: str = "localhost:9000"
    MINIO_ACCESS_KEY: str = "trustdoc"
    MINIO_SECRET_KEY: str = "trustdoc123"
    MINIO_BUCKET: str = "trustdoc-evidence"
    MINIO_SECURE: bool = False
    LOCAL_STORAGE_DIR: str = "./storage"
    
    # App Settings
    DEMO_MODE: bool = True
    MAX_UPLOAD_SIZE: int = 10485760 # 10 MB
    CORS_ORIGINS: Union[List[str], str] = ["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:5173"]
    LOG_LEVEL: str = "INFO"

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str):
            clean = v.strip().strip('"').strip("'")
            if not clean:
                return ["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:5173"]
            if clean == "*":
                return ["*"]
            if clean.startswith("[") and clean.endswith("]"):
                import json
                try:
                    return json.loads(clean)
                except Exception:
                    pass
            return [x.strip().strip('"').strip("'") for x in clean.split(",") if x.strip()]
        elif isinstance(v, (list, tuple)):
            return [str(x) for x in v]
        return ["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:5173"]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"

settings = Settings()
