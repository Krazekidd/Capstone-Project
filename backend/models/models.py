import uuid
from datetime import datetime, timezone
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID, JSONB, CITEXT, INET
from sqlalchemy import (
    Enum,
    Date,
    Text,
    CheckConstraint,
    Integer,
    Index,
    Column,
    String,
    Numeric,
    Float,
    Boolean,
    Time,
    DateTime,
    ForeignKey,
    ARRAY,
    JSON,
)
from sqlalchemy.sql import func
from database import Base


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)

# =============================================================
# ENUMS
# =============================================================

user_role_enum = Enum('client', 'trainer', 'admin', name='user_role')
membership_tier_enum = Enum('basic', 'pro', 'elite', name='membership_tier')
membership_status_enum = Enum('active', 'inactive', 'suspended', 'cancelled', name='membership_status')
consultation_format_enum = Enum('in_person', 'video_call', name='consultation_format')
booking_status_enum = Enum('pending', 'confirmed', 'cancelled', 'completed', 'no_show', name='booking_status')
product_category_enum = Enum('merch', 'essentials', 'supplements','apparel','equipment','accessories', name='product_category')
order_status_enum = Enum('pending', 'paid', 'shipped', 'delivered', 'refunded', 'cancelled', name='order_status')
token_type_enum = Enum('refresh', 'password_reset', 'email_verify', name='token_type')


# =============================================================
# CORE USER & AUTH
# =============================================================

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(CITEXT, nullable=False, unique=True, index=True)
    password_hash = Column(Text, nullable=False)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    phone = Column(String(30))
    avatar_url = Column(Text)
    role = Column(user_role_enum, nullable=False, default='client')
    is_email_verified = Column(Boolean, nullable=False, default=False)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), nullable=False, default=_utcnow)
    updated_at = Column(DateTime(timezone=True), nullable=False, default=_utcnow, onupdate=_utcnow)

    # Relationships
    auth_tokens = relationship("AuthToken", back_populates="user", cascade="all, delete-orphan")
    user_memberships = relationship("UserMembership", back_populates="user", cascade="all, delete-orphan")
    bookings = relationship("Booking", back_populates="user", cascade="all, delete-orphan")
    shop_orders = relationship("ShopOrder", back_populates="user", cascade="all, delete-orphan")
    product_reviews = relationship("ProductReview", back_populates="user", cascade="all, delete-orphan")
    cart_items = relationship("ShopCartItem", back_populates="user", cascade="all, delete-orphan")
    wishlist_items = relationship("ShopWishlistItem", back_populates="user", cascade="all, delete-orphan")   
    excursion_bookings = relationship("ExcursionBooking", back_populates="user", cascade="all, delete-orphan")
    
    # Role-specific relationships
    client_profile = relationship("Client", back_populates="user", uselist=False, cascade="all, delete-orphan")
    trainer_profile = relationship("Trainer", back_populates="user", uselist=False, cascade="all, delete-orphan")
    admin_profile = relationship("Admin", back_populates="user", uselist=False, cascade="all, delete-orphan")


class AuthToken(Base):
    __tablename__ = "auth_tokens"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    token_hash = Column(Text, nullable=False, unique=True)
    token_type = Column(token_type_enum, nullable=False, default='refresh')
    expires_at = Column(DateTime(timezone=True), nullable=False)
    revoked = Column(Boolean, nullable=False, default=False)
    revoked_at = Column(DateTime(timezone=True))
    user_agent = Column(Text)
    ip_address = Column(INET)
    created_at = Column(DateTime(timezone=True), nullable=False, default=_utcnow)

    # Relationships
    user = relationship("User", back_populates="auth_tokens")

    # Indexes
    __table_args__ = (
        Index('idx_auth_tokens_user_id', 'user_id'),
        Index('idx_auth_tokens_token_hash', 'token_hash'),
        Index('idx_auth_tokens_expires_at', 'expires_at'),
    )


# =============================================================
# ROLE-SPECIFIC PROFILES
# =============================================================

class Client(Base):
    __tablename__ = "clients"

    id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    name = Column(String(200), nullable=False)
    gender = Column(String(20))  # 'male', 'female', 'other'
    phone_number = Column(String(30))
    birthday = Column(Date)
    height = Column(Float)  # in cm
    weight = Column(Float)  # in kg
    profile_image = Column(Text)
    emergency_contact_name = Column(String(200))
    emergency_contact_phone = Column(String(30))
    medical_conditions = Column(Text)
    fitness_goals = Column(Text)
    created_at = Column(DateTime(timezone=True), nullable=False, default=_utcnow)
    updated_at = Column(DateTime(timezone=True), nullable=False, default=_utcnow, onupdate=_utcnow)

    # Relationships
    user = relationship("User", back_populates="client_profile")
    body_measurements = relationship("BodyMeasurement", back_populates="client", cascade="all, delete-orphan")
    progress_photos = relationship("ProgressPhoto", back_populates="client", cascade="all, delete-orphan")
    attendance_records = relationship("Attendance", back_populates="client", cascade="all, delete-orphan")
    nutrition_plans = relationship("NutritionPlan", back_populates="client", cascade="all, delete-orphan")
    nutrition_goals = relationship("NutritionGoals", back_populates="client", cascade="all, delete-orphan")
    training_schedules = relationship("TrainingSchedule", back_populates="client", cascade="all, delete-orphan")
    client_badges = relationship("ClientBadge", back_populates="client", cascade="all, delete-orphan")
    activity_data = relationship("ActivityData", back_populates="client", cascade="all, delete-orphan")
    saved_conversations = relationship("SavedConversation", back_populates="client", cascade="all, delete-orphan")
    goals = relationship("ClientGoal", back_populates="client", cascade="all, delete-orphan")
    health_conditions = relationship("ClientHealthCondition", back_populates="client", cascade="all, delete-orphan")
    water_intake_records = relationship("ClientWaterIntake", back_populates="client", cascade="all, delete-orphan")
    strength_records = relationship("ClientStrengthRecord", back_populates="client", cascade="all, delete-orphan")
    client_status = relationship("ClientStatus", back_populates="client", uselist=False, cascade="all, delete-orphan")

    # Indexes
    __table_args__ = (
        Index('idx_clients_name', 'name'),
        Index('idx_clients_created_at', 'created_at'),
    )


