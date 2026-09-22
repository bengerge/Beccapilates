from database import engine; from sqlalchemy import text;
with engine.begin() as conn:
    conn.execute(text('ALTER TABLE class_sessions ADD COLUMN reminder_sent BOOLEAN DEFAULT FALSE'))
