from fastapi import APIRouter, Depends, HTTPException, Query, status, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete, func,desc, asc
import uuid
import json
import logging
import os
import aiofiles
from datetime import date, datetime, timedelta
from typing import Optional, List
from database import get_user_db
from models import User, ProgressPhoto, Attendance, NutritionPlan, NutritionGoals, BodyMeasurement
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
    DashboardStatsResponse, ProgressPhotoResponse, ProgressPhotoCreate,
    AttendanceCheckIn, AttendanceCheckOut, AttendanceResponse, AttendanceHistoryResponse, SessionStatsResponse,
    NutritionPlanResponse, NutritionGoalsRequest, NutritionGoalsResponse,
    ProgressAnalyticsResponse, ProgressComparisonResponse, ProgressSummaryResponse,
    ActivityDataCreate, ActivityDataResponse, ActivityDataListResponse
)
from auth_router import get_current_user
from config.config import settings

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
    }

@router.get("/progress/history", response_model=list[ProgressTrackingResponse])
async def get_progress_history(
    limit: int = Query(12, ge=1, le=100),
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db)
):
    """Get enhanced progress history with integrated photos for the current user"""
    try:
        user_id = current_user["user_id"]
        user_id_bytes = user_id.bytes
        
        logger.info(f"Fetching enhanced progress history for user: {user_id}")
        
        # Get body measurements
        measurements_result = await db.execute(
            select(BodyMeasurement)
            .where(BodyMeasurement.user_id == user_id_bytes)
            .order_by(asc(BodyMeasurement.recorded_at))
            .limit(limit)
        )
        measurements = measurements_result.scalars().all()
        
        # Get progress photos for the same period
        photos_result = await db.execute(
            select(ProgressPhoto)
            .where(ProgressPhoto.user_id == user_id_bytes)
            .order_by(desc(ProgressPhoto.created_at))
            .limit(limit * 2)  # Get more photos to match with measurements
        )
        photos = photos_result.scalars().all()
        
        logger.info(f"Found {len(measurements)} measurements and {len(photos)} photos")
        
        response = []
        for measurement in measurements:
            # Create measurements object from the individual fields
            measurements_dict = {
                "weight": float(measurement.weight) if measurement.weight else None,
                "height": float(measurement.height) if measurement.height else None,
                "body_fat": float(measurement.body_fat) if measurement.body_fat else None,
                "chest": float(measurement.chest) if measurement.chest else None,
                "waist": float(measurement.waist) if measurement.waist else None,
                "shoulders": float(measurement.shoulders) if measurement.shoulders else None,
                "arm_left": float(measurement.arm_left) if measurement.arm_left else None,
                "arm_right": float(measurement.arm_right) if measurement.arm_right else None,
                "neck": float(measurement.neck) if measurement.neck else None,
                "hips": float(measurement.hips) if measurement.hips else None,
                "thigh_left": float(measurement.thigh_left) if measurement.thigh_left else None,
                "thigh_right": float(measurement.thigh_right) if measurement.thigh_right else None,
                "calf_left": float(measurement.calf_left) if measurement.calf_left else None,
                "calf_right": float(measurement.calf_right) if measurement.calf_right else None,
                "glutes": float(measurement.glutes) if measurement.glutes else None,
            }
            # Remove None values
            measurements_dict = {k: v for k, v in measurements_dict.items() if v is not None}
            
            # Find photos taken within 24 hours of this measurement
            measurement_date = measurement.recorded_at.date()
            related_photos = [
                ProgressPhotoResponse(
                    id=photo.id,
                    user_id=user_id,
                    filename=photo.filename,
                    original_filename=photo.original_filename,
                    file_path=photo.file_path,
                    file_size=photo.file_size,
                    mime_type=photo.mime_type,
                    description=photo.description,
                    created_at=photo.created_at
                )
                for photo in photos
                if abs((photo.created_at.date() - measurement_date).days) <= 1
            ]
            
            response.append(
                ProgressTrackingResponse(
                    id=uuid.UUID(bytes=measurement.id),
                    user_id=user_id,
                    weight=float(measurement.weight) if measurement.weight else None,
                    height=float(measurement.height) if measurement.height else None,
                    measurements=BodyMeasurements(**measurements_dict) if measurements_dict else None,
                    recorded_at=measurement.recorded_at,
                    created_at=measurement.created_at,
                    progress_photos=related_photos
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
    """Get most recent progress entry with photos"""
    try:
        user_id = current_user["user_id"]
        user_id_bytes = user_id.bytes
        
        # Get latest measurement
        result = await db.execute(
            select(BodyMeasurement)
            .where(BodyMeasurement.user_id == user_id_bytes)
            .order_by(desc(BodyMeasurement.recorded_at))
            .limit(1)
        )
        entry = result.scalar_one_or_none()
        
        if not entry:
            raise HTTPException(status_code=404, detail="No progress data found")
        
        # Get photos from the last 2 days
        photos_result = await db.execute(
            select(ProgressPhoto)
            .where(ProgressPhoto.user_id == user_id_bytes)
            .where(ProgressPhoto.created_at >= entry.recorded_at - timedelta(days=2))
            .order_by(desc(ProgressPhoto.created_at))
        )
        recent_photos = photos_result.scalars().all()
        
        # Create measurements object
        measurements_dict = {
            "weight": float(entry.weight) if entry.weight else None,
            "height": float(entry.height) if entry.height else None,
            "body_fat": float(entry.body_fat) if entry.body_fat else None,
            "chest": float(entry.chest) if entry.chest else None,
            "waist": float(entry.waist) if entry.waist else None,
            "shoulders": float(entry.shoulders) if entry.shoulders else None,
            "arm_left": float(entry.arm_left) if entry.arm_left else None,
            "arm_right": float(entry.arm_right) if entry.arm_right else None,
            "neck": float(entry.neck) if entry.neck else None,
            "hips": float(entry.hips) if entry.hips else None,
            "thigh_left": float(entry.thigh_left) if entry.thigh_left else None,
            "thigh_right": float(entry.thigh_right) if entry.thigh_right else None,
            "calf_left": float(entry.calf_left) if entry.calf_left else None,
            "calf_right": float(entry.calf_right) if entry.calf_right else None,
            "glutes": float(entry.glutes) if entry.glutes else None,
        }
        # Remove None values
        measurements_dict = {k: v for k, v in measurements_dict.items() if v is not None}
        
        # Build photo responses
        photo_responses = [
            ProgressPhotoResponse(
                id=photo.id,
                user_id=user_id,
                filename=photo.filename,
                original_filename=photo.original_filename,
                file_path=photo.file_path,
                file_size=photo.file_size,
                mime_type=photo.mime_type,
                description=photo.description,
                created_at=photo.created_at
            )
            for photo in recent_photos
        ]
        
        return ProgressTrackingResponse(
            id=uuid.UUID(bytes=entry.id),
            user_id=user_id,
            weight=float(entry.weight) if entry.weight else None,
            height=float(entry.height) if entry.height else None,
            measurements=BodyMeasurements(**measurements_dict) if measurements_dict else None,
            recorded_at=entry.recorded_at,
            created_at=entry.created_at,
            progress_photos=photo_responses
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting latest progress: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to get latest progress")

# ============================================================
# ENHANCED PROGRESS ANALYTICS ENDPOINTS
# ============================================================

@router.get("/progress/analytics", response_model=ProgressAnalyticsResponse)
async def get_progress_analytics(
    period: str = Query("month", regex="^(week|month|quarter|year)$"),
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db)
):
    """Get detailed progress analytics for specified period"""
    try:
        user_id = current_user["user_id"]
        user_id_bytes = user_id.bytes
        
        # Calculate date range based on period
        end_date = datetime.utcnow().date()
        if period == "week":
            start_date = end_date - timedelta(days=7)
        elif period == "month":
            start_date = end_date - timedelta(days=30)
        elif period == "quarter":
            start_date = end_date - timedelta(days=90)
        else:  # year
            start_date = end_date - timedelta(days=365)
        
        # Get measurements in period
        measurements_result = await db.execute(
            select(BodyMeasurement)
            .where(BodyMeasurement.user_id == user_id_bytes)
            .where(BodyMeasurement.recorded_at >= start_date)
            .where(BodyMeasurement.recorded_at <= end_date)
            .order_by(asc(BodyMeasurement.recorded_at))
        )
        measurements = measurements_result.scalars().all()
        
        # Get photos count in period
        photos_count_result = await db.execute(
            select(func.count(ProgressPhoto.id))
            .where(ProgressPhoto.user_id == user_id_bytes)
            .where(ProgressPhoto.created_at >= start_date)
            .where(ProgressPhoto.created_at <= end_date)
        )
        photos_count = photos_count_result.scalar() or 0
        
        # Calculate weight statistics
        weights = [float(m.weight) for m in measurements if m.weight]
        weight_stats = {}
        if weights:
            weight_stats = {
                "current": weights[-1] if weights else None,
                "start": weights[0] if weights else None,
                "change": weights[-1] - weights[0] if len(weights) > 1 else 0,
                "change_percentage": ((weights[-1] - weights[0]) / weights[0] * 100) if len(weights) > 1 and weights[0] != 0 else 0,
                "average": sum(weights) / len(weights),
                "min": min(weights),
                "max": max(weights)
            }
        
        # Calculate measurement changes
        measurement_changes = {}
        if len(measurements) >= 2:
            first_meas = measurements[0]
            last_meas = measurements[-1]
            
            for field in ['chest', 'waist', 'shoulders', 'arm_left', 'arm_right', 'neck', 'hips', 'thigh_left', 'thigh_right', 'calf_left', 'calf_right', 'glutes', 'body_fat']:
                first_val = float(getattr(first_meas, field)) if getattr(first_meas, field) else None
                last_val = float(getattr(last_meas, field)) if getattr(last_meas, field) else None
                if first_val and last_val:
                    measurement_changes[field] = {
                        "start": first_val,
                        "current": last_val,
                        "change": last_val - first_val,
                        "change_percentage": ((last_val - first_val) / first_val * 100) if first_val != 0 else 0
                    }
        
        # Calculate consistency score (based on frequency of measurements)
        days_in_period = (end_date - start_date).days
        expected_measurements = max(1, days_in_period // 7)  # Expect weekly measurements
        consistency_score = min(100, (len(measurements) / expected_measurements) * 100) if expected_measurements > 0 else 0
        
        # Generate achievements
        achievements = []
        if weight_stats.get("change", 0) < 0 and abs(weight_stats["change"]) >= 2:
            achievements.append({"type": "weight_loss", "description": f"Lost {abs(weight_stats['change']):.1f} lbs"})
        if photos_count >= 4:
            achievements.append({"type": "photo_consistency", "description": f"Added {photos_count} progress photos"})
        if consistency_score >= 80:
            achievements.append({"type": "measurement_consistency", "description": "Consistent tracking"})
        
        # Generate recommendations
        recommendations = []
        if len(measurements) < 2:
            recommendations.append("Try to take measurements at least weekly for better progress tracking")
        if photos_count < 2:
            recommendations.append("Add progress photos to visualize your transformation")
        if consistency_score < 50:
            recommendations.append("Be more consistent with your measurements for better insights")
        
        return ProgressAnalyticsResponse(
            user_id=user_id,
            period=period,
            start_date=start_date,
            end_date=end_date,
            weight_stats=weight_stats,
            measurement_changes=measurement_changes,
            progress_photos_count=photos_count,
            consistency_score=round(consistency_score, 1),
            achievements=achievements,
            recommendations=recommendations
        )
        
    except Exception as e:
        logger.error(f"Error getting progress analytics: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to get progress analytics")

@router.get("/progress/summary", response_model=ProgressSummaryResponse)
async def get_progress_summary(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db)
):
    """Get comprehensive progress summary with timeline and photos"""
    try:
        user_id = current_user["user_id"]
        user_id_bytes = user_id.bytes
        
        # Get latest measurements
        latest_result = await db.execute(
            select(BodyMeasurement)
            .where(BodyMeasurement.user_id == user_id_bytes)
            .order_by(desc(BodyMeasurement.recorded_at))
            .limit(1)
        )
        latest_measurement = latest_result.scalar_one_or_none()
        
        # Get progress timeline (last 6 measurements)
        timeline_result = await db.execute(
            select(BodyMeasurement)
            .where(BodyMeasurement.user_id == user_id_bytes)
            .order_by(desc(BodyMeasurement.recorded_at))
            .limit(6)
        )
        timeline_measurements = timeline_result.scalars().all()
        
        # Get recent photos
        photos_result = await db.execute(
            select(ProgressPhoto)
            .where(ProgressPhoto.user_id == user_id_bytes)
            .order_by(desc(ProgressPhoto.created_at))
            .limit(6)
        )
        recent_photos = photos_result.scalars().all()
        
        # Build current stats
        current_stats = {}
        if latest_measurement:
            current_stats = {
                "weight": float(latest_measurement.weight) if latest_measurement.weight else None,
                "height": float(latest_measurement.height) if latest_measurement.height else None,
                "body_fat": float(latest_measurement.body_fat) if latest_measurement.body_fat else None,
                "chest": float(latest_measurement.chest) if latest_measurement.chest else None,
                "waist": float(latest_measurement.waist) if latest_measurement.waist else None,
                "last_updated": latest_measurement.recorded_at.isoformat()
            }
        
        # Build timeline
        progress_timeline = []
        for meas in reversed(timeline_measurements):  # Reverse to show chronological
            timeline_entry = {
                "date": meas.recorded_at.date().isoformat(),
                "weight": float(meas.weight) if meas.weight else None,
                "body_fat": float(meas.body_fat) if meas.body_fat else None
            }
            progress_timeline.append(timeline_entry)
        
        # Build photo responses
        photo_responses = [
            ProgressPhotoResponse(
                id=photo.id,
                user_id=user_id,
                filename=photo.filename,
                original_filename=photo.original_filename,
                file_path=photo.file_path,
                file_size=photo.file_size,
                mime_type=photo.mime_type,
                description=photo.description,
                created_at=photo.created_at
            )
            for photo in recent_photos
        ]
        
        # Generate achievements based on data
        achievements = []
        total_measurements = len(timeline_measurements)
        if total_measurements >= 5:
            achievements.append({"type": "consistent_tracker", "description": f"Logged {total_measurements} measurements"})
        if len(recent_photos) >= 3:
            achievements.append({"type": "visual_progress", "description": f"Added {len(recent_photos)} progress photos"})
        
        # Generate next milestones
        next_milestones = []
        if latest_measurement and latest_measurement.weight:
            current_weight = float(latest_measurement.weight)
            if current_weight > 150:
                next_milestones.append({"type": "weight_goal", "description": "Reach 150 lbs", "target": 150})
            elif current_weight > 140:
                next_milestones.append({"type": "weight_goal", "description": "Reach 140 lbs", "target": 140})
        
        # Calculate streak data
        streak_data = {
            "current_streak": 0,  # Could be enhanced with actual streak logic
            "longest_streak": 0,
            "total_days_tracked": total_measurements
        }
        
        return ProgressSummaryResponse(
            user_id=user_id,
            current_stats=current_stats,
            progress_timeline=progress_timeline,
            recent_photos=photo_responses,
            achievements=achievements,
            next_milestones=next_milestones,
            streak_data=streak_data
        )
        
    except Exception as e:
        logger.error(f"Error getting progress summary: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to get progress summary")

@router.get("/progress/compare", response_model=ProgressComparisonResponse)
async def compare_progress_periods(
    period1: str = Query("current_month", description="First period (current_month, last_month, current_quarter, etc.)"),
    period2: str = Query("last_month", description="Second period to compare against"),
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db)
):
    """Compare progress between two different time periods"""
    try:
        user_id = current_user["user_id"]
        user_id_bytes = user_id.bytes
        
        # Helper function to get date range for period
        def get_date_range(period_name):
            end_date = datetime.utcnow().date()
            if period_name == "current_month":
                start_date = end_date.replace(day=1)
                return start_date, end_date
            elif period_name == "last_month":
                if end_date.month == 1:
                    start_date = end_date.replace(year=end_date.year-1, month=12, day=1)
                    period_end = end_date.replace(year=end_date.year-1, month=12, day=31)
                else:
                    start_date = end_date.replace(month=end_date.month-1, day=1)
                    period_end = end_date.replace(day=1) - timedelta(days=1)
                return start_date, period_end
            elif period_name == "current_quarter":
                quarter = (end_date.month - 1) // 3 + 1
                start_date = end_date.replace(month=(quarter-1)*3+1, day=1)
                return start_date, end_date
            else:
                # Default to last 30 days
                start_date = end_date - timedelta(days=30)
                return start_date, end_date
        
        # Get measurements for both periods
        start1, end1 = get_date_range(period1)
        start2, end2 = get_date_range(period2)
        
        async def get_period_stats(start_date, end_date):
            result = await db.execute(
                select(BodyMeasurement)
                .where(BodyMeasurement.user_id == user_id_bytes)
                .where(BodyMeasurement.recorded_at >= start_date)
                .where(BodyMeasurement.recorded_at <= end_date)
                .order_by(asc(BodyMeasurement.recorded_at))
            )
            measurements = result.scalars().all()
            
            weights = [float(m.weight) for m in measurements if m.weight]
            if not weights:
                return {"measurements_count": 0}
            
            return {
                "measurements_count": len(measurements),
                "avg_weight": sum(weights) / len(weights),
                "start_weight": weights[0],
                "end_weight": weights[-1],
                "weight_change": weights[-1] - weights[0] if len(weights) > 1 else 0
            }
        
        period1_stats = await get_period_stats(start1, end1)
        period2_stats = await get_period_stats(start2, end2)
        
        # Calculate changes between periods
        changes = {}
        if period1_stats.get("avg_weight") and period2_stats.get("avg_weight"):
            weight_diff = period1_stats["avg_weight"] - period2_stats["avg_weight"]
            changes["weight"] = {
                "absolute_change": weight_diff,
                "percentage_change": (weight_diff / period2_stats["avg_weight"] * 100) if period2_stats["avg_weight"] != 0 else 0
            }
        
        # Generate improvement areas and achievements
        improvement_areas = []
        achievements = []
        
        if changes.get("weight", {}).get("absolute_change", 0) < 0:
            achievements.append("Weight loss improvement")
        elif changes.get("weight", {}).get("absolute_change", 0) > 0:
            improvement_areas.append("Weight management focus needed")
        
        if period1_stats.get("measurements_count", 0) > period2_stats.get("measurements_count", 0):
            achievements.append("More consistent tracking")
        else:
            improvement_areas.append("Increase measurement frequency")
        
        return ProgressComparisonResponse(
            period_1={"name": period1, "stats": period1_stats, "date_range": {"start": start1.isoformat(), "end": end1.isoformat()}},
            period_2={"name": period2, "stats": period2_stats, "date_range": {"start": start2.isoformat(), "end": end2.isoformat()}},
            changes=changes,
            improvement_areas=improvement_areas,
            achievements=achievements
        )
        
    except Exception as e:
        logger.error(f"Error comparing progress periods: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to compare progress periods")

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
# TRAINING SCHEDULE ENDPOINTS
# ============================================================
# 
# Endpoints for managing client training schedules
# ============================================================

@router.get("/training-schedule", response_model=List[TrainingScheduleResponse])
async def get_training_schedule(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db)
):
    """Get current user's training schedule"""
    from models import TrainingSchedule
    import json
    
    user_id = current_user["user_id"]
    user_id_bytes = user_id.bytes
    
    result = await db.execute(
        select(TrainingSchedule)
        .where(TrainingSchedule.client_id == user_id_bytes)
        .where(TrainingSchedule.is_active == True)
        .order_by(TrainingSchedule.day_number)
    )
    schedule = result.scalars().all()
    
    return [
        TrainingScheduleResponse(
            id=s.id,
            client_id=uuid.UUID(bytes=s.client_id),
            day_of_week=s.day_of_week,
            day_number=s.day_number,
            workout_type=s.workout_type,
            exercises=json.loads(s.exercises) if s.exercises else [],
            duration_minutes=s.duration_minutes,
            intensity_level=s.intensity_level,
            notes=s.notes,
            is_active=s.is_active,
            created_at=s.created_at,
            updated_at=s.updated_at
        )
        for s in schedule
    ]

