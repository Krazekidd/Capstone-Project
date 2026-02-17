from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from router import router

app = FastAPI(
    title="Gym AI Recommender", 
    version="1.0.0",
    description="FastAPI app for Jamaican meal recommendations using OpenRouter's AI models"
)

# Add CORS middleware with proper configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # React dev server
        "http://localhost:8080",  # Vue dev server
        "http://localhost:5173",  # Vite dev server
        "http://127.0.0.1:3000",
        "http://127.0.0.1:8080", 
        "http://127.0.0.1:5173",
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
