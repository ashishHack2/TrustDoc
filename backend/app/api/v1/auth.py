from datetime import timedelta
from typing import Optional
from fastapi import APIRouter, Body, Depends, HTTPException, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.api import deps
from app.core import security
from app.core.config import settings
from app.models.user import User, RoleEnum
from app.schemas.user import Token, UserResponse, UserCreate

router = APIRouter()

@router.post("/login", response_model=Token)
async def login_access_token(
    request: Request,
    db: Session = Depends(deps.get_db),
) -> dict:
    """
    OAuth2 compatible token login supporting both application/json and form-urlencoded.
    """
    username = None
    password = None

    # Check for JSON request body
    content_type = request.headers.get("content-type", "").lower()
    if "application/json" in content_type:
        try:
            body = await request.json()
            username = body.get("username") or body.get("email")
            password = body.get("password")
        except Exception:
            pass

    # Fallback to form data
    if not username or not password:
        try:
            form = await request.form()
            username = form.get("username") or form.get("email")
            password = form.get("password")
        except Exception:
            pass

    if not username or not password:
        raise HTTPException(
            status_code=400, 
            detail="Username (or email) and password are required."
        )

    user = db.query(User).filter(User.email == str(username).strip()).first()
    if not user or not security.verify_password(str(password), user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    elif not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user account")
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    refresh_token_expires = timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    
    return {
        "access_token": security.create_access_token(
            user.id, user.role.value, expires_delta=access_token_expires
        ),
        "refresh_token": security.create_refresh_token(
            user.id, user.role.value, expires_delta=refresh_token_expires
        ),
        "token_type": "bearer",
        "role": user.role
    }

@router.post("/setup-admin", response_model=UserResponse)
def create_admin(
    user_in: UserCreate,
    db: Session = Depends(deps.get_db)
):
    user = db.query(User).filter(User.email == user_in.email).first()
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system.",
        )
    user = User(
        email=user_in.email,
        hashed_password=security.get_password_hash(user_in.password),
        full_name=user_in.full_name,
        role=RoleEnum.ADMIN,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user
