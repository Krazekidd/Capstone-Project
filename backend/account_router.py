from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
import uuid
import json
import logging
from database import get_user_db
from models import User, Client, Trainer, Admin, ProgressTracking
from schemas import ClientAccount, TrainerAccount, AdminAccount, UpdateClientProfileRequest
from auth_router import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/account", tags=["account"])

@router.get("/me")
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
            return ClientAccount(
                id=uuid.UUID(bytes=client.id),
                name=client.name,
                email=email,
                phone_number=client.phone_number,
                height=client.height,
                weight=client.weight,
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

@router.get("/{user_id}")
async def get_account_by_id(
    user_id: uuid.UUID,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db)
):
    """Get account by user ID (admin only or self)"""
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
            email=email,
            phone_number=client.phone_number,
            height=client.height,
            weight=client.weight,
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
    
    else:
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

@router.put("/me")
async def update_my_account(
    update_data: UpdateClientProfileRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db)
):
    """Update account of currently logged in user"""
    user_id = current_user["user_id"]
    role = current_user["role"]
    
    if role != "client":
        raise HTTPException(status_code=400, detail="Only clients can update profile through this endpoint")
    
    user_id_bytes = user_id.bytes
    
    # Update client profile
    update_values = {k: v for k, v in update_data.dict().items() if v is not None}
    if update_values:
        stmt = update(Client).where(Client.id == user_id_bytes).values(**update_values)
        await db.execute(stmt)
        await db.commit()
    
    return {"message": "Profile updated successfully"}