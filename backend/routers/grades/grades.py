"""
Trainer Grades API Routes
-------------------------
POST   /api/grades          — Submit a grade
PUT    /api/grades/:id      — Update within 24-hour window
GET    /api/grades          — Fetch all grades for a trainer (?trainer_id=)
"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from schemas.schemas import GradeSubmitRequest, GradeResponse, GradeListResponse
from services.grades_service import submit_grade as svc_submit, update_grade as svc_update, get_grades_for_trainer as svc_get_grades
from utils.auth import require_admin_or_senior_trainer
from routers.auth.auth import get_current_user

router = APIRouter(prefix="/api/grades", tags=["grades"])


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
