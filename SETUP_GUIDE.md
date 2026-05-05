# B.A.D People Fitness — Local Setup Guide

## Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| Python | 3.11+ | Use python.org installer, NOT Microsoft Store |
| Node.js | 18+ | |
| Docker Desktop | Any recent | Must be running before starting DB |
| Git | Any | |

---

## What Was Changed From the Original Repo

The following files were modified to fix startup errors. If you're cloning fresh, apply these changes before running.

### 1. `backend/requirements.txt` — Encoding fix
The file was saved as UTF-16, which pip cannot read. Convert it to UTF-8:
```powershell
$content = Get-Content "requirements.txt" -Encoding Unicode
$content | Set-Content "requirements.txt" -Encoding UTF8
```

### 2. `backend/routers/misc/__init__.py` — Disabled broken excursions import
The `excursions` router imports models (`Client`, `Excursion`, etc.) that don't exist in the current models package. The import was commented out so the server can start.

**Changed from:**
```python
from .excursions import router as excursions_router
from .conversations import router as conversations_router

__all__ = ["excursions_router", "conversations_router"]
```
**Changed to:**
```python
# excursions router disabled - models not yet merged from feature branch
from .conversations import router as conversations_router

__all__ = ["conversations_router"]
```

### 3. `backend/routers/ml/__init__.py` — Created missing file
The `routers/ml/` folder had no `__init__.py`, so Python couldn't treat it as a package. Created an empty file at `backend/routers/ml/__init__.py`.

### 4. `backend/main.py` — Fixed ML router import paths
The ML engine files are in `routers/ml/ml/` (nested one level deeper than the imports assumed).

**Changed from:**
```python
from routers.ml.workouts import router as ml_workouts_router
from routers.ml.progress import router as ml_progress_router
from routers.ml.food import router as ml_food_router
```
**Changed to:**
```python
from routers.ml.ml.workouts import router as ml_workouts_router
from routers.ml.ml.progress import router as ml_progress_router
from routers.ml.ml.food import router as ml_food_router
```

### 5. `backend/routers/ml/ml/workouts.py`, `progress.py`, `food.py` — Fixed ML engine imports
Same nesting issue. Each file's imports were updated to include the extra `ml.` prefix:

- `from ml.workout_engine import ...` → `from ml.ml.workout_engine import ...`
- `from ml.progress_engine import ...` → `from ml.ml.progress_engine import ...`
- `from ml.recommendation_engine import ...` → `from ml.ml.recommendation_engine import ...`

### 6. `backend/ml/__init__.py` — Created missing file
Same issue as the routers — `backend/ml/` had no `__init__.py`. Created an empty one.

### 7. `backend/docker-compose.yml` — Port changed from 5433 to 5440
**Important:** This machine has PostgreSQL versions 13–18 installed locally, each occupying a port:
- PG13 → 5433, PG14 → 5434, PG15 → 5435, PG16 → 5436, PG17 → 5437, PG18 → 5432

Port 5440 is free. Docker was changed to use it.

**Changed from:**
```yaml
ports:
  - "5433:5432"
```
**Changed to:**
```yaml
ports:
  - "5440:5432"
```

### 8. `backend/.env` — Port updated to match
```env
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5440/chatbot_db
```

---

## Step-by-Step Setup

### Step 1 — Start Docker Desktop
Open Docker Desktop from the Start menu. Wait for the whale icon in the taskbar to stop animating (~30–60 seconds).

### Step 2 — Start the database
```powershell
cd backend
docker compose up -d
```
This starts:
- PostgreSQL on port **5440** (container: `capstone_postgres`)
- pgAdmin at **http://localhost:5050** (login: `admin@admin.com` / `admin`)

### Step 3 — Create backend `.env`
```powershell
copy .env.example .env
```
Open `.env` and fill in your `OPENROUTER_API_KEY`. Everything else works as-is.

```env
OPENROUTER_API_KEY=your_key_here
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5440/chatbot_db
HOST=0.0.0.0
PORT=8000
MAX_CONTEXT_MESSAGES=8
```

### Step 4 — Set up Python virtual environment
```powershell
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

### Step 5 — Start the backend
```powershell
python main.py
```
Backend runs at **http://localhost:8000**
API docs at **http://localhost:8000/docs**

### Step 6 — Start the frontend (new terminal)
```powershell
cd client
copy .env.example .env
npm install
npm run dev
```
Frontend runs at **http://localhost:5173**

---

## Port Reference

| Service | Port | URL |
|---------|------|-----|
| Frontend (Vite) | 5173 | http://localhost:5173 |
| Backend (FastAPI) | 8000 | http://localhost:8000 |
| API Docs | 8000 | http://localhost:8000/docs |
| PostgreSQL (Docker) | 5440 | localhost:5440 |
| pgAdmin | 5050 | http://localhost:5050 |

---

## Common Issues

### "Port already in use" on 5440
Another service grabbed port 5440. Change the port in both `docker-compose.yml` and `backend/.env` to any free port above 5440.

### Docker won't start
Make sure Docker Desktop is fully running before `docker compose up -d`.

### pip install fails with UnicodeDecodeError
The `requirements.txt` is UTF-16. Run the encoding fix from Step 1 of "What Was Changed".

### Database connection error on startup
Confirm Docker container is healthy:
```powershell
docker ps
```
The `capstone_postgres` container should show `(healthy)`.

### Missing OpenRouter API key
AI features (`/ai/*` routes) require a valid `OPENROUTER_API_KEY` in `.env`. Get one at https://openrouter.ai/

### CORS errors in browser
Both servers must be running. Frontend must be on port 5173 and backend on 8000.
