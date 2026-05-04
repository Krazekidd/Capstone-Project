from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete, func,desc, asc
import uuid
import json
import logging
from datetime import date, datetime
from typing import Optional, List
from database import get_user_db
from models import User, Client, Trainer, Admin, ProgressTracking
from schemas import (
    ClientAccount, TrainerAccount, AdminAccount, 
    UpdateClientProfileRequest, UpdateTrainerProfileRequest, 
    UpdateAdminProfileRequest, APIResponse, UserProgressResponse,
    ProgressRequest, BodyMeasurements, ProgressTrackingResponse, ClientGoalsResponse, UpdateClientGoalsRequest,
    HealthConditionResponse, UpdateHealthConditionsRequest,WaterIntakeResponse,UpdateWaterIntakeRequest,
    StrengthRecordResponse, UpdateStrengthRecordRequest,TrainerRatingResponse,TrainerRatingsSummaryResponse,
    TrainingScheduleResponse, UpdateTrainerRatingRequest, UpdateTrainingScheduleRequest, BadgeResponse,
    TrainerAssessmentScores, TrainerAssessmentRequest,TrainerAssessmentResponse,OrderItemResponse,AdminOrderResponse,
    ClientStatusResponse,ClientWithStatusResponse,UpdateOrderStatusRequest,
    DashboardStatsResponse, SeniorProfileResponse, TrainerForAssessment, ClientRisk, TrainerReviewResponse, CoachingMessageRequest
)
from routers.auth.auth import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/account", tags=["account"])

# ============================================================
# GET CURRENT USER ACCOUNT
# ============================================================
@router.get("/me", response_model=ClientAccount | TrainerAccount | AdminAccount)
async def get_my_account(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db)
):
    """Get account of currently logged in user"""
    try:
        user_id = current_user["user_id"]
        role = current_user["role"]
        user_id_bytes = user_id.bytes
        
        logger.info(f"Fetching account for user {user_id} with role {role}")
        
        if role == "client":
            result = await db.execute(
                select(Client, User.email).join(User, Client.id == User.id)
                .where(Client.id == user_id_bytes)
            )
            row = result.first()
            if not row:
                raise HTTPException(status_code=404, detail="Client profile not found")
            
            client, email = row
            # Handle None values for datetime fields
            ccreated_at = client.created_at if client.created_at else datetime.utcnow()
            cupdated_at = client.updated_at if client.updated_at else ccreated_at
            return ClientAccount(
                id=uuid.UUID(bytes=client.id),
                name=client.name,
                gender=client.gender,
                email=email,
                phone_number=client.phone_number,
                birthday=client.birthday,
                height=client.height,
                weight=client.weight,
                created_at=ccreated_at,
                updated_at=cupdated_at
            )
        
        elif role == "trainer":
            result = await db.execute(
                select(Trainer, User.email).join(User, Trainer.id == User.id)
                .where(Trainer.id == user_id_bytes)
            )
            row = result.first()
            if not row:
                raise HTTPException(status_code=404, detail="Trainer profile not found")
            
            trainer, email = row
            return TrainerAccount(
                id=uuid.UUID(bytes=trainer.id),
                name=trainer.name,
                email=email,
                certification=trainer.certification,
                rating=trainer.rating,
                trainer_level=trainer.trainer_level,
                is_senior=trainer.is_senior,
                created_at=trainer.created_at,
                updated_at=trainer.updated_at
            )
        
        elif role == "admin":
            result = await db.execute(
                select(Admin, User.email).join(User, Admin.id == User.id)
                .where(Admin.id == user_id_bytes)
            )
            row = result.first()
            if not row:
                raise HTTPException(status_code=404, detail="Admin profile not found")
            
            admin, email = row
            return AdminAccount(
                id=uuid.UUID(bytes=admin.id),
                name=admin.name,
                email=email,
                phone_number=admin.phone_number,
                created_at=admin.created_at,
                updated_at=admin.updated_at
            )
        
        else:
            raise HTTPException(status_code=400, detail=f"Invalid role: {role}")
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching account: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================
# GET USER BY ID (Admin or Self)
# ============================================================
@router.get("/{user_id}", response_model=ClientAccount | TrainerAccount | AdminAccount)
async def get_account_by_id(
    user_id: uuid.UUID,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db)
):
    """Get account by user ID (admin only or self)"""
    try:
        # Check if user is admin or requesting their own account
        if current_user["role"] != "admin" and current_user["user_id"] != user_id:
            raise HTTPException(status_code=403, detail="Not authorized to view this account")
        
        user_id_bytes = user_id.bytes
        
        # First get the user to know their role
        user_result = await db.execute(select(User).where(User.id == user_id_bytes))
        user = user_result.scalar_one_or_none()
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        role = user.role
        
        if role == "client":
            result = await db.execute(
                select(Client, User.email).join(User, Client.id == User.id)
                .where(Client.id == user_id_bytes)
            )
            row = result.first()
            if not row:
                raise HTTPException(status_code=404, detail="Client not found")
            
            client, email = row
            return ClientAccount(
                id=uuid.UUID(bytes=client.id),
                name=client.name,
                gender=client.gender,
                email=email,
                phone_number=client.phone_number,
                birthday=client.birthday,
                height=client.height,
                weight=client.weight,
                profile_image=client.profile_image,
                created_at=client.created_at,
                updated_at=client.updated_at
            )
        
        elif role == "trainer":
            result = await db.execute(
                select(Trainer, User.email).join(User, Trainer.id == User.id)
                .where(Trainer.id == user_id_bytes)
            )
            row = result.first()
            if not row:
                raise HTTPException(status_code=404, detail="Trainer not found")
            
            trainer, email = row
            return TrainerAccount(
                id=uuid.UUID(bytes=trainer.id),
                name=trainer.name,
                email=email,
                certification=trainer.certification,
                rating=trainer.rating,
                trainer_level=trainer.trainer_level,
                is_senior=trainer.is_senior,
                created_at=trainer.created_at,
                updated_at=trainer.updated_at
            )
        
        elif role == "admin":
            result = await db.execute(
                select(Admin, User.email).join(User, Admin.id == User.id)
                .where(Admin.id == user_id_bytes)
            )
            row = result.first()
            if not row:
                raise HTTPException(status_code=404, detail="Admin not found")
            
            admin, email = row
            return AdminAccount(
                id=uuid.UUID(bytes=admin.id),
                name=admin.name,
                email=email,
                phone_number=admin.phone_number,
                created_at=admin.created_at,
                updated_at=admin.updated_at
            )
        
        else:
            raise HTTPException(status_code=400, detail=f"Invalid role: {role}")
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching account by ID: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================
# UPDATE CURRENT USER ACCOUNT
# ============================================================
@router.put("/me", response_model=APIResponse)
async def update_my_account(
    update_data: UpdateClientProfileRequest | UpdateTrainerProfileRequest | UpdateAdminProfileRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db)
):
    """Update account of currently logged in user"""
    try:
        user_id = current_user["user_id"]
        role = current_user["role"]
        user_id_bytes = user_id.bytes
        
        # Filter out None values
        update_values = {k: v for k, v in update_data.dict().items() if v is not None}
        
        if not update_values:
            return APIResponse(success=True, message="No updates provided", data=None)
        
        # Update based on role
        if role == "client":
            stmt = update(Client).where(Client.id == user_id_bytes).values(**update_values)
            result = await db.execute(stmt)
            
            # Also update User email if provided
            if 'email' in update_values:
                user_stmt = update(User).where(User.id == user_id_bytes).values(email=update_values['email'])
                await db.execute(user_stmt)
            
        elif role == "trainer":
            stmt = update(Trainer).where(Trainer.id == user_id_bytes).values(**update_values)
            result = await db.execute(stmt)
            
            # Also update User email if provided
            if 'email' in update_values:
                user_stmt = update(User).where(User.id == user_id_bytes).values(email=update_values['email'])
                await db.execute(user_stmt)
                
        elif role == "admin":
            stmt = update(Admin).where(Admin.id == user_id_bytes).values(**update_values)
            result = await db.execute(stmt)
            
            # Also update User email if provided
            if 'email' in update_values:
                user_stmt = update(User).where(User.id == user_id_bytes).values(email=update_values['email'])
                await db.execute(user_stmt)
        else:
            raise HTTPException(status_code=400, detail=f"Invalid role: {role}")
        
        await db.commit()
        
        if result.rowcount == 0:
            raise HTTPException(status_code=404, detail="Profile not found")
        
        return APIResponse(success=True, message="Profile updated successfully", data=None)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating account: {e}", exc_info=True)
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================
# DELETE USER ACCOUNT
# ============================================================
@router.delete("/me", response_model=APIResponse)
async def delete_my_account(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db)
):
    """Delete currently logged in user account"""
    try:
        user_id = current_user["user_id"]
        role = current_user["role"]
        user_id_bytes = user_id.bytes
        
        # Delete from role-specific table first (cascade will handle User)
        if role == "client":
            await db.execute(delete(Client).where(Client.id == user_id_bytes))
        elif role == "trainer":
            await db.execute(delete(Trainer).where(Trainer.id == user_id_bytes))
        elif role == "admin":
            await db.execute(delete(Admin).where(Admin.id == user_id_bytes))
        
        # Delete the user account
        await db.execute(delete(User).where(User.id == user_id_bytes))
        await db.commit()
        
        return APIResponse(success=True, message="Account deleted successfully", data=None)
        
    except Exception as e:
        logger.error(f"Error deleting account: {e}", exc_info=True)
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================
# PROGRESS TRACKING ENDPOINTS
# ============================================================
@router.post("/progress")
async def save_progress(
    measurements: BodyMeasurements,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db)
):
    """Save complete body measurements to progress tracking"""
    user_id = current_user["user_id"]
    user_id_bytes = user_id.bytes
    
    # Create new progress entry using body_measurements table
    from models import BodyMeasurement
    
    new_measurement = BodyMeasurement(
        user_id=user_id_bytes,
        weight=measurements.weight,
        height=measurements.height,
        body_fat=measurements.body_fat,
        chest=measurements.chest,
        waist=measurements.waist,
        shoulders=measurements.shoulders,
        arm_left=measurements.arm_left,
        arm_right=measurements.arm_right,
        neck=measurements.neck,
        hips=measurements.hips,
        thigh_left=measurements.thigh_left,
        thigh_right=measurements.thigh_right,
        calf_left=measurements.calf_left,
        calf_right=measurements.calf_right,
        glutes=measurements.glutes
    )
    
    db.add(new_measurement)
    await db.commit()
    await db.refresh(new_measurement)
    
    # Also update the client profile with latest weight/height
    if measurements.weight or measurements.height:
        update_data = {}
        if measurements.weight:
            update_data["weight"] = str(measurements.weight)
        if measurements.height:
            update_data["height"] = str(measurements.height)
        
        if update_data:
            from sqlalchemy import update as sql_update
            stmt = sql_update(Client).where(Client.id == user_id_bytes).values(**update_data)
            await db.execute(stmt)
            await db.commit()
    
    return {
        "message": "Progress saved successfully",
        "id": str(uuid.UUID(bytes=new_measurement.id))
    }@router.get("/progress/history", response_model=list[ProgressTrackingResponse])
