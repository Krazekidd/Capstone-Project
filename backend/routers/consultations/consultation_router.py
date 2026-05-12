from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete, and_, or_, func, update
from datetime import datetime, date, time, timedelta
import uuid
import secrets
import logging
from typing import Optional, List
from database import get_user_db
from models import (
    User, 
    ConsultationType, 
    Booking, 
    Coach, 
    CoachAvailabilitySchedule, 
    CoachAvailabilityOverride,
    BusinessHours, 
    Holiday, 
    BookingHistory, 
    ConsultationFeedback,
    Waitlist, 
    EmailNotificationLog
)
from schemas import (
    ConsultationTypeResponse, 
    ConsultationTypeListResponse,
    AvailableSlotsResponse, 
    TimeSlotResponse, 
    MultiCoachAvailabilityResponse,
    CoachAvailabilityResponse, 
    ConsultationBookingRequest, 
    ConsultationBookingResponse,
    MyConsultationsResponse, 
    CancelConsultationResponse, 
    RescheduleBookingRequest,
    RescheduleConsultationResponse, 
    BusinessHoursResponse, 
    HolidayResponse,
    ConsultationStatsResponse, 
    BookingHistoryResponse, 
    ConsultationFeedbackRequest,
    ConsultationFeedbackResponse, 
    WaitlistRequest, 
    WaitlistResponse,
    BookingNoteRequest, 
    BookingNoteResponse,
    CoachAvailabilityScheduleRequest,
    CoachAvailabilityOverrideRequest
)
from ..auth.auth import get_current_user
from email_service import (
    send_consultation_confirmation_email, 
    send_consultation_cancellation_email,
    send_consultation_reminder_email,
    send_consultation_reschedule_email)


logger = logging.getLogger(__name__)
router = APIRouter(prefix="/consultations", tags=["consultations"])

# ============================================================
# HELPER FUNCTIONS
# ============================================================

def generate_booking_reference() -> str:
    """Generate unique booking reference"""
    return f"GV-{secrets.token_hex(4).upper()}"

def generate_time_slots(start_time: time, end_time: time, interval_minutes: int = 60):
    """Generate time slots between start and end time"""
    slots = []
    current = datetime.combine(date.today(), start_time)
    end = datetime.combine(date.today(), end_time)
    
    while current < end:
        slots.append(current.time())
        current += timedelta(minutes=interval_minutes)
    
    return slots

async def create_booking_history(
    db: AsyncSession,
    booking_id: uuid.UUID,
    action: str,
    previous_status: Optional[str] = None,
    new_status: Optional[str] = None,
    notes: Optional[str] = None,
    changed_by: Optional[str] = None
):
    """Create booking history entry"""
    history = BookingHistory(
        booking_id=booking_id,
        action=action,
        previous_status=previous_status,
        new_status=new_status,
        notes=notes,
        changed_by=changed_by
    )
    db.add(history)
    await db.flush()

async def get_available_coaches_for_slot(
    db: AsyncSession,
    booking_date: date,
    booking_time: time,
    duration_minutes: int
) -> List[Coach]:
    """Get coaches available for a specific time slot"""
    from sqlalchemy import and_, not_
    
    python_weekday = booking_date.weekday()
    postgres_dow = python_weekday + 1 if python_weekday < 6 else 0
    
    # Get coaches with availability schedule
    subquery = (
        select(CoachAvailabilitySchedule.coach_id)
        .where(
            and_(
                CoachAvailabilitySchedule.day_of_week == postgres_dow,
                CoachAvailabilitySchedule.is_active == True,
                CoachAvailabilitySchedule.open_time <= booking_time,
                CoachAvailabilitySchedule.close_time >= booking_time
            )
        )
    ).subquery()
    
    # Get coaches without conflicting bookings
    booked_coaches = (
        select(Booking.coach_id)
        .where(
            and_(
                Booking.scheduled_date == booking_date,
                Booking.scheduled_time == booking_time,
                Booking.status.in_(['confirmed', 'rescheduled'])
            )
        )
    ).subquery()
    
    query = (
        select(Coach)
        .where(
            and_(
                Coach.is_active == True,
                Coach.id.in_(select(subquery.c.coach_id)),
                ~Coach.id.in_(select(booked_coaches.c.coach_id))
            )
        )
    )
    
    result = await db.execute(query)
    coaches = result.scalars().all()
    
    logger.info(f"Found {len(coaches)} available coaches")
    return coaches
    
# ============================================================
# CONSULTATION TYPES ENDPOINTS
# ============================================================

@router.get("/types", response_model=ConsultationTypeListResponse)
async def get_consultation_types(
    active_only: bool = Query(True, description="Show only active types"),
    db: AsyncSession = Depends(get_user_db)
):
    """Get all available consultation types"""
    query = select(ConsultationType)
    if active_only:
        query = query.where(ConsultationType.is_active == True)
    
    query = query.order_by(ConsultationType.sort_order)
    result = await db.execute(query)
    types = result.scalars().all()
    
    return ConsultationTypeListResponse(
        types=[ConsultationTypeResponse.model_validate(ct) for ct in types],
        total=len(types)
    )

@router.get("/types/{slug}", response_model=ConsultationTypeResponse)
async def get_consultation_type_by_slug(
    slug: str,
    db: AsyncSession = Depends(get_user_db)
):
    """Get consultation type by slug"""
    result = await db.execute(
        select(ConsultationType).where(ConsultationType.slug == slug)
    )
    consultation_type = result.scalar_one_or_none()
    
    if not consultation_type:
        raise HTTPException(status_code=404, detail="Consultation type not found")
    
    return ConsultationTypeResponse.model_validate(consultation_type)

