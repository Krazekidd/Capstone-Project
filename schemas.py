from pydantic import BaseModel
from typing import List, Optional

class WorkoutPlan(BaseModel):
    name: str
    exercises: List[str]
    days_per_week: int
    duration_minutes: int

class UserMetrics(BaseModel):
    weight_kg: float
    height_cm: int
    age: int
    goal: str  # "gain", "loss", "maintain"
    activity_level: str  # "sedentary", "light", "moderate", "active"
    latest_workout_plan: Optional[WorkoutPlan] = None

class RecommendationRequest(BaseModel):
    user_metrics: UserMetrics

class ChatRequest(BaseModel):
    message: str
    session_id: str
    user_context: Optional[UserMetrics] = None

class ChatbotRequest(BaseModel):
    message: str
    session_id: str
    user_context: Optional[UserMetrics] = None

class ChatResponse(BaseModel):
    response: str

class ChatbotResponse(BaseModel):
    response: str
    session_id: str
    message_count: int

class RecommendationResponse(BaseModel):
    recommendation: str
    key_insights: List[str]
