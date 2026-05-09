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
# Account Conversation Schemas
# ---------------------------------------------------------------------------

class AccountConversationRequest(BaseModel):
    session_id: str
    title: Optional[str] = "Support Chat"
    messages: List[dict]  # List of message objects with role and content


class AccountConversationResponse(BaseModel):
    id: uuid.UUID
    session_id: str
    title: str
    message_count: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class AccountConversationHistoryResponse(BaseModel):
    conversations: List[AccountConversationResponse]
    total_count: int

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
    role: str
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



class WishlistResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    product_id: uuid.UUID
    product: Optional[ProductResponse] = None
    added_at: datetime

    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# Progress Photos
# ---------------------------------------------------------------------------

class ProgressPhotoBase(BaseModel):
    description: Optional[str] = None


class ProgressPhotoCreate(ProgressPhotoBase):
    pass


class ProgressPhotoResponse(ProgressPhotoBase):
    id: uuid.UUID
    user_id: uuid.UUID
    filename: str
    original_filename: str
    file_path: str
    file_size: int
    mime_type: str
    created_at: datetime

    model_config = {"from_attributes": True}


class MLWorkoutEntry(BaseModel):
    week: int; actual_weight: float
class MLUserProfile(BaseModel):
    age: int; gender: str; weight_kg: float; height_m: float
    bmi: Optional[float] = None; fat_pct: float = 20.0; experience_level: int = 1
    workout_freq: int = 3; session_duration: float = 1.0; avg_bpm: int = 130
    health_conditions: list = []; goal: str; workout_history: Optional[list] = None
class MLExerciseItem(BaseModel):
    exercise: str; sets: int; reps: str; rest: str
class MLWorkoutResponse(BaseModel):
    bmi_category: str; workout_category: str; fitness_level: str
    workouts: list; predicted_calories_per_session: float; disclaimer: str
class MLProgressPoint(BaseModel):
    weeks: int; label: str; weight: float; bmi: float; fat_pct: float
class MLProgressResponse(BaseModel):
    user_summary: dict; projections: list; note: str
class MLFoodItem(BaseModel):
    food: str; calories: float; protein_g: float; fat_g: float
    carbs_g: float; fiber_g: float; similarity_score: float
class MLFoodResponse(BaseModel):
    goal: str; suggestions: list; note: str


# ---------------------------------------------------------------------------
# Attendance Tracking Schemas
# ---------------------------------------------------------------------------

class AttendanceCheckIn(BaseModel):
    notes: Optional[str] = None


class AttendanceCheckOut(BaseModel):
    notes: Optional[str] = None


class AttendanceResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    check_in_time: datetime
    check_out_time: Optional[datetime] = None
    duration_minutes: Optional[int] = None
    notes: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class AttendanceHistoryResponse(BaseModel):
    attendances: List[AttendanceResponse]
    total_sessions: int
    page: int
    page_size: int
    total_pages: int


class SessionStatsResponse(BaseModel):
    total_sessions: int
    current_streak: int
    longest_streak: int
    total_duration_minutes: int
    average_duration_minutes: float
    this_month_sessions: int
    last_month_sessions: int


# ---------------------------------------------------------------------------
# Nutrition Plan Schemas
# ---------------------------------------------------------------------------

class NutritionPlanMeal(BaseModel):
    meal_type: str  # breakfast, lunch, dinner, snack
    food_items: List[str]
    calories: float
    protein_g: float
    carbs_g: float
    fat_g: float
    fiber_g: Optional[float] = None


class NutritionPlanResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    daily_calories: float
    daily_protein_g: float
    daily_carbs_g: float
    daily_fat_g: float
    daily_fiber_g: Optional[float] = None
    meals: List[NutritionPlanMeal]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class NutritionGoalsRequest(BaseModel):
    daily_calories: Optional[float] = None
    daily_protein_g: Optional[float] = None
    daily_carbs_g: Optional[float] = None
    daily_fat_g: Optional[float] = None
    daily_fiber_g: Optional[float] = None
    dietary_restrictions: Optional[List[str]] = None
    allergies: Optional[List[str]] = None
    goal_type: Optional[str] = None  # lose_weight, gain_muscle, maintain


class NutritionGoalsResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    daily_calories: float
    daily_protein_g: float
    daily_carbs_g: float
    daily_fat_g: float
    daily_fiber_g: Optional[float] = None
    dietary_restrictions: List[str]
    allergies: List[str]
    goal_type: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# Training Schedule Schemas
# ---------------------------------------------------------------------------

class TrainingScheduleResponse(BaseModel):
    id: int
    client_id: uuid.UUID
    day_of_week: str
    day_number: int
    workout_type: str
    exercises: List[str]
    duration_minutes: int
    intensity_level: str
    notes: Optional[str] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class UpdateTrainingScheduleRequest(BaseModel):
    day_of_week: Optional[str] = None
    day_number: Optional[int] = None
    workout_type: Optional[str] = None
    exercises: Optional[List[str]] = None
    duration_minutes: Optional[int] = None
    intensity_level: Optional[str] = None
    notes: Optional[str] = None
    is_active: Optional[bool] = None


# ---------------------------------------------------------------------------
# Progress Tracking Schemas
# ---------------------------------------------------------------------------

class BodyMeasurements(BaseModel):
    weight: Optional[float] = None
    height: Optional[float] = None
    body_fat: Optional[float] = None
    chest: Optional[float] = None
    waist: Optional[float] = None
    shoulders: Optional[float] = None
    arm_left: Optional[float] = None
    arm_right: Optional[float] = None
    neck: Optional[float] = None
    hips: Optional[float] = None
    thigh_left: Optional[float] = None
    thigh_right: Optional[float] = None
    calf_left: Optional[float] = None
    calf_right: Optional[float] = None
    glutes: Optional[float] = None


class ProgressRequest(BaseModel):
    measurements: BodyMeasurements
    notes: Optional[str] = None
    progress_photos: Optional[List[uuid.UUID]] = None  # Link to existing photos


class ProgressTrackingResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    weight: Optional[float] = None
    height: Optional[float] = None
    measurements: Optional[BodyMeasurements] = None
    recorded_at: datetime
    created_at: datetime
    progress_photos: List[ProgressPhotoResponse] = []
    notes: Optional[str] = None

    model_config = {"from_attributes": True}


class UserProgressResponse(BaseModel):
    user_id: uuid.UUID
    current_weight: Optional[float] = None
    current_height: Optional[float] = None
    weight_change: Optional[float] = None  # Change from previous measurement
    weight_change_percentage: Optional[float] = None
    latest_measurements: Optional[BodyMeasurements] = None
    progress_photos_count: int
    total_measurements: int
    first_measurement_date: Optional[datetime] = None
    latest_measurement_date: Optional[datetime] = None
    days_tracked: int
    average_weight: Optional[float] = None
    weight_trend: str  # "losing", "gaining", "stable"
    goal_progress: Optional[dict] = None  # Progress towards goals


class ProgressAnalyticsResponse(BaseModel):
    user_id: uuid.UUID
    period: str  # "week", "month", "quarter", "year"
    start_date: date
    end_date: date
    weight_stats: dict
    measurement_changes: dict
    progress_photos_count: int
    consistency_score: float  # How consistent with measurements
    achievements: List[dict]
    recommendations: List[str]


class ProgressComparisonResponse(BaseModel):
    period_1: dict
    period_2: dict
    changes: dict
    improvement_areas: List[str]
    achievements: List[str]


class ProgressSummaryResponse(BaseModel):
    user_id: uuid.UUID
    current_stats: dict
    progress_timeline: List[dict]
    recent_photos: List[ProgressPhotoResponse]
    achievements: List[dict]
    next_milestones: List[dict]
    streak_data: dict


