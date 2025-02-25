import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from services.config import Config

SENDER_EMAIL = "encyclomedia@zohomail.com"
SENDER_PASSWORD = Config.EMAIL_PASSWORD

SMTP_SERVER = "smtp.zoho.com"
SMTP_PORT = 465  # Use 587 for TLS

def send_reset_email(to_email, reset_token):
    """
    Sends a password reset email via Zoho Mail.
    
    Args:
        to_email (str): Recipient's email address.
        reset_token (str): Reset token for password reset.

    Returns:
        bool: True if email sent successfully, False otherwise.
    """
    try:
        subject = "Reset Your Password"
        reset_link = f"http://localhost:3000/reset-password/{reset_token}"
        body = f"""
        <p>You are receiving this email because you (or someone else) has requested to reset your password.</p>
        <p>Please click the following link to reset your password:</p>
        <a href="{reset_link}">Reset Password</a>
        <p>If you did not request this, please ignore this email.</p>
        """

        # Set up email message
        message = MIMEMultipart()
        message["From"] = SENDER_EMAIL
        message["To"] = to_email
        message["Subject"] = subject
        message.attach(MIMEText(body, "html"))

        # Send email via Zoho SMTP
        server = smtplib.SMTP_SSL(SMTP_SERVER, SMTP_PORT)
        server.login(SENDER_EMAIL, SENDER_PASSWORD)
        server.sendmail(SENDER_EMAIL, to_email, message.as_string())
        server.quit()

        print("Email sent successfully via Zoho Mail")
        return True

    except Exception as e:
        print("Error sending email via Zoho:", str(e))
        return False