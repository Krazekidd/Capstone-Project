from pydantic import BaseModel, EmailStr, Field, ConfigDict, field_validator, Field, validator
from typing import List, Optional
from datetime import datetime, date
import uuid
from decimal import Decimal


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


class ProductReviewBase(BaseModel):
    rating: int
    body: Optional[str] = None


class ProductReviewResponse(ProductReviewBase):
    id: uuid.UUID
    product_id: uuid.UUID
    user_id: uuid.UUID
    created_at: datetime

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
# TRAINER EVALUATION SCHEMAS
# ---------------------------------------------------------------------------

class TrainerEvaluationRequest(BaseModel):
    trainer_id: uuid.UUID
    evaluation_month: int = Field(..., ge=1, le=12, description="Month of evaluation (1-12)")
    evaluation_year: int = Field(..., ge=2020, le=2030, description="Year of evaluation")
    evaluator_role: str = Field(..., regex="^(admin|senior_trainer)$", description="Role of evaluator")
    
    # Evaluation criteria scores (1-10 scale, supports 0.5 increments)
    performance_score: Decimal = Field(..., ge=1.0, le=10.0, description="Performance & Results score")
    motivation_score: Decimal = Field(..., ge=1.0, le=10.0, description="Motivation & Energy score")
    interaction_score: Decimal = Field(..., ge=1.0, le=10.0, description="Client Interaction score")
    knowledge_score: Decimal = Field(..., ge=1.0, le=10.0, description="Technical Knowledge score")
    punctuality_score: Decimal = Field(..., ge=1.0, le=10.0, description="Punctuality score")
    
    notes: Optional[str] = Field(None, max_length=1000, description="Optional notes from evaluator")

    @validator('performance_score', 'motivation_score', 'interaction_score', 'knowledge_score', 'punctuality_score')
    def validate_score_increments(cls, v):
        """Validate that scores are in 0.5 increments"""
        if float(v) * 2 != int(float(v) * 2):
            raise ValueError('Score must be a whole number or .5 increment')
        return v


class TrainerEvaluationResponse(BaseModel):
    id: uuid.UUID
    trainer_id: uuid.UUID
    evaluation_month: int
    evaluation_year: int
    evaluator_id: uuid.UUID
    evaluator_role: str
    
    # Evaluation criteria scores
    performance_score: Optional[Decimal] = None
    motivation_score: Optional[Decimal] = None
    interaction_score: Optional[Decimal] = None
    knowledge_score: Optional[Decimal] = None
    punctuality_score: Optional[Decimal] = None
    
    # Calculated fields
    weighted_mean: Optional[Decimal] = None
    weighted_sd: Optional[Decimal] = None
    final_score: Optional[Decimal] = None
    
    # Performance classification
    performance_flag: Optional[str] = None
    rater_agreement: Optional[str] = None
    
    # Metadata
    notes: Optional[str] = None
    submitted_at: datetime
    finalised: bool
    is_editable: bool
    
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class TrainerEvaluationSummary(BaseModel):
    """Summary of evaluation results for a trainer"""
    trainer_id: uuid.UUID
    trainer_name: str
    evaluation_month: int
    evaluation_year: int
    
    # Individual evaluator scores
    admin_score: Optional[Decimal] = None
    senior1_score: Optional[Decimal] = None
    senior2_score: Optional[Decimal] = None
    
    # Final calculated results
    final_score: Optional[Decimal] = None
    weighted_mean: Optional[Decimal] = None
    weighted_sd: Optional[Decimal] = None
    performance_flag: Optional[str] = None
    rater_agreement: Optional[str] = None
    
    # Status
    is_complete: bool = False
    is_editable: bool = True
    hours_until_lock: Optional[float] = None
    
    model_config = {"from_attributes": True}


class TrainerEvaluationListResponse(BaseModel):
    """Response for listing trainer evaluations"""
    evaluations: List[TrainerEvaluationSummary]
    total_count: int


