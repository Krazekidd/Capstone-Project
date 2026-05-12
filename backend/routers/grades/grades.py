"""
Trainer Grades API Routes
-------------------------
POST   /api/grades              — Submit a grade
PUT    /api/grades/:id          — Update within 24-hour window
GET    /api/grades              — Fetch all grades for a trainer (?trainer_id=)
GET    /api/grades/trainers     — List all non-senior trainers with grades + client ratings
"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from schemas.schemas import GradeSubmitRequest, GradeResponse, GradeListResponse
from services.grades_service import (
    submit_grade as svc_submit,
    update_grade as svc_update,
    get_grades_for_trainer as svc_get_grades,
    get_all_trainers_with_grades as svc_get_trainers,
    get_grades_for_trainer_month as svc_get_trainer_month_grades,
)
from utils.auth import require_admin_or_senior_trainer
from routers.auth.auth import get_current_user

router = APIRouter(prefix="/api/grades", tags=["grades"])


@router.get("/trainers")
async def list_trainers_for_grading(
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Return all non-senior trainers with their grades and per-month client ratings."""
    return await svc_get_trainers(db)


@router.post("", response_model=GradeResponse, status_code=201)
async def submit_grade(
    request: GradeSubmitRequest,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_admin_or_senior_trainer),
):
    return await svc_submit(db, request)


@router.put("/{grade_id}", response_model=GradeResponse)
async def update_grade_endpoint(
    grade_id: str,
    request: GradeSubmitRequest,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_admin_or_senior_trainer),
):
    return await svc_update(db, grade_id, request)


@router.get("", response_model=GradeListResponse)
async def get_grades(
    trainer_id: str = Query(..., description="Trainer UUID to fetch grades for"),
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return await svc_get_grades(db, trainer_id)


@router.get("/trainer-month")
async def get_trainer_month_grades(
    trainer_id: str = Query(..., description="Trainer UUID to fetch grades for"),
    month_index: int = Query(..., description="Month index (0-11 for Jan-Dec)"),
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Get all grades for a specific trainer and month from different senior trainers"""
    return await svc_get_trainer_month_grades(db, trainer_id, month_index)
