"""ML workout recommendation router."""
from fastapi import APIRouter, HTTPException
from schemas import MLUserProfile, MLWorkoutResponse
from ml.ml.workout_engine import recommend_workout

router = APIRouter(prefix="/api/ml/workouts", tags=["ML - Workouts"])


@router.post("/recommend", response_model=MLWorkoutResponse)
def get_workout_recommendation(profile: MLUserProfile):
    """
    Returns 5 personalised workout recommendations based on the user's
    BMI, goal, and fitness level, plus predicted calories per session.
    """
    bmi = profile.bmi if profile.bmi else profile.weight_kg / (profile.height_m ** 2)

    try:
        result = recommend_workout(
            age=profile.age,
            gender_str=profile.gender,
            weight_kg=profile.weight_kg,
            height_m=profile.height_m,
            bmi=bmi,
            fat_pct=profile.fat_pct,
            experience_level=profile.experience_level,
            workout_freq=profile.workout_freq,
            session_duration=profile.session_duration,
            avg_bpm=profile.avg_bpm,
            goal=profile.goal,
            health_conditions=profile.health_conditions,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return result