# ============================================================
# AVAILABILITY ENDPOINTS
# ============================================================
@router.get("/availability/{date_str}", response_model=MultiCoachAvailabilityResponse)
async def get_availability(
    date_str: str,
    consultation_type_id: Optional[uuid.UUID] = None,
    db: AsyncSession = Depends(get_user_db)
):
    """Get available time slots for a specific date (multi-coach)"""
    try:
        booking_date = datetime.strptime(date_str, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format")
    
    logger.info(f"=== Getting availability for {booking_date} ===")
    
    if booking_date < datetime.now().date():
        return MultiCoachAvailabilityResponse(date=booking_date, coaches=[])
    
    # Get business hours (using PostgreSQL DOW)
    postgres_dow = booking_date.weekday() + 1 if booking_date.weekday() < 6 else 0
    
    hours_result = await db.execute(
        select(BusinessHours).where(
            BusinessHours.day_of_week == postgres_dow,
            BusinessHours.is_open == True
        )
    )
    hours = hours_result.scalar_one_or_none()
    
    if not hours:
        logger.info(f"No business hours for DOW {postgres_dow}")
        return MultiCoachAvailabilityResponse(date=booking_date, coaches=[])
    
    # Generate time slots
    time_slots = generate_time_slots(hours.start_time, hours.end_time, hours.slot_interval_minutes)
    logger.info(f"Time slots: {[t.strftime('%H:%M') for t in time_slots]}")
    
    # Get all active coaches
    coaches_result = await db.execute(select(Coach).where(Coach.is_active == True))
    all_coaches = coaches_result.scalars().all()
    logger.info(f"Total coaches: {len(all_coaches)}")
    
    coach_responses = []
    
    for coach in all_coaches:
        coach_slots = []
        
        for slot in time_slots:
            # Check if coach has schedule for this slot
            schedule_result = await db.execute(
                select(CoachAvailabilitySchedule).where(
                    CoachAvailabilitySchedule.coach_id == coach.id,
                    CoachAvailabilitySchedule.day_of_week == postgres_dow,
                    CoachAvailabilitySchedule.is_active == True,
                    CoachAvailabilitySchedule.open_time <= slot,
                    CoachAvailabilitySchedule.close_time >= slot
                )
            )
            has_schedule = schedule_result.scalar_one_or_none() is not None
            
            # Check if booked
            booked_result = await db.execute(
                select(Booking).where(
                    Booking.scheduled_date == booking_date,
                    Booking.scheduled_time == slot,
                    Booking.coach_id == coach.id,
                    Booking.status.in_(['confirmed', 'rescheduled'])
                )
            )
            is_booked = booked_result.scalar_one_or_none() is not None
            
            coach_slots.append(TimeSlotResponse(
                time=slot.strftime("%H:%M:%S"),
                available=has_schedule and not is_booked,
                booked=is_booked,
                coach_id=coach.id
            ))
        
        # Only include coaches with at least one available slot
        if any(slot.available for slot in coach_slots):
            coach_responses.append(CoachAvailabilityResponse(
                coach_id=coach.id,
                coach_name=coach.full_name,
                slots=coach_slots
            ))
    
    logger.info(f"Returning {len(coach_responses)} coaches with availability")
    return MultiCoachAvailabilityResponse(
        date=booking_date,
        coaches=coach_responses
    )
async def is_coach_available_at_time(
    db: AsyncSession,
    coach_id: uuid.UUID,
    booking_date: date,
    booking_time: time,
    duration_minutes: int
) -> bool:
    """Check if a coach is available at a specific time"""
    day_of_week = booking_date.weekday()
    
    # Check for override first
    override_result = await db.execute(
        select(CoachAvailabilityOverride).where(
            CoachAvailabilityOverride.coach_id == coach_id,
            CoachAvailabilityOverride.override_date == booking_date
        )
    )
    override = override_result.scalar_one_or_none()
    
    if override:
        if override.is_closed:
            return False
        if override.open_time and override.close_time:
            # Use override hours
            if booking_time < override.open_time or booking_time >= override.close_time:
                return False
            return True
    
    # Check regular schedule
    schedule_result = await db.execute(
        select(CoachAvailabilitySchedule).where(
            CoachAvailabilitySchedule.coach_id == coach_id,
            CoachAvailabilitySchedule.day_of_week == day_of_week,
            CoachAvailabilitySchedule.is_active == True
        )
    )
    schedule = schedule_result.scalar_one_or_none()
    
    if not schedule:
        return False
    
    # Check if time is within schedule hours
    end_time = (datetime.combine(date.today(), schedule.close_time) - timedelta(minutes=duration_minutes)).time()
    
    return schedule.open_time <= booking_time <= end_time

# ============================================================
# BOOKING ENDPOINTS
# ============================================================
@router.post("/book", response_model=ConsultationBookingResponse, status_code=201)
async def book_consultation(
    request: ConsultationBookingRequest,
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db)
):
    """Book a consultation"""
    try:
        user_id = current_user.get("user_id")
        
        # Get user
        user_result = await db.execute(
            select(User).where(User.id == user_id)
        )
        user = user_result.scalar_one_or_none()
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Get consultation type
        type_result = await db.execute(
            select(ConsultationType).where(ConsultationType.id == request.consultation_type_id)
        )
        consultation_type = type_result.scalar_one_or_none()
        
        if not consultation_type:
            raise HTTPException(status_code=404, detail="Consultation type not found")
        
        # Check availability
        available_coaches = await get_available_coaches_for_slot(
            db, request.booking_date, request.booking_time, consultation_type.duration_minutes
        )
        
        coach_id = request.coach_id
        if not coach_id and available_coaches:
            coach_id = available_coaches[0].id
        elif coach_id and coach_id not in [c.id for c in available_coaches]:
            raise HTTPException(status_code=400, detail="Coach not available at this time")
        elif not coach_id and not available_coaches:
            raise HTTPException(status_code=400, detail="No coaches available at this time")
        
        # Generate booking reference
        booking_ref = generate_booking_reference()
        
        # Create booking
        new_booking = Booking(
            reference=booking_ref,
            user_id=user.id,
            consultation_type_id=consultation_type.id,
            coach_id=coach_id,
            scheduled_date=request.booking_date,
            scheduled_time=request.booking_time,
            timezone="America/New_York",
            format=request.format,
            status="confirmed",
            price_charged=consultation_type.price,
            currency=consultation_type.currency,
            notes=request.notes,
            agreed_cancellation_policy=request.agreed_cancellation_policy,
            confirmed_at=datetime.now()
        )
        
        db.add(new_booking)
        await db.commit()
        await db.refresh(new_booking)
        
        # Get coach name
        coach_name = None
        if new_booking.coach_id:
            coach_result = await db.execute(
                select(Coach).where(Coach.id == new_booking.coach_id)
            )
            coach = coach_result.scalar_one_or_none()
            coach_name = coach.full_name if coach else None
        
        # Send confirmation email
        background_tasks.add_task(
            send_consultation_confirmation_email,
            client_email=user.email,
            client_name=str(user.first_name+" "+user.last_name),
            consultation_title=consultation_type.name,
            booking_date=new_booking.scheduled_date,
            booking_time=new_booking.scheduled_time.strftime("%H:%M"),
            format=new_booking.format,
            booking_reference=new_booking.reference,
            duration_minutes = consultation_type.duration_minutes,
            coach_name = coach_name
        )        
        return ConsultationBookingResponse(
            id=new_booking.id,
            reference=new_booking.reference,
            consultation_type_id=consultation_type.id,
            consultation_type_name=consultation_type.name,
            coach_id=new_booking.coach_id,
            coach_name=coach_name,
            booking_date=new_booking.scheduled_date,
            booking_time=new_booking.scheduled_time.strftime("%H:%M"),
            format=new_booking.format,
            status=new_booking.status,
            price_charged=new_booking.price_charged,
            currency=new_booking.currency,
            notes=new_booking.notes,
            scheduled_date=new_booking.scheduled_date,
            scheduled_time=new_booking.scheduled_time,
            created_at=new_booking.created_at,
            cancelled_at=new_booking.cancelled_at,
            completed_at=new_booking.completed_at
        )
    except Exception as e:
        logger.error(f"Booking error: {str(e)}")
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/my-bookings", response_model=MyConsultationsResponse)
async def get_my_consultations(
    status_filter: Optional[str] = Query(None, description="Filter by status"),
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db)
):
    """Get current user's consultation bookings"""
    user_id = current_user.get("user_id")
    
    now = datetime.now()
    today = now.date()
    current_time = now.time()
    
    # Base query
    query = select(Booking, ConsultationType, Coach).join(
        ConsultationType, Booking.consultation_type_id == ConsultationType.id
    ).outerjoin(
        Coach, Booking.coach_id == Coach.id
    ).where(Booking.user_id == user_id)
    
    if status_filter:
        query = query.where(Booking.status == status_filter)
    
    # Get upcoming bookings (future dates or today with future time)
    upcoming_query = query.where(
        or_(
            Booking.scheduled_date > today,
            and_(
                Booking.scheduled_date == today,
                Booking.scheduled_time > current_time
            )
        ),
        Booking.status.in_(['confirmed', 'rescheduled'])
    ).order_by(Booking.scheduled_date, Booking.scheduled_time)
    
    upcoming_result = await db.execute(upcoming_query)
    upcoming_rows = upcoming_result.all()
    
    # Get past bookings
    past_query = query.where(
        or_(
            Booking.scheduled_date < today,
            and_(
                Booking.scheduled_date == today,
                Booking.scheduled_time <= current_time
            )
        ),
        Booking.status.in_(['completed', 'cancelled', 'no_show'])
    ).order_by(Booking.scheduled_date.desc(), Booking.scheduled_time.desc())
    
    past_result = await db.execute(past_query)
    past_rows = past_result.all()
    
    def map_booking(booking, consultation_type, coach):
        return ConsultationBookingResponse(
            id=booking.id,
            reference=booking.reference,
            consultation_type_id=consultation_type.id,
            consultation_type_name=consultation_type.name,
            coach_id=booking.coach_id,
            coach_name=coach.full_name if coach else None,
            booking_date=booking.scheduled_date,
            booking_time=booking.scheduled_time.strftime("%H:%M"),
            format=booking.format,
            status=booking.status,
            price_charged=booking.price_charged,
            currency=booking.currency,
            notes=booking.notes,
            scheduled_date=booking.scheduled_date,
            scheduled_time=booking.scheduled_time,
            created_at=booking.created_at,
            cancelled_at=booking.cancelled_at,
            completed_at=booking.completed_at
        )
    
    upcoming = [map_booking(b, ct, c) for b, ct, c in upcoming_rows]
    past = [map_booking(b, ct, c) for b, ct, c in past_rows]
    
    return MyConsultationsResponse(
        upcoming=upcoming,
        past=past,
        total_upcoming=len(upcoming),
        total_past=len(past)
    )

