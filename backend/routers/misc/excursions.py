from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete, desc, asc, and_
from datetime import datetime, date, time
import uuid
import secrets
import logging
from typing import Optional, List
from database import get_user_db
from models import User, Client, Excursion, ExcursionTag, ExcursionBringItem, ExcursionBooking
from schemas import (
    ExcursionResponse, ExcursionListResponse, BookingRequest, 
    BookingResponse, MyBookingsResponse, CancelBookingResponse,
    MLScoreResponse, MLRecommendationsResponse
)
from auth_router import get_current_user
from email_service import send_booking_confirmation_email, send_booking_cancellation_email

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/excursions", tags=["excursions"])

# ============================================================
# HELPER FUNCTIONS
# ============================================================

async def get_excursion_with_details(excursion_id: str, db: AsyncSession):
    """Helper to get excursion with tags and bring items"""
    # Get excursion
    result = await db.execute(
        select(Excursion).where(Excursion.id == excursion_id)
    )
    excursion = result.scalar_one_or_none()
    
    if not excursion:
        return None, [], []
    
    # Load tags
    tags_result = await db.execute(
        select(ExcursionTag.tag_name).where(ExcursionTag.excursion_id == excursion.id)
    )
    tags = [t for t in tags_result.scalars().all()]
    
    # Load bring items
    items_result = await db.execute(
        select(ExcursionBringItem.item_name)
        .where(ExcursionBringItem.excursion_id == excursion.id)
        .order_by(ExcursionBringItem.display_order)
    )
    what_to_bring = [i for i in items_result.scalars().all()]
    
    return excursion, tags, what_to_bring

def compute_ml_score(excursion, client):
    """Compute ML recommendation score for an excursion"""
    score = 0
    
    # Get user data
    try:
        weight = float(client.weight) if client.weight else 75
        height = float(client.height) if client.height else 175
        bmi = weight / ((height / 100) ** 2)
    except (ValueError, TypeError):
        bmi = 24
    
    # Member tenure
    member_since = client.created_at
    tenure_months = 0
    if member_since:
        now = datetime.utcnow()
        tenure_months = (now.year - member_since.year) * 12 + (now.month - member_since.month)
    
    # Determine user fitness level (simplified - can be enhanced)
    user_level = "beginner"
    if tenure_months >= 12 or bmi < 25:
        user_level = "intermediate"
    if tenure_months >= 24 or (bmi < 22 and tenure_months >= 12):
        user_level = "advanced"
    
    # Level compatibility (0-40 pts)
    level_map = {"beginner": 1, "intermediate": 2, "advanced": 3}
    user_level_num = level_map.get(user_level, 1)
    exc_level_num = level_map.get(excursion.min_level, 1)
    
    level_diff = abs(user_level_num - exc_level_num)
    if level_diff == 0:
        score += 40
    elif level_diff == 1:
        score += 20
    
    # BMI compatibility (0-30 pts)
    min_bmi = excursion.min_bmi or 15
    max_bmi = excursion.max_bmi or 40
    
    if min_bmi <= bmi <= max_bmi:
        score += 30
    elif bmi < min_bmi or bmi > max_bmi + 3:
        score += 5
    else:
        score += 15
    
    # Tenure compatibility (0-20 pts)
    required_tenure = excursion.required_tenure_months or 0
    if tenure_months >= required_tenure:
        score += 20
    else:
        score += max(0, 20 - (required_tenure - tenure_months) * 2)
    
    # Availability bonus (0-10 pts)
    spots_left = excursion.spots_left or 0
    spots = excursion.spots or 1
    if spots_left > 0:
        fill_rate = 1 - (spots_left / spots)
        score += round((1 - fill_rate) * 10)
    
    return min(100, max(0, score))

def get_ml_label(score):
    """Get ML recommendation label based on score"""
    if score >= 80:
        return {"label": "Highly Recommended", "color": "green"}
    if score >= 55:
        return {"label": "Good Match", "color": "orange"}
    if score >= 30:
        return {"label": "Possible Match", "color": "yellow"}
    return {"label": "Not Recommended", "color": "red"}

# ============================================================
# EXCURSION ENDPOINTS
# ============================================================