class Trainer(Base):
    __tablename__ = "trainers"

    id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    name = Column(String(200), nullable=False)
    certification = Column(String(200))
    rating = Column(Float, default=0.0)
    trainer_level = Column(String(50), default='beginner')  # beginner, intermediate, advanced, expert
    is_senior = Column(Boolean, default=False)
    specialties = Column(ARRAY(String), default='{}')
    bio = Column(Text)
    experience_years = Column(Integer, default=0)
    hourly_rate = Column(Numeric(10, 2))
    profile_image = Column(Text)
    created_at = Column(DateTime(timezone=True), nullable=False, default=_utcnow)
    updated_at = Column(DateTime(timezone=True), nullable=False, default=_utcnow, onupdate=_utcnow)

    # Relationships
    user = relationship("User", back_populates="trainer_profile")
    trainer_ratings = relationship("TrainerRating", back_populates="trainer", cascade="all, delete-orphan")
    trainer_assessments = relationship("TrainerAssessment", back_populates="trainer", cascade="all, delete-orphan")
    training_schedules = relationship("TrainingSchedule", back_populates="trainer", cascade="all, delete-orphan")
    grades = relationship("TrainerGrade", foreign_keys="TrainerGrade.trainer_id", back_populates="trainer", cascade="all, delete-orphan")

    # Indexes
    __table_args__ = (
        Index('idx_trainers_name', 'name'),
        Index('idx_trainers_rating', 'rating'),
        Index('idx_trainers_level', 'trainer_level'),
    )


class Admin(Base):
    __tablename__ = "admins"

    id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    name = Column(String(200), nullable=False)
    phone_number = Column(String(30))
    department = Column(String(100))
    access_level = Column(String(50), default='full')  # full, limited, read_only
    profile_image = Column(Text)
    created_at = Column(DateTime(timezone=True), nullable=False, default=_utcnow)
    updated_at = Column(DateTime(timezone=True), nullable=False, default=_utcnow, onupdate=_utcnow)

    # Relationships
    user = relationship("User", back_populates="admin_profile")

    # Indexes
    __table_args__ = (
        Index('idx_admins_name', 'name'),
        Index('idx_admins_department', 'department'),
    )


# =============================================================
# MEMBERSHIPS
# =============================================================

class MembershipPlan(Base):
    __tablename__ = "membership_plans"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False)
    tier = Column(membership_tier_enum, nullable=False)
    price_monthly = Column(Numeric(10, 2), nullable=False)
    price_annual = Column(Numeric(10, 2))
    description = Column(Text)
    features = Column(JSONB, nullable=False, default='[]')
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), nullable=False, default=_utcnow)

    # Relationships
    user_memberships = relationship("UserMembership", back_populates="plan")


class UserMembership(Base):
    __tablename__ = "user_memberships"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    plan_id = Column(UUID(as_uuid=True), ForeignKey("membership_plans.id"), nullable=False)
    status = Column(membership_status_enum, nullable=False, default='active')
    started_at = Column(DateTime(timezone=True), nullable=False, default=_utcnow)
    expires_at = Column(DateTime(timezone=True))
    cancelled_at = Column(DateTime(timezone=True))
    auto_renew = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), nullable=False, default=_utcnow)
    updated_at = Column(DateTime(timezone=True), nullable=False, default=_utcnow, onupdate=_utcnow)

    # Relationships
    user = relationship("User", back_populates="user_memberships")
    plan = relationship("MembershipPlan", back_populates="user_memberships")

    # Indexes
    __table_args__ = (
        Index('idx_user_memberships_user_id', 'user_id'),
        Index('idx_user_memberships_status', 'status'),
    )


# =============================================================
# COACHES
# =============================================================

class Coach(Base):
    __tablename__ = "coaches"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"))
    full_name = Column(String(200), nullable=False)
    title = Column(String(200))
    bio = Column(Text)
    avatar_url = Column(Text)
    specialities = Column(ARRAY(String), nullable=False, default='{}')
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), nullable=False, default=_utcnow)

    # Relationships
    availability_schedule = relationship("CoachAvailabilitySchedule", back_populates="coach", cascade="all, delete-orphan")
    availability_overrides = relationship("CoachAvailabilityOverride", back_populates="coach", cascade="all, delete-orphan")
    bookings = relationship("Booking", back_populates="coach")


# =============================================================
# CONSULTATION TYPES
# =============================================================

class ConsultationType(Base):
    __tablename__ = "consultation_types"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(150), nullable=False)
    slug = Column(String(100), nullable=False, unique=True)
    subtitle = Column(String(200))
    description = Column(Text)
    duration_minutes = Column(Integer, nullable=False)
    price = Column(Numeric(10, 2), nullable=False, default=0)
    currency = Column(String(10), nullable=False, default='USD')
    badge_label = Column(String(50))
    badge_color = Column(String(30))
    emoji_icon = Column(String(10))
    what_to_expect = Column(ARRAY(String), nullable=False, default='{}')
    requires_membership = Column(membership_tier_enum)
    is_active = Column(Boolean, nullable=False, default=True)
    sort_order = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime(timezone=True), nullable=False, default=_utcnow)

    # Relationships
    bookings = relationship("Booking", back_populates="consultation_type")