@router.patch("/bookings/{booking_id}", response_model=CancelConsultationResponse)
async def cancel_consultation(
    booking_id: uuid.UUID,
    background_tasks: BackgroundTasks = None,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db)
):
    """Cancel a consultation booking"""
    user_id = current_user.get("user_id")
    
    result = await db.execute(
        select(Booking, ConsultationType, User)
        .join(ConsultationType, Booking.consultation_type_id == ConsultationType.id)
        .join(User, Booking.user_id == User.id)
        .where(Booking.id == booking_id)
        .where(Booking.user_id == user_id)
    )
    row = result.first()
    
    if not row:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    booking, consultation_type, user = row
    
    if booking.status != "confirmed":
        raise HTTPException(status_code=400, detail="Booking already cancelled or completed")
    
    # Check if cancellation is allowed (at least 24 hours before)
    now = datetime.now()
    booking_datetime = datetime.combine(booking.scheduled_date, booking.scheduled_time)
    hours_until = (booking_datetime - now).total_seconds() / 3600
    
    refund_amount = None
    if hours_until >= 24:
        # Full refund for paid consultations
        if consultation_type.price > 0:
            refund_amount = float(consultation_type.price)
    else:
        raise HTTPException(
            status_code=400, 
            detail="Cancellations must be made at least 24 hours before the consultation"
        )
    
    # Update booking status
    booking.status = "cancelled"
    booking.cancelled_at = now
    booking.cancellation_reason = "none"
    
    # Create booking history
    await create_booking_history(
        db, booking.id, 'cancelled',
        previous_status='confirmed',
        new_status='cancelled',
        changed_by=user.email
    )
    
    await db.commit()
    await db.refresh(booking)
    
    # Send cancellation email
    background_tasks.add_task(
        send_consultation_cancellation_email,
        client_email=user.email,
        client_name=str(user.first_name+" "+user.last_name),
        consultation_title=consultation_type.name,
        booking_date=booking.scheduled_date,
        booking_time=booking.scheduled_time.strftime("%H:%M"),
        booking_reference=booking.reference,
        refund_amount=refund_amount,
    )
    
    return CancelConsultationResponse(
        message="Consultation cancelled successfully",
        booking_id=booking.id,
        refund_amount=refund_amount,
        cancelled_at=booking.cancelled_at
    )