@router.put("/training-schedule/{schedule_id}", response_model=TrainingScheduleResponse)
async def update_training_schedule(
    schedule_id: int,
    request: UpdateTrainingScheduleRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db)
):
    """Update a training schedule entry with enhanced validation and error handling"""
    from models import TrainingSchedule
    import json
    
    user_id = current_user["user_id"]
    user_id_bytes = user_id.bytes
    
    # Only clients can update their own training schedule
    if current_user["role"] != "client":
        raise HTTPException(status_code=403, detail="Only clients can update their training schedule")
    
    try:
        # Find the schedule entry
        result = await db.execute(
            select(TrainingSchedule)
            .where(TrainingSchedule.id == schedule_id)
            .where(TrainingSchedule.client_id == user_id_bytes)
        )
        schedule = result.scalar_one_or_none()
        
        if not schedule:
            raise HTTPException(status_code=404, detail="Schedule entry not found")
        
        # Prepare update values with validation
        update_values = {k: v for k, v in request.dict().items() if v is not None}
        
        if not update_values:
            raise HTTPException(status_code=400, detail="No valid updates provided")
        
        # Validate day_of_week if provided
        if "day_of_week" in update_values:
            valid_days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
            if update_values["day_of_week"] not in valid_days:
                raise HTTPException(
                    status_code=400, 
                    detail=f"Invalid day_of_week. Must be one of: {', '.join(valid_days)}"
                )
        
        # Validate day_number if provided
        if "day_number" in update_values:
            if not (1 <= update_values["day_number"] <= 7):
                raise HTTPException(
                    status_code=400,
                    detail="Invalid day_number. Must be between 1 and 7"
                )
        
        # Validate intensity_level if provided
        if "intensity_level" in update_values:
            valid_intensities = ["Low", "Medium", "High"]
            if update_values["intensity_level"] not in valid_intensities:
                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid intensity_level. Must be one of: {', '.join(valid_intensities)}"
                )
        
        # Validate duration_minutes if provided
        if "duration_minutes" in update_values:
            if not (5 <= update_values["duration_minutes"] <= 480):  # 5 min to 8 hours
                raise HTTPException(
                    status_code=400,
                    detail="Invalid duration_minutes. Must be between 5 and 480 minutes"
                )
        
        # Handle exercises list - convert to JSON string if provided
        if "exercises" in update_values:
            if not isinstance(update_values["exercises"], list):
                raise HTTPException(
                    status_code=400,
                    detail="Exercises must be provided as a list"
                )
            if not update_values["exercises"]:
                raise HTTPException(
                    status_code=400,
                    detail="Exercises list cannot be empty"
                )
            # Convert list to JSON string for database storage
            update_values["exercises"] = json.dumps(update_values["exercises"])
        
        # Update the schedule entry
        stmt = update(TrainingSchedule).where(TrainingSchedule.id == schedule_id).values(**update_values)
        await db.execute(stmt)
        await db.commit()
        
        # Fetch the updated schedule entry
        updated_result = await db.execute(
            select(TrainingSchedule).where(TrainingSchedule.id == schedule_id)
        )
        updated_schedule = updated_result.scalar_one()
        
        # Parse exercises from JSON to list for response
        exercises_list = json.loads(updated_schedule.exercises) if updated_schedule.exercises else []
        
        return TrainingScheduleResponse(
            id=updated_schedule.id,
            client_id=uuid.UUID(bytes=updated_schedule.client_id),
            day_of_week=updated_schedule.day_of_week,
            day_number=updated_schedule.day_number,
            workout_type=updated_schedule.workout_type,
            exercises=exercises_list,
            duration_minutes=updated_schedule.duration_minutes,
            intensity_level=updated_schedule.intensity_level,
            notes=updated_schedule.notes,
            is_active=updated_schedule.is_active,
            created_at=updated_schedule.created_at,
            updated_at=updated_schedule.updated_at
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating training schedule: {e}", exc_info=True)
        await db.rollback()
        raise HTTPException(status_code=500, detail="Internal server error while updating training schedule")

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
# PROGRESS PHOTOS ENDPOINTS
# ============================================================

@router.post("/progress-photos", response_model=ProgressPhotoResponse)
async def upload_progress_photo(
    file: UploadFile = File(...),
    description: Optional[str] = None,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db)
):
    """Upload a progress photo"""
    try:
        user_id = current_user["user_id"]
        user_id_bytes = user_id.bytes
        
        # Validate file type
        if not file.content_type or not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Create user directory if it doesn't exist
        user_dir = os.path.join(settings.PROGRESS_PHOTOS_DIR, str(user_id))
        os.makedirs(user_dir, exist_ok=True)
        
        # Generate unique filename
        file_extension = os.path.splitext(file.filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = os.path.join(user_dir, unique_filename)
        
        # Save file
        async with aiofiles.open(file_path, 'wb') as f:
            content = await file.read()
            await f.write(content)
        
        # Save to database
        new_photo = ProgressPhoto(
            user_id=user_id_bytes,
            filename=unique_filename,
            original_filename=file.filename,
            file_path=file_path,
            file_size=len(content),
            mime_type=file.content_type,
            description=description
        )
        
        db.add(new_photo)
        await db.commit()
        await db.refresh(new_photo)
        
        return ProgressPhotoResponse(
            id=new_photo.id,
            user_id=user_id,
            filename=new_photo.filename,
            original_filename=new_photo.original_filename,
            file_path=new_photo.file_path,
            file_size=new_photo.file_size,
            mime_type=new_photo.mime_type,
            description=new_photo.description,
            created_at=new_photo.created_at
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error uploading progress photo: {e}", exc_info=True)
        await db.rollback()
        raise HTTPException(status_code=500, detail="Failed to upload photo")

@router.get("/progress-photos", response_model=List[ProgressPhotoResponse])
async def get_progress_photos(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db)
):
    """Get user's progress photos"""
    try:
        user_id = current_user["user_id"]
        user_id_bytes = user_id.bytes
        
        result = await db.execute(
            select(ProgressPhoto)
            .where(ProgressPhoto.user_id == user_id_bytes)
            .order_by(ProgressPhoto.created_at.desc())
        )
        photos = result.scalars().all()
        
        return [
            ProgressPhotoResponse(
                id=photo.id,
                user_id=user_id,
                filename=photo.filename,
                original_filename=photo.original_filename,
                file_path=photo.file_path,
                file_size=photo.file_size,
                mime_type=photo.mime_type,
                description=photo.description,
                created_at=photo.created_at
            )
            for photo in photos
        ]
        
    except Exception as e:
        logger.error(f"Error getting progress photos: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to get photos")

@router.delete("/progress-photos/{photo_id}", response_model=APIResponse)
async def delete_progress_photo(
    photo_id: uuid.UUID,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db)
):
    """Delete a progress photo"""
    try:
        user_id = current_user["user_id"]
        user_id_bytes = user_id.bytes
        
        # Get photo
        result = await db.execute(
            select(ProgressPhoto)
            .where(ProgressPhoto.id == photo_id.bytes)
            .where(ProgressPhoto.user_id == user_id_bytes)
        )
        photo = result.scalar_one_or_none()
        
        if not photo:
            raise HTTPException(status_code=404, detail="Photo not found")
        
        # Delete file from filesystem
        try:
            if os.path.exists(photo.file_path):
                os.remove(photo.file_path)
        except Exception as e:
            logger.warning(f"Failed to delete file {photo.file_path}: {e}")
        
        # Delete from database
        await db.delete(photo)
        await db.commit()
        
        return APIResponse(success=True, message="Photo deleted successfully")
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting progress photo: {e}", exc_info=True)
        await db.rollback()
        raise HTTPException(status_code=500, detail="Failed to delete photo")