class EvaluationCriteriaResponse(BaseModel):
    """Response showing evaluation criteria definitions"""
    criteria: List[dict]
    score_ranges: dict
    performance_flags: dict


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
# ========== PRODUCT SCHEMAS ==========

class ShopProductResponse(BaseModel):
    """Response schema for shop product list"""
    id: str
    name: str
    description: Optional[str] = None
    price: float
    category: str
    image_url: Optional[str] = None
    badge_label: Optional[str] = None
    badge_color: Optional[str] = None
    average_rating: float = 0
    review_count: int = 0
    stock_qty: int = 0
    is_active: bool = True
    featured: bool = False
    
    


class ShopProductDetailResponse(ShopProductResponse):
    """Response schema for detailed product view"""
    slug: str
    currency: str = "JMD"
    description: Optional[str] = None
    created_at: datetime
    updated_at: datetime


# ========== CART SCHEMAS ==========

class AddToCartRequest(BaseModel):
    """Request schema for adding item to cart"""
    product_id: str
    quantity: int = Field(default=1, ge=1, le=99)


class UpdateCartRequest(BaseModel):
    """Request schema for updating cart item"""
    product_id: str
    quantity: int = Field(ge=0)


class CartItemResponse(BaseModel):
    """Response schema for cart items"""
    product_id: str
    name: str
    price: float
    quantity: int
    total: float
    image_url: Optional[str] = None
    
    model_config = ConfigDict(from_attributes=True)
    
    @field_validator('price', 'total', mode='before')
    @classmethod
    def convert_decimal(cls, v):
        return float(v) if v is not None else 0.0


class CartResponse(BaseModel):
    """Response schema for full cart"""
    items: List[CartItemResponse]
    subtotal: float
    tax: float
    shipping_cost: float
    total: float
    item_count: int
    
    @field_validator('subtotal', 'tax', 'shipping_cost', 'total', mode='before')
    @classmethod
    def convert_decimals(cls, v):
        return float(v) if v is not None else 0.0


class CartSummaryResponse(BaseModel):
    """Lightweight cart summary for navbar/badges"""
    item_count: int
    subtotal: float
    currency: str = "JMD"
    
    @field_validator('subtotal', mode='before')
    @classmethod
    def convert_decimal(cls, v):
        return float(v) if v is not None else 0.0


class CartValidationResponse(BaseModel):
    """Response for cart validation before checkout"""
    is_valid: bool
    errors: List[str] = []
    warnings: List[str] = []
    out_of_stock_items: List[str] = []
    quantity_exceeds_stock: List[dict] = []
    price_changes: List[dict] = []
    original_total: float = 0.0
    updated_total: float = 0.0


# ========== WISHLIST SCHEMAS ==========

class WishlistItemResponse(BaseModel):
    """Response schema for wishlist items"""
    product_id: str
    name: str
    price: float
    image_url: Optional[str] = None
    
    @field_validator('price', mode='before')
    @classmethod
    def convert_decimal(cls, v):
        return float(v) if v is not None else 0.0


class WishlistResponse(BaseModel):
    """Response schema for full wishlist"""
    items: List[WishlistItemResponse]
    total: int


# ========== ORDER SCHEMAS ==========

class OrderAddress(BaseModel):
    """Shipping/Billing address schema"""
    customer_name: str = Field(min_length=1, max_length=200)
    email: str = Field(pattern=r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')
    phone: str = Field(min_length=5, max_length=20)
    address: str = Field(min_length=5, max_length=500)
    city: str = Field(min_length=2, max_length=100)
    notes: Optional[str] = None


class PlaceOrderRequest(OrderAddress):
    """Request schema for placing an order"""
    payment_method: str = Field(default="card", pattern="^(card|cash|wallet)$")


class OrderItemResponse(BaseModel):
    """Response schema for order items"""
    product_id: str
    product_name: str
    product_price: float
    quantity: int
    total: float
    
    @field_validator('product_price', 'total', mode='before')
    @classmethod
    def convert_decimal(cls, v):
        return float(v) if v is not None else 0.0


class OrderResponse(BaseModel):
    """Response schema for orders"""
    id: uuid.UUID
    order_number: str
    status: str
    subtotal: float
    tax_amount: float
    shipping_amount: float
    total_amount: float
    shipping_address: dict
    notes: Optional[str] = None
    items: List[OrderItemResponse]
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)
    
    @field_validator('subtotal', 'tax_amount', 'shipping_amount', 'total_amount', mode='before')
    @classmethod
    def convert_decimals(cls, v):
        return float(v) if v is not None else 0.0