# ---------------------------------------------------------------------------
# Activity/Wearable Data Schemas
# ---------------------------------------------------------------------------

class ActivityDataBase(BaseModel):
    date: date
    steps: int = 0
    heart_rate_avg: Optional[int] = None
    heart_rate_max: Optional[int] = None
    calories_burned: int = 0
    active_minutes: int = 0
    sleep_hours: Optional[float] = None
    sleep_quality: Optional[int] = None
    distance_km: float = 0.0
    floors_climbed: int = 0
    source: Optional[str] = None
    raw_data: Optional[dict] = None


class ActivityDataCreate(ActivityDataBase):
    pass


class ActivityDataUpdate(BaseModel):
    steps: Optional[int] = None
    heart_rate_avg: Optional[int] = None
    heart_rate_max: Optional[int] = None
    calories_burned: Optional[int] = None
    active_minutes: Optional[int] = None
    sleep_hours: Optional[float] = None
    sleep_quality: Optional[int] = None
    distance_km: Optional[float] = None
    floors_climbed: Optional[int] = None
    source: Optional[str] = None
    raw_data: Optional[dict] = None


class ActivityDataResponse(ActivityDataBase):
    id: uuid.UUID
    user_id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ActivityDataListResponse(BaseModel):
    activities: List[ActivityDataResponse]
    total_count: int
    page: int
    per_page: int


class ActivityStatsResponse(BaseModel):
    user_id: uuid.UUID
    period: str  # "week", "month", "quarter", "year"
    start_date: date
    end_date: date
    total_steps: int
    avg_daily_steps: float
    total_calories: int
    avg_daily_calories: float
    total_active_minutes: int
    avg_sleep_hours: float
    avg_heart_rate: Optional[float]
    best_day: dict  # Best day for steps
    consistency_score: float  # How consistent with activity goals
    achievements: List[str]


# ---------------------------------------------------------------------------
# Badge Schemas
# ---------------------------------------------------------------------------

class BadgeResponse(BaseModel):
    id: int
    badge_name: str
    awarded_date: date

    model_config = {"from_attributes": True}


class BadgeCheckResponse(BaseModel):
    new_badges: List[BadgeResponse]
    total_badges: int
    message: str


# ---------------------------------------------------------------------------
# Profile Image Schemas
# ---------------------------------------------------------------------------

class ProfileImageResponse(BaseModel):
    success: bool
    message: str
    avatar_url: Optional[str] = None


# ---------------------------------------------------------------------------
# Account Management Schemas
# ---------------------------------------------------------------------------

class ClientAccount(BaseModel):
    id: uuid.UUID
    name: str
    email: str
    gender: Optional[str] = None
    phone_number: Optional[str] = None
    birthday: Optional[date] = None
    height: Optional[float] = None
    weight: Optional[float] = None
    profile_image: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class TrainerAccount(BaseModel):
    id: uuid.UUID
    name: str
    email: str
    certification: Optional[str] = None
    rating: Optional[float] = None
    trainer_level: Optional[str] = None
    is_senior: Optional[bool] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class AdminAccount(BaseModel):
    id: uuid.UUID
    name: str
    email: str
    phone_number: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class UpdateClientProfileRequest(BaseModel):
    name: Optional[str] = None
    gender: Optional[str] = None
    phone_number: Optional[str] = None
    birthday: Optional[date] = None
    height: Optional[float] = None
    weight: Optional[float] = None
    profile_image: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    medical_conditions: Optional[str] = None
    fitness_goals: Optional[str] = None


class UpdateTrainerProfileRequest(BaseModel):
    name: Optional[str] = None
    certification: Optional[str] = None
    specialties: Optional[List[str]] = None
    bio: Optional[str] = None
    experience_years: Optional[int] = None
    hourly_rate: Optional[float] = None
    profile_image: Optional[str] = None