async def get_progress_history(
    limit: int = Query(12, ge=1, le=100),
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db)
):
    """Get progress history for the current user from body_measurements table"""
    try:
        user_id = current_user["user_id"]
        user_id_bytes = user_id.bytes
        
        logger.info(f"Fetching progress history for user: {user_id}")
        
        # Query from body_measurements table instead of progress_tracking
        from models import BodyMeasurement
        
        result = await db.execute(
            select(BodyMeasurement)
            .where(BodyMeasurement.user_id == user_id_bytes)
            .order_by(asc(BodyMeasurement.recorded_at))
            .limit(limit)
        )
        entries = result.scalars().all()
        
        logger.info(f"Found {len(entries)} body measurement entries")
        
        response = []
        for entry in entries:
            # Create measurements object from the individual fields
            measurements_dict = {
                "weight": entry.weight,
                "height": entry.height,
                "body_fat": entry.body_fat,
                "chest": entry.chest,
                "waist": entry.waist,
                "shoulders": entry.shoulders,
                "arm_left": entry.arm_left,
                "arm_right": entry.arm_right,
                "neck": entry.neck,
                "hips": entry.hips,
                "thigh_left": entry.thigh_left,
                "thigh_right": entry.thigh_right,
                "calf_left": entry.calf_left,
                "calf_right": entry.calf_right,
                "glutes": entry.glutes,
            }
            # Remove None values
            measurements_dict = {k: v for k, v in measurements_dict.items() if v is not None}
            
            response.append(
                ProgressTrackingResponse(
                    id=uuid.UUID(bytes=entry.id),
                    user_id=uuid.UUID(bytes=entry.user_id),
                    weight=entry.weight,
                    height=entry.height,
                    measurements=BodyMeasurements(**measurements_dict) if measurements_dict else None,
                    recorded_at=entry.recorded_at,
                    created_at=entry.created_at
                )
            )
        
        return response
        
    except Exception as e:
        logger.error(f"Error getting progress history: {e}", exc_info=True)
        # Return empty list instead of throwing error
        return []
@router.get("/progress/latest", response_model=ProgressTrackingResponse)
async def get_latest_progress(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db)
):
    """Get the most recent progress entry"""
    user_id = current_user["user_id"]
    user_id_bytes = user_id.bytes
    
    result = await db.execute(
        select(ProgressTracking)
        .where(ProgressTracking.user_id == user_id_bytes)
        .order_by(desc(ProgressTracking.recorded_at))
        .limit(1)
    )
    entry = result.scalar_one_or_none()
    
    if not entry:
        raise HTTPException(status_code=404, detail="No progress data found")
    
    measurements_data = json.loads(entry.measurements) if entry.measurements else {}
    
    return ProgressTrackingResponse(
        id=uuid.UUID(bytes=entry.id),
        user_id=uuid.UUID(bytes=entry.user_id),
        weight=entry.weight,
        height=entry.height,
        measurements=BodyMeasurements(**measurements_data) if measurements_data else None,
        recorded_at=entry.recorded_at,
        created_at=entry.created_at
    )
