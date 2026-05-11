"""
Trainer Grades Service
----------------------
Business logic for submitting, updating, and fetching trainer grades.
Enforces the 24-hour edit window lock and server-side avg computation.
"""

from datetime import datetime, timezone, timedelta
from uuid import UUID
import uuid

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models.models import TrainerGrade, Trainer, TrainerRating
from schemas.schemas import GradeSubmitRequest, GradeResponse, GradeListResponse

LOCK_HOURS = 24
SCORE_FIELDS = ["performance", "motivation", "interaction", "knowledge", "punctuality"]


def _compute_avg(scores: dict) -> float:
    values = [scores[f] for f in SCORE_FIELDS if f in scores]
    return round(sum(values) / len(values), 2) if values else 0.0


def _hours_remaining(submitted_at: datetime) -> float:
    now = datetime.now(timezone.utc)
    elapsed = (now - submitted_at).total_seconds() / 3600
    return round(max(0.0, LOCK_HOURS - elapsed), 2)


def _is_locked(submitted_at: datetime) -> bool:
    return _hours_remaining(submitted_at) == 0.0


def _to_response(grade: TrainerGrade) -> GradeResponse:
    locked = _is_locked(grade.submitted_at)
    hrs = _hours_remaining(grade.submitted_at) if not locked else None
    return GradeResponse(
        id=str(grade.id),
        trainer_id=str(grade.trainer_id),
        month_index=grade.month_index,
        scores=grade.scores,
        overall_avg=float(grade.overall_avg),
        notes=grade.notes,
        submitted_by=str(grade.submitted_by),
        submitted_at=grade.submitted_at.isoformat(),
        finalised=grade.finalised,
        locked=locked,
        hours_remaining=hrs,
    )


async def submit_grade(db: AsyncSession, request: GradeSubmitRequest) -> GradeResponse:
    scores_dict = request.scores.model_dump()
    avg = _compute_avg(scores_dict)

    grade = TrainerGrade(
        id=uuid.uuid4(),
        trainer_id=request.trainer_id,
        month_index=request.month_index,
        scores=scores_dict,
        overall_avg=avg,
        notes=request.notes,
        submitted_by=request.submitted_by,
        submitted_at=datetime.now(timezone.utc),
        finalised=True,
    )
    db.add(grade)
    await db.commit()
    await db.refresh(grade)
    return _to_response(grade)


async def update_grade(db: AsyncSession, grade_id: str, request: GradeSubmitRequest) -> GradeResponse:
    result = await db.execute(select(TrainerGrade).where(TrainerGrade.id == UUID(grade_id)))
    grade = result.scalar_one_or_none()

    if not grade:
        raise HTTPException(status_code=404, detail="Grade not found")

    if _is_locked(grade.submitted_at):
        locked_at = (grade.submitted_at + timedelta(hours=LOCK_HOURS)).isoformat()
        raise HTTPException(
            status_code=403,
            detail={
                "error": "grade_locked",
                "message": "This grade is permanently locked. The 24-hour edit window has expired.",
                "locked_at": locked_at,
            },
        )

    if grade.submitted_by != request.submitted_by:
        raise HTTPException(
            status_code=403,
            detail="Only the original submitter can update this grade",
        )

    scores_dict = request.scores.model_dump()
    grade.trainer_id = request.trainer_id
    grade.month_index = request.month_index
    grade.scores = scores_dict
    grade.overall_avg = _compute_avg(scores_dict)
    grade.notes = request.notes

    await db.commit()
    await db.refresh(grade)
    return _to_response(grade)


async def get_grades_for_trainer(db: AsyncSession, trainer_id: str) -> GradeListResponse:
    result = await db.execute(
        select(TrainerGrade)
        .where(TrainerGrade.trainer_id == UUID(trainer_id))
        .order_by(TrainerGrade.submitted_at.desc())
    )
    grades = result.scalars().all()
    return GradeListResponse(
        trainer_id=trainer_id,
        grades=[_to_response(g) for g in grades],
    )