@router.patch("/bookings/reschedule/{booking_id}")
async def reschedule_consultation(
    booking_id: uuid.UUID,
    request: RescheduleBookingRequest,
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db)
):
    """Reschedule a consultation booking"""
    try:
        logger.info(f"=== RESCHEDULE REQUEST ===")
        logger.info(f"Booking ID: {booking_id}")
        logger.info(f"Request body: new_date={request.new_date}, new_time={request.new_time}, reason={request.reason}")
        
        user_id = current_user.get("user_id")
        logger.info(f"User ID: {user_id}")
        
        # Get the booking
        result = await db.execute(
            select(Booking, ConsultationType)
            .join(ConsultationType, Booking.consultation_type_id == ConsultationType.id)
            .where(Booking.id == booking_id)
            .where(Booking.user_id == user_id)
        )
        row = result.first()
        
        if not row:
            logger.error(f"Booking not found: {booking_id}")
            raise HTTPException(status_code=404, detail="Booking not found")
        
        booking, consultation_type = row
        logger.info(f"Found booking: {booking.reference}, current date: {booking.scheduled_date}")
        
        # Check if booking can be rescheduled
        if booking.status not in ["confirmed", "rescheduled"]:
            logger.error(f"Cannot reschedule booking with status: {booking.status}")
            raise HTTPException(status_code=400, detail=f"Cannot reschedule {booking.status} bookings")
        
        # Check if new date is in the future
        if request.new_date < datetime.now().date():
            logger.error(f"New date {request.new_date} is in the past")
            raise HTTPException(status_code=400, detail="New date must be in the future")
        
        # Store old values for response
        old_date = booking.scheduled_date
        old_time = booking.scheduled_time
        
        # Update booking
        booking.scheduled_date = request.new_date
        booking.scheduled_time = request.new_time
        booking.status = "rescheduled"
        booking.updated_at = datetime.now()
        
        # Create history entry
        history = BookingHistory(
            booking_id=booking.id,
            action='rescheduled',
            previous_status='confirmed',
            new_status='rescheduled',
            notes=f"Rescheduled from {old_date} {old_time} to {request.new_date} {request.new_time}. Reason: {request.reason}",
            changed_by=current_user.get("email", "user")
        )
        db.add(history)
        
        await db.commit()
        await db.refresh(booking)
        
        logger.info(f"Successfully rescheduled booking {booking_id}")
        # Send confirmation email
        background_tasks.add_task(
            send_consultation_reschedule_email,
            client_email=user.email,
            client_name=str(user.first_name+" "+user.last_name),
            consultation_title=consultation_type.name,
            old_date=old_date,
            old_time=old_time,
            new_date=new_booking.scheduled_date,
            new_time=new_booking.scheduled_time.strftime("%H:%M"),
            booking_reference=new_booking.reference
        )         
        return {
            "message": "Consultation rescheduled successfully",
            "booking_id": str(booking.id),
            "old_date": old_date.isoformat(),
            "old_time": old_time.strftime("%H:%M:%S"),
            "new_date": request.new_date.isoformat(),
            "new_time": request.new_time.strftime("%H:%M:%S"),
            "reference": booking.reference
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Reschedule error: {str(e)}", exc_info=True)
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}")
        
#test endpoint for reschedule
@router.get("/bookings/{booking_id}/test")
async def test_endpoint(booking_id: uuid.UUID):
    """Test endpoint to verify router is working"""
    return {"message": f"Endpoint working for booking {booking_id}"}

# ============================================================
# FEEDBACK ENDPOINTS
# ============================================================

@router.post("/bookings/{booking_id}/feedback", response_model=ConsultationFeedbackResponse)
async def submit_consultation_feedback(
    booking_id: uuid.UUID,
    request: ConsultationFeedbackRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db)
):
    """Submit feedback for a completed consultation"""
    user_id = current_user.get("user_id")
    
    # Verify booking belongs to user and is completed
    result = await db.execute(
        select(Booking).where(
            Booking.id == booking_id,
            Booking.user_id == user_id,
            Booking.status == "completed"
        )
    )
    booking = result.scalar_one_or_none()
    
    if not booking:
        raise HTTPException(
            status_code=404, 
            detail="Completed booking not found"
        )
    
    # Check if feedback already exists
    existing = await db.execute(
        select(ConsultationFeedback).where(ConsultationFeedback.booking_id == booking_id)
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Feedback already submitted for this booking")
    
    feedback = ConsultationFeedback(
        booking_id=booking_id,
        rating=request.rating,
        review=request.review,
        would_recommend=request.would_recommend
    )
    
    db.add(feedback)
    await db.commit()
    await db.refresh(feedback)
    
    return ConsultationFeedbackResponse.model_validate(feedback)

# ============================================================
# STATISTICS ENDPOINTS
# ============================================================

@router.get("/stats", response_model=ConsultationStatsResponse)
async def get_consultation_stats(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db)
):
    """Get consultation statistics for current user"""
    user_id = current_user.get("user_id")
    
    # Get all bookings
    result = await db.execute(
        select(Booking).where(Booking.user_id == user_id)
    )
    bookings = result.scalars().all()
    
    total_bookings = len(bookings)
    completed_bookings = sum(1 for b in bookings if b.status == "completed")
    cancelled_bookings = sum(1 for b in bookings if b.status == "cancelled")
    upcoming_bookings = sum(
        1 for b in bookings 
        if b.status in ["confirmed", "rescheduled"] 
        and b.scheduled_date >= datetime.now().date()
    )
    
    # Get average rating
    rating_result = await db.execute(
        select(func.avg(ConsultationFeedback.rating))
        .join(Booking, ConsultationFeedback.booking_id == Booking.id)
        .where(Booking.user_id == user_id)
    )
    avg_rating = rating_result.scalar_one_or_none()
    
    # Get total spent
    total_spent = sum(
        b.price_charged for b in bookings 
        if b.status in ["completed", "confirmed"]
    )
    
    return ConsultationStatsResponse(
        total_bookings=total_bookings,
        completed_bookings=completed_bookings,
        cancelled_bookings=cancelled_bookings,
        upcoming_bookings=upcoming_bookings,
        average_rating=float(avg_rating) if avg_rating else None,
        total_spent=total_spent,
        currency="USD"
    )

