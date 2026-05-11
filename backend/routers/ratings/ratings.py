from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete, func, desc, and_
from database import get_user_db
from models import (
    User, Trainer, TrainerRating
)
from schemas import APIResponse
from ..auth.auth import get_current_user
from typing import Optional, List, Dict, Any
import uuid
import logging
from datetime import datetime, date

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/ratings", tags=["ratings"])

# ============================================================
# TRAINER RATINGS
# ============================================================

@router.get("/trainers", response_model=APIResponse)
async def get_all_trainers(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db)
):
    """Get all trainers for rating purposes"""
    try:
        result = await db.execute(
            select(Trainer, User.first_name, User.last_name, User.email)
            .join(User, Trainer.id == User.id)
            .where(User.is_active == True, User.role == 'trainer')
            .order_by(Trainer.name)
        )
        
        trainers = []
        for row in result.all():
            trainer, first_name, last_name, email = row
            
            trainer_data = {
                "id": str(trainer.id),
                "name": trainer.name,
                "full_name": f"{first_name} {last_name}",
                "email": email,
                "certification": trainer.certification,
                "rating": float(trainer.rating) if trainer.rating else 0.0,
                "trainer_level": trainer.trainer_level,
                "specialties": trainer.specialties or [],
                "bio": trainer.bio,
                "experience_years": trainer.experience_years,
                "profile_image": trainer.profile_image,
            }
            trainers.append(trainer_data)
        
        return APIResponse(
            success=True,
            message="Trainers retrieved successfully",
            data={"trainers": trainers}
        )
        
    except Exception as e:
        logger.error(f"Error getting trainers: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve trainers")


@router.post("/trainer/{trainer_id}", response_model=APIResponse)
async def create_trainer_rating(
    trainer_id: str,
    rating_data: dict,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db)
):
    """Create or update a trainer rating"""
    try:
        user_id = current_user["user_id"]
        
        # Validate trainer exists
        trainer_uuid = uuid.UUID(trainer_id)
        trainer_result = await db.execute(
            select(Trainer).where(Trainer.id == trainer_uuid)
        )
        trainer = trainer_result.scalar_one_or_none()
        if not trainer:
            raise HTTPException(status_code=404, detail="Trainer not found")
        
        # Validate rating data
        rating = rating_data.get('rating')
        if not rating or not isinstance(rating, int) or rating < 1 or rating > 5:
            raise HTTPException(status_code=400, detail="Rating must be an integer between 1 and 5")
        
        comment = rating_data.get('review', '')
        privacy = rating_data.get('privacy', 'public')
        session_date = rating_data.get('session_date')
        
        # Convert session_date to date object if provided
        if session_date:
            try:
                session_date = datetime.strptime(session_date, '%Y-%m-%d').date()
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid session_date format. Use YYYY-MM-DD")
        
        # Check if rating already exists for this user/trainer/session
        existing_result = await db.execute(
            select(TrainerRating).where(
                and_(
                    TrainerRating.trainer_id == trainer_uuid,
                    TrainerRating.user_id == user_id,
                    TrainerRating.session_date == session_date if session_date else True
                )
            )
        )
        existing_rating = existing_result.scalar_one_or_none()
        
        if existing_rating:
            # Update existing rating
            existing_rating.rating = rating
            existing_rating.review = comment
            existing_rating.updated_at = datetime.utcnow()
            if session_date:
                existing_rating.session_date = session_date
            
            await db.commit()
            
            return APIResponse(
                success=True,
                message="Trainer rating updated successfully",
                data={"rating_id": str(existing_rating.id), "updated": True}
            )
        else:
            # Create new rating
            new_rating = TrainerRating(
                trainer_id=trainer_uuid,
                user_id=user_id,
                rating=rating,
                review=comment,
                session_date=session_date,
                is_verified=False,  # Could be verified based on actual booking data
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            
            db.add(new_rating)
            await db.commit()
            
            # Update trainer's average rating
            await update_trainer_average_rating(db, trainer_uuid)
            
            return APIResponse(
                success=True,
                message="Trainer rating created successfully",
                data={"rating_id": str(new_rating.id), "created": True}
            )
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error creating trainer rating: {str(e)}")
        await db.rollback()
        raise HTTPException(status_code=500, detail="Failed to create trainer rating")


@router.get("/trainer/{trainer_id}/ratings", response_model=APIResponse)
async def get_trainer_ratings(
    trainer_id: str,
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db)
):
    """Get ratings for a specific trainer"""
    try:
        trainer_uuid = uuid.UUID(trainer_id)
        
        # Check if trainer exists
        trainer_result = await db.execute(
            select(Trainer).where(Trainer.id == trainer_uuid)
        )
        trainer = trainer_result.scalar_one_or_none()
        if not trainer:
            raise HTTPException(status_code=404, detail="Trainer not found")
        
        # Get ratings with user info
        result = await db.execute(
            select(TrainerRating, User.first_name, User.last_name)
            .join(User, TrainerRating.user_id == User.id)
            .where(TrainerRating.trainer_id == trainer_uuid)
            .order_by(desc(TrainerRating.created_at))
            .limit(limit)
            .offset(offset)
        )
        
        ratings = []
        for row in result.all():
            rating, first_name, last_name = row
            
            rating_data = {
                "id": str(rating.id),
                "user_name": f"{first_name} {last_name}",
                "rating": rating.rating,
                "review": rating.review,
                "session_date": rating.session_date.isoformat() if rating.session_date else None,
                "is_verified": rating.is_verified,
                "created_at": rating.created_at.isoformat(),
                "updated_at": rating.updated_at.isoformat()
            }
            ratings.append(rating_data)
        
        # Get total count
        count_result = await db.execute(
            select(func.count(TrainerRating.id))
            .where(TrainerRating.trainer_id == trainer_uuid)
        )
        total_count = count_result.scalar()
        
        return APIResponse(
            success=True,
            message="Trainer ratings retrieved successfully",
            data={
                "ratings": ratings,
                "total_count": total_count,
                "limit": limit,
                "offset": offset
            }
        )
        
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid trainer ID format")
    except Exception as e:
        logger.error(f"Error getting trainer ratings: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve trainer ratings")