class OrdersListResponse(BaseModel):
    """Response schema for list of orders"""
    orders: List[OrderResponse]
    total: int


# ========== UTILITY SCHEMAS ==========

class APIResponse(BaseModel):
    """Generic API response wrapper"""
    success: bool
    message: str
    data: Optional[dict] = None
    error: Optional[str] = None


class BulkAddResponse(BaseModel):
    """Response for bulk add to cart"""
    message: str
    added_count: int
    errors: Optional[List[str]] = None
    success: bool


class MergeCartResponse(BaseModel):
    """Response for cart merge operation"""
    message: str
    merged_count: int
    conflicts: Optional[List[dict]] = None
    success: bool


# ==========  ADMIN SCHEMAS (if needed) ==========

class UpdateOrderStatusRequest(BaseModel):
    """Request schema for updating order status (admin)"""
    status: str = Field(..., pattern="^(pending|processing|shipped|delivered|cancelled|refunded)$")
    notes: Optional[str] = None
    tracking_number: Optional[str] = None


class UpdateOrderStatusResponse(BaseModel):
    """Response schema for order status update"""
    id: uuid.UUID
    order_number: str
    previous_status: str
    new_status: str
    updated_at: datetime
    success: bool


class AdminOrderResponse(OrderResponse):
    """Extended order response for admin"""
    user_id: uuid.UUID
    user_email: Optional[str] = None
    user_name: Optional[str] = None
    updated_at: Optional[datetime] = None


class ProductCreateRequest(BaseModel):
    """Request schema for creating a product (admin)"""
    name: str = Field(min_length=1, max_length=200)
    slug: str = Field(min_length=1, max_length=200)
    category: str
    description: Optional[str] = None
    price: float = Field(gt=0)
    currency: str = "JMD"
    image_url: Optional[str] = None
    badge_label: Optional[str] = None
    badge_color: Optional[str] = None
    stock_qty: int = Field(default=0, ge=0)
    is_active: bool = True
    sort_order: int = 0
    featured: bool = False


class ProductUpdateRequest(BaseModel):
    """Request schema for updating a product (admin)"""
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    slug: Optional[str] = Field(None, min_length=1, max_length=200)
    category: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = Field(None, gt=0)
    currency: Optional[str] = None
    image_url: Optional[str] = None
    badge_label: Optional[str] = None
    badge_color: Optional[str] = None
    stock_qty: Optional[int] = Field(None, ge=0)
    is_active: Optional[bool] = None
    sort_order: Optional[int] = Field(None, ge=0)
    featured: Optional[bool] = None

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


# ---------------------------------------------------------------------------
# TRAINER EVALUATION SCHEMAS
# ---------------------------------------------------------------------------