# ============================================================
# ATTENDANCE TRACKING ENDPOINTS
# ============================================================

@router.post("/attendance/check-in", response_model=AttendanceResponse)
async def check_in_attendance(
    check_in_data: AttendanceCheckIn,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db)
):
    """Log gym attendance check-in"""
    try:
        user_id = current_user["user_id"]
        user_id_bytes = user_id.bytes
        
        # Check if user already has an active session (checked in but not checked out)
        result = await db.execute(
            select(Attendance)
            .where(Attendance.user_id == user_id_bytes)
            .where(Attendance.check_out_time.is_(None))
            .order_by(desc(Attendance.check_in_time))
            .limit(1)
        )
        active_session = result.scalar_one_or_none()
        
        if active_session:
            raise HTTPException(
                status_code=400, 
                detail="You already have an active session. Please check out first."
            )
        
        # Create new attendance record
        new_attendance = Attendance(
            user_id=user_id_bytes,
            notes=check_in_data.notes
        )
        
        db.add(new_attendance)
        await db.commit()
        await db.refresh(new_attendance)
        
        return AttendanceResponse(
            id=uuid.UUID(bytes=new_attendance.id),
            user_id=user_id,
            check_in_time=new_attendance.check_in_time,
            check_out_time=new_attendance.check_out_time,
            duration_minutes=new_attendance.duration_minutes,
            notes=new_attendance.notes,
            created_at=new_attendance.created_at
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error checking in attendance: {e}", exc_info=True)
        await db.rollback()
        raise HTTPException(status_code=500, detail="Failed to check in")

@router.post("/attendance/check-out", response_model=AttendanceResponse)
async def check_out_attendance(
    check_out_data: AttendanceCheckOut,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db)
):
    """Log gym attendance check-out"""
    try:
        user_id = current_user["user_id"]
        user_id_bytes = user_id.bytes
        
        # Find the most recent active session
        result = await db.execute(
            select(Attendance)
            .where(Attendance.user_id == user_id_bytes)
            .where(Attendance.check_out_time.is_(None))
            .order_by(desc(Attendance.check_in_time))
            .limit(1)
        )
        active_session = result.scalar_one_or_none()
        
        if not active_session:
            raise HTTPException(
                status_code=404, 
                detail="No active session found. Please check in first."
            )
        
        # Update the session with check-out time
        check_out_time = datetime.utcnow()
        duration_minutes = int((check_out_time - active_session.check_in_time).total_seconds() / 60)
        
        active_session.check_out_time = check_out_time
        active_session.duration_minutes = duration_minutes
        if check_out_data.notes:
            active_session.notes = check_out_data.notes
        
        await db.commit()
        await db.refresh(active_session)
        
        return AttendanceResponse(
            id=uuid.UUID(bytes=active_session.id),
            user_id=user_id,
            check_in_time=active_session.check_in_time,
            check_out_time=active_session.check_out_time,
            duration_minutes=active_session.duration_minutes,
            notes=active_session.notes,
            created_at=active_session.created_at
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error checking out attendance: {e}", exc_info=True)
        await db.rollback()
        raise HTTPException(status_code=500, detail="Failed to check out")

@router.get("/attendance", response_model=AttendanceHistoryResponse)
async def get_attendance_history(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db)
):
    """Get attendance history for the current user"""
    try:
        user_id = current_user["user_id"]
        user_id_bytes = user_id.bytes
        
        # Get total count
        count_result = await db.execute(
            select(func.count(Attendance.id))
            .where(Attendance.user_id == user_id_bytes)
        )
        total_sessions = count_result.scalar()
        
        # Calculate pagination
        offset = (page - 1) * page_size
        total_pages = (total_sessions + page_size - 1) // page_size
        
        # Get attendance records
        result = await db.execute(
            select(Attendance)
            .where(Attendance.user_id == user_id_bytes)
            .order_by(desc(Attendance.check_in_time))
            .offset(offset)
            .limit(page_size)
        )
        attendances = result.scalars().all()
        
        attendance_responses = [
            AttendanceResponse(
                id=uuid.UUID(bytes=att.id),
                user_id=user_id,
                check_in_time=att.check_in_time,
                check_out_time=att.check_out_time,
                duration_minutes=att.duration_minutes,
                notes=att.notes,
                created_at=att.created_at
            )
            for att in attendances
        ]
        
        return AttendanceHistoryResponse(
            attendances=attendance_responses,
            total_sessions=total_sessions,
            page=page,
            page_size=page_size,
            total_pages=total_pages
        )
        
    except Exception as e:
        logger.error(f"Error getting attendance history: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to get attendance history")