# ============================================================
# BUSINESS HOURS & HOLIDAYS
# ============================================================

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
        query = query.where(func.extract('year', Holiday.holiday_date) == year)
    
    result = await db.execute(query.order_by(Holiday.holiday_date))
    holidays = result.scalars().all()
    
    return [
        HolidayResponse(
            id=h.id,
            holiday_date=h.holiday_date,
            name=h.name,
            is_closed=h.is_closed
        )
        for h in holidays
    ]

# ============================================================
# HELPER FUNCTION FOR REMINDERS
# ============================================================

async def schedule_reminder_email(booking_id: uuid.UUID, booking_time: time, user_email: str):
    """Schedule reminder email to be sent 24 hours before booking"""
    # This would typically use a task queue like Celery
    # For now, just log that reminder would be sent
    logger.info(f"Reminder would be sent for booking {booking_id} to {user_email} 24 hours before {booking_time}")




@router.get("/bookings/{booking_id}/history", response_model=List[BookingHistoryResponse])
async def get_booking_history(
    booking_id: uuid.UUID,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db)
):
    """Get booking history/audit log"""
    user_id = current_user.get("user_id")
    user_role = current_user.get("role", "client")
    
    # Verify booking ownership for non-admin
    if user_role != "admin":
        booking_check = await db.execute(
            select(Booking).where(Booking.id == booking_id, Booking.user_id == user_id)
        )
        if not booking_check.scalar_one_or_none():
            raise HTTPException(status_code=404, detail="Booking not found")
    
    result = await db.execute(
        select(BookingHistory)
        .where(BookingHistory.booking_id == booking_id)
        .order_by(BookingHistory.created_at.desc())
    )
    history = result.scalars().all()
    
    return [BookingHistoryResponse.model_validate(h) for h in history]


@router.post("/bookings/{booking_id}/notes", response_model=BookingNoteResponse)
async def add_booking_note(
    booking_id: uuid.UUID,
    request: BookingNoteRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db)
):
    """Add a note to a booking"""
    user_id = current_user.get("user_id")
    user_email = current_user.get("email", "system")
    
    # Verify booking exists and belongs to user
    result = await db.execute(
        select(Booking).where(Booking.id == booking_id, Booking.user_id == user_id)
    )
    booking = result.scalar_one_or_none()
    
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    # Create note in booking history
    await create_booking_history(
        db, booking_id, 'note_added',
        notes=request.note,
        changed_by=user_email
    )
    
    await db.commit()
    
    # Get the created history entry
    history_result = await db.execute(
        select(BookingHistory)
        .where(BookingHistory.booking_id == booking_id)
        .where(BookingHistory.action == 'note_added')
        .order_by(BookingHistory.created_at.desc())
        .limit(1)
    )
    history = history_result.scalar_one_or_none()
    
    return BookingNoteResponse(
        id=history.id if history else uuid.uuid4(),
        booking_id=booking_id,
        note=request.note,
        created_by=user_email,
        created_at=history.created_at if history else datetime.now()
    )


@router.get("/bookings/{booking_id}/notes", response_model=List[BookingNoteResponse])
async def get_booking_notes(
    booking_id: uuid.UUID,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db)
):
    """Get all notes for a booking"""
    user_id = current_user.get("user_id")
    user_role = current_user.get("role", "client")
    
    # Verify booking ownership for non-admin
    if user_role != "admin":
        booking_check = await db.execute(
            select(Booking).where(Booking.id == booking_id, Booking.user_id == user_id)
        )
        if not booking_check.scalar_one_or_none():
            raise HTTPException(status_code=404, detail="Booking not found")
    
    result = await db.execute(
        select(BookingHistory)
        .where(
            BookingHistory.booking_id == booking_id,
            BookingHistory.action == 'note_added'
        )
        .order_by(BookingHistory.created_at.desc())
    )
    notes = result.scalars().all()
    
    return [
        BookingNoteResponse(
            id=note.id,
            booking_id=note.booking_id,
            note=note.notes or "",
            created_by=note.changed_by or "system",
            created_at=note.created_at
        )
        for note in notes
    ]

# ============================================================
# SINGLE BOOKING ENDPOINTS
# ============================================================

@router.get("/bookings/{booking_id}", response_model=ConsultationBookingResponse)
async def get_booking(
    booking_id: uuid.UUID,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db)
):
    """Get single booking by ID"""
    user_id = current_user.get("user_id")
    user_role = current_user.get("role", "client")
    
    # Build query
    query = select(Booking, ConsultationType, Coach).join(
        ConsultationType, Booking.consultation_type_id == ConsultationType.id
    ).outerjoin(
        Coach, Booking.coach_id == Coach.id
    ).where(Booking.id == booking_id)
    
    # Non-admin users can only see their own bookings
    if user_role != "admin":
        query = query.where(Booking.user_id == user_id)
    
    result = await db.execute(query)
    row = result.first()
    
    if not row:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    booking, consultation_type, coach = row
    
    return ConsultationBookingResponse(
        id=booking.id,
        reference=booking.reference,
        consultation_type_id=consultation_type.id,
        consultation_type_name=consultation_type.name,
        coach_id=booking.coach_id,
        coach_name=coach.full_name if coach else None,
        booking_date=booking.scheduled_date,
        booking_time=booking.scheduled_time.strftime("%H:%M"),
        format=booking.format,
        status=booking.status,
        price_charged=booking.price_charged,
        currency=booking.currency,
        notes=booking.notes,
        scheduled_date=booking.scheduled_date,
        scheduled_time=booking.scheduled_time,
        created_at=booking.created_at,
        cancelled_at=booking.cancelled_at,
        completed_at=booking.completed_at
    )

# ============================================================
# ELIGIBILITY ENDPOINTS
# ============================================================

