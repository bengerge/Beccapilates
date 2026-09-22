import urllib.request
import json
import os
import socket
from pathlib import Path
from dotenv import load_dotenv

# --- IPv6 kikényszerített letiltása (csak IPv4 használata) ---
old_getaddrinfo = socket.getaddrinfo
def new_getaddrinfo(*args, **kwargs):
    responses = old_getaddrinfo(*args, **kwargs)
    return [response for response in responses if response[0] == socket.AF_INET]
socket.getaddrinfo = new_getaddrinfo
# ---------------------------------------------------------------

load_dotenv(Path(__file__).resolve().parent.parent / ".env")

def send_reset_password_email(to_email: str, reset_link: str):
    api_key = os.getenv("RESEND_API_KEY", "")
    
    if not api_key:
        print("Warning: RESEND_API_KEY is not set in environment.")
        print(f"Would have sent reset link: {reset_link} to {to_email}")
        return

    url = "https://api.resend.com/emails"
    
    # A Resend alapértelmezett teszt címe, ha a domain nincs hitelesítve
    sender = "BekkaPilates <onboarding@resend.dev>"

    html_content = f"""
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

    data = {
        "from": sender,
        "to": [to_email],
        "subject": "BeccaPilates - Jelszó visszaállítása",
        "html": html_content
    }

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    }

    req = urllib.request.Request(
        url, 
        data=json.dumps(data).encode("utf-8"), 
        headers=headers, 
        method="POST"
    )

    try:
        with urllib.request.urlopen(req) as response:
            result = response.read().decode("utf-8")
            print(f"Reset email successfully sent via Resend API to {to_email}: {result}")
    except urllib.error.HTTPError as e:
        error_msg = e.read().decode("utf-8")
        print(f"Failed to send email to {to_email} (HTTP Error {e.code}): {error_msg}")
    except Exception as e:
        print(f"Failed to send email to {to_email}: {e}")

def send_reminder_email(to_email: str, class_name: str, start_time, location: str):
    api_key = os.getenv("RESEND_API_KEY", "")
    if not api_key:
        print("Warning: RESEND_API_KEY is not set.")
        return

    url = "https://api.resend.com/emails"
    sender = "BekkaPilates <onboarding@resend.dev>"
    
    # Format the time nicely
    time_str = start_time.strftime("%Y. %m. %d. %H:%M")

    html_content = f"""
    <html>
      <body style="font-family: Arial, sans-serif; color: #333;">
        <h2>Kedves Vendégem!</h2>
        <p>Szeretnélek emlékeztetni, hogy pontosan <b>24 óra múlva</b> kezdődik a lefoglalt Pilates órád!</p>
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <p><b>Óra típusa:</b> {class_name}</p>
            <p><b>Kezdés:</b> {time_str}</p>
            <p><b>Helyszín:</b> {location}</p>
        </div>
        <p>Szeretettel várlak a holnapi órámon , ha nem tudsz jönni kérlek jelezd felém!</p>
        <br>
        <p>Üdvözlettel,<br>Bekka</p>
      </body>
    </html>
    """

    data = {
        "from": sender,
        "to": [to_email],
        "subject": f"Emlékeztető: Holnap {class_name} Pilates óra!",
        "html": html_content
    }

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    }

    req = urllib.request.Request(
        url, 
        data=json.dumps(data).encode("utf-8"), 
        headers=headers, 
        method="POST"
    )

    try:
        with urllib.request.urlopen(req) as response:
            result = response.read().decode("utf-8")
            print(f"Reminder email sent to {to_email}: {result}")
    except Exception as e:
        print(f"Failed to send reminder to {to_email}: {e}")