# ============================================================
# CLIENT GOALS ENDPOINTS
# ============================================================
@router.get("/goals", response_model=ClientGoalsResponse)
async def get_my_goals(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db)
):
    """Get current user's goals from client_goals table"""
    from models import ClientGoal
    
    user_id = current_user["user_id"]
    user_id_bytes = user_id.bytes
    
    if current_user["role"] != "client":
        raise HTTPException(status_code=400, detail="Goals only available for clients")
    
    result = await db.execute(
        select(ClientGoal).where(ClientGoal.client_id == user_id_bytes)
    )
    goals = result.scalar_one_or_none()
    
    if not goals:
        # Return default goals
        return ClientGoalsResponse(
            client_id=user_id,
            goal_type="Bulk Up",
            primary_goal=None,
            target_weight_kg=80,
            target_chest_cm=100,
            target_waist_cm=80,
            target_hips_cm=98,
            target_thigh_cm=58,
            target_arm_cm=38,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
    
    return ClientGoalsResponse(
        client_id=uuid.UUID(bytes=goals.client_id),
        goal_type=goals.goal_type,
        primary_goal=goals.primary_goal,
        target_weight_kg=float(goals.target_weight_kg) if goals.target_weight_kg else None,
        target_chest_cm=float(goals.target_chest_cm) if goals.target_chest_cm else None,
        target_waist_cm=float(goals.target_waist_cm) if goals.target_waist_cm else None,
        target_hips_cm=float(goals.target_hips_cm) if goals.target_hips_cm else None,
        target_thigh_cm=float(goals.target_thigh_cm) if goals.target_thigh_cm else None,
        target_arm_cm=float(goals.target_arm_cm) if goals.target_arm_cm else None,
        created_at=goals.created_at,
        updated_at=goals.updated_at
    )

@router.put("/goals", response_model=APIResponse)
async def update_my_goals(
    goals_data: UpdateClientGoalsRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db)
):
    """Update current user's goals"""
    from models import ClientGoal
    
    user_id = current_user["user_id"]
    user_id_bytes = user_id.bytes
    
    if current_user["role"] != "client":
        raise HTTPException(status_code=400, detail="Goals only available for clients")
    
    # Check if goals exist
    result = await db.execute(
        select(ClientGoal).where(ClientGoal.client_id == user_id_bytes)
    )
    existing = result.scalar_one_or_none()
    
    update_values = {k: v for k, v in goals_data.dict().items() if v is not None}
    
    if existing:
        stmt = update(ClientGoal).where(ClientGoal.client_id == user_id_bytes).values(**update_values)
        await db.execute(stmt)
    else:
        new_goals = ClientGoal(
            client_id=user_id_bytes,
            **update_values
        )
        db.add(new_goals)
    
    await db.commit()
    return APIResponse(success=True, message="Goals updated successfully")

# ============================================================
# CLIENT HEALTH CONDITIONS ENDPOINTS
# ============================================================

@router.get("/health-conditions", response_model=List[HealthConditionResponse])
async def get_my_health_conditions(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db)
):
    """Get current user's health conditions"""
    from models import ClientHealthCondition
    
    user_id = current_user["user_id"]
    user_id_bytes = user_id.bytes
    
    if current_user["role"] != "client":
        raise HTTPException(status_code=400, detail="Health conditions only available for clients")
    
    result = await db.execute(
        select(ClientHealthCondition)
        .where(ClientHealthCondition.client_id == user_id_bytes)
    )
    conditions = result.scalars().all()
    
    return [
        HealthConditionResponse(
            id=c.id,
            condition_name=c.condition_name,
            created_at=c.created_at
        )
        for c in conditions
    ]

@router.put("/health-conditions", response_model=APIResponse)
async def update_my_health_conditions(
    request: UpdateHealthConditionsRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db)
):
    """Update current user's health conditions"""
    from models import ClientHealthCondition
    
    user_id = current_user["user_id"]
    user_id_bytes = user_id.bytes
    
    if current_user["role"] != "client":
        raise HTTPException(status_code=400, detail="Health conditions only available for clients")
    
    # Delete existing conditions
    await db.execute(
        delete(ClientHealthCondition).where(ClientHealthCondition.client_id == user_id_bytes)
    )
    
    # Add new conditions
    for condition in request.conditions:
        new_condition = ClientHealthCondition(
            client_id=user_id_bytes,
            condition_name=condition
        )
        db.add(new_condition)
    
    await db.commit()
    
    return APIResponse(success=True, message="Health conditions updated successfully")

# ============================================================
# CLIENT WATER INTAKE ENDPOINTS
# ============================================================

@router.get("/water-intake", response_model=WaterIntakeResponse)
async def get_today_water_intake(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db)
):
    """Get today's water intake"""
    from models import ClientWaterIntake
    
    user_id = current_user["user_id"]
    user_id_bytes = user_id.bytes
    
    today = datetime.utcnow().date()
    
    result = await db.execute(
        select(ClientWaterIntake)
        .where(ClientWaterIntake.client_id == user_id_bytes)
        .where(ClientWaterIntake.intake_date == today)
    )
    intake = result.scalar_one_or_none()
    
    return WaterIntakeResponse(
        intake_date=today,
        cups_consumed=intake.cups_consumed if intake else 0
    )

@router.post("/water-intake/log")
async def log_water_intake(
    request: UpdateWaterIntakeRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db)
):
    """Log water intake for today"""
    from models import ClientWaterIntake
    
    user_id = current_user["user_id"]
    user_id_bytes = user_id.bytes
    
    today = datetime.utcnow().date()
    
    result = await db.execute(
        select(ClientWaterIntake)
        .where(ClientWaterIntake.client_id == user_id_bytes)
        .where(ClientWaterIntake.intake_date == today)
    )
    intake = result.scalar_one_or_none()
    
    if intake:
        intake.cups_consumed = request.cups_consumed
    else:
        new_intake = ClientWaterIntake(
            client_id=user_id_bytes,
            intake_date=today,
            cups_consumed=request.cups_consumed
        )
        db.add(new_intake)
    
    await db.commit()
    
    return {"message": "Water intake logged", "cups_consumed": request.cups_consumed}

# ============================================================
# CLIENT STRENGTH RECORDS ENDPOINTS
# ============================================================