@router.get("/session-stats", response_model=SessionStatsResponse)
async def get_session_stats(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db)
):
    """Get session statistics for the current user"""
    try:
        user_id = current_user["user_id"]
        user_id_bytes = user_id.bytes
        
        # Get all attendance records for the user
        result = await db.execute(
            select(Attendance)
            .where(Attendance.user_id == user_id_bytes)
            .order_by(asc(Attendance.check_in_time))
        )
        all_sessions = result.scalars().all()
        
        if not all_sessions:
            return SessionStatsResponse(
                total_sessions=0,
                current_streak=0,
                longest_streak=0,
                total_duration_minutes=0,
                average_duration_minutes=0.0,
                this_month_sessions=0,
                last_month_sessions=0
            )
        
        # Calculate basic stats
        total_sessions = len(all_sessions)
        completed_sessions = [s for s in all_sessions if s.duration_minutes is not None]
        total_duration_minutes = sum(s.duration_minutes or 0 for s in completed_sessions)
        average_duration_minutes = total_duration_minutes / len(completed_sessions) if completed_sessions else 0.0
        
        # Calculate current streak
        current_streak = 0
        today = datetime.utcnow().date()
        
        for session in reversed(all_sessions):
            session_date = session.check_in_time.date()
            if session_date == today - datetime.timedelta(days=current_streak):
                current_streak += 1
            else:
                break
        
        # Calculate longest streak
        longest_streak = 0
        temp_streak = 1
        dates = [s.check_in_time.date() for s in all_sessions]
        
        for i in range(1, len(dates)):
            if dates[i] == dates[i-1] + datetime.timedelta(days=1):
                temp_streak += 1
                longest_streak = max(longest_streak, temp_streak)
            else:
                temp_streak = 1
        
        longest_streak = max(longest_streak, temp_streak) if dates else 0
        
        # Calculate monthly stats
        now = datetime.utcnow()
        this_month = now.month
        last_month = this_month - 1 if this_month > 1 else 12
        this_year = now.year
        last_year = this_year - 1 if last_month == 12 else this_year
        
        this_month_sessions = len([
            s for s in all_sessions 
            if s.check_in_time.month == this_month and s.check_in_time.year == this_year
        ])
        
        last_month_sessions = len([
            s for s in all_sessions 
            if s.check_in_time.month == last_month and s.check_in_time.year == last_year
        ])
        
        return SessionStatsResponse(
            total_sessions=total_sessions,
            current_streak=current_streak,
            longest_streak=longest_streak,
            total_duration_minutes=total_duration_minutes,
            average_duration_minutes=round(average_duration_minutes, 1),
            this_month_sessions=this_month_sessions,
            last_month_sessions=last_month_sessions
        )
        
    except Exception as e:
        logger.error(f"Error getting session stats: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to get session stats")

