import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    String, Text, Integer, DateTime, ForeignKey, CheckConstraint
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from database import Base


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
