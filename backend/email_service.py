from fastapi_mail import FastMail, MessageSchema, MessageType
from config import SMTP_CONFIG
from datetime import datetime, date
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

async def send_booking_confirmation_email(
    booked_for_email: str,
    booked_for_name: str,
    excursion_name: str,
    excursion_date: date,
    excursion_time: str,
    location: str,
    guide: str,
    meetup_point: str,
    what_to_bring: list,
    booking_reference: str,
    total_amount: float,
    payment_method: str
):
    """Send booking confirmation email to user"""
    
    date_str = excursion_date.strftime("%A, %B %d, %Y")
    
    what_to_bring_html = "".join([f"<li>{item}</li>" for item in what_to_bring])
    
    payment_instructions = ""
    if payment_method == "cash":
        payment_instructions = """
        <div style="background-color: #fff3e0; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ff6900;">
            <p style="margin: 0; color: #cc7000;">
                <strong>💰 Cash Payment Instructions:</strong><br>
                Please pay <strong>${:.2f} JMD</strong> at the gym reception at least 48 hours before the excursion to secure your spot.
            </p>
        </div>
        """.format(total_amount)
    else:
        payment_instructions = """
        <div style="background-color: #e8f5e9; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4caf50;">
            <p style="margin: 0; color: #2e7d32;">
                <strong>✅ Payment Confirmed:</strong><br>
                Your online payment of <strong>${:.2f} JMD</strong> has been processed successfully.
            </p>
        </div>
        """.format(total_amount)
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Booking Confirmation - B.A.D People Fitness</title>
    </head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #ff6900; padding: 20px; text-align: center;">
            <h1 style="color: white;">B.A.D People Fitness</h1>
            <p style="color: white; font-size: 18px;">Excursion Booking Confirmed! 🎉</p>
        </div>
        
        <div style="padding: 30px;">
            <h2>Hello {booked_for_name}!</h2>
            <p>Great news! Your booking has been confirmed. Get ready for an amazing adventure with us!</p>
            
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 10px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #ff6900;">Booking Details</h3>
                <p><strong>Booking Reference:</strong> {booking_reference}</p>
                <p><strong>Excursion:</strong> {excursion_name}</p>
                <p><strong>Location:</strong> {location}</p>
                <p><strong>Date:</strong> {date_str}</p>
                <p><strong>Time:</strong> {excursion_time}</p>
                <p><strong>Guide:</strong> {guide}</p>
                <p><strong>Meet-up Point:</strong> {meetup_point}</p>
                <p><strong>Total Paid:</strong> <span style="color: #ff6900; font-size: 18px; font-weight: bold;">${total_amount:.2f} JMD</span></p>
            </div>
            
            {payment_instructions}
            
            <div style="margin: 20px 0;">
                <h3 style="color: #ff6900;">📋 What to Bring</h3>
                <ul style="list-style-type: none; padding-left: 0;">
                    {what_to_bring_html}
                </ul>
            </div>
            
            <div style="background-color: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #1565c0;">⚠️ Important Reminders</h3>
                <ul style="margin-bottom: 0;">
                    <li>Please arrive 15 minutes before departure time</li>
                    <li>Bring a valid ID for check-in</li>
                    <li>Check your email 24 hours before for weather updates</li>
                    <li>Contact us immediately if you need to cancel or reschedule</li>
                </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="http://localhost:3000/excursions" 
                   style="background-color: #ff6900; color: white; padding: 12px 30px; 
                          text-decoration: none; border-radius: 5px; display: inline-block;">
                    View My Bookings
                </a>
            </div>
            
            <hr style="margin: 30px 0;">
            <p style="color: #666; font-size: 12px;">
                Need help? Contact us at <a href="mailto:excursions@badfitness.com">excursions@badfitness.com</a> or call (876) 555-0192
            </p>
        </div>
    </body>
    </html>
    """
    
    message = MessageSchema(
        subject=f"Booking Confirmed: {excursion_name} - B.A.D People Fitness",
        recipients=[booked_for_email],
        body=html_content,
        subtype=MessageType.html
    )
    
    try:
        await fastmail.send_message(message)
        logger.info(f"Booking confirmation email sent to {booked_for_email} for {excursion_name}")
        return True
    except Exception as e:
        logger.error(f"Failed to send booking confirmation email to {booked_for_email}: {e}")
        return False


async def send_booking_cancellation_email(
    booked_for_email: str,
    booked_for_name: str,
    excursion_name: str,
    excursion_date: date,
    booking_reference: str,
    refund_amount: float = None
):
    """Send booking cancellation email to user"""
    
    date_str = excursion_date.strftime("%A, %B %d, %Y")
    
    refund_html = ""
    if refund_amount:
        refund_html = f"""
        <div style="background-color: #e8f5e9; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4caf50;">
            <p style="margin: 0; color: #2e7d32;">
                <strong>💰 Refund Information:</strong><br>
                A refund of <strong>${refund_amount:.2f} JMD</strong> will be processed to your original payment method within 5-7 business days.
            </p>
        </div>
        """
    else:
        refund_html = """
        <div style="background-color: #fff3e0; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ff6900;">
            <p style="margin: 0; color: #cc7000;">
                <strong>⚠️ No Refund Available:</strong><br>
                Cancellations made less than 48 hours before the excursion are non-refundable.
            </p>
        </div>
        """
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Booking Cancellation - B.A.D People Fitness</title>
    </head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #dc3545; padding: 20px; text-align: center;">
            <h1 style="color: white;">B.A.D People Fitness</h1>
            <p style="color: white; font-size: 18px;">Booking Cancellation</p>
        </div>
        
        <div style="padding: 30px;">
            <h2>Hello {booked_for_name},</h2>
            <p>Your booking has been successfully cancelled as requested.</p>
            
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 10px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #dc3545;">Cancelled Booking Details</h3>
                <p><strong>Booking Reference:</strong> {booking_reference}</p>
                <p><strong>Excursion:</strong> {excursion_name}</p>
                <p><strong>Date:</strong> {date_str}</p>
            </div>
            
            {refund_html}
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="http://localhost:3000/excursions" 
                   style="background-color: #ff6900; color: white; padding: 12px 30px; 
                          text-decoration: none; border-radius: 5px; display: inline-block;">
                    Browse More Excursions
                </a>
            </div>
            
            <hr style="margin: 30px 0;">
            <p style="color: #666; font-size: 12px;">
                Have questions? Contact us at <a href="mailto:excursions@badfitness.com">excursions@badfitness.com</a>
            </p>
        </div>
    </body>
    </html>
    """
    
    message = MessageSchema(
        subject=f"Booking Cancelled: {excursion_name} - B.A.D People Fitness",
        recipients=[booked_for_email],
        body=html_content,
        subtype=MessageType.html
    )
    
    try:
        await fastmail.send_message(message)
        logger.info(f"Booking cancellation email sent to {booked_for_email} for {excursion_name}")
        return True
    except Exception as e:
        logger.error(f"Failed to send cancellation email to {booked_for_email}: {e}")
        return False


