"""
conversations_router.py
-----------------------
CRUD endpoints for persisted saved conversations.

Rules:
  - Each session_id may save at most 5 conversations.
  - Attempting to save a 6th returns HTTP 409 Conflict.
  - Deleting a conversation frees up a slot.
  - Loading a conversation returns full message history.
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, delete
from sqlalchemy.orm import selectinload

from database import get_db
from models import SavedConversation, ConversationMessage
from schemas import (
    SaveConversationRequest,
    SavedConversationOut,
    ConversationDetailOut,
)
from utils import chat_sessions

router = APIRouter(prefix="/conversations", tags=["conversations"])

MAX_SAVED_CONVERSATIONS = 5


# ---------------------------------------------------------------------------
# GET /conversations?session_id=<id>
#   List all saved conversations for a session (newest first).
# ---------------------------------------------------------------------------
@router.get("", response_model=list[SavedConversationOut])
async def list_conversations(
    session_id: str = Query(..., description="The chat session identifier"),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(SavedConversation)
        .where(SavedConversation.session_id == session_id)
        .order_by(SavedConversation.created_at.desc())
    )
    conversations = result.scalars().all()
    return conversations


# ---------------------------------------------------------------------------
# POST /conversations/save
#   Persist the current in-memory session as a named conversation.
#   Enforces the 5-conversation limit per session_id.
# ---------------------------------------------------------------------------
@router.post("/save", response_model=SavedConversationOut, status_code=201)
async def save_conversation(
    request: SaveConversationRequest,
    db: AsyncSession = Depends(get_db),
):
    session_id = request.session_id

    # --- Enforce max limit ---
    count_result = await db.execute(
        select(func.count()).where(SavedConversation.session_id == session_id)
    )
    current_count = count_result.scalar_one()

    if current_count >= MAX_SAVED_CONVERSATIONS:
        raise HTTPException(
            status_code=409,
            detail=(
                f"You have reached the maximum of {MAX_SAVED_CONVERSATIONS} saved "
                "conversations. Please delete one before saving a new chat."
            ),
        )

    # --- Fetch messages from in-memory session ---
    if session_id not in chat_sessions:
        raise HTTPException(
            status_code=404,
            detail="No active chat session found. Start a conversation first.",
        )

    session = chat_sessions[session_id]
    messages = session.get("messages", [])

    if not messages:
        raise HTTPException(
            status_code=400,
            detail="The chat session has no messages to save.",
        )

    # --- Persist conversation ---
    conversation = SavedConversation(
        session_id=session_id,
        title=request.title or "Untitled Chat",
        message_count=len(messages),
    )
    db.add(conversation)
    await db.flush()  # populate conversation.id before inserting messages

    for i, msg in enumerate(messages):
        db.add(
            ConversationMessage(
                conversation_id=conversation.id,
                role=msg["role"],
                content=msg["content"],
                position=i,
            )
        )

    await db.commit()
    await db.refresh(conversation)

    print(f"💾 Saved conversation '{conversation.title}' (id={conversation.id}) for session '{session_id}'")
    return conversation


# ---------------------------------------------------------------------------
# GET /conversations/{conversation_id}
#   Load the full message history of a saved conversation.
# ---------------------------------------------------------------------------
@router.get("/{conversation_id}", response_model=ConversationDetailOut)
async def get_conversation(
    conversation_id: str,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(SavedConversation)
        .options(selectinload(SavedConversation.messages))
        .where(SavedConversation.id == conversation_id)
    )
    conversation = result.scalar_one_or_none()

    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found.")

    return conversation


# ---------------------------------------------------------------------------
# DELETE /conversations/{conversation_id}
#   Remove a saved conversation (and all its messages via CASCADE).
# ---------------------------------------------------------------------------
@router.delete("/{conversation_id}")
async def delete_conversation(
    conversation_id: str,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(SavedConversation).where(SavedConversation.id == conversation_id)
    )
    conversation = result.scalar_one_or_none()

    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found.")

    await db.execute(
        delete(SavedConversation).where(SavedConversation.id == conversation_id)
    )
    await db.commit()

    print(f"🗑️ Deleted conversation id={conversation_id}")
    return {"message": "Conversation deleted successfully."}
