import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

load_dotenv()

SMTP_EMAIL = os.getenv("SMTP_EMAIL", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587

def send_reset_password_email(to_email: str, reset_link: str):
    if not SMTP_EMAIL or not SMTP_PASSWORD:
        print("Warning: SMTP credentials are not set in environment.")
        print(f"Would have sent reset link: {reset_link} to {to_email}")
        return

    msg = MIMEMultipart()
    msg['From'] = SMTP_EMAIL
    msg['To'] = to_email
    msg['Subject'] = "BeccaPilates - Jelszó visszaállítása"

    body = f"""\
    <html>
      <body style="font-family: Arial, sans-serif; color: #333;">
        <h2>Kedves Felhasználó!</h2>
        <p>Kaptunk egy kérést a jelszavad visszaállítására a BeccaPilates fiókodhoz.</p>
        <p>Kérlek, kattints az alábbi linkre az új jelszavad beállításához (a link 15 percig érvényes):</p>
        <p><a href="{reset_link}" style="background-color: #2196f3; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;">Jelszó visszaállítása</a></p>
        <p><small>Vagy másold be ezt a linket a böngésződbe: <br> {reset_link}</small></p>
        <p>Ha nem te kérted a jelszó visszaállítását, kérlek hagyd figyelmen kívül ezt az e-mailt.</p>
        <br>
        <p>Üdvözlettel,<br>BeccaPilates csapat</p>
      </body>
    </html>
    """
    
    msg.attach(MIMEText(body, 'html'))

    try:
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(SMTP_EMAIL, SMTP_PASSWORD)
        server.send_message(msg)
        server.quit()
        print(f"Reset email successfully sent to {to_email}")
    except Exception as e:
        print(f"Failed to send email to {to_email}: {e}")
