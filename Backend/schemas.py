from pydantic import BaseModel, EmailStr, ConfigDict
from datetime import datetime
from typing import Optional, List
from models import RoleEnum, DifficultyEnum
    
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
    
class UserBase(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    role: RoleEnum
    profile_picture: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ClassSessionBase(BaseModel):
    name: str
    difficulty: DifficultyEnum
    start_time: datetime
    end_time: datetime
    max_capacity: int
    location: str
    description: Optional[str] = None

class ClassSessionCreate(ClassSessionBase):
    pass

class ClassSessionResponse(ClassSessionBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class BookingBase(BaseModel):
    class_session_id: int

class BookingCreate(BookingBase):
    pass

class BookingResponse(BookingBase):
    id: int
    user_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
