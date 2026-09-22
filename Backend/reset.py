from database import SessionLocal; from models import ClassSession; db = SessionLocal(); db.query(ClassSession).update({ClassSession.reminder_sent: False}); db.commit();
