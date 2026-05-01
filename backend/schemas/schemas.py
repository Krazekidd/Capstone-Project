from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime, date
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
# Authentication Schemas
# ---------------------------------------------------------------------------

class UserBase(BaseModel):
    email: EmailStr
    first_name: str
    last_name: str
    phone: Optional[str] = None
    avatar_url: Optional[str] = None


class UserCreate(UserBase):
    password: str


class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    avatar_url: Optional[str] = None


class UserResponse(UserBase):
    id: uuid.UUID
    is_email_verified: bool
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RegisterRequest(UserCreate):
    pass


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: Optional[str] = None
    token_type: str = "bearer"
    expires_in: Optional[int] = None
    user: Optional[UserResponse] = None


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str


class APIResponse(BaseModel):
    success: bool
    message: str
    data: Optional[dict] = None


# ---------------------------------------------------------------------------
# Membership Schemas
# ---------------------------------------------------------------------------

class MembershipPlanBase(BaseModel):
    name: str
    tier: str
    price_monthly: float
    price_annual: Optional[float] = None
    description: Optional[str] = None
    features: List[str] = []
    is_active: bool = True


class MembershipPlanResponse(MembershipPlanBase):
    id: uuid.UUID
    created_at: datetime

    model_config = {"from_attributes": True}


class UserMembershipBase(BaseModel):
    status: str = "active"
    auto_renew: bool = True


class UserMembershipResponse(UserMembershipBase):
    id: uuid.UUID
    user_id: uuid.UUID
    plan_id: uuid.UUID
    plan: Optional[MembershipPlanResponse] = None
    started_at: datetime
    expires_at: Optional[datetime] = None
    cancelled_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# Consultation Schemas
# ---------------------------------------------------------------------------

class ConsultationTypeBase(BaseModel):
    name: str
    slug: str
    subtitle: Optional[str] = None
    description: Optional[str] = None
    duration_minutes: int
    price: float
    currency: str = "USD"
    badge_label: Optional[str] = None
    badge_color: Optional[str] = None
    emoji_icon: Optional[str] = None
    what_to_expect: List[str] = []
    requires_membership: Optional[str] = None
    is_active: bool = True
    sort_order: int = 0


class ConsultationTypeResponse(ConsultationTypeBase):
    id: uuid.UUID
    created_at: datetime

    model_config = {"from_attributes": True}


class BookingBase(BaseModel):
    consultation_type_id: uuid.UUID
    scheduled_date: date
    scheduled_time: str
    timezone: str = "America/New_York"
    format: str = "in_person"
    notes: Optional[str] = None
    agreed_cancellation_policy: bool = False


class BookingResponse(BookingBase):
    id: uuid.UUID
    reference: str
    user_id: uuid.UUID
    consultation_type: Optional[ConsultationTypeResponse] = None
    coach_id: Optional[uuid.UUID] = None
    status: str
    price_charged: float
    currency: str
    confirmed_at: Optional[datetime] = None
    cancelled_at: Optional[datetime] = None
    cancellation_reason: Optional[str] = None
    completed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# Shop Schemas
# ---------------------------------------------------------------------------

class ProductBase(BaseModel):
    name: str
    slug: str
    category: str
    description: Optional[str] = None
    price: float
    currency: str = "JMD"
    image_url: Optional[str] = None
    badge_label: Optional[str] = None
    badge_color: Optional[str] = None
    stock_qty: int = 0
    is_active: bool = True
    sort_order: int = 0


class ProductResponse(ProductBase):
    id: uuid.UUID
    average_rating: float
    review_count: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ProductReviewBase(BaseModel):
    rating: int
    body: Optional[str] = None


class ProductReviewResponse(ProductReviewBase):
    id: uuid.UUID
    product_id: uuid.UUID
    user_id: uuid.UUID
    created_at: datetime

    model_config = {"from_attributes": True}


class OrderItemBase(BaseModel):
    product_id: uuid.UUID
    quantity: int
    unit_price: float


class OrderItemResponse(OrderItemBase):
    id: uuid.UUID
    order_id: uuid.UUID
    line_total: float
    product: Optional[ProductResponse] = None

    model_config = {"from_attributes": True}


class OrderBase(BaseModel):
    items: List[OrderItemBase]
    shipping_address: dict
    notes: Optional[str] = None


class OrderResponse(BaseModel):
    id: uuid.UUID
    reference: str
    user_id: uuid.UUID
    status: str
    subtotal: float
    shipping_fee: float
    discount: float
    total: float
    currency: str
    shipping_address: dict
    notes: Optional[str] = None
    placed_at: datetime
    paid_at: Optional[datetime] = None
    shipped_at: Optional[datetime] = None
    delivered_at: Optional[datetime] = None
    items: List[OrderItemResponse] = []

    model_config = {"from_attributes": True}


class WishlistResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    product_id: uuid.UUID
    product: Optional[ProductResponse] = None
    added_at: datetime

    model_config = {"from_attributes": True}
