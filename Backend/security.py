from datetime import datetime, timedelta
import secrets
from typing import Optional
from jose import jwt
import bcrypt
from dotenv import load_dotenv
from sqlalchemy.orm import Session
import models

load_dotenv()

# Dinamikus kulcs generálása minden induláskor
SECRET_KEY = secrets.token_urlsafe(32)

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(
        plain_password.encode('utf-8'),
        hashed_password.encode('utf-8')
    )

def get_password_hash(password: str) -> str:
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# --- EZ A FÜGGVÉNY HIÁNYZOTT ---
def authenticate_user(db: Session, email: str, password: str):
    # Megkeressük a felhasználót az adatbázisban az email (username) alapján
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        return False
        
    # Ellenőrizzük a jelszót a te bcrypt verify_password függvényeddel
    if not verify_password(password, user.hashed_password):
        return False
        
    # Ha minden stimmel, visszaadjuk a felhasználó objektumot
    return user