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

from models.models import TrainerGrade
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
