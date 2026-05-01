from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete
from sqlalchemy.orm import selectinload
from datetime import datetime, timedelta
import uuid

from database import get_user_db
from models import User, MembershipPlan, UserMembership
from schemas import (
    MembershipPlanResponse,
    UserMembershipResponse,
    APIResponse,
)
from ..auth.auth import get_current_user

router = APIRouter(prefix="/api/v1/memberships", tags=["memberships"])


# ========== MEMBERSHIP PLANS ==========

@router.get("/plans", response_model=list[MembershipPlanResponse])
async def get_membership_plans(db: AsyncSession = Depends(get_user_db)):
    """Get all active membership plans"""
    result = await db.execute(
        select(MembershipPlan).where(MembershipPlan.is_active == True).order_by(MembershipPlan.price_monthly)
    )
    plans = result.scalars().all()
    return plans


@router.get("/plans/{plan_id}", response_model=MembershipPlanResponse)
async def get_membership_plan(plan_id: uuid.UUID, db: AsyncSession = Depends(get_user_db)):
    """Get a specific membership plan"""
    result = await db.execute(
        select(MembershipPlan).where(MembershipPlan.id == plan_id, MembershipPlan.is_active == True)
    )
    plan = result.scalar_one_or_none()
    
    if not plan:
        raise HTTPException(status_code=404, detail="Membership plan not found")
    
    return plan


# ========== USER MEMBERSHIPS ==========

@router.get("/mine", response_model=UserMembershipResponse)
async def get_my_membership(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db),
):
    """Get current user's active membership"""
    user_id = current_user["user_id"]
    
    result = await db.execute(
        select(UserMembership)
        .options(selectinload(UserMembership.plan))
        .where(
            UserMembership.user_id == user_id,
            UserMembership.status == "active"
        )
    )
    membership = result.scalar_one_or_none()
    
    if not membership:
        raise HTTPException(status_code=404, detail="No active membership found")
    
    return membership


@router.post("/subscribe", response_model=UserMembershipResponse)
async def subscribe_to_plan(
    plan_id: uuid.UUID,
    billing_cycle: str = "monthly",
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db),
):
    """Subscribe to a membership plan"""
    user_id = current_user["user_id"]
    
    # Check if plan exists
    plan_result = await db.execute(
        select(MembershipPlan).where(
            MembershipPlan.id == plan_id,
            MembershipPlan.is_active == True
        )
    )
    plan = plan_result.scalar_one_or_none()
    
    if not plan:
        raise HTTPException(status_code=404, detail="Membership plan not found")
    
    # Check if user already has active membership
    existing_result = await db.execute(
        select(UserMembership).where(
            UserMembership.user_id == user_id,
            UserMembership.status == "active"
        )
    )
    existing_membership = existing_result.scalar_one_or_none()
    
    if existing_membership:
        raise HTTPException(
            status_code=400, 
            detail="User already has an active membership"
        )
    
    # Calculate expiration date
    if billing_cycle == "annual":
        expires_at = datetime.utcnow() + timedelta(days=365)
        price = plan.price_annual
    else:
        expires_at = datetime.utcnow() + timedelta(days=30)
        price = plan.price_monthly
    
    # Create new membership
    new_membership = UserMembership(
        user_id=user_id,
        plan_id=plan_id,
        status="active",
        started_at=datetime.utcnow(),
        expires_at=expires_at,
        auto_renew=True,
    )
    
    db.add(new_membership)
    await db.commit()
    await db.refresh(new_membership)
    
    # Load plan for response
    await db.refresh(new_membership, ["plan"])
    
    return new_membership


@router.delete("/mine")
async def cancel_my_membership(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db),
):
    """Cancel current user's membership"""
    user_id = current_user["user_id"]
    
    # Find active membership
    result = await db.execute(
        select(UserMembership).where(
            UserMembership.user_id == user_id,
            UserMembership.status == "active"
        )
    )
    membership = result.scalar_one_or_none()
    
    if not membership:
        raise HTTPException(status_code=404, detail="No active membership found")
    
    # Cancel membership
    await db.execute(
        update(UserMembership)
        .where(UserMembership.id == membership.id)
        .values(
            status="cancelled",
            cancelled_at=datetime.utcnow()
        )
    )
    await db.commit()
    
    return APIResponse(success=True, message="Membership cancelled successfully")
