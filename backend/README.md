# Gym AI Recommender 🏋️

FastAPI app for Jamaican meal recommendations and fitness advice using OpenRouter's AI models with real-time streaming.

## 🚀 Complete Setup Guide (First-Time Users)

### 📋 Prerequisites

Before you begin, ensure you have:
- **Python 3.8+** installed
- **OpenRouter API key** (free tier available)
- **Git** (optional, for cloning)
- **Internet connection** (required for API calls)

### 🔑 Step 1: Get OpenRouter API Key

1. **Visit**: https://openrouter.ai/
2. **Sign up** for a free account
3. **Navigate to API Keys**: https://openrouter.ai/keys
4. **Copy your API key** (starts with `sk-or-v1-...`)
5. **Free tier includes**: Multiple requests per day

### 📦 Step 2: Set Up Python Environment

```bash
# Navigate to the project directory
cd test

# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment

# Windows:
venv\Scripts\activate

# macOS/Linux:
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt
```

### ⚙️ Step 3: Configure Environment Variables

```bash
# Create environment file
cp .env.example .env

# Edit .env file and add your API key
# Windows: notepad .env
# macOS/Linux: nano .env

# Add this line to .env:
OPENROUTER_API_KEY=sk-or-v1-your-actual-api-key-here
```

### 🧪 Step 4: Verify Installation

```bash
# Test Python packages are installed
python -c "import fastapi, uvicorn, pydantic, httpx; print('All packages installed!')"

# Test environment variable is loaded
python -c "from dotenv import load_dotenv; load_dotenv(); import os; print('API Key found!' if os.getenv('OPENROUTER_API_KEY') else 'API Key missing!')"
```

### 🚀 Step 5: Run the Application

```bash
# Start the FastAPI backend
python main.py

# You should see output like:
# INFO:     Started server process [12345]
# INFO:     Waiting for application startup.
# INFO:     Application startup complete.
# INFO:     Uvicorn running on http://0.0.0.0:8000
```

### 🌐 Step 6: Access the Application

#### **Backend API:**
- **API Base URL**: `http://localhost:8000`
- **Interactive Docs**: `http://localhost:8000/docs`
- **API Schema**: `http://localhost:8000/openapi.json`

#### **Frontend Interface:**
1. **Open your web browser**
2. **Navigate to the frontend folder**
3. **Open `frontend/index.html`** (double-click or drag to browser)
4. **Or enter this URL**: `file:///path/to/test/frontend/index.html`

## 📡 API Endpoints

### Regular Endpoints
- **POST `/recommend`** - Get 3 Jamaican meal options
- **POST `/chat`** - Ask fitness questions  
- **POST `/chatbot`** - Chat with memory (saves conversation)
- **GET `/chatbot/sessions/{id}`** - View chat session
- **DELETE `/chatbot/sessions/{id}`** - Clear session

### 🌊 Streaming Endpoints (Real-time)
- **POST `/recommend/stream`** - Streaming meal recommendations
- **POST `/chat/stream`** - Streaming fitness questions
- **POST `/chatbot/stream`** - Streaming chat with memory

## 🎯 What It Does

- **Jamaican meals** based on weight goals (gain/loss/maintain)
- **Includes recipes** with ingredients and cooking steps
- **Chatbot remembers** previous questions for better answers
- **Token optimized** to keep API costs low
- **Real-time streaming** - See responses appear as they're generated

## 📱 Try It

### Regular Endpoints
```bash
# Get meal recommendations
curl -X POST http://localhost:8000/recommend

# Start chat
curl -X POST http://localhost:8000/chatbot \
  -d '{"message": "What should I eat to gain weight?", "session_id": "user123"}'
```

### 🌊 Streaming Endpoints
```bash
# Streaming meal recommendations (real-time)
curl -X POST http://localhost:8000/recommend/stream

# Streaming chat (real-time responses)
curl -X POST http://localhost:8000/chat/stream \
  -d '{"message": "What should I eat?", "session_id": "user123"}'

# Streaming chatbot with memory
curl -X POST http://localhost:8000/chatbot/stream \
  -d '{"message": "Help me plan meals", "session_id": "user123"}'
```

