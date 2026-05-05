# Gym AI Recommender - Ollama Version 🦙

FastAPI app for Jamaican meal recommendations and fitness advice using local Ollama models with real-time streaming.

## 🚀 Complete Setup Guide (First-Time Users)

### 📋 Prerequisites

Before you begin, ensure you have:
- **Python 3.8+** installed
- **Ollama** installed on your system
- **NVIDIA GPU** (recommended for performance)
- **Git** (optional, for cloning)

### 🔧 Step 1: Install Ollama

#### **Windows:**
```bash
# Download and run the installer
# Visit: https://ollama.ai/download/windows
# Run the downloaded .exe file
```

#### **macOS:**
```bash
# Download and run the installer
# Visit: https://ollama.ai/download/mac
# Run the downloaded .dmg file
```

#### **Linux:**
```bash
# Install with curl
curl -fsSL https://ollama.ai/install.sh | sh
```

### 🎮 Step 2: Verify GPU Support (Optional but Recommended)

```bash
# Check if you have NVIDIA GPU
nvidia-smi

# If you see GPU info, Ollama will use it automatically
# If not, Ollama will run on CPU (slower but works)
```

### 📦 Step 3: Pull the AI Model

```bash
# Pull the specific model used by this app
ollama pull lfm2.5-thinking:1.2b

# Alternative models (if you want to change later):
# ollama pull llama3.2
# ollama pull mistral
# ollama pull codellama
```

### 🐍 Step 4: Set Up Python Environment

```bash
# Navigate to the project directory
cd ollama-trial

# Create virtual environment (recommended)
python -m venv ollama_venv

# Activate virtual environment

# Windows:
ollama_venv\Scripts\activate

# macOS/Linux:
source ollama_venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt
```

### ⚙️ Step 5: Verify Installation

```bash
# Test Ollama is working
ollama list

# Test Python packages are installed
python -c "import fastapi, uvicorn, pydantic, ollama; print('All packages installed!')"
```

### 🚀 Step 6: Run the Application

```bash
# Start the FastAPI backend
python main.py

# You should see output like:
# INFO:     Started server process [12345]
# INFO:     Waiting for application startup.
# INFO:     Application startup complete.
# INFO:     Uvicorn running on http://0.0.0.0:8000
```

### 🌐 Step 7: Access the Application

#### **Backend API:**
- **API Base URL**: `http://localhost:8000`
- **Interactive Docs**: `http://localhost:8000/docs`
- **API Schema**: `http://localhost:8000/openapi.json`

#### **Frontend Interface:**
1. **Open your web browser**
2. **Navigate to the frontend folder**
3. **Open `frontend/index.html`** (double-click or drag to browser)
4. **Or enter this URL**: `file:///path/to/ollama-trial/frontend/index.html`

## 📡 API Endpoints

### Regular Endpoints
- **POST `/recommend`** - Get 3 Jamaican meal options
- **POST `/chat`** - Ask fitness questions  
- **POST `/chatbot`** - Chat with memory (saves conversation)
- **GET `/chatbot/sessions/{id}`** - View chat session
- **DELETE `/chatbot/sessions/{id}`** - Clear session
- **GET `/models`** - List available Ollama models

### 🌊 Streaming Endpoints (Real-time)
- **POST `/recommend/stream`** - Streaming meal recommendations
- **POST `/chat/stream`** - Streaming fitness questions
- **POST `/chatbot/stream`** - Streaming chat with memory

## 🎯 What It Does

- **Jamaican meals** based on weight goals (gain/loss/maintain)
- **Includes recipes** with ingredients and cooking steps
- **Chatbot remembers** previous questions for better answers
- **Uses local AI** - No API keys or internet required
- **Real-time streaming** - See responses appear as they're generated

## 📱 Try It

### Regular Endpoints
```bash
# Get meal recommendations
curl -X POST http://localhost:8000/recommend

# Start chat
curl -X POST http://localhost:8000/chatbot \
  -d '{"message": "What should I eat to gain weight?", "session_id": "user123"}'

# List available models
curl -X GET http://localhost:8000/models
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

## 🔧 Configuration

### Change AI Model
Edit `config.py`:
```python
OLLAMA_MODEL = "lfm2.5-thinking:1.2b"  # Current model
# Other options: "llama3.2", "llama3.1", "mistral", "codellama", "phi3"
```

### Change Server Port
Edit `main.py`:
```python
uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
# Change port=8000 to your preferred port
```

## 🏗️ Project Structure

```
ollama-trial/
├── main.py              # FastAPI application entry point
├── config.py            # Ollama configuration
├── router.py            # All API endpoints (streaming + regular)
├── schemas.py           # Data models (Pydantic)
├── utils.py             # Helper functions and prompts
├── requirements.txt     # Python dependencies
├── .gitignore          # Git ignore file
├── frontend/           # Web interface
│   ├── index.html      # Main HTML page
│   ├── style.css       # Styling
│   └── script.js       # JavaScript for streaming
└── README.md           # This file
```

## 🛠️ Troubleshooting

### Common Issues

#### **"Ollama not found" Error**
```bash
# Make sure Ollama is installed and running
ollama --version

# Restart Ollama service
# Windows: Restart Ollama application
# macOS/Linux: sudo systemctl restart ollama
```

#### **"Model not found" Error**
```bash
# Pull the required model
ollama pull lfm2.5-thinking:1.2b

# List available models
ollama list
```

#### **"Python package not found" Error**
```bash
# Make sure you're in the virtual environment
# Windows:
ollama_venv\Scripts\activate

# macOS/Linux:
source ollama_venv/bin/activate

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
```

#### **Slow responses**
```bash
# Check if GPU is being used
nvidia-smi  # Should show ollama.exe using GPU

# If using CPU, responses will be slower
# Consider getting a smaller model for faster CPU inference
```

### Performance Tips

1. **Use GPU**: Ensure NVIDIA drivers are installed
2. **Smaller models**: Try `llama3.2` for faster responses
3. **Close other apps**: Free up GPU memory
4. **Use streaming**: Better user experience for long responses

## 🎉 Benefits of Ollama

- **Free** - No API costs or usage limits
- **Private** - All data stays on your machine
- **Fast** - Local inference with GPU acceleration
- **Offline** - Works without internet connection
- **Customizable** - Use any model you want

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

## 🤝 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Verify all prerequisites are met
3. Test with a simple curl command first
4. Check browser console for frontend errors

**Enjoy your Jamaican meal recommendations!** 🍽️
