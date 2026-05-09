"""
Trainer Evaluation API Routes
-----------------------------
API endpoints for submitting and retrieving trainer evaluations.
Supports both regular trainer and senior trainer evaluation workflows.
"""

from uuid import UUID
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from schemas.schemas import (
    TrainerEvaluationRequest,
    TrainerEvaluationResponse,
    TrainerEvaluationListResponse,
    EvaluationCriteriaResponse
)
from services.evaluation_service import evaluation_service
from utils.auth import get_current_user, require_admin_or_senior_trainer

router = APIRouter(prefix="/evaluations", tags=["evaluations"])


@router.post("/submit", response_model=TrainerEvaluationResponse)
async def submit_evaluation(
    request: TrainerEvaluationRequest,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(require_admin_or_senior_trainer)
):
    """
    Submit a trainer evaluation.
    
    - Admins can evaluate any trainer
    - Senior trainers can evaluate regular trainers
    - Evaluations are locked after 24 hours
    - Regular trainers require 3 evaluations (1 admin + 2 senior trainers)
    - Senior trainers require 1 evaluation (admin only)
    """
    try:
        # Validate evaluator role matches user role
        if current_user.role == "admin" and request.evaluator_role != "admin":
            raise HTTPException(
                status_code=400, 
                detail="Admins must submit evaluations with evaluator_role='admin'"
            )
        elif current_user.role == "trainer" and request.evaluator_role != "senior_trainer":
            raise HTTPException(
                status_code=400,
                detail="Senior trainers must submit evaluations with evaluator_role='senior_trainer'"
            )
        
        # Submit evaluation
        evaluation = await evaluation_service.submit_evaluation(
            db=db,
            evaluator_id=current_user.id,
            request=request
        )
        
        return evaluation
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to submit evaluation: {str(e)}")


