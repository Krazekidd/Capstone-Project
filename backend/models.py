import uuid
from datetime import datetime, timezone
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from database import Base
from sqlalchemy import Enum,Date, Text, CheckConstraint, Integer, Index, Column, String,Numeric,LargeBinary, Float, Boolean,Time, DateTime, ForeignKey, Enum
from sqlalchemy.sql import func
from sqlalchemy.dialects.mysql import JSON
from sqlalchemy.dialects.mysql import BINARY

def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class SavedConversation(Base):
    """One saved chat conversation (up to 5 per session_id)."""

    __tablename__ = "saved_conversations"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    session_id: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False, default="Untitled Chat")
    message_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=_utcnow
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=_utcnow, onupdate=_utcnow
    )

    # Relationship: all messages belonging to this conversation
    messages: Mapped[list["ConversationMessage"]] = relationship(
        "ConversationMessage",
        back_populates="conversation",
        cascade="all, delete-orphan",
        order_by="ConversationMessage.position",
        lazy="select",
    )

    def __repr__(self) -> str:  # pragma: no cover
        return f"<SavedConversation id={self.id} session={self.session_id!r} title={self.title!r}>"


class ConversationMessage(Base):
    """A single message (user or assistant) within a saved conversation."""

    __tablename__ = "conversation_messages"
    __table_args__ = (
        CheckConstraint("role IN ('user', 'assistant', 'system')", name="chk_role"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    conversation_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("saved_conversations.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    role: Mapped[str] = mapped_column(String(20), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    position: Mapped[int] = mapped_column(Integer, nullable=False)  # 0-based ordering
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=_utcnow
    )

    # Back-reference
    conversation: Mapped["SavedConversation"] = relationship(
        "SavedConversation", back_populates="messages"
    )

    def __repr__(self) -> str:  # pragma: no cover
        return f"<ConversationMessage conv={self.conversation_id} pos={self.position} role={self.role!r}>"

def generate_uuid():
    return uuid.uuid4().bytes

class User(Base):
    __tablename__ = "Accounts"
    
    id = Column(BINARY(16), primary_key=True, default=generate_uuid)
    email = Column(String(100), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(Enum('client', 'trainer', 'admin', name='user_roles'), nullable=False)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
    
    client_profile = relationship("Client", back_populates="user", uselist=False, cascade="all, delete-orphan")
    trainer_profile = relationship("Trainer", back_populates="user", uselist=False, cascade="all, delete-orphan")
    admin_profile = relationship("Admin", back_populates="user", uselist=False, cascade="all, delete-orphan")
    progress_entries = relationship("ProgressTracking", back_populates="user", cascade="all, delete-orphan")
    body_measurements = relationship("BodyMeasurement", back_populates="user", cascade="all, delete-orphan")

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
    
    user = relationship("User", back_populates="client_profile")

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
    
    user = relationship("User", back_populates="trainer_profile")

class Admin(Base):
    __tablename__ = "admins"
    
    id = Column(BINARY(16), ForeignKey("Accounts.id"), primary_key=True)
    name = Column(String(100), nullable=False)
    phone_number = Column(String(20))
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
    
    user = relationship("User", back_populates="admin_profile")

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
    
    # Relationship
    user = relationship("User", back_populates="progress_entries")
    
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
    user = relationship("User", back_populates="body_measurements")

# ============================================================
# CLIENT GOALS MODEL
# ============================================================

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
    
    # Relationships
    client = relationship("Client", backref="goals")

# ============================================================
# CLIENT HEALTH CONDITIONS MODEL
# ============================================================

class ClientHealthCondition(Base):
    __tablename__ = "client_health_conditions"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    client_id = Column(LargeBinary(16), ForeignKey("clients.id", ondelete="CASCADE"), nullable=False)
    condition_name = Column(String(50), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    client = relationship("Client", backref="health_conditions")

# ============================================================
# CLIENT WATER INTAKE MODEL
# ============================================================

class ClientWaterIntake(Base):
    __tablename__ = "client_water_intake"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    client_id = Column(LargeBinary(16), ForeignKey("clients.id", ondelete="CASCADE"), nullable=False)
    intake_date = Column(Date, nullable=False)
    cups_consumed = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    client = relationship("Client", backref="water_intake")

# ============================================================
# CLIENT WORKOUT SESSIONS MODEL
# ============================================================

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
    
    # Relationships
    client = relationship("Client", backref="workout_sessions")

# ============================================================
# CLIENT STRENGTH RECORDS MODEL
# ============================================================

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
    
    # Relationships
    client = relationship("Client", backref="strength_records")

# ============================================================
# TRAINER RATINGS MODEL
# ============================================================

class TrainerRating(Base):
    __tablename__ = "trainer_ratings"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    client_id = Column(LargeBinary(16), ForeignKey("clients.id", ondelete="CASCADE"), nullable=False)
    trainer_name = Column(String(100), nullable=False)
    rating = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    client = relationship("Client", backref="trainer_ratings")

# ============================================================
# CLIENT BADGES MODEL
# ============================================================

class ClientBadge(Base):
    __tablename__ = "client_badges"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    client_id = Column(LargeBinary(16), ForeignKey("clients.id", ondelete="CASCADE"), nullable=False)
    badge_name = Column(String(100), nullable=False)
    awarded_date = Column(Date, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    client = relationship("Client", backref="badges")

# ============================================================
# TRAINING SCHEDULE MODEL
# ============================================================

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
    
    # Relationships
    client = relationship("Client", backref="training_schedule")

class PasswordResetToken(Base):
    __tablename__ = "password_reset_tokens"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(BINARY(16), ForeignKey("Accounts.id", ondelete="CASCADE"), nullable=False)
    token = Column(String(255), unique=True, nullable=False, index=True)
    expires_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, server_default=func.now())
    used_at = Column(DateTime, nullable=True)  # Track when token was used
    
    user = relationship("User", backref="reset_tokens")

# Create indexes
Index('idx_users_email', User.email)
Index('idx_users_role', User.role)
Index('idx_progress_user_id', ProgressTracking.user_id)
Index('idx_progress_recorded_at', ProgressTracking.recorded_at)

# ============================================================
# EXCURSION MODELS
# ============================================================

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
    client = relationship("Client", backref="excursion_bookings")
    excursion = relationship("Excursion", back_populates="bookings")

class ExcursionMLScore(Base):
    __tablename__ = "excursion_ml_scores"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    client_id = Column(LargeBinary(16), ForeignKey("clients.id", ondelete="CASCADE"), nullable=False)
    excursion_id = Column(String(50), ForeignKey("excursions.id", ondelete="CASCADE"), nullable=False)
    score = Column(Integer, nullable=False)
    calculated_at = Column(DateTime, default=datetime.utcnow)


# ============================================================
# CONSULTATION MODELS
# ============================================================

class ConsultationType(Base):
    __tablename__ = "consultation_types"
    
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
    __tablename__ = "consultation_bookings"
    
    id = Column(LargeBinary(16), primary_key=True)
    client_id = Column(LargeBinary(16), ForeignKey("clients.id", ondelete="CASCADE"), nullable=False)
    consultation_type_id = Column(String(50), ForeignKey("consultation_types.id"), nullable=False)
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
    client = relationship("Client", backref="consultation_bookings")
    consultation_type = relationship("ConsultationType", back_populates="bookings")

class ConsultationAvailability(Base):
    __tablename__ = "consultation_availability"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    booking_date = Column(Date, nullable=False)
    time_slot = Column(Time, nullable=False)
    is_booked = Column(Boolean, default=False)
    booked_by = Column(LargeBinary(16), ForeignKey("clients.id", ondelete="SET NULL"), nullable=True)
    booking_id = Column(LargeBinary(16), ForeignKey("consultation_bookings.id", ondelete="SET NULL"), nullable=True)
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

# ============================================================
# SHOP MODELS
# ============================================================

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
    client = relationship("Client", backref="cart_items")
    product = relationship("ShopProduct", back_populates="cart_items")

class ShopWishlistItem(Base):
    __tablename__ = "shop_wishlist_items"
    
    id = Column(LargeBinary(16), primary_key=True)
    client_id = Column(LargeBinary(16), ForeignKey("clients.id", ondelete="CASCADE"), nullable=False)
    product_id = Column(String(50), ForeignKey("shop_products.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    client = relationship("Client", backref="wishlist_items")
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
    client = relationship("Client", backref="orders")
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



# ============================================================
# TRAINER ASSESSMENT MODEL (Add if not exists)
# ============================================================

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
    
    # Relationships
    trainer = relationship("Trainer", backref="assessments")

# ============================================================
# CLIENT STATUS MODEL (Add if not exists)
# ============================================================

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
    
    # Relationships
    client = relationship("Client", backref="status_info")
    assigned_trainer = relationship("Trainer", backref="assigned_clients")