import uuid
from datetime import datetime, timezone
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from database import Base
from sqlalchemy import Enum,Date, Text, CheckConstraint, Integer, Index, Column, String, Float, Boolean, DateTime, ForeignKey, Enum
from sqlalchemy.sql import func
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
    weight = Column(Float)
    height = Column(Float)
    measurements = Column(Text)  # JSON string
    recorded_at = Column(DateTime, server_default=func.now())
    
    user = relationship("User")

# Create indexes
Index('idx_users_email', User.email)
Index('idx_users_role', User.role)
Index('idx_progress_user_id', ProgressTracking.user_id)
Index('idx_progress_recorded_at', ProgressTracking.recorded_at)