@router.get("/eligibility/{consultation_type_id}")
async def check_eligibility(
    consultation_type_id: uuid.UUID,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db)
):
    """Check if user is eligible for a consultation type"""
    user_id = current_user.get("user_id")
    
    # Get user
    user_result = await db.execute(
        select(User).where(User.id == user_id)
    )
    user = user_result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get consultation type
    type_result = await db.execute(
        select(ConsultationType).where(ConsultationType.id == consultation_type_id)
    )
    consultation_type = type_result.scalar_one_or_none()
    
    if not consultation_type:
        raise HTTPException(status_code=404, detail="Consultation type not found")
    
    # Check eligibility
    is_eligible = True
    reason = None
    
    if consultation_type.requires_membership:
        required_tier = consultation_type.requires_membership.value if hasattr(consultation_type.requires_membership, 'value') else consultation_type.requires_membership
        user_tier = user.membership_tier.value if hasattr(user.membership_tier, 'value') else user.membership_tier
        
        tier_order = {'free': 0, 'basic': 1, 'premium': 2, 'elite': 3}
        if tier_order.get(user_tier, 0) < tier_order.get(required_tier, 0):
            is_eligible = False
            reason = f"This consultation requires {required_tier} membership or higher"
    
    # Check if user has already booked this type (limit 1 per type for free consultations)
    if consultation_type.price == 0:
        existing = await db.execute(
            select(Booking).where(
                Booking.user_id == user_id,
                Booking.consultation_type_id == consultation_type_id,
                Booking.status.in_(['confirmed', 'completed'])
            )
        )
        if existing.scalar_one_or_none():
            is_eligible = False
            reason = "You have already booked this free consultation"
    
    return {
        "eligible": is_eligible,
        "reason": reason,
        "consultation_type": {
            "id": consultation_type.id,
            "name": consultation_type.name,
            "requires_membership": consultation_type.requires_membership,
            "price": consultation_type.price
        },
        "user_membership_tier": user.membership_tier
    }


# ============================================================
# WAITLIST ENDPOINTS
# ============================================================

@router.post("/waitlist", response_model=WaitlistResponse)
async def join_waitlist(
    request: WaitlistRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db)
):
    """Join waitlist for a consultation type"""
    user_id = current_user.get("user_id")
    
    # Check if consultation type exists
    type_result = await db.execute(
        select(ConsultationType).where(ConsultationType.id == request.consultation_type_id)
    )
    consultation_type = type_result.scalar_one_or_none()
    
    if not consultation_type:
        raise HTTPException(status_code=404, detail="Consultation type not found")
    
    # Check if already on waitlist
    existing = await db.execute(
        select(Waitlist).where(
            Waitlist.user_id == user_id,
            Waitlist.consultation_type_id == request.consultation_type_id,
            Waitlist.status == 'waiting'
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Already on waitlist for this consultation")
    
    # Create waitlist entry
    waitlist_entry = Waitlist(
        user_id=user_id,
        consultation_type_id=request.consultation_type_id,
        preferred_date_start=request.preferred_date_start,
        preferred_date_end=request.preferred_date_end,
        status='waiting'
    )
    
    db.add(waitlist_entry)
    await db.commit()
    await db.refresh(waitlist_entry)
    
    return WaitlistResponse(
        id=waitlist_entry.id,
        consultation_type_id=consultation_type.id,
        consultation_type_name=consultation_type.name,
        status=waitlist_entry.status,
        created_at=waitlist_entry.created_at
    )


@router.get("/waitlist", response_model=List[WaitlistResponse])
async def get_my_waitlist(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db)
):
    """Get user's waitlist entries"""
    user_id = current_user.get("user_id")
    
    result = await db.execute(
        select(Waitlist, ConsultationType)
        .join(ConsultationType, Waitlist.consultation_type_id == ConsultationType.id)
        .where(Waitlist.user_id == user_id, Waitlist.status == 'waiting')
        .order_by(Waitlist.created_at.desc())
    )
    waitlist_entries = result.all()
    
    return [
        WaitlistResponse(
            id=entry.id,
            consultation_type_id=entry.consultation_type_id,
            consultation_type_name=consultation_type.name,
            status=entry.status,
            created_at=entry.created_at
        )
        for entry, consultation_type in waitlist_entries
    ]


@router.delete("/waitlist/{waitlist_id}")
async def leave_waitlist(
    waitlist_id: uuid.UUID,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db)
):
    """Remove user from waitlist"""
    user_id = current_user.get("user_id")
    
    result = await db.execute(
        select(Waitlist).where(
            Waitlist.id == waitlist_id,
            Waitlist.user_id == user_id,
            Waitlist.status == 'waiting'
        )
    )
    waitlist_entry = result.scalar_one_or_none()
    
    if not waitlist_entry:
        raise HTTPException(status_code=404, detail="Waitlist entry not found")
    
    waitlist_entry.status = 'expired'
    await db.commit()
    
    return {"message": "Removed from waitlist successfully"}


# ============================================================
# REMINDER ENDPOINTS
# ============================================================

@router.post("/bookings/remind/{booking_id}")
async def send_reminder(
    booking_id: uuid.UUID,
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db)
):
    """Send reminder for booking (manual or automated)"""
    user_id = current_user.get("user_id")
    user_role = current_user.get("role", "client")
    
    # Get booking with user details
    result = await db.execute(
        select(Booking, User, ConsultationType)
        .join(User, Booking.user_id == User.id)
        .join(ConsultationType, Booking.consultation_type_id == ConsultationType.id)
        .where(Booking.id == booking_id)
    )
    row = result.first()
    
    if not row:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    booking, user, consultation_type = row
    
    # Verify permission
    if user_role != "admin" and booking.user_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to send reminder for this booking")
    
    # Check if reminder already sent today
    today_start = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
    reminder_check = await db.execute(
        select(EmailNotificationLog).where(
            EmailNotificationLog.booking_id == booking_id,
            EmailNotificationLog.email_type == 'reminder',
            EmailNotificationLog.sent_at >= today_start
        )
    )
    if reminder_check.scalar_one_or_none() and user_role != "admin":
        raise HTTPException(status_code=400, detail="Reminder already sent today")
    
    # Send reminder email
    background_tasks.add_task(
        send_consultation_reminder_email,
        client_email=user.email,
        client_name=str(user.first_name+" "+user.last_name),
        consultation_title=consultation_type.name,
        booking_date=booking.scheduled_date,
        booking_time=booking.scheduled_time.strftime("%H:%M"),
        booking_reference=booking.reference,
        coach_name=None  # Could fetch coach name if needed
    )
    
    # Log the reminder
    email_log = EmailNotificationLog(
        booking_id=booking_id,
        email_type='reminder',
        recipient_email=user.email,
        status='sent'
    )
    db.add(email_log)
    await db.commit()
    
    return {"message": "Reminder sent successfully", "sent_at": datetime.now()}


