"""
Authentication utilities for role-based access control.
"""

from fastapi import HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_user_db
from routers.auth.auth import get_current_user


def require_admin(current_user=Depends(get_current_user)):
    """Require user to have admin role."""
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user


def require_trainer(current_user=Depends(get_current_user)):
    """Require user to have trainer role."""
    if current_user["role"] != "trainer":
        raise HTTPException(status_code=403, detail="Trainer access required")
    return current_user


async def require_admin_or_senior_trainer(
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db)
):
    """Require user to be admin or senior trainer."""
    user = current_user["user"]
    role = current_user["role"]
    
    if role == "admin":
        return current_user
    
    if role == "trainer":
        # Load trainer profile explicitly to avoid lazy loading issues
        from models import Trainer
        from sqlalchemy import select
        
        result = await db.execute(select(Trainer).where(Trainer.id == user.id))
        trainer = result.scalar_one_or_none()
        
        if trainer and trainer.is_senior:
            return current_user
    
    raise HTTPException(
        status_code=403, 
        detail="Admin or Senior Trainer access required"
    )


def require_client(current_user=Depends(get_current_user)):
    """Require user to have client role."""
    if current_user["role"] != "client":
        raise HTTPException(status_code=403, detail="Client access required")
    return current_user