@router.get("/my-ratings", response_model=APIResponse)
async def get_user_ratings(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db)
):
    """Get current user's trainer ratings"""
    try:
        user_id = current_user["user_id"]
        
        result = await db.execute(
            select(TrainerRating, Trainer.name, User.first_name, User.last_name)
            .join(Trainer, TrainerRating.trainer_id == Trainer.id)
            .join(User, Trainer.id == User.id)
            .where(TrainerRating.user_id == user_id)
            .order_by(desc(TrainerRating.created_at))
            .limit(limit)
            .offset(offset)
        )
        
        ratings = []
        for row in result.all():
            rating, trainer_name, trainer_first_name, trainer_last_name = row
            
            rating_data = {
                "id": str(rating.id),
                "trainer_id": str(rating.trainer_id),
                "trainer_name": trainer_name,
                "trainer_full_name": f"{trainer_first_name} {trainer_last_name}",
                "rating": rating.rating,
                "review": rating.review,
                "session_date": rating.session_date.isoformat() if rating.session_date else None,
                "is_verified": rating.is_verified,
                "created_at": rating.created_at.isoformat(),
                "updated_at": rating.updated_at.isoformat()
            }
            ratings.append(rating_data)
        
        # Get total count
        count_result = await db.execute(
            select(func.count(TrainerRating.id))
            .where(TrainerRating.user_id == user_id)
        )
        total_count = count_result.scalar()
        
        return APIResponse(
            success=True,
            message="User ratings retrieved successfully",
            data={
                "ratings": ratings,
                "total_count": total_count,
                "limit": limit,
                "offset": offset
            }
        )
        
    except Exception as e:
        logger.error(f"Error getting user ratings: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve user ratings")


@router.put("/rating/{rating_id}", response_model=APIResponse)
async def update_trainer_rating(
    rating_id: str,
    rating_data: dict,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db)
):
    """Update a trainer rating"""
    try:
        user_id = current_user["user_id"]
        rating_uuid = uuid.UUID(rating_id)
        
        # Get the rating
        result = await db.execute(
            select(TrainerRating).where(
                and_(
                    TrainerRating.id == rating_uuid,
                    TrainerRating.user_id == user_id
                )
            )
        )
        rating = result.scalar_one_or_none()
        if not rating:
            raise HTTPException(status_code=404, detail="Rating not found")
        
        # Update fields
        if 'rating' in rating_data:
            new_rating = rating_data['rating']
            if not isinstance(new_rating, int) or new_rating < 1 or new_rating > 5:
                raise HTTPException(status_code=400, detail="Rating must be an integer between 1 and 5")
            rating.rating = new_rating
        
        if 'review' in rating_data:
            rating.review = rating_data['review']
        
        if 'session_date' in rating_data:
            session_date = rating_data['session_date']
            if session_date:
                try:
                    rating.session_date = datetime.strptime(session_date, '%Y-%m-%d').date()
                except ValueError:
                    raise HTTPException(status_code=400, detail="Invalid session_date format. Use YYYY-MM-DD")
            else:
                rating.session_date = None
        
        rating.updated_at = datetime.utcnow()
        
        await db.commit()
        
        # Update trainer's average rating
        await update_trainer_average_rating(db, rating.trainer_id)
        
        return APIResponse(
            success=True,
            message="Rating updated successfully",
            data={"updated": True}
        )
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error updating rating: {str(e)}")
        await db.rollback()
        raise HTTPException(status_code=500, detail="Failed to update rating")


@router.delete("/rating/{rating_id}", response_model=APIResponse)
async def delete_trainer_rating(
    rating_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db)
):
    """Delete a trainer rating"""
    try:
        user_id = current_user["user_id"]
        rating_uuid = uuid.UUID(rating_id)
        
        # Get the rating
        result = await db.execute(
            select(TrainerRating).where(
                and_(
                    TrainerRating.id == rating_uuid,
                    TrainerRating.user_id == user_id
                )
            )
        )
        rating = result.scalar_one_or_none()
        if not rating:
            raise HTTPException(status_code=404, detail="Rating not found")
        
        trainer_id = rating.trainer_id
        
        await db.delete(rating)
        await db.commit()
        
        # Update trainer's average rating
        await update_trainer_average_rating(db, trainer_id)
        
        return APIResponse(
            success=True,
            message="Rating deleted successfully",
            data={"deleted": True}
        )
        
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid rating ID format")
    except Exception as e:
        logger.error(f"Error deleting rating: {str(e)}")
        await db.rollback()
        raise HTTPException(status_code=500, detail="Failed to delete rating")


async def update_trainer_average_rating(db: AsyncSession, trainer_id: bytes):
    """Update trainer's average rating based on all ratings"""
    try:
        # Calculate average rating
        result = await db.execute(
            select(func.avg(TrainerRating.rating))
            .where(TrainerRating.trainer_id == trainer_id)
        )
        avg_rating = result.scalar()
        
        # Update trainer's rating
        await db.execute(
            update(Trainer)
            .where(Trainer.id == trainer_id)
            .values(rating=float(avg_rating) if avg_rating else 0.0)
        )
        
        await db.commit()
        
    except Exception as e:
        logger.error(f"Error updating trainer average rating: {str(e)}")
        raise