# ============================================================
# NUTRITION PLAN ENDPOINTS
# ============================================================

@router.get("/nutrition-plan", response_model=NutritionPlanResponse)
async def get_nutrition_plan(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db)
):
    """Get personalized nutrition plan for the current user"""
    try:
        user_id = current_user["user_id"]
        user_id_bytes = user_id.bytes
        
        # Get the most recent nutrition plan
        result = await db.execute(
            select(NutritionPlan)
            .where(NutritionPlan.user_id == user_id_bytes)
            .order_by(desc(NutritionPlan.created_at))
            .limit(1)
        )
        plan = result.scalar_one_or_none()
        
        if not plan:
            # Generate a default nutrition plan based on user goals
            from models import ClientGoal, Client
            
            # Get client goals and basic info
            client_result = await db.execute(
                select(Client, ClientGoal).join(ClientGoal, Client.id == ClientGoal.client_id, isouter=True)
                .where(Client.id == user_id_bytes)
            )
            client_data = client_result.first()
            
            if not client_data:
                raise HTTPException(status_code=404, detail="Client profile not found")
            
            client, goals = client_data
            
            # Default macros (can be enhanced with actual calculation logic)
            daily_calories = 2000
            daily_protein_g = 150
            daily_carbs_g = 250
            daily_fat_g = 65
            
            # Adjust based on goals if available
            if goals:
                if goals.goal_type == "Cut Down":
                    daily_calories = 1800
                    daily_protein_g = 160
                elif goals.goal_type == "Bulk Up":
                    daily_calories = 2500
                    daily_protein_g = 180
            
            # Create default meals
            default_meals = [
                {
                    "meal_type": "breakfast",
                    "food_items": ["Oatmeal with berries", "Greek yogurt", "Banana"],
                    "calories": 450,
                    "protein_g": 30,
                    "carbs_g": 60,
                    "fat_g": 10
                },
                {
                    "meal_type": "lunch",
                    "food_items": ["Grilled chicken breast", "Brown rice", "Steamed vegetables"],
                    "calories": 550,
                    "protein_g": 45,
                    "carbs_g": 80,
                    "fat_g": 15
                },
                {
                    "meal_type": "dinner",
                    "food_items": ["Salmon", "Sweet potato", "Green salad"],
                    "calories": 600,
                    "protein_g": 50,
                    "carbs_g": 70,
                    "fat_g": 20
                },
                {
                    "meal_type": "snack",
                    "food_items": ["Protein shake", "Apple", "Almonds"],
                    "calories": 400,
                    "protein_g": 25,
                    "carbs_g": 40,
                    "fat_g": 20
                }
            ]
            
            # Create new nutrition plan
            new_plan = NutritionPlan(
                user_id=user_id_bytes,
                daily_calories=daily_calories,
                daily_protein_g=daily_protein_g,
                daily_carbs_g=daily_carbs_g,
                daily_fat_g=daily_fat_g,
                meals=default_meals
            )
            
            db.add(new_plan)
            await db.commit()
            await db.refresh(new_plan)
            
            plan = new_plan
        
        return NutritionPlanResponse(
            id=uuid.UUID(bytes=plan.id),
            user_id=user_id,
            daily_calories=float(plan.daily_calories),
            daily_protein_g=float(plan.daily_protein_g),
            daily_carbs_g=float(plan.daily_carbs_g),
            daily_fat_g=float(plan.daily_fat_g),
            daily_fiber_g=float(plan.daily_fiber_g) if plan.daily_fiber_g else None,
            meals=plan.meals,
            created_at=plan.created_at,
            updated_at=plan.updated_at
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting nutrition plan: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to get nutrition plan")

# ============================================================
# ACTIVITY/WEARABLE DATA ENDPOINTS
# ============================================================

@router.get("/activity", response_model=ActivityDataListResponse)
async def get_activity_data(
    start_date: Optional[date] = Query(None, description="Start date for activity data"),
    end_date: Optional[date] = Query(None, description="End date for activity data"),
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(30, ge=1, le=100, description="Items per page"),
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db)
):
    """Get activity data for the current user"""
    try:
        from models import ActivityData
        
        user_id = current_user["user_id"]
        user_id_bytes = user_id.bytes
        
        # Build query
        query = select(ActivityData).where(ActivityData.user_id == user_id_bytes)
        
        # Apply date filters
        if start_date:
            query = query.where(ActivityData.date >= start_date)
        if end_date:
            query = query.where(ActivityData.date <= end_date)
        
        # Get total count
        count_query = select(func.count()).select_from(query.subquery())
        total_count = await db.scalar(count_query)
        
        # Apply pagination and ordering
        query = query.order_by(desc(ActivityData.date)).offset((page - 1) * per_page).limit(per_page)
        
        result = await db.execute(query)
        activities = result.scalars().all()
        
        activity_responses = [
            ActivityDataResponse(
                id=uuid.UUID(bytes=activity.id),
                user_id=user_id,
                date=activity.date,
                steps=activity.steps,
                heart_rate_avg=activity.heart_rate_avg,
                heart_rate_max=activity.heart_rate_max,
                calories_burned=activity.calories_burned,
                active_minutes=activity.active_minutes,
                sleep_hours=activity.sleep_hours,
                sleep_quality=activity.sleep_quality,
                distance_km=activity.distance_km,
                floors_climbed=activity.floors_climbed,
                source=activity.source,
                raw_data=activity.raw_data,
                created_at=activity.created_at,
                updated_at=activity.updated_at
            )
            for activity in activities
        ]
        
        return ActivityDataListResponse(
            activities=activity_responses,
            total_count=total_count,
            page=page,
            per_page=per_page
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting activity data: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to get activity data")


@router.put("/activity", response_model=ActivityDataResponse)
async def update_activity_data(
    activity_data: ActivityDataCreate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db)
):
    """Update or create activity data for a specific date"""
    try:
        from models import ActivityData
        
        user_id = current_user["user_id"]
        user_id_bytes = user_id.bytes
        
        # Check if activity data exists for this date
        result = await db.execute(
            select(ActivityData).where(
                ActivityData.user_id == user_id_bytes,
                ActivityData.date == activity_data.date
            )
        )
        existing_activity = result.scalar_one_or_none()
        
        if existing_activity:
            # Update existing activity data
            for key, value in activity_data.dict().items():
                if hasattr(existing_activity, key) and value is not None:
                    setattr(existing_activity, key, value)
            existing_activity.updated_at = _utcnow()
            activity_obj = existing_activity
        else:
            # Create new activity data
            activity_obj = ActivityData(
                user_id=user_id_bytes,
                **activity_data.dict()
            )
            db.add(activity_obj)
        
        await db.commit()
        await db.refresh(activity_obj)
        
        return ActivityDataResponse(
            id=uuid.UUID(bytes=activity_obj.id),
            user_id=user_id,
            date=activity_obj.date,
            steps=activity_obj.steps,
            heart_rate_avg=activity_obj.heart_rate_avg,
            heart_rate_max=activity_obj.heart_rate_max,
            calories_burned=activity_obj.calories_burned,
            active_minutes=activity_obj.active_minutes,
            sleep_hours=activity_obj.sleep_hours,
            sleep_quality=activity_obj.sleep_quality,
            distance_km=activity_obj.distance_km,
            floors_climbed=activity_obj.floors_climbed,
            source=activity_obj.source,
            raw_data=activity_obj.raw_data,
            created_at=activity_obj.created_at,
            updated_at=activity_obj.updated_at
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating activity data: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to update activity data")

@router.put("/nutrition-goals", response_model=APIResponse)
async def update_nutrition_goals(
    goals_data: NutritionGoalsRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db)
):
    """Update nutrition goals for the current user"""
    try:
        from models import NutritionGoals
        
        user_id = current_user["user_id"]
        user_id_bytes = user_id.bytes
        
        # Check if goals exist
        result = await db.execute(
            select(NutritionGoals).where(NutritionGoals.user_id == user_id_bytes)
        )
        existing_goals = result.scalar_one_or_none()
        
        # Filter out None values
        update_values = {k: v for k, v in goals_data.dict().items() if v is not None}
        
        if existing_goals:
            # Update existing goals
            for key, value in update_values.items():
                if hasattr(existing_goals, key):
                    setattr(existing_goals, key, value)
        else:
            # Create new goals with defaults for missing values
            new_goals = NutritionGoals(
                user_id=user_id_bytes,
                daily_calories=update_values.get('daily_calories', 2000),
                daily_protein_g=update_values.get('daily_protein_g', 150),
                daily_carbs_g=update_values.get('daily_carbs_g', 250),
                daily_fat_g=update_values.get('daily_fat_g', 65),
                daily_fiber_g=update_values.get('daily_fiber_g', 25),
                dietary_restrictions=update_values.get('dietary_restrictions', []),
                allergies=update_values.get('allergies', []),
                goal_type=update_values.get('goal_type', 'maintain')
            )
            db.add(new_goals)
        
        await db.commit()
        
        return APIResponse(success=True, message="Nutrition goals updated successfully")
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating nutrition goals: {e}", exc_info=True)
        await db.rollback()
        raise HTTPException(status_code=500, detail="Failed to update nutrition goals")