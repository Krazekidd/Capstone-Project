"""ML progress prediction router."""
from fastapi import APIRouter, HTTPException
from schemas import MLUserProfile, MLProgressResponse, MLProgressPoint
from ml.ml.progress_engine import project_progress, bmi_to_category
from ml.ml.workout_engine import get_workout_category, predict_calories

router = APIRouter(prefix="/api/ml/progress", tags=["ML - Progress"])


@router.post("/predict", response_model=MLProgressResponse)
def predict_progress(profile: MLUserProfile):
    """
    Predicts weight, BMI, and body fat % at months 1, 2, 3, 6, and 1 year,
    assuming consistent adherence to the recommended plan.
    """
    bmi = profile.bmi if profile.bmi else profile.weight_kg / (profile.height_m ** 2)
    workout_category = get_workout_category(bmi, profile.goal)

    cat_to_wt = {
        "Fat_Burn": "Cardio", "Low_Impact_Cardio": "Cardio",
        "HIIT": "HIIT", "Strength": "Strength", "Full_Body": "HIIT",
    }
    wt_str = cat_to_wt.get(workout_category, "Cardio")

    cal_per_session = predict_calories(
        profile.age, profile.gender, profile.weight_kg, profile.height_m,
        bmi, profile.fat_pct, profile.experience_level, profile.workout_freq,
        profile.session_duration, profile.avg_bpm, wt_str
    )
    weekly_calories = cal_per_session * profile.workout_freq

    history = [
        {"week": h.week, "actual_weight": h.actual_weight}
        for h in (profile.workout_history or [])
    ]

    try:
        projections_raw = project_progress(
            age=profile.age,
            gender_str=profile.gender,
            start_weight=profile.weight_kg,
            height_m=profile.height_m,
            start_fat_pct=profile.fat_pct,
            experience_level=profile.experience_level,
            workout_freq=profile.workout_freq,
            session_duration=profile.session_duration,
            avg_bpm=profile.avg_bpm,
            weekly_calories=weekly_calories,
            workout_category=workout_category,
            workout_history=history if history else None,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    projections = [MLProgressPoint(**p) for p in projections_raw]

    return MLProgressResponse(
        user_summary={
            "start_weight_kg": profile.weight_kg,
            "start_bmi": round(bmi, 1),
            "bmi_category": bmi_to_category(bmi),
            "goal": profile.goal,
            "workout_plan": workout_category,
            "estimated_calories_per_session": round(cal_per_session, 0),
            "estimated_weekly_calories_burned": round(weekly_calories, 0),
        },
        projections=projections,
        note=(
            "Projections assume consistent adherence to the recommended workout plan. "
            "Individual results vary. Consult your trainer for personalised guidance."
        ),
    )
