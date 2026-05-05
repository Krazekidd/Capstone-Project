import asyncio
from database import AsyncSessionLocal
from sqlalchemy import select
from models import User, Client, Trainer, Admin

async def diagnose():
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(User).where(User.email == "cmontgmery@gmail.com"))
        user = result.scalar_one_or_none()
        
        if user:
            print(f"✅ User found: {user.email}")
            print(f"User ID type: {type(user.id)}")
            print(f"User ID value: {user.id}")
            print(f"User ID hex: {user.id.hex() if hasattr(user.id, 'hex') else 'N/A'}")
            print(f"Password hash length: {len(user.password_hash)}")
            print(f"Role: {user.role}")
        else:
            print("❌ User not found")
            
        # Test creating a new user
        from models import User, Client
        import uuid
        import hashlib
        import bcrypt
        
        def get_password_hash(password):
            sha256_hash = hashlib.sha256(password.encode('utf-8')).digest()
            salt = bcrypt.gensalt()
            return bcrypt.hashpw(sha256_hash, salt).decode('utf-8')
        
        # Create test user if doesn't exist
        if not user:
            print("\nCreating test user...")
            new_id = uuid.uuid4().bytes
            new_user = User(
                id=new_id,
                email="test@example.com",
                password_hash=get_password_hash("test123456"),
                role="client"
            )
            db.add(new_user)
            
            new_client = Client(
                id=new_id,
                name="Test User",
                phone_number="1234567890"
            )
            db.add(new_client)
            await db.commit()
            print("✅ Test user created")

if __name__ == "__main__":
    asyncio.run(diagnose())