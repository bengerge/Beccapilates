from fastapi import Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from jose import jwt, JWTError

import models, security
from database import get_db

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

def get_token_from_cookie(request: Request):
    token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Nincs hitelesítve (Hiányzó süti)",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return token.replace("Bearer ", "")

def get_current_user(token: str = Depends(get_token_from_cookie), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Érvénytelen hitelesítési adatok",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        # A payload dekódolásához a security.py-ban lévő kulcsot használjuk
        payload = jwt.decode(token, security.SECRET_KEY, algorithms=[security.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
        
    user = db.query(models.User).filter(models.User.email == email).first()
    if user is None:
        raise credentials_exception
    return user

def get_current_admin_user(current_user: models.User = Depends(get_current_user)):
    if current_user.role != models.RoleEnum.admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Nincs megfelelő jogosultságod ehhez a művelethez (csak admin)"
        )
    return current_user