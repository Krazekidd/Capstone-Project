from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy import text
from config.config import DATABASE_URL
import logging
from config.config import settings

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Engine & Session factory
# ---------------------------------------------------------------------------
engine = create_async_engine(
    DATABASE_URL,
    echo=False,  # Set True to log SQL statements during development
    future=True,
    pool_pre_ping=True,  # Checks connections before use; handles DB restarts
    pool_size=5,
    max_overflow=10,
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


# ---------------------------------------------------------------------------
# Declarative Base (shared by all ORM models)
# ---------------------------------------------------------------------------
class Base(DeclarativeBase):
    pass


# ---------------------------------------------------------------------------
# FastAPI dependency – yields an AsyncSession per request
# ---------------------------------------------------------------------------
async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise




# ---------------------------------------------------------------------------
# Startup helper – creates tables if they don't already exist
# ---------------------------------------------------------------------------
async def init_db():
    # Import models so SQLAlchemy registers them against Base.metadata
    from models import (
        SavedConversation, ConversationMessage
    )  # noqa: F401

    async with engine.begin() as conn:
        # Create citext extension if it doesn't exist
        try:
            await conn.execute(text("CREATE EXTENSION IF NOT EXISTS citext"))
            logger.info("✅ citext extension enabled")
        except Exception as e:
            logger.warning(f"⚠️  Could not create citext extension: {e}")
        
        await conn.run_sync(Base.metadata.create_all)
        logger.info("✅ Database tables initialised")


# User database
# Create async engine
userEngine = create_async_engine(
    settings.DATABASE_URL, echo=True, future=True  # Set to False in production
)

# Create async session factory
AsyncSessionLocal = async_sessionmaker(
    userEngine, class_=AsyncSession, expire_on_commit=False
)


# Dependency to get DB session
async def get_user_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
