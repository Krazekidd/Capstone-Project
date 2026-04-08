from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete
import uuid
import json
import logging
from datetime import date
from typing import Optional, List
from database import get_user_db
from models import User, Client, Trainer, Admin, ProgressTracking
from schemas import (
    ClientAccount, TrainerAccount, AdminAccount, 
    UpdateClientProfileRequest, UpdateTrainerProfileRequest, 
    UpdateAdminProfileRequest, APIResponse, UserProgressResponse,
    ProgressUpdateRequest
)
from auth_router import get_current_user

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
@router.post("/progress", response_model=APIResponse)
async def update_progress(
    progress_data: ProgressUpdateRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db)
):
    """Update user progress measurements"""
    try:
        user_id = current_user["user_id"]
        role = current_user["role"]
        
        # Only clients can track progress
        if role != "client":
            raise HTTPException(status_code=403, detail="Only clients can track progress")
        
        user_id_bytes = user_id.bytes
        
        # Create new progress record
        new_progress = ProgressTracking(
            user_id=user_id_bytes,
            weight=progress_data.weight,
            height=progress_data.height,
            measurements=json.dumps(progress_data.measurements) if progress_data.measurements else None,
            recorded_at=datetime.utcnow()
        )
        
        db.add(new_progress)
        
        # Also update current client measurements if weight/height provided
        if progress_data.weight or progress_data.height:
            update_values = {}
            if progress_data.weight:
                update_values['weight'] = progress_data.weight
            if progress_data.height:
                update_values['height'] = progress_data.height
            
            stmt = update(Client).where(Client.id == user_id_bytes).values(**update_values)
            await db.execute(stmt)
        
        await db.commit()
        
        return APIResponse(success=True, message="Progress updated successfully", data=None)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating progress: {e}", exc_info=True)
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/progress/history", response_model=UserProgressResponse)
async def get_progress_history(
    limit: int = Query(30, ge=1, le=365),
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db)
):
    """Get user progress history"""
    try:
        user_id = current_user["user_id"]
        role = current_user["role"]
        
        # Only clients can view progress
        if role != "client":
            raise HTTPException(status_code=403, detail="Only clients can view progress")
        
        user_id_bytes = user_id.bytes
        
        # Get progress history
        result = await db.execute(
            select(ProgressTracking)
            .where(ProgressTracking.user_id == user_id_bytes)
            .order_by(ProgressTracking.recorded_at.desc())
            .limit(limit)
        )
        progress_records = result.scalars().all()
        
        # Format history data
        weight_history = []
        bmi_history = []
        measurements_history = []
        
        for record in reversed(progress_records):  # Chronological order
            weight_history.append({
                "date": record.recorded_at.isoformat(),
                "weight": record.weight
            })
            
            # Calculate BMI if both height and weight available
            if record.weight and record.height:
                bmi = record.weight / ((record.height / 100) ** 2)
                bmi_history.append({
                    "date": record.recorded_at.isoformat(),
                    "bmi": round(bmi, 1)
                })
            
            if record.measurements:
                measurements_history.append({
                    "date": record.recorded_at.isoformat(),
                    "measurements": json.loads(record.measurements)
                })
        
        return UserProgressResponse(
            user_id=user_id,
            weight_history=weight_history,
            bmi_history=bmi_history,
            measurements_history=measurements_history
        )
        
    except Exception as e:
        logger.error(f"Error getting progress history: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

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
@router.get("/trainers/all", response_model=List[TrainerAccount])
async def get_all_trainers(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db)
):
    """Get all trainers (admin only)"""
    try:
        role = current_user["role"]
        
        # Only admin can view all trainers
        if role != "admin":
            raise HTTPException(status_code=403, detail="Not authorized to view all trainers")
        
        result = await db.execute(
            select(Trainer, User.email)
            .join(User, Trainer.id == User.id)
            .offset(skip)
            .limit(limit)
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
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting all trainers: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

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