# ============================================================
# ADMIN COACH AVAILABILITY ENDPOINTS
# ============================================================

@router.get("/coaches/{coach_id}/availability")
async def get_coach_availability(
    coach_id: uuid.UUID,
    start_date: date,
    end_date: date,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db)
):
    """Get coach availability for a date range (admin only)"""
    user_role = current_user.get("role", "client")
    if user_role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Get coach
    coach_result = await db.execute(
        select(Coach).where(Coach.id == coach_id)
    )
    coach = coach_result.scalar_one_or_none()
    
    if not coach:
        raise HTTPException(status_code=404, detail="Coach not found")
    
    # Get regular schedule
    schedule_result = await db.execute(
        select(CoachAvailabilitySchedule)
        .where(CoachAvailabilitySchedule.coach_id == coach_id)
        .where(CoachAvailabilitySchedule.is_active == True)
    )
    regular_schedule = schedule_result.scalars().all()
    
    # Get overrides for date range
    override_result = await db.execute(
        select(CoachAvailabilityOverride)
        .where(
            CoachAvailabilityOverride.coach_id == coach_id,
            CoachAvailabilityOverride.override_date.between(start_date, end_date)
        )
    )
    overrides = {o.override_date: o for o in override_result.scalars().all()}
    
    # Get existing bookings for date range
    booking_result = await db.execute(
        select(Booking)
        .where(
            Booking.coach_id == coach_id,
            Booking.scheduled_date.between(start_date, end_date),
            Booking.status.in_(['confirmed', 'rescheduled'])
        )
    )
    bookings = booking_result.scalars().all()
    
    # Build availability response
    availability = []
    current = start_date
    while current <= end_date:
        day_of_week = current.weekday()
        override = overrides.get(current)
        
        if override and override.is_closed:
            availability.append({
                "date": current,
                "available": False,
                "reason": "Closed (override)",
                "slots": []
            })
        elif override and not override.is_closed:
            # Use override hours
            slots = generate_time_slots(override.open_time, override.close_time, 60)
            booked_times = [b.scheduled_time for b in bookings if b.scheduled_date == current]
            availability.append({
                "date": current,
                "available": True,
                "reason": None,
                "slots": [
                    {
                        "time": slot,
                        "available": slot not in booked_times,
                        "booked": slot in booked_times
                    }
                    for slot in slots
                ]
            })
        else:
            # Use regular schedule
            schedule = next((s for s in regular_schedule if s.day_of_week == day_of_week), None)
            if schedule and schedule.open_time and schedule.close_time:
                slots = generate_time_slots(schedule.open_time, schedule.close_time, schedule.slot_interval_minutes or 60)
                booked_times = [b.scheduled_time for b in bookings if b.scheduled_date == current and b.status!="cancelled"]
                availability.append({
                    "date": current,
                    "available": True,
                    "reason": None,
                    "slots": [
                        {
                            "time": slot.strftime("%H:%M:%S"),
                            "available": slot not in booked_times,
                            "booked": slot in booked_times
                        }
                        for slot in slots
                    ]
                })
            else:
                availability.append({
                    "date": current,
                    "available": False,
                    "reason": "No schedule",
                    "slots": []
                })
        
        current += timedelta(days=1)
    
    return {
        "coach_id": coach_id,
        "coach_name": coach.full_name,
        "availability": availability
    }


@router.post("/coaches/{coach_id}/availability/schedule")
async def create_coach_schedule(
    coach_id: uuid.UUID,
    request: CoachAvailabilityScheduleRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db)
):
    """Create coach availability schedule (admin only)"""
    user_role = current_user.get("role", "client")
    if user_role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Check if coach exists
    coach_result = await db.execute(
        select(Coach).where(Coach.id == coach_id)
    )
    if not coach_result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Coach not found")
    
    # Check if schedule already exists for this day
    existing = await db.execute(
        select(CoachAvailabilitySchedule)
        .where(
            CoachAvailabilitySchedule.coach_id == coach_id,
            CoachAvailabilitySchedule.day_of_week == request.day_of_week
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail=f"Schedule already exists for day {request.day_of_week}")
    
    # Parse times if strings
    open_time = request.open_time
    close_time = request.close_time
    if isinstance(open_time, str):
        open_time = datetime.strptime(open_time, "%H:%M:%S").time()
    if isinstance(close_time, str):
        close_time = datetime.strptime(close_time, "%H:%M:%S").time()
    
    schedule = CoachAvailabilitySchedule(
        coach_id=coach_id,
        day_of_week=request.day_of_week,
        open_time=open_time,
        close_time=close_time,
        is_active=request.is_active
    )
    
    db.add(schedule)
    await db.commit()
    await db.refresh(schedule)
    
    return {
        "id": schedule.id,
        "coach_id": schedule.coach_id,
        "day_of_week": schedule.day_of_week,
        "open_time": schedule.open_time.strftime("%H:%M:%S"),
        "close_time": schedule.close_time.strftime("%H:%M:%S"),
        "is_active": schedule.is_active
    }


@router.put("/coaches/{coach_id}/availability/schedule/{schedule_id}")
async def update_coach_schedule(
    coach_id: uuid.UUID,
    schedule_id: uuid.UUID,
    request: CoachAvailabilityScheduleRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db)
):
    """Update coach availability schedule (admin only)"""
    user_role = current_user.get("role", "client")
    if user_role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    result = await db.execute(
        select(CoachAvailabilitySchedule)
        .where(
            CoachAvailabilitySchedule.id == schedule_id,
            CoachAvailabilitySchedule.coach_id == coach_id
        )
    )
    schedule = result.scalar_one_or_none()
    
    if not schedule:
        raise HTTPException(status_code=404, detail="Schedule not found")
    
    # Update fields
    if request.open_time:
        open_time = request.open_time if isinstance(request.open_time, time) else datetime.strptime(request.open_time, "%H:%M:%S").time()
        schedule.open_time = open_time
    if request.close_time:
        close_time = request.close_time if isinstance(request.close_time, time) else datetime.strptime(request.close_time, "%H:%M:%S").time()
        schedule.close_time = close_time
    schedule.is_active = request.is_active
    
    await db.commit()
    await db.refresh(schedule)
    
    return {"message": "Schedule updated successfully"}


