from fastapi import APIRouter, Depends, HTTPException, Request, status, Response
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
import models, schemas, security
from database import get_db
from dependencies import get_current_user
import secrets

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Ez az email cím már regisztrálva van.")
    
    from passlib.context import CryptContext
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    hashed_password = pwd_context.hash(user.password)
    
    user_count = db.query(models.User).count()
    assigned_role = "admin" if user_count == 0 else "user"
    
    new_user = models.User(
        email=user.email,
        hashed_password=hashed_password,
        name=user.name,
        phone=user.phone,
        role=assigned_role
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/login")
def login(response: Response, form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # Hozzáadtuk a security. prefixet a metódusokhoz
    user = security.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=400, detail="Helytelen adatok")

    access_token = security.create_access_token(data={"sub": user.email})
    
    response.set_cookie(
        key="access_token",
        value=f"Bearer {access_token}",
        httponly=True,
        secure=False, # Lokális gépen False, éles szerveren (HTTPS) True kell legyen!
        samesite="lax",
        max_age=1800
    )
    return {"message": "Sikeres bejelentkezés"}

@router.post("/logout")
def logout(response: Response):
    response.delete_cookie(key="access_token")
    return {"message": "Sikeres kijelentkezés"}

def get_token_from_cookie(request: Request):
    token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(status_code=401, detail="Nincs hitelesítve")
    return token.replace("Bearer ", "")

@router.get("/me", response_model=schemas.UserResponse)
def get_my_profile(current_user: models.User = Depends(get_current_user)):
    return current_user

@router.put("/me")
def update_profile(user_update: schemas.UserUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    from passlib.context import CryptContext
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

    if user_update.name is not None:
        current_user.name = user_update.name
    if user_update.email is not None:
        current_user.email = user_update.email
    if user_update.phone is not None:
        current_user.phone = user_update.phone
    if user_update.password:
        current_user.hashed_password = pwd_context.hash(user_update.password)
        
    db.commit()
    return {"detail": "Profil sikeresen frissítve."}

@router.delete("/me")
def delete_profile(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db.delete(current_user)
    db.commit()
    return {"detail": "Fiók sikeresen törölve."}