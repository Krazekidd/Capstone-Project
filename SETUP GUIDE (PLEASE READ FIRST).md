# B.A.D People Fitness — Local Setup Guide

## Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| Python | 3.11+ | Use python.org installer, NOT Microsoft Store |
| Node.js | 18+ | |
| PostgreSQL | 14+ | Must be installed and running locally |
| Git | Any | |

> **Note:** Docker is no longer required. The project now uses a local PostgreSQL installation.

---

## Branch Overview

| Folder | Branch | Description |
|--------|--------|-------------|
| `branch-main` | main | **Start here** — latest working build with ML connected |
| `branch-develop` | develop | Active development branch |
| `branch-develop-candace` | develop-candace | Candace's feature branch |
| `branch-jonathan` | jonathan | Jonathan's feature branch |
| `branch-ai-sections` | ai-sections | AI/OpenRouter integration work |
| `branch-db` | db | Database schema work |
| `branch-fix-main` | fix-main | Hotfixes for main |

**Use `branch-main` for testing.**

---

## Step-by-Step Setup (branch-main)

### Step 1 — Create the PostgreSQL database

Open **pgAdmin** or **psql** and run:
```sql
CREATE DATABASE accounts;
```

Or in PowerShell (replace `YOUR_PASSWORD` with your postgres password):
```powershell
$env:PGPASSWORD = "YOUR_PASSWORD"
& "C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -c 'CREATE DATABASE accounts;'
```

---

### Step 2 — Create the backend `.env` file

Navigate to `branch-main\backend\` and create a file named `.env`:

```env
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/accounts
FRONTEND_URL=http://localhost:5173
```

> Replace `postgres:postgres` with `postgres:YOUR_PASSWORD` if your PostgreSQL password is not `postgres`.

To get AI chat features working, also add:
```env
OPENROUTER_API_KEY=your_key_here
```
Get a key at https://openrouter.ai/

---

### Step 3 — Install Python dependencies

```powershell
cd branch-main\backend
pip install -r requirements.txt
```

---

### Step 4 — Start the backend

```powershell
cd branch-main\backend
python -m uvicorn main:app --reload
```

Backend runs at **http://localhost:8000**
API docs at **http://localhost:8000/docs**

On first startup the server auto-creates all database tables.

You should see:
```
✅ Application started successfully
```

---

### Step 5 — Install frontend dependencies and start

Open a **new terminal**:

```powershell
cd branch-main\client
npm install
npm run dev
```

Frontend runs at **http://localhost:5173**

---

## Testing the ML Features

The ML system has three models connected end-to-end:
- **Workout Recommender** — personalised exercises based on BMI, goal, fitness level
- **Progress Forecaster** — projected weight/BMI/body fat over 1 year
- **Food Suggester** — nutrition-matched food recommendations

### Steps to test:

**1. Register an account**
Go to http://localhost:5173 → click Register → create an account → log in.

**2. Go to the Account page**
After logging in you land on the Account page automatically.

**3. Set your goal** (Body Goals section)
Pick one of: Bulk Up / Cut Down / Athletic Build / Lean & Shredded / Maintain / Tone & Define

**4. Enter measurements** (Track Progress section — scroll down)

At minimum fill in:
| Field | Example |
|-------|---------|
| Weight (kg) | `84` |
| Height (cm) | `178` |
| Body Fat % | `20` *(optional — defaults to 20)* |

**5. Click "🤖 Get ML Plan"** (blue button next to Save/Clear)

Wait 1–2 seconds. All three ML models run in parallel.

**6. View results**

| Location | What appears |
|----------|-------------|
| **Workouts card** (scroll down) | 5 ML-recommended exercises with sets / reps / rest time and estimated calories per session |
| **Between nutrition and analytics sections** | Food suggestions table — 8 foods matched to your goal with calories, protein, carbs, fat, fibre |
| **Progress Dashboard → "ML Forecast" tab** | Line chart showing predicted weight and body fat % at Month 1, 2, 3, 6, and 1 Year — plus weekly calorie burn estimate |

---

## Port Reference

| Service | Port | URL |
|---------|------|-----|
| Frontend (Vite) | 5173 | http://localhost:5173 |
| Backend (FastAPI) | 8000 | http://localhost:8000 |
| API Docs (Swagger) | 8000 | http://localhost:8000/docs |
| PostgreSQL (local) | 5432 | localhost:5432 |

---

## Common Issues

### "password authentication failed for user postgres"
Your PostgreSQL password is not `postgres`. Update the `DATABASE_URL` in `backend\.env`:
```env
DATABASE_URL=postgresql+asyncpg://postgres:YOUR_ACTUAL_PASSWORD@localhost:5432/accounts
```

### "database accounts does not exist"
Run `CREATE DATABASE accounts;` in pgAdmin or psql (see Step 1).

### `uvicorn` not recognised
Use `python -m uvicorn` instead of `uvicorn` directly:
```powershell
python -m uvicorn main:app --reload
```

### pip install fails with UnicodeDecodeError
The `requirements.txt` may be UTF-16 encoded. Fix it:
```powershell
$content = Get-Content "requirements.txt" -Encoding Unicode
$content | Set-Content "requirements.txt" -Encoding UTF8
```

### ML button shows "⚠️ ML recommendations failed"
The backend is not running or not reachable at `http://localhost:8000`. Make sure Step 4 completed with no errors.

### "🤖 Get ML Plan" shows "Enter weight and height first"
Fill in the Weight and Height fields in the Track Progress section before clicking the button.

### CORS errors in browser console
Both servers must be running. Frontend must be on port 5173 and backend on 8000.

### Missing OpenRouter API key
The NutriAI chat feature requires `OPENROUTER_API_KEY` in `.env`. ML recommendations (workouts, food, progress) work without it.
