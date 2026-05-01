from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete, and_, or_, func
from datetime import datetime, date, time, timedelta
import uuid
import secrets
import logging
from typing import Optional, List
from database import get_user_db
from models import User, Client, ConsultationType, ConsultationBooking, ConsultationAvailability, BusinessHours, Holiday
from schemas import (
    ConsultationTypeResponse, AvailableSlotsResponse, TimeSlotResponse,
    ConsultationBookingRequest, ConsultationBookingResponse,
    MyConsultationsResponse, CancelConsultationResponse,
    BusinessHoursResponse, HolidayResponse
)
from auth_router import get_current_user
from email_service import send_consultation_confirmation_email, send_consultation_cancellation_email

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/consultations", tags=["consultations"])

# ============================================================
# HELPER FUNCTIONS
# ============================================================

def generate_time_slots(start_time: time, end_time: time, interval_minutes: int = 60):
    """Generate time slots between start and end time"""
    slots = []
    current = datetime.combine(date.today(), start_time)
    end = datetime.combine(date.today(), end_time)
    
    while current < end:
        slots.append(current.time().strftime("%H:%M:%S"))
        current += timedelta(minutes=interval_minutes)
    
    return slots

# ============================================================
# CONSULTATION ENDPOINTS
# ============================================================

@router.get("/types", response_model=List[ConsultationTypeResponse])
async def get_consultation_types(
    db: AsyncSession = Depends(get_user_db)
):
    """Get all available consultation types"""
    result = await db.execute(
        select(ConsultationType)
        .where(ConsultationType.is_active == True)
        .order_by(ConsultationType.display_order)
    )
    types = result.scalars().all()
    
    response = []
    for ct in types:
        includes_list = []
        if ct.includes:
            import json
            includes_list = json.loads(ct.includes) if isinstance(ct.includes, str) else ct.includes
        
        response.append(ConsultationTypeResponse(
            id=ct.id,
            icon=ct.icon,
            title=ct.title,
            subtitle=ct.subtitle,
            duration_minutes=ct.duration_minutes,
            price=float(ct.price),
            price_display=ct.price_display,
            badge_text=ct.badge_text,
            badge_color=ct.badge_color,
            description=ct.description,
            coach_description=ct.coach_description,
            img_url=ct.img_url,
            includes=includes_list,
            is_active=ct.is_active,
            display_order=ct.display_order
        ))
    
    return response

@router.get("/availability/{date_str}", response_model=AvailableSlotsResponse)
async def get_availability(
    date_str: str,
    db: AsyncSession = Depends(get_user_db)
):
    """Get available time slots for a specific date"""
    # Parse date
    try:
        booking_date = datetime.strptime(date_str, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
    
    # Check if date is in the past
    if booking_date < datetime.now().date():
        raise HTTPException(status_code=400, detail="Cannot book past dates")
    
    # Check if holiday
    holiday_result = await db.execute(
        select(Holiday).where(Holiday.holiday_date == booking_date)
    )
    holiday = holiday_result.scalar_one_or_none()
    
    if holiday:
        return AvailableSlotsResponse(
            date=date_str,
            slots=[],
            is_holiday=True,
            is_closed=True,
            holiday_name=holiday.name
        )
    
    # Get business hours for the day
    day_of_week = booking_date.weekday() + 1  # Monday=1, Sunday=7
    if day_of_week == 7:
        day_of_week = 0  # Convert to Sunday=0 for database
    
    hours_result = await db.execute(
        select(BusinessHours).where(BusinessHours.day_of_week == day_of_week)
    )
    hours = hours_result.scalar_one_or_none()
    
    if not hours or not hours.is_open:
        return AvailableSlotsResponse(
            date=date_str,
            slots=[],
            is_holiday=False,
            is_closed=True,
            holiday_name=None
        )
    
    # Generate time slots
    time_slots = generate_time_slots(hours.start_time, hours.end_time, hours.slot_interval_minutes)
    
    # Get booked slots for this date from availability table
    booked_result = await db.execute(
        select(ConsultationAvailability)
        .where(ConsultationAvailability.booking_date == booking_date)
        .where(ConsultationAvailability.is_booked == True)
    )
    booked_slots = booked_result.scalars().all()
    booked_times = {bs.time_slot.strftime("%H:%M:%S") for bs in booked_slots}
    
    # Also check confirmed bookings not in availability table
    bookings_result = await db.execute(
        select(ConsultationBooking)
        .where(ConsultationBooking.booking_date == booking_date)
        .where(ConsultationBooking.status == "confirmed")
    )
    confirmed_bookings = bookings_result.scalars().all()
    for booking in confirmed_bookings:
        booked_times.add(booking.booking_time.strftime("%H:%M:%S"))
    
    # Build response slots
    slots = []
    for slot in time_slots:
        is_booked = slot in booked_times
        slots.append(TimeSlotResponse(
            time=slot,
            booked=is_booked,
            available=not is_booked
        ))
    
    return AvailableSlotsResponse(
        date=date_str,
        slots=slots,
        is_holiday=False,
        is_closed=False,
        holiday_name=None
    )
@router.post("/book", response_model=ConsultationBookingResponse)
async def book_consultation(
    request: ConsultationBookingRequest,
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db)
):
    """Book a consultation"""
    user_id = current_user["user_id"]
    user_id_bytes = user_id.bytes
    
    # Get client info with associated user email
    client_result = await db.execute(
        select(Client, User.email)
        .join(User, Client.id == User.id)
        .where(Client.id == user_id_bytes)
    )
    row = client_result.first()
    
    if not row:
        raise HTTPException(status_code=404, detail="Client not found")
    
    client, client_email = row
    
    # Get consultation type
    type_result = await db.execute(
        select(ConsultationType).where(ConsultationType.id == request.consultation_type_id)
    )
    consultation_type = type_result.scalar_one_or_none()
    
    if not consultation_type:
        raise HTTPException(status_code=404, detail="Consultation type not found")
    
    # Check if date is in the past
    if request.booking_date < datetime.now().date():
        raise HTTPException(status_code=400, detail="Cannot book past dates")
    
    # Check availability
    existing_booking = await db.execute(
        select(ConsultationBooking)
        .where(ConsultationBooking.booking_date == request.booking_date)
        .where(ConsultationBooking.booking_time == request.booking_time)
        .where(ConsultationBooking.status == "confirmed")
    )
    if existing_booking.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="This time slot is already booked")
    
    # Check availability table
    avail_result = await db.execute(
        select(ConsultationAvailability)
        .where(ConsultationAvailability.booking_date == request.booking_date)
        .where(ConsultationAvailability.time_slot == request.booking_time)
        .where(ConsultationAvailability.is_booked == True)
    )
    if avail_result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="This time slot is already booked")
    
    # Generate unique booking reference
    booking_ref = f"GV-{secrets.token_hex(4).upper()}"
    
    # Create booking
    booking_id = uuid.uuid4()
    new_booking = ConsultationBooking(
        id=booking_id.bytes,
        client_id=user_id_bytes,
        consultation_type_id=request.consultation_type_id,
        booking_reference=booking_ref,
        booking_date=request.booking_date,
        booking_time=request.booking_time,
        session_format=request.session_format,
        status="confirmed",
        notes=request.notes,
        client_name=client.name,
        client_email=client_email
    )
    
    db.add(new_booking)
    
    # Flush to generate the ID and make it available for the availability record
    await db.flush()
    
    # Now create availability record with the booking_id
    avail = ConsultationAvailability(
        booking_date=request.booking_date,
        time_slot=request.booking_time,
        is_booked=True,
        booked_by=user_id_bytes,
        booking_id=booking_id.bytes  # Now this ID exists in the database
    )
    db.add(avail)
    
    # Commit both records
    await db.commit()
    
    # Refresh to get any auto-generated values
    await db.refresh(new_booking)
    
    # Send confirmation email in background
    background_tasks.add_task(
        send_consultation_confirmation_email,
        client_email=client_email,
        client_name=client.name,
        consultation_title=consultation_type.title,
        booking_date=request.booking_date,
        booking_time=request.booking_time.strftime("%H:%M:%S") if isinstance(request.booking_time, time) else request.booking_time,
        session_format=request.session_format,
        booking_reference=booking_ref,
        duration_minutes=consultation_type.duration_minutes,
        coach_description=consultation_type.coach_description
    )
    
    return ConsultationBookingResponse(
        id=uuid.UUID(bytes=new_booking.id),
        booking_reference=new_booking.booking_reference,
        consultation_type_id=consultation_type.id,
        consultation_title=consultation_type.title,
        booking_date=new_booking.booking_date,
        booking_time=new_booking.booking_time.strftime("%H:%M:%S"),
        session_format=new_booking.session_format,
        status=new_booking.status,
        notes=new_booking.notes,
        created_at=new_booking.created_at
    )

@router.get("/my-bookings", response_model=MyConsultationsResponse)
async def get_my_consultations(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db)
):
    """Get current user's consultation bookings"""
    user_id = current_user["user_id"]
    user_id_bytes = user_id.bytes
    
    now = datetime.now().date()
    
    # Get upcoming bookings (future dates)
    upcoming_result = await db.execute(
        select(ConsultationBooking, ConsultationType)
        .join(ConsultationType, ConsultationBooking.consultation_type_id == ConsultationType.id)
        .where(ConsultationBooking.client_id == user_id_bytes)
        .where(ConsultationBooking.status == "confirmed")
        .where(ConsultationBooking.booking_date >= now)
        .order_by(ConsultationBooking.booking_date, ConsultationBooking.booking_time)
    )
    upcoming_rows = upcoming_result.all()
    
    # Get past bookings
    past_result = await db.execute(
        select(ConsultationBooking, ConsultationType)
        .join(ConsultationType, ConsultationBooking.consultation_type_id == ConsultationType.id)
        .where(ConsultationBooking.client_id == user_id_bytes)
        .where(ConsultationBooking.status.in_(["completed", "cancelled", "no_show"]))
        .order_by(ConsultationBooking.booking_date.desc())
    )
    past_rows = past_result.all()
    
    upcoming = []
    for booking, ct in upcoming_rows:
        upcoming.append(ConsultationBookingResponse(
            id=uuid.UUID(bytes=booking.id),
            booking_reference=booking.booking_reference,
            consultation_type_id=ct.id,
            consultation_title=ct.title,
            booking_date=booking.booking_date,
            booking_time=booking.booking_time.strftime("%H:%M:%S"),
            session_format=booking.session_format,
            status=booking.status,
            notes=booking.notes,
            created_at=booking.created_at
        ))
    
    past = []
    for booking, ct in past_rows:
        past.append(ConsultationBookingResponse(
            id=uuid.UUID(bytes=booking.id),
            booking_reference=booking.booking_reference,
            consultation_type_id=ct.id,
            consultation_title=ct.title,
            booking_date=booking.booking_date,
            booking_time=booking.booking_time.strftime("%H:%M:%S"),
            session_format=booking.session_format,
            status=booking.status,
            notes=booking.notes,
            created_at=booking.created_at
        ))
    
    return MyConsultationsResponse(
        upcoming=upcoming,
        past=past,
        total_upcoming=len(upcoming),
        total_past=len(past)
    )

@router.delete("/bookings/{booking_id}", response_model=CancelConsultationResponse)
async def cancel_consultation(
    booking_id: uuid.UUID,
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db)
):
    """Cancel a consultation booking"""
    user_id = current_user["user_id"]
    user_id_bytes = user_id.bytes
    booking_id_bytes = booking_id.bytes
    
    result = await db.execute(
        select(ConsultationBooking, ConsultationType)
        .join(ConsultationType, ConsultationBooking.consultation_type_id == ConsultationType.id)
        .where(ConsultationBooking.id == booking_id_bytes)
        .where(ConsultationBooking.client_id == user_id_bytes)
    )
    row = result.first()
    
    if not row:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    booking, consultation_type = row
    
    if booking.status != "confirmed":
        raise HTTPException(status_code=400, detail="Booking already cancelled or completed")
    
    # Check if cancellation is allowed (at least 24 hours before)
    now = datetime.now()
    booking_datetime = datetime.combine(booking.booking_date, booking.booking_time)
    hours_until = (booking_datetime - now).total_seconds() / 3600
    
    refund_amount = None
    if hours_until >= 24:
        # Full refund for paid consultations
        if consultation_type.price > 0:
            refund_amount = float(consultation_type.price)
    else:
        raise HTTPException(status_code=400, detail="Cancellations must be made at least 24 hours before the consultation")
    
    # Update booking status
    booking.status = "cancelled"
    booking.cancelled_at = datetime.now()
    
    # Free up the slot in availability table
    await db.execute(
        delete(ConsultationAvailability)
        .where(ConsultationAvailability.booking_date == booking.booking_date)
        .where(ConsultationAvailability.time_slot == booking.booking_time)
    )
    
    await db.commit()
    
    # Send cancellation email
    background_tasks.add_task(
        send_consultation_cancellation_email,
        client_email=booking.client_email,
        client_name=booking.client_name,
        consultation_title=consultation_type.title,
        booking_date=booking.booking_date,
        booking_time=booking.booking_time.strftime("%H:%M:%S"),
        booking_reference=booking.booking_reference,
        refund_amount=refund_amount
    )
    
    return CancelConsultationResponse(
        message="Consultation cancelled successfully",
        booking_id=booking_id,
        refund_amount=refund_amount
    )

@router.get("/business-hours", response_model=List[BusinessHoursResponse])
async def get_business_hours(
    db: AsyncSession = Depends(get_user_db)
):
    """Get business hours configuration"""
    result = await db.execute(
        select(BusinessHours).order_by(BusinessHours.day_of_week)
    )
    hours = result.scalars().all()
    
    return [
        BusinessHoursResponse(
            day_of_week=h.day_of_week,
            is_open=h.is_open,
            start_time=h.start_time.strftime("%H:%M:%S") if h.start_time else None,
            end_time=h.end_time.strftime("%H:%M:%S") if h.end_time else None,
            slot_interval_minutes=h.slot_interval_minutes
        )
        for h in hours
    ]

@router.get("/holidays", response_model=List[HolidayResponse])
async def get_holidays(
    year: Optional[int] = None,
    db: AsyncSession = Depends(get_user_db)
):
    """Get holidays for a specific year or all"""
    query = select(Holiday)
    if year:
        query = query.where(func.year(Holiday.holiday_date) == year)
    
    result = await db.execute(query.order_by(Holiday.holiday_date))
    holidays = result.scalars().all()
    
    return [
        HolidayResponse(
            holiday_date=h.holiday_date,
            name=h.name
        )
        for h in holidays
    ]