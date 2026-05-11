from dotenv import load_dotenv
from pydantic_settings import BaseSettings
from typing import Optional
from fastapi_mail import ConnectionConfig

import os

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
AI_MODEL = "qwen/qwen3-vl-30b-a3b-thinking"
load_dotenv()
# SMTP Configuration - Only create if email settings are available
def get_smtp_config():
    smtp_user = os.getenv("SMTP_USER")
    smtp_password = os.getenv("SMTP_PASSWORD")
    from_email = os.getenv("FROM_EMAIL")
    
    if smtp_user and smtp_password and from_email:
        return ConnectionConfig(
            MAIL_USERNAME=smtp_user,
            MAIL_PASSWORD=smtp_password,
            MAIL_FROM=from_email,
            MAIL_FROM_NAME=os.getenv("FROM_NAME", "GymPRO"),
            MAIL_PORT=int(os.getenv("SMTP_PORT", 587)),
            MAIL_SERVER=os.getenv("SMTP_HOST", "smtp.gmail.com"),
            MAIL_STARTTLS=True,  # TLS encryption [citation:7]
            MAIL_SSL_TLS=False,
            USE_CREDENTIALS=True,
            VALIDATE_CERTS=True,
        )
    return None

SMTP_CONFIG = get_smtp_config()

class Settings(BaseSettings):
    # OpenRouter API
    OPENROUTER_API_KEY: Optional[str] = None
    OPENROUTER_URL: str = "https://openrouter.ai/api/v1/chat/completions"
    AI_MODEL: str = "qwen/qwen3-vl-30b-a3b-thinking"
    
    # Database
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/accounts"
    
    # Server configuration
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    RELOAD: bool = True
    
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

    # Email Settings - Brevo API
    BREVO_API_KEY: Optional[str] = None
    FROM_EMAIL: Optional[str] = None
    FROM_NAME: str = "GymPRO"

    # Email SMTP Settings
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    FROM_EMAIL: Optional[str] = None
    FROM_NAME: str = "GymPRO"


    # Frontend
    FRONTEND_URL: str = "http://localhost:5173"

    # Environment
    ENVIRONMENT: str = "development"
    DEBUG: bool = True

    # Progress Photos
    PROGRESS_PHOTOS_DIR: str = "uploads/progress_photos"
    
    # Profile Images
    PROFILE_IMAGES_DIR: str = "uploads/profile_images"

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
DATABASE_URL = settings.DATABASE_URL

# OpenRouter API
OPENROUTER_API_KEY = settings.OPENROUTER_API_KEY
OPENROUTER_URL = settings.OPENROUTER_URL
AI_MODEL = settings.AI_MODEL

# Server configuration
HOST = settings.HOST
PORT = settings.PORT
RELOAD = settings.RELOAD

# Chatbot context window configuration
MAX_CONTEXT_MESSAGES = settings.MAX_CONTEXT_MESSAGES

# CORS
ALLOWED_ORIGINS = settings.ALLOWED_ORIGINS

# Email Settings
BREVO_API_KEY = settings.BREVO_API_KEY
FROM_EMAIL = settings.FROM_EMAIL
FROM_NAME = settings.FROM_NAME

# Frontend
FRONTEND_URL = settings.FRONTEND_URL

# Environment
ENVIRONMENT = settings.ENVIRONMENT
DEBUG = settings.DEBUG

# Progress Photos
PROGRESS_PHOTOS_DIR = settings.PROGRESS_PHOTOS_DIR

# Profile Images
PROFILE_IMAGES_DIR = settings.PROFILE_IMAGES_DIR