async def get_all_trainers_with_grades(db: AsyncSession) -> list:
    """
    Return every non-senior trainer with:
      - profile fields (id, name, role, exp, img)
      - grades keyed by month_index
      - client ratings per month (avg rating per calendar month, indices 0-10)
    """
    from models.models import Trainer, TrainerRating, User
    from sqlalchemy.orm import selectinload
    from sqlalchemy import extract

    # Load all non-senior trainers with their grades and ratings
    result = await db.execute(
        select(Trainer)
        .where(Trainer.is_senior == False)
        .options(
            selectinload(Trainer.grades),
            selectinload(Trainer.trainer_ratings),
            selectinload(Trainer.user),
        )
    )
    trainers = result.scalars().all()

    output = []
    for t in trainers:
        # Build grades dict keyed by month_index
        grades_by_month = {}
        for g in t.grades:
            locked = _is_locked(g.submitted_at)
            hrs = _hours_remaining(g.submitted_at) if not locked else None
            grades_by_month[g.month_index] = {
                "id": str(g.id),
                "scores": g.scores,
                "overall_avg": float(g.overall_avg),
                "notes": g.notes,
                "submitted_by": str(g.submitted_by) if g.submitted_by else None,
                "submitted_at": g.submitted_at.isoformat(),
                "finalised": g.finalised,
                "locked": locked,
                "hours_remaining": hrs,
            }

        # Build per-month client ratings array (indices 0-11 = Jan-Dec)
        # Group ratings by month of created_at, average per month slot
        monthly_buckets: dict[int, list[float]] = {i: [] for i in range(12)}
        for r in t.trainer_ratings:
            # month 1-12 maps to index 0-11
            m = r.created_at.month  # 1-12
            idx = m - 1             # 0-11
            if 0 <= idx <= 11:
                monthly_buckets[idx].append(float(r.rating))

        client_ratings = [
            round(sum(v) / len(v), 2) if v else None
            for v in monthly_buckets.values()
        ]

        output.append({
            "id": str(t.id),
            "name": t.name,
            "role": t.bio or "",          # bio used as role/specialty label
            "specialties": t.specialties or [],
            "exp": f"{t.experience_years} yrs" if t.experience_years else "—",
            "img": t.profile_image or "",
            "grades": grades_by_month,
            "clientRatings": client_ratings,
        })

    return output


async def get_senior_trainer_performance(db: AsyncSession, trainer_id: str) -> dict:
    """
    Get performance data for a senior trainer including:
      - internal grades by month (as percentages)
      - client ratings by month (1-5 scale)
    Returns data structure expected by frontend:
    {
        "myInternal": [float],  # 12 values for Jan-Dec (as percentages)
        "myClient": [float]     # 12 values for Jan-Dec (1-5 scale)
    }
    """
    from sqlalchemy.orm import selectinload
    from sqlalchemy import extract
    
    # Load senior trainer with their grades and ratings
    result = await db.execute(
        select(Trainer)
        .where(Trainer.id == UUID(trainer_id))
        .options(
            selectinload(Trainer.grades),
            selectinload(Trainer.trainer_ratings),
        )
    )
    trainer = result.scalar_one_or_none()
    
    if not trainer:
        return {"myInternal": [], "myClient": []}
    
    # Build per-month internal grades array (indices 0-11 = Jan-Dec)
    # Convert grade averages to percentages (score out of 10 * 10)
    monthly_internal: dict[int, list[float]] = {i: [] for i in range(12)}
    for grade in trainer.grades:
        if grade.finalised and grade.overall_avg is not None:
            month_idx = grade.month_index  # 0-11 for Jan-Dec
            if 0 <= month_idx <= 11:
                # Convert score from 0-10 scale to 0-100 percentage
                percentage = float(grade.overall_avg) * 10
                monthly_internal[month_idx].append(percentage)
    
    internal_ratings = [
        round(sum(v) / len(v), 1) if v else None
        for v in monthly_internal.values()
    ]
    
    # Build per-month client ratings array (indices 0-11 = Jan-Dec)
    # Group ratings by month of created_at, average per month slot
    monthly_client: dict[int, list[float]] = {i: [] for i in range(12)}
    for rating in trainer.trainer_ratings:
        # month 1-12 maps to index 0-11
        m = rating.created_at.month  # 1-12
        idx = m - 1                 # 0-11
        if 0 <= idx <= 11:
            monthly_client[idx].append(float(rating.rating))
    
    client_ratings = [
        round(sum(v) / len(v), 2) if v else None
        for v in monthly_client.values()
    ]
    
    return {
        "myInternal": internal_ratings,
        "myClient": client_ratings
    }
