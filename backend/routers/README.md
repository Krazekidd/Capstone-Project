# Routers Package Structure

This package contains all API routers for the GymVault application, organized by functionality.

## Folder Structure

```
routers/
├── __init__.py              # Main package exports
├── README.md                # This file
├── auth/                   # Authentication endpoints
│   ├── __init__.py
│   └── auth.py            # Login, register, password reset
├── users/                  # User management endpoints
│   ├── __init__.py
│   └── account.py          # User profile management
├── bookings/               # Booking and consultation endpoints
│   ├── __init__.py
│   ├── booking.py          # Booking management
│   └── consultation.py     # Consultation types and availability
├── memberships/            # Membership management endpoints
│   ├── __init__.py
│   └── membership.py      # Membership plans and subscriptions
├── shop/                  # E-commerce endpoints
│   ├── __init__.py
│   └── shop.py            # Products, orders, reviews, wishlist
└── misc/                  # Miscellaneous endpoints
    ├── __init__.py
    ├── excursions.py       # Excursion management
    └── conversations.py   # Chat and conversation management
```

## API Endpoints by Category

### Authentication (`/api/v1/auth/`)
- `POST /login` - User login
- `POST /register` - User registration
- `POST /logout` - User logout
- `GET /userinfo` - Get current user info
- `POST /forgot-password` - Request password reset
- `POST /reset-password` - Reset password with token
- `POST /change-password` - Change password
- `GET /verify` - Verify JWT token

### Memberships (`/api/v1/memberships/`)
- `GET /plans` - Get all membership plans
- `GET /plans/{plan_id}` - Get specific plan
- `GET /mine` - Get user's membership
- `POST /subscribe` - Subscribe to plan
- `DELETE /mine` - Cancel membership

### Bookings (`/api/v1/bookings/`)
- `GET /consultation-types` - Get consultation types
- `GET /consultation-types/{slug}` - Get specific consultation type
- `GET /availability` - Check availability
- `POST /` - Create booking
- `GET /` - Get user's bookings
- `GET /{booking_id}` - Get specific booking
- `PATCH /{booking_id}/cancel` - Cancel booking

### Shop (`/api/v1/shop/`)
- `GET /products` - Get products
- `GET /products/{slug}` - Get specific product
- `POST /products/{id}/reviews` - Create product review
- `GET /products/{id}/reviews` - Get product reviews
- `GET /wishlists` - Get wishlist
- `POST /wishlists` - Add to wishlist
- `DELETE /wishlists/{id}` - Remove from wishlist
- `POST /orders` - Create order
- `GET /orders` - Get user's orders
- `GET /orders/{id}` - Get specific order

## Usage

Import routers in main.py:

```python
from routers import (
    auth_router,
    account_router,
    booking_router,
    consultation_router,
    shop_router,
    membership_router,
    excursions_router,
    conversations_router
)

app.include_router(auth_router)
app.include_router(account_router)
# ... etc
```

## Notes

- All routers use `/api/v1/` prefix for versioning
- Authentication required for most endpoints (except login/register)
- Proper error handling and status codes implemented
- Pydantic schemas for request/response validation
