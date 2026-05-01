"""
Routers package for GymVault API
"""

from .auth import router as auth_router
from .bookings import booking_router
from .shop import router as shop_router
from .memberships import router as membership_router

__all__ = [
    "auth_router",
    "shop_router",
    "membership_router",
    "booking_router"
]