@router.get("", response_model=ExcursionListResponse)
async def get_all_excursions(
    level: Optional[str] = Query(None, regex="^(beginner|intermediate|advanced)$"),
    search: Optional[str] = None,
    sort_by: str = Query("recommended", regex="^(recommended|date|price-asc|price-desc|level)$"),
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db)
):
    """Get all excursions with filtering and sorting"""
    user_id = current_user["user_id"]
    user_id_bytes = user_id.bytes
    
    # Get user data for ML scoring
    client_result = await db.execute(
        select(Client).where(Client.id == user_id_bytes)
    )
    client = client_result.scalar_one_or_none()
    
    # Build query
    query = select(Excursion)
    
    if level:
        query = query.where(Excursion.level == level)
    
    result = await db.execute(query)
    excursions = result.scalars().all()
    
    # Load tags and bring items for each excursion
    response_excursions = []
    for exc in excursions:
        # Load tags
        tags_result = await db.execute(
            select(ExcursionTag.tag_name).where(ExcursionTag.excursion_id == exc.id)
        )
        tags = [t for t in tags_result.scalars().all()]
        
        # Load bring items
        items_result = await db.execute(
            select(ExcursionBringItem.item_name)
            .where(ExcursionBringItem.excursion_id == exc.id)
            .order_by(ExcursionBringItem.display_order)
        )
        what_to_bring = [i for i in items_result.scalars().all()]
        
        # Calculate ML score
        ml_score = compute_ml_score(exc, client) if client else 50
        
        response_excursions.append({
            "excursion": exc,
            "tags": tags,
            "what_to_bring": what_to_bring,
            "ml_score": ml_score
        })
    
    # Apply search filter
    if search:
        response_excursions = [e for e in response_excursions if 
                     search.lower() in e["excursion"].name.lower() or 
                     search.lower() in e["excursion"].location.lower() or
                     any(search.lower() in tag.lower() for tag in e["tags"])]
    
    # Apply sorting
    if sort_by == "recommended":
        response_excursions.sort(key=lambda x: x["ml_score"], reverse=True)
    elif sort_by == "date":
        response_excursions.sort(key=lambda x: x["excursion"].date)
    elif sort_by == "price-asc":
        response_excursions.sort(key=lambda x: x["excursion"].cost)
    elif sort_by == "price-desc":
        response_excursions.sort(key=lambda x: -x["excursion"].cost)
    elif sort_by == "level":
        level_order = {"beginner": 1, "intermediate": 2, "advanced": 3}
        response_excursions.sort(key=lambda x: level_order.get(x["excursion"].level, 2))
    
    # Convert to response model
    final_excursions = []
    for item in response_excursions:
        exc = item["excursion"]
        final_excursions.append(ExcursionResponse(
            id=exc.id,
            name=exc.name,
            location=exc.location,
            level=exc.level,
            level_label=exc.level_label,
            date=exc.date,
            time=exc.time.strftime("%H:%M:%S"),
            duration=exc.duration,
            spots=exc.spots,
            spots_left=exc.spots_left,
            cost=float(exc.cost),
            img_url=exc.img_url,
            thumb_url=exc.thumb_url,
            map_url=exc.map_url,
            description=exc.description,
            guide=exc.guide,
            meetup_point=exc.meetup_point,
            min_bmi=exc.min_bmi,
            max_bmi=exc.max_bmi,
            min_level=exc.min_level,
            required_tenure_months=exc.required_tenure_months,
            difficulty=exc.difficulty,
            tags=item["tags"],
            what_to_bring=item["what_to_bring"],
            created_at=exc.created_at,
            updated_at=exc.updated_at
        ))
    
    return ExcursionListResponse(
        excursions=final_excursions,
        total=len(final_excursions)
    )

@router.get("/{excursion_id}", response_model=ExcursionResponse)
async def get_excursion_by_id(
    excursion_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db)
):
    """Get excursion by ID"""
    excursion, tags, what_to_bring = await get_excursion_with_details(excursion_id, db)
    
    if not excursion:
        raise HTTPException(status_code=404, detail="Excursion not found")
    
    return ExcursionResponse(
        id=excursion.id,
        name=excursion.name,
        location=excursion.location,
        level=excursion.level,
        level_label=excursion.level_label,
        date=excursion.date,
        time=excursion.time.strftime("%H:%M:%S"),
        duration=excursion.duration,
        spots=excursion.spots,
        spots_left=excursion.spots_left,
        cost=float(excursion.cost),
        img_url=excursion.img_url,
        thumb_url=excursion.thumb_url,
        map_url=excursion.map_url,
        description=excursion.description,
        guide=excursion.guide,
        meetup_point=excursion.meetup_point,
        min_bmi=excursion.min_bmi,
        max_bmi=excursion.max_bmi,
        min_level=excursion.min_level,
        required_tenure_months=excursion.required_tenure_months,
        difficulty=excursion.difficulty,
        tags=tags,
        what_to_bring=what_to_bring,
        created_at=excursion.created_at,
        updated_at=excursion.updated_at
    )

