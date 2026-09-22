from database import engine; from sqlalchemy import text;
with engine.connect() as conn:
    result = conn.execute(text('DESCRIBE class_sessions'))
    print([row for row in result])