@router.post("/coaches/{coach_id}/availability/overrides")
async def create_coach_override(
    coach_id: uuid.UUID,
    request: CoachAvailabilityOverrideRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db)
):
    """Create coach availability override (admin only)"""
    user_role = current_user.get("role", "client")
    if user_role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Parse times if strings
    open_time = None
    close_time = None
    if request.open_time:
        open_time = request.open_time if isinstance(request.open_time, time) else datetime.strptime(request.open_time, "%H:%M:%S").time()
    if request.close_time:
        close_time = request.close_time if isinstance(request.close_time, time) else datetime.strptime(request.close_time, "%H:%M:%S").time()
    
    override = CoachAvailabilityOverride(
        coach_id=coach_id,
        override_date=request.override_date,
        is_closed=request.is_closed,
        open_time=open_time,
        close_time=close_time,
        reason=request.reason
    )
    
    db.add(override)
    await db.commit()
    await db.refresh(override)
    
    return {
        "id": override.id,
        "coach_id": override.coach_id,
        "override_date": override.override_date,
        "is_closed": override.is_closed,
        "open_time": override.open_time.strftime("%H:%M:%S") if override.open_time else None,
        "close_time": override.close_time.strftime("%H:%M:%S") if override.close_time else None,
        "reason": override.reason
    }


@router.delete("/coaches/{coach_id}/availability/overrides/{override_id}")
async def delete_coach_override(
    coach_id: uuid.UUID,
    override_id: uuid.UUID,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db)
):
    """Delete coach availability override (admin only)"""
    user_role = current_user.get("role", "client")
    if user_role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    result = await db.execute(
        delete(CoachAvailabilityOverride)
        .where(
            CoachAvailabilityOverride.id == override_id,
            CoachAvailabilityOverride.coach_id == coach_id
        )
    )
    
    if result.rowcount == 0:
        raise HTTPException(status_code=404, detail="Override not found")
    
    await db.commit()
    
    return {"message": "Override deleted successfully"}


# ============================================================
# ADMIN BOOKING MANAGEMENT
# ============================================================

@router.get("/admin/bookings")
async def get_all_bookings(
    status: Optional[str] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    coach_id: Optional[uuid.UUID] = None,
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db)
):
    """Get all bookings with filters (admin only)"""
    user_role = current_user.get("role", "client")
    if user_role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    query = select(Booking, User, ConsultationType, Coach).join(
        User, Booking.user_id == User.id
    ).join(
        ConsultationType, Booking.consultation_type_id == ConsultationType.id
    ).outerjoin(
        Coach, Booking.coach_id == Coach.id
    )
    
    # Apply filters
    if status:
        query = query.where(Booking.status == status)
    if start_date:
        query = query.where(Booking.scheduled_date >= start_date)
    if end_date:
        query = query.where(Booking.scheduled_date <= end_date)
    if coach_id:
        query = query.where(Booking.coach_id == coach_id)
    
    # Get total count
    count_query = select(func.count()).select_from(Booking)
    if status:
        count_query = count_query.where(Booking.status == status)
    if start_date:
        count_query = count_query.where(Booking.scheduled_date >= start_date)
    if end_date:
        count_query = count_query.where(Booking.scheduled_date <= end_date)
    if coach_id:
        count_query = count_query.where(Booking.coach_id == coach_id)
    
    total_result = await db.execute(count_query)
    total = total_result.scalar_one()
    
    # Get paginated results
    query = query.order_by(Booking.scheduled_date.desc(), Booking.scheduled_time.desc())
    query = query.offset(offset).limit(limit)
    
    result = await db.execute(query)
    rows = result.all()
    
    bookings = []
    for booking, user, consultation_type, coach in rows:
        bookings.append({
            "id": booking.id,
            "reference": booking.reference,
            "user": {
                "id": user.id,
                "name": user.full_name,
                "email": user.email
            },
            "consultation_type": {
                "id": consultation_type.id,
                "name": consultation_type.name
            },
            "coach": {
                "id": coach.id if coach else None,
                "name": coach.full_name if coach else None
            } if coach else None,
            "scheduled_date": booking.scheduled_date,
            "scheduled_time": booking.scheduled_time.strftime("%H:%M"),
            "format": booking.format,
            "status": booking.status,
            "price_charged": booking.price_charged,
            "created_at": booking.created_at,
            "cancelled_at": booking.cancelled_at,
            "completed_at": booking.completed_at
        })
    
    return {
        "total": total,
        "limit": limit,
        "offset": offset,
        "bookings": bookings
    }


@router.patch("/admin/bookings/{booking_id}/status")
async def update_booking_status(
    booking_id: uuid.UUID,
    status: str,
    notes: Optional[str] = None,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db)
):
    """Update booking status (admin only)"""
    user_role = current_user.get("role", "client")
    if user_role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    result = await db.execute(
        select(Booking, User).join(User, Booking.user_id == User.id)
        .where(Booking.id == booking_id)
    )
    row = result.first()
    
    if not row:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    booking, user = row
    old_status = booking.status
    booking.status = status
    
    if status == "completed":
        booking.completed_at = datetime.now()
    elif status == "cancelled" and not booking.cancelled_at:
        booking.cancelled_at = datetime.now()
    
    # Create history entry
    await create_booking_history(
        db, booking_id, 'status_updated',
        previous_status=old_status,
        new_status=status,
        notes=notes,
        changed_by=current_user.get("email", "admin")
    )
    
    await db.commit()
    
    return {
        "message": f"Booking status updated to {status}",
        "booking_id": booking_id,
        "old_status": old_status,
        "new_status": status
    }