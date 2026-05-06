from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete, func, desc
from database import get_user_db
from models import (
    User, Trainer, Client, BodyMeasurement, Attendance, 
    NutritionPlan, NutritionGoals, TrainingSchedule, ProgressPhoto,
    SavedConversation, ConversationMessage
)
from schemas import APIResponse
from auth_router import get_current_user
from typing import Optional, List, Dict, Any
import uuid
import logging
from datetime import datetime, date

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/trainers", tags=["trainers"])

# ============================================================
# TRAINER PROFILE MANAGEMENT
# ============================================================

@router.get("/profile", response_model=APIResponse)
async def get_trainer_profile(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db)
):
    """Get current trainer's profile"""
    try:
        user_id = current_user["user_id"]
        role = current_user.get("role", "client")
        
        if role != "trainer":
            raise HTTPException(status_code=403, detail="Access denied. Trainer role required.")
        
        result = await db.execute(
            select(Trainer, User.email, User.first_name, User.last_name)
            .join(User, Trainer.id == User.id)
            .where(Trainer.id == user_id.bytes)
        )
        row = result.first()
        if not row:
            raise HTTPException(status_code=404, detail="Trainer profile not found")
        
        trainer, email, first_name, last_name = row
        
        profile_data = {
            "id": str(uuid.UUID(bytes=trainer.id)),
            "name": trainer.name,
            "email": email,
            "first_name": first_name,
            "last_name": last_name,
            "certification": trainer.certification,
            "rating": float(trainer.rating) if trainer.rating else 0.0,
            "trainer_level": trainer.trainer_level,
            "is_senior": trainer.is_senior,
            "specialties": trainer.specialties or [],
            "bio": trainer.bio,
            "experience_years": trainer.experience_years,
            "hourly_rate": float(trainer.hourly_rate) if trainer.hourly_rate else None,
            "profile_image": trainer.profile_image,
            "created_at": trainer.created_at.isoformat() if trainer.created_at else None,
            "updated_at": trainer.updated_at.isoformat() if trainer.updated_at else None
        }
        
        return APIResponse(
            success=True,
            message="Trainer profile retrieved successfully",
            data=profile_data
        )
        
    except Exception as e:
        logger.error(f"Error getting trainer profile: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve trainer profile")


@router.put("/profile", response_model=APIResponse)
async def update_trainer_profile(
    profile_data: dict,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db)
):
    """Update current trainer's profile"""
    try:
        user_id = current_user["user_id"]
        role = current_user.get("role", "client")
        
        if role != "trainer":
            raise HTTPException(status_code=403, detail="Access denied. Trainer role required.")
        
        result = await db.execute(
            select(Trainer).where(Trainer.id == user_id.bytes)
        )
        trainer = result.scalar_one_or_none()
        if not trainer:
            raise HTTPException(status_code=404, detail="Trainer profile not found")
        
        # Update allowed fields
        allowed_fields = ['name', 'certification', 'specialties', 'bio', 
                        'experience_years', 'hourly_rate', 'trainer_level', 'profile_image']
        
        for field in allowed_fields:
            if field in profile_data:
                setattr(trainer, field, profile_data[field])
        
        trainer.updated_at = datetime.utcnow()
        
        await db.commit()
        
        return APIResponse(
            success=True,
            message="Trainer profile updated successfully",
            data={"updated": True}
        )
        
    except Exception as e:
        logger.error(f"Error updating trainer profile: {str(e)}")
        await db.rollback()
        raise HTTPException(status_code=500, detail="Failed to update trainer profile")


# ============================================================
# TRAINER CLIENT MANAGEMENT
# ============================================================

@router.get("/clients", response_model=APIResponse)
async def get_trainer_clients(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db)
):
    """Get all clients assigned to the trainer"""
    try:
        user_id = current_user["user_id"]
        role = current_user.get("role", "client")
        
        if role != "trainer":
            raise HTTPException(status_code=403, detail="Access denied. Trainer role required.")
        
        # Get all clients (simplified - in real app would have trainer-client assignments)
        result = await db.execute(
            select(Client, User.email, User.first_name, User.last_name)
            .join(User, Client.id == User.id)
            .where(User.is_active == True)
            .order_by(Client.name)
        )
        
        clients = []
        for row in result.all():
            client, email, first_name, last_name = row
            
            client_data = {
                "id": str(uuid.UUID(bytes=client.id)),
                "name": client.name,
                "email": email,
                "first_name": first_name,
                "last_name": last_name,
                "gender": client.gender,
                "phone_number": client.phone_number,
                "birthday": client.birthday.isoformat() if client.birthday else None,
                "height": float(client.height) if client.height else None,
                "weight": float(client.weight) if client.weight else None,
                "profile_image": client.profile_image,
                "emergency_contact_name": client.emergency_contact_name,
                "emergency_contact_phone": client.emergency_contact_phone,
                "medical_conditions": client.medical_conditions,
                "fitness_goals": client.fitness_goals,
                "created_at": client.created_at.isoformat() if client.created_at else None,
                "updated_at": client.updated_at.isoformat() if client.updated_at else None
            }
            clients.append(client_data)
        
        return APIResponse(
            success=True,
            message="Clients retrieved successfully",
            data={"clients": clients}
        )
        
    except Exception as e:
        logger.error(f"Error getting trainer clients: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve clients")


