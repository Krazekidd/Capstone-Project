from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from router import router
from conversations_router import router as conversations_router
from database import init_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialise database tables on startup."""
    await init_db()
    yield


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
        "https://capstone-project-sage-six.vercel.app",  # Production Vercel URL
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Include all routes
app.include_router(router, tags=["api"])
app.include_router(conversations_router)

if __name__ == "__main__":
    import uvicorn
    from config import HOST, PORT
    uvicorn.run("main:app", host=HOST, port=PORT, reload=True)