# =============================================================
# COACH AVAILABILITY
# =============================================================

class CoachAvailabilitySchedule(Base):
    __tablename__ = "coach_availability_schedule"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    coach_id = Column(UUID(as_uuid=True), ForeignKey("coaches.id", ondelete="CASCADE"), nullable=False)
    day_of_week = Column(Integer, nullable=False)  # 0=Sun ... 6=Sat
    open_time = Column(Time, nullable=False)
    close_time = Column(Time, nullable=False)
    is_active = Column(Boolean, nullable=False, default=True)

    # Relationships
    coach = relationship("Coach", back_populates="availability_schedule")

    # Constraints
    __table_args__ = (
        CheckConstraint('day_of_week BETWEEN 0 AND 6', name='check_day_of_week'),
        Index('idx_coach_schedule_unique', 'coach_id', 'day_of_week', unique=True),
    )


class CoachAvailabilityOverride(Base):
    __tablename__ = "coach_availability_overrides"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    coach_id = Column(UUID(as_uuid=True), ForeignKey("coaches.id", ondelete="CASCADE"), nullable=False)
    override_date = Column(Date, nullable=False)
    is_closed = Column(Boolean, nullable=False, default=True)
    open_time = Column(Time)
    close_time = Column(Time)
    reason = Column(String(200))
    created_at = Column(DateTime(timezone=True), nullable=False, default=_utcnow)

    # Relationships
    coach = relationship("Coach", back_populates="availability_overrides")

    # Indexes
    __table_args__ = (
        Index('idx_coach_avail_overrides_date', 'override_date'),
        Index('idx_coach_override_unique', 'coach_id', 'override_date', unique=True),
    )


# =============================================================
# BOOKINGS
# =============================================================

class Booking(Base):
    __tablename__ = "bookings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    reference = Column(String(20), nullable=False, unique=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    consultation_type_id = Column(UUID(as_uuid=True), ForeignKey("consultation_types.id"), nullable=False)
    coach_id = Column(UUID(as_uuid=True), ForeignKey("coaches.id"))
    scheduled_date = Column(Date, nullable=False)
    scheduled_time = Column(Time, nullable=False)
    timezone = Column(String(60), nullable=False, default='America/New_York')
    format = Column(consultation_format_enum, nullable=False, default='in_person')
    status = Column(booking_status_enum, nullable=False, default='confirmed')
    price_charged = Column(Numeric(10, 2), nullable=False, default=0)
    currency = Column(String(10), nullable=False, default='USD')
    notes = Column(Text)
    agreed_cancellation_policy = Column(Boolean, nullable=False, default=False)
    confirmed_at = Column(DateTime(timezone=True))
    cancelled_at = Column(DateTime(timezone=True))
    cancellation_reason = Column(Text)
    completed_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), nullable=False, default=_utcnow)
    updated_at = Column(DateTime(timezone=True), nullable=False, default=_utcnow, onupdate=_utcnow)

    # Relationships
    user = relationship("User", back_populates="bookings")
    consultation_type = relationship("ConsultationType", back_populates="bookings")
    coach = relationship("Coach", back_populates="bookings")

    # Indexes
    __table_args__ = (
        Index('idx_bookings_user_id', 'user_id'),
        Index('idx_bookings_date', 'scheduled_date'),
        Index('idx_bookings_coach_id', 'coach_id'),
        Index('idx_bookings_status', 'status'),
    )

# =============================================================
# SHOP – PRODUCTS & ORDERS
# =============================================================

class Product(Base):
    __tablename__ = "products"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(200), nullable=False)
    slug = Column(String(200), nullable=False, unique=True)
    category = Column(product_category_enum, nullable=False)
    description = Column(Text)
    price = Column(Numeric(10, 2), nullable=False)
    currency = Column(String(10), nullable=False, default='JMD')
    image_url = Column(Text)
    badge_label = Column(String(50))
    badge_color = Column(String(30))
    average_rating = Column(Numeric(3, 2), nullable=False, default=0)
    review_count = Column(Integer, nullable=False, default=0)
    stock_qty = Column(Integer, nullable=False, default=0)
    is_active = Column(Boolean, nullable=False, default=True)
    sort_order = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime(timezone=True), nullable=False, default=_utcnow)
    updated_at = Column(DateTime(timezone=True), nullable=False, default=_utcnow, onupdate=_utcnow)

    # Relationships
    product_reviews = relationship("ProductReview", back_populates="product", cascade="all, delete-orphan")
    shop_order_items = relationship("ShopOrderItem", back_populates="product")
    cart_items = relationship("ShopCartItem", back_populates="product", cascade="all, delete-orphan")
    wishlist_items = relationship("ShopWishlistItem", back_populates="product", cascade="all, delete-orphan")
    # Indexes
    __table_args__ = (
        Index('idx_products_category', 'category'),
        Index('idx_products_is_active', 'is_active'),
    )






# =============================================================
# PRODUCT REVIEWS / RATINGS
# =============================================================

class ProductReview(Base):
    __tablename__ = "product_reviews"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    rating = Column(Integer, nullable=False)
    body = Column(Text)
    created_at = Column(DateTime(timezone=True), nullable=False, default=_utcnow)

    # Relationships
    product = relationship("Product", back_populates="product_reviews")
    user = relationship("User", back_populates="product_reviews")

    # Constraints
    __table_args__ = (
        CheckConstraint('rating BETWEEN 1 AND 5', name='check_rating_range'),
        Index('idx_product_reviews_product_id', 'product_id'),
        Index('idx_product_reviews_unique', 'product_id', 'user_id', unique=True),
    )


