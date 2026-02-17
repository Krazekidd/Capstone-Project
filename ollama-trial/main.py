from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from router import router
# from database import create_tables  # Disabled database import
import os

# Create FastAPI app
app = FastAPI(
    title="Ollama Gym AI API",
    version="1.0.0",
    description="FastAPI app for Jamaican meal recommendations using local Ollama models"
)

# Configure CORS for Vite dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vite default dev server
        "http://localhost:3000",  # Alternative Vite port
        "http://127.0.0.1:5173",  # Vite alternative
        "http://127.0.0.1:3000",  # Vite alternative
        "file://",  # Local file access for frontend
        "*",  # Allow all origins for development (remove in production)
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Include all routes from router
app.include_router(router, tags=["api"])

# Initialize database tables on startup - DISABLED
# @app.on_event("startup")
# async def startup_event():
#     create_tables()
#     print("Database tables initialized successfully")

print("🚀 Ollama Gym AI API started without database support")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
