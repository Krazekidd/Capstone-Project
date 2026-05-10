"""
Seed test accounts for development.
Called once during API startup — skips insertion if accounts already exist.

Test credentials
----------------
Senior Trainer : senior@badpeople.fit  / password123
Trainer        : trainer@badpeople.fit / password123
Admin          : admin@badpeople.fit   / password123
"""

import uuid
import logging
import bcrypt

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models.models import User, Trainer, Admin

logger = logging.getLogger(__name__)

# ── Shared password for all seed accounts ──────────────────────────────────
_SEED_PASSWORD = "password123"


def _hash(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


# ── Seed definitions ────────────────────────────────────────────────────────
SEED_USERS = [
    {
        "email":      "senior@badpeople.fit",
        "first_name": "Jordan",
        "last_name":  "Calloway",
        "role":       "trainer",
        "profile": {
            "type":        "trainer",
            "name":        "Jordan Calloway",
            "is_senior":   True,
            "trainer_level": "expert",
            "certification": "NSCA-CSCS · Olympic Lifting Coach · CPR/AED",
            "specialties": ["Strength", "Olympic Lifting", "Powerlifting", "Sports Conditioning"],
            "bio":         "Elite performance coach specialising in strength conditioning and functional movement.",
            "experience_years": 18,
        },
    },
    {
        "email":      "trainer@badpeople.fit",
        "first_name": "Riley",
        "last_name":  "Okafor",
        "role":       "trainer",
        "profile": {
            "type":        "trainer",
            "name":        "Riley Okafor",
            "is_senior":   False,
            "trainer_level": "advanced",
            "certification": "NASM-CPT",
            "specialties": ["Combat", "Conditioning"],
            "bio":         "Combat and conditioning specialist with 14 years of experience.",
            "experience_years": 14,
        },
    },
    {
        "email":      "admin@badpeople.fit",
        "first_name": "Morgan",
        "last_name":  "Vance",
        "role":       "admin",
        "profile": {
            "type":       "admin",
            "name":       "Morgan Vance",
            "department": "Operations",
            "access_level": "full",
        },
    },
]


async def run_seed(db: AsyncSession) -> None:
    """Insert seed accounts if they don't already exist."""
    inserted = 0

    for seed in SEED_USERS:
        # Check by email — skip if already present
        result = await db.execute(select(User).where(User.email == seed["email"]))
        if result.scalar_one_or_none():
            logger.info(f"[seed] {seed['email']} already exists — skipping")
            continue

        user_id = uuid.uuid4()
        user = User(
            id=user_id,
            email=seed["email"],
            password_hash=_hash(_SEED_PASSWORD),
            first_name=seed["first_name"],
            last_name=seed["last_name"],
            role=seed["role"],
            is_email_verified=True,
            is_active=True,
        )
        db.add(user)
        await db.flush()  # get the id into the session before creating profile

        p = seed["profile"]
        if p["type"] == "trainer":
            profile = Trainer(
                id=user_id,
                name=p["name"],
                is_senior=p["is_senior"],
                trainer_level=p["trainer_level"],
                certification=p.get("certification"),
                specialties=p.get("specialties", []),
                bio=p.get("bio"),
                experience_years=p.get("experience_years", 0),
            )
        else:
            profile = Admin(
                id=user_id,
                name=p["name"],
                department=p.get("department"),
                access_level=p.get("access_level", "full"),
            )

        db.add(profile)
        inserted += 1
        logger.info(f"[seed] Created {seed['role']} → {seed['email']}")

    if inserted:
        await db.commit()
        logger.info(f"[seed] Done — {inserted} account(s) inserted")
    else:
        logger.info("[seed] All seed accounts already present — nothing to do")