# =============================================================
# WISHLIST / FAVOURITES
# =============================================================

class ShopWishlistItem(Base):
    __tablename__ = "wishlists"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    added_at = Column(DateTime(timezone=True), nullable=False, default=_utcnow)

    # Relationships
    user = relationship("User", back_populates="wishlist_items")
    product = relationship("Product", back_populates="wishlist_items")

    # Constraints
    __table_args__ = (
        Index('idx_wishlists_user_id', 'user_id'),
        Index('idx_wishlists_product_id', 'product_id'),
        Index('idx_wishlists_unique', 'user_id', 'product_id', unique=True),
    )


# =============================================================
# BODY MEASUREMENTS
# =============================================================

class BodyMeasurement(Base):
    __tablename__ = "body_measurements"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    client_id = Column(UUID(as_uuid=True), ForeignKey("clients.id", ondelete="CASCADE"), nullable=False)
    recorded_at = Column(DateTime(timezone=True), nullable=False, default=_utcnow)
    
    # Body basics
    weight = Column(Numeric(6, 2))
    height = Column(Numeric(6, 2))
    body_fat = Column(Numeric(5, 2))
    
    # Upper body
    chest = Column(Numeric(6, 2))
    waist = Column(Numeric(6, 2))
    shoulders = Column(Numeric(6, 2))
    arm_left = Column(Numeric(6, 2))
    arm_right = Column(Numeric(6, 2))
    neck = Column(Numeric(6, 2))
    
    # Lower body
    hips = Column(Numeric(6, 2))
    thigh_left = Column(Numeric(6, 2))
    thigh_right = Column(Numeric(6, 2))
    calf_left = Column(Numeric(6, 2))
    calf_right = Column(Numeric(6, 2))
    glutes = Column(Numeric(6, 2))
    updated_at = Column(DateTime(timezone=True), nullable=False, default=_utcnow, onupdate=_utcnow)

    # Relationships
    client = relationship("Client", back_populates="body_measurements")

    # Indexes
    __table_args__ = (
        Index('idx_body_measurements_client_id', 'client_id'),
        Index('idx_body_measurements_client_date', 'client_id', 'recorded_at'),
    )


# =============================================================
# PROGRESS PHOTOS
# =============================================================

class ProgressPhoto(Base):
    __tablename__ = "progress_photos"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    client_id = Column(UUID(as_uuid=True), ForeignKey("clients.id", ondelete="CASCADE"), nullable=False)
    filename = Column(String(255), nullable=False)
    original_filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_size = Column(Integer, nullable=False)  # in bytes
    mime_type = Column(String(100), nullable=False)
    description = Column(Text)
    created_at = Column(DateTime(timezone=True), nullable=False, default=_utcnow)

    # Relationships
    client = relationship("Client", back_populates="progress_photos")

    # Indexes
    __table_args__ = (
        Index('idx_progress_photos_client_id', 'client_id'),
        Index('idx_progress_photos_created_at', 'created_at'),
    )


# =============================================================
# ATTENDANCE TRACKING
# =============================================================

class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    client_id = Column(UUID(as_uuid=True), ForeignKey("clients.id", ondelete="CASCADE"), nullable=False)
    check_in_time = Column(DateTime(timezone=True), nullable=False, default=_utcnow)
    check_out_time = Column(DateTime(timezone=True))
    duration_minutes = Column(Integer)  # Calculated from check-in and check-out
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), nullable=False, default=_utcnow)

    # Relationships
    client = relationship("Client", back_populates="attendance_records")

    # Indexes
    __table_args__ = (
        Index('idx_attendance_client_id', 'client_id'),
        Index('idx_attendance_check_in_time', 'check_in_time'),
    )


# =============================================================
# NUTRITION PLANS
# =============================================================

class NutritionPlan(Base):
    __tablename__ = "nutrition_plans"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    client_id = Column(UUID(as_uuid=True), ForeignKey("clients.id", ondelete="CASCADE"), nullable=False)
    daily_calories = Column(Numeric(8, 2), nullable=False)
    daily_protein_g = Column(Numeric(6, 2), nullable=False)
    daily_carbs_g = Column(Numeric(6, 2), nullable=False)
    daily_fat_g = Column(Numeric(6, 2), nullable=False)
    daily_fiber_g = Column(Numeric(6, 2))
    meals = Column(JSON, nullable=False, default='[]')
    created_at = Column(DateTime(timezone=True), nullable=False, default=_utcnow)
    updated_at = Column(DateTime(timezone=True), nullable=False, default=_utcnow, onupdate=_utcnow)

    # Relationships
    client = relationship("Client", back_populates="nutrition_plans")

    # Indexes
    __table_args__ = (
        Index('idx_nutrition_plans_client_id', 'client_id'),
    )


class NutritionGoals(Base):
    __tablename__ = "nutrition_goals"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    client_id = Column(UUID(as_uuid=True), ForeignKey("clients.id", ondelete="CASCADE"), nullable=False, unique=True)
    daily_calories = Column(Numeric(8, 2), nullable=False)
    daily_protein_g = Column(Numeric(6, 2), nullable=False)
    daily_carbs_g = Column(Numeric(6, 2), nullable=False)
    daily_fat_g = Column(Numeric(6, 2), nullable=False)
    daily_fiber_g = Column(Numeric(6, 2))
    dietary_restrictions = Column(JSON)
    allergies = Column(JSON)
    goal_type = Column(String(50), nullable=False, default='maintain')
    created_at = Column(DateTime(timezone=True), nullable=False, default=_utcnow)
    updated_at = Column(DateTime(timezone=True), nullable=False, default=_utcnow, onupdate=_utcnow)

    # Relationships
    client = relationship("Client", back_populates="nutrition_goals")

    # Indexes
    __table_args__ = (
        Index('idx_nutrition_goals_client_id', 'client_id'),
    )


