# B.A.D People Fitness - Gym Management System

A comprehensive gym management system with AI-powered meal recommendations, booking management, and membership features.

## Prerequisites

- **Node.js** (v18 or higher)
- **Python** (v3.8 or higher)
- **PostgreSQL** (v12 or higher)
- **Git**

## Project Structure

```
Capstone-Project/
├── backend/          # FastAPI Python backend
├── client/           # React frontend
├── new_db.sql        # Database schema
└── README.md         # This file
```

## Database Setup

1. **Install PostgreSQL** on your system
2. **Create a database** named `chatbot_db`
3. **Run the database schema**:
   ```bash
   psql -U postgres -d chatbot_db -f new_db.sql
   ```

## Backend Setup

1. **Navigate to the backend directory**:
   ```bash
   cd backend
   ```

2. **Create a virtual environment**:
   ```bash
   python -m venv venv
   ```

3. **Activate the virtual environment**:
   - **Windows**: `venv\Scripts\activate`
   - **Mac/Linux**: `source venv/bin/activate`

4. **Install Python dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

5. **Set up environment variables**:
   - Copy `.env.example` to `.env`
   - Update the `.env` file with your configuration:

   ```env
   OPENROUTER_API_KEY=your_openrouter_api_key_here
   DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5433/chatbot_db

   # Server configuration (optional - defaults shown)
   HOST=0.0.0.0
   PORT=8000

   # Chatbot context window (optional - default: 8)
   MAX_CONTEXT_MESSAGES=8

   # Email SMTP Configuration (optional - required for email features)
   SMTP_USER=your_email@gmail.com
   SMTP_PASSWORD=your_app_password
   FROM_EMAIL=your_email@gmail.com
   FROM_NAME=GymPRO
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   ```

6. **Start the backend server**:
   ```bash
   python main.py
   ```

   The backend will be available at `http://localhost:8000`

## Frontend Setup

1. **Navigate to the client directory**:
   ```bash
   cd client
   ```

2. **Install Node.js dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   - Copy `.env.example` to `.env`
   - The default configuration should work for local development:

   ```env
   VITE_BACKEND_URL=http://localhost:8000
   ```

4. **Start the frontend development server**:
   ```bash
   npm run dev
   ```

   The frontend will be available at `http://localhost:5173`

## Running the Application

1. **Start the backend first** (in one terminal):
   ```bash
   cd backend
   python -m venv venv
   venv\Scripts\activate  # Windows
   pip install -r requirements.txt
   python main.py
   ```

2. **Start the frontend** (in another terminal):
   ```bash
   cd client
   npm install
   npm run dev
   ```

3. **Access the application**:
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:8000`
   - API Documentation: `http://localhost:8000/docs`

## Features

- **AI-Powered Meal Recommendations**: Get personalized meal suggestions using OpenRouter AI
- **User Authentication**: Secure login and registration system
- **Booking Management**: Schedule and manage gym appointments
- **Membership Management**: Handle gym memberships and subscriptions
- **Email Notifications**: SMTP-based email system for user communications
- **Responsive Design**: Modern React frontend with Tailwind CSS

## Environment Variables

### Backend (.env)
- `OPENROUTER_API_KEY`: Required for AI features
- `DATABASE_URL`: PostgreSQL connection string
- `HOST`: Server host (default: 0.0.0.0)
- `PORT`: Server port (default: 8000)
- `MAX_CONTEXT_MESSAGES`: AI chat context window (default: 8)
- `SMTP_*`: Email configuration (optional)

### Frontend (.env)
- `VITE_BACKEND_URL`: Backend API URL (default: http://localhost:8000)

## Troubleshooting

### Common Issues

1. **Database Connection Error**:
   - Ensure PostgreSQL is running
   - Check database name and credentials in `.env`
   - Verify the database was created with the schema

2. **Port Already in Use**:
   - Change the PORT in backend `.env` file
   - Or stop the process using the port:
     ```bash
     # Windows
     netstat -ano | findstr :8000
     taskkill /PID <PID> /F
     
     # Mac/Linux
     lsof -ti:8000 | xargs kill -9
     ```

3. **CORS Errors**:
   - Ensure frontend URL is in backend CORS origins
   - Check that both servers are running

4. **Python Dependencies**:
   - Make sure virtual environment is activated
   - Try `pip install --upgrade -r requirements.txt`

5. **Node.js Dependencies**:
   - Delete `node_modules` and `package-lock.json`
   - Run `npm install` again

## Development Notes

- The backend uses FastAPI with automatic API documentation at `/docs`
- The frontend uses Vite for fast development and hot reloading
- Database tables are created automatically on startup
- The application supports CORS for local development

## API Endpoints

- `GET /` - Root endpoint
- `GET /health` - Health check
- `GET /docs` - Interactive API documentation
- Authentication endpoints: `/auth/*`
- Booking endpoints: `/bookings/*`
- AI endpoints: `/ai/*`
- Membership endpoints: `/memberships/*`

## License

This project is part of a capstone project for educational purposes.
