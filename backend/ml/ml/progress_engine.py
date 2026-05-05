"""Progress prediction engine — projects body metrics over weeks/months."""
import warnings
import os
warnings.filterwarnings("ignore", category=UserWarning)

import joblib
import numpy as np

MODEL_DIR = os.path.join(os.path.dirname(__file__), "models")

_models = {}
_scalers = {}
_features = None


def _load():
    global _features
    for tgt in ("weight", "bmi", "fat_pct"):
        _models[tgt] = joblib.load(os.path.join(MODEL_DIR, f"progress_{tgt}_model.pkl"))
        _scalers[tgt] = joblib.load(os.path.join(MODEL_DIR, f"progress_{tgt}_scaler.pkl"))
    _features = joblib.load(os.path.join(MODEL_DIR, "progress_features.pkl"))


_load()

BMI_CAT_ENC = {k: i for i, k in enumerate(sorted(["Underweight", "Normal", "Overweight", "Obese"]))}
WORKOUT_ENC = {k: i for i, k in enumerate(sorted(["Cardio", "HIIT", "Strength", "Yoga"]))}

WEEK_LABELS = {0: "Now", 4: "Month 1", 8: "Month 2", 12: "Month 3", 26: "Month 6", 52: "1 Year"}


def bmi_to_category(bmi):
    if bmi < 18.5:
        return "Underweight"
    elif bmi < 25:
        return "Normal"
    elif bmi < 30:
        return "Overweight"
    else:
        return "Obese"


def project_progress(age, gender_str, start_weight, height_m, start_fat_pct,
                     experience_level, workout_freq, session_duration, avg_bpm,
                     weekly_calories, workout_category="Fat_Burn",
                     workout_history=None):
    gender_enc = 1 if gender_str.lower() == "male" else 0
    start_bmi = start_weight / (height_m ** 2)
    bmi_cat = bmi_to_category(start_bmi)
    bmi_cat_enc = BMI_CAT_ENC.get(bmi_cat, 1)

    cat_to_wt = {
        "Fat_Burn": "Cardio", "Low_Impact_Cardio": "Cardio",
        "HIIT": "HIIT", "Strength": "Strength", "Full_Body": "HIIT",
    }
    wt_str = cat_to_wt.get(workout_category, "Cardio")
    wt_enc = WORKOUT_ENC.get(wt_str, 0)

    calibration = 1.0
    if workout_history and len(workout_history) >= 2:
        latest = sorted(workout_history, key=lambda x: x.get("week", 0))[-1]
        hist_week = latest.get("week", 0)
        hist_weight = latest.get("actual_weight", start_weight)
        if hist_week > 0:
            feat_hist = np.array([[age, gender_enc, start_weight, start_bmi, start_fat_pct,
                                   experience_level, workout_freq, session_duration, avg_bpm,
                                   weekly_calories, bmi_cat_enc, wt_enc, hist_week]])
            pred_hist = float(_models["weight"].predict(_scalers["weight"].transform(feat_hist))[0])
            if pred_hist != start_weight:
                calibration = (hist_weight - start_weight) / (pred_hist - start_weight)
                calibration = max(0.5, min(1.5, calibration))

    results = [
        {
            "weeks": 0,
            "label": "Now",
            "weight": round(start_weight, 1),
            "bmi": round(start_bmi, 1),
            "fat_pct": round(start_fat_pct, 1),
        }
    ]

    for weeks in [4, 8, 12, 26, 52]:
        feat = np.array([[age, gender_enc, start_weight, start_bmi, start_fat_pct,
                          experience_level, workout_freq, session_duration, avg_bpm,
                          weekly_calories, bmi_cat_enc, wt_enc, weeks]])
        row = {"weeks": weeks, "label": WEEK_LABELS[weeks]}
        for tgt in ("weight", "bmi", "fat_pct"):
            raw = float(_models[tgt].predict(_scalers[tgt].transform(feat))[0])
            if tgt == "weight" and calibration != 1.0:
                raw = start_weight + (raw - start_weight) * calibration
            row[tgt] = round(raw, 1)
        results.append(row)

    return results
