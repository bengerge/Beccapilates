from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from pydantic import BaseModel

import models
import schemas
from database import get_db
from dependencies import get_current_user

router = APIRouter(prefix="/admin", tags=["Admin"])

class RoleUpdate(BaseModel):
    role: str

def verify_admin(current_user: models.User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Nincs adminisztrátori jogosultságod."
        )
    return current_user

@router.get("/classes")
def get_all_classes(db: Session = Depends(get_db), admin_user: models.User = Depends(verify_admin)):
    classes = db.query(models.ClassSession).all()
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

@router.post("/classes", response_model=schemas.ClassSessionResponse, status_code=status.HTTP_201_CREATED)
def create_class(class_data: schemas.ClassSessionCreate, db: Session = Depends(get_db), admin_user: models.User = Depends(verify_admin)):
    new_class = models.ClassSession(**class_data.dict())
    db.add(new_class)
    db.commit()
    db.refresh(new_class)
    return new_class

@router.put("/classes/{class_id}")
def update_class(class_id: int, class_data: Dict[str, Any], db: Session = Depends(get_db), admin_user: models.User = Depends(verify_admin)):
    class_session = db.query(models.ClassSession).filter(models.ClassSession.id == class_id).first()
    if not class_session:
        raise HTTPException(status_code=404, detail="Az óra nem található.")
    
    for key, value in class_data.items():
        setattr(class_session, key, value)
        
    db.commit()
    return {"detail": "Sikeres módosítás"}

@router.delete("/classes/{class_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_class(class_id: int, db: Session = Depends(get_db), admin_user: models.User = Depends(verify_admin)):
    class_session = db.query(models.ClassSession).filter(models.ClassSession.id == class_id).first()
    if not class_session:
        raise HTTPException(status_code=404, detail="Az óra nem található.")
    
    db.delete(class_session)
    db.commit()
    return None

@router.get("/classes/{class_id}/attendees")
def get_class_attendees(class_id: int, db: Session = Depends(get_db), admin_user: models.User = Depends(verify_admin)):
    bookings = db.query(models.Booking).filter(models.Booking.class_session_id == class_id).all()
    result = []
    for b in bookings:
        user = db.query(models.User).filter(models.User.id == b.user_id).first()
        if user:
            result.append({
                "booking_id": b.id,
                "name": user.name or "Nincs megadva",
                "email": user.email,
                "phone": user.phone or "Nincs megadva"
            })
    return result

@router.delete("/bookings/{booking_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_booking(booking_id: int, db: Session = Depends(get_db), admin_user: models.User = Depends(verify_admin)):
    booking = db.query(models.Booking).filter(models.Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="A foglalás nem található.")
    
    db.delete(booking)
    db.commit()
    return None

@router.get("/users", response_model=List[schemas.UserResponse])
def get_all_users(db: Session = Depends(get_db), admin_user: models.User = Depends(verify_admin)):
    return db.query(models.User).all()

@router.put("/users/{user_id}/role")
def update_user_role(user_id: int, role_data: RoleUpdate, db: Session = Depends(get_db), admin_user: models.User = Depends(verify_admin)):
    if role_data.role not in ["admin", "user"]:
        raise HTTPException(status_code=400, detail="Érvénytelen jogosultság.")
        
    user_to_update = db.query(models.User).filter(models.User.id == user_id).first()
    if not user_to_update:
        raise HTTPException(status_code=404, detail="Felhasználó nem található.")
        
    user_to_update.role = role_data.role
    db.commit()
    return {"detail": "Jogosultság sikeresen módosítva."}