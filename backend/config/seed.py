"""
Seed test accounts for development.
Called once during API startup — skips insertion if accounts already exist.

Test credentials
----------------
Senior Trainers:
- senior1@badpeople.fit   / password123
- senior2@badpeople.fit    / password123

Trainers:
- trainer1@badpeople.fit   / password123
- trainer2@badpeople.fit   / password123
- trainer3@badpeople.fit   / password123
- trainer4@badpeople.fit   / password123

Admins:
- admin1@badpeople.fit     / password123
- admin2@badpeople.fit     / password123

Clients:
- client1@badpeople.fit    / password123
- client2@badpeople.fit    / password123
- client3@badpeople.fit    / password123
- client4@badpeople.fit    / password123
- client5@badpeople.fit    / password123
"""

import uuid
import logging
import bcrypt
from datetime import date

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models.models import User, Trainer, Admin, Client

logger = logging.getLogger(__name__)

# ── Shared password for all seed accounts ──────────────────────────────────
_SEED_PASSWORD = "password123"


def _hash(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


# ── Seed definitions ────────────────────────────────────────────────────────
SEED_USERS = [
    # Senior Trainers (2)
    {
        "email":      "senior1@badpeople.fit",
        "first_name": "Jordan",
        "last_name":  "Calloway",
        "role":       "trainer",
        "profile": {
            "type":        "trainer",
            "name":        "Jordan Calloway",
            "is_senior":   True,
            "trainer_level": "expert",
            "certification": "NSCA-CSCS · USAW-L2 · FMS",
            "specialties": ["Powerlifting", "Olympic Lifting", "Sports Performance", "Injury Prevention"],
            "bio":         "Former collegiate athlete turned elite performance coach. Specializes in strength development for competitive athletes and functional movement patterns.",
            "experience_years": 18,
        },
    },
    {
        "email":      "senior2@badpeople.fit",
        "first_name": "Sarah",
        "last_name":  "Mitchell",
        "role":       "trainer",
        "profile": {
            "type":        "trainer",
            "name":        "Sarah Mitchell",
            "is_senior":   True,
            "trainer_level": "expert",
            "certification": "ACSM-CEP · CES · Pn1",
            "specialties": ["Clinical Exercise", "Post-Rehab", "Geriatric Fitness", "Chronic Disease Management"],
            "bio":         "Clinical exercise physiologist with extensive background in cardiac rehabilitation and chronic disease management. Passionate about helping clients regain function and quality of life.",
            "experience_years": 22,
        },
    },
    
    # Trainers (4)
    {
        "email":      "trainer1@badpeople.fit",
        "first_name": "Riley",
        "last_name":  "Okafor",
        "role":       "trainer",
        "profile": {
            "type":        "trainer",
            "name":        "Riley Okafor",
            "is_senior":   False,
            "trainer_level": "advanced",
            "certification": "NASM-CPT · CES · PES",
            "specialties": ["MMA Conditioning", "Boxing", "HIIT", "Athletic Performance"],
            "bio":         "Mixed martial arts enthusiast and conditioning specialist. Helps fighters and combat athletes reach peak performance through scientifically proven training methods.",
            "experience_years": 14,
        },
    },
    {
        "email":      "trainer2@badpeople.fit",
        "first_name": "Marcus",
        "last_name":  "Chen",
        "role":       "trainer",
        "profile": {
            "type":        "trainer",
            "name":        "Marcus Chen",
            "is_senior":   False,
            "trainer_level": "intermediate",
            "certification": "ACE-CPT · Yoga-RYT200",
            "specialties": ["Vinyasa Yoga", "Meditation", "Stress Management", "Flexibility Training"],
            "bio":         "Yoga instructor and mindfulness coach. Believes in the connection between physical movement and mental clarity for overall wellness.",
            "experience_years": 8,
        },
    },
    {
        "email":      "trainer3@badpeople.fit",
        "first_name": "Emily",
        "last_name":  "Rodriguez",
        "role":       "trainer",
        "profile": {
            "type":        "trainer",
            "name":        "Emily Rodriguez",
            "is_senior":   False,
            "trainer_level": "advanced",
            "certification": "ISSA-CFT · PN1 · CrossFit-L2",
            "specialties": ["Group Fitness", "Bootcamp", "Metabolic Conditioning", "Nutrition Coaching"],
            "bio":         "High-energy fitness instructor who makes working out fun and effective. Specializes in group settings and metabolic conditioning for fat loss.",
            "experience_years": 12,
        },
    },
    {
        "email":      "trainer4@badpeople.fit",
        "first_name": "David",
        "last_name":  "Kim",
        "role":       "trainer",
        "profile": {
            "type":        "trainer",
            "name":        "David Kim",
            "is_senior":   False,
            "trainer_level": "beginner",
            "certification": "NCCPT-CPT · First Aid-CPR",
            "specialties": ["Beginner Programs", "Corrective Exercise", "Basic Nutrition", "Motivational Coaching"],
            "bio":         "Newly certified personal trainer passionate about helping beginners discover the joy of fitness. Focuses on building confidence and proper form.",
            "experience_years": 3,
        },
    },
    
    # Admins (2)
    {
        "email":      "admin1@badpeople.fit",
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
    {
        "email":      "admin2@badpeople.fit",
        "first_name": "Taylor",
        "last_name":  "Wright",
        "role":       "admin",
        "profile": {
            "type":       "admin",
            "name":       "Taylor Wright",
            "department": "Finance",
            "access_level": "limited",
        },
    },
    
    # Clients (5)
    {
        "email":      "client1@badpeople.fit",
        "first_name": "Alex",
        "last_name":  "Johnson",
        "role":       "client",
        "profile": {
            "type":        "client",
            "name":        "Alex Johnson",
            "gender":      "non-binary",
            "phone_number": "555-0123",
            "birthday":    "1992-03-15",
            "height":      172.0,
            "weight":      68.5,
            "emergency_contact_name": "Jamie Johnson",
            "emergency_contact_phone": "555-0124",
            "medical_conditions": "Seasonal allergies",
            "fitness_goals": "Build functional strength, improve flexibility, train for obstacle course races",
        },
    },
    {
        "email":      "client2@badpeople.fit",
        "first_name": "Jessica",
        "last_name":  "Martinez",
        "role":       "client",
        "profile": {
            "type":        "client",
            "name":        "Jessica Martinez",
            "gender":      "female",
            "phone_number": "555-0125",
            "birthday":    "1987-12-08",
            "height":      160.0,
            "weight":      72.0,
            "emergency_contact_name": "Carlos Martinez",
            "emergency_contact_phone": "555-0126",
            "medical_conditions": "Exercise-induced asthma, lactose intolerant",
            "fitness_goals": "Lose 20 pounds, build lean muscle, improve cardiovascular endurance",
        },
    },
    {
        "email":      "client3@badpeople.fit",
        "first_name": "Robert",
        "last_name":  "Thompson",
        "role":       "client",
        "profile": {
            "type":        "client",
            "name":        "Robert Thompson",
            "gender":      "male",
            "phone_number": "555-0127",
            "birthday":    "1975-06-22",
            "height":      185.0,
            "weight":      98.0,
            "emergency_contact_name": "Linda Thompson",
            "emergency_contact_phone": "555-0128",
            "medical_conditions": "Type 2 diabetes, arthritis in knees",
            "fitness_goals": "Manage blood sugar through exercise, low-impact strength training, improve mobility",
        },
    },
    {
        "email":      "client4@badpeople.fit",
        "first_name": "Amanda",
        "last_name":  "Lee",
        "role":       "client",
        "profile": {
            "type":        "client",
            "name":        "Amanda Lee",
            "gender":      "female",
            "phone_number": "555-0129",
            "birthday":    "1995-09-03",
            "height":      165.0,
            "weight":      55.0,
            "emergency_contact_name": "Kevin Lee",
            "emergency_contact_phone": "555-0130",
            "medical_conditions": "None",
            "fitness_goals": "Complete first marathon, improve running economy, prevent injuries",
        },
    },
    {
        "email":      "client5@badpeople.fit",
        "first_name": "Michael",
        "last_name":  "Brown",
        "role":       "client",
        "profile": {
            "type":        "client",
            "name":        "Michael Brown",
            "gender":      "male",
            "phone_number": "555-0131",
            "birthday":    "1990-01-14",
            "height":      177.0,
            "weight":      88.0,
            "emergency_contact_name": "Jennifer Brown",
            "emergency_contact_phone": "555-0132",
            "medical_conditions": "ACL reconstruction 8 months ago, lower back pain",
            "fitness_goals": "Return to sports, strengthen posterior chain, improve core stability",
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
        elif p["type"] == "client":
            # Parse birthday string to date object
            birthday = None
            if p.get("birthday"):
                birthday = date.fromisoformat(p["birthday"])
            
            profile = Client(
                id=user_id,
                name=p["name"],
                gender=p.get("gender"),
                phone_number=p.get("phone_number"),
                birthday=birthday,
                height=p.get("height"),
                weight=p.get("weight"),
                emergency_contact_name=p.get("emergency_contact_name"),
                emergency_contact_phone=p.get("emergency_contact_phone"),
                medical_conditions=p.get("medical_conditions"),
                fitness_goals=p.get("fitness_goals"),
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
