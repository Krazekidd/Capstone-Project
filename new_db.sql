-- =============================================================
--  GymVault – Complete PostgreSQL Schema
--  Safe to run multiple times (idempotent via IF NOT EXISTS /
--  CREATE OR REPLACE / DO $$ blocks).
-- =============================================================

-- ─────────────────────────────────────────────
-- EXTENSIONS
-- ─────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";   -- gen_random_uuid(), crypt()
CREATE EXTENSION IF NOT EXISTS "citext";     -- case-insensitive email type


-- =============================================================
-- 1.  ENUMS
--     Wrapped in DO blocks so re-runs are safe.
-- =============================================================

DO $$ BEGIN
    CREATE TYPE membership_tier AS ENUM ('basic', 'pro', 'elite');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE membership_status AS ENUM ('active', 'inactive', 'suspended', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE consultation_format AS ENUM ('in_person', 'video_call');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed', 'no_show');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE product_category AS ENUM ('merch', 'essentials', 'supplements');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE order_status AS ENUM ('pending', 'paid', 'shipped', 'delivered', 'refunded', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE token_type AS ENUM ('refresh', 'password_reset', 'email_verify');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;


-- =============================================================
-- 2.  CORE USER & AUTH
-- =============================================================

CREATE TABLE IF NOT EXISTS users (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    email           CITEXT          NOT NULL UNIQUE,
    password_hash   TEXT            NOT NULL,          -- bcrypt hash stored here
    first_name      VARCHAR(100)    NOT NULL,
    last_name       VARCHAR(100)    NOT NULL,
    phone           VARCHAR(30),
    avatar_url      TEXT,
    is_email_verified BOOLEAN       NOT NULL DEFAULT FALSE,
    is_active       BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

-- Tracks refresh tokens + password-reset / email-verify tokens
CREATE TABLE IF NOT EXISTS auth_tokens (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID            NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash      TEXT            NOT NULL UNIQUE,   -- SHA-256 of the raw token
    token_type      token_type      NOT NULL DEFAULT 'refresh',
    expires_at      TIMESTAMPTZ     NOT NULL,
    revoked         BOOLEAN         NOT NULL DEFAULT FALSE,
    revoked_at      TIMESTAMPTZ,
    user_agent      TEXT,
    ip_address      INET,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_auth_tokens_user_id    ON auth_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_tokens_token_hash ON auth_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_auth_tokens_expires_at ON auth_tokens(expires_at);


-- =============================================================
-- 3.  MEMBERSHIPS
-- =============================================================

CREATE TABLE IF NOT EXISTS membership_plans (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(100)    NOT NULL,           -- e.g. "Pro Member"
    tier            membership_tier NOT NULL,
    price_monthly   NUMERIC(10,2)   NOT NULL,
    price_annual    NUMERIC(10,2),
    description     TEXT,
    features        JSONB           NOT NULL DEFAULT '[]', -- list of feature strings
    is_active       BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_memberships (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID            NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_id         UUID            NOT NULL REFERENCES membership_plans(id),
    status          membership_status NOT NULL DEFAULT 'active',
    started_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    expires_at      TIMESTAMPTZ,
    cancelled_at    TIMESTAMPTZ,
    auto_renew      BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_memberships_user_id ON user_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_user_memberships_status  ON user_memberships(status);


-- =============================================================
-- 4.  COACHES
-- =============================================================

CREATE TABLE IF NOT EXISTS coaches (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID            REFERENCES users(id) ON DELETE SET NULL, -- coach may have login
    full_name       VARCHAR(200)    NOT NULL,
    title           VARCHAR(200),                       -- "Precision Nutrition Level 2 Coach"
    bio             TEXT,
    avatar_url      TEXT,
    specialities    TEXT[]          NOT NULL DEFAULT '{}',
    is_active       BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);


-- =============================================================
-- 5.  CONSULTATION TYPES  (Starter / Nutritional / General …)
-- =============================================================

CREATE TABLE IF NOT EXISTS consultation_types (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(150)    NOT NULL,           -- "Nutritional Consultation"
    slug            VARCHAR(100)    NOT NULL UNIQUE,    -- "nutritional-consultation"
    subtitle        VARCHAR(200),                       -- "Fuel Your Performance"
    description     TEXT,
    duration_minutes INT            NOT NULL,           -- 45 / 60 / 30
    price           NUMERIC(10,2)   NOT NULL DEFAULT 0, -- 0 = FREE
    currency        VARCHAR(10)     NOT NULL DEFAULT 'USD',
    badge_label     VARCHAR(50),                        -- "COMPLIMENTARY", "MOST POPULAR", "OPEN TO ALL"
    badge_color     VARCHAR(30),                        -- hex or tailwind class hint
    emoji_icon      VARCHAR(10),                        -- 🚀 🥗 💬
    what_to_expect  TEXT[]          NOT NULL DEFAULT '{}', -- bullet list
    requires_membership membership_tier,               -- NULL = open to all
    is_active       BOOLEAN         NOT NULL DEFAULT TRUE,
    sort_order      INT             NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);


-- =============================================================
-- 6.  COACH AVAILABILITY
-- =============================================================

-- Weekly recurring schedule per coach (day 0=Sun … 6=Sat)
CREATE TABLE IF NOT EXISTS coach_availability_schedule (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    coach_id        UUID            NOT NULL REFERENCES coaches(id) ON DELETE CASCADE,
    day_of_week     SMALLINT        NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    open_time       TIME            NOT NULL,
    close_time      TIME            NOT NULL,
    is_active       BOOLEAN         NOT NULL DEFAULT TRUE,
    UNIQUE (coach_id, day_of_week)
);

-- One-off overrides: gym closed, holidays, extra availability
CREATE TABLE IF NOT EXISTS coach_availability_overrides (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    coach_id        UUID            NOT NULL REFERENCES coaches(id) ON DELETE CASCADE,
    override_date   DATE            NOT NULL,
    is_closed       BOOLEAN         NOT NULL DEFAULT TRUE,
    open_time       TIME,
    close_time      TIME,
    reason          VARCHAR(200),                       -- "Public Holiday", "Staff Training"
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    UNIQUE (coach_id, override_date)
);

CREATE INDEX IF NOT EXISTS idx_coach_avail_overrides_date ON coach_availability_overrides(override_date);


-- =============================================================
-- 7.  BOOKINGS  (the calendar flow in the screenshots)
-- =============================================================

CREATE TABLE IF NOT EXISTS bookings (
    id                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    reference           VARCHAR(20)     NOT NULL UNIQUE,   -- human-readable ref e.g. GV-20260424-0001
    user_id             UUID            NOT NULL REFERENCES users(id),
    consultation_type_id UUID           NOT NULL REFERENCES consultation_types(id),
    coach_id            UUID            REFERENCES coaches(id),
    scheduled_date      DATE            NOT NULL,
    scheduled_time      TIME            NOT NULL,
    timezone            VARCHAR(60)     NOT NULL DEFAULT 'America/New_York',
    format              consultation_format NOT NULL DEFAULT 'in_person',
    status              booking_status  NOT NULL DEFAULT 'confirmed',
    price_charged       NUMERIC(10,2)   NOT NULL DEFAULT 0,
    currency            VARCHAR(10)     NOT NULL DEFAULT 'USD',
    notes               TEXT,                             -- "Additional Notes" textarea
    agreed_cancellation_policy BOOLEAN NOT NULL DEFAULT FALSE,
    confirmed_at        TIMESTAMPTZ,
    cancelled_at        TIMESTAMPTZ,
    cancellation_reason TEXT,
    completed_at        TIMESTAMPTZ,
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bookings_user_id    ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_date       ON bookings(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_bookings_coach_id   ON bookings(coach_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status     ON bookings(status);


-- =============================================================
-- 8.  SHOP – PRODUCTS & ORDERS
-- =============================================================

CREATE TABLE IF NOT EXISTS products (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(200)    NOT NULL,
    slug            VARCHAR(200)    NOT NULL UNIQUE,
    category        product_category NOT NULL,
    description     TEXT,
    price           NUMERIC(10,2)   NOT NULL,
    currency        VARCHAR(10)     NOT NULL DEFAULT 'JMD',
    image_url       TEXT,
    badge_label     VARCHAR(50),                        -- "BEST SELLER", "NEW"
    badge_color     VARCHAR(30),
    average_rating  NUMERIC(3,2)    NOT NULL DEFAULT 0,
    review_count    INT             NOT NULL DEFAULT 0,
    stock_qty       INT             NOT NULL DEFAULT 0,
    is_active       BOOLEAN         NOT NULL DEFAULT TRUE,
    sort_order      INT             NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);

CREATE TABLE IF NOT EXISTS orders (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    reference       VARCHAR(20)     NOT NULL UNIQUE,
    user_id         UUID            NOT NULL REFERENCES users(id),
    status          order_status    NOT NULL DEFAULT 'pending',
    subtotal        NUMERIC(10,2)   NOT NULL,
    shipping_fee    NUMERIC(10,2)   NOT NULL DEFAULT 0,
    discount        NUMERIC(10,2)   NOT NULL DEFAULT 0,
    total           NUMERIC(10,2)   NOT NULL,
    currency        VARCHAR(10)     NOT NULL DEFAULT 'JMD',
    shipping_address JSONB,
    notes           TEXT,
    placed_at       TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    paid_at         TIMESTAMPTZ,
    shipped_at      TIMESTAMPTZ,
    delivered_at    TIMESTAMPTZ,
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status  ON orders(status);

CREATE TABLE IF NOT EXISTS order_items (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id        UUID            NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id      UUID            NOT NULL REFERENCES products(id),
    quantity        INT             NOT NULL CHECK (quantity > 0),
    unit_price      NUMERIC(10,2)   NOT NULL,
    line_total      NUMERIC(10,2)   GENERATED ALWAYS AS (quantity * unit_price) STORED
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);


-- =============================================================
-- 9.  PRODUCT REVIEWS / RATINGS
-- =============================================================

CREATE TABLE IF NOT EXISTS product_reviews (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id      UUID            NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    user_id         UUID            NOT NULL REFERENCES users(id),
    rating          SMALLINT        NOT NULL CHECK (rating BETWEEN 1 AND 5),
    body            TEXT,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    UNIQUE (product_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_product_reviews_product_id ON product_reviews(product_id);


-- =============================================================
-- 10.  WISHLIST / FAVOURITES  (heart icon on product cards)
-- =============================================================

CREATE TABLE IF NOT EXISTS wishlists (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id  UUID        NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    added_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_wishlists_user_id ON wishlists(user_id);


-- =============================================================
-- 11.  TRIGGERS – keep updated_at fresh automatically
-- =============================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- Helper: create trigger only if it doesn't already exist
DO $$
DECLARE
    tbl TEXT;
    trg TEXT;
BEGIN
    FOREACH tbl IN ARRAY ARRAY[
        'users',
        'user_memberships',
        'products',
        'orders',
        'bookings'
    ]
    LOOP
        trg := 'trg_' || tbl || '_updated_at';
        IF NOT EXISTS (
            SELECT 1 FROM pg_trigger WHERE tgname = trg
        ) THEN
            EXECUTE format(
                'CREATE TRIGGER %I
                 BEFORE UPDATE ON %I
                 FOR EACH ROW EXECUTE FUNCTION set_updated_at()',
                trg, tbl
            );
        END IF;
    END LOOP;
END;
$$;


-- -- =============================================================
-- -- 12.  SEED DATA  – run only when tables are empty
-- -- =============================================================

-- -- Membership Plans
-- INSERT INTO membership_plans (name, tier, price_monthly, price_annual, description, features)
-- SELECT * FROM (VALUES
--     ('Basic',  'basic'::membership_tier,  29.99,  299.99,
--      'Great starting point for casual gym-goers.',
--      '["Gym floor access","Locker access","2 free classes/month"]'::jsonb),
--     ('Pro',    'pro'::membership_tier,    59.99,  599.99,
--      'Our most popular plan for serious members.',
--      '["Unlimited classes","Personal trainer sessions","Nutrition resources","Priority booking"]'::jsonb),
--     ('Elite',  'elite'::membership_tier,  99.99, 999.99,
--      'The full GymVault experience with every perk.',
--      '["Everything in Pro","Unlimited PT sessions","Monthly body composition scan","Exclusive merchandise discounts"]'::jsonb)
-- ) AS v(name, tier, price_monthly, price_annual, description, features)
-- WHERE NOT EXISTS (SELECT 1 FROM membership_plans LIMIT 1);

-- -- Consultation Types
-- INSERT INTO consultation_types
--     (name, slug, subtitle, description, duration_minutes, price, badge_label, badge_color, emoji_icon, what_to_expect, requires_membership)
-- SELECT * FROM (VALUES
--     ('Starter Consultation',
--      'starter-consultation',
--      'New to GymVault',
--      'Your perfect entry point. Our coaches assess your current fitness level, understand your goals and build a personalised roadmap for your first 90 days.',
--      45, 0.00, 'COMPLIMENTARY', 'green', '🚀',
--      ARRAY['Goal setting session','Fitness level assessment','90-day roadmap','Introduction to GymVault systems'],
--      'basic'::membership_tier),

--     ('Nutritional Consultation',
--      'nutritional-consultation',
--      'Fuel Your Performance',
--      'A deep-dive into your diet, metabolism and eating habits with a certified Precision Nutrition coach. Walk away with a fully personalised meal plan.',
--      60, 45.00, 'MOST POPULAR', 'orange', '🥗',
--      ARRAY['Body composition analysis','Macro & calorie target setting','Personalised meal plan (7-day)','Supplement protocol','Ongoing tracking setup (app)','Follow-up check-in included'],
--      NULL),

--     ('General Consultation',
--      'general-consultation',
--      'Talk to an Expert',
--      'Have a question about training, recovery, memberships or programmes? Book a no-pressure chat with one of our senior coaches — available in-person or via video.',
--      30, 0.00, 'OPEN TO ALL', 'blue', '💬',
--      ARRAY['Open Q&A with a senior coach','Training & recovery advice','Membership guidance','Programme recommendations'],
--      NULL)
-- ) AS v(name, slug, subtitle, description, duration_minutes, price, badge_label, badge_color, emoji_icon, what_to_expect, requires_membership)
-- WHERE NOT EXISTS (SELECT 1 FROM consultation_types LIMIT 1);

-- -- Sample Products (matching screenshots)
-- INSERT INTO products (name, slug, category, price, currency, badge_label, average_rating, review_count, stock_qty)
-- SELECT * FROM (VALUES
--     ('Gym T-Shirt',  'gym-t-shirt',  'merch'::product_category,       1500.00, 'JMD', 'BEST SELLER', 4.5, 42, 100),
--     ('Hoodie',       'hoodie',       'merch'::product_category,        2500.00, 'JMD', 'NEW',         4.5, 42,  50),
--     ('Gym Cap',      'gym-cap',      'merch'::product_category,         500.00, 'JMD', NULL,          5.0, 42,  75),
--     ('Gym Towel',    'gym-towel',    'essentials'::product_category,   1000.00, 'JMD', NULL,          4.5, 42, 200)
-- ) AS v(name, slug, category, price, currency, badge_label, average_rating, review_count, stock_qty)
-- WHERE NOT EXISTS (SELECT 1 FROM products LIMIT 1);

-- -- Demo Coach
-- INSERT INTO coaches (full_name, title, specialities)
-- SELECT 'Coach Taylor', 'Precision Nutrition Level 2 Coach', ARRAY['Nutrition','Weight Management','Strength Training']
-- WHERE NOT EXISTS (SELECT 1 FROM coaches LIMIT 1);

-- -- Coach weekly schedule (Mon–Fri 06:00–20:00, Sat 07:00–17:00)
-- INSERT INTO coach_availability_schedule (coach_id, day_of_week, open_time, close_time)
-- SELECT
--     c.id,
--     d.dow,
--     CASE WHEN d.dow BETWEEN 1 AND 5 THEN '06:00'::TIME ELSE '07:00'::TIME END,
--     CASE WHEN d.dow BETWEEN 1 AND 5 THEN '20:00'::TIME ELSE '17:00'::TIME END
-- FROM coaches c
-- CROSS JOIN (VALUES (1),(2),(3),(4),(5),(6)) AS d(dow)   -- Mon=1 … Sat=6
-- WHERE NOT EXISTS (SELECT 1 FROM coach_availability_schedule LIMIT 1);


-- =============================================================
-- DONE
-- =============================================================
-- Tables created (idempotent):
--   users, auth_tokens,
--   membership_plans, user_memberships,
--   coaches, coach_availability_schedule, coach_availability_overrides,
--   consultation_types,
--   bookings,
--   products, orders, order_items,
--   product_reviews, wishlists
--
-- JWT strategy:
--   • Sign short-lived ACCESS tokens (e.g. 15 min) in your API layer
--     using the user id + membership tier as claims.
--   • Store SHA-256(refresh_token) in auth_tokens (token_hash).
--   • On logout: set auth_tokens.revoked = TRUE, revoked_at = NOW().
--   • On token refresh: verify token_hash, check revoked/expires_at,
--     issue new access token.
-- =============================================================