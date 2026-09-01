import urllib.request
import json
import os
from dotenv import load_dotenv

load_dotenv()

def send_reset_password_email(to_email: str, reset_link: str):
    api_key = os.getenv("RESEND_API_KEY", "")
    
    if not api_key:
        print("Warning: RESEND_API_KEY is not set in environment.")
        print(f"Would have sent reset link: {reset_link} to {to_email}")
        return

    url = "https://api.resend.com/emails"
    
    # A Resend alapértelmezett teszt címe, ha a domain nincs hitelesítve
    sender = "Acme <onboarding@resend.dev>"

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
        "Content-Type": "application/json"
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