@router.get("/strength-records", response_model=List[StrengthRecordResponse])
async def get_strength_records(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db)
):
    """Get current user's strength records"""
    from models import ClientStrengthRecord
    
    user_id = current_user["user_id"]
    user_id_bytes = user_id.bytes
    
    if current_user["role"] != "client":
        raise HTTPException(status_code=400, detail="Strength records only available for clients")
    
    result = await db.execute(
        select(ClientStrengthRecord)
        .where(ClientStrengthRecord.client_id == user_id_bytes)
        .order_by(ClientStrengthRecord.exercise_name)
    )
    records = result.scalars().all()
    
    return [
        StrengthRecordResponse(
            id=r.id,
            exercise_name=r.exercise_name,
            current_weight_kg=float(r.current_weight_kg) if r.current_weight_kg else None,
            goal_weight_kg=float(r.goal_weight_kg) if r.goal_weight_kg else None,
            current_reps=r.current_reps,
            goal_reps=r.goal_reps,
            percentage_progress=r.percentage_progress,
            record_date=r.record_date
        )
        for r in records
    ]

@router.put("/strength-records/{exercise_name}")
async def update_strength_record(
    exercise_name: str,
    request: UpdateStrengthRecordRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db)
):
    """Update a strength record"""
    from models import ClientStrengthRecord
    
    user_id = current_user["user_id"]
    user_id_bytes = user_id.bytes
    
    if current_user["role"] != "client":
        raise HTTPException(status_code=400, detail="Strength records only available for clients")
    
    result = await db.execute(
        select(ClientStrengthRecord)
        .where(ClientStrengthRecord.client_id == user_id_bytes)
        .where(ClientStrengthRecord.exercise_name == exercise_name)
    )
    record = result.scalar_one_or_none()
    
    update_values = {k: v for k, v in request.dict().items() if v is not None}
    
    if record:
        stmt = update(ClientStrengthRecord).where(
            ClientStrengthRecord.id == record.id
        ).values(**update_values)
        await db.execute(stmt)
    else:
        new_record = ClientStrengthRecord(
            client_id=user_id_bytes,
            exercise_name=exercise_name,
            **update_values,
            record_date=datetime.utcnow().date()
        )
        db.add(new_record)
    
    await db.commit()
    
    return {"message": f"Strength record for {exercise_name} updated"}

# ============================================================
# TRAINER RATINGS ENDPOINTS
# ============================================================

@router.get("/trainer-ratings", response_model=TrainerRatingsSummaryResponse)
async def get_my_trainer_ratings(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db)
):
    """Get current user's trainer ratings"""
    from models import TrainerRating
    
    user_id = current_user["user_id"]
    user_id_bytes = user_id.bytes
    
    result = await db.execute(
        select(TrainerRating).where(TrainerRating.client_id == user_id_bytes)
    )
    ratings = result.scalars().all()
    
    ratings_list = [
        TrainerRatingResponse(
            trainer_name=r.trainer_name,
            rating=r.rating
        )
        for r in ratings
    ]
    
    avg_rating = sum(r.rating for r in ratings) / len(ratings) if ratings else 0
    
    return TrainerRatingsSummaryResponse(
        average_rating=round(avg_rating, 1),
        total_ratings=len(ratings),
        ratings=ratings_list
    )

@router.post("/trainer-ratings")
async def rate_trainer(
    request: UpdateTrainerRatingRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db)
):
    """Rate a trainer"""
    from models import TrainerRating
    
    user_id = current_user["user_id"]
    user_id_bytes = user_id.bytes
    
    if current_user["role"] != "client":
        raise HTTPException(status_code=400, detail="Only clients can rate trainers")
    
    # Check if rating exists
    result = await db.execute(
        select(TrainerRating)
        .where(TrainerRating.client_id == user_id_bytes)
        .where(TrainerRating.trainer_name == request.trainer_name)
    )
    existing = result.scalar_one_or_none()
    
    if existing:
        existing.rating = request.rating
    else:
        new_rating = TrainerRating(
            client_id=user_id_bytes,
            trainer_name=request.trainer_name,
            rating=request.rating
        )
        db.add(new_rating)
    
    await db.commit()
    
    return {"message": f"Rated {request.trainer_name} {request.rating} stars"}

# ============================================================
# CLIENT BADGES ENDPOINTS
# ============================================================

@router.get("/badges", response_model=List[BadgeResponse])
async def get_my_badges(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db)
):
    """Get current user's badges"""
    from models import ClientBadge
    
    user_id = current_user["user_id"]
    user_id_bytes = user_id.bytes
    
    if current_user["role"] != "client":
        raise HTTPException(status_code=400, detail="Badges only available for clients")
    
    result = await db.execute(
        select(ClientBadge)
        .where(ClientBadge.client_id == user_id_bytes)
        .order_by(ClientBadge.awarded_date.desc())
    )
    badges = result.scalars().all()
    
    return [
        BadgeResponse(
            id=b.id,
            badge_name=b.badge_name,
            awarded_date=b.awarded_date
        )
        for b in badges
    ]

# ============================================================
# TRAINING SCHEDULE ENDPOINTS
# ============================================================

@router.get("/training-schedule", response_model=List[TrainingScheduleResponse])
async def get_training_schedule(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db)
):
    """Get current user's training schedule"""
    from models import TrainingSchedule
    
    user_id = current_user["user_id"]
    user_id_bytes = user_id.bytes
    
    result = await db.execute(
        select(TrainingSchedule)
        .where(TrainingSchedule.client_id == user_id_bytes)
        .order_by(TrainingSchedule.day_number)
    )
    schedule = result.scalars().all()
    
    return [
        TrainingScheduleResponse(
            id=s.id,
            day_of_week=s.day_of_week,
            day_number=s.day_number,
            session_name=s.session_name,
            session_time=s.session_time.strftime("%H:%M:%S") if s.session_time else None,
            has_session=s.has_session,
            is_today=s.is_today
        )
        for s in schedule
    ]

@router.put("/training-schedule/{schedule_id}")
async def update_training_schedule(
    schedule_id: int,
    request: UpdateTrainingScheduleRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db)
):
    """Update a training schedule entry"""
    from models import TrainingSchedule
    
    user_id = current_user["user_id"]
    user_id_bytes = user_id.bytes
    
    result = await db.execute(
        select(TrainingSchedule)
        .where(TrainingSchedule.id == schedule_id)
        .where(TrainingSchedule.client_id == user_id_bytes)
    )
    schedule = result.scalar_one_or_none()
    
    if not schedule:
        raise HTTPException(status_code=404, detail="Schedule entry not found")
    
    update_values = {k: v for k, v in request.dict().items() if v is not None}
    
    if update_values:
        stmt = update(TrainingSchedule).where(TrainingSchedule.id == schedule_id).values(**update_values)
        await db.execute(stmt)
        await db.commit()
    
    return {"message": "Training schedule updated"}

