from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import models
from database import get_db
from dependencies import get_current_user

router = APIRouter(prefix="/bookings", tags=["Bookings"])

@router.post("/{class_id}")
def create_booking(
    class_id: int, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(get_current_user)
):
    class_session = db.query(models.ClassSession).filter(models.ClassSession.id == class_id).first()
    
    if not class_session:
        raise HTTPException(status_code=404, detail="Az óra nem található.")
        
    current_bookings = db.query(models.Booking).filter(models.Booking.class_session_id == class_id).count()
    
    if current_bookings >= class_session.max_capacity:
        raise HTTPException(status_code=400, detail="Sajnos ez az óra már betelt.")
        
    existing_booking = db.query(models.Booking).filter(
        models.Booking.class_session_id == class_id,
        models.Booking.user_id == current_user.id
    ).first()
    
    if existing_booking:
        raise HTTPException(status_code=400, detail="Erre az órára már van aktív foglalásod.")
        
    new_booking = models.Booking(user_id=current_user.id, class_session_id=class_id)
    db.add(new_booking)
    db.commit()
    
    return {"detail": "Sikeres foglalás!"}

@router.get("/me")
def get_my_bookings(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    my_bookings = db.query(models.Booking, models.ClassSession)\
        .join(models.ClassSession, models.Booking.class_session_id == models.ClassSession.id)\
        .filter(models.Booking.user_id == current_user.id)\
        .all()
        
    result = []
    for booking, class_session in my_bookings:
        result.append({
            "id": booking.id,
            "class_session_id": class_session.id,
            "class_name": class_session.name,
            "start_time": class_session.start_time.isoformat() if class_session.start_time else None,
            "location": class_session.location
        })
        
    return result

@router.delete("/{booking_id}")
def cancel_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Megkeressük a foglalást, de szigorúan ellenőrizzük, hogy a bejelentkezett felhasználóé-e!
    booking = db.query(models.Booking).filter(
        models.Booking.id == booking_id,
        models.Booking.user_id == current_user.id
    ).first()
    
    if not booking:
        raise HTTPException(status_code=404, detail="Foglalás nem található, vagy nincs jogosultságod a törléshez.")
        
    db.delete(booking)
    db.commit()
    return {"detail": "Foglalás sikeresen lemondva."}

@router.put("/{booking_id}")
def modify_booking(
    booking_id: int, 
    new_class_id: int, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(get_current_user)
):
    booking = db.query(models.Booking).filter(
        models.Booking.id == booking_id, 
        models.Booking.user_id == current_user.id
    ).first()
    
    if not booking:
        raise HTTPException(status_code=404, detail="A foglalás nem található.")

    new_class = db.query(models.ClassSession).filter(models.ClassSession.id == new_class_id).first()
    if not new_class:
        raise HTTPException(status_code=404, detail="A kiválasztott új időpont nem létezik.")

    already_booked = db.query(models.Booking).filter(
        models.Booking.user_id == current_user.id,
        models.Booking.class_session_id == new_class_id
    ).first()

    if already_booked:
        raise HTTPException(
            status_code=400, 
            detail="Erre az órára már van egy érvényes foglalásod, válassz másik időpontot!"
        )

    current_bookings_count = db.query(models.Booking).filter(
        models.Booking.class_session_id == new_class_id
    ).count()
    
    if current_bookings_count >= new_class.max_capacity:
        raise HTTPException(status_code=400, detail="Sajnos az új időpont időközben betelt.")

    booking.class_session_id = new_class_id
    db.commit()
    
    return {"detail": "Sikeres átfoglalás!"}