**Streaming Benefits:**
- ⚡ **Real-time responses** - No waiting for complete answer
- 🎯 **Better UX** - See text appear as it's generated
- 💾 **Memory preserved** - Chatbot streams still save conversation
- 💰 **Cost efficient** - Only pay for tokens used

## 📚 API Docs

Visit `http://localhost:8000/docs` for interactive testing.

## 🏗️ Files

- `main.py` - App entry point
- `config.py` - API keys & settings  
- `router.py` - All endpoints
- `schemas.py` - Data models
- `utils.py` - Helper functions

## 🔧 Change AI Model

Edit `config.py`:
```python
AI_MODEL = "liquid/lfm-2.5-1.2b-instruct:free"  # Current
# Other free options:
# AI_MODEL = "google/gemma-3n-e2b-it:free"
# AI_MODEL = "meta-llama/llama-3.2-3b-instruct:free"

```

## 🏗️ Project Structure

```
test/
├── main.py              # FastAPI application entry point
├── config.py            # API keys & configuration
├── router.py            # All API endpoints (streaming + regular)
├── schemas.py           # Data models (Pydantic)
├── utils.py             # Helper functions and prompts
├── requirements.txt     # Python dependencies
├── .env.example         # Environment variables template
├── .gitignore          # Git ignore file
├── frontend/           # Web interface
│   ├── index.html      # Main HTML page
│   ├── style.css       # Styling
│   └── script.js       # JavaScript for streaming
└── README.md           # This file
```

## 🛠️ Troubleshooting

### Common Issues

#### **"API key not configured" Error**
```bash
# Check if .env file exists
ls -la .env

# Verify API key is in .env file
cat .env

# Make sure it starts with sk-or-v1-
```

#### **"Invalid API key" Error**
```bash
# Verify your API key at OpenRouter
# Visit: https://openrouter.ai/keys
# Copy the exact key (no extra spaces)
```

#### **"Python package not found" Error**
```bash
# Make sure you're in the virtual environment
# Windows:
venv\Scripts\activate

# macOS/Linux:
source venv/bin/activate

# Reinstall dependencies
pip install -r requirements.txt
```

#### **"Port already in use" Error**
```bash
# Find what's using port 8000
netstat -ano | findstr :8000  # Windows
lsof -i :8000                  # macOS/Linux

# Kill the process or change port in main.py
```

#### **Frontend not working**
```bash
# Make sure backend is running first
python main.py

# Check browser console for errors (F12)
# Verify CORS is enabled (should be by default)
# Check API key is configured correctly
```

#### **Rate limiting or API errors**
```bash
# Check your OpenRouter usage
# Visit: https://openrouter.ai/usage

# Free tier has limits, consider upgrading if needed
# Try again after some time if rate limited
```

### Performance Tips

1. **Use streaming endpoints**: Better user experience
2. **Monitor usage**: Check OpenRouter dashboard
3. **Optimize prompts**: Keep responses concise when possible
4. **Choose appropriate models**: Some are faster than others

## 🎉 Benefits of OpenRouter

- **Multiple AI models** - Access to various LLMs
- **Pay-per-use** - Only pay for what you use
- **High performance** - Fast, reliable inference
- **No hardware required** - Everything runs in the cloud
- **Easy setup** - Just API key needed

## 📚 Advanced Usage

### Custom Prompts
Edit `utils.py` to modify prompts:
```python
def create_prompt(user_metrics: UserMetrics) -> str:
    # Customize this for different meal styles
    # or add more context about dietary restrictions
```

### Adding New Endpoints
1. Add schemas in `schemas.py`
2. Create endpoint in `router.py`
3. Update frontend if needed

### Production Deployment
```bash
# Install production server
pip install gunicorn

# Run with gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker
```

### Cost Management
```bash
# Monitor your API usage
# Visit: https://openrouter.ai/usage

# Use streaming to see responses as they generate
# Adjust token limits in router.py if needed
```

## 🤝 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Verify your OpenRouter API key is valid
3. Test with a simple curl command first
4. Check browser console for frontend errors
5. Monitor OpenRouter usage dashboard

**Enjoy your Jamaican meal recommendations!** 🍽️