# ============================================================
# GET ALL CLIENTS (Admin & Trainers only)
# ============================================================
@router.get("/clients/all", response_model=List[ClientAccount])
async def get_all_clients(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db)
):
    """Get all clients (admin and trainers only)"""
    try:
        role = current_user["role"]
        
        # Only admin and trainers can view all clients
        if role not in ["admin", "trainer"]:
            raise HTTPException(status_code=403, detail="Not authorized to view all clients")
        
        result = await db.execute(
            select(Client, User.email)
            .join(User, Client.id == User.id)
            .offset(skip)
            .limit(limit)
        )
        rows = result.all()
        
        clients = []
        for client, email in rows:
            clients.append(ClientAccount(
                id=uuid.UUID(bytes=client.id),
                name=client.name,
                gender=client.gender,
                email=email,
                phone_number=client.phone_number,
                birthday=client.birthday,
                height=client.height,
                weight=client.weight,
                profile_image=client.profile_image,
                created_at=client.created_at,
                updated_at=client.updated_at
            ))
        
        return clients
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting all clients: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================
# GET ALL TRAINERS (Admin only)
# ============================================================
# ============================================================
# ADMIN ENDPOINTS
# ============================================================
@router.get("/admin/all-clients", response_model=List[ClientAccount])
async def admin_get_all_clients(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db)
):
    """Admin endpoint to get all clients"""
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    result = await db.execute(
        select(Client, User.email)
        .join(User, Client.id == User.id)
        .order_by(Client.created_at.desc())
    )
    rows = result.all()
    
    clients = []
    for client, email in rows:
        clients.append(ClientAccount(
            id=uuid.UUID(bytes=client.id),
            name=client.name,
            email=email,
            phone_number=client.phone_number,
            birthday=client.birthday,
            height=client.height,
            weight=client.weight,
            created_at=client.created_at,
            updated_at=client.updated_at
        ))
    
    return clients

@router.get("/admin/all-trainers", response_model=List[TrainerAccount])
async def admin_get_all_trainers(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db)
):
    """Admin endpoint to get all trainers"""
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    result = await db.execute(
        select(Trainer, User.email)
        .join(User, Trainer.id == User.id)
        .order_by(Trainer.name)
    )
    rows = result.all()
    
    trainers = []
    for trainer, email in rows:
        trainers.append(TrainerAccount(
            id=uuid.UUID(bytes=trainer.id),
            name=trainer.name,
            email=email,
            certification=trainer.certification,
            rating=trainer.rating,
            trainer_level=trainer.trainer_level,
            is_senior=trainer.is_senior,
            created_at=trainer.created_at,
            updated_at=trainer.updated_at
        ))
    
    return trainers

@router.post("/admin/excursions")
async def admin_create_excursion(
    excursion_data: dict,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db)
):
    """Admin endpoint to create a new excursion"""
    from models import Excursion
    
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    new_excursion = Excursion(
        id=excursion_data.get("id", f"exc_{int(datetime.now().timestamp())}"),
        name=excursion_data.get("name"),
        location=excursion_data.get("location"),
        level=excursion_data.get("level", "beginner"),
        level_label=excursion_data.get("level_label", "Beginner"),
        date=datetime.strptime(excursion_data.get("date"), "%Y-%m-%d").date(),
        time=datetime.strptime(excursion_data.get("time", "08:00"), "%H:%M").time(),
        duration=excursion_data.get("duration", "5 hours"),
        spots=excursion_data.get("spots", 20),
        spots_left=excursion_data.get("spots", 20),
        cost=excursion_data.get("cost", 0),
        description=excursion_data.get("description", ""),
        guide=excursion_data.get("guide", ""),
        meetup_point=excursion_data.get("meetup_point", ""),
        difficulty=excursion_data.get("difficulty", 5),
        img_url=excursion_data.get("img_url", ""),
        thumb_url=excursion_data.get("thumb_url", "")
    )
    
    db.add(new_excursion)
    await db.commit()
    await db.refresh(new_excursion)
    
    return {"message": "Excursion created", "id": new_excursion.id}

@router.put("/admin/excursions/{excursion_id}")
async def admin_update_excursion(
    excursion_id: str,
    excursion_data: dict,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db)
):
    """Admin endpoint to update an excursion"""
    from models import Excursion
    
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    result = await db.execute(
        select(Excursion).where(Excursion.id == excursion_id)
    )
    excursion = result.scalar_one_or_none()
    
    if not excursion:
        raise HTTPException(status_code=404, detail="Excursion not found")
    
    # Update fields
    for key, value in excursion_data.items():
        if hasattr(excursion, key) and value is not None:
            if key in ["date"] and value:
                value = datetime.strptime(value, "%Y-%m-%d").date()
            elif key in ["time"] and value:
                value = datetime.strptime(value, "%H:%M:%S").time() if ":" in value else datetime.strptime(value, "%H:%M").time()
            setattr(excursion, key, value)
    
    await db.commit()
    
    return {"message": "Excursion updated"}

@router.delete("/admin/excursions/{excursion_id}")
async def admin_delete_excursion(
    excursion_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db)
):
    """Admin endpoint to delete an excursion"""
    from models import Excursion, ExcursionBooking
    
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Check if there are bookings
    bookings_result = await db.execute(
        select(ExcursionBooking).where(ExcursionBooking.excursion_id == excursion_id)
    )
    if bookings_result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Cannot delete excursion with existing bookings")
    
    result = await db.execute(
        delete(Excursion).where(Excursion.id == excursion_id)
    )
    await db.commit()
    
    return {"message": "Excursion deleted"}



@router.get("/admin/dashboard-stats")
async def get_dashboard_stats(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db)
):
    """Get dashboard statistics"""
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Get counts
    clients_count = await db.execute(select(func.count()).select_from(Client))
    active_clients = await db.execute(
        select(func.count()).select_from(Client)
        # Add status filter when available
    )
    
    return {
        "total_clients": clients_count.scalar() or 0,
        "active_clients": active_clients.scalar() or 0,
        "total_trainers": 0,
        "pending_orders": 0
    }