class UpdateAdminProfileRequest(BaseModel):
    name: Optional[str] = None
    phone_number: Optional[str] = None
    department: Optional[str] = None
    access_level: Optional[str] = None
    profile_image: Optional[str] = None


# ---------------------------------------------------------------------------
# Client Goals & Health Schemas
# ---------------------------------------------------------------------------

class ClientGoalsResponse(BaseModel):
    id: uuid.UUID
    client_id: uuid.UUID
    goal_type: str
    primary_goal: Optional[str] = None
    target_weight_kg: Optional[float] = None
    target_chest_cm: Optional[float] = None
    target_waist_cm: Optional[float] = None
    target_hips_cm: Optional[float] = None
    target_thigh_cm: Optional[float] = None
    target_arm_cm: Optional[float] = None
    # Legacy fields for backward compatibility
    target_value: Optional[float] = None
    current_value: Optional[float] = None
    target_date: Optional[date] = None
    is_active: bool
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class UpdateClientGoalsRequest(BaseModel):
    goal_type: Optional[str] = None
    primary_goal: Optional[str] = None
    target_weight_kg: Optional[float] = None
    target_chest_cm: Optional[float] = None
    target_waist_cm: Optional[float] = None
    target_hips_cm: Optional[float] = None
    target_thigh_cm: Optional[float] = None
    target_arm_cm: Optional[float] = None
    # Legacy fields for backward compatibility
    target_value: Optional[float] = None
    current_value: Optional[float] = None
    target_date: Optional[date] = None
    is_active: Optional[bool] = None
    notes: Optional[str] = None


class HealthConditionResponse(BaseModel):
    id: uuid.UUID
    client_id: uuid.UUID
    condition_name: str
    severity: Optional[str] = None
    medications: Optional[str] = None
    notes: Optional[str] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class UpdateHealthConditionsRequest(BaseModel):
    condition_name: Optional[str] = None
    severity: Optional[str] = None
    medications: Optional[str] = None
    notes: Optional[str] = None
    is_active: Optional[bool] = None


class UpdateMultipleHealthConditionsRequest(BaseModel):
    conditions: List[str] = []
    notes: Optional[str] = ""


class WaterIntakeResponse(BaseModel):
    id: uuid.UUID
    client_id: uuid.UUID
    date: date
    amount_ml: int
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class UpdateWaterIntakeRequest(BaseModel):
    date: Optional[date] = None
    amount_ml: Optional[int] = None
    notes: Optional[str] = None


class StrengthRecordResponse(BaseModel):
    id: uuid.UUID
    client_id: uuid.UUID
    exercise_name: str
    weight_lbs: Optional[float] = None
    reps: Optional[int] = None
    sets: Optional[int] = None
    one_rep_max: Optional[float] = None
    notes: Optional[str] = None
    recorded_at: datetime
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class UpdateStrengthRecordRequest(BaseModel):
    exercise_name: Optional[str] = None
    weight_lbs: Optional[float] = None
    reps: Optional[int] = None
    sets: Optional[int] = None
    one_rep_max: Optional[float] = None
    notes: Optional[str] = None
    recorded_at: Optional[datetime] = None


# ---------------------------------------------------------------------------
# Trainer Rating Schemas
# ---------------------------------------------------------------------------

class TrainerRatingResponse(BaseModel):
    id: uuid.UUID
    trainer_id: uuid.UUID
    client_id: uuid.UUID
    rating: int
    review: Optional[str] = None
    session_date: Optional[date] = None
    is_verified: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class TrainerRatingsSummaryResponse(BaseModel):
    trainer_id: uuid.UUID
    average_rating: float
    total_ratings: int
    rating_distribution: dict  # {5: count, 4: count, ...}
    recent_ratings: List[TrainerRatingResponse]


class UpdateTrainerRatingRequest(BaseModel):
    rating: int
    review: Optional[str] = None
    session_date: Optional[date] = None