@router.get("/clients/{client_id}", response_model=APIResponse)
async def get_client_details(
    client_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db)
):
    """Get detailed information about a specific client"""
    try:
        user_id = current_user["user_id"]
        role = current_user.get("role", "client")
        
        if role != "trainer":
            raise HTTPException(status_code=403, detail="Access denied. Trainer role required.")
        
        client_uuid = uuid.UUID(client_id)
        
        result = await db.execute(
            select(Client, User.email, User.first_name, User.last_name)
            .join(User, Client.id == User.id)
            .where(Client.id == client_uuid.bytes)
        )
        row = result.first()
        if not row:
            raise HTTPException(status_code=404, detail="Client not found")
        
        client, email, first_name, last_name = row
        
        client_data = {
            "id": str(uuid.UUID(bytes=client.id)),
            "name": client.name,
            "email": email,
            "first_name": first_name,
            "last_name": last_name,
            "gender": client.gender,
            "phone_number": client.phone_number,
            "birthday": client.birthday.isoformat() if client.birthday else None,
            "height": float(client.height) if client.height else None,
            "weight": float(client.weight) if client.weight else None,
            "profile_image": client.profile_image,
            "emergency_contact_name": client.emergency_contact_name,
            "emergency_contact_phone": client.emergency_contact_phone,
            "medical_conditions": client.medical_conditions,
            "fitness_goals": client.fitness_goals,
            "created_at": client.created_at.isoformat() if client.created_at else None,
            "updated_at": client.updated_at.isoformat() if client.updated_at else None
        }
        
        return APIResponse(
            success=True,
            message="Client details retrieved successfully",
            data=client_data
        )
        
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid client ID format")
    except Exception as e:
        logger.error(f"Error getting client details: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve client details")


@router.put("/clients/{client_id}/progress", response_model=APIResponse)
async def update_client_progress(
    client_id: str,
    progress_data: dict,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db)
):
    """Update client progress measurements"""
    try:
        user_id = current_user["user_id"]
        role = current_user.get("role", "client")
        
        if role != "trainer":
            raise HTTPException(status_code=403, detail="Access denied. Trainer role required.")
        
        client_uuid = uuid.UUID(client_id)
        
        # Create new body measurement entry
        measurement = BodyMeasurement(
            user_id=client_uuid.bytes,
            recorded_at=datetime.utcnow(),
            weight=progress_data.get('weight'),
            height=progress_data.get('height'),
            body_fat=progress_data.get('body_fat'),
            chest=progress_data.get('chest'),
            waist=progress_data.get('waist'),
            shoulders=progress_data.get('shoulders'),
            arm_left=progress_data.get('arm_left'),
            arm_right=progress_data.get('arm_right'),
            neck=progress_data.get('neck'),
            hips=progress_data.get('hips'),
            thigh_left=progress_data.get('thigh_left'),
            thigh_right=progress_data.get('thigh_right'),
            calf_left=progress_data.get('calf_left'),
            calf_right=progress_data.get('calf_right'),
            glutes=progress_data.get('glutes'),
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        
        db.add(measurement)
        await db.commit()
        
        return APIResponse(
            success=True,
            message="Client progress updated successfully",
            data={"measurement_id": str(measurement.id)}
        )
        
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid client ID format")
    except Exception as e:
        logger.error(f"Error updating client progress: {str(e)}")
        await db.rollback()
        raise HTTPException(status_code=500, detail="Failed to update client progress")


@router.get("/clients/{client_id}/progress-history", response_model=APIResponse)
async def get_client_progress_history(
    client_id: str,
    limit: int = Query(10, ge=1, le=100),
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db)
):
    """Get client's progress history"""
    try:
        user_id = current_user["user_id"]
        role = current_user.get("role", "client")
        
        if role != "trainer":
            raise HTTPException(status_code=403, detail="Access denied. Trainer role required.")
        
        client_uuid = uuid.UUID(client_id)
        
        result = await db.execute(
            select(BodyMeasurement)
            .where(BodyMeasurement.user_id == client_uuid.bytes)
            .order_by(desc(BodyMeasurement.recorded_at))
            .limit(limit)
        )
        
        measurements = []
        for measurement in result.scalars().all():
            measurement_data = {
                "id": str(measurement.id),
                "recorded_at": measurement.recorded_at.isoformat(),
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
                "created_at": measurement.created_at.isoformat() if measurement.created_at else None
            }
            measurements.append(measurement_data)
        
        return APIResponse(
            success=True,
            message="Progress history retrieved successfully",
            data={"measurements": measurements}
        )
        
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid client ID format")
    except Exception as e:
        logger.error(f"Error getting progress history: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve progress history")