# ============================================================
# SEARCH USERS (Admin only)
# ============================================================
@router.get("/search/{query}", response_model=List[dict])
async def search_users(
    query: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db)
):
    """Search users by name or email (admin only)"""
    try:
        role = current_user["role"]
        
        # Only admin can search users
        if role != "admin":
            raise HTTPException(status_code=403, detail="Not authorized to search users")
        
        # Search in clients
        client_result = await db.execute(
            select(Client, User.email)
            .join(User, Client.id == User.id)
            .where(
                (Client.name.contains(query)) | 
                (User.email.contains(query))
            )
            .limit(20)
        )
        clients = client_result.all()
        
        # Search in trainers
        trainer_result = await db.execute(
            select(Trainer, User.email)
            .join(User, Trainer.id == User.id)
            .where(
                (Trainer.name.contains(query)) | 
                (User.email.contains(query))
            )
            .limit(20)
        )
        trainers = trainer_result.all()
        
        # Search in admins
        admin_result = await db.execute(
            select(Admin, User.email)
            .join(User, Admin.id == User.id)
            .where(
                (Admin.name.contains(query)) | 
                (User.email.contains(query))
            )
            .limit(20)
        )
        admins = admin_result.all()
        
        results = []
        
        for client, email in clients:
            results.append({
                "id": str(uuid.UUID(bytes=client.id)),
                "name": client.name,
                "email": email,
                "role": "client"
            })
        
        for trainer, email in trainers:
            results.append({
                "id": str(uuid.UUID(bytes=trainer.id)),
                "name": trainer.name,
                "email": email,
                "role": "trainer"
            })
        
        for admin, email in admins:
            results.append({
                "id": str(uuid.UUID(bytes=admin.id)),
                "name": admin.name,
                "email": email,
                "role": "admin"
            })
        
        return results
        
    except Exception as e:
        logger.error(f"Error searching users: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================
# ADMIN - TRAINER ASSESSMENTS ENDPOINTS
# ============================================================

@router.post("/admin/trainer-assessments", response_model=APIResponse)
async def save_trainer_assessment(
    assessment: TrainerAssessmentRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db)
):
    """Save trainer assessment to database"""
    from models import TrainerAssessment
    
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    trainer_id_bytes = assessment.trainer_id.bytes
    
    new_assessment = TrainerAssessment(
        trainer_id=trainer_id_bytes,
        trainer_name=assessment.trainer_name,
        performance_score=assessment.scores.perf,
        motivation_score=assessment.scores.motiv,
        interaction_score=assessment.scores.interact,
        knowledge_score=assessment.scores.knowledge,
        punctuality_score=assessment.scores.punct,
        average_score=assessment.average,
        standing=assessment.standing,
        assessment_date=datetime.utcnow().date(),
        notes=assessment.notes
    )
    
    db.add(new_assessment)
    await db.commit()
    
    # Also update trainer's overall rating (average of all assessments)
    result = await db.execute(
        select(func.avg(TrainerAssessment.average_score))
        .where(TrainerAssessment.trainer_id == trainer_id_bytes)
    )
    avg_rating = result.scalar() or 0
    
    await db.execute(
        update(Trainer)
        .where(Trainer.id == trainer_id_bytes)
        .values(rating=float(avg_rating))
    )
    await db.commit()
    
    return APIResponse(
        success=True,
        message="Assessment saved successfully",
        data={"id": new_assessment.id, "average_rating": float(avg_rating)}
    )

@router.get("/admin/trainer-assessments/{trainer_id}", response_model=List[TrainerAssessmentResponse])
async def get_trainer_assessments(
    trainer_id: uuid.UUID,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db)
):
    """Get assessment history for a trainer"""
    from models import TrainerAssessment
    
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    trainer_id_bytes = trainer_id.bytes
    
    result = await db.execute(
        select(TrainerAssessment)
        .where(TrainerAssessment.trainer_id == trainer_id_bytes)
        .order_by(TrainerAssessment.assessment_date.desc())
    )
    assessments = result.scalars().all()
    
    return [
        TrainerAssessmentResponse(
            id=a.id,
            trainer_id=uuid.UUID(bytes=a.trainer_id),
            trainer_name=a.trainer_name,
            performance_score=float(a.performance_score) if a.performance_score else 0,
            motivation_score=float(a.motivation_score) if a.motivation_score else 0,
            interaction_score=float(a.interaction_score) if a.interaction_score else 0,
            knowledge_score=float(a.knowledge_score) if a.knowledge_score else 0,
            punctuality_score=float(a.punctuality_score) if a.punctuality_score else 0,
            average_score=float(a.average_score) if a.average_score else 0,
            standing=a.standing,
            assessment_date=a.assessment_date,
            notes=a.notes,
            created_at=a.created_at
        )
        for a in assessments
    ]

# ============================================================
# ADMIN - CLIENTS WITH STATUS ENDPOINTS
# ============================================================

@router.get("/admin/clients-with-status", response_model=List[ClientWithStatusResponse])
async def admin_get_clients_with_status(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db)
):
    """Admin endpoint to get all clients with their status"""
    from models import ClientStatus
    
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    result = await db.execute(
        select(Client, User.email, ClientStatus)
        .join(User, Client.id == User.id)
        .outerjoin(ClientStatus, Client.id == ClientStatus.client_id)
        .order_by(Client.created_at.desc())
    )
    rows = result.all()
    
    clients = []
    for client, email, status in rows:
        clients.append(ClientWithStatusResponse(
            id=uuid.UUID(bytes=client.id),
            name=client.name,
            email=email,
            phone_number=client.phone_number,
            height=client.height,
            weight=client.weight,
            birthday=client.birthday,
            status=status.status if status else "Active",
            membership_plan=status.membership_plan if status else "Standard",
            fitness_goal=status.fitness_goal if status else "General Fitness",
            progress_percentage=status.progress_percentage if status else 0,
            last_visit=status.last_visit if status else None,
            created_at=client.created_at
        ))
    
    return clients

@router.put("/admin/client-status/{client_id}", response_model=APIResponse)
async def admin_update_client_status(
    client_id: uuid.UUID,
    status_data: dict,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db)
):
    """Admin endpoint to update client status"""
    from models import ClientStatus
    
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    client_id_bytes = client_id.bytes
    
    result = await db.execute(
        select(ClientStatus).where(ClientStatus.client_id == client_id_bytes)
    )
    client_status = result.scalar_one_or_none()
    
    if client_status:
        if "status" in status_data:
            client_status.status = status_data["status"]
        if "membership_plan" in status_data:
            client_status.membership_plan = status_data["membership_plan"]
        if "fitness_goal" in status_data:
            client_status.fitness_goal = status_data["fitness_goal"]
        if "progress_percentage" in status_data:
            client_status.progress_percentage = status_data["progress_percentage"]
        if "assigned_trainer_id" in status_data:
            client_status.assigned_trainer_id = uuid.UUID(status_data["assigned_trainer_id"]).bytes
        if "last_visit" in status_data:
            client_status.last_visit = datetime.strptime(status_data["last_visit"], "%Y-%m-%d").date()
    else:
        new_status = ClientStatus(
            client_id=client_id_bytes,
            status=status_data.get("status", "Active"),
            membership_plan=status_data.get("membership_plan", "Standard"),
            fitness_goal=status_data.get("fitness_goal", "General Fitness"),
            progress_percentage=status_data.get("progress_percentage", 0)
        )
        if "assigned_trainer_id" in status_data:
            new_status.assigned_trainer_id = uuid.UUID(status_data["assigned_trainer_id"]).bytes
        if "last_visit" in status_data:
            new_status.last_visit = datetime.strptime(status_data["last_visit"], "%Y-%m-%d").date()
        db.add(new_status)
    
    await db.commit()
    
    return APIResponse(success=True, message="Client status updated")

# ============================================================
# ADMIN - ORDERS ENDPOINTS
# ============================================================
@router.get("/admin/orders", response_model=List[AdminOrderResponse])
async def admin_get_orders(
    status: Optional[str] = None,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db)
):
    """Admin endpoint to get all shop orders"""
    from models import ShopOrder, ShopOrderItem
    
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    query = select(ShopOrder).order_by(ShopOrder.placed_at.desc())
    
    if status:
        query = query.where(ShopOrder.order_status == status)
    
    result = await db.execute(query)
    orders = result.scalars().all()
    
    order_list = []
    for order in orders:
        # Get items for this order
        items_result = await db.execute(
            select(ShopOrderItem).where(ShopOrderItem.order_id == order.id)
        )
        items = items_result.scalars().all()
        
        order_list.append({
            "id": str(uuid.UUID(bytes=order.id)),
            "order_reference": order.order_reference,
            "client_name": order.customer_name,
            "client_email": order.email,
            "client_phone": order.phone,
            "shipping_address": order.shipping_address,
            "city": order.city,
            "items": [{"name": i.product_name, "quantity": i.quantity, "price": float(i.product_price)} for i in items],
            "subtotal": float(order.subtotal),
            "tax": float(order.tax),
            "shipping_cost": float(order.shipping_cost),
            "total": float(order.total),
            "order_status": order.order_status,
            "payment_status": order.payment_status,
            "payment_method": order.payment_method,
            "placed_at": order.placed_at.isoformat(),
            "pickup_notes": getattr(order, "pickup_notes", None)
        })
    
    return order_list
