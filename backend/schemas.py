from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
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

class LoginRequest(BaseModel):
    email: str
    password: str

class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    phone_number: str
    # Optional client-specific fields
    height: Optional[float] = None
    weight: Optional[float] = None

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str                     # "client", "trainer", "admin"
    user_id: uuid.UUID

# Account data for each role
class ClientAccount(BaseModel):
    id: uuid.UUID
    name: str
    email: str
    phone_number: str
    height: Optional[float] = None
    weight: Optional[float] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}

class TrainerAccount(BaseModel):
    id: uuid.UUID
    name: str
    email: str
    certification: Optional[str] = None
    rating: Optional[float] = None
    level: Optional[str] = None
    is_senior: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}

class AdminAccount(BaseModel):
    id: uuid.UUID
    name: str
    email: str
    phone_number: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}