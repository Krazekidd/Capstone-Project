import os
from dotenv import load_dotenv
from pydantic_settings import BaseSettings
from typing import Optional

load_dotenv()

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
AI_MODEL = "qwen/qwen3-vl-30b-a3b-thinking"
# "google/gemma-3n-e2b-it:free"  liquid/lfm-2.5-1.2b-thinking:free qwen/qwen3-vl-30b-a3b-thinking

# PostgreSQL connection (async driver)
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+asyncpg://postgres:postgres@localhost:5433/chatbot_db"
)

# Server configuration
HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", "8000"))

# Chatbot context window configuration
MAX_CONTEXT_MESSAGES = int(os.getenv("MAX_CONTEXT_MESSAGES", "8"))

#User database config
class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "mysql+aiomysql://root:31senku61@localhost:3306/Accounts"
    
    # JWT
    SECRET_KEY: str = "GU4HJFO5MIo8Ykoy8r0ju7GKUUDW7TF98r8yajdy8huiaitfvpofgS7U9UHJPOJRGEHJFEWGFDT"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # CORS
    ALLOWED_ORIGINS: list = ["http://localhost:3000", "http://localhost:5173",]
    
    class Config:
        env_file = ".env"

settings = Settings()

SECRET_KEY = settings.SECRET_KEY
ALGORITHM = settings.ALGORITHM
ACCESS_TOKEN_EXPIRE_MINUTES = settings.ACCESS_TOKEN_EXPIRE_MINUTES