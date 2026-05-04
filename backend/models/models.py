import uuid
import json
from datetime import datetime, timezone
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID, JSONB, CITEXT, INET
from sqlalchemy.dialects.mysql import BINARY, JSON
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
    LargeBinary,
)
from sqlalchemy.sql import func
from database import Base


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)

# =============================================================
# ENUMS
# =============================================================

membership_tier_enum = Enum('basic', 'pro', 'elite', name='membership_tier')
membership_status_enum = Enum('active', 'inactive', 'suspended', 'cancelled', name='membership_status')
consultation_format_enum = Enum('in_person', 'video_call', name='consultation_format')
booking_status_enum = Enum('pending', 'confirmed', 'cancelled', 'completed', 'no_show', name='booking_status')
product_category_enum = Enum('merch', 'essentials', 'supplements', name='product_category')
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
    is_email_verified = Column(Boolean, nullable=False, default=False)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), nullable=False, default=_utcnow)
    updated_at = Column(DateTime(timezone=True), nullable=False, default=_utcnow, onupdate=_utcnow)

    # Relationships
    auth_tokens = relationship("AuthToken", back_populates="user", cascade="all, delete-orphan")
    user_memberships = relationship("UserMembership", back_populates="user", cascade="all, delete-orphan")
    bookings = relationship("Booking", back_populates="user", cascade="all, delete-orphan")
    orders = relationship("Order", back_populates="user", cascade="all, delete-orphan")
    product_reviews = relationship("ProductReview", back_populates="user", cascade="all, delete-orphan")
    wishlists = relationship("Wishlist", back_populates="user", cascade="all, delete-orphan")


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
    order_items = relationship("OrderItem", back_populates="product")
    wishlists = relationship("Wishlist", back_populates="product", cascade="all, delete-orphan")

    # Indexes
    __table_args__ = (
        Index('idx_products_category', 'category'),
        Index('idx_products_is_active', 'is_active'),
    )


