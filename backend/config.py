import os
from dotenv import load_dotenv
from pydantic_settings import BaseSettings
from typing import Optional
from fastapi_mail import ConnectionConfig

load_dotenv()

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
AI_MODEL = "qwen/qwen3-vl-30b-a3b-thinking"
# "google/gemma-3n-e2b-it:free"  liquid/lfm-2.5-1.2b-thinking:free qwen/qwen3-vl-30b-a3b-thinking

# PostgreSQL connection (async driver)
DATABASE_URL = os.getenv(
    "DATABASE_URL", "postgresql+asyncpg://postgres:postgres@localhost:5432/Accounts"
)

# Server configuration
HOST = os.getenv("HOST", "127.0.0.1")
PORT = int(os.getenv("PORT", "8000"))

# Chatbot context window configuration
MAX_CONTEXT_MESSAGES = int(os.getenv("MAX_CONTEXT_MESSAGES", "8"))


# SMTP Configuration
SMTP_CONFIG = ConnectionConfig(
    MAIL_USERNAME=os.getenv("SMTP_USER"),
    MAIL_PASSWORD=os.getenv("SMTP_PASSWORD"),
    MAIL_FROM=os.getenv("FROM_EMAIL"),
    MAIL_FROM_NAME=os.getenv("FROM_NAME", "GymPRO"),
    MAIL_PORT=int(os.getenv("SMTP_PORT", 587)),
    MAIL_SERVER=os.getenv("SMTP_HOST", "smtp.gmail.com"),
    MAIL_STARTTLS=True,  # TLS encryption [citation:7]
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True,
)


# User database config
class Settings(BaseSettings):
    # Database
    # DATABASE_URL: str = "mysql+aiomysql://root:31senku61@localhost:3306/Accounts"
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/Accounts"

    # JWT
    SECRET_KEY: str = (
        "GU4HJFO5MIo8Ykoy8r0ju7GKUUDW7TF98r8yajdy8huiaitfvpofgS7U9UHJPOJRGEHJFEWGFDT"
    )
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # CORS
    ALLOWED_ORIGINS: list = [
        "http://localhost:3000",
        "http://localhost:5173",
    ]

    # Email SMTP Settings
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str
    SMTP_PASSWORD: str
    FROM_EMAIL: str
    FROM_NAME: str = "GymPRO"

    # Frontend
    FRONTEND_URL: str = "http://localhost:3000"

    # Google OAuth
    GOOGLE_CLIENT_ID: str
    GOOGLE_CLIENT_SECRET: str
    GOOGLE_REDIRECT_URL: str

    # Environment
    ENVIRONMENT: str = "development"
    DEBUG: bool = True

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        # Allow extra fields from .env file
        extra = "ignore"

    class Config:
        env_file = ".env"


settings = Settings()

SECRET_KEY = settings.SECRET_KEY
ALGORITHM = settings.ALGORITHM
ACCESS_TOKEN_EXPIRE_MINUTES = settings.ACCESS_TOKEN_EXPIRE_MINUTES
