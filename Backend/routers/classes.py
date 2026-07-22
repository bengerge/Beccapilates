from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
import models
from database import get_db

router = APIRouter(prefix="/classes", tags=["Public Classes"])

@router.get("")
def get_public_classes(db: Session = Depends(get_db)):
    now = datetime.utcnow()
    classes = db.query(models.ClassSession).filter(models.ClassSession.start_time > now).all()
    result = []
    for c in classes:
        current_bookings = db.query(models.Booking).filter(models.Booking.class_session_id == c.id).count()
        result.append({
            "id": c.id,
            "name": c.name,
            "difficulty": c.difficulty.value if hasattr(c.difficulty, 'value') else c.difficulty,
            "start_time": c.start_time.isoformat() if c.start_time else None,
            "end_time": c.end_time.isoformat() if c.end_time else None,
            "location": c.location,
            "max_capacity": c.max_capacity,
            "description": c.description,
            "current_bookings": current_bookings
        })
    return result