class Order(Base):
    __tablename__ = "orders"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    reference = Column(String(20), nullable=False, unique=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    status = Column(order_status_enum, nullable=False, default='pending')
    subtotal = Column(Numeric(10, 2), nullable=False)
    shipping_fee = Column(Numeric(10, 2), nullable=False, default=0)
    discount = Column(Numeric(10, 2), nullable=False, default=0)
    total = Column(Numeric(10, 2), nullable=False)
    currency = Column(String(10), nullable=False, default='JMD')
    shipping_address = Column(JSONB)
    notes = Column(Text)
    placed_at = Column(DateTime(timezone=True), nullable=False, default=_utcnow)
    paid_at = Column(DateTime(timezone=True))
    shipped_at = Column(DateTime(timezone=True))
    delivered_at = Column(DateTime(timezone=True))
    updated_at = Column(DateTime(timezone=True), nullable=False, default=_utcnow, onupdate=_utcnow)

    # Relationships
    user = relationship("User", back_populates="orders")
    order_items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")

    # Indexes
    __table_args__ = (
        Index('idx_orders_user_id', 'user_id'),
        Index('idx_orders_status', 'status'),
    )


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    order_id = Column(UUID(as_uuid=True), ForeignKey("orders.id", ondelete="CASCADE"), nullable=False)
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Numeric(10, 2), nullable=False)
    line_total = Column(Numeric(10, 2), nullable=False)

    # Relationships
    order = relationship("Order", back_populates="order_items")
    product = relationship("Product", back_populates="order_items")

    # Indexes
    __table_args__ = (
        Index('idx_order_items_order_id', 'order_id'),
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

class Wishlist(Base):
    __tablename__ = "wishlists"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    added_at = Column(DateTime(timezone=True), nullable=False, default=_utcnow)

    # Relationships
    user = relationship("User", back_populates="wishlists")
    product = relationship("Product", back_populates="wishlists")

    # Constraints
    __table_args__ = (
        Index('idx_wishlists_user_id', 'user_id'),
        Index('idx_wishlists_unique', 'user_id', 'product_id', unique=True),
    )


# =============================================================
# CONVERSATIONS
# =============================================================

class SavedConversation(Base):
    __tablename__ = "saved_conversations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id = Column(String(255), nullable=False, index=True)
    title = Column(String(255), nullable=False, default="Untitled Chat")
    message_count = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime(timezone=True), nullable=False, default=_utcnow)
    updated_at = Column(DateTime(timezone=True), nullable=False, default=_utcnow, onupdate=_utcnow)

    # Relationships
    messages = relationship("ConversationMessage", back_populates="conversation", cascade="all, delete-orphan")

    # Indexes
    __table_args__ = (
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
# LEGACY USER SYSTEM (from main models.py)
# =============================================================

def generate_uuid():
    return uuid.uuid4().bytes


class LegacyUser(Base):
    """Legacy user system for compatibility with existing tables"""
    __tablename__ = "Accounts"
    
    id = Column(BINARY(16), primary_key=True, default=generate_uuid)
    email = Column(String(100), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(Enum('client', 'trainer', 'admin', name='user_roles'), nullable=False)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
    
    # Relationships
    client_profile = relationship("Client", back_populates="user", uselist=False, cascade="all, delete-orphan")
    trainer_profile = relationship("Trainer", back_populates="user", uselist=False, cascade="all, delete-orphan")
    admin_profile = relationship("Admin", back_populates="user", uselist=False, cascade="all, delete-orphan")
    progress_entries = relationship("ProgressTracking", back_populates="user", cascade="all, delete-orphan")
    body_measurements = relationship("BodyMeasurement", back_populates="user", cascade="all, delete-orphan")
    reset_tokens = relationship("PasswordResetToken", backref="user")


class Client(Base):
    __tablename__ = "clients"
    
    id = Column(BINARY(16), ForeignKey("Accounts.id"), primary_key=True)
    name = Column(String(100), nullable=False)
    phone_number = Column(String(20))
    height = Column(Float)
    weight = Column(Float)
    birthday = Column(Date, nullable=True)
    gender = Column(String(10), nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
    
    # Relationships
    user = relationship("LegacyUser", back_populates="client_profile")
    goals = relationship("ClientGoal", backref="client")
    health_conditions = relationship("ClientHealthCondition", backref="client")
    water_intake = relationship("ClientWaterIntake", backref="client")
    workout_sessions = relationship("ClientWorkoutSession", backref="client")
    strength_records = relationship("ClientStrengthRecord", backref="client")
    trainer_ratings = relationship("TrainerRating", backref="client")
    badges = relationship("ClientBadge", backref="client")
    training_schedule = relationship("TrainingSchedule", backref="client")
    excursion_bookings = relationship("ExcursionBooking", backref="client")
    consultation_bookings = relationship("ConsultationBooking", backref="client")
    cart_items = relationship("ShopCartItem", backref="client")
    wishlist_items = relationship("ShopWishlistItem", backref="client")
    orders = relationship("ShopOrder", backref="client")
    status_info = relationship("ClientStatus", backref="client")


class Trainer(Base):
    __tablename__ = "trainers"
    
    id = Column(BINARY(16), ForeignKey("Accounts.id"), primary_key=True)
    name = Column(String(100), nullable=False)
    certification = Column(String(100))
    rating = Column(Float, default=0)
    trainer_level = Column(Float, default=1)
    is_senior = Column(Boolean, default=False)
    birthday = Column(Date, nullable=True)
    specialisation = Column(String(100), nullable=True)
    years_experience = Column(Integer, nullable=True)
    sessions_attended = Column(Integer, default=0)
    sessions_completed = Column(Integer, default=0)
    attendance_rate = Column(Float, default=0.0)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
    
    # Relationships
    user = relationship("LegacyUser", back_populates="trainer_profile")
    assessments = relationship("TrainerAssessment", backref="trainer")
    assigned_clients = relationship("ClientStatus", backref="assigned_trainer")


class Admin(Base):
    __tablename__ = "admins"
    
    id = Column(BINARY(16), ForeignKey("Accounts.id"), primary_key=True)
    name = Column(String(100), nullable=False)
    phone_number = Column(String(20))
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
    
    # Relationships
    user = relationship("LegacyUser", back_populates="admin_profile")


# =============================================================
# PROGRESS TRACKING
# =============================================================

class ProgressTracking(Base):
    __tablename__ = "progress_tracking"
    
    id = Column(BINARY(16), primary_key=True, default=generate_uuid)
    user_id = Column(BINARY(16), ForeignKey("Accounts.id"), nullable=False)
    weight = Column(Float, nullable=True)
    height = Column(Float, nullable=True)
    measurements = Column(Text, nullable=True)  # JSON string with all measurements
    recorded_at = Column(DateTime, server_default=func.now())
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
    
    # Relationships
    user = relationship("LegacyUser", back_populates="progress_entries")
    
    def set_measurements(self, data):
        """Store measurements as JSON string"""
        if data:
            self.measurements = json.dumps(data)
        else:
            self.measurements = None
    
    def get_measurements(self):
        """Retrieve measurements as dictionary"""
        if self.measurements:
            return json.loads(self.measurements)
        return {}


class BodyMeasurement(Base):
    __tablename__ = "body_measurements"
    
    id = Column(BINARY(16), primary_key=True, default=generate_uuid)
    user_id = Column(BINARY(16), ForeignKey("Accounts.id"), nullable=False)
    recorded_at = Column(DateTime, server_default=func.now())
    
    # Body basics
    weight = Column(Float, nullable=True)
    height = Column(Float, nullable=True)
    body_fat = Column(Float, nullable=True)
    
    # Upper body
    chest = Column(Float, nullable=True)
    waist = Column(Float, nullable=True)
    shoulders = Column(Float, nullable=True)
    arm_left = Column(Float, nullable=True)
    arm_right = Column(Float, nullable=True)
    neck = Column(Float, nullable=True)
    
    # Lower body
    hips = Column(Float, nullable=True)
    thigh_left = Column(Float, nullable=True)
    thigh_right = Column(Float, nullable=True)
    calf_left = Column(Float, nullable=True)
    calf_right = Column(Float, nullable=True)
    glutes = Column(Float, nullable=True)
    
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
    
    # Relationships
    user = relationship("LegacyUser", back_populates="body_measurements")


# =============================================================
# CLIENT GOALS & HEALTH
# =============================================================

class ClientGoal(Base):
    __tablename__ = "client_goals"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    client_id = Column(LargeBinary(16), ForeignKey("clients.id", ondelete="CASCADE"), nullable=False)
    goal_type = Column(String(50), default="Bulk Up")
    primary_goal = Column(String(100))
    target_weight_kg = Column(Numeric(5,1))
    target_chest_cm = Column(Numeric(5,1))
    target_waist_cm = Column(Numeric(5,1))
    target_hips_cm = Column(Numeric(5,1))
    target_thigh_cm = Column(Numeric(5,1))
    target_arm_cm = Column(Numeric(5,1))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class ClientHealthCondition(Base):
    __tablename__ = "client_health_conditions"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    client_id = Column(LargeBinary(16), ForeignKey("clients.id", ondelete="CASCADE"), nullable=False)
    condition_name = Column(String(50), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class ClientWaterIntake(Base):
    __tablename__ = "client_water_intake"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    client_id = Column(LargeBinary(16), ForeignKey("clients.id", ondelete="CASCADE"), nullable=False)
    intake_date = Column(Date, nullable=False)
    cups_consumed = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class ClientWorkoutSession(Base):
    __tablename__ = "client_workout_sessions"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    client_id = Column(LargeBinary(16), ForeignKey("clients.id", ondelete="CASCADE"), nullable=False)
    session_date = Column(Date, nullable=False)
    session_type = Column(String(50))
    duration_minutes = Column(Integer)
    calories_burned = Column(Integer)
    avg_heart_rate = Column(Integer)
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)


class ClientStrengthRecord(Base):
    __tablename__ = "client_strength_records"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    client_id = Column(LargeBinary(16), ForeignKey("clients.id", ondelete="CASCADE"), nullable=False)
    exercise_name = Column(String(50), nullable=False)
    current_weight_kg = Column(Numeric(5,1))
    goal_weight_kg = Column(Numeric(5,1))
    current_reps = Column(Integer)
    goal_reps = Column(Integer)
    percentage_progress = Column(Integer)
    record_date = Column(Date)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class TrainerRating(Base):
    __tablename__ = "trainer_ratings"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    client_id = Column(LargeBinary(16), ForeignKey("clients.id", ondelete="CASCADE"), nullable=False)
    trainer_name = Column(String(100), nullable=False)
    rating = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)


class ClientBadge(Base):
    __tablename__ = "client_badges"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    client_id = Column(LargeBinary(16), ForeignKey("clients.id", ondelete="CASCADE"), nullable=False)
    badge_name = Column(String(100), nullable=False)
    awarded_date = Column(Date, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class TrainingSchedule(Base):
    __tablename__ = "training_schedule"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    client_id = Column(LargeBinary(16), ForeignKey("clients.id", ondelete="CASCADE"), nullable=False)
    day_of_week = Column(String(10))
    day_number = Column(Integer)
    session_name = Column(String(100))
    session_time = Column(Time)
    has_session = Column(Boolean, default=False)
    is_today = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


# =============================================================
# PASSWORD RESET
# =============================================================

class PasswordResetToken(Base):
    __tablename__ = "password_reset_tokens"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(BINARY(16), ForeignKey("Accounts.id", ondelete="CASCADE"), nullable=False)
    token = Column(String(255), unique=True, nullable=False, index=True)
    expires_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, server_default=func.now())
    used_at = Column(DateTime, nullable=True)  # Track when token was used


# =============================================================
# EXCURSION SYSTEM
# =============================================================

class Excursion(Base):
    __tablename__ = "excursions"
    
    id = Column(String(50), primary_key=True)
    name = Column(String(255), nullable=False)
    location = Column(String(255), nullable=False)
    level = Column(String(20), nullable=False)
    level_label = Column(String(20), nullable=False)
    date = Column(Date, nullable=False)
    time = Column(Time, nullable=False)
    duration = Column(String(50), nullable=False)
    spots = Column(Integer, nullable=False, default=0)
    spots_left = Column(Integer, nullable=False, default=0)
    cost = Column(Numeric(10,2), nullable=False)
    img_url = Column(String(500))
    thumb_url = Column(String(500))
    map_url = Column(String(500))
    description = Column(Text)
    guide = Column(String(100))
    meetup_point = Column(String(255))
    min_bmi = Column(Integer, default=15)
    max_bmi = Column(Integer, default=40)
    min_level = Column(String(20), default="beginner")
    required_tenure_months = Column(Integer, default=0)
    difficulty = Column(Integer, default=1)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    tags = relationship("ExcursionTag", back_populates="excursion", cascade="all, delete-orphan")
    bring_items = relationship("ExcursionBringItem", back_populates="excursion", cascade="all, delete-orphan")
    bookings = relationship("ExcursionBooking", back_populates="excursion")
    
    # Property to easily access bring items as list
    @property
    def what_to_bring(self):
        """Property to get bring items as a list of strings"""
        return [item.item_name for item in self.bring_items]


class ExcursionTag(Base):
    __tablename__ = "excursion_tags"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    excursion_id = Column(String(50), ForeignKey("excursions.id", ondelete="CASCADE"), nullable=False)
    tag_name = Column(String(50), nullable=False)
    
    # Relationships
    excursion = relationship("Excursion", back_populates="tags")


class ExcursionBringItem(Base):
    __tablename__ = "excursion_bring_items"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    excursion_id = Column(String(50), ForeignKey("excursions.id", ondelete="CASCADE"), nullable=False)
    item_name = Column(String(255), nullable=False)
    display_order = Column(Integer, default=0)
    
    # Relationships
    excursion = relationship("Excursion", back_populates="bring_items")


class ExcursionBooking(Base):
    __tablename__ = "excursion_bookings"
    
    id = Column(LargeBinary(16), primary_key=True)
    client_id = Column(LargeBinary(16), ForeignKey("clients.id", ondelete="CASCADE"), nullable=False)
    excursion_id = Column(String(50), ForeignKey("excursions.id", ondelete="RESTRICT"), nullable=False)
    booking_reference = Column(String(50), unique=True, nullable=False)
    booked_for_name = Column(String(255), nullable=False)
    booked_for_email = Column(String(255), nullable=False)
    booked_for_phone = Column(String(50), nullable=False)
    special_notes = Column(Text)
    payment_method = Column(String(50), default="online")
    payment_status = Column(String(50), default="pending")
    booking_status = Column(String(50), default="confirmed")
    total_amount = Column(Numeric(10,2), nullable=False)
    booked_at = Column(DateTime, default=datetime.utcnow)
    cancelled_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    excursion = relationship("Excursion", back_populates="bookings")


class ExcursionMLScore(Base):
    __tablename__ = "excursion_ml_scores"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    client_id = Column(LargeBinary(16), ForeignKey("clients.id", ondelete="CASCADE"), nullable=False)
    excursion_id = Column(String(50), ForeignKey("excursions.id", ondelete="CASCADE"), nullable=False)
    score = Column(Integer, nullable=False)
    calculated_at = Column(DateTime, default=datetime.utcnow)


# =============================================================
# LEGACY CONSULTATION SYSTEM
# =============================================================

class LegacyConsultationType(Base):
    __tablename__ = "legacy_consultation_types"
    
    id = Column(String(50), primary_key=True)
    icon = Column(String(10))
    title = Column(String(100), nullable=False)
    subtitle = Column(String(200))
    duration_minutes = Column(Integer, nullable=False)
    price = Column(Numeric(10,2), nullable=False)
    price_display = Column(String(50), nullable=False)
    badge_text = Column(String(50))
    badge_color = Column(String(20))
    description = Column(Text)
    coach_description = Column(String(200))
    img_url = Column(String(500))
    includes = Column(JSON)
    is_active = Column(Boolean, default=True)
    display_order = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    bookings = relationship("ConsultationBooking", back_populates="consultation_type")


class ConsultationBooking(Base):
    __tablename__ = "legacy_consultation_bookings"
    
    id = Column(LargeBinary(16), primary_key=True)
    client_id = Column(LargeBinary(16), ForeignKey("clients.id", ondelete="CASCADE"), nullable=False)
    consultation_type_id = Column(String(50), ForeignKey("legacy_consultation_types.id"), nullable=False)
    booking_reference = Column(String(50), unique=True, nullable=False)
    booking_date = Column(Date, nullable=False)
    booking_time = Column(Time, nullable=False)
    session_format = Column(String(20), default="in-person")
    status = Column(String(20), default="confirmed")
    notes = Column(Text)
    client_name = Column(String(255), nullable=False)
    client_email = Column(String(255), nullable=False)
    cancelled_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    consultation_type = relationship("LegacyConsultationType", back_populates="bookings")


class ConsultationAvailability(Base):
    __tablename__ = "consultation_availability"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    booking_date = Column(Date, nullable=False)
    time_slot = Column(Time, nullable=False)
    is_booked = Column(Boolean, default=False)
    booked_by = Column(LargeBinary(16), ForeignKey("clients.id", ondelete="SET NULL"), nullable=True)
    booking_id = Column(LargeBinary(16), ForeignKey("legacy_consultation_bookings.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class BusinessHours(Base):
    __tablename__ = "business_hours"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    day_of_week = Column(Integer, nullable=False)
    is_open = Column(Boolean, default=True)
    start_time = Column(Time, nullable=True)
    end_time = Column(Time, nullable=True)
    slot_interval_minutes = Column(Integer, default=60)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Holiday(Base):
    __tablename__ = "holidays"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    holiday_date = Column(Date, nullable=False, unique=True)
    name = Column(String(100))
    is_closed = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)


# =============================================================
# LEGACY SHOP SYSTEM
# =============================================================

class ShopCategory(Base):
    __tablename__ = "shop_categories"
    
    id = Column(String(50), primary_key=True)
    name = Column(String(100), nullable=False)
    display_name = Column(String(100), nullable=False)
    icon = Column(String(10))
    display_order = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    products = relationship("ShopProduct", back_populates="category")


class ShopProduct(Base):
    __tablename__ = "shop_products"
    
    id = Column(String(50), primary_key=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    price = Column(Numeric(10,2), nullable=False)
    category_id = Column(String(50), ForeignKey("shop_categories.id"), nullable=False)
    image_url = Column(String(500))
    badge_text = Column(String(100))
    badge_color = Column(String(20))
    rating = Column(Numeric(2,1), default=4.5)
    review_count = Column(Integer, default=0)
    stock_quantity = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    featured = Column(Boolean, default=False)
    display_order = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    category = relationship("ShopCategory", back_populates="products")
    cart_items = relationship("ShopCartItem", back_populates="product")
    wishlist_items = relationship("ShopWishlistItem", back_populates="product")
    order_items = relationship("ShopOrderItem", back_populates="product")


class ShopCartItem(Base):
    __tablename__ = "shop_cart_items"
    
    id = Column(LargeBinary(16), primary_key=True)
    client_id = Column(LargeBinary(16), ForeignKey("clients.id", ondelete="CASCADE"), nullable=False)
    product_id = Column(String(50), ForeignKey("shop_products.id", ondelete="CASCADE"), nullable=False)
    quantity = Column(Integer, nullable=False, default=1)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    product = relationship("ShopProduct", back_populates="cart_items")


class ShopWishlistItem(Base):
    __tablename__ = "shop_wishlist_items"
    
    id = Column(LargeBinary(16), primary_key=True)
    client_id = Column(LargeBinary(16), ForeignKey("clients.id", ondelete="CASCADE"), nullable=False)
    product_id = Column(String(50), ForeignKey("shop_products.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    product = relationship("ShopProduct", back_populates="wishlist_items")


class ShopOrder(Base):
    __tablename__ = "shop_orders"
    
    id = Column(LargeBinary(16), primary_key=True)
    order_reference = Column(String(50), unique=True, nullable=False)
    client_id = Column(LargeBinary(16), ForeignKey("clients.id", ondelete="CASCADE"), nullable=False)
    order_status = Column(String(50), default="pending")
    payment_status = Column(String(50), default="pending")
    payment_method = Column(String(50), default="card")
    subtotal = Column(Numeric(10,2), nullable=False)
    tax = Column(Numeric(10,2), nullable=False)
    shipping_cost = Column(Numeric(10,2), nullable=False)
    total = Column(Numeric(10,2), nullable=False)
    shipping_address = Column(Text, nullable=False)
    city = Column(String(100), nullable=False)
    phone = Column(String(50), nullable=False)
    email = Column(String(255), nullable=False)
    customer_name = Column(String(255), nullable=False)
    notes = Column(Text)
    placed_at = Column(DateTime, default=datetime.utcnow)
    delivered_at = Column(DateTime, nullable=True)
    cancelled_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    items = relationship("ShopOrderItem", back_populates="order", cascade="all, delete-orphan")


class ShopOrderItem(Base):
    __tablename__ = "shop_order_items"
    
    id = Column(LargeBinary(16), primary_key=True)
    order_id = Column(LargeBinary(16), ForeignKey("shop_orders.id", ondelete="CASCADE"), nullable=False)
    product_id = Column(String(50), ForeignKey("shop_products.id", ondelete="RESTRICT"), nullable=False)
    product_name = Column(String(255), nullable=False)
    product_price = Column(Numeric(10,2), nullable=False)
    quantity = Column(Integer, nullable=False)
    total = Column(Numeric(10,2), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    order = relationship("ShopOrder", back_populates="items")
    product = relationship("ShopProduct", back_populates="order_items")


# =============================================================
# TRAINER ASSESSMENT SYSTEM
# =============================================================

class TrainerAssessment(Base):
    __tablename__ = "trainer_assessments"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    trainer_id = Column(LargeBinary(16), ForeignKey("trainers.id", ondelete="CASCADE"), nullable=False)
    trainer_name = Column(String(100), nullable=False)
    performance_score = Column(Numeric(3,1), default=0)
    motivation_score = Column(Numeric(3,1), default=0)
    interaction_score = Column(Numeric(3,1), default=0)
    knowledge_score = Column(Numeric(3,1), default=0)
    punctuality_score = Column(Numeric(3,1), default=0)
    average_score = Column(Numeric(3,1), default=0)
    standing = Column(String(20))
    assessment_date = Column(Date, nullable=False)
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)


# =============================================================
# CLIENT STATUS SYSTEM
# =============================================================

class ClientStatus(Base):
    __tablename__ = "client_status"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    client_id = Column(LargeBinary(16), ForeignKey("clients.id", ondelete="CASCADE"), nullable=False, unique=True)
    status = Column(String(20), default="Active")
    last_visit = Column(Date, nullable=True)
    membership_plan = Column(String(50), default="Standard")
    assigned_trainer_id = Column(LargeBinary(16), ForeignKey("trainers.id", ondelete="SET NULL"), nullable=True)
    fitness_goal = Column(String(100))
    progress_percentage = Column(Integer, default=0)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


# Create indexes for legacy system
Index('idx_users_email', LegacyUser.email)
Index('idx_users_role', LegacyUser.role)
Index('idx_progress_user_id', ProgressTracking.user_id)
Index('idx_progress_recorded_at', ProgressTracking.recorded_at)