@router.get("/", response_model=TrainerEvaluationListResponse)
async def get_evaluations(
    trainer_id: Optional[UUID] = Query(None, description="Filter by trainer ID"),
    month: Optional[int] = Query(None, ge=1, le=12, description="Filter by month (1-12)"),
    year: Optional[int] = Query(None, ge=2020, le=2030, description="Filter by year"),
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Get trainer evaluations with optional filters.
    
    - Admins can view all evaluations
    - Senior trainers can view evaluations for trainers they evaluate
    - Regular trainers can only view their own evaluations
    """
    try:
        # Apply role-based filtering
        if current_user.role == "trainer":
            # Trainers can only view their own evaluations
            if trainer_id and trainer_id != current_user.trainer_profile.id:
                raise HTTPException(
                    status_code=403,
                    detail="Trainers can only view their own evaluations"
                )
            trainer_id = current_user.trainer_profile.id
        
        elif current_user.role == "trainer" and not current_user.trainer_profile.is_senior:
            # Regular trainers can only view their own evaluations
            if trainer_id and trainer_id != current_user.trainer_profile.id:
                raise HTTPException(
                    status_code=403,
                    detail="Regular trainers can only view their own evaluations"
                )
            trainer_id = current_user.trainer_profile.id
        
        # Get evaluations
        evaluations = await evaluation_service.get_trainer_evaluations(
            db=db,
            trainer_id=trainer_id,
            month=month,
            year=year
        )
        
        return evaluations
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve evaluations: {str(e)}")


@router.get("/criteria", response_model=EvaluationCriteriaResponse)
async def get_evaluation_criteria(
    current_user = Depends(get_current_user)
):
    """
    Get evaluation criteria definitions.
    
    Returns the scoring criteria, score ranges, and performance flag definitions.
    """
    try:
        return evaluation_service.get_evaluation_criteria()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve criteria: {str(e)}")


@router.get("/trainer/{trainer_id}", response_model=TrainerEvaluationListResponse)
async def get_trainer_evaluations(
    trainer_id: UUID,
    month: Optional[int] = Query(None, ge=1, le=12, description="Filter by month (1-12)"),
    year: Optional[int] = Query(None, ge=2020, le=2030, description="Filter by year"),
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Get evaluations for a specific trainer.
    
    - Admins can view any trainer's evaluations
    - Senior trainers can view evaluations for trainers they evaluate
    - Regular trainers can only view their own evaluations
    """
    try:
        # Apply role-based access control
        if current_user.role == "trainer":
            # Check if trainer is viewing their own evaluations
            if not current_user.trainer_profile or trainer_id != current_user.trainer_profile.id:
                raise HTTPException(
                    status_code=403,
                    detail="Trainers can only view their own evaluations"
                )
        
        # Get evaluations
        evaluations = await evaluation_service.get_trainer_evaluations(
            db=db,
            trainer_id=trainer_id,
            month=month,
            year=year
        )
        
        return evaluations
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve trainer evaluations: {str(e)}")


@router.get("/summary/{trainer_id}/{month}/{year}")
async def get_evaluation_summary(
    trainer_id: UUID,
    month: int,
    year: int,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Get a detailed summary of evaluations for a specific trainer and month.
    
    Returns individual evaluator scores and calculated weighted results.
    """
    try:
        # Apply role-based access control
        if current_user.role == "trainer":
            # Check if trainer is viewing their own evaluations
            if not current_user.trainer_profile or trainer_id != current_user.trainer_profile.id:
                raise HTTPException(
                    status_code=403,
                    detail="Trainers can only view their own evaluations"
                )
        
        # Get evaluations for specific trainer/month/year
        evaluations = await evaluation_service.get_trainer_evaluations(
            db=db,
            trainer_id=trainer_id,
            month=month,
            year=year
        )
        
        # Find the specific evaluation
        target_eval = None
        for eval_summary in evaluations.evaluations:
            if (eval_summary.trainer_id == trainer_id and 
                eval_summary.evaluation_month == month and 
                eval_summary.evaluation_year == year):
                target_eval = eval_summary
                break
        
        if not target_eval:
            raise HTTPException(
                status_code=404,
                detail=f"No evaluations found for trainer {trainer_id} in {month}/{year}"
            )
        
        return target_eval
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve evaluation summary: {str(e)}")


@router.get("/pending")
async def get_pending_evaluations(
    db: AsyncSession = Depends(get_db),
    current_user = Depends(require_admin_or_senior_trainer)
):
    """
    Get evaluations that are still pending completion.
    
    For regular trainers: shows which trainers still need evaluations from required raters.
    For senior trainers: shows which senior trainers haven't been evaluated by admin yet.
    """
    try:
        # This is a placeholder for a more complex query
        # In a full implementation, you would query for trainers that don't have
        # the required number of evaluations for the current month
        
        # For now, return all evaluations that are not complete
        evaluations = await evaluation_service.get_trainer_evaluations(db=db)
        
        # Filter for incomplete evaluations
        pending = [eval for eval in evaluations.evaluations if not eval.is_complete]
        
        return {"pending_evaluations": pending, "count": len(pending)}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve pending evaluations: {str(e)}")


@router.get("/my-submissions")
async def get_my_evaluations(
    db: AsyncSession = Depends(get_db),
    current_user = Depends(require_admin_or_senior_trainer)
):
    """
    Get evaluations submitted by the current user.
    
    Shows all evaluations that the current admin or senior trainer has submitted.
    """
    try:
        # Get all evaluations and filter by evaluator
        all_evaluations = await evaluation_service.get_trainer_evaluations(db=db)
        
        # Filter by current user's evaluator ID
        my_evaluations = []
        for eval_summary in all_evaluations.evaluations:
            # This would require modifying the service to track evaluator_id in summaries
            # For now, return all evaluations as a placeholder
            my_evaluations.append(eval_summary)
        
        return {"evaluations": my_evaluations, "count": len(my_evaluations)}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve your evaluations: {str(e)}")