# =============================================================
# CONVERSATIONS
# =============================================================

class SavedConversation(Base):
    __tablename__ = "saved_conversations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    client_id = Column(UUID(as_uuid=True), ForeignKey("clients.id", ondelete="CASCADE"), nullable=False)
    session_id = Column(String(255), nullable=False, index=True)
    title = Column(String(255), nullable=False, default="Untitled Chat")
    message_count = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime(timezone=True), nullable=False, default=_utcnow)
    updated_at = Column(DateTime(timezone=True), nullable=False, default=_utcnow, onupdate=_utcnow)

    # Relationships
    client = relationship("Client", back_populates="saved_conversations")
    messages = relationship("ConversationMessage", back_populates="conversation", cascade="all, delete-orphan")

    # Indexes
    __table_args__ = (
        Index('idx_saved_conversations_client_id', 'client_id'),
        Index('idx_saved_conversations_session_id', 'session_id'),
        Index('idx_saved_conversations_created_at', 'created_at'),
    )


class ConversationMessage(Base):
    __tablename__ = "conversation_messages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    conversation_id = Column(UUID(as_uuid=True), ForeignKey("saved_conversations.id", ondelete="CASCADE"), nullable=False)
    role = Column(String(50), nullable=False)  # 'user', 'assistant', 'system'
    content = Column(Text, nullable=False)
    sequence_order = Column(Integer, nullable=False)
    created_at = Column(DateTime(timezone=True), nullable=False, default=_utcnow)

    # Relationships
    conversation = relationship("SavedConversation", back_populates="messages")

    # Indexes
    __table_args__ = (
        Index('idx_conversation_messages_conversation_id', 'conversation_id'),
        Index('idx_conversation_messages_order', 'conversation_id', 'sequence_order'),
    )


# =============================================================
# ACTIVITY/WEARABLE DATA
# =============================================================

class ActivityData(Base):
    __tablename__ = "activity_data"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    client_id = Column(UUID(as_uuid=True), ForeignKey("clients.id", ondelete="CASCADE"), nullable=False)
    date = Column(Date, nullable=False)
    steps = Column(Integer, default=0)
    heart_rate_avg = Column(Integer)  # Average heart rate in BPM
    heart_rate_max = Column(Integer)  # Maximum heart rate in BPM
    calories_burned = Column(Integer, default=0)  # Total calories burned
    active_minutes = Column(Integer, default=0)  # Minutes of activity
    sleep_hours = Column(Float)  # Hours of sleep
    sleep_quality = Column(Integer)  # Sleep quality score 1-100
    distance_km = Column(Float, default=0.0)  # Distance traveled in kilometers
    floors_climbed = Column(Integer, default=0)  # Number of floors climbed
    source = Column(String(100))  # Source device/app (e.g., "Fitbit", "Apple Watch")
    raw_data = Column(JSONB)  # Raw data from wearable device
    created_at = Column(DateTime(timezone=True), nullable=False, default=_utcnow)
    updated_at = Column(DateTime(timezone=True), nullable=False, default=_utcnow, onupdate=_utcnow)

    # Relationships
    client = relationship("Client", back_populates="activity_data")

    # Indexes
    __table_args__ = (
        Index('idx_activity_data_client_id', 'client_id'),
        Index('idx_activity_data_date', 'date'),
        Index('idx_activity_data_client_date', 'client_id', 'date'),
    )


# =============================================================
# TRAINING SCHEDULE
# =============================================================

class TrainingSchedule(Base):
    __tablename__ = "training_schedule"

    id = Column(Integer, primary_key=True, autoincrement=True)
    client_id = Column(UUID(as_uuid=True), ForeignKey("clients.id", ondelete="CASCADE"), nullable=False)
    trainer_id = Column(UUID(as_uuid=True), ForeignKey("trainers.id", ondelete="SET NULL"))
    day_of_week = Column(String(20), nullable=False)  # Monday, Tuesday, etc.
    day_number = Column(Integer, nullable=False)  # 1-7 for ordering
    workout_type = Column(String(100), nullable=False)  # Upper Body, Lower Body, Cardio, etc.
    exercises = Column(Text, nullable=False)  # JSON string of exercises
    duration_minutes = Column(Integer, nullable=False)
    intensity_level = Column(String(20), nullable=False)  # Low, Medium, High
    notes = Column(Text, nullable=True)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), nullable=False, default=_utcnow)
    updated_at = Column(DateTime(timezone=True), nullable=False, default=_utcnow, onupdate=_utcnow)

    # Relationships
    client = relationship("Client", back_populates="training_schedules", foreign_keys=[client_id])
    trainer = relationship("Trainer", back_populates="training_schedules", foreign_keys=[trainer_id])

    # Indexes
    __table_args__ = (
        Index('idx_training_schedule_client_id', 'client_id'),
        Index('idx_training_schedule_day_number', 'client_id', 'day_number'),
        Index('idx_training_schedule_active', 'client_id', 'is_active'),
    )


# =============================================================
# CLIENT BADGES
# =============================================================

class ClientBadge(Base):
    __tablename__ = "client_badges"

    id = Column(Integer, primary_key=True, autoincrement=True)
    client_id = Column(UUID(as_uuid=True), ForeignKey("clients.id", ondelete="CASCADE"), nullable=False)
    badge_name = Column(String(100), nullable=False)
    awarded_date = Column(Date, nullable=False)
    created_at = Column(DateTime(timezone=True), nullable=False, default=_utcnow)

    # Relationships
    client = relationship("Client", back_populates="client_badges")

    # Indexes
    __table_args__ = (
        Index('idx_client_badges_client_id', 'client_id'),
        Index('idx_client_badges_badge_name', 'badge_name'),
        Index('idx_client_badges_awarded_date', 'awarded_date'),
    )