async def send_consultation_confirmation_email(
    client_email: str,
    client_name: str,
    consultation_title: str,
    booking_date: date,
    booking_time: str,
    session_format: str,
    booking_reference: str,
    duration_minutes: int,
    coach_description: str
):
    """Send consultation booking confirmation email"""
    
    date_str = booking_date.strftime("%A, %B %d, %Y")
    time_str = datetime.strptime(booking_time, "%H:%M:%S").strftime("%I:%M %p")
    
    format_display = "In-Person" if session_format == "in-person" else "Video Call"
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Consultation Confirmed - GymVault</title>
    </head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #ff6900; padding: 20px; text-align: center;">
            <h1 style="color: white;">GYMVAULT</h1>
            <p style="color: white; font-size: 18px;">Consultation Confirmed! 🎉</p>
        </div>
        
        <div style="padding: 30px;">
            <h2>Hello {client_name}!</h2>
            <p>Your consultation has been confirmed. We look forward to helping you achieve your fitness goals!</p>
            
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 10px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #ff6900;">Booking Details</h3>
                <p><strong>Booking Reference:</strong> {booking_reference}</p>
                <p><strong>Consultation:</strong> {consultation_title}</p>
                <p><strong>Date:</strong> {date_str}</p>
                <p><strong>Time:</strong> {time_str} ({duration_minutes} minutes)</p>
                <p><strong>Format:</strong> {format_display}</p>
                <p><strong>Coach:</strong> {coach_description}</p>
            </div>
            
            <div style="margin: 20px 0;">
                <h3 style="color: #ff6900;">📍 Location Information</h3>
                <p><strong>GymVault Fitness Center</strong><br>
                123 Fitness Avenue<br>
                Kingston, Jamaica<br>
                <a href="https://maps.google.com">View on Google Maps →</a></p>
            </div>
            
            <div style="background-color: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #1565c0;">⚠️ What to Bring</h3>
                <ul>
                    <li>Comfortable workout clothes</li>
                    <li>Water bottle</li>
                    <li>Your fitness goals and questions</li>
                    <li>Valid ID for check-in</li>
                </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="http://localhost:3000/consultations" 
                   style="background-color: #ff6900; color: white; padding: 12px 30px; 
                          text-decoration: none; border-radius: 5px; display: inline-block;">
                    View My Bookings
                </a>
            </div>
            
            <hr style="margin: 30px 0;">
            <p style="color: #666; font-size: 12px;">
                Need to reschedule? Contact us at <a href="mailto:consultations@gymvault.com">consultations@gymvault.com</a> or call (876) 555-0192
            </p>
        </div>
    </body>
    </html>
    """
    
    message = MessageSchema(
        subject=f"Consultation Confirmed: {consultation_title} - GymVault",
        recipients=[client_email],
        body=html_content,
        subtype=MessageType.html
    )
    
    try:
        await fastmail.send_message(message)
        logger.info(f"Consultation confirmation email sent to {client_email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send consultation confirmation email: {e}")
        return False

async def send_consultation_cancellation_email(
    client_email: str,
    client_name: str,
    consultation_title: str,
    booking_date: date,
    booking_time: str,
    booking_reference: str,
    refund_amount: float = None
):
    """Send consultation cancellation email"""
    
    date_str = booking_date.strftime("%A, %B %d, %Y")
    time_str = datetime.strptime(booking_time, "%H:%M:%S").strftime("%I:%M %p")
    
    refund_html = ""
    if refund_amount:
        refund_html = f"""
        <div style="background-color: #e8f5e9; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4caf50;">
            <p style="margin: 0; color: #2e7d32;">
                <strong>💰 Refund Information:</strong><br>
                A refund of <strong>${refund_amount:.2f}</strong> will be processed to your original payment method within 5-7 business days.
            </p>
        </div>
        """
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Consultation Cancelled - GymVault</title>
    </head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #dc3545; padding: 20px; text-align: center;">
            <h1 style="color: white;">GYMVAULT</h1>
            <p style="color: white; font-size: 18px;">Consultation Cancelled</p>
        </div>
        
        <div style="padding: 30px;">
            <h2>Hello {client_name},</h2>
            <p>Your consultation has been successfully cancelled as requested.</p>
            
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 10px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #dc3545;">Cancelled Booking Details</h3>
                <p><strong>Booking Reference:</strong> {booking_reference}</p>
                <p><strong>Consultation:</strong> {consultation_title}</p>
                <p><strong>Date:</strong> {date_str}</p>
                <p><strong>Time:</strong> {time_str}</p>
            </div>
            
            {refund_html}
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="http://localhost:3000/consultations" 
                   style="background-color: #ff6900; color: white; padding: 12px 30px; 
                          text-decoration: none; border-radius: 5px; display: inline-block;">
                    Book Another Consultation
                </a>
            </div>
            
            <hr style="margin: 30px 0;">
            <p style="color: #666; font-size: 12px;">
                Have questions? Contact us at <a href="mailto:consultations@gymvault.com">consultations@gymvault.com</a>
            </p>
        </div>
    </body>
    </html>
    """
    
    message = MessageSchema(
        subject=f"Consultation Cancelled: {consultation_title} - GymVault",
        recipients=[client_email],
        body=html_content,
        subtype=MessageType.html
    )
    
    try:
        await fastmail.send_message(message)
        logger.info(f"Consultation cancellation email sent to {client_email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send consultation cancellation email: {e}")
        return False

