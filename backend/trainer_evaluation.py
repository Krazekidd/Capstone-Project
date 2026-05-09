"""
Trainer Evaluation System
--------------------------
Calculates weighted mean and weighted standard deviation
for grading trainers and senior trainers.

TRAINER grading:
  - Graded by: 1 Admin (weight=3) + 2 Senior Trainers (weight=2 each)
  - Uses weighted mean + weighted SD + performance flag + rater agreement message

SENIOR TRAINER grading:
  - Graded by: 1 Admin only (no weighting needed)
  - Uses simple mean across 5 sections + performance flag
"""

import psycopg2
import math

# --------------------------------------------------
# DATABASE CONNECTION — update these values
# --------------------------------------------------
DB_CONFIG = {
    "host":     "localhost",
    "port":     5432,
    "dbname":   "your_database_name",
    "user":     "your_username",
    "password": "your_password"
}

# --------------------------------------------------
# PERFORMANCE FLAG THRESHOLDS (out of 10)
# --------------------------------------------------
def get_performance_flag(score: float) -> str:
    """Returns green, yellow, or red based on final score out of 10."""
    if score >= 7.0:
        return "green"
    elif score >= 5.0:
        return "yellow"
    else:
        return "red"

# --------------------------------------------------
# RATER AGREEMENT MESSAGE (for weighted SD out of 10)
# --------------------------------------------------
def get_agreement_message(sd: float) -> str:
    """Returns rater agreement message based on weighted SD."""
    if sd < 1.0:
        return "Raters are in agreement"
    elif sd <= 2.0:
        return "Raters slightly disagree"
    else:
        return "Raters strongly disagree"

# --------------------------------------------------
# SECTION SCORE AVERAGE (same logic for both roles)
# --------------------------------------------------
def compute_section_average(sections: list) -> float:
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

# --------------------------------------------------
# TRAINER EVALUATION (3 raters: Admin + 2 Senior Trainers)
# --------------------------------------------------
def evaluate_trainer(
    admin_sections,
    senior1_sections,
    senior2_sections
) -> dict:
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
    x1 = compute_section_average(admin_sections)      # Admin
    x2 = compute_section_average(senior1_sections)    # Senior Trainer 1
    x3 = compute_section_average(senior2_sections)    # Senior Trainer 2

    weights      = [3, 2, 2]
    scores       = [x1, x2, x3]
    total_weight = sum(weights)  # = 7

    # Step 2 — weighted mean
    weighted_mean = sum(w * x for w, x in zip(weights, scores)) / total_weight
    weighted_mean = round(weighted_mean, 4)

    # Step 3 — weighted standard deviation
    variance    = sum(w * (x - weighted_mean) ** 2 for w, x in zip(weights, scores))
    weighted_sd = math.sqrt(variance / (total_weight - 1))
    weighted_sd = round(weighted_sd, 4)

    # Step 4 — flag and agreement message
    flag    = get_performance_flag(weighted_mean)
    message = get_agreement_message(weighted_sd)

    return {
        "role":             "trainer",
        "admin_avg":        x1,
        "senior1_avg":      x2,
        "senior2_avg":      x3,
        "weighted_mean":    weighted_mean,
        "weighted_sd":      weighted_sd,
        "performance_flag": flag,
        "rater_agreement":  message
    }

# --------------------------------------------------
# SENIOR TRAINER EVALUATION (Admin only — simple mean)
# --------------------------------------------------
def evaluate_senior_trainer(admin_sections) -> dict:
    """
    Evaluates a senior trainer graded by the admin only.
    No weighting needed — straightforward section average.

    Returns a dictionary with all results.
    """
    # Step 1 — compute admin's average out of 10
    final_score = compute_section_average(admin_sections)

    # Step 2 — flag only (no SD needed — only 1 rater)
    flag = get_performance_flag(final_score)

    return {
        "role":             "senior_trainer",
        "admin_avg":        final_score,
        "final_score":      final_score,
        "performance_flag": flag,
        "rater_agreement":  "N/A - single rater"
    }

# --------------------------------------------------
# SAVE RESULT TO POSTGRESQL
# --------------------------------------------------
def save_to_db(employee_id: int, result: dict):
    """
    Saves the evaluation result to the evaluations table in PostgreSQL.

    Run this once in your database to create the table:

        CREATE TABLE evaluations (
            id               SERIAL PRIMARY KEY,
            employee_id      INT NOT NULL,
            role             VARCHAR(20),
            admin_avg        NUMERIC(5,2),
            senior1_avg      NUMERIC(5,2),
            senior2_avg      NUMERIC(5,2),
            final_score      NUMERIC(5,2),
            weighted_sd      NUMERIC(5,2),
            performance_flag VARCHAR(10),
            rater_agreement  VARCHAR(50),
            evaluated_at     TIMESTAMP DEFAULT NOW()
        );
    """
    conn = psycopg2.connect(**DB_CONFIG)
    cur  = conn.cursor()

    cur.execute("""
        INSERT INTO evaluations (
            employee_id,
            role,
            admin_avg,
            senior1_avg,
            senior2_avg,
            final_score,
            weighted_sd,
            performance_flag,
            rater_agreement
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
    """, (
        employee_id,
        result.get("role"),
        result.get("admin_avg"),
        result.get("senior1_avg"),
        result.get("senior2_avg"),
        result.get("weighted_mean") or result.get("final_score"),
        result.get("weighted_sd"),
        result.get("performance_flag"),
        result.get("rater_agreement")
    ))

    conn.commit()
    cur.close()
    conn.close()
    print(f"Saved evaluation for employee {employee_id} to database.")

# --------------------------------------------------
# EXAMPLE USAGE
# --------------------------------------------------
if __name__ == "__main__":

    # --- TRAINER EXAMPLE ---
    trainer_result = evaluate_trainer(
        admin_sections   = [8.0, 7.5, 9.0, 8.5, 7.0],   # Admin grades
        senior1_sections = [7.0, 6.5, 8.0, 7.5, 6.0],   # Senior Trainer 1 grades
        senior2_sections = [6.0, 6.0, 7.0, 6.5, 5.5]    # Senior Trainer 2 grades
    )

    print("=== TRAINER EVALUATION ===")
    print(f"  Admin avg:        {trainer_result['admin_avg']} / 10")
    print(f"  Senior 1 avg:     {trainer_result['senior1_avg']} / 10")
    print(f"  Senior 2 avg:     {trainer_result['senior2_avg']} / 10")
    print(f"  Weighted Mean:    {trainer_result['weighted_mean']} / 10")
    print(f"  Weighted SD:      {trainer_result['weighted_sd']}")
    print(f"  Performance Flag: {trainer_result['performance_flag'].upper()}")
    print(f"  Rater Agreement:  {trainer_result['rater_agreement']}")

    # Uncomment to save to database:
    # save_to_db(employee_id=101, result=trainer_result)

    print()

    # --- SENIOR TRAINER EXAMPLE ---
    senior_result = evaluate_senior_trainer(
        admin_sections = [9.0, 8.5, 9.0, 9.5, 8.0]    # Admin grades only
    )

    print("=== SENIOR TRAINER EVALUATION ===")
    print(f"  Admin avg:        {senior_result['admin_avg']} / 10")
    print(f"  Final Score:      {senior_result['final_score']} / 10")
    print(f"  Performance Flag: {senior_result['performance_flag'].upper()}")
    print(f"  Rater Agreement:  {senior_result['rater_agreement']}")

    # Uncomment to save to database:
    # save_to_db(employee_id=202, result=senior_result)
