from pydantic import BaseModel, Field, EmailStr, validator
from datetime import datetime, date
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
    phone_number: Optional[str] = None
    gender: Optional[str] = None  # Add this
    birthday: Optional[date] = None
    height: Optional[float] = None
    weight: Optional[float] = None
    profile_image: Optional[str] = None  # Add this
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
        json_encoders = {
            uuid.UUID: lambda v: str(v),
            datetime: lambda v: v.isoformat(),
            date: lambda v: v.isoformat()
        }

class TrainerAccount(BaseModel):
    id: uuid.UUID
    name: str
    email: EmailStr
    certification: Optional[str] = None
    rating: Optional[float] = Field(None, ge=0, le=10)
    trainer_level: Optional[float] = Field(None, ge=1, le=10)
    is_senior: bool = False
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
        json_encoders = {
            uuid.UUID: lambda v: str(v),
            datetime: lambda v: v.isoformat(),
            date: lambda v: v.isoformat()
        }

class AdminAccount(BaseModel):
    id: uuid.UUID
    name: str
    email: EmailStr
    phone_number: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
        json_encoders = {
            uuid.UUID: lambda v: str(v),
            datetime: lambda v: v.isoformat(),
            date: lambda v: v.isoformat()
        }

class UpdateClientProfileRequest(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    email: Optional[EmailStr] = None  # Add email update
    phone_number: Optional[str] = Field(None, pattern=r'^\+?1?\d{9,15}$')
    birthday: Optional[date] = None
    gender: Optional[str] = None
    height: Optional[float] = Field(None, ge=0, le=300)
    weight: Optional[float] = Field(None, ge=0, le=500)
    profile_image: Optional[str] = None

class UpdateTrainerProfileRequest(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    email: Optional[EmailStr] = None  # Add email update
    birthday: Optional[date] = None  # Add birthday
    certification: Optional[str] = None
    rating: Optional[float] = Field(None, ge=0, le=5)
    trainer_level: Optional[float] = Field(None, ge=1, le=10)
    is_senior: Optional[bool] = None

class UpdateAdminProfileRequest(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    email: Optional[EmailStr] = None  # Add email update
    phone_number: Optional[str] = Field(None, pattern=r'^\+?1?\d{9,15}$')
    birthday: Optional[date] = None  # Add birthday

# Extended schemas for progress tracking
class ProgressRequest(BaseModel):
    weight: Optional[float] = None
    height: Optional[float] = None
    measurements: Optional[dict] = None
    
class UserProgressResponse(BaseModel):
    user_id: uuid.UUID
    weight_history: list[dict]  # List of {date: datetime, weight: float}
    bmi_history: list[dict]
    measurements_history: list[dict]

class BodyMeasurements(BaseModel):
    # Body basics
    weight: Optional[float] = None
    height: Optional[float] = None
    body_fat: Optional[float] = None
    
    # Upper body
    chest: Optional[float] = None
    waist: Optional[float] = None
    shoulders: Optional[float] = None
    arm_left: Optional[float] = None
    arm_right: Optional[float] = None
    neck: Optional[float] = None
    
    # Lower body
    hips: Optional[float] = None
    thigh_left: Optional[float] = None
    thigh_right: Optional[float] = None
    calf_left: Optional[float] = None
    calf_right: Optional[float] = None
    glutes: Optional[float] = None
    
    class Config:
        json_schema_extra = {
            "example": {
                "weight": 84,
                "height": 178,
                "body_fat": 18,
                "chest": 96,
                "waist": 84,
                "shoulders": 118,
                "arm_left": 36,
                "arm_right": 36,
                "neck": 38,
                "hips": 96,
                "thigh_left": 56,
                "thigh_right": 56,
                "calf_left": 36,
                "calf_right": 36,
                "glutes": 100
            }
        }

class ProgressTrackingResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    weight: Optional[float] = None
    height: Optional[float] = None
    measurements: Optional[BodyMeasurements] = None
    recorded_at: datetime
    created_at: datetime
    
    class Config:
        from_attributes = True

class GoalTrackingResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    weight: Optional[float] = None
    chest: Optional[float] = None
    waist: Optional[float] = None
    hips: Optional[float] = None
    thigh: Optional[float] = None
    arm: Optional[float] = None

    class Config:
        from_attributes = True

# ============================================================
# CLIENT GOALS SCHEMAS
# ============================================================

class ClientGoalsResponse(BaseModel):
    client_id: uuid.UUID
    goal_type: str = "Bulk Up"
    primary_goal: Optional[str] = None
    target_weight_kg: Optional[float] = None
    target_chest_cm: Optional[float] = None
    target_waist_cm: Optional[float] = None
    target_hips_cm: Optional[float] = None
    target_thigh_cm: Optional[float] = None
    target_arm_cm: Optional[float] = None
    created_at: datetime
    updated_at: datetime

class UpdateClientGoalsRequest(BaseModel):
    goal_type: Optional[str] = None
    primary_goal: Optional[str] = None
    target_weight_kg: Optional[float] = None
    target_chest_cm: Optional[float] = None
    target_waist_cm: Optional[float] = None
    target_hips_cm: Optional[float] = None
    target_thigh_cm: Optional[float] = None
    target_arm_cm: Optional[float] = None

# ============================================================
# CLIENT HEALTH CONDITIONS SCHEMAS
# ============================================================

class HealthConditionResponse(BaseModel):
    id: int
    condition_name: str
    created_at: datetime

class UpdateHealthConditionsRequest(BaseModel):
    conditions: List[str]

# ============================================================
# CLIENT WATER INTAKE SCHEMAS
# ============================================================

class WaterIntakeResponse(BaseModel):
    intake_date: date
    cups_consumed: int

class UpdateWaterIntakeRequest(BaseModel):
    cups_consumed: int

# ============================================================
# CLIENT WORKOUT SESSIONS SCHEMAS
# ============================================================

class WorkoutSessionResponse(BaseModel):
    id: int
    session_date: date
    session_type: Optional[str] = None
    duration_minutes: Optional[int] = None
    calories_burned: Optional[int] = None
    avg_heart_rate: Optional[int] = None
    notes: Optional[str] = None

class CreateWorkoutSessionRequest(BaseModel):
    session_date: date
    session_type: Optional[str] = None
    duration_minutes: Optional[int] = None
    calories_burned: Optional[int] = None
    avg_heart_rate: Optional[int] = None
    notes: Optional[str] = None

# ============================================================
# CLIENT STRENGTH RECORDS SCHEMAS
# ============================================================

class StrengthRecordResponse(BaseModel):
    id: int
    exercise_name: str
    current_weight_kg: Optional[float] = None
    goal_weight_kg: Optional[float] = None
    current_reps: Optional[int] = None
    goal_reps: Optional[int] = None
    percentage_progress: Optional[int] = None
    record_date: date

class UpdateStrengthRecordRequest(BaseModel):
    current_weight_kg: Optional[float] = None
    goal_weight_kg: Optional[float] = None
    current_reps: Optional[int] = None
    goal_reps: Optional[int] = None

# ============================================================
# TRAINER RATINGS SCHEMAS
# ============================================================

class TrainerRatingResponse(BaseModel):
    trainer_name: str
    rating: int

class UpdateTrainerRatingRequest(BaseModel):
    trainer_name: str
    rating: int

class TrainerRatingsSummaryResponse(BaseModel):
    average_rating: float
    total_ratings: int
    ratings: List[TrainerRatingResponse]

# ============================================================
# CLIENT BADGES SCHEMAS
# ============================================================

class BadgeResponse(BaseModel):
    id: int
    badge_name: str
    awarded_date: date

# ============================================================
# TRAINING SCHEDULE SCHEMAS
# ============================================================

class TrainingScheduleResponse(BaseModel):
    id: int
    day_of_week: Optional[str] = None
    day_number: Optional[int] = None
    session_name: Optional[str] = None
    session_time: Optional[str] = None
    has_session: bool = False
    is_today: bool = False

class UpdateTrainingScheduleRequest(BaseModel):
    session_name: Optional[str] = None
    session_time: Optional[str] = None
    has_session: Optional[bool] = None


# Password Reset Schemas
class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(..., min_length=6)
    
    @validator('new_password')
    def validate_password(cls, v):
        if len(v) < 6:
            raise ValueError('Password must be at least 6 characters')
        return v

class ChangePasswordRequest(BaseModel):
    current_password: str = Field(..., min_length=6)
    new_password: str = Field(..., min_length=6)

# Google OAuth Schemas
class GoogleLoginRequest(BaseModel):
    credential: str

class GoogleTokenRequest(BaseModel):
    access_token: str

# Registration Request (updated)
class RegisterRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6)
    phone_number: Optional[str] = Field(None, pattern=r'^\+?1?\d{9,15}$')
    height: Optional[float] = Field(None, ge=0, le=300)
    weight: Optional[float] = Field(None, ge=0, le=500)
    birthday: Optional[date] = None
    gender: Optional[str] = Field(None, pattern='^(Male|Female|Non-binary|prefer-not)$')
    
    @validator('password')
    def validate_password(cls, v):
        if len(v) < 6:
            raise ValueError('Password must be at least 6 characters')
        return v

# Response schemas
class APIResponse(BaseModel):
    success: bool
    message: str
    data: Optional[dict] = None

class PasswordResetResponse(BaseModel):
    message: str
    reset_token: Optional[str] = None  # Only for development


# ============================================================
# EXCURSION SCHEMAS
# ============================================================

class ExcursionBase(BaseModel):
    id: str
    name: str
    location: str
    level: str
    level_label: str
    date: date
    time: str
    duration: str
    spots: int
    spots_left: int
    cost: float
    img_url: Optional[str] = None
    thumb_url: Optional[str] = None
    map_url: Optional[str] = None
    description: str
    guide: str
    meetup_point: str
    min_bmi: int = 15
    max_bmi: int = 40
    min_level: str = "beginner"
    required_tenure_months: int = 0
    difficulty: int = 1
    tags: List[str] = []
    what_to_bring: List[str] = []

class ExcursionResponse(ExcursionBase):
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class ExcursionListResponse(BaseModel):
    excursions: List[ExcursionResponse]
    total: int

class BookingRequest(BaseModel):
    excursion_id: str
    booked_for_name: str
    booked_for_email: EmailStr
    booked_for_phone: str
    special_notes: Optional[str] = None
    payment_method: str = "online"  # online or cash

class BookingResponse(BaseModel):
    id: uuid.UUID
    booking_reference: str
    excursion_id: str
    excursion_name: str
    excursion_date: date
    excursion_time: str
    booked_for_name: str
    booked_for_email: str
    booked_for_phone: str
    special_notes: Optional[str] = None
    payment_method: str
    payment_status: str
    booking_status: str
    total_amount: float
    booked_at: datetime
    
    class Config:
        from_attributes = True

class MyBookingsResponse(BaseModel):
    bookings: List[BookingResponse]
    total: int

class CancelBookingResponse(BaseModel):
    message: str
    booking_id: uuid.UUID
    refund_amount: Optional[float] = None

class BookingResponse(BaseModel):
    id: uuid.UUID
    booking_reference: str
    excursion_id: str
    excursion_name: str
    excursion_date: date
    excursion_time: str
    location: Optional[str] = None  # Add this
    level: Optional[str] = None      # Add this
    thumb_url: Optional[str] = None  # Add this
    booked_for_name: str
    booked_for_email: str
    booked_for_phone: str
    special_notes: Optional[str] = None
    payment_method: str
    payment_status: str
    booking_status: str
    total_amount: float
    booked_at: datetime
    
    class Config:
        from_attributes = True

class MLScoreResponse(BaseModel):
    excursion_id: str
    score: int
    label: str
    color: str

class MLRecommendationsResponse(BaseModel):
    recommendations: List[MLScoreResponse]
    user_context: dict

# ============================================================
# CONSULTATION SCHEMAS
# ============================================================

class ConsultationTypeBase(BaseModel):
    id: str
    icon: Optional[str] = None
    title: str
    subtitle: Optional[str] = None
    duration_minutes: int
    price: float
    price_display: str
    badge_text: Optional[str] = None
    badge_color: Optional[str] = None
    description: str
    coach_description: str
    img_url: Optional[str] = None
    includes: List[str] = []
    
class ConsultationTypeResponse(ConsultationTypeBase):
    is_active: bool
    display_order: int
    
    class Config:
        from_attributes = True

class TimeSlotResponse(BaseModel):
    time: str
    booked: bool
    available: bool

class AvailableSlotsResponse(BaseModel):
    date: str
    slots: List[TimeSlotResponse]
    is_holiday: bool
    is_closed: bool
    holiday_name: Optional[str] = None

class ConsultationBookingRequest(BaseModel):
    consultation_type_id: str
    booking_date: date
    booking_time: str
    session_format: str = "in-person"
    notes: Optional[str] = None

class ConsultationBookingResponse(BaseModel):
    id: uuid.UUID
    booking_reference: str
    consultation_type_id: str
    consultation_title: str
    booking_date: date
    booking_time: str
    session_format: str
    status: str
    notes: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

class MyConsultationsResponse(BaseModel):
    upcoming: List[ConsultationBookingResponse]
    past: List[ConsultationBookingResponse]
    total_upcoming: int
    total_past: int

class CancelConsultationResponse(BaseModel):
    message: str
    booking_id: uuid.UUID
    refund_amount: Optional[float] = None

class BusinessHoursResponse(BaseModel):
    day_of_week: int
    is_open: bool
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    slot_interval_minutes: int

class HolidayResponse(BaseModel):
    holiday_date: date
    name: str

# ============================================================
# SHOP SCHEMAS
# ============================================================

class ShopCategoryResponse(BaseModel):
    id: str
    name: str
    display_name: str
    icon: Optional[str] = None
    display_order: int
    
    class Config:
        from_attributes = True

class ShopProductResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    price: float
    category_id: str
    image_url: Optional[str] = None
    badge_text: Optional[str] = None
    badge_color: Optional[str] = None
    rating: float = 4.5
    review_count: int = 0
    stock_quantity: int = 0
    is_active: bool = True
    featured: bool = False
    
    class Config:
        from_attributes = True

class ShopProductDetailResponse(ShopProductResponse):
    created_at: datetime
    updated_at: datetime

class AddToCartRequest(BaseModel):
    product_id: str
    quantity: int = 1

class UpdateCartRequest(BaseModel):
    product_id: str
    quantity: int

class CartItemResponse(BaseModel):
    product_id: str
    name: str
    price: float
    quantity: int
    total: float
    image_url: Optional[str] = None
    
    class Config:
        from_attributes = True

class CartResponse(BaseModel):
    items: List[CartItemResponse]
    subtotal: float
    tax: float
    shipping_cost: float
    total: float
    item_count: int

class WishlistItemResponse(BaseModel):
    product_id: str
    name: str
    price: float
    image_url: Optional[str] = None
    
    class Config:
        from_attributes = True

class WishlistResponse(BaseModel):
    items: List[WishlistItemResponse]
    total: int

class OrderAddress(BaseModel):
    customer_name: str
    email: str
    phone: str
    address: str
    city: str
    notes: Optional[str] = None

class PlaceOrderRequest(OrderAddress):
    payment_method: str = "card"

class OrderItemResponse(BaseModel):
    product_id: str
    product_name: str
    product_price: float
    quantity: int
    total: float

class OrderResponse(BaseModel):
    id: uuid.UUID
    order_reference: str
    order_status: str
    payment_status: str
    payment_method: str
    subtotal: float
    tax: float
    shipping_cost: float
    total: float
    shipping_address: str
    city: str
    customer_name: str
    email: str
    phone: str
    items: List[OrderItemResponse]  # This will use the updated OrderItemResponse
    placed_at: datetime
    
    class Config:
        from_attributes = True

class OrdersListResponse(BaseModel):
    orders: List[OrderResponse]
    total: int

# Response wrapper for API consistency
class APIResponse(BaseModel):
    success: bool
    message: str
    data: Optional[dict] = None

class ErrorResponse(BaseModel):
    detail: str
    status_code: int


# ============================================================
# TRAINER ASSESSMENT SCHEMAS
# ============================================================

class TrainerAssessmentScores(BaseModel):
    perf: float = Field(0, ge=0, le=10)
    motiv: float = Field(0, ge=0, le=10)
    interact: float = Field(0, ge=0, le=10)
    knowledge: float = Field(0, ge=0, le=10)
    punct: float = Field(0, ge=0, le=10)

class TrainerAssessmentRequest(BaseModel):
    trainer_id: uuid.UUID
    trainer_name: str
    scores: TrainerAssessmentScores
    average: float
    standing: str
    notes: Optional[str] = None

class TrainerAssessmentResponse(BaseModel):
    id: int
    trainer_id: uuid.UUID
    trainer_name: str
    performance_score: float
    motivation_score: float
    interaction_score: float
    knowledge_score: float
    punctuality_score: float
    average_score: float
    standing: str
    assessment_date: date
    notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

# ============================================================
# CLIENT STATUS SCHEMAS
# ============================================================

class ClientStatusResponse(BaseModel):
    id: int
    client_id: uuid.UUID
    status: str = "Active"
    last_visit: Optional[date] = None
    membership_plan: str = "Standard"
    assigned_trainer_id: Optional[uuid.UUID] = None
    fitness_goal: Optional[str] = None
    progress_percentage: int = 0
    updated_at: datetime

    class Config:
        from_attributes = True

class ClientWithStatusResponse(BaseModel):
    id: uuid.UUID
    name: str
    email: EmailStr
    phone_number: Optional[str] = None
    height: Optional[float] = None
    weight: Optional[float] = None
    birthday: Optional[date] = None
    status: str = "Active"
    membership_plan: str = "Standard"
    fitness_goal: Optional[str] = None
    progress_percentage: int = 0
    last_visit: Optional[date] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# ============================================================
# ORDER STATUS SCHEMAS
# ============================================================

class OrderItemResponse(BaseModel):
    product_id: str
    product_name: str  # Use product_name instead of name
    product_price: float  # Use product_price instead of price
    quantity: int
    total: float

class AdminOrderResponse(BaseModel):
    id: str
    order_reference: str
    client_name: str
    client_email: str
    client_phone: str
    shipping_address: str
    city: str
    items: List[OrderItemResponse]
    subtotal: float
    tax: float
    shipping_cost: float
    total: float
    order_status: str
    payment_status: str
    payment_method: str
    placed_at: str
    pickup_notes: Optional[str] = None

class UpdateOrderStatusRequest(BaseModel):
    order_status: Optional[str] = None
    payment_status: Optional[str] = None
    pickup_notes: Optional[str] = None

# ============================================================
# DASHBOARD STATS SCHEMAS
# ============================================================

class DashboardStatsResponse(BaseModel):
    new_clients: int
    active_clients: int
    inactive_clients: int
    total_clients: int
    total_trainers: int
    pending_orders: int
    revenue_mtd: float

# ============================================================
# SENIOR TRAINER SCHEMAS
# ============================================================

class SeniorProfileResponse(BaseModel):
    id: uuid.UUID
    name: str
    email: EmailStr
    rank: str
    age: Optional[int] = None
    rating: Optional[float] = None
    specialisation: Optional[str] = None
    certification: Optional[str] = None
    years_experience: Optional[int] = None
    monthly_score: Optional[float] = None
    sessions_attended: Optional[int] = None
    sessions_completed: Optional[int] = None
    clients_assigned: Optional[int] = None
    attendance_rate: Optional[float] = None
    last_assessment_date: Optional[date] = None
    average_assessment_score: Optional[float] = None
    created_at: datetime
    updated_at: datetime

class TrainerForAssessment(BaseModel):
    id: uuid.UUID
    name: str
    last_assessed: Optional[date] = None
    average_rating: Optional[float] = None

class ClientRisk(BaseModel):
    id: uuid.UUID
    name: str
    goal: Optional[str] = None
    progress_percentage: int

class TrainerReviewResponse(BaseModel):
    id: int
    trainer_name: str
    reviewer_name: str
    rating: int
    comment: str
    created_at: datetime

class CoachingMessageRequest(BaseModel):
    client_name: str
    client_email: str
    message: str
    session_date: Optional[str] = None
    session_time: Optional[str] = None