@router.post("/book", response_model=BookingResponse)
async def book_excursion(
    request: BookingRequest,
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db)
):
    """Book an excursion"""
    user_id = current_user["user_id"]
    user_id_bytes = user_id.bytes
    
    # Get client info
    client_result = await db.execute(
        select(Client).where(Client.id == user_id_bytes)
    )
    client = client_result.scalar_one_or_none()
    
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    
    # Get excursion with details
    excursion, tags, what_to_bring = await get_excursion_with_details(request.excursion_id, db)
    
    if not excursion:
        raise HTTPException(status_code=404, detail="Excursion not found")
    
    if excursion.spots_left <= 0:
        raise HTTPException(status_code=400, detail="No spots left for this excursion")
    
    # Check if user already has a booking for this excursion
    existing_booking = await db.execute(
        select(ExcursionBooking).where(
            and_(
                ExcursionBooking.client_id == user_id_bytes,
                ExcursionBooking.excursion_id == request.excursion_id,
                ExcursionBooking.booking_status == "confirmed"
            )
        )
    )
    if existing_booking.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="You already have a booking for this excursion")
    
    # Generate unique booking reference
    booking_ref = f"BADEXC-{secrets.token_hex(4).upper()}"
    
    # Create booking
    booking_id = uuid.uuid4()
    new_booking = ExcursionBooking(
        id=booking_id.bytes,
        client_id=user_id_bytes,
        excursion_id=request.excursion_id,
        booking_reference=booking_ref,
        booked_for_name=request.booked_for_name,
        booked_for_email=request.booked_for_email,
        booked_for_phone=request.booked_for_phone,
        special_notes=request.special_notes,
        payment_method=request.payment_method,
        payment_status="pending" if request.payment_method == "cash" else "paid",
        booking_status="confirmed",
        total_amount=excursion.cost
    )
    
    db.add(new_booking)
    
    # Update spots left
    excursion.spots_left -= 1
    await db.commit()
    await db.refresh(new_booking)
    
    # Send confirmation email in background
    background_tasks.add_task(
        send_booking_confirmation_email,
        booked_for_email=request.booked_for_email,
        booked_for_name=request.booked_for_name,
        excursion_name=excursion.name,
        excursion_date=excursion.date,
        excursion_time=excursion.time.strftime("%I:%M %p"),
        location=excursion.location,
        guide=excursion.guide,
        meetup_point=excursion.meetup_point,
        what_to_bring=what_to_bring,  # Use the fetched what_to_bring list
        booking_reference=booking_ref,
        total_amount=float(excursion.cost),
        payment_method=request.payment_method
    )
    
    return BookingResponse(
        id=uuid.UUID(bytes=new_booking.id),
        booking_reference=new_booking.booking_reference,
        excursion_id=excursion.id,
        excursion_name=excursion.name,
        excursion_date=excursion.date,
        excursion_time=excursion.time.strftime("%H:%M:%S"),
        location=excursion.location,
        level=excursion.level,
        thumb_url=excursion.thumb_url,
        booked_for_name=new_booking.booked_for_name,
        booked_for_email=new_booking.booked_for_email,
        booked_for_phone=new_booking.booked_for_phone,
        special_notes=new_booking.special_notes,
        payment_method=new_booking.payment_method,
        payment_status=new_booking.payment_status,
        booking_status=new_booking.booking_status,
        total_amount=float(new_booking.total_amount),
        booked_at=new_booking.booked_at
    )

