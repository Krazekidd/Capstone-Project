"""ML food recommendation router."""
from fastapi import APIRouter, HTTPException, Query
from schemas import MLUserProfile, MLFoodResponse, MLFoodItem
from ml.ml.recommendation_engine import suggest_foods

router = APIRouter(prefix="/api/ml/food", tags=["ML - Food"])


@router.post("/suggest", response_model=MLFoodResponse)
def get_food_suggestions(
    profile: MLUserProfile,
    top_n: int = Query(10, ge=5, le=30, description="Number of food suggestions"),
):
    """
    Returns top-N food recommendations based on the user's fitness goal,
    using cosine similarity against ideal nutritional profiles.
    """
    try:
        foods = suggest_foods(
            goal=profile.goal,
            top_n=top_n,
            exclude_high_sugar=(profile.goal == "lose_weight"),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    goal_context = {
        "lose_weight": "High-protein, high-fiber, low-calorie foods to support fat loss",
        "gain_muscle": "High-protein, moderate-carb foods to fuel muscle growth",
        "maintain": "Balanced-macro foods to maintain your current physique",
    }

    return MLFoodResponse(
        goal=profile.goal,
        suggestions=[MLFoodItem(**f) for f in foods],
        note=goal_context.get(profile.goal, "Personalised food suggestions based on your goal."),
    )
