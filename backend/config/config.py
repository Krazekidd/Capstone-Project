from dotenv import load_dotenv
from pydantic_settings import BaseSettings
from typing import Optional

load_dotenv()


class Settings(BaseSettings):
    # OpenRouter API
    OPENROUTER_API_KEY: Optional[str] = None
    OPENROUTER_URL: str = "https://openrouter.ai/api/v1/chat/completions"
    AI_MODEL: str = "qwen/qwen3-vl-30b-a3b-thinking"
    
    # Database
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/Accounts"
    
    # Server configuration
    HOST: str = "127.0.0.1"
    PORT: int = 8000
    
    # Chatbot context window configuration
    MAX_CONTEXT_MESSAGES: int = 8

    # JWT
    SECRET_KEY: str = (
        "GU4HJFO5MIo8Ykoy8r0ju7GKUUDW7TF98r8yajdy8huiaitfvpofgS7U9UHJPOJRGEHJFEWGFDT"
    )
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # CORS
    ALLOWED_ORIGINS: list = [
        "http://localhost:3000",
        "http://localhost:5173",
    ]

    # Email Settings - Resend Only
    RESEND_API_KEY: Optional[str] = None
    FROM_EMAIL: Optional[str] = None
    FROM_NAME: str = "GymPRO"

    # Frontend
    FRONTEND_URL: str = "http://localhost:3000"

    # Environment
    ENVIRONMENT: str = "development"
    DEBUG: bool = True

    # Progress Photos
    PROGRESS_PHOTOS_DIR: str = "progress_photos"

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "extra": "ignore"  # Allow extra fields from .env file
    }


settings = Settings()

SECRET_KEY = settings.SECRET_KEY
ALGORITHM = settings.ALGORITHM
ACCESS_TOKEN_EXPIRE_MINUTES = settings.ACCESS_TOKEN_EXPIRE_MINUTES
REFRESH_TOKEN_EXPIRE_DAYS = settings.REFRESH_TOKEN_EXPIRE_DAYS
