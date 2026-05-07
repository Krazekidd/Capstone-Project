from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy import text
from config import DATABASE_URL
import logging
from config import settings

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


# User database engine
userEngine = create_async_engine(
    settings.DATABASE_URL, echo=False, future=True
)

UserAsyncSessionLocal = async_sessionmaker(
    userEngine, class_=AsyncSession, expire_on_commit=False
)


# Dependency to get DB session
async def get_user_db():
    async with UserAsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


# ---------------------------------------------------------------------------
# Database connection check
# ---------------------------------------------------------------------------
async def check_db_connection():
    """Check if database connection is working."""
    try:
        async with engine.begin() as conn:
            result = await conn.execute(text("SELECT 1"))
            logger.info("✅ Database connection successful")
            return True
    except Exception as e:
        logger.error(f"❌ Database connection failed: {e}")
        return False


# ---------------------------------------------------------------------------
# Startup helper – creates tables if they don't already exist
# ---------------------------------------------------------------------------
async def init_db():
    """Initialize database connection and create tables if they don't exist."""
    # Import models so SQLAlchemy registers them against Base.metadata
    from models import (
        User, AuthToken, MembershipPlan, UserMembership, Coach,
        CoachAvailabilitySchedule, CoachAvailabilityOverride,
        ConsultationType, Booking, Product, Order, OrderItem,
        ProductReview, Wishlist, SavedConversation, ConversationMessage,
        Attendance, BodyMeasurement, ProgressPhoto, NutritionPlan, 
        NutritionGoals, ActivityData, TrainingSchedule, ClientBadge,
        Client, Trainer, Admin, ClientGoal, ClientHealthCondition,
        ClientWaterIntake, ClientStrengthRecord, TrainerRating,
        TrainerAssessment, Excursion, ExcursionBooking, ClientStatus,
        ShopOrder, ShopOrderItem
    )  # noqa: F401

    async with engine.begin() as conn:
        # Create citext extension if it doesn't exist
        try:
            await conn.execute(text("CREATE EXTENSION IF NOT EXISTS citext"))
            logger.info("✅ citext extension enabled")
        except Exception as e:
            logger.warning(f"⚠️  Could not create citext extension: {e}")
        
        # Create all tables that don't exist yet
        await conn.run_sync(Base.metadata.create_all)
        logger.info("✅ Database tables initialized/checked")