class TrainerEvaluationRequest(BaseModel):
    trainer_id: uuid.UUID
    evaluation_month: int = Field(..., ge=1, le=12, description="Month of evaluation (1-12)")
    evaluation_year: int = Field(..., ge=2020, le=2030, description="Year of evaluation")
    evaluator_role: str = Field(..., regex="^(admin|senior_trainer)$", description="Role of evaluator")
    
    # Evaluation criteria scores (1-10 scale, supports 0.5 increments)
    performance_score: Decimal = Field(..., ge=1.0, le=10.0, description="Performance & Results score")
    motivation_score: Decimal = Field(..., ge=1.0, le=10.0, description="Motivation & Energy score")
    interaction_score: Decimal = Field(..., ge=1.0, le=10.0, description="Client Interaction score")
    knowledge_score: Decimal = Field(..., ge=1.0, le=10.0, description="Technical Knowledge score")
    punctuality_score: Decimal = Field(..., ge=1.0, le=10.0, description="Punctuality score")
    
    notes: Optional[str] = Field(None, max_length=1000, description="Optional notes from evaluator")

    @validator('performance_score', 'motivation_score', 'interaction_score', 'knowledge_score', 'punctuality_score')
    def validate_score_increments(cls, v):
        """Validate that scores are in 0.5 increments"""
        if float(v) * 2 != int(float(v) * 2):
            raise ValueError('Score must be a whole number or .5 increment')
        return v


class TrainerEvaluationResponse(BaseModel):
    id: uuid.UUID
    trainer_id: uuid.UUID
    evaluation_month: int
    evaluation_year: int
    evaluator_id: uuid.UUID
    evaluator_role: str
    
    # Evaluation criteria scores
    performance_score: Optional[Decimal] = None
    motivation_score: Optional[Decimal] = None
    interaction_score: Optional[Decimal] = None
    knowledge_score: Optional[Decimal] = None
    punctuality_score: Optional[Decimal] = None
    
    # Calculated fields
    weighted_mean: Optional[Decimal] = None
    weighted_sd: Optional[Decimal] = None
    final_score: Optional[Decimal] = None
    
    # Performance classification
    performance_flag: Optional[str] = None
    rater_agreement: Optional[str] = None
    
    # Metadata
    notes: Optional[str] = None
    submitted_at: datetime
    finalised: bool
    is_editable: bool
    
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class TrainerEvaluationSummary(BaseModel):
    """Summary of evaluation results for a trainer"""
    trainer_id: uuid.UUID
    trainer_name: str
    evaluation_month: int
    evaluation_year: int
    
    # Individual evaluator scores
    admin_score: Optional[Decimal] = None
    senior1_score: Optional[Decimal] = None
    senior2_score: Optional[Decimal] = None
    
    # Final calculated results
    final_score: Optional[Decimal] = None
    weighted_mean: Optional[Decimal] = None
    weighted_sd: Optional[Decimal] = None
    performance_flag: Optional[str] = None
    rater_agreement: Optional[str] = None
    
    # Status
    is_complete: bool = False
    is_editable: bool = True
    hours_until_lock: Optional[float] = None
    
    model_config = {"from_attributes": True}


class TrainerEvaluationListResponse(BaseModel):
    """Response for listing trainer evaluations"""
    evaluations: List[TrainerEvaluationSummary]
    total_count: int


class EvaluationCriteriaResponse(BaseModel):
    """Response showing evaluation criteria definitions"""
    criteria: List[dict]
    score_ranges: dict
    performance_flags: dict


# =============================================================
# TRAINER GRADES
# =============================================================

class GradeScores(BaseModel):
    performance: float
    motivation: float
    interaction: float
    knowledge: float
    punctuality: float


class GradeSubmitRequest(BaseModel):
    trainer_id: uuid.UUID
    month_index: int
    scores: GradeScores
    notes: Optional[str] = None
    submitted_by: uuid.UUID

    @validator("month_index")
    def validate_month_index(cls, v):
        if v < 0 or v > 10:
            raise ValueError("month_index must be between 0 and 10 (Jan–Nov)")
        return v


class GradeResponse(BaseModel):
    id: str
    trainer_id: str
    month_index: int
    scores: GradeScores
    overall_avg: float
    notes: Optional[str]
    submitted_by: str
    submitted_at: str
    finalised: bool
    locked: bool
    hours_remaining: Optional[float] = None

    class Config:
        from_attributes = True


class GradeListResponse(BaseModel):
    trainer_id: str
    grades: List[GradeResponse]