# =============================================================
# CLIENT GOALS & HEALTH
# =============================================================

class ClientGoal(Base):
    __tablename__ = "client_goals"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    client_id = Column(UUID(as_uuid=True), ForeignKey("clients.id", ondelete="CASCADE"), nullable=False)
    goal_type = Column(String(50), nullable=False)  # weight_loss, muscle_gain, endurance, etc.
    primary_goal = Column(String(100))  # Bulk Up, Cut Down, etc.
    
    # Specific body measurement targets
    target_weight_kg = Column(Numeric(6, 2))
    target_chest_cm = Column(Numeric(6, 2))
    target_waist_cm = Column(Numeric(6, 2))
    target_hips_cm = Column(Numeric(6, 2))
    target_thigh_cm = Column(Numeric(6, 2))
    target_arm_cm = Column(Numeric(6, 2))
    
    # Legacy fields for backward compatibility
    target_value = Column(Numeric(10, 2))
    current_value = Column(Numeric(10, 2))
    target_date = Column(Date)
    is_active = Column(Boolean, nullable=False, default=True)
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), nullable=False, default=_utcnow)
    updated_at = Column(DateTime(timezone=True), nullable=False, default=_utcnow, onupdate=_utcnow)

    # Relationships
    client = relationship("Client", back_populates="goals")

    # Indexes
    __table_args__ = (
        Index('idx_client_goals_client_id', 'client_id'),
        Index('idx_client_goals_active', 'client_id', 'is_active'),
    )


class ClientHealthCondition(Base):
    __tablename__ = "client_health_conditions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    client_id = Column(UUID(as_uuid=True), ForeignKey("clients.id", ondelete="CASCADE"), nullable=False)
    condition_name = Column(String(100), nullable=False)
    severity = Column(String(20))  # mild, moderate, severe
    medications = Column(Text)
    notes = Column(Text)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), nullable=False, default=_utcnow)
    updated_at = Column(DateTime(timezone=True), nullable=False, default=_utcnow, onupdate=_utcnow)

    # Relationships
    client = relationship("Client", back_populates="health_conditions")

    # Indexes
    __table_args__ = (
        Index('idx_client_health_conditions_client_id', 'client_id'),
        Index('idx_client_health_conditions_active', 'client_id', 'is_active'),
    )


class ClientWaterIntake(Base):
    __tablename__ = "client_water_intake"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    client_id = Column(UUID(as_uuid=True), ForeignKey("clients.id", ondelete="CASCADE"), nullable=False)
    date = Column(Date, nullable=False)
    amount_ml = Column(Integer, nullable=False)  # Water intake in milliliters
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), nullable=False, default=_utcnow)
    updated_at = Column(DateTime(timezone=True), nullable=False, default=_utcnow, onupdate=_utcnow)

    # Relationships
    client = relationship("Client", back_populates="water_intake_records")

    # Indexes
    __table_args__ = (
        Index('idx_client_water_intake_client_id', 'client_id'),
        Index('idx_client_water_intake_date', 'client_id', 'date'),
        Index('idx_client_water_intake_unique', 'client_id', 'date', unique=True),
    )


class ClientStrengthRecord(Base):
    __tablename__ = "client_strength_records"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    client_id = Column(UUID(as_uuid=True), ForeignKey("clients.id", ondelete="CASCADE"), nullable=False)
    exercise_name = Column(String(100), nullable=False)
    weight_lbs = Column(Numeric(6, 2))  # Weight lifted in pounds
    reps = Column(Integer)
    sets = Column(Integer)
    one_rep_max = Column(Numeric(6, 2))  # Calculated 1RM
    notes = Column(Text)
    recorded_at = Column(DateTime(timezone=True), nullable=False, default=_utcnow)
    created_at = Column(DateTime(timezone=True), nullable=False, default=_utcnow)
    updated_at = Column(DateTime(timezone=True), nullable=False, default=_utcnow, onupdate=_utcnow)

    # Relationships
    client = relationship("Client", back_populates="strength_records")

    # Indexes
    __table_args__ = (
        Index('idx_client_strength_records_client_id', 'client_id'),
        Index('idx_client_strength_records_exercise', 'client_id', 'exercise_name'),
        Index('idx_client_strength_records_date', 'client_id', 'recorded_at'),
    )


# =============================================================
# TRAINER RATINGS & ASSESSMENTS
# =============================================================

class TrainerRating(Base):
    __tablename__ = "trainer_ratings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    trainer_id = Column(UUID(as_uuid=True), ForeignKey("trainers.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    rating = Column(Integer, nullable=False)  # 1-5 stars
    review = Column(Text)
    session_date = Column(Date)
    is_verified = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime(timezone=True), nullable=False, default=_utcnow)
    updated_at = Column(DateTime(timezone=True), nullable=False, default=_utcnow, onupdate=_utcnow)

    # Relationships
    client_user = relationship("User", foreign_keys=[user_id])
    trainer = relationship("Trainer", back_populates="trainer_ratings")

    # Indexes
    __table_args__ = (
        Index('idx_trainer_ratings_trainer_id', 'trainer_id'),
        Index('idx_trainer_ratings_user_id', 'user_id'),
        Index('idx_trainer_ratings_unique', 'trainer_id', 'user_id', 'session_date', unique=True),
        CheckConstraint('rating BETWEEN 1 AND 5', name='check_trainer_rating_range'),
    )


