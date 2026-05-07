from contextlib import asynccontextmanager
from datetime import datetime, timezone
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from router import router
from routers.auth.auth import router as auth_router
from routers.bookings.booking import router as booking_router
from routers.shop.shop import router as shop_router
from routers.memberships.membership import router as membership_router
from routers.ai.ai import router as ai_router
from routers.misc.conversations import router as conversations_router
from routers.ml.ml.workouts import router as ml_workouts_router
from routers.ml.ml.progress import router as ml_progress_router
from routers.ml.ml.food import router as ml_food_router
from routers.users.account import router as account_router
from routers.users.user_profile import router as user_profile_router
from routers.trainers.trainer_api import router as trainer_api_router
from database import init_db, check_db_connection
from config.config import PROFILE_IMAGES_DIR, PROGRESS_PHOTOS_DIR
import logging
import os

# Configure logging to print to terminal
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[logging.StreamHandler()],  # Print to console/terminal
)

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize database connection and tables on startup."""
    logger.info("🚀 Starting application...")
    
    # Create necessary directories for uploads
    directories_to_create = [
        PROFILE_IMAGES_DIR,
        PROGRESS_PHOTOS_DIR,
        "uploads/avatars"
    ]
    
    for directory in directories_to_create:
        try:
            os.makedirs(directory, exist_ok=True)
            logger.info(f"✅ Created directory: {directory}")
        except Exception as e:
            logger.error(f"❌ Failed to create directory {directory}: {e}")
    
    # Check database connection first
    if not await check_db_connection():
        logger.error("❌ Failed to connect to database. Application startup aborted.")
        raise Exception("Database connection failed")
    
    # Initialize database tables
    await init_db()
    logger.info("✅ Application started successfully")
    yield
    logger.info("👋 Shutting down application...")


app = FastAPI(
    title="Gym AI Recommender",
    version="1.0.0",
    description="FastAPI app for Jamaican meal recommendations using OpenRouter's AI models",
    lifespan=lifespan,
)

# Add CORS middleware with proper configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vite dev server
        "http://127.0.0.1:5173",  # Vite dev server (alternative)
        "https://gym-capstone-app.vercel.app",  # Production Vercel URL
        "http://localhost:3000",
        "http://localhost:8000",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
)


# Include all routes
app.include_router(router, tags=["api"])
app.include_router(auth_router)
app.include_router(account_router)
app.include_router(user_profile_router)
app.include_router(trainer_api_router)
app.include_router(booking_router)
app.include_router(shop_router)
app.include_router(membership_router)
app.include_router(ai_router)
app.include_router(conversations_router)
app.include_router(ml_workouts_router)
app.include_router(ml_progress_router)
app.include_router(ml_food_router)

# Mount static directories for image serving
if os.path.exists(PROFILE_IMAGES_DIR):
    app.mount("/profile_images", StaticFiles(directory=PROFILE_IMAGES_DIR), name="profile_images")
    logger.info(f"Mounted profile images directory: {PROFILE_IMAGES_DIR}")

if os.path.exists(PROGRESS_PHOTOS_DIR):
    app.mount("/progress_photos", StaticFiles(directory=PROGRESS_PHOTOS_DIR), name="progress_photos")
    logger.info(f"Mounted progress photos directory: {PROGRESS_PHOTOS_DIR}")


@app.get("startup")
async def startup():
    await init_db()


@app.get("/")
async def root():
    return {"message": "B.A.D People Fitness API", "status": "running"}


@app.get("/health")
async def health_check():
    """Health check endpoint that also verifies database connection."""
    db_status = "healthy" if await check_db_connection() else "unhealthy"
    return {
        "status": "healthy",
        "database": db_status,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }


if __name__ == "__main__":
    import uvicorn
    from config import HOST, PORT

    uvicorn.run("main:app", host=HOST, port=PORT, reload=True)