async def send_order_confirmation_email(
    email: str,
    customer_name: str,
    order_reference: str,
    items: list,
    subtotal: float,
    tax: float,
    shipping_cost: float,
    total: float,
    shipping_address: str,
    city: str
):
    """Send order confirmation email"""
    
    items_html = ""
    for item in items:
        items_html += f"""
        <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee;">
            <span>{item['product_name']} × {item['quantity']}</span>
            <span>${item['total']:.2f} JMD</span>
        </div>
        """
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Order Confirmation - B.A.D People Fitness</title>
    </head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #ff6900; padding: 20px; text-align: center;">
            <h1 style="color: white;">B.A.D People Fitness</h1>
            <p style="color: white; font-size: 18px;">Order Confirmed! 🎉</p>
        </div>
        
        <div style="padding: 30px;">
            <h2>Hello {customer_name}!</h2>
            <p>Thank you for your order. We've received your order and will process it shortly.</p>
            
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 10px; margin: 20px 0;">
                <p><strong>Order Reference:</strong> {order_reference}</p>
                <p><strong>Shipping Address:</strong><br>{shipping_address}, {city}</p>
            </div>
            
            <div style="margin: 20px 0;">
                <h3>Order Summary</h3>
                {items_html}
                
                <div style="margin-top: 16px; padding-top: 8px; border-top: 2px solid #ddd;">
                    <div style="display: flex; justify-content: space-between;"><span>Subtotal</span><span>${subtotal:.2f} JMD</span></div>
                    <div style="display: flex; justify-content: space-between;"><span>Tax (15%)</span><span>${tax:.2f} JMD</span></div>
                    <div style="display: flex; justify-content: space-between;"><span>Shipping</span><span>{'Free' if shipping_cost == 0 else f'${shipping_cost:.2f} JMD'}</span></div>
                    <div style="display: flex; justify-content: space-between; font-size: 18px; font-weight: bold; margin-top: 8px; padding-top: 8px; border-top: 2px solid #ddd;">
                        <span>Total</span>
                        <span style="color: #ff6900;">${total:.2f} JMD</span>
                    </div>
                </div>
            </div>
            
            <div style="background-color: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0;">What happens next?</h3>
                <ol style="margin-bottom: 0;">
                    <li>We'll process your order within 24 hours</li>
                    <li>You'll receive a shipping confirmation email with tracking</li>
                    <li>Delivery typically takes 3-5 business days</li>
                </ol>
            </div>
            
            <hr>
            <p style="color: #666; font-size: 12px;">
                Questions? Contact us at <a href="mailto:shop@badfitness.com">shop@badfitness.com</a>
            </p>
        </div>
    </body>
    </html>
    """
    
    message = MessageSchema(
        subject=f"Order Confirmed: {order_reference} - B.A.D People Fitness",
        recipients=[email],
        body=html_content,
        subtype=MessageType.html
    )
    
    try:
        await fastmail.send_message(message)
        logger.info(f"Order confirmation email sent to {email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send order confirmation email: {e}")
        return False

async def send_birthday_email(email: str, name: str, message: str):
    """Send birthday email to client"""
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Happy Birthday from GymPro! 🎂</title>
    </head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #ff6900; padding: 20px; text-align: center;">
            <h1 style="color: white;">GYMPRO</h1>
            <p style="color: white; font-size: 24px;">Happy Birthday! 🎉</p>
        </div>
        
        <div style="padding: 30px;">
            <h2>Happy Birthday, {name}! 🎂</h2>
            <p>On behalf of the entire GymPro team, we wanted to wish you a fantastic birthday!</p>
            
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 10px; margin: 20px 0; text-align: center;">
                <p style="font-size: 18px; color: #ff6900; margin: 0;">🎁 Special Birthday Gift 🎁</p>
                <p style="margin: 10px 0 0 0;">Enjoy a <strong>free personal training session</strong> on us this month!</p>
            </div>
            
            <div style="margin: 20px 0;">
                <p><strong>Your Birthday Message:</strong></p>
                <p style="background-color: #fff3e0; padding: 15px; border-radius: 8px; border-left: 4px solid #ff6900;">
                    {message}
                </p>
            </div>
            
            <div style="margin: 20px 0;">
                <h3>🎉 Birthday Benefits</h3>
                <ul>
                    <li>✨ Free training session this month</li>
                    <li>💪 Personal birthday shoutout on our social media</li>
                </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="http://localhost:3000/account" 
                   style="background-color: #ff6900; color: white; padding: 12px 30px; 
                          text-decoration: none; border-radius: 5px; display: inline-block;">
                    Claim Your Gift →
                </a>
            </div>
            
            <hr style="margin: 30px 0;">
            <p style="color: #666; font-size: 12px;">
                Need help? Contact us at <a href="mailto:support@gympro.com">support@gympro.com</a>
            </p>
        </div>
    </body>
    </html>
    """
    
    message_obj = MessageSchema(
        subject=f"🎂 Happy Birthday, {name}! - GymPro",
        recipients=[email],
        body=html_content,
        subtype=MessageType.html
    )
    
    try:
        await fastmail.send_message(message_obj)
        logger.info(f"Birthday email sent to {email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send birthday email to {email}: {e}")
        return False