class TrainerAssessment(Base):
    __tablename__ = "trainer_assessments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    trainer_id = Column(UUID(as_uuid=True), ForeignKey("trainers.id", ondelete="CASCADE"), nullable=False)
    assessor_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"))  # Admin who assessed
    assessment_date = Column(Date, nullable=False)
    technical_score = Column(Numeric(5, 2))  # 0-100
    communication_score = Column(Numeric(5, 2))  # 0-100
    professionalism_score = Column(Numeric(5, 2))  # 0-100
    overall_score = Column(Numeric(5, 2))  # 0-100
    strengths = Column(Text)
    areas_for_improvement = Column(Text)
    notes = Column(Text)
    status = Column(String(20), nullable=False, default='completed')  # pending, completed, failed
    created_at = Column(DateTime(timezone=True), nullable=False, default=_utcnow)
    updated_at = Column(DateTime(timezone=True), nullable=False, default=_utcnow, onupdate=_utcnow)

    # Relationships
    assessor_user = relationship("User", foreign_keys=[assessor_id])
    trainer = relationship("Trainer", back_populates="trainer_assessments")

    # Indexes
    __table_args__ = (
        Index('idx_trainer_assessments_trainer_id', 'trainer_id'),
        Index('idx_trainer_assessments_assessor_id', 'assessor_id'),
        Index('idx_trainer_assessments_date', 'assessment_date'),
    )


# =============================================================
# TRAINER EVALUATION SYSTEM
# =============================================================

class TrainerEvaluation(Base):
    __tablename__ = "trainer_evaluations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    trainer_id = Column(UUID(as_uuid=True), ForeignKey("trainers.id", ondelete="CASCADE"), nullable=False)
    evaluation_month = Column(Integer, nullable=False)  # 1-12
    evaluation_year = Column(Integer, nullable=False)
    evaluator_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)  # Admin or Senior Trainer
    evaluator_role = Column(String(20), nullable=False)  # 'admin' or 'senior_trainer'
    
    # Evaluation criteria scores (1-10 scale, supports 0.5 increments)
    performance_score = Column(Numeric(3, 1))  # Performance & Results
    motivation_score = Column(Numeric(3, 1))  # Motivation & Energy
    interaction_score = Column(Numeric(3, 1))  # Client Interaction
    knowledge_score = Column(Numeric(3, 1))  # Technical Knowledge
    punctuality_score = Column(Numeric(3, 1))  # Punctuality
    
    # Calculated fields
    weighted_mean = Column(Numeric(5, 4))  # For trainer evaluations with multiple raters
    weighted_sd = Column(Numeric(5, 4))  # Weighted standard deviation
    final_score = Column(Numeric(5, 2))  # Final score out of 10
    
    # Performance classification
    performance_flag = Column(String(10))  # 'green', 'yellow', 'red'
    rater_agreement = Column(String(50))  # Agreement message between raters
    
    # Metadata
    notes = Column(Text)  # Optional notes from evaluator
    submitted_at = Column(DateTime(timezone=True), nullable=False, default=_utcnow)
    finalised = Column(Boolean, nullable=False, default=True)  # Whether evaluation is locked
    is_editable = Column(Boolean, nullable=False, default=True)  # Can be edited within 24h window
    
    created_at = Column(DateTime(timezone=True), nullable=False, default=_utcnow)
    updated_at = Column(DateTime(timezone=True), nullable=False, default=_utcnow, onupdate=_utcnow)

    # Relationships
    trainer = relationship("Trainer", back_populates="evaluations")
    evaluator = relationship("User", foreign_keys=[evaluator_id])

    # Indexes
    __table_args__ = (
        Index('idx_trainer_evaluations_trainer_id', 'trainer_id'),
        Index('idx_trainer_evaluations_evaluator_id', 'evaluator_id'),
        Index('idx_trainer_evaluations_month_year', 'evaluation_month', 'evaluation_year'),
        Index('idx_trainer_evaluations_unique', 'trainer_id', 'evaluation_month', 'evaluation_year', 'evaluator_id', unique=True),
        CheckConstraint('evaluation_month BETWEEN 1 AND 12', name='check_evaluation_month'),
        CheckConstraint('performance_score BETWEEN 1 AND 10', name='check_performance_score_range'),
        CheckConstraint('motivation_score BETWEEN 1 AND 10', name='check_motivation_score_range'),
        CheckConstraint('interaction_score BETWEEN 1 AND 10', name='check_interaction_score_range'),
        CheckConstraint('knowledge_score BETWEEN 1 AND 10', name='check_knowledge_score_range'),
        CheckConstraint('punctuality_score BETWEEN 1 AND 10', name='check_punctuality_score_range'),
    )


# Add evaluations relationship to Trainer model
Trainer.evaluations = relationship("TrainerEvaluation", back_populates="trainer", cascade="all, delete-orphan")


# =============================================================
# EXCURSIONS & EVENTS
# =============================================================

class Excursion(Base):
    __tablename__ = "excursions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(200), nullable=False)
    description = Column(Text)
    location = Column(String(200))
    start_date = Column(DateTime(timezone=True), nullable=False)
    end_date = Column(DateTime(timezone=True), nullable=False)
    max_participants = Column(Integer)
    current_participants = Column(Integer, nullable=False, default=0)
    price = Column(Numeric(10, 2), nullable=False, default=0)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), nullable=False, default=_utcnow)
    updated_at = Column(DateTime(timezone=True), nullable=False, default=_utcnow, onupdate=_utcnow)

    # Indexes
    __table_args__ = (
        Index('idx_excursions_start_date', 'start_date'),
        Index('idx_excursions_active', 'is_active'),
    )


