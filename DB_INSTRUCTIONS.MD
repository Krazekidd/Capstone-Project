# GymVault — API Implementation Guide

> This document describes how to build the REST API that powers the GymVault
> application against the PostgreSQL schema in `gymvault_schema.sql`.

---

## Table of Contents

1. [Tech Stack Recommendation](#1-tech-stack-recommendation)
2. [Project Structure](#2-project-structure)
3. [Environment Variables](#3-environment-variables)
4. [Database Connection](#4-database-connection)
5. [Authentication & JWT Strategy](#5-authentication--jwt-strategy)
   - [How Tokens Work](#how-tokens-work)
   - [Middleware](#middleware)
6. [API Route Reference](#6-api-route-reference)
   - [Auth](#auth-routes)
   - [Users / Profile](#users--profile-routes)
   - [Memberships](#membership-routes)
   - [Consultation Types](#consultation-type-routes)
   - [Bookings](#booking-routes)
   - [Coaches & Availability](#coach--availability-routes)
   - [Shop — Products](#shop--product-routes)
   - [Shop — Orders](#shop--order-routes)
   - [Wishlists](#wishlist-routes)
7. [Request & Response Conventions](#7-request--response-conventions)
8. [Error Handling](#8-error-handling)
9. [Security Checklist](#9-security-checklist)
10. [Deployment Notes](#10-deployment-notes)

---

## 1. Tech Stack Recommendation

| Layer | Recommended choice | Why |
|---|---|---|
| Runtime | **Node.js 20+** | Wide ecosystem, good JWT/bcrypt support |
| Framework | **Express** or **Fastify** | Simple, well-documented |
| DB driver | **node-postgres (`pg`)** | Lightweight, works directly with PostgreSQL |
| Query builder | **Kysely** or raw SQL | Keeps queries readable without a heavy ORM |
| Password hashing | **bcrypt** (`bcryptjs`) | Industry-standard, built for auth |
| JWT | **jsonwebtoken** | Signing / verifying access tokens |
| Validation | **Zod** | Schema validation on request bodies |
| Email | **Nodemailer** + SMTP or **Resend** | Booking confirmations, password reset |

You can use any language/framework you prefer — the route shapes and logic described below apply regardless.

---

## 2. Project Structure

```
gymvault-api/
├── src/
│   ├── config/
│   │   └── db.js            # pg Pool setup
│   ├── middleware/
│   │   ├── authenticate.js  # verifies access JWT
│   │   └── authorize.js     # checks membership tier
│   ├── routes/
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── memberships.js
│   │   ├── consultations.js
│   │   ├── bookings.js
│   │   ├── coaches.js
│   │   ├── products.js
│   │   ├── orders.js
│   │   └── wishlists.js
│   ├── services/
│   │   ├── tokenService.js  # hash, sign, verify helpers
│   │   └── emailService.js  # booking confirmation, etc.
│   └── app.js               # Express app setup
├── .env
└── package.json
```

---

## 3. Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/gymvault

# JWT
JWT_ACCESS_SECRET=your-strong-random-secret-here
JWT_REFRESH_SECRET=another-strong-random-secret-here
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=30d

# Bcrypt
BCRYPT_ROUNDS=12

# App
PORT=4000
NODE_ENV=development
BASE_URL=http://localhost:4000

# Email (optional but needed for booking confirmations)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=noreply@gymvault.com
SMTP_PASS=your-smtp-password
```

---

## 4. Database Connection

```js
// src/config/db.js
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

module.exports = pool;
```

Use `pool.query(sql, [params])` for simple queries and `pool.connect()` for
transactions that span multiple statements (e.g. placing an order).

---

## 5. Authentication & JWT Strategy

### How Tokens Work

The schema separates two token types:

| Token | Lifespan | Stored in DB? | Purpose |
|---|---|---|---|
| **Access token** (JWT) | 15 minutes | ❌ Never | Sent in every API request (`Authorization: Bearer <token>`) |
| **Refresh token** | 30 days | ✅ SHA-256 hash stored in `auth_tokens` | Used once to get a new access token |

**Why hash the refresh token?**  
If your database is ever leaked, raw refresh tokens cannot be replayed because
you only stored their SHA-256 hash — the same principle as hashing passwords.

### Sign-in Flow

```
POST /auth/login
  → verify email + bcrypt password
  → generate accessToken  (JWT, 15 min, signed with JWT_ACCESS_SECRET)
  → generate refreshToken (random 64-byte hex string)
  → SHA-256(refreshToken) → store in auth_tokens table
  → return { accessToken, refreshToken, user }
```

### Refresh Flow

```
POST /auth/refresh
  → receive refreshToken from client (usually an httpOnly cookie)
  → SHA-256(refreshToken) → look up in auth_tokens
  → check: revoked = false AND expires_at > NOW()
  → issue new accessToken (and optionally rotate the refresh token)
  → return { accessToken }
```

### Logout Flow

```
POST /auth/logout
  → receive refreshToken
  → SHA-256(refreshToken) → find row in auth_tokens
  → SET revoked = TRUE, revoked_at = NOW()
  → return 204 No Content
```

### Token Service Helper

```js
// src/services/tokenService.js
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

function signAccessToken(user, membership) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      firstName: user.first_name,
      tier: membership?.tier ?? null,   // 'basic' | 'pro' | 'elite' | null
    },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN }
  );
}

function generateRefreshToken() {
  return crypto.randomBytes(64).toString('hex');
}

function hashToken(rawToken) {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
}

function verifyAccessToken(token) {
  return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
}

module.exports = { signAccessToken, generateRefreshToken, hashToken, verifyAccessToken };
```

### Middleware

```js
// src/middleware/authenticate.js
const { verifyAccessToken } = require('../services/tokenService');

function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }
  try {
    req.user = verifyAccessToken(header.slice(7));
    next();
  } catch {
    res.status(401).json({ error: 'Token expired or invalid' });
  }
}

module.exports = { authenticate };
```

```js
// src/middleware/authorize.js
// Usage: router.get('/route', authenticate, authorize('pro'), handler)
function authorize(...requiredTiers) {
  return (req, res, next) => {
    const tierRank = { basic: 1, pro: 2, elite: 3 };
    const userRank = tierRank[req.user.tier] ?? 0;
    const minRank  = Math.min(...requiredTiers.map(t => tierRank[t]));
    if (userRank >= minRank) return next();
    res.status(403).json({ error: 'Your membership tier does not have access to this resource' });
  };
}

module.exports = { authorize };
```

---

## 6. API Route Reference

All routes are prefixed with `/api/v1`.  
🔒 = requires `authenticate` middleware.  
👑 = requires a specific membership tier or higher.

---

### Auth Routes

#### `POST /api/v1/auth/register`
Register a new user account.

**Body:**
```json
{
  "email": "jordan.wells@email.com",
  "password": "StrongP@ss1",
  "first_name": "Jordan",
  "last_name": "Wells",
  "phone": "+1 876 555 0123"
}
```

**Logic:**
1. Validate body with Zod.
2. Check `users` table — reject if email already exists.
3. `bcrypt.hash(password, BCRYPT_ROUNDS)` → store in `password_hash`.
4. Insert into `users`.
5. Optionally send a verification email (insert a `token_type = 'email_verify'` row into `auth_tokens`).
6. Return `201` with `{ user, accessToken, refreshToken }`.

---

#### `POST /api/v1/auth/login`
Sign in with email and password.

**Body:**
```json
{
  "email": "jordan.wells@email.com",
  "password": "StrongP@ss1"
}
```

**Logic:**
1. Find user by email in `users` (CITEXT means case-insensitive).
2. `bcrypt.compare(password, user.password_hash)` — return `401` if false.
3. Check `is_active = true`.
4. Fetch active membership from `user_memberships JOIN membership_plans` for the JWT `tier` claim.
5. Sign access token + generate refresh token.
6. Insert into `auth_tokens`: `{ user_id, token_hash: hash(refreshToken), token_type: 'refresh', expires_at: now + 30d, user_agent, ip_address }`.
7. Return `200` with `{ accessToken, refreshToken, user }`.

---

#### `POST /api/v1/auth/refresh`
Get a new access token using a refresh token.

**Body:**
```json
{ "refreshToken": "abc123..." }
```

**Logic:**
1. `hash(refreshToken)` → query `auth_tokens WHERE token_hash = $1 AND token_type = 'refresh' AND revoked = false AND expires_at > NOW()`.
2. If not found → `401`.
3. Load user + membership, sign new access token.
4. (Optional) Rotate: revoke old refresh token row, insert a new one.
5. Return `{ accessToken }`.

---

#### `POST /api/v1/auth/logout` 🔒
Invalidate the current refresh token.

**Body:**
```json
{ "refreshToken": "abc123..." }
```

**Logic:**
1. `hash(refreshToken)` → `UPDATE auth_tokens SET revoked = true, revoked_at = NOW() WHERE token_hash = $1 AND user_id = $2`.
2. Return `204`.

---

#### `POST /api/v1/auth/forgot-password`
Request a password reset email.

**Body:** `{ "email": "..." }`

**Logic:**
1. Find user by email (silently succeed even if not found — prevents email enumeration).
2. Generate a random token, insert into `auth_tokens` with `token_type = 'password_reset'`, `expires_at = NOW() + 1 hour`.
3. Email the raw token as a link: `https://gymvault.com/reset-password?token=<raw>`.

---

#### `POST /api/v1/auth/reset-password`
Reset password using the token from the email.

**Body:** `{ "token": "...", "new_password": "..." }`

**Logic:**
1. `hash(token)` → find in `auth_tokens WHERE token_type = 'password_reset' AND revoked = false AND expires_at > NOW()`.
2. `bcrypt.hash(new_password)` → `UPDATE users SET password_hash = $1`.
3. Revoke the reset token row.
4. Optionally revoke all existing refresh tokens for the user (force re-login everywhere).

---

### Users / Profile Routes

#### `GET /api/v1/users/me` 🔒
Return the current user's profile + active membership.

**SQL sketch:**
```sql
SELECT u.*, um.status AS membership_status, mp.name AS plan_name, mp.tier
FROM users u
LEFT JOIN user_memberships um ON um.user_id = u.id AND um.status = 'active'
LEFT JOIN membership_plans mp ON mp.id = um.plan_id
WHERE u.id = $1;
```

---

#### `PATCH /api/v1/users/me` 🔒
Update profile fields (`first_name`, `last_name`, `phone`, `avatar_url`).
Do **not** allow updating `email` or `password_hash` through this route.

---

#### `PATCH /api/v1/users/me/password` 🔒
Change password.

**Body:** `{ "current_password": "...", "new_password": "..." }`

**Logic:** Verify `current_password` with bcrypt before updating.

---

### Membership Routes

#### `GET /api/v1/memberships/plans`
List all active membership plans (public).

```sql
SELECT * FROM membership_plans WHERE is_active = true ORDER BY price_monthly;
```

---

#### `GET /api/v1/memberships/mine` 🔒
Return the current user's active membership.

---

#### `POST /api/v1/memberships/subscribe` 🔒
Subscribe the user to a plan.

**Body:** `{ "plan_id": "uuid", "billing_cycle": "monthly" | "annual" }`

**Logic:**
1. Check if user already has an `active` membership — if so, reject or upgrade.
2. Insert into `user_memberships`.
3. (In production, integrate a payment provider like Stripe before inserting.)

---

#### `DELETE /api/v1/memberships/mine` 🔒
Cancel the current membership.

```sql
UPDATE user_memberships
SET status = 'cancelled', cancelled_at = NOW()
WHERE user_id = $1 AND status = 'active';
```

---

### Consultation Type Routes

#### `GET /api/v1/consultations/types`
List all active consultation types (public — used for the booking Step 1 cards).

```sql
SELECT * FROM consultation_types WHERE is_active = true ORDER BY sort_order;
```

Response includes `price`, `duration_minutes`, `badge_label`, `what_to_expect`, `requires_membership`.

The **frontend** should use `requires_membership` to show/hide types based on the logged-in user's tier. The **API** should enforce it too when a booking is actually created.

---

#### `GET /api/v1/consultations/types/:slug`
Get a single consultation type by slug.

---

### Booking Routes

#### `GET /api/v1/bookings/availability` 🔒
Return available time slots for a given consultation type and date.

**Query params:** `?consultation_type_id=uuid&date=2026-04-24&timezone=America/New_York`

**Logic:**
1. Find a coach who handles this consultation type.
2. Look up `coach_availability_schedule` for the day-of-week of `date`.
3. Check `coach_availability_overrides` for `date` — if `is_closed = true`, return empty.
4. Generate time slots every 60 minutes (or `duration_minutes`) between `open_time` and `close_time`.
5. Subtract slots already booked in `bookings WHERE scheduled_date = $date AND status IN ('confirmed','pending')`.
6. Return remaining open slots as an array of time strings.

```json
{
  "date": "2026-04-24",
  "timezone": "America/New_York",
  "slots": ["06:00","07:00","08:00","09:00","10:00","11:00","13:00","14:00"]
}
```

---

#### `POST /api/v1/bookings` 🔒
Create a booking (Step 3 — Confirm Booking).

**Body:**
```json
{
  "consultation_type_id": "uuid",
  "scheduled_date": "2026-04-24",
  "scheduled_time": "13:00",
  "timezone": "America/New_York",
  "format": "in_person",
  "notes": "I want to discuss my macro targets.",
  "agreed_cancellation_policy": true
}
```

**Logic:**
1. Validate the slot is still available (re-run availability check inside a transaction).
2. Verify membership tier requirement against `consultation_types.requires_membership`.
3. Generate a human-readable reference: `GV-YYYYMMDD-XXXX`.
4. Insert into `bookings` with `status = 'confirmed'`, set `price_charged` from `consultation_types.price`.
5. Trigger a confirmation email (booking reference + calendar invite details).
6. Return `201` with the full booking object.

---

#### `GET /api/v1/bookings` 🔒
List the current user's bookings.

**Query params:** `?status=confirmed&limit=10&offset=0`

```sql
SELECT b.*, ct.name AS consultation_name, ct.emoji_icon,
       c.full_name AS coach_name, c.title AS coach_title
FROM bookings b
JOIN consultation_types ct ON ct.id = b.consultation_type_id
LEFT JOIN coaches c ON c.id = b.coach_id
WHERE b.user_id = $1
ORDER BY b.scheduled_date DESC;
```

---

#### `GET /api/v1/bookings/:id` 🔒
Get a single booking. Enforce `booking.user_id = req.user.sub`.

---

#### `PATCH /api/v1/bookings/:id/cancel` 🔒
Cancel a booking.

**Logic:**
1. Confirm the booking belongs to the user.
2. Check cancellation window: `scheduled_date - NOW() >= 24 hours` (free cancellation).
3. `UPDATE bookings SET status = 'cancelled', cancelled_at = NOW(), cancellation_reason = $reason`.
4. Send cancellation confirmation email.

---

### Coach & Availability Routes

#### `GET /api/v1/coaches`
List active coaches (public).

---

#### `GET /api/v1/coaches/:id/schedule`
Return a coach's weekly schedule and upcoming overrides.

```sql
-- Weekly schedule
SELECT * FROM coach_availability_schedule WHERE coach_id = $1 AND is_active = true;

-- Overrides for the next 60 days
SELECT * FROM coach_availability_overrides
WHERE coach_id = $1 AND override_date BETWEEN NOW() AND NOW() + INTERVAL '60 days';
```

---

### Shop / Product Routes

#### `GET /api/v1/products`
List products with optional filtering and sorting (matches the shop tab UI).

**Query params:** `?category=merch&sort=price_asc|price_desc|name_az|featured&limit=20&offset=0`

```sql
SELECT * FROM products
WHERE is_active = true
  AND ($1::product_category IS NULL OR category = $1)
ORDER BY
  CASE WHEN $2 = 'price_asc'  THEN price END ASC,
  CASE WHEN $2 = 'price_desc' THEN price END DESC,
  CASE WHEN $2 = 'name_az'    THEN name  END ASC,
  sort_order ASC
LIMIT $3 OFFSET $4;
```

---

#### `GET /api/v1/products/:slug`
Get a single product by slug, including reviews.

---

#### `POST /api/v1/products/:id/reviews` 🔒
Submit a product review (one per user per product, enforced by unique constraint).

**Body:** `{ "rating": 5, "body": "Great quality shirt!" }`

**After insert:** recalculate `average_rating` and `review_count` on the `products` row.

```sql
UPDATE products
SET average_rating = (SELECT AVG(rating) FROM product_reviews WHERE product_id = $1),
    review_count   = (SELECT COUNT(*)    FROM product_reviews WHERE product_id = $1)
WHERE id = $1;
```

---

### Shop / Order Routes

#### `POST /api/v1/orders` 🔒
Place an order (checkout from cart).

**Body:**
```json
{
  "items": [
    { "product_id": "uuid", "quantity": 2 },
    { "product_id": "uuid", "quantity": 1 }
  ],
  "shipping_address": {
    "line1": "123 Hope Road",
    "city": "Kingston",
    "country": "JM"
  }
}
```

**Logic (run inside a DB transaction):**
1. Validate each product exists and `stock_qty >= quantity`.
2. Lock rows: `SELECT ... FOR UPDATE`.
3. Calculate `subtotal`, apply any discount, calculate `total`.
4. Insert into `orders`, then insert all rows into `order_items`.
5. Decrement `stock_qty` on each product.
6. Generate reference: `GVO-YYYYMMDD-XXXX`.
7. (In production: collect payment via Stripe before marking `status = 'paid'`.)
8. Return `201` with the full order.

---

#### `GET /api/v1/orders` 🔒
List the current user's order history.

---

#### `GET /api/v1/orders/:id` 🔒
Get a single order with its items.

```sql
SELECT o.*, json_agg(
  json_build_object(
    'product_id', oi.product_id,
    'name', p.name,
    'quantity', oi.quantity,
    'unit_price', oi.unit_price,
    'line_total', oi.line_total
  )
) AS items
FROM orders o
JOIN order_items oi ON oi.order_id = o.id
JOIN products p ON p.id = oi.product_id
WHERE o.id = $1 AND o.user_id = $2
GROUP BY o.id;
```

---

### Wishlist Routes

#### `GET /api/v1/wishlists` 🔒
Return the current user's wishlisted products.

```sql
SELECT p.* FROM wishlists w
JOIN products p ON p.id = w.product_id
WHERE w.user_id = $1;
```

---

#### `POST /api/v1/wishlists` 🔒
Add a product to the wishlist. Uses `INSERT ... ON CONFLICT DO NOTHING` to
prevent duplicate errors (the heart icon is a toggle).

**Body:** `{ "product_id": "uuid" }`

---

#### `DELETE /api/v1/wishlists/:product_id` 🔒
Remove a product from the wishlist.

---

## 7. Request & Response Conventions

- All request bodies are `Content-Type: application/json`.
- All timestamps are returned as ISO 8601 strings in UTC.
- Prices are returned as numbers (e.g. `1500.00`), not strings.
- UUIDs are returned as lowercase hyphenated strings.
- Paginated list responses follow this envelope:

```json
{
  "data": [...],
  "meta": {
    "total": 42,
    "limit": 20,
    "offset": 0
  }
}
```

- Single-resource responses return the object directly (no wrapper).

---

## 8. Error Handling

All errors return a consistent JSON shape:

```json
{
  "error": "Human-readable message",
  "code": "MACHINE_READABLE_CODE"
}
```

| HTTP Status | When to use |
|---|---|
| `400` | Validation failure, bad request body |
| `401` | Missing/expired/invalid token |
| `403` | Valid token but insufficient tier or ownership |
| `404` | Resource not found |
| `409` | Conflict — e.g. email already registered, slot already booked |
| `422` | Business rule violation — e.g. cancellation window missed |
| `500` | Unexpected server error (never expose stack traces in production) |

Use a global Express error handler:

```js
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status ?? 500;
  res.status(status).json({
    error: status === 500 ? 'Internal server error' : err.message,
    code: err.code ?? 'INTERNAL_ERROR',
  });
});
```

---

## 9. Security Checklist

- [ ] **Never store plain-text passwords** — always `bcrypt.hash` before inserting.
- [ ] **Never store raw refresh tokens** — always store `SHA-256(token)` in `auth_tokens.token_hash`.
- [ ] **Never put sensitive data in the JWT payload** — only `sub` (user id), `email`, and `tier`.
- [ ] **Set short access token TTL** (15 min) and rotate refresh tokens on use.
- [ ] **Use parameterised queries** everywhere — no string interpolation in SQL.
- [ ] **Rate-limit auth endpoints** — use `express-rate-limit` on `/auth/login`, `/auth/register`, `/auth/forgot-password`.
- [ ] **Use HTTPS in production** — never send tokens over plain HTTP.
- [ ] **Store refresh tokens in httpOnly cookies** on the frontend — not `localStorage`.
- [ ] **Validate ownership** on every resource — always filter by `user_id = req.user.sub`, never trust client-supplied IDs alone.
- [ ] **Sanitise free-text fields** before storing (e.g. booking `notes`) to prevent XSS if values are ever rendered in HTML.
- [ ] **Run a periodic cleanup job** — delete expired, revoked `auth_tokens` rows older than 90 days to keep the table lean.

---

## 10. Deployment Notes

### Database
- Run `gymvault_schema.sql` once against your production database. It is safe to
  re-run at any time without data loss.
- Ensure PostgreSQL extensions `pgcrypto` and `citext` are available (they are
  included by default on most managed Postgres providers like Supabase, Neon, and Railway).

### Environment
- Use separate `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` values in production.
  Generate them with: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`.
- Never commit `.env` to version control.

### Scaling
- The `auth_tokens` table will grow over time. Schedule a nightly job:
  ```sql
  DELETE FROM auth_tokens WHERE expires_at < NOW() - INTERVAL '7 days';
  ```
- The `bookings/availability` endpoint is the most query-intensive — consider
  adding a composite index: `CREATE INDEX ON bookings(coach_id, scheduled_date, status);`

---

*End of GymVault API Implementation Guide*