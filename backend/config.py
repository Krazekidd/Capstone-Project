import os
from dotenv import load_dotenv

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