@router.put("/admin/orders/{order_id}/status", response_model=APIResponse)
async def admin_update_order_status(
    order_id: uuid.UUID,
    status_data: dict,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db)
):
    """Admin endpoint to update order status"""
    from models import ShopOrder
    
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    order_id_bytes = order_id.bytes
    
    result = await db.execute(
        select(ShopOrder).where(ShopOrder.id == order_id_bytes)
    )
    order = result.scalar_one_or_none()
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if "order_status" in status_data:
        order.order_status = status_data["order_status"]
    if "payment_status" in status_data:
        order.payment_status = status_data["payment_status"]
    if "pickup_notes" in status_data:
        order.pickup_notes = status_data["pickup_notes"]
    
    await db.commit()
    
    return APIResponse(success=True, message="Order status updated")
# ============================================================
# ADMIN - DASHBOARD STATS ENDPOINTS
# ============================================================
@router.get("/admin/dashboard-stats", response_model=DashboardStatsResponse)
async def get_dashboard_stats(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db)
):
    """Get dashboard statistics"""
    from models import Client, ClientStatus, Trainer, ShopOrder
    
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Get client counts with status
    status_result = await db.execute(
        select(ClientStatus.status, func.count(ClientStatus.id))
        .group_by(ClientStatus.status)
    )
    status_counts = status_result.all()
    
    status_map = {"Active": 0, "Inactive": 0, "New": 0}
    for status, count in status_counts:
        if status in status_map:
            status_map[status] = count
    
    # Total clients (all time)
    total_clients_result = await db.execute(select(func.count()).select_from(Client))
    total_clients = total_clients_result.scalar() or 0
    
    # Total trainers
    trainers_result = await db.execute(select(func.count()).select_from(Trainer))
    total_trainers = trainers_result.scalar() or 0
    
    # Pending orders
    pending_orders_result = await db.execute(
        select(func.count()).select_from(ShopOrder)
        .where(ShopOrder.order_status.in_(["pending", "processing"]))
    )
    pending_orders = pending_orders_result.scalar() or 0
    
    # Revenue MTD (simplified - you can expand this)
    revenue_mtd = 48320  # Placeholder - calculate from actual orders
    
    return DashboardStatsResponse(
        new_clients=status_map["New"],
        active_clients=status_map["Active"],
        inactive_clients=status_map["Inactive"],
        total_clients=total_clients,
        total_trainers=total_trainers,
        pending_orders=pending_orders,
        revenue_mtd=revenue_mtd
    )
@router.get("/admin/today-birthdays")
async def get_today_birthdays(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db)
):
    """Admin endpoint to get clients whose birthday is today"""
    from sqlalchemy import func
    
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    today = datetime.utcnow().date()
    
    # Find clients with birthday today (comparing month and day)
    # Note: This handles cases where birthday is stored as DATE
    result = await db.execute(
        select(Client, User.email)
        .join(User, Client.id == User.id)
        .where(
            func.month(Client.birthday) == today.month,
            func.day(Client.birthday) == today.day,
            Client.birthday.isnot(None)
        )
    )
    rows = result.all()
    birthdays = []
    for client, email in rows:
        age = today.year - client.birthday.year if client.birthday else None
        birthdays.append({
            "id": str(uuid.UUID(bytes=client.id)),
            "name": client.name,
            "email": email,
            "birthday": client.birthday.isoformat() if client.birthday else None,
            "age": age
        })
    
    return birthdays
@router.post("/admin/send-birthday-email")
async def send_birthday_email_to_client(
    request: dict,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db)
):
    """Admin endpoint to send birthday email to client"""
    from email_service import send_birthday_email
    
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    client_id = uuid.UUID(request.get("client_id"))
    message = request.get("message", "Happy Birthday! 🎉 We're so glad you're part of the GymPro family!")
    
    # Get client details
    client_result = await db.execute(
        select(Client, User.email)
        .join(User, Client.id == User.id)
        .where(Client.id == client_id.bytes)
    )
    row = client_result.first()
    
    if not row:
        raise HTTPException(status_code=404, detail="Client not found")
    
    client, email = row
    
    # Send email
    success = await send_birthday_email(email, client.name, message)
    
    if success:
        return APIResponse(success=True, message=f"Birthday wishes sent to {client.name}!")
    else:
        raise HTTPException(status_code=500, detail="Failed to send email")
    
# ============================================================
# SENIOR TRAINER HELPER
# ============================================================
async def _is_senior_trainer(user_id: bytes, db: AsyncSession) -> bool:
    result = await db.execute(select(Trainer.is_senior).where(Trainer.id == user_id))
    is_senior = result.scalar_one_or_none()
    return is_senior is True


# ============================================================
# SENIOR TRAINER ENDPOINTS
# ============================================================

@router.get("/senior/profile", response_model=SeniorProfileResponse)
async def get_senior_profile(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db)
):
    """Get senior trainer's profile with aggregated statistics"""
    if current_user["role"] != "trainer":
        raise HTTPException(403, "Not a trainer")
    if not await _is_senior_trainer(current_user["user_id"].bytes, db):
        raise HTTPException(403, "Not a senior trainer")

    trainer_id_bytes = current_user["user_id"].bytes
    result = await db.execute(
        select(Trainer, User.email)
        .join(User, Trainer.id == User.id)
        .where(Trainer.id == trainer_id_bytes)
    )
    row = result.first()
    if not row:
        raise HTTPException(404, "Trainer not found")
    trainer, email = row

    # Calculate derived stats
    client_count_result = await db.execute(
        select(func.count(ClientStatus.id))
        .where(ClientStatus.assigned_trainer_id == trainer_id_bytes)
    )
    clients_assigned = client_count_result.scalar() or 0

    assess_result = await db.execute(
        select(func.max(TrainerAssessment.assessment_date), func.avg(TrainerAssessment.average_score))
        .where(TrainerAssessment.trainer_id == trainer_id_bytes)
    )
    last_assess_date, avg_assess_score = assess_result.first()
    avg_assess_score = float(avg_assess_score) if avg_assess_score else None
    monthly_score = avg_assess_score

    sessions_completed = getattr(trainer, 'sessions_completed', 0)
    attendance_rate = getattr(trainer, 'attendance_rate', 0.0)

    return SeniorProfileResponse(
        id=uuid.UUID(bytes=trainer.id),
        name=trainer.name,
        email=email,
        rank="Senior Trainer" if trainer.is_senior else "Trainer",
        age=datetime.now().year - trainer.birthday.year if trainer.birthday else None,
        rating=float(trainer.rating) if trainer.rating else None,
        specialisation=getattr(trainer, 'specialisation', None),
        certification=trainer.certification,
        years_experience=getattr(trainer, 'years_experience', None),
        monthly_score=monthly_score,
        sessions_attended=getattr(trainer, 'sessions_attended', None),
        sessions_completed=sessions_completed,
        clients_assigned=clients_assigned,
        attendance_rate=attendance_rate,
        last_assessment_date=last_assess_date,
        average_assessment_score=avg_assess_score,
        created_at=trainer.created_at,
        updated_at=trainer.updated_at
    )


