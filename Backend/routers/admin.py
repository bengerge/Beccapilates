from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List

import models, schemas
from database import get_db
from dependencies import get_current_admin_user

router = APIRouter(prefix="/admin", tags=["Admin"])

@router.post("/classes", response_model=schemas.ClassSessionResponse, status_code=status.HTTP_201_CREATED)
def create_class_session(
    class_session: schemas.ClassSessionCreate, 
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(get_current_admin_user)
):
    new_class = models.ClassSession(**class_session.model_dump())
    db.add(new_class)
    db.commit()
    db.refresh(new_class)
    return new_class