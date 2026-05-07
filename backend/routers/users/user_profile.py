from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from database import get_user_db
from models import User, Client, Trainer, Admin
from schemas import APIResponse
from ..auth.auth import get_current_user
import uuid
import logging
import os
import aiofiles
from datetime import datetime

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/users", tags=["user_profile"])

# ============================================================
# USER PROFILE ENDPOINTS (for frontend compatibility)
# ============================================================

@router.patch("/me", response_model=APIResponse)
async def update_profile(
    profile_data: dict,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db)
):
    """Update current user's profile"""
    try:
        user_id = current_user["user_id"]
        role = current_user.get("role", "client")
        
        logger.info(f"Updating profile for user {user_id} with role {role}")
        
        if role == "client":
            # Update client profile
            result = await db.execute(
                select(Client).where(Client.id == user_id.bytes)
            )
            client = result.scalar_one_or_none()
            if not client:
                raise HTTPException(status_code=404, detail="Client profile not found")
            
            # Update allowed fields
            allowed_fields = ['name', 'gender', 'phone_number', 'birthday', 'height', 'weight', 
                            'emergency_contact_name', 'emergency_contact_phone', 
                            'medical_conditions', 'fitness_goals']
            
            for field in allowed_fields:
                if field in profile_data:
                    setattr(client, field, profile_data[field])
            
            client.updated_at = datetime.utcnow()
            
        elif role == "trainer":
            # Update trainer profile
            result = await db.execute(
                select(Trainer).where(Trainer.id == user_id.bytes)
            )
            trainer = result.scalar_one_or_none()
            if not trainer:
                raise HTTPException(status_code=404, detail="Trainer profile not found")
            
            # Update allowed fields
            allowed_fields = ['name', 'certification', 'specialties', 'bio', 'experience_years', 
                            'hourly_rate', 'trainer_level']
            
            for field in allowed_fields:
                if field in profile_data:
                    setattr(trainer, field, profile_data[field])
            
            trainer.updated_at = datetime.utcnow()
            
        elif role == "admin":
            # Update admin profile
            result = await db.execute(
                select(Admin).where(Admin.id == user_id.bytes)
            )
            admin = result.scalar_one_or_none()
            if not admin:
                raise HTTPException(status_code=404, detail="Admin profile not found")
            
            # Update allowed fields
            allowed_fields = ['name', 'phone_number', 'department', 'access_level']
            
            for field in allowed_fields:
                if field in profile_data:
                    setattr(admin, field, profile_data[field])
            
            admin.updated_at = datetime.utcnow()
        
        # Also update base user fields if provided
        user_result = await db.execute(
            select(User).where(User.id == user_id)
        )
        user = user_result.scalar_one_or_none()
        if user:
            user_fields = ['first_name', 'last_name', 'phone', 'avatar_url']
            for field in user_fields:
                if field in profile_data:
                    setattr(user, field, profile_data[field])
            user.updated_at = datetime.utcnow()
        
        await db.commit()
        
        return APIResponse(
            success=True,
            message="Profile updated successfully",
            data={"updated": True}
        )
        
    except Exception as e:
        logger.error(f"Error updating profile: {str(e)}")
        await db.rollback()
        raise HTTPException(status_code=500, detail="Failed to update profile")


@router.post("/me/avatar", response_model=APIResponse)
async def upload_profile_image(
    avatar_url: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db)
):
    """Upload profile image for current user"""
    try:
        user_id = current_user["user_id"]
        
        logger.info(f"Uploading avatar for user {user_id}")
        
        # Validate file type
        if not avatar_url.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Create uploads directory if it doesn't exist
        from config.config import PROFILE_IMAGES_DIR
        upload_dir = PROFILE_IMAGES_DIR
        os.makedirs(upload_dir, exist_ok=True)
        
        # Generate unique filename
        file_extension = avatar_url.filename.split('.')[-1]
        unique_filename = f"{user_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.{file_extension}"
        file_path = os.path.join(upload_dir, unique_filename)
        
        # Save file
        async with aiofiles.open(file_path, 'wb') as f:
            content = await avatar_url.read()
            await f.write(content)
        
        # Update user's avatar_url in database
        await db.execute(
            update(User)
            .where(User.id == user_id)
            .values(avatar_url=f"/{file_path}")
        )
        
        await db.commit()
        
        return APIResponse(
            success=True,
            message="Profile image uploaded successfully",
            data={"avatar_url": f"/{file_path}"}
        )
        
    except Exception as e:
        logger.error(f"Error uploading avatar: {str(e)}")
        await db.rollback()
        raise HTTPException(status_code=500, detail="Failed to upload profile image")


@router.patch("/me/password", response_model=APIResponse)
async def update_password(
    password_data: dict,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db)
):
    """Update current user's password"""
    try:
        user_id = current_user["user_id"]
        
        logger.info(f"Updating password for user {user_id}")
        
        # Get current password and new password from request
        current_password = password_data.get('current_password')
        new_password = password_data.get('new_password')
        
        if not current_password or not new_password:
            raise HTTPException(status_code=400, detail="Current password and new password are required")
        
        # Get user from database
        result = await db.execute(
            select(User).where(User.id == user_id)
        )
        user = result.scalar_one_or_none()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Verify current password (you'll need to import verify_password function)
        from routers.auth.auth import verify_password
        
        if not verify_password(current_password, user.password_hash):
            raise HTTPException(status_code=400, detail="Current password is incorrect")
        
        # Hash new password
        from routers.auth.auth import get_password_hash
        new_password_hash = get_password_hash(new_password)
        
        # Update password
        user.password_hash = new_password_hash
        user.updated_at = datetime.utcnow()
        
        await db.commit()
        
        return APIResponse(
            success=True,
            message="Password updated successfully",
            data={"updated": True}
        )
        
    except Exception as e:
        logger.error(f"Error updating password: {str(e)}")
        await db.rollback()
        raise HTTPException(status_code=500, detail="Failed to update password")
