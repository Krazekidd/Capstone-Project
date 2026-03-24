from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from passlib.context import CryptContext
import jwt
from datetime import datetime, timedelta
import uuid

from database import get_db
from models import User, Trainer, Admin
from schemas import LoginRequest, RegisterRequest, TokenResponse
from config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES

router = APIRouter(prefix="/auth", tags=["auth"])

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

@router.post("/login", response_model=TokenResponse)
async def login(request: LoginRequest, db: AsyncSession = Depends(get_db)):
    # Check each table
    for model, role in [(User, "client"), (Trainer, "trainer"), (Admin, "admin")]:
        result = await db.execute(select(model).where(model.email == request.email))
        user = result.scalar_one_or_none()
        if user and verify_password(request.password, user.password_hash):
            # Generate JWT token
            token = create_access_token(data={"sub": str(user.id), "role": role})
            return TokenResponse(access_token=token, token_type="bearer", role=role, user_id=user.id)
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

@router.post("/register/client", response_model=TokenResponse)
async def register_client(request: RegisterRequest, db: AsyncSession = Depends(get_db)):
    # Check if email already exists in any table
    for model in [User, Trainer, Admin]:
        result = await db.execute(select(model).where(model.email == request.email))
        if result.scalar_one_or_none():
            raise HTTPException(status_code=400, detail="Email already registered")

    # Create new client
    hashed = get_password_hash(request.password)
    new_user = User(
        name=request.name,
        email=request.email,
        phone_number=request.phone_number,
        password_hash=hashed,
        height=request.height,
        weight=request.weight,
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    # Generate token
    token = create_access_token(data={"sub": str(new_user.id), "role": "client"})
    return TokenResponse(access_token=token, token_type="bearer", role="client", user_id=new_user.id)

# (Optional) Admin endpoints to create trainers/admins – can be added later