from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from passlib.context import CryptContext
from jose import jwt, JWTError
from datetime import datetime, timedelta
import uuid
import bcrypt
from database import get_user_db
from models import User, Client, Trainer, Admin
from schemas import LoginRequest, RegisterRequest, TokenResponse
from config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES

router = APIRouter(prefix="/auth", tags=["auth"])
security = HTTPBearer()


def verify_password(plain_password, hashed_password):
    plain = plain_password.encode('utf-8')
    return bcrypt.checkpw(plain, hashed_password.encode('utf-8'))  

def get_password_hash(password):
    pencode = password.encode('utf-8')
    hashed = bcrypt.hashpw(pencode,bcrypt.gensalt())
    return hashed

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: AsyncSession = Depends(get_user_db)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id_str = payload.get("sub")
        role = payload.get("role")
        if user_id_str is None or role is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        user_id = uuid.UUID(user_id_str)
        user_id_bytes = user_id.bytes
        
        # Verify user exists
        result = await db.execute(select(User).where(User.id == user_id_bytes))
        user = result.scalar_one_or_none()
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        
        return {"user_id": user_id, "role": role, "user": user}
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

@router.post("/login", response_model=TokenResponse)
async def login(request: LoginRequest, db: AsyncSession = Depends(get_user_db)):
    # Find user by email
    result = await db.execute(select(User).where(User.email == request.email))
    user = result.scalar_one_or_none()
    
    if not user or not verify_password(request.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or passwod" 
        )
    
    # Convert binary ID to UUID string for token
    user_uuid = uuid.UUID(bytes=user.id)
    token = create_access_token(data={"sub": str(user_uuid), "role": user.role})
    
    return TokenResponse(
        access_token=token, 
        token_type="bearer", 
        role=user.role, 
        user_id=user_uuid
    )

@router.post("/register/client", response_model=TokenResponse)
async def register_client(request: RegisterRequest, db: AsyncSession = Depends(get_user_db)):
    # Check if email already exists
    result = await db.execute(select(User).where(User.email == request.email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")

    # Create user account
    hashed = get_password_hash(request.password)
    new_user = User(
        email=request.email,
        password_hash=hashed,
        role="client"
    )
    db.add(new_user)
    await db.flush()  # Get the generated ID
    
    # Create client profile
    new_client = Client(
        id=new_user.id,
        name=request.name,
        phone_number=request.phone_number,
        height=request.height,
        weight=request.weight
    )
    db.add(new_client)
    await db.commit()
    await db.refresh(new_user)
    
    # Convert binary ID to UUID string for token
    user_uuid = uuid.UUID(bytes=new_user.id)
    
    # Generate token
    token = create_access_token(data={"sub": str(user_uuid), "role": "client"})
    return TokenResponse(
        access_token=token, 
        token_type="bearer", 
        role="client", 
        user_id=user_uuid
    )

@router.post("/logout")
async def logout(current_user: dict = Depends(get_current_user)):
    # Since JWT is stateless, logout is handled client-side by removing token
    return {"message": "Successfully logged out"}

@router.get("/verify")
async def verify_token(current_user: dict = Depends(get_current_user)):
    return {"valid": True, "user_id": str(current_user["user_id"]), "role": current_user["role"]}