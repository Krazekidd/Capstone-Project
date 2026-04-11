from fastapi import APIRouter,Request, Depends, HTTPException, status, BackgroundTasks
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
from database import get_user_db
from models import User, Client, Trainer, Admin, PasswordResetToken
from schemas import (LoginRequest, RegisterRequest, TokenResponse,ForgotPasswordRequest, ResetPasswordRequest, ChangePasswordRequest,
    GoogleLoginRequest, GoogleTokenRequest, APIResponse)
from config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES
from email_service import send_password_reset_email, send_welcome_email
from google_oauth import oauth, get_google_user_info

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

# ========== REGISTRATION ==========
@router.post("/register/client", response_model=TokenResponse)
async def register_client(
    request: RegisterRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_user_db)
):
    """Register a new client"""
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
    await db.flush()
    
    # Create client profile
    new_client = Client(
        id=new_user.id,
        name=request.name,
        gender=request.gender,
        birthday=request.birthday,
        phone_number=request.phone_number,
        height=request.height,
        weight=request.weight
    )
    db.add(new_client)
    await db.commit()
    await db.refresh(new_user)
    
    # Send welcome email in background
    background_tasks.add_task(send_welcome_email, request.email, request.name)
    
    # Generate token
    user_uuid = uuid.UUID(bytes=new_user.id)
    token = create_access_token(data={"sub": str(user_uuid), "role": "client"})
    
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        role="client",
        user_id=user_uuid
    )

# ========== LOGIN ==========
@router.post("/login", response_model=TokenResponse)
async def login(
    request: LoginRequest,
    db: AsyncSession = Depends(get_user_db)
):
    """Login with email and password"""
    result = await db.execute(select(User).where(User.email == request.email))
    user = result.scalar_one_or_none()
    
    if not user or not verify_password(request.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    user_uuid = uuid.UUID(bytes=user.id)
    token = create_access_token(data={"sub": str(user_uuid), "role": user.role})
    
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        role=user.role,
        user_id=user_uuid
    )

# ========== FORGOT PASSWORD ==========
@router.post("/forgot-password", response_model=APIResponse)
async def forgot_password(
    request: ForgotPasswordRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_user_db)
):
    """Send password reset email"""
    # Find user
    result = await db.execute(select(User).where(User.email == request.email))
    user = result.scalar_one_or_none()
    
    if not user:
        # Security: Don't reveal if email exists
        return APIResponse(
            success=True,
            message="If your email is registered, you will receive a reset link"
        )
    
    # Delete any existing unused tokens for this user
    await db.execute(
        delete(PasswordResetToken).where(
            PasswordResetToken.user_id == user.id,
            PasswordResetToken.used_at.is_(None)
        )
    )
    
    # Generate reset token
    token = secrets.token_urlsafe(32)
    expires_at = datetime.utcnow() + timedelta(hours=24)
    
    reset_token = PasswordResetToken(
        user_id=user.id,
        token=token,
        expires_at=expires_at
    )
    db.add(reset_token)
    await db.commit()
    
    # Get user name from client profile
    client_result = await db.execute(
        select(Client.name).where(Client.id == user.id)
    )
    client = client_result.scalar_one_or_none()
    user_name = client if client else "Valued Member"
    
    # Send email in background
    background_tasks.add_task(send_password_reset_email, request.email, token, user_name)
    
    return APIResponse(
        success=True,
        message="Password reset email sent",
        data={"reset_token": token} if os.getenv("ENVIRONMENT") == "development" else None
    )

# ========== RESET PASSWORD ==========
@router.post("/reset-password", response_model=APIResponse)
async def reset_password(
    request: ResetPasswordRequest,
    db: AsyncSession = Depends(get_user_db)
):
    """Reset password using token"""
    # Find valid token
    result = await db.execute(
        select(PasswordResetToken).where(
            PasswordResetToken.token == request.token,
            PasswordResetToken.expires_at > datetime.utcnow(),
            PasswordResetToken.used_at.is_(None)
        )
    )
    reset_token = result.scalar_one_or_none()
    
    if not reset_token:
        raise HTTPException(
            status_code=400,
            detail="Invalid or expired token. Please request a new password reset."
        )
    
    # Update user password
    hashed_password = get_password_hash(request.new_password)
    await db.execute(
        update(User)
        .where(User.id == reset_token.user_id)
        .values(password_hash=hashed_password)
    )
    
    # Mark token as used
    reset_token.used_at = datetime.utcnow()
    await db.commit()
    
    return APIResponse(success=True, message="Password reset successful. You can now log in with your new password.")

