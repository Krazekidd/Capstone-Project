import os
from sqlalchemy import create_engine, Column, String, DateTime, Text, Integer, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import json

# Database configuration
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://ollama_user:ollama_pass@localhost:5432/ollama_chat")

# Create engine
engine = create_engine(DATABASE_URL)

# Create session
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base model
Base = declarative_base()

# Conversation model
class Conversation(Base):
    __tablename__ = "conversations"
    
    id = Column(String, primary_key=True)  # session_id
    title = Column(String, nullable=False)
    user_context = Column(Text)  # JSON string of user metrics
    messages = Column(Text, nullable=False)  # JSON string of messages
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_saved = Column(Boolean, default=False)
    message_count = Column(Integer, default=0)

# Create tables
def create_tables():
    Base.metadata.create_all(bind=engine)

# Get database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Database operations
class ConversationDB:
    @staticmethod
    def save_conversation(session_id: str, title: str, user_context: dict, messages: list, db):
        """Save conversation to database"""
        conversation = Conversation(
            id=session_id,
            title=title,
            user_context=json.dumps(user_context) if user_context else None,
            messages=json.dumps(messages),
            message_count=len(messages),
            is_saved=True
        )
        db.merge(conversation)  # Use merge to handle both create and update
        db.commit()
        return conversation
    
    @staticmethod
    def get_conversation(session_id: str, db):
        """Get conversation from database"""
        return db.query(Conversation).filter(Conversation.id == session_id).first()
    
    @staticmethod
    def get_saved_conversations(db, limit: int = 5):
        """Get all saved conversations (max 5)"""
        return db.query(Conversation).filter(
            Conversation.is_saved == True
        ).order_by(Conversation.updated_at.desc()).limit(limit).all()
    
    @staticmethod
    def delete_conversation(session_id: str, db):
        """Delete conversation from database"""
        conversation = db.query(Conversation).filter(Conversation.id == session_id).first()
        if conversation:
            db.delete(conversation)
            db.commit()
            return True
        return False
    
    @staticmethod
    def load_conversation_to_memory(session_id: str, db, chat_sessions):
        """Load conversation from database to memory"""
        conversation = ConversationDB.get_conversation(session_id, db)
        if conversation:
            messages = json.loads(conversation.messages)
            user_context = json.loads(conversation.user_context) if conversation.user_context else None
            
            chat_sessions[session_id] = {
                "messages": messages,
                "created_at": conversation.created_at,
                "message_count": conversation.message_count,
                "user_context": user_context,
                "title": conversation.title,
                "is_saved": True
            }
            return True
        return False