@router.get("/senior/other-trainers", response_model=List[TrainerForAssessment])
async def get_other_trainers(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db)
):
    """Return list of trainers (excluding the current senior)"""
    if current_user["role"] != "trainer":
        raise HTTPException(403, "Not a trainer")
    if not await _is_senior_trainer(current_user["user_id"].bytes, db):
        raise HTTPException(403, "Not a senior trainer")

    self_id = current_user["user_id"].bytes
    result = await db.execute(
        select(Trainer.id, Trainer.name, Trainer.is_senior)
        .where(Trainer.id != self_id)
        .order_by(Trainer.name)
    )
    rows = result.all()

    trainers_list = []
    for trainer_id, name, is_senior in rows:
        assess_result = await db.execute(
            select(func.max(TrainerAssessment.assessment_date), func.avg(TrainerAssessment.average_score))
            .where(TrainerAssessment.trainer_id == trainer_id)
        )
        last_date, avg_rating = assess_result.first()
        trainers_list.append(
            TrainerForAssessment(
                id=uuid.UUID(bytes=trainer_id),
                name=name,
                last_assessed=last_date,
                average_rating=float(avg_rating) if avg_rating else None
            )
        )
    return trainers_list


@router.get("/senior/clients-at-risk", response_model=List[ClientRisk])
async def get_clients_at_risk(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db)
):
    """Return clients with progress_percentage < 50%"""
    if current_user["role"] != "trainer":
        raise HTTPException(403, "Not a trainer")
    if not await _is_senior_trainer(current_user["user_id"].bytes, db):
        raise HTTPException(403, "Not a senior trainer")

    result = await db.execute(
        select(Client.id, Client.name, ClientStatus.fitness_goal, ClientStatus.progress_percentage)
        .outerjoin(ClientStatus, Client.id == ClientStatus.client_id)
        .where(ClientStatus.progress_percentage < 50)
        .order_by(ClientStatus.progress_percentage)
        .limit(10)
    )
    rows = result.all()

    return [
        ClientRisk(
            id=uuid.UUID(bytes=cid),
            name=name,
            goal=goal,
            progress_percentage=progress or 0
        )
        for cid, name, goal, progress in rows
    ]


@router.post("/senior/assessments", response_model=APIResponse)
async def assess_trainer(
    assessment: TrainerAssessmentRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db)
):
    """Senior trainer submits assessment for another trainer"""
    if current_user["role"] != "trainer":
        raise HTTPException(403, "Not a trainer")
    if not await _is_senior_trainer(current_user["user_id"].bytes, db):
        raise HTTPException(403, "Not a senior trainer")

    trainer_id_bytes = assessment.trainer_id.bytes

    target = await db.get(Trainer, trainer_id_bytes)
    if not target:
        raise HTTPException(404, "Target trainer not found")

    new_assessment = TrainerAssessment(
        trainer_id=trainer_id_bytes,
        trainer_name=assessment.trainer_name,
        performance_score=assessment.scores.perf,
        motivation_score=assessment.scores.motiv,
        interaction_score=assessment.scores.interact,
        knowledge_score=assessment.scores.knowledge,
        punctuality_score=assessment.scores.punct,
        average_score=assessment.average,
        standing=assessment.standing,
        assessment_date=datetime.utcnow().date(),
        notes=assessment.notes
    )
    db.add(new_assessment)
    await db.commit()

    avg_result = await db.execute(
        select(func.avg(TrainerAssessment.average_score))
        .where(TrainerAssessment.trainer_id == trainer_id_bytes)
    )
    new_avg = avg_result.scalar() or 0
    await db.execute(
        update(Trainer)
        .where(Trainer.id == trainer_id_bytes)
        .values(rating=float(new_avg))
    )
    await db.commit()

    return APIResponse(success=True, message="Assessment submitted", data={"average_rating": float(new_avg)})


@router.get("/senior/assessments/{trainer_id}", response_model=List[TrainerAssessmentResponse])
async def get_trainer_assessments(
    trainer_id: uuid.UUID,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db)
):
    """Get all assessments for a given trainer (senior only)"""
    if current_user["role"] != "trainer":
        raise HTTPException(403, "Not a trainer")
    if not await _is_senior_trainer(current_user["user_id"].bytes, db):
        raise HTTPException(403, "Not a senior trainer")

    result = await db.execute(
        select(TrainerAssessment)
        .where(TrainerAssessment.trainer_id == trainer_id.bytes)
        .order_by(TrainerAssessment.assessment_date.desc())
    )
    assessments = result.scalars().all()
    return [TrainerAssessmentResponse.model_validate(a) for a in assessments]


@router.get("/senior/trainer-reviews", response_model=List[TrainerReviewResponse])
async def get_trainer_reviews(
    trainer_name: Optional[str] = None,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db)
):
    """Get public reviews for trainers (uses trainer_ratings table)"""
    if current_user["role"] != "trainer":
        raise HTTPException(403, "Not a trainer")
    if not await _is_senior_trainer(current_user["user_id"].bytes, db):
        raise HTTPException(403, "Not a senior trainer")

    query = select(TrainerRating).order_by(TrainerRating.created_at.desc())
    if trainer_name:
        query = query.where(TrainerRating.trainer_name == trainer_name)
    result = await db.execute(query)
    ratings = result.scalars().all()

    reviews = []
    for r in ratings:
        reviews.append(
            TrainerReviewResponse(
                id=r.id,
                trainer_name=r.trainer_name,
                reviewer_name="Client",
                rating=r.rating,
                comment="No comment",
                created_at=r.created_at
            )
        )
    return reviews


@router.post("/senior/send-coaching-message")
async def send_coaching_message(
    request: CoachingMessageRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db)
):
    """Send a coaching message to a client (email)"""
    if current_user["role"] != "trainer":
        raise HTTPException(403, "Not a trainer")
    if not await _is_senior_trainer(current_user["user_id"].bytes, db):
        raise HTTPException(403, "Not a senior trainer")

    from email_service import send_coaching_email
    success = await send_coaching_email(
        to_email=request.client_email,
        client_name=request.client_name,
        message=request.message,
        session_date=request.session_date,
        session_time=request.session_time
    )
    if not success:
        raise HTTPException(500, "Failed to send email")
    return {"message": "Coaching message sent"}