# ========== CHANGE PASSWORD ==========
@router.post("/change-password", response_model=APIResponse)
async def change_password(
    request: ChangePasswordRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db)
):
    """Change password for authenticated user"""
    user_id_bytes = current_user["user_id"].bytes
    
    result = await db.execute(select(User).where(User.id == user_id_bytes))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Verify current password
    if not verify_password(request.current_password, user.password_hash):
        raise HTTPException(status_code=401, detail="Current password is incorrect")
    
    # Update password
    new_hashed = get_password_hash(request.new_password)
    await db.execute(
        update(User).where(User.id == user_id_bytes).values(password_hash=new_hashed)
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
        "role": current_user["role"]
    }

# ========== LOGOUT ==========
@router.post("/logout")
async def logout(current_user: dict = Depends(get_current_user)):
    """Logout (client-side token removal)"""
    return {"message": "Successfully logged out"}

# ========== GOOGLE OAUTH ==========

@router.get("/google/login")
async def google_login(request: Request):
    """
    Initiate Google OAuth login flow
    Returns redirect URL to Google's authorization page
    """
    redirect_uri = request.url_for('google_callback')
    
    # Generate the Google OAuth authorization URL
    authorization_url = await oauth.google.authorize_redirect(
        request, 
        redirect_uri
    )
    
    return {"authorization_url": str(authorization_url)}

@router.get("/google/callback")
async def google_callback(
    request: Request,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_user_db)
):
    """
    Handle Google OAuth callback after user authorization
    """
    try:
        # Get the authorization code from the request
        code = request.query_params.get('code')
        if not code:
            raise HTTPException(status_code=400, detail="Authorization code missing")
        
        # Exchange code for access token
        token_data = await oauth.google.authorize_access_token(request)
        access_token = token_data.get('access_token')
        
        if not access_token:
            raise HTTPException(status_code=400, detail="Failed to get access token")
        
        # Fetch user info from Google
        user_info = await get_google_user_info(access_token)
        
        email = user_info.get('email')
        name = user_info.get('name', '')
        google_id = user_info.get('sub')
        picture = user_info.get('picture', '')
        
        if not email:
            raise HTTPException(status_code=400, detail="Could not get email from Google")
        
        # Check if user exists in database
        result = await db.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()
        
        if not user:
            # Create new user account
            new_user = User(
                email=email,
                password_hash="",  # No password for OAuth users
                role="client"
            )
            db.add(new_user)
            await db.flush()
            
            # Create client profile
            new_client = Client(
                id=new_user.id,
                name=name,
                profile_image=picture
            )
            db.add(new_client)
            await db.commit()
            await db.refresh(new_user)
            
            user_id = uuid.UUID(bytes=new_user.id)
            role = "client"
            
            # Send welcome email in background
            from email_service import send_welcome_email
            background_tasks.add_task(send_welcome_email, email, name)
        else:
            user_id = uuid.UUID(bytes=user.id)
            role = user.role
            
            # Update profile image if needed
            if picture:
                await db.execute(
                    update(Client)
                    .where(Client.id == user.id)
                    .values(profile_image=picture)
                )
                await db.commit()
        
        # Create JWT token
        token = create_access_token(data={"sub": str(user_id), "role": role})
        
        # Redirect to frontend with token
        frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
        
        # Option 1: Redirect with token in URL (for development)
        redirect_response = RedirectResponse(
            url=f"{frontend_url}/oauth-callback?token={token}&role={role}"
        )
        
        # Option 2: Set cookie (for production)
        # redirect_response.set_cookie(
        #     key="access_token",
        #     value=token,
        #     httponly=True,
        #     secure=True,
        #     samesite="lax"
        # )
        
        return redirect_response
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Google authentication failed: {str(e)}")

@router.get("/userinfo")
async def get_user_info(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db)
):
    """Get user information for the current authenticated user"""
    user_id = current_user["user_id"]
    role = current_user["role"]
    user_id_bytes = user_id.bytes
    
    # Get user details
    result = await db.execute(select(User).where(User.id == user_id_bytes))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user_info = {
        "id": str(user_id),
        "email": user.email,
        "role": role
    }
    
    # Get profile info based on role
    if role == "client":
        client_result = await db.execute(
            select(Client).where(Client.id == user_id_bytes)
        )
        client = client_result.scalar_one_or_none()
        if client:
            user_info["name"] = client.name
            user_info["picture"] = client.profile_image
    elif role == "trainer":
        trainer_result = await db.execute(
            select(Trainer).where(Trainer.id == user_id_bytes)
        )
        trainer = trainer_result.scalar_one_or_none()
        if trainer:
            user_info["name"] = trainer.name
    elif role == "admin":
        admin_result = await db.execute(
            select(Admin).where(Admin.id == user_id_bytes)
        )
        admin = admin_result.scalar_one_or_none()
        if admin:
            user_info["name"] = admin.name
    
    return user_info