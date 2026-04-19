from fastapi_mail import FastMail, MessageSchema, MessageType
from config import SMTP_CONFIG
import logging

logger = logging.getLogger(__name__)
fastmail = FastMail(SMTP_CONFIG)

async def send_password_reset_email(email: str, token: str, name: str):
    """Send password reset email to user"""
    reset_link = f"http://localhost:3000/reset-password?token={token}"
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Password Reset - GymPRO</title>
    </head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #ff6900; padding: 20px; text-align: center;">
            <h1 style="color: white;">GymPRO</h1>
        </div>
        
        <div style="padding: 30px;">
            <h2>Password Reset Request</h2>
            <p>Hi <strong>{name}</strong>,</p>
            <p>We received a request to reset your password. Click the button below to create a new password:</p>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="{reset_link}" 
                   style="background-color: #ff6900; color: white; padding: 12px 30px; 
                          text-decoration: none; border-radius: 5px; display: inline-block;">
                    Reset Password
                </a>
            </div>
            
            <p>This link will expire in <strong>24 hours</strong>.</p>
            <p>If you didn't request this, please ignore this email.</p>
            
            <hr style="margin: 30px 0;">
            <p style="color: #666; font-size: 12px;">
                Need help? Contact us at <a href="mailto:badfitnesspros@gympro.com">support@gympro.com</a>
            </p>
        </div>
    </body>
    </html>
    """
    
    message = MessageSchema(
        subject="GymPRO - Password Reset Request",
        recipients=[email],
        body=html_content,
        subtype=MessageType.html
    )
    
    try:
        await fastmail.send_message(message)
        logger.info(f"Password reset email sent to {email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send email to {email}: {e}")
        return False


async def send_welcome_email(email: str, name: str):
    """Send welcome email after registration"""
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Welcome to GymPRO!</title>
    </head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #ff6900; padding: 20px; text-align: center;">
            <h1 style="color: white;">Welcome to GymPRO!</h1>
        </div>
        
        <div style="padding: 30px;">
            <h2>Hello {name}! 🎉</h2>
            <p>Thank you for joining GymPRO. We're excited to have you as part of our fitness community!</p>
            
            <div style="margin: 20px 0; padding: 15px; background-color: #f5f5f5; border-radius: 8px;">
                <h3>Getting Started:</h3>
                <ul>
                    <li>Complete your profile</li>
                    <li>Book your first training session</li>
                    <li>Explore our workout programs</li>
                </ul>
            </div>
            
            <div style="text-align: center;">
                <a href="http://localhost:3000/account" 
                   style="background-color: #ff6900; color: white; padding: 10px 25px; 
                          text-decoration: none; border-radius: 5px;">
                    Go to Dashboard
                </a>
            </div>
            
            <hr style="margin: 30px 0;">
            <p style="color: #666; font-size: 12px;">
                Questions? Email us at <a href="mailto:support@gympro.com">support@gympro.com</a>
            </p>
        </div>
    </body>
    </html>
    """
    
    message = MessageSchema(
        subject="Welcome to GymPRO!",
        recipients=[email],
        body=html_content,
        subtype=MessageType.html
    )
    
    try:
        await fastmail.send_message(message)
        logger.info(f"Welcome email sent to {email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send welcome email to {email}: {e}")
        return False