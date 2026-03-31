from pydantic import BaseModel, Field, EmailStr, validator
from datetime import datetime
from typing import Optional, List
import uuid

class WorkoutPlan(BaseModel):
    name: str
    exercises: List[str]
    days_per_week: int
    duration_minutes: int

class UserMetrics(BaseModel):
    weight_kg: float
    height_cm: int
    age: int
    goal: str  # "gain", "loss", "maintain"
    activity_level: str  # "sedentary", "light", "moderate", "active"
    latest_workout_plan: Optional[WorkoutPlan] = None

class RecommendationRequest(BaseModel):
    user_metrics: UserMetrics

class ChatRequest(BaseModel):
    message: str
    session_id: str
    user_context: Optional[UserMetrics] = None

class ChatbotRequest(BaseModel):
    message: str
    session_id: str
    user_context: Optional[UserMetrics] = None

class ChatResponse(BaseModel):
    response: str

class ChatbotResponse(BaseModel):
    response: str
    session_id: str
    message_count: int

class RecommendationResponse(BaseModel):
    recommendation: str
    key_insights: List[str]


# ---------------------------------------------------------------------------
# Saved Conversations
# ---------------------------------------------------------------------------

class SaveConversationRequest(BaseModel):
    session_id: str
    title: str = "Untitled Chat"

class SavedConversationOut(BaseModel):
    id: uuid.UUID
    session_id: str
    title: str
    message_count: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}

class ConversationMessageOut(BaseModel):
    id: uuid.UUID
    role: str
    content: str
    position: int
    created_at: datetime

    model_config = {"from_attributes": True}

class ConversationDetailOut(BaseModel):
    id: uuid.UUID
    session_id: str
    title: str
    message_count: int
    created_at: datetime
    updated_at: datetime
    messages: List[ConversationMessageOut]

    model_config = {"from_attributes": True}

# ---------------------------------------------------------------------------
# Authentication & Account Schemas
# ---------------------------------------------------------------------------


# Helper function to convert between binary UUID and string
def uuid_to_hex(uuid_value: uuid.UUID) -> bytes:
    """Convert UUID to binary for MySQL storage"""
    return uuid_value.bytes

def hex_to_uuid(hex_value: bytes) -> uuid.UUID:
    """Convert binary from MySQL to UUID"""
    return uuid.UUID(bytes=hex_value)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)

class RegisterRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6)
    phone_number: str = Field(..., pattern=r'^\+?1?\d{9,15}$')
    # Optional client-specific fields
    height: Optional[float] = Field(None, ge=0, le=300)
    weight: Optional[float] = Field(None, ge=0, le=500)
    
    @validator('phone_number')
    def validate_phone(cls, v):
        # Remove any non-digit characters for validation
        cleaned = ''.join(filter(str.isdigit, v))
        if len(cleaned) < 10 or len(cleaned) > 15:
            raise ValueError('Phone number must be between 10 and 15 digits')
        return v

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str  # "client", "trainer", "admin"
    user_id: uuid.UUID

# Account data for each role
class ClientAccount(BaseModel):
    id: uuid.UUID
    name: str
    email: EmailStr
    phone_number: str
    height: Optional[float] = None
    weight: Optional[float] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
        json_encoders = {
            uuid.UUID: lambda v: str(v),
            datetime: lambda v: v.isoformat()
        }

class TrainerAccount(BaseModel):
    id: uuid.UUID
    name: str
    email: EmailStr
    certification: Optional[str] = None
    rating: Optional[float] = Field(None, ge=0, le=5)
    trainer_level: Optional[float] = Field(None, ge=1, le=10)  # Changed from 'level' to match DB
    is_senior: bool = False
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
        json_encoders = {
            uuid.UUID: lambda v: str(v),
            datetime: lambda v: v.isoformat()
        }

class AdminAccount(BaseModel):
    id: uuid.UUID
    name: str
    email: EmailStr
    phone_number: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
        json_encoders = {
            uuid.UUID: lambda v: str(v),
            datetime: lambda v: v.isoformat()
        }

# Extended schemas for progress tracking
class ProgressUpdateRequest(BaseModel):
    weight: Optional[float] = None
    height: Optional[float] = None
    measurements: Optional[dict] = None
    
class UserProgressResponse(BaseModel):
    user_id: uuid.UUID
    weight_history: list[dict]  # List of {date: datetime, weight: float}
    bmi_history: list[dict]
    measurements_history: list[dict]

# Additional schemas for profile updates
class UpdateClientProfileRequest(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    phone_number: Optional[str] = Field(None, pattern=r'^\+?1?\d{9,15}$')
    height: Optional[float] = Field(None, ge=0, le=300)
    weight: Optional[float] = Field(None, ge=0, le=500)

class UpdateTrainerProfileRequest(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    certification: Optional[str] = None
    rating: Optional[float] = Field(None, ge=0, le=5)
    trainer_level: Optional[float] = Field(None, ge=1, le=10)
    is_senior: Optional[bool] = None

class UpdateAdminProfileRequest(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    phone_number: Optional[str] = Field(None, pattern=r'^\+?1?\d{9,15}$')

# Response wrapper for API consistency
class APIResponse(BaseModel):
    success: bool
    message: str
    data: Optional[dict] = None

class ErrorResponse(BaseModel):
    detail: str
    status_code: int