# ============================================================
# CLIENT NOTES AND COMMUNICATION
# ============================================================

@router.post("/clients/{client_id}/notes", response_model=APIResponse)
async def add_client_note(
    client_id: str,
    note_data: dict,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db)
):
    """Add a note for a client"""
    try:
        user_id = current_user["user_id"]
        role = current_user.get("role", "client")
        
        if role != "trainer":
            raise HTTPException(status_code=403, detail="Access denied. Trainer role required.")
        
        client_uuid = uuid.UUID(client_id)
        
        # Create a simple note entry (would ideally have a dedicated notes table)
        note = {
            "client_id": client_id,
            "trainer_id": str(user_id),
            "note": note_data.get('note'),
            "note_type": note_data.get('note_type', 'general'),
            "created_at": datetime.utcnow().isoformat()
        }
        
        # For now, store as a conversation message
        conversation = SavedConversation(
            user_id=client_uuid.bytes,
            session_id=f"trainer_notes_{client_id}_{user_id}",
            title=f"Trainer Notes - {datetime.utcnow().strftime('%Y-%m-%d')}",
            message_count=1,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        
        db.add(conversation)
        await db.flush()
        
        message = ConversationMessage(
            conversation_id=conversation.id,
            role="trainer",
            content=f"Note: {note_data.get('note')}",
            sequence_order=1,
            created_at=datetime.utcnow()
        )
        
        db.add(message)
        await db.commit()
        
        return APIResponse(
            success=True,
            message="Client note added successfully",
            data={"note_id": str(conversation.id)}
        )
        
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid client ID format")
    except Exception as e:
        logger.error(f"Error adding client note: {str(e)}")
        await db.rollback()
        raise HTTPException(status_code=500, detail="Failed to add client note")


@router.get("/clients/{client_id}/notes", response_model=APIResponse)
async def get_client_notes(
    client_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db)
):
    """Get notes for a client"""
    try:
        user_id = current_user["user_id"]
        role = current_user.get("role", "client")
        
        if role != "trainer":
            raise HTTPException(status_code=403, detail="Access denied. Trainer role required.")
        
        client_uuid = uuid.UUID(client_id)
        
        # Get conversations that look like trainer notes
        result = await db.execute(
            select(SavedConversation, ConversationMessage)
            .join(ConversationMessage, SavedConversation.id == ConversationMessage.conversation_id)
            .where(
                SavedConversation.user_id == client_uuid.bytes,
                SavedConversation.session_id.like(f"trainer_notes_{client_id}%")
            )
            .order_by(desc(SavedConversation.created_at))
        )
        
        notes = []
        for conversation, message in result.all():
            note_data = {
                "id": str(conversation.id),
                "title": conversation.title,
                "note": message.content,
                "created_at": conversation.created_at.isoformat(),
                "updated_at": conversation.updated_at.isoformat()
            }
            notes.append(note_data)
        
        return APIResponse(
            success=True,
            message="Client notes retrieved successfully",
            data={"notes": notes}
        )
        
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid client ID format")
    except Exception as e:
        logger.error(f"Error getting client notes: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve client notes")


# ============================================================
# ATTENDANCE MANAGEMENT
# ============================================================

@router.get("/clients/{client_id}/attendance", response_model=APIResponse)
async def get_client_attendance(
    client_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db)
):
    """Get client attendance records"""
    try:
        user_id = current_user["user_id"]
        role = current_user.get("role", "client")
        
        if role != "trainer":
            raise HTTPException(status_code=403, detail="Access denied. Trainer role required.")
        
        client_uuid = uuid.UUID(client_id)
        
        result = await db.execute(
            select(Attendance)
            .where(Attendance.user_id == client_uuid.bytes)
            .order_by(desc(Attendance.check_in_time))
            .limit(50)
        )
        
        attendance_records = []
        for record in result.scalars().all():
            record_data = {
                "id": str(record.id),
                "check_in_time": record.check_in_time.isoformat(),
                "check_out_time": record.check_out_time.isoformat() if record.check_out_time else None,
                "duration_minutes": record.duration_minutes,
                "notes": record.notes,
                "created_at": record.created_at.isoformat() if record.created_at else None
            }
            attendance_records.append(record_data)
        
        return APIResponse(
            success=True,
            message="Client attendance retrieved successfully",
            data={"attendance": attendance_records}
        )
        
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid client ID format")
    except Exception as e:
        logger.error(f"Error getting client attendance: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve client attendance")


@router.post("/clients/{client_id}/attendance", response_model=APIResponse)
async def log_client_attendance(
    client_id: str,
    attendance_data: dict,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db)
):
    """Log attendance for a client"""
    try:
        user_id = current_user["user_id"]
        role = current_user.get("role", "client")
        
        if role != "trainer":
            raise HTTPException(status_code=403, detail="Access denied. Trainer role required.")
        
        client_uuid = uuid.UUID(client_id)
        
        attendance = Attendance(
            user_id=client_uuid.bytes,
            check_in_time=datetime.utcnow(),
            check_out_time=datetime.utcnow() if attendance_data.get('check_out_time') else None,
            duration_minutes=attendance_data.get('duration_minutes'),
            notes=attendance_data.get('notes'),
            created_at=datetime.utcnow()
        )
        
        db.add(attendance)
        await db.commit()
        
        return APIResponse(
            success=True,
            message="Client attendance logged successfully",
            data={"attendance_id": str(attendance.id)}
        )
        
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid client ID format")
    except Exception as e:
        logger.error(f"Error logging client attendance: {str(e)}")
        await db.rollback()
        raise HTTPException(status_code=500, detail="Failed to log client attendance")


# ============================================================
# RISK ASSESSMENT (Placeholder)
# ============================================================

@router.get("/at-risk-clients", response_model=APIResponse)
async def get_at_risk_clients(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db)
):
    """Get clients who may be at risk (placeholder implementation)"""
    try:
        user_id = current_user["user_id"]
        role = current_user.get("role", "client")
        
        if role != "trainer":
            raise HTTPException(status_code=403, detail="Access denied. Trainer role required.")
        
        # Placeholder: return clients with no recent activity
        # In a real implementation, this would use business logic to determine risk
        cutoff_date = datetime.utcnow() - timedelta(days=30)
        
        result = await db.execute(
            select(Client, User.email)
            .join(User, Client.id == User.id)
            .where(
                User.is_active == True,
                Client.updated_at < cutoff_date
            )
        )
        
        at_risk_clients = []
        for client, email in result.all():
            client_data = {
                "id": str(uuid.UUID(bytes=client.id)),
                "name": client.name,
                "email": email,
                "last_activity": client.updated_at.isoformat() if client.updated_at else None,
                "risk_level": "medium",  # Placeholder
                "risk_factors": ["low_activity"]  # Placeholder
            }
            at_risk_clients.append(client_data)
        
        return APIResponse(
            success=True,
            message="At-risk clients retrieved successfully",
            data={"at_risk_clients": at_risk_clients}
        )
        
    except Exception as e:
        logger.error(f"Error getting at-risk clients: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve at-risk clients")


# ============================================================
# PLACEHOLDER ENDPOINTS FOR ADDITIONAL TRAINER FUNCTIONALITY
# ============================================================

@router.get("/performance", response_model=APIResponse)
async def get_trainer_performance(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db)
):
    """Get trainer performance metrics (placeholder)"""
    try:
        user_id = current_user["user_id"]
        role = current_user.get("role", "client")
        
        if role != "trainer":
            raise HTTPException(status_code=403, detail="Access denied. Trainer role required.")
        
        # Placeholder performance data
        performance_data = {
            "total_clients": 0,
            "active_clients": 0,
            "average_rating": 0.0,
            "total_sessions": 0,
            "this_month_sessions": 0,
            "client_retention_rate": 0.0
        }
        
        return APIResponse(
            success=True,
            message="Trainer performance retrieved successfully",
            data=performance_data
        )
        
    except Exception as e:
        logger.error(f"Error getting trainer performance: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve trainer performance")


@router.get("/grades", response_model=APIResponse)
async def get_trainer_grades(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db)
):
    """Get trainer grades/evaluations (placeholder)"""
    try:
        user_id = current_user["user_id"]
        role = current_user.get("role", "client")
        
        if role != "trainer":
            raise HTTPException(status_code=403, detail="Access denied. Trainer role required.")
        
        # Placeholder grades data
        grades_data = {
            "overall_grade": "A",
            "client_satisfaction": 4.5,
            "session_completion_rate": 0.95,
            "client_progress_score": 4.2,
            "professionalism_score": 4.8,
            "last_evaluation": datetime.utcnow().isoformat()
        }
        
        return APIResponse(
            success=True,
            message="Trainer grades retrieved successfully",
            data=grades_data
        )
        
    except Exception as e:
        logger.error(f"Error getting trainer grades: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve trainer grades")
