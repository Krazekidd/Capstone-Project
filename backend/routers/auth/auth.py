from fastapi import APIRouter, Request, Depends, HTTPException, status, BackgroundTasks
from fastapi.responses import RedirectResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete
from passlib.context import CryptContext
from jose import jwt, JWTError
from datetime import datetime, timedelta
import uuid
import bcrypt
import secrets
import os
import httpx
import hashlib
import logging
from database import get_user_db
from models import User, AuthToken
from schemas import (
    LoginRequest,
    RegisterRequest,
    TokenResponse,
    RefreshTokenRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    ChangePasswordRequest,
    APIResponse,
    UserResponse,
    UserCreate,
)
from config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES, REFRESH_TOKEN_EXPIRE_DAYS
from email_service import send_password_reset_email, send_welcome_email

router = APIRouter(prefix="/auth", tags=["auth"])
security = HTTPBearer()
logger = logging.getLogger(__name__)


def verify_password(plain_password, hashed_password):
    plain = plain_password.encode("utf-8")
    hashed = hashed_password.encode("utf-8")
    return bcrypt.checkpw(plain, hashed)


def get_password_hash(password):
    pencode = password.encode("utf-8")
    hashed = bcrypt.hashpw(pencode, bcrypt.gensalt())
    return hashed.decode("utf-8")


def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (
        expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def create_refresh_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_user_db),
):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id_str = payload.get("sub")
        if user_id_str is None:
            raise HTTPException(status_code=401, detail="Invalid token")

        user_id = uuid.UUID(user_id_str)

        # Verify user exists
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        if not user:
            raise HTTPException(status_code=401, detail="User not found")

        return {"user_id": user_id, "user": user}
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")


# ========== REGISTRATION ==========
@router.post("/register", response_model=TokenResponse)
async def register(
    request: RegisterRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_user_db),
):
    """Register a new user"""
    logger.info(f"📝 Registration attempt for email: {request.email}")
    
    # Check if email already exists
    result = await db.execute(select(User).where(User.email == request.email))
    if result.scalar_one_or_none():
        logger.warning(f"⚠️  Registration failed - email already exists: {request.email}")
        raise HTTPException(status_code=400, detail="Email already registered")

    # Create user account
    hashed = get_password_hash(request.password)
    new_user = User(
        email=request.email,
        password_hash=hashed,
        first_name=request.first_name,
        last_name=request.last_name,
        phone=request.phone,
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    # Send welcome email in background (disabled for testing)
    # background_tasks.add_task(send_welcome_email, request.email, f"{request.first_name} {request.last_name}")

    # Generate tokens
    access_token = create_access_token(data={"sub": str(new_user.id)})
    refresh_token_str = create_refresh_token(data={"sub": str(new_user.id)})
    
    # Store refresh token in database
    token_hash = hashlib.sha256(refresh_token_str.encode()).hexdigest()
    expires_at = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    
    auth_token = AuthToken(
        user_id=new_user.id,
        token_hash=token_hash,
        token_type='refresh',
        expires_at=expires_at
    )
    db.add(auth_token)
    await db.commit()

    user_response = UserResponse(
        id=new_user.id,
        email=new_user.email,
        first_name=new_user.first_name,
        last_name=new_user.last_name,
        phone=new_user.phone,
        avatar_url=new_user.avatar_url,
        is_email_verified=new_user.is_email_verified,
        is_active=new_user.is_active,
        created_at=new_user.created_at,
        updated_at=new_user.updated_at,
    )

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token_str,
        token_type="bearer",
        expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=user_response
    )


# ========== LOGIN ==========
@router.post("/login", response_model=TokenResponse)
async def login(request: LoginRequest, db: AsyncSession = Depends(get_user_db)):
    """Login with email and password"""
    result = await db.execute(select(User).where(User.email == request.email))
    user = result.scalar_one_or_none()

    if not user or not verify_password(request.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password"
        )

    # Generate tokens
    access_token = create_access_token(data={"sub": str(user.id)})
    refresh_token_str = create_refresh_token(data={"sub": str(user.id)})
    
    # Store refresh token in database
    token_hash = hashlib.sha256(refresh_token_str.encode()).hexdigest()
    expires_at = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    
    auth_token = AuthToken(
        user_id=user.id,
        token_hash=token_hash,
        token_type='refresh',
        expires_at=expires_at
    )
    db.add(auth_token)
    await db.commit()

    user_response = UserResponse(
        id=user.id,
        email=user.email,
        first_name=user.first_name,
        last_name=user.last_name,
        phone=user.phone,
        avatar_url=user.avatar_url,
        is_email_verified=user.is_email_verified,
        is_active=user.is_active,
        created_at=user.created_at,
        updated_at=user.updated_at,
    )

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token_str,
        token_type="bearer",
        expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=user_response
    )


# ========== FORGOT PASSWORD ==========
@router.post("/forgot-password", response_model=APIResponse)
async def forgot_password(
    request: ForgotPasswordRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_user_db),
):
    """Send password reset email"""
    # Find user
    result = await db.execute(select(User).where(User.email == request.email))
    user = result.scalar_one_or_none()

    if not user:
        # Security: Don't reveal if email exists
        return APIResponse(
            success=True,
            message="If your email is registered, you will receive a reset link",
        )

    # Delete any existing unused tokens for this user
    await db.execute(
        delete(AuthToken).where(
            AuthToken.user_id == user.id, 
            AuthToken.token_type == 'password_reset',
            AuthToken.revoked == False
        )
    )

    # Generate reset token
    token = secrets.token_urlsafe(32)
    token_hash = hashlib.sha256(token.encode()).hexdigest()
    expires_at = datetime.utcnow() + timedelta(hours=24)

    reset_token = AuthToken(
        user_id=user.id, 
        token_hash=token_hash, 
        token_type='password_reset',
        expires_at=expires_at
    )
    db.add(reset_token)
    await db.commit()

    # Send email in background
    user_name = f"{user.first_name} {user.last_name}"
    background_tasks.add_task(
        send_password_reset_email, request.email, token, user_name
    )

    return APIResponse(
        success=True,
        message="Password reset email sent",
        data=(
            {"reset_token": token}
            if os.getenv("ENVIRONMENT") == "development"
            else None
        ),
    )


