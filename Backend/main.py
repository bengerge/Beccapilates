from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from database import engine, get_db
import models
from routers import auth, admin, bookings, classes
from fastapi.middleware.cors import CORSMiddleware

models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Becca Pilates API",
    description="API backend a Becca Pilates weboldalhoz",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(admin.router)
app.include_router(bookings.router)
app.include_router(classes.router)

@app.get("/")
async def root():
    return {"message": "A Becca Pilates API fut, és az adatbázis csatlakoztatva!"}

@app.get("/health", tags=["System"])
def health_check(db: Session = Depends(get_db)):
    return {"status": "ok", "database": "connected"}