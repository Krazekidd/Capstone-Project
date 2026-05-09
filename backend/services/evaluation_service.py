"""
Trainer Evaluation Service
--------------------------
Handles trainer evaluation calculations and database operations.
Based on the logic from trainer_evaluation.py but adapted for the FastAPI application.

TRAINER grading:
  - Graded by: 1 Admin (weight=3) + 2 Senior Trainers (weight=2 each)
  - Uses weighted mean + weighted SD + performance flag + rater agreement message

SENIOR TRAINER grading:
  - Graded by: 1 Admin only (no weighting needed)
  - Uses simple mean across 5 sections + performance flag
"""

import math
from datetime import datetime, timezone, timedelta
from typing import List, Dict, Optional, Tuple
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_
from sqlalchemy.orm import selectinload
from decimal import Decimal

from models.models import Trainer, TrainerEvaluation, User
from schemas.schemas import (
    TrainerEvaluationRequest, 
    TrainerEvaluationResponse,
    TrainerEvaluationSummary,
    TrainerEvaluationListResponse
)


class EvaluationService:
    """Service for handling trainer evaluations."""
    
    # Evaluation criteria mapping
    CRITERIA = [
        {"key": "performance", "label": "Performance & Results", "icon": "🏆"},
        {"key": "motivation", "label": "Motivation & Energy", "icon": "⚡"},
        {"key": "interaction", "label": "Client Interaction", "icon": "🤝"},
        {"key": "knowledge", "label": "Technical Knowledge", "icon": "🧠"},
        {"key": "punctuality", "label": "Punctuality", "icon": "⏱️"},
    ]
    
    @staticmethod
    def get_performance_flag(score: float) -> str:
        """Returns green, yellow, or red based on final score out of 10."""
        if score >= 7.0:
            return "green"
        elif score >= 5.0:
            return "yellow"
        else:
            return "red"
    
    @staticmethod
    def get_agreement_message(sd: float) -> str:
        """Returns rater agreement message based on weighted SD."""
        if sd < 1.0:
            return "Raters are in agreement"
        elif sd <= 2.0:
            return "Raters slightly disagree"
        else:
            return "Raters strongly disagree"
    
    @staticmethod
    def compute_section_average(sections: List[float]) -> float:
        """
        Takes a list of 5 section scores (each out of 10).
        Returns the average out of 10.
        """
        if len(sections) != 5:
            raise ValueError("Exactly 5 section scores are required.")
        
        for s in sections:
            if s < 0 or s > 10:
                raise ValueError(f"Section score {s} is out of range (0-10).")
            if (s * 2) != int(s * 2):
                raise ValueError(f"Section score {s} must be a whole number or .5 increment.")
        
        return round(sum(sections) / 5, 4)
    
    @staticmethod
    def evaluate_trainer(
        admin_sections: List[float],
        senior1_sections: List[float],
        senior2_sections: List[float]
    ) -> Dict:
        """
        Evaluates a regular trainer using weighted mean and weighted SD.

        Weights:
          Admin            = 3
          Senior Trainer 1 = 2
          Senior Trainer 2 = 2
          Total            = 7

        Returns a dictionary with all results.
        """
        # Step 1 — compute each rater's average out of 10
        x1 = EvaluationService.compute_section_average(admin_sections)      # Admin
        x2 = EvaluationService.compute_section_average(senior1_sections)    # Senior Trainer 1
        x3 = EvaluationService.compute_section_average(senior2_sections)    # Senior Trainer 2

        weights = [3, 2, 2]
        scores = [x1, x2, x3]
        total_weight = sum(weights)  # = 7

        # Step 2 — weighted mean
        weighted_mean = sum(w * x for w, x in zip(weights, scores)) / total_weight
        weighted_mean = round(weighted_mean, 4)

        # Step 3 — weighted standard deviation
        variance = sum(w * (x - weighted_mean) ** 2 for w, x in zip(weights, scores))
        weighted_sd = math.sqrt(variance / (total_weight - 1))
        weighted_sd = round(weighted_sd, 4)

        # Step 4 — flag and agreement message
        flag = EvaluationService.get_performance_flag(weighted_mean)
        message = EvaluationService.get_agreement_message(weighted_sd)

        return {
            "role": "trainer",
            "admin_avg": x1,
            "senior1_avg": x2,
            "senior2_avg": x3,
            "weighted_mean": weighted_mean,
            "weighted_sd": weighted_sd,
            "performance_flag": flag,
            "rater_agreement": message
        }
    
    @staticmethod
    def evaluate_senior_trainer(admin_sections: List[float]) -> Dict:
        """
        Evaluates a senior trainer graded by the admin only.
        No weighting needed — straightforward section average.

        Returns a dictionary with all results.
        """
        # Step 1 — compute admin's average out of 10
        final_score = EvaluationService.compute_section_average(admin_sections)

        # Step 2 — flag only (no SD needed — only 1 rater)
        flag = EvaluationService.get_performance_flag(final_score)

        return {
            "role": "senior_trainer",
            "admin_avg": final_score,
            "final_score": final_score,
            "performance_flag": flag,
            "rater_agreement": "N/A - single rater"
        }
    
    @staticmethod
    def hours_ago(submitted_at: datetime) -> float:
        """Calculate hours elapsed since submission."""
        if not submitted_at:
            return 999
        return (datetime.now(timezone.utc) - submitted_at).total_seconds() / 3600
    
    @staticmethod
    def is_editable(submitted_at: datetime) -> bool:
        """Check if evaluation is still within 24-hour edit window."""
        return EvaluationService.hours_ago(submitted_at) < 24
    
    @staticmethod
    def hours_until_lock(submitted_at: datetime) -> Optional[float]:
        """Hours remaining until evaluation locks."""
        if not submitted_at:
            return None
        hours_elapsed = EvaluationService.hours_ago(submitted_at)
        if hours_elapsed >= 24:
            return 0
        return max(0, 24 - hours_elapsed)

    async def submit_evaluation(
        self, 
        db: AsyncSession, 
        evaluator_id: UUID, 
        request: TrainerEvaluationRequest
    ) -> TrainerEvaluation:
        """Submit a new trainer evaluation."""
        
        # Verify trainer exists
        result = await db.execute(
            select(Trainer).where(Trainer.id == request.trainer_id)
        )
        trainer = result.scalar_one_or_none()
        if not trainer:
            raise ValueError(f"Trainer with ID {request.trainer_id} not found")
        
        # Check if evaluation already exists for this evaluator/month/year
        existing = await db.execute(
            select(TrainerEvaluation).where(
                and_(
                    TrainerEvaluation.trainer_id == request.trainer_id,
                    TrainerEvaluation.evaluation_month == request.evaluation_month,
                    TrainerEvaluation.evaluation_year == request.evaluation_year,
                    TrainerEvaluation.evaluator_id == evaluator_id
                )
            )
        )
        existing_eval = existing.scalar_one_or_none()
        
        if existing_eval:
            # Check if still editable
            if not self.is_editable(existing_eval.submitted_at):
                raise ValueError("Evaluation is locked and cannot be modified")
            
            # Update existing evaluation
            existing_eval.performance_score = request.performance_score
            existing_eval.motivation_score = request.motivation_score
            existing_eval.interaction_score = request.interaction_score
            existing_eval.knowledge_score = request.knowledge_score
            existing_eval.punctuality_score = request.punctuality_score
            existing_eval.notes = request.notes
            existing_eval.updated_at = datetime.now(timezone.utc)
            
            await db.commit()
            await db.refresh(existing_eval)
            return existing_eval
        
        # Create new evaluation
        evaluation = TrainerEvaluation(
            trainer_id=request.trainer_id,
            evaluation_month=request.evaluation_month,
            evaluation_year=request.evaluation_year,
            evaluator_id=evaluator_id,
            evaluator_role=request.evaluator_role,
            performance_score=request.performance_score,
            motivation_score=request.motivation_score,
            interaction_score=request.interaction_score,
            knowledge_score=request.knowledge_score,
            punctuality_score=request.punctuality_score,
            notes=request.notes,
            submitted_at=datetime.now(timezone.utc),
            finalised=True,
            is_editable=True
        )
        
        # Calculate individual evaluator average
        sections = [
            float(request.performance_score),
            float(request.motivation_score),
            float(request.interaction_score),
            float(request.knowledge_score),
            float(request.punctuality_score)
        ]
        
        evaluator_avg = self.compute_section_average(sections)
        evaluation.final_score = Decimal(str(evaluator_avg))
        
        # Set performance flag
        evaluation.performance_flag = self.get_performance_flag(evaluator_avg)
        
        db.add(evaluation)
        await db.commit()
        await db.refresh(evaluation)
        
        # Check if we need to calculate weighted results (for regular trainers)
        await self._calculate_weighted_results(db, request.trainer_id, request.evaluation_month, request.evaluation_year)
        
        return evaluation
    
    async def _calculate_weighted_results(
        self, 
        db: AsyncSession, 
        trainer_id: UUID, 
        month: int, 
        year: int
    ):
        """Calculate weighted results when all evaluations are submitted."""
        
        # Get all evaluations for this trainer/month/year
        result = await db.execute(
            select(TrainerEvaluation).where(
                and_(
                    TrainerEvaluation.trainer_id == trainer_id,
                    TrainerEvaluation.evaluation_month == month,
                    TrainerEvaluation.evaluation_year == year
                )
            )
        )
        evaluations = result.scalars().all()
        
        # Need exactly 3 evaluations for weighted calculation (1 admin + 2 senior trainers)
        if len(evaluations) != 3:
            return
        
        # Separate by role
        admin_eval = None
        senior_evals = []
        
        for eval in evaluations:
            if eval.evaluator_role == "admin":
                admin_eval = eval
            elif eval.evaluator_role == "senior_trainer":
                senior_evals.append(eval)
        
        if not admin_eval or len(senior_evals) != 2:
            return
        
        # Get sections for each evaluator
        admin_sections = [
            float(admin_eval.performance_score),
            float(admin_eval.motivation_score),
            float(admin_eval.interaction_score),
            float(admin_eval.knowledge_score),
            float(admin_eval.punctuality_score)
        ]
        
        senior1_sections = [
            float(senior_evals[0].performance_score),
            float(senior_evals[0].motivation_score),
            float(senior_evals[0].interaction_score),
            float(senior_evals[0].knowledge_score),
            float(senior_evals[0].punctuality_score)
        ]
        
        senior2_sections = [
            float(senior_evals[1].performance_score),
            float(senior_evals[1].motivation_score),
            float(senior_evals[1].interaction_score),
            float(senior_evals[1].knowledge_score),
            float(senior_evals[1].punctuality_score)
        ]
        
        # Calculate weighted results
        weighted_results = self.evaluate_trainer(admin_sections, senior1_sections, senior2_sections)
        
        # Update all evaluations with weighted results
        for eval in evaluations:
            eval.weighted_mean = Decimal(str(weighted_results["weighted_mean"]))
            eval.weighted_sd = Decimal(str(weighted_results["weighted_sd"]))
            eval.performance_flag = weighted_results["performance_flag"]
            eval.rater_agreement = weighted_results["rater_agreement"]
            eval.updated_at = datetime.now(timezone.utc)
        
        await db.commit()
    
    async def get_trainer_evaluations(
        self,
        db: AsyncSession,
        trainer_id: Optional[UUID] = None,
        month: Optional[int] = None,
        year: Optional[int] = None
    ) -> TrainerEvaluationListResponse:
        """Get trainer evaluations with optional filters."""
        
        query = select(TrainerEvaluation).options(selectinload(TrainerEvaluation.trainer))
        
        conditions = []
        if trainer_id:
            conditions.append(TrainerEvaluation.trainer_id == trainer_id)
        if month:
            conditions.append(TrainerEvaluation.evaluation_month == month)
        if year:
            conditions.append(TrainerEvaluation.evaluation_year == year)
        
        if conditions:
            query = query.where(and_(*conditions))
        
        result = await db.execute(query)
        evaluations = result.scalars().all()
        
        # Group evaluations by trainer, month, year
        grouped_evals = {}
        for eval in evaluations:
            key = (eval.trainer_id, eval.evaluation_month, eval.evaluation_year)
            if key not in grouped_evals:
                grouped_evals[key] = []
            grouped_evals[key].append(eval)
        
        # Create summaries
        summaries = []
        for (trainer_id, month, year), evals in grouped_evals.items():
            summary = await self._create_evaluation_summary(db, trainer_id, month, year, evals)
            summaries.append(summary)
        
        return TrainerEvaluationListResponse(
            evaluations=summaries,
            total_count=len(summaries)
        )
    
    async def _create_evaluation_summary(
        self,
        db: AsyncSession,
        trainer_id: UUID,
        month: int,
        year: int,
        evaluations: List[TrainerEvaluation]
    ) -> TrainerEvaluationSummary:
        """Create a summary of evaluations for a trainer/month/year."""
        
        # Get trainer name
        trainer_result = await db.execute(
            select(Trainer).where(Trainer.id == trainer_id)
        )
        trainer = trainer_result.scalar_one_or_none()
        trainer_name = trainer.name if trainer else "Unknown"
        
        # Separate by role
        admin_eval = None
        senior_evals = []
        
        for eval in evaluations:
            if eval.evaluator_role == "admin":
                admin_eval = eval
            elif eval.evaluator_role == "senior_trainer":
                senior_evals.append(eval)
        
        # Get individual scores
        admin_score = admin_eval.final_score if admin_eval else None
        senior1_score = senior_evals[0].final_score if len(senior_evals) > 0 else None
        senior2_score = senior_evals[1].final_score if len(senior_evals) > 1 else None
        
        # Get weighted results (should be the same for all evaluations)
        weighted_mean = evaluations[0].weighted_mean if evaluations else None
        weighted_sd = evaluations[0].weighted_sd if evaluations else None
        performance_flag = evaluations[0].performance_flag if evaluations else None
        rater_agreement = evaluations[0].rater_agreement if evaluations else None
        
        # Check if complete (all 3 evaluations submitted)
        is_complete = len(evaluations) == 3
        
        # Check if any evaluation is still editable
        is_editable = any(self.is_editable(eval.submitted_at) for eval in evaluations)
        
        # Hours until lock (minimum across all evaluations)
        hours_until_lock = min(
            (self.hours_until_lock(eval.submitted_at) for eval in evaluations if self.hours_until_lock(eval.submitted_at) is not None),
            default=None
        )
        
        return TrainerEvaluationSummary(
            trainer_id=trainer_id,
            trainer_name=trainer_name,
            evaluation_month=month,
            evaluation_year=year,
            admin_score=admin_score,
            senior1_score=senior1_score,
            senior2_score=senior2_score,
            final_score=weighted_mean,
            weighted_mean=weighted_mean,
            weighted_sd=weighted_sd,
            performance_flag=performance_flag,
            rater_agreement=rater_agreement,
            is_complete=is_complete,
            is_editable=is_editable,
            hours_until_lock=hours_until_lock
        )
    
    async def get_evaluation_criteria(self) -> EvaluationCriteriaResponse:
        """Get evaluation criteria definitions."""
        return EvaluationCriteriaResponse(
            criteria=self.CRITERIA,
            score_ranges={
                "min": 1.0,
                "max": 10.0,
                "increments": 0.5,
                "description": "Scores must be whole numbers or .5 increments"
            },
            performance_flags={
                "green": {"range": "7.0-10.0", "label": "Excellent"},
                "yellow": {"range": "5.0-6.9", "label": "Good"},
                "red": {"range": "1.0-4.9", "label": "Needs Improvement"}
            }
        )


# Singleton instance
evaluation_service = EvaluationService()