class ExcursionBooking(Base):
    __tablename__ = "excursion_bookings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    excursion_id = Column(UUID(as_uuid=True), ForeignKey("excursions.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    booking_date = Column(DateTime(timezone=True), nullable=False, default=_utcnow)
    status = Column(String(20), nullable=False, default='confirmed')  # confirmed, cancelled, completed
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), nullable=False, default=_utcnow)
    updated_at = Column(DateTime(timezone=True), nullable=False, default=_utcnow, onupdate=_utcnow)

    # Relationships
    excursion = relationship("Excursion")
    user = relationship("User", back_populates="excursion_bookings")

    # Indexes
    __table_args__ = (
        Index('idx_excursion_bookings_excursion_id', 'excursion_id'),
        Index('idx_excursion_bookings_user_id', 'user_id'),
        Index('idx_excursion_bookings_unique', 'excursion_id', 'user_id', unique=True),
    )


# =============================================================
# CLIENT STATUS MANAGEMENT
# =============================================================

class ClientStatus(Base):
    __tablename__ = "client_status"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    client_id = Column(UUID(as_uuid=True), ForeignKey("clients.id", ondelete="CASCADE"), nullable=False, unique=True)
    status = Column(String(50), nullable=False, default='active')  # active, inactive, suspended, trial
    membership_type = Column(String(50))  # basic, premium, elite
    membership_expiry = Column(Date)
    last_active_date = Column(Date)
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), nullable=False, default=_utcnow)
    updated_at = Column(DateTime(timezone=True), nullable=False, default=_utcnow, onupdate=_utcnow)

    # Relationships
    client = relationship("Client", back_populates="client_status")

    # Indexes
    __table_args__ = (
        Index('idx_client_status_client_id', 'client_id'),
        Index('idx_client_status_status', 'status'),
    )


# =============================================================
# SHOP ORDERS (Enhanced)
# =============================================================

class ShopOrder(Base):
    __tablename__ = "shop_orders"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    order_number = Column(String(50), nullable=False, unique=True)
    status = Column(String(50), nullable=False, default='pending')  # pending, processing, shipped, delivered, cancelled
    subtotal = Column(Numeric(10, 2), nullable=False)
    tax_amount = Column(Numeric(10, 2), nullable=False, default=0)
    shipping_amount = Column(Numeric(10, 2), nullable=False, default=0)
    total_amount = Column(Numeric(10, 2), nullable=False)
    currency = Column(String(10), nullable=False, default='JMD')
    shipping_address = Column(JSONB)
    billing_address = Column(JSONB)
    notes = Column(Text)
    shipped_at = Column(DateTime(timezone=True))
    delivered_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), nullable=False, default=_utcnow)
    updated_at = Column(DateTime(timezone=True), nullable=False, default=_utcnow, onupdate=_utcnow)

    # Relationships
    user = relationship("User", back_populates="shop_orders")
    shop_order_items = relationship("ShopOrderItem", back_populates="shop_order", cascade="all, delete-orphan")

    # Indexes
    __table_args__ = (
        Index('idx_shop_orders_user_id', 'user_id'),
        Index('idx_shop_orders_status', 'status'),
        Index('idx_shop_orders_created_at', 'created_at'),
    )


class ShopOrderItem(Base):
    __tablename__ = "shop_order_items"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    shop_order_id = Column(UUID(as_uuid=True), ForeignKey("shop_orders.id", ondelete="CASCADE"), nullable=False)
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id"), nullable=False)
    product_name = Column(String(200), nullable=False)  # Denormalized for order history
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Numeric(10, 2), nullable=False)
    line_total = Column(Numeric(10, 2), nullable=False)
    created_at = Column(DateTime(timezone=True), nullable=False, default=_utcnow)

    # Relationships
    shop_order = relationship("ShopOrder", back_populates="shop_order_items")
    product = relationship("Product")

    # Indexes
    __table_args__ = (
        Index('idx_shop_order_items_order_id', 'shop_order_id'),
        Index('idx_shop_order_items_product_id', 'product_id'),
    )


# =============================================================
# TRAINER GRADES
# =============================================================

class TrainerGrade(Base):
    __tablename__ = "trainer_grades"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    trainer_id = Column(UUID(as_uuid=True), ForeignKey("trainers.id", ondelete="CASCADE"), nullable=False)
    month_index = Column(Integer, nullable=False)  # 0–10 (Jan–Nov)
    scores = Column(JSONB, nullable=False)          # {performance, motivation, interaction, knowledge, punctuality}
    overall_avg = Column(Numeric(4, 2), nullable=False)
    notes = Column(Text)
    submitted_by = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    submitted_at = Column(DateTime(timezone=True), nullable=False, default=_utcnow)
    finalised = Column(Boolean, nullable=False, default=True)

    # Relationships
    trainer = relationship("Trainer", foreign_keys=[trainer_id], back_populates="grades")
    submitter = relationship("User", foreign_keys=[submitted_by])  # senior trainer or admin

    __table_args__ = (
        CheckConstraint('month_index BETWEEN 0 AND 10', name='check_grade_month_index'),
        Index('idx_trainer_grades_trainer_id', 'trainer_id'),
        Index('idx_trainer_grades_submitted_by', 'submitted_by'),
    )

class ShopCartItem(Base):
    """Shopping cart items model"""
    __tablename__ = "shop_cart_items"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    quantity = Column(Integer, nullable=False, default=1)
    added_at = Column(DateTime(timezone=True), nullable=False, default=_utcnow)
    updated_at = Column(DateTime(timezone=True), nullable=False, default=_utcnow, onupdate=_utcnow)

    # Relationships
    user = relationship("User", back_populates="cart_items")
    product = relationship("Product", back_populates="cart_items")

    # Indexes
    __table_args__ = (
        Index('idx_shop_cart_user_id', 'user_id'),
        Index('idx_shop_cart_product_id', 'product_id'),
        Index('idx_shop_cart_unique', 'user_id', 'product_id', unique=True),
    )