# ---------------------------------------------------------------------------
# Client Status Schemas
# ---------------------------------------------------------------------------

class ClientStatusResponse(BaseModel):
    id: uuid.UUID
    client_id: uuid.UUID
    status: str
    membership_type: Optional[str] = None
    membership_expiry: Optional[date] = None
    last_active_date: Optional[date] = None
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ClientWithStatusResponse(BaseModel):
    client: ClientAccount
    status: ClientStatusResponse


# ---------------------------------------------------------------------------
# Shop Order Schemas
# ---------------------------------------------------------------------------

class ShopOrderItemBase(BaseModel):
    product_id: uuid.UUID
    quantity: int
    unit_price: float

class ShopOrderItemResponse(ShopOrderItemBase):
    id: uuid.UUID
    shop_order_id: uuid.UUID
    product_name: str
    line_total: float
    product: Optional[ProductResponse] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class ShopOrderBase(BaseModel):
    items: List[ShopOrderItemBase]
    shipping_address: dict
    notes: Optional[str] = None


class AdminOrderResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    order_number: str
    status: str
    subtotal: float
    tax_amount: float
    shipping_amount: float
    total_amount: float
    currency: str
    shipping_address: Optional[dict] = None
    billing_address: Optional[dict] = None
    notes: Optional[str] = None
    shipped_at: Optional[datetime] = None
    delivered_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    shop_order_items: List[ShopOrderItemResponse] = []

    model_config = {"from_attributes": True}


class UpdateOrderStatusRequest(BaseModel):
    status: str
    notes: Optional[str] = None


# ---------------------------------------------------------------------------
# Dashboard Stats Schema
# ---------------------------------------------------------------------------

class DashboardStatsResponse(BaseModel):
    total_clients: int
    active_clients: int
    total_trainers: int
    active_trainers: int
    total_orders: int
    pending_orders: int
    total_revenue: float
    monthly_revenue: float
    new_clients_this_month: int
    new_orders_this_month: int

    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# Progress Photo Schemas
# ---------------------------------------------------------------------------

class ProgressPhotoResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    filename: str
    original_filename: str
    file_path: str
    file_size: int
    mime_type: str
    description: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class ProgressPhotoCreate(BaseModel):
    description: Optional[str] = None


# ---------------------------------------------------------------------------
# Trainer Assessment Schemas
# ---------------------------------------------------------------------------

class TrainerAssessmentScores(BaseModel):
    technical_score: Optional[float] = None
    communication_score: Optional[float] = None
    professionalism_score: Optional[float] = None
    overall_score: Optional[float] = None

    model_config = {"from_attributes": True}


class TrainerAssessmentRequest(BaseModel):
    trainer_id: uuid.UUID
    assessment_date: date
    technical_score: Optional[float] = None
    communication_score: Optional[float] = None
    professionalism_score: Optional[float] = None
    overall_score: Optional[float] = None
    strengths: Optional[str] = None
    areas_for_improvement: Optional[str] = None
    notes: Optional[str] = None
    status: Optional[str] = "completed"


class TrainerAssessmentResponse(BaseModel):
    id: uuid.UUID
    trainer_id: uuid.UUID
    assessor_id: Optional[uuid.UUID] = None
    assessment_date: date
    technical_score: Optional[float] = None
    communication_score: Optional[float] = None
    professionalism_score: Optional[float] = None
    overall_score: Optional[float] = None
    strengths: Optional[str] = None
    areas_for_improvement: Optional[str] = None
    notes: Optional[str] = None
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# Badge Schemas
# ---------------------------------------------------------------------------

class BadgeResponse(BaseModel):
    id: int
    badge_name: str
    awarded_date: date

    model_config = {"from_attributes": True}


class BadgeCheckResponse(BaseModel):
    new_badges: List[BadgeResponse]
    total_badges: int
    message: str
