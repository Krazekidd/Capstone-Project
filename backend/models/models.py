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
