import asyncio
from datetime import datetime, timedelta
from database import SessionLocal
from models import ClassSession
from email_service import send_reminder_email

async def run_reminder_scheduler():
    while True:
        db = SessionLocal()
        try:
            now = datetime.utcnow()
            
            # Azokat az órákat keresi, amelyek 23:45 és 24:15 perc múlva kezdődnek (24h ± 15 perc)
            window_start = now + timedelta(hours=23, minutes=45)
            window_end   = now + timedelta(hours=24, minutes=15)
            upcoming_classes = db.query(ClassSession).filter(
                ClassSession.start_time >= window_start,
                ClassSession.start_time <= window_end,
                ClassSession.reminder_sent == False
            ).all()

            for c in upcoming_classes:
                for booking in c.bookings:
                    # Csak a profillal rendelkezőknek (van user és email)
                    if booking.user and booking.user.email:
                        try:
                            send_reminder_email(
                                to_email=booking.user.email,
                                class_name=c.name,
                                start_time=c.start_time,
                                location=c.location
                            )
                        except Exception as e:
                            print(f"Nem sikerült emlékeztetőt küldeni {booking.user.email} címre: {e}")
                
                c.reminder_sent = True
                db.commit()
                print(f"Emlékeztetők kiküldve a {c.name} órához ({c.start_time}).")

        except Exception as e:
            print(f"Hiba a schedulerben: {e}")
        finally:
            db.close()
        
        # 15 percenként ellenőriz
        await asyncio.sleep(15 * 60)
