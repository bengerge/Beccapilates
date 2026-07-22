from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from pydantic import BaseModel
from schemas import ExternalBookingCreate
from datetime import datetime

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
    bookings = db.query(models.Booking, models.User)\
                .outerjoin(models.User, models.Booking.user_id == models.User.id)\
                .filter(models.Booking.class_session_id == class_id)\
                .all()
                
    result = []
    
    for booking, user in bookings: 
        if user:
            result.append({
                "booking_id": booking.id,
                "name": user.name or "Nincs megadva",
                "email": user.email,
                "phone": user.phone or "Nincs megadva"
            })
        else:
            result.append({
                "booking_id": booking.id,
                "name": booking.guest_name or "Külsős vendég",
                "email": None,
                "phone": None
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

@router.post("/external")
def create_external_booking(
    booking_data: ExternalBookingCreate, 
    db: Session = Depends(get_db)
):
    db_class = db.query(models.ClassSession).filter(models.ClassSession.id == booking_data.class_id).first()
    
    if not db_class:
        raise HTTPException(status_code=404, detail="Az óra nem található.")
        
    current_bookings = db.query(models.Booking).filter(models.Booking.class_session_id == booking_data.class_id).count()
    
    if current_bookings >= db_class.max_capacity:
        raise HTTPException(status_code=400, detail="Az óra létszáma már betelt.")

    new_booking = models.Booking(
        class_session_id=booking_data.class_id, 
        user_id=None,
        guest_name=booking_data.guest_name
    )
    
    db.add(new_booking)
    
    if hasattr(db_class, 'current_bookings'):
        db_class.current_bookings += 1
        
    db.commit()
    db.refresh(new_booking)
    
    return {"message": "Külsős vendég rögzítve.", "booking_id": new_booking.id}

@router.get("/locations", response_model=List[schemas.LocationResponse])
def get_locations(db: Session = Depends(get_db)):
    return db.query(models.Location).all()

@router.post("/locations", response_model=schemas.LocationResponse, status_code=status.HTTP_201_CREATED)
def create_location(location_data: schemas.LocationCreate, db: Session = Depends(get_db), admin_user: models.User = Depends(verify_admin)):
    existing = db.query(models.Location).filter(models.Location.name == location_data.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Ez a helyszín már létezik.")
    new_location = models.Location(name=location_data.name)
    db.add(new_location)
    db.commit()
    db.refresh(new_location)
    return new_location

@router.delete("/locations/{location_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_location(location_id: int, db: Session = Depends(get_db), admin_user: models.User = Depends(verify_admin)):
    location = db.query(models.Location).filter(models.Location.id == location_id).first()
    if not location:
        raise HTTPException(status_code=404, detail="A helyszín nem található.")
    db.delete(location)
    db.commit()
    return None

@router.get("/difficulties", response_model=List[schemas.DifficultyLevelResponse])
def get_difficulties(db: Session = Depends(get_db)):
    return db.query(models.DifficultyLevel).all()

@router.post("/difficulties", response_model=schemas.DifficultyLevelResponse, status_code=status.HTTP_201_CREATED)
def create_difficulty(difficulty_data: schemas.DifficultyLevelCreate, db: Session = Depends(get_db), admin_user: models.User = Depends(verify_admin)):
    existing = db.query(models.DifficultyLevel).filter(models.DifficultyLevel.name == difficulty_data.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Ez a nehézségi szint már létezik.")
    new_difficulty = models.DifficultyLevel(name=difficulty_data.name)
    db.add(new_difficulty)
    db.commit()
    db.refresh(new_difficulty)
    return new_difficulty

@router.delete("/difficulties/{difficulty_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_difficulty(difficulty_id: int, db: Session = Depends(get_db), admin_user: models.User = Depends(verify_admin)):
    difficulty = db.query(models.DifficultyLevel).filter(models.DifficultyLevel.id == difficulty_id).first()
    if not difficulty:
        raise HTTPException(status_code=404, detail="A nehézségi szint nem található.")
    db.delete(difficulty)
    db.commit()
    return None