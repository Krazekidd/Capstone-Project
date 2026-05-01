from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete, and_, or_
from sqlalchemy.orm import selectinload
from datetime import datetime, date, time, timedelta
import uuid

from database import get_user_db
from models import (
    User, Booking, ConsultationType, Coach, 
    CoachAvailabilitySchedule, CoachAvailabilityOverride
)
from schemas import (
    BookingResponse,
    BookingBase,
    ConsultationTypeResponse,
    APIResponse,
)
from ..auth.auth import get_current_user

router = APIRouter(prefix="/api/v1/bookings", tags=["bookings"])


# ========== CONSULTATION TYPES ==========

@router.get("/consultation-types", response_model=list[ConsultationTypeResponse])
async def get_consultation_types(db: AsyncSession = Depends(get_user_db)):
    """Get all active consultation types"""
    result = await db.execute(
        select(ConsultationType)
        .where(ConsultationType.is_active == True)
        .order_by(ConsultationType.sort_order)
    )
    types = result.scalars().all()
    return types


@router.get("/consultation-types/{slug}", response_model=ConsultationTypeResponse)
async def get_consultation_type(slug: str, db: AsyncSession = Depends(get_user_db)):
    """Get a specific consultation type by slug"""
    result = await db.execute(
        select(ConsultationType).where(
            ConsultationType.slug == slug,
            ConsultationType.is_active == True
        )
    )
    consultation_type = result.scalar_one_or_none()
    
    if not consultation_type:
        raise HTTPException(status_code=404, detail="Consultation type not found")
    
    return consultation_type


# ========== AVAILABILITY ==========

@router.get("/availability")
async def get_availability(
    consultation_type_id: uuid.UUID,
    date: date,
    timezone: str = Query(default="America/New_York"),
    db: AsyncSession = Depends(get_user_db),
):
    """Get available time slots for a consultation type and date"""
    
    # Check consultation type exists
    consultation_result = await db.execute(
        select(ConsultationType).where(ConsultationType.id == consultation_type_id)
    )
    consultation_type = consultation_result.scalar_one_or_none()
    
    if not consultation_type:
        raise HTTPException(status_code=404, detail="Consultation type not found")
    
    # Get a coach (for simplicity, get first active coach)
    coach_result = await db.execute(
        select(Coach).where(Coach.is_active == True).limit(1)
    )
    coach = coach_result.scalar_one_or_none()
    
    if not coach:
        raise HTTPException(status_code=404, detail="No coaches available")
    
    # Check for availability overrides (holidays, etc.)
    override_result = await db.execute(
        select(CoachAvailabilityOverride).where(
            CoachAvailabilityOverride.coach_id == coach.id,
            CoachAvailabilityOverride.override_date == date
        )
    )
    override = override_result.scalar_one_or_none()
    
    if override and override.is_closed:
        return {"date": date.isoformat(), "timezone": timezone, "slots": []}
    
    # Get weekly schedule
    day_of_week = date.weekday()  # 0=Monday, 6=Sunday
    schedule_result = await db.execute(
        select(CoachAvailabilitySchedule).where(
            CoachAvailabilitySchedule.coach_id == coach.id,
            CoachAvailabilitySchedule.day_of_week == day_of_week,
            CoachAvailabilitySchedule.is_active == True
        )
    )
    schedule = schedule_result.scalar_one_or_none()
    
    if not schedule:
        return {"date": date.isoformat(), "timezone": timezone, "slots": []}
    
    # Generate time slots
    open_time = schedule.open_time
    close_time = schedule.close_time
    duration = consultation_type.duration_minutes
    
    # If override has different hours, use those
    if override and not override.is_closed:
        if override.open_time and override.close_time:
            open_time = override.open_time
            close_time = override.close_time
    
    # Generate slots
    slots = []
    current_time = datetime.combine(date, open_time)
    end_time = datetime.combine(date, close_time)
    
    while current_time + timedelta(minutes=duration) <= end_time:
        slot_time = current_time.time()
        slots.append(slot_time.strftime("%H:%M"))
        current_time += timedelta(minutes=duration)
    
    # Remove already booked slots
    booked_result = await db.execute(
        select(Booking).where(
            Booking.consultation_type_id == consultation_type_id,
            Booking.scheduled_date == date,
            Booking.status.in_(["confirmed", "pending"])
        )
    )
    booked_slots = [booking.scheduled_time.strftime("%H:%M") for booking in booked_result.scalars().all()]
    
    available_slots = [slot for slot in slots if slot not in booked_slots]
    
    return {
        "date": date.isoformat(),
        "timezone": timezone,
        "slots": available_slots
    }


# ========== BOOKINGS ==========

@router.post("", response_model=BookingResponse)
async def create_booking(
    booking_data: BookingBase,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db),
):
    """Create a new booking"""
    user_id = current_user["user_id"]
    
    # Verify consultation type exists
    consultation_result = await db.execute(
        select(ConsultationType).where(ConsultationType.id == booking_data.consultation_type_id)
    )
    consultation_type = consultation_result.scalar_one_or_none()
    
    if not consultation_type:
        raise HTTPException(status_code=404, detail="Consultation type not found")
    
    # Check membership requirements
    if consultation_type.requires_membership:
        # TODO: Check user's membership tier
        pass
    
    # Verify slot is still available
    existing_result = await db.execute(
        select(Booking).where(
            Booking.consultation_type_id == booking_data.consultation_type_id,
            Booking.scheduled_date == booking_data.scheduled_date,
            Booking.scheduled_time == time.fromisoformat(booking_data.scheduled_time),
            Booking.status.in_(["confirmed", "pending"])
        )
    )
    existing_booking = existing_result.scalar_one_or_none()
    
    if existing_booking:
        raise HTTPException(
            status_code=409, 
            detail="Time slot already booked"
        )
    
    # Generate reference
    date_str = booking_data.scheduled_date.strftime("%Y%m%d")
    # Get next booking number for the day
    count_result = await db.execute(
        select(Booking).where(
            Booking.scheduled_date == booking_data.scheduled_date
        )
    )
    count = len(count_result.scalars().all()) + 1
    reference = f"GV-{date_str}-{count:04d}"
    
    # Create booking
    new_booking = Booking(
        reference=reference,
        user_id=user_id,
        consultation_type_id=booking_data.consultation_type_id,
        scheduled_date=booking_data.scheduled_date,
        scheduled_time=time.fromisoformat(booking_data.scheduled_time),
        timezone=booking_data.timezone,
        format=booking_data.format,
        status="confirmed",
        price_charged=consultation_type.price,
        currency=consultation_type.currency,
        notes=booking_data.notes,
        agreed_cancellation_policy=booking_data.agreed_cancellation_policy,
        confirmed_at=datetime.utcnow(),
    )
    
    db.add(new_booking)
    await db.commit()
    await db.refresh(new_booking)
    
    # Load consultation type for response
    await db.refresh(new_booking, ["consultation_type"])
    
    return new_booking


@router.get("", response_model=list[BookingResponse])
async def get_my_bookings(
    status_filter: str = Query(default=None),
    limit: int = Query(default=10, le=100),
    offset: int = Query(default=0, ge=0),
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db),
):
    """Get current user's bookings"""
    user_id = current_user["user_id"]
    
    query = select(Booking).options(
        selectinload(Booking.consultation_type),
        selectinload(Booking.coach)
    ).where(Booking.user_id == user_id)
    
    if status_filter:
        query = query.where(Booking.status == status_filter)
    
    query = query.order_by(Booking.scheduled_date.desc()).offset(offset).limit(limit)
    
    result = await db.execute(query)
    bookings = result.scalars().all()
    
    return bookings


@router.get("/{booking_id}", response_model=BookingResponse)
async def get_booking(
    booking_id: uuid.UUID,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db),
):
    """Get a specific booking"""
    user_id = current_user["user_id"]
    
    result = await db.execute(
        select(Booking)
        .options(
            selectinload(Booking.consultation_type),
            selectinload(Booking.coach)
        )
        .where(
            Booking.id == booking_id,
            Booking.user_id == user_id
        )
    )
    booking = result.scalar_one_or_none()
    
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    return booking


@router.patch("/{booking_id}/cancel")
async def cancel_booking(
    booking_id: uuid.UUID,
    reason: str = None,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db),
):
    """Cancel a booking"""
    user_id = current_user["user_id"]
    
    # Find booking
    result = await db.execute(
        select(Booking).where(
            Booking.id == booking_id,
            Booking.user_id == user_id,
            Booking.status.in_(["confirmed", "pending"])
        )
    )
    booking = result.scalar_one_or_none()
    
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found or cannot be cancelled")
    
    # Check cancellation window (24 hours)
    booking_datetime = datetime.combine(booking.scheduled_date, booking.scheduled_time)
    if booking_datetime - datetime.utcnow() < timedelta(hours=24):
        raise HTTPException(
            status_code=422,
            detail="Cannot cancel booking less than 24 hours in advance"
        )
    
    # Cancel booking
    await db.execute(
        update(Booking)
        .where(Booking.id == booking_id)
        .values(
            status="cancelled",
            cancelled_at=datetime.utcnow(),
            cancellation_reason=reason
        )
    )
    await db.commit()
    
    return APIResponse(success=True, message="Booking cancelled successfully")
