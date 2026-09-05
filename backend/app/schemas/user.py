from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Union
from uuid import UUID
from datetime import datetime
from app.models.user import RoleEnum

class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: RoleEnum = RoleEnum.OPERATOR
    is_active: bool = True

class UserCreate(UserBase):
    password: str = Field(..., min_length=8)

class UserResponse(UserBase):
    id: Union[UUID, str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    role: RoleEnum

class TokenPayload(BaseModel):
    sub: Optional[str] = None
    role: Optional[RoleEnum] = None