@router.get("/bookings/my", response_model=MyBookingsResponse)
async def get_my_bookings(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db)
):
    """Get current user's bookings"""
    user_id = current_user["user_id"]
    user_id_bytes = user_id.bytes
    
    result = await db.execute(
        select(ExcursionBooking, Excursion)
        .join(Excursion, ExcursionBooking.excursion_id == Excursion.id)
        .where(ExcursionBooking.client_id == user_id_bytes)
        .where(ExcursionBooking.booking_status == "confirmed")
        .order_by(Excursion.date)
    )
    rows = result.all()
    
    bookings = []
    for booking, excursion in rows:
        bookings.append(BookingResponse(
            id=uuid.UUID(bytes=booking.id),
            booking_reference=booking.booking_reference,
            excursion_id=excursion.id,
            excursion_name=excursion.name,
            excursion_date=excursion.date,
            excursion_time=excursion.time.strftime("%H:%M:%S"),
            location=excursion.location,
            level=excursion.level,
            thumb_url=excursion.thumb_url,
            booked_for_name=booking.booked_for_name,
            booked_for_email=booking.booked_for_email,
            booked_for_phone=booking.booked_for_phone,
            special_notes=booking.special_notes,
            payment_method=booking.payment_method,
            payment_status=booking.payment_status,
            booking_status=booking.booking_status,
            total_amount=float(booking.total_amount),
            booked_at=booking.booked_at
        ))
    
    return MyBookingsResponse(
        bookings=bookings,
        total=len(bookings)
    )

@router.delete("/bookings/{booking_id}", response_model=CancelBookingResponse)
async def cancel_booking(
    booking_id: uuid.UUID,
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db)
):
    """Cancel a booking"""
    user_id = current_user["user_id"]
    user_id_bytes = user_id.bytes
    booking_id_bytes = booking_id.bytes
    
    result = await db.execute(
        select(ExcursionBooking, Excursion)
        .join(Excursion, ExcursionBooking.excursion_id == Excursion.id)
        .where(ExcursionBooking.id == booking_id_bytes)
        .where(ExcursionBooking.client_id == user_id_bytes)
    )
    row = result.first()
    
    if not row:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    booking, excursion = row
    
    if booking.booking_status != "confirmed":
        raise HTTPException(status_code=400, detail="Booking already cancelled")
    
    # Check if cancellation is allowed (at least 48 hours before)
    now = datetime.utcnow().date()
    excursion_date = excursion.date
    days_until = (excursion_date - now).days
    
    refund_amount = None
    if days_until >= 2:
        # Full refund for online payments
        if booking.payment_method == "online":
            refund_amount = float(booking.total_amount)
    elif days_until >= 1:
        # 50% refund for online payments
        if booking.payment_method == "online":
            refund_amount = float(booking.total_amount) * 0.5
    
    # Update booking status
    booking.booking_status = "cancelled"
    booking.cancelled_at = datetime.utcnow()
    
    # Restore spot
    excursion.spots_left += 1
    
    await db.commit()
    
    # Send cancellation email in background
    background_tasks.add_task(
        send_booking_cancellation_email,
        booked_for_email=booking.booked_for_email,
        booked_for_name=booking.booked_for_name,
        excursion_name=excursion.name,
        excursion_date=excursion.date,
        booking_reference=booking.booking_reference,
        refund_amount=refund_amount
    )
    
    return CancelBookingResponse(
        message="Booking cancelled successfully",
        booking_id=booking_id,
        refund_amount=refund_amount
    )

@router.get("/recommendations/ml", response_model=MLRecommendationsResponse)
async def get_ml_recommendations(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db)
):
    """Get ML-based excursion recommendations for current user"""
    user_id = current_user["user_id"]
    user_id_bytes = user_id.bytes
    
    # Get client data
    client_result = await db.execute(
        select(Client).where(Client.id == user_id_bytes)
    )
    client = client_result.scalar_one_or_none()
    
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    
    # Get all excursions
    result = await db.execute(select(Excursion))
    excursions = result.scalars().all()
    
    # Calculate ML scores
    recommendations = []
    for exc in excursions:
        score = compute_ml_score(exc, client)
        ml_label = get_ml_label(score)
        
        recommendations.append(MLScoreResponse(
            excursion_id=exc.id,
            score=score,
            label=ml_label["label"],
            color=ml_label["color"]
        ))
    
    # Sort by score descending
    recommendations.sort(key=lambda x: x.score, reverse=True)
    
    # Get user context
    member_since = client.created_at
    tenure_months = 0
    if member_since:
        now = datetime.utcnow()
        tenure_months = (now.year - member_since.year) * 12 + (now.month - member_since.month)
    
    try:
        weight = float(client.weight) if client.weight else 75
        height = float(client.height) if client.height else 175
        bmi = round(weight / ((height / 100) ** 2), 1)
    except (ValueError, TypeError):
        bmi = 24
    
    user_context = {
        "fitness_level": "intermediate",
        "bmi": bmi,
        "tenure_months": tenure_months
    }
    
    return MLRecommendationsResponse(
        recommendations=recommendations[:10],
        user_context=user_context
    )