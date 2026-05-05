"""Food recommendation engine — content-based filtering with cosine similarity."""
import os

import joblib
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

MODEL_DIR = os.path.join(os.path.dirname(__file__), "models")

_food_db = None
_nutrition_matrix = None
_ideal_profiles = None
_nutrition_cols = None


def _load():
    global _food_db, _nutrition_matrix, _ideal_profiles, _nutrition_cols
    _food_db = joblib.load(os.path.join(MODEL_DIR, "food_database.pkl"))
    _nutrition_matrix = joblib.load(os.path.join(MODEL_DIR, "food_nutrition_matrix.pkl"))
    _ideal_profiles = joblib.load(os.path.join(MODEL_DIR, "food_ideal_profiles.pkl"))
    _nutrition_cols = joblib.load(os.path.join(MODEL_DIR, "food_nutrition_cols.pkl"))


_load()


def suggest_foods(goal: str, top_n: int = 10, exclude_high_sugar: bool = True):
    ideal = _ideal_profiles.get(goal, _ideal_profiles["maintain"])
    sims = cosine_similarity(ideal.reshape(1, -1), _nutrition_matrix)[0]

    df = _food_db.copy()
    df["similarity_score"] = sims

    if exclude_high_sugar and goal == "lose_weight":
        sugar_threshold = df["Sugars"].quantile(0.7)
        df = df[df["Sugars"] <= sugar_threshold]

    top = df.nlargest(top_n, "similarity_score").reset_index(drop=True)

    return [
        {
            "food": row["food"],
            "calories": round(row["Caloric Value"], 1),
            "protein_g": round(row["Protein"], 1),
            "fat_g": round(row["Fat"], 1),
            "carbs_g": round(row["Carbohydrates"], 1),
            "fiber_g": round(row.get("Dietary Fiber", 0), 1),
            "similarity_score": round(row["similarity_score"], 4),
        }
        for _, row in top.iterrows()
    ]