# ========== RESET PASSWORD ==========
@router.post("/reset-password", response_model=APIResponse)
async def reset_password(
    request: ResetPasswordRequest, db: AsyncSession = Depends(get_user_db)
):
    """Reset password using token"""
    import hashlib
    
    # Hash the token to compare with stored hash
    token_hash = hashlib.sha256(request.token.encode()).hexdigest()
    
    # Find valid token
    result = await db.execute(
        select(AuthToken).where(
            AuthToken.token_hash == token_hash,
            AuthToken.token_type == 'password_reset',
            AuthToken.expires_at > datetime.utcnow(),
            AuthToken.revoked == False,
        )
    )
    reset_token = result.scalar_one_or_none()

    if not reset_token:
        raise HTTPException(
            status_code=400,
            detail="Invalid or expired token. Please request a new password reset.",
        )

    # Update user password
    hashed_password = get_password_hash(request.new_password)
    await db.execute(
        update(User)
        .where(User.id == reset_token.user_id)
        .values(password_hash=hashed_password)
    )

    # Mark token as revoked
    reset_token.revoked = True
    reset_token.revoked_at = datetime.utcnow()
    await db.commit()

    return APIResponse(
        success=True,
        message="Password reset successful. You can now log in with your new password.",
    )


# ========== CHANGE PASSWORD ==========
@router.post("/change-password", response_model=APIResponse)
async def change_password(
    request: ChangePasswordRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db),
):
    """Change password for authenticated user"""
    user_id = current_user["user_id"]

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Verify current password
    if not verify_password(request.current_password, user.password_hash):
        raise HTTPException(status_code=401, detail="Current password is incorrect")

    # Update password
    new_hashed = get_password_hash(request.new_password)
    await db.execute(
        update(User).where(User.id == user_id).values(password_hash=new_hashed)
    )
    await db.commit()

    return APIResponse(success=True, message="Password changed successfully")


# ========== VERIFY TOKEN ==========
@router.get("/verify")
async def verify_token(current_user: dict = Depends(get_current_user)):
    """Verify JWT token validity"""
    return {
        "valid": True,
        "user_id": str(current_user["user_id"]),
    }


# ========== LOGOUT ==========
@router.post("/logout")
async def logout(current_user: dict = Depends(get_current_user)):
    """Logout (client-side token removal)"""
    return {"message": "Successfully logged out"}


# ========== REFRESH TOKEN ==========
@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(
    request: RefreshTokenRequest,
    db: AsyncSession = Depends(get_user_db)
):
    """Refresh access token using refresh token"""
    refresh_token = request.refresh_token
    if not refresh_token:
        raise HTTPException(status_code=400, detail="Refresh token required")
    
    try:
        # Verify refresh token
        payload = jwt.decode(refresh_token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id_str = payload.get("sub")
        if user_id_str is None:
            raise HTTPException(status_code=401, detail="Invalid refresh token")
        
        user_id = uuid.UUID(user_id_str)
        
        # Check if refresh token exists in database and is valid
        token_hash = hashlib.sha256(refresh_token.encode()).hexdigest()
        result = await db.execute(
            select(AuthToken).where(
                AuthToken.token_hash == token_hash,
                AuthToken.token_type == 'refresh',
                AuthToken.expires_at > datetime.utcnow(),
                AuthToken.revoked == False
            )
        )
        stored_token = result.scalar_one_or_none()
        
        if not stored_token:
            raise HTTPException(status_code=401, detail="Invalid or expired refresh token")
        
        # Verify user exists
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        
        # Generate new access token
        new_access_token = create_access_token(data={"sub": str(user.id)})
        
        # Generate new refresh token and revoke old one
        new_refresh_token_str = create_refresh_token(data={"sub": str(user.id)})
        new_token_hash = hashlib.sha256(new_refresh_token_str.encode()).hexdigest()
        new_expires_at = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
        
        # Revoke old refresh token
        stored_token.revoked = True
        stored_token.revoked_at = datetime.utcnow()
        
        # Create new refresh token
        new_auth_token = AuthToken(
            user_id=user.id,
            token_hash=new_token_hash,
            token_type='refresh',
            expires_at=new_expires_at
        )
        db.add(new_auth_token)
        await db.commit()
        
        user_response = UserResponse(
            id=user.id,
            email=user.email,
            first_name=user.first_name,
            last_name=user.last_name,
            phone=user.phone,
            avatar_url=user.avatar_url,
            is_email_verified=user.is_email_verified,
            is_active=user.is_active,
            created_at=user.created_at,
            updated_at=user.updated_at,
        )
        
        return TokenResponse(
            access_token=new_access_token,
            refresh_token=new_refresh_token_str,
            token_type="bearer",
            expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            user=user_response
        )
        
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")




@router.get("/userinfo")
async def get_user_info(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db),
):
    """Get user information for current authenticated user"""
    user_id = current_user["user_id"]

    # Get user details
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user_response = UserResponse(
        id=user.id,
        email=user.email,
        first_name=user.first_name,
        last_name=user.last_name,
        phone=user.phone,
        avatar_url=user.avatar_url,
        is_email_verified=user.is_email_verified,
        is_active=user.is_active,
        created_at=user.created_at,
        updated_at=user.updated_at,
    )

    return user_response


