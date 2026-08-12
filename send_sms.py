import os
import smtplib
from pathlib import Path
from email.message import EmailMessage
from dotenv import load_dotenv

# Point to the backend env file already used by this project.
project_root = Path(__file__).resolve().parent
backend_env_path = project_root / "backend" / ".env"
load_dotenv(dotenv_path=backend_env_path)

ENABLE_EMAIL_NOTIFICATIONS = (os.getenv('ENABLE_EMAIL_NOTIFICATIONS', 'false').lower() == 'true')
SMTP_HOST = os.getenv('SMTP_HOST')
SMTP_PORT = int(os.getenv('SMTP_PORT', '587'))
SMTP_USER = os.getenv('SMTP_USER')
SMTP_PASS = os.getenv('SMTP_PASS')
EMAIL_RECIPIENTS = os.getenv('EMAIL_RECIPIENTS', SMTP_USER or '')

if not ENABLE_EMAIL_NOTIFICATIONS:
    raise SystemExit('Email notifications are disabled. Set ENABLE_EMAIL_NOTIFICATIONS=true in backend/.env to enable.')

if not SMTP_HOST or not SMTP_USER or not SMTP_PASS:
    raise SystemExit('SMTP configuration missing in backend/.env')

recipients = [r.strip() for r in EMAIL_RECIPIENTS.split(',') if r.strip()]
if len(recipients) == 0:
    raise SystemExit('No recipient email addresses configured (EMAIL_RECIPIENTS).')

message_text = 'Ward 18 emergency advisory: follow the official diversion route and stay alert for on-ground updates.'

msg = EmailMessage()
msg['Subject'] = 'CivicMind AI — Ward 18 Emergency Advisory'
msg['From'] = SMTP_USER
msg['To'] = ', '.join(recipients)
msg.set_content(message_text)

with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=15) as server:
    server.starttls()
    server.login(SMTP_USER, SMTP_PASS)
    server.send_message(msg)

print(f"Email sent to: {', '.join(recipients)}")
