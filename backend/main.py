from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from router import router
from routers.auth.auth import router as auth_router
from routers.bookings.booking import router as booking_router
from routers.shop.shop import router as shop_router
from routers.memberships.membership import router as membership_router
from routers.ai.ai import router as ai_router
from database import init_db
from database import engine, Base
import logging

# Configure logging to print to terminal
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[logging.StreamHandler()],  # Print to console/terminal
)

logger = logging.getLogger(__name__)


# Create tables (for development only - use Alembic for production)
async def init_db1():
    async with engine.begin() as conn:
        # await conn.run_sync(Base.metadata.drop_all)  # Uncomment to drop tables
        await conn.run_sync(Base.metadata.create_all)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialise database tables on startup."""
    logger.info("🚀 Starting application...")
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
app.include_router(booking_router)
app.include_router(shop_router)
app.include_router(membership_router)
app.include_router(ai_router)


@app.on_event("startup")
async def startup():
    await init_db()


@app.get("/")
async def root():
    return {"message": "B.A.D People Fitness API", "status": "running"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    from config import HOST, PORT

    uvicorn.run("main:app", host=HOST, port=PORT, reload=True)
