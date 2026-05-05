"""Workout recommendation engine — rule-based BMI logic + exercise database."""
import warnings
import joblib
import os
import numpy as np
warnings.filterwarnings("ignore", category=UserWarning)

MODEL_DIR = os.path.join(os.path.dirname(__file__), "models")


def _load():
    exercise_db = joblib.load(os.path.join(MODEL_DIR, "exercise_database.pkl"))
    bmi_rules = joblib.load(os.path.join(MODEL_DIR, "bmi_rules.pkl"))
    calorie_model = joblib.load(os.path.join(MODEL_DIR, "calorie_model.pkl"))
    calorie_scaler = joblib.load(os.path.join(MODEL_DIR, "calorie_scaler.pkl"))
    le_gender = joblib.load(os.path.join(MODEL_DIR, "gender_label_encoder.pkl"))
    le_workout = joblib.load(os.path.join(MODEL_DIR, "workout_type_encoder.pkl"))
    cal_features = joblib.load(os.path.join(MODEL_DIR, "calorie_features.pkl"))
    return exercise_db, bmi_rules, calorie_model, calorie_scaler, le_gender, le_workout, cal_features


EXERCISE_DB, BMI_RULES, CALORIE_MODEL, CALORIE_SCALER, LE_GENDER, LE_WORKOUT, CAL_FEATURES = _load()


def bmi_to_category(bmi: float) -> str:
    if bmi < 18.5:
        return "Underweight"
    elif bmi < 25:
        return "Normal"
    elif bmi < 30:
        return "Overweight"
    else:
        return "Obese"


def experience_to_level(exp: int) -> str:
    if exp <= 1:
        return "beginner"
    elif exp <= 2:
        return "intermediate"
    else:
        return "advanced"


def get_workout_category(bmi: float, goal: str) -> str:
    cat = bmi_to_category(bmi)
    return BMI_RULES.get((cat, goal), "Full_Body")


def get_exercises(category: str, level: str):
    return EXERCISE_DB.get(category, EXERCISE_DB["Full_Body"]).get(level, [])


def predict_calories(age, gender_str, weight_kg, height_m, bmi, fat_pct,
                     experience_level, workout_freq, session_duration, avg_bpm,
                     workout_type_str="Cardio"):
    gender_enc = 1 if gender_str.lower() == "male" else 0
    wt_enc_map = {k: i for i, k in enumerate(sorted(["Cardio", "HIIT", "Strength", "Yoga"]))}
    workout_enc = wt_enc_map.get(workout_type_str, 0)

    feat = np.array([[age, gender_enc, weight_kg, height_m, bmi,
                      fat_pct, experience_level, workout_freq,
                      session_duration, avg_bpm, workout_enc]])

    feat_scaled = CALORIE_SCALER.transform(feat)
    return float(CALORIE_MODEL.predict(feat_scaled)[0])


def recommend_workout(age, gender_str, weight_kg, height_m, bmi, fat_pct,
                      experience_level, workout_freq, session_duration,
                      avg_bpm, goal, health_conditions=None):
    category = get_workout_category(bmi, goal)
    level = experience_to_level(experience_level)
    exercises = get_exercises(category, level)

    cat_to_workout = {
        "Fat_Burn": "Cardio",
        "Low_Impact_Cardio": "Cardio",
        "HIIT": "HIIT",
        "Strength": "Strength",
        "Full_Body": "HIIT",
    }
    workout_type = cat_to_workout.get(category, "Cardio")
    predicted_calories = predict_calories(
        age, gender_str, weight_kg, height_m, bmi, fat_pct,
        experience_level, workout_freq, session_duration, avg_bpm, workout_type
    )

    return {
        "bmi_category": bmi_to_category(bmi),
        "workout_category": category,
        "fitness_level": level,
        "workouts": exercises,
        "predicted_calories_per_session": round(predicted_calories, 0),
        "disclaimer": (
            "These workouts are suggestions only. Ask your trainer to review "
            "and confirm they are suitable for you."
        ),
    }
