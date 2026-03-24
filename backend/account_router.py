from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_db
from models import User, Trainer, Admin
from schemas import ClientAccount, TrainerAccount, AdminAccount
import uuid

router = APIRouter(prefix="/account", tags=["account"])

@router.get("/{user_id}")
async def get_account(
    user_id: uuid.UUID,
    role: str = Query(..., description="Role of the user: client, trainer, admin"),
    db: AsyncSession = Depends(get_db)
):
    if role == "client":
        user = await db.get(User, user_id)
        if not user:
            raise HTTPException(404, "Client not found")
        return ClientAccount.model_validate(user)
    elif role == "trainer":
        trainer = await db.get(Trainer, user_id)
        if not trainer:
            raise HTTPException(404, "Trainer not found")
        return TrainerAccount.model_validate(trainer)
    elif role == "admin":
        admin = await db.get(Admin, user_id)
        if not admin:
            raise HTTPException(404, "Admin not found")
        return AdminAccount.model_validate(admin)
    else:
        raise HTTPException(400, "Invalid role")