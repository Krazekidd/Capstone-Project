-- =====================================================
-- POSTGRESQL CONVERSION OF GYMVAULT DATABASE
-- =====================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create schema and set search path
CREATE SCHEMA IF NOT EXISTS Accounts;
SET search_path TO Accounts;

-- =====================================================
-- Helper function for auto-updating updated_at columns
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- MAIN ACCOUNTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS Accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('client', 'trainer', 'admin')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- CLIENT PROFILES
-- =====================================================
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY REFERENCES Accounts(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    gender VARCHAR(10),
    phone_number VARCHAR(20),
    birthday DATE,
    height VARCHAR(10),
    weight VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TRAINER PROFILES
-- =====================================================
CREATE TABLE IF NOT EXISTS trainers (
    id UUID PRIMARY KEY REFERENCES Accounts(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    birthday DATE,
    certification VARCHAR(100),
    rating FLOAT DEFAULT 0,
    trainer_level FLOAT DEFAULT 1,
    is_senior BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- ADMIN PROFILES
-- =====================================================
CREATE TABLE IF NOT EXISTS admins (
    id UUID PRIMARY KEY REFERENCES Accounts(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20),
    birthday DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_accounts_email ON Accounts(email);
CREATE INDEX IF NOT EXISTS idx_accounts_role ON Accounts(role);
CREATE INDEX IF NOT EXISTS idx_clients_name ON clients(name);
CREATE INDEX IF NOT EXISTS idx_trainers_name ON trainers(name);
CREATE INDEX IF NOT EXISTS idx_admins_name ON admins(name);

-- =====================================================
-- BODY MEASUREMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS body_measurements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES Accounts(id) ON DELETE CASCADE,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    weight FLOAT,
    height FLOAT,
    body_fat FLOAT,
    chest FLOAT,
    waist FLOAT,
    shoulders FLOAT,
    arm_left FLOAT,
    arm_right FLOAT,
    neck FLOAT,
    hips FLOAT,
    thigh_left FLOAT,
    thigh_right FLOAT,
    calf_left FLOAT,
    calf_right FLOAT,
    glutes FLOAT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_recorded ON body_measurements(user_id, recorded_at);

-- Trigger for body_measurements.updated_at
CREATE TRIGGER trigger_body_measurements_updated_at
    BEFORE UPDATE ON body_measurements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- CLIENT GOALS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS client_goals (
    id SERIAL PRIMARY KEY,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    goal_type VARCHAR(50) DEFAULT 'Bulk Up',
    primary_goal VARCHAR(100),
    target_weight_kg DECIMAL(5,1),
    target_chest_cm DECIMAL(5,1),
    target_waist_cm DECIMAL(5,1),
    target_hips_cm DECIMAL(5,1),
    target_thigh_cm DECIMAL(5,1),
    target_arm_cm DECIMAL(5,1),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(client_id)
);

CREATE INDEX IF NOT EXISTS idx_client_goals ON client_goals(client_id);

-- Trigger for client_goals.updated_at
CREATE TRIGGER trigger_client_goals_updated_at
    BEFORE UPDATE ON client_goals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- CLIENT HEALTH CONDITIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS client_health_conditions (
    id SERIAL PRIMARY KEY,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    condition_name VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(client_id, condition_name)
);

CREATE INDEX IF NOT EXISTS idx_client_health ON client_health_conditions(client_id);

-- =====================================================
-- CLIENT WATER INTAKE TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS client_water_intake (
    id SERIAL PRIMARY KEY,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    intake_date DATE NOT NULL,
    cups_consumed INT DEFAULT 0 CHECK (cups_consumed BETWEEN 0 AND 20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(client_id, intake_date)
);

CREATE INDEX IF NOT EXISTS idx_date ON client_water_intake(intake_date);

-- Trigger for client_water_intake.updated_at
CREATE TRIGGER trigger_client_water_intake_updated_at
    BEFORE UPDATE ON client_water_intake
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- CLIENT WORKOUT SESSIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS client_workout_sessions (
    id SERIAL PRIMARY KEY,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    session_date DATE NOT NULL,
    session_type VARCHAR(50),
    duration_minutes INT,
    calories_burned INT,
    avg_heart_rate INT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_client_session_date ON client_workout_sessions(client_id, session_date);

-- =====================================================
-- CLIENT STRENGTH RECORDS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS client_strength_records (
    id SERIAL PRIMARY KEY,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    exercise_name VARCHAR(50) NOT NULL,
    current_weight_kg DECIMAL(5,1),
    goal_weight_kg DECIMAL(5,1),
    current_reps INT,
    goal_reps INT,
    percentage_progress INT,
    record_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_client_strength ON client_strength_records(client_id);
CREATE INDEX IF NOT EXISTS idx_exercise_name ON client_strength_records(exercise_name);

-- Trigger for client_strength_records.updated_at
CREATE TRIGGER trigger_client_strength_records_updated_at
    BEFORE UPDATE ON client_strength_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- TRAINER RATINGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS trainer_ratings (
    id SERIAL PRIMARY KEY,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    trainer_name VARCHAR(100) NOT NULL,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(client_id, trainer_name)
);

CREATE INDEX IF NOT EXISTS idx_trainer_name ON trainer_ratings(trainer_name);

-- =====================================================
-- CLIENT BADGES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS client_badges (
    id SERIAL PRIMARY KEY,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    badge_name VARCHAR(100) NOT NULL,
    awarded_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_client_badges ON client_badges(client_id);

-- =====================================================
-- TRAINING SCHEDULE TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS training_schedule (
    id SERIAL PRIMARY KEY,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    day_of_week VARCHAR(10),
    day_number INT,
    session_name VARCHAR(100),
    session_time TIME,
    has_session BOOLEAN DEFAULT FALSE,
    is_today BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_client_schedule ON training_schedule(client_id);
CREATE INDEX IF NOT EXISTS idx_day ON training_schedule(day_number);

-- Trigger for training_schedule.updated_at
CREATE TRIGGER trigger_training_schedule_updated_at
    BEFORE UPDATE ON training_schedule
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- EXCURSIONS TABLES
-- =====================================================
CREATE TABLE IF NOT EXISTS excursions (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    level VARCHAR(20) NOT NULL CHECK (level IN ('beginner', 'intermediate', 'advanced')),
    level_label VARCHAR(20) NOT NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    duration VARCHAR(50) NOT NULL,
    spots INT NOT NULL DEFAULT 0,
    spots_left INT NOT NULL DEFAULT 0,
    cost DECIMAL(10,2) NOT NULL,
    img_url VARCHAR(500),
    thumb_url VARCHAR(500),
    map_url VARCHAR(500),
    description TEXT,
    guide VARCHAR(100),
    meetup_point VARCHAR(255),
    min_bmi INT DEFAULT 15,
    max_bmi INT DEFAULT 40,
    min_level VARCHAR(20) DEFAULT 'beginner',
    required_tenure_months INT DEFAULT 0,
    difficulty INT DEFAULT 1 CHECK (difficulty BETWEEN 1 AND 10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_excursions_level ON excursions(level);
CREATE INDEX IF NOT EXISTS idx_excursions_date ON excursions(date);
CREATE INDEX IF NOT EXISTS idx_excursions_spots_left ON excursions(spots_left);

-- Trigger for excursions.updated_at
CREATE TRIGGER trigger_excursions_updated_at
    BEFORE UPDATE ON excursions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS excursion_tags (
    id SERIAL PRIMARY KEY,
    excursion_id VARCHAR(50) NOT NULL REFERENCES excursions(id) ON DELETE CASCADE,
    tag_name VARCHAR(50) NOT NULL,
    UNIQUE(excursion_id, tag_name)
);

CREATE INDEX IF NOT EXISTS idx_excursion_tags_excursion ON excursion_tags(excursion_id);
CREATE INDEX IF NOT EXISTS idx_excursion_tags_tag ON excursion_tags(tag_name);

CREATE TABLE IF NOT EXISTS excursion_bring_items (
    id SERIAL PRIMARY KEY,
    excursion_id VARCHAR(50) NOT NULL REFERENCES excursions(id) ON DELETE CASCADE,
    item_name VARCHAR(255) NOT NULL,
    display_order INT DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_bring_items_excursion ON excursion_bring_items(excursion_id);

CREATE TABLE IF NOT EXISTS excursion_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    excursion_id VARCHAR(50) NOT NULL REFERENCES excursions(id) ON DELETE RESTRICT,
    booking_reference VARCHAR(50) UNIQUE NOT NULL,
    booked_for_name VARCHAR(255) NOT NULL,
    booked_for_email VARCHAR(255) NOT NULL,
    booked_for_phone VARCHAR(50) NOT NULL,
    special_notes TEXT,
    payment_method VARCHAR(50) DEFAULT 'online',
    payment_status VARCHAR(50) DEFAULT 'pending',
    booking_status VARCHAR(50) DEFAULT 'confirmed',
    total_amount DECIMAL(10,2) NOT NULL,
    booked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    cancelled_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_excursion_bookings_client ON excursion_bookings(client_id);
CREATE INDEX IF NOT EXISTS idx_excursion_bookings_excursion ON excursion_bookings(excursion_id);
CREATE INDEX IF NOT EXISTS idx_excursion_bookings_reference ON excursion_bookings(booking_reference);
CREATE INDEX IF NOT EXISTS idx_excursion_bookings_status ON excursion_bookings(booking_status);
CREATE INDEX IF NOT EXISTS idx_excursion_bookings_date ON excursion_bookings(booked_at);

-- Trigger for excursion_bookings.updated_at
CREATE TRIGGER trigger_excursion_bookings_updated_at
    BEFORE UPDATE ON excursion_bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS excursion_ml_scores (
    id SERIAL PRIMARY KEY,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    excursion_id VARCHAR(50) NOT NULL REFERENCES excursions(id) ON DELETE CASCADE,
    score INT NOT NULL,
    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(client_id, excursion_id)
);

CREATE INDEX IF NOT EXISTS idx_client_scores ON excursion_ml_scores(client_id, score DESC);

-- =====================================================
-- CONSULTATION TABLES
-- =====================================================
CREATE TABLE IF NOT EXISTS consultation_types (
    id VARCHAR(50) PRIMARY KEY,
    icon VARCHAR(10),
    title VARCHAR(100) NOT NULL,
    subtitle VARCHAR(200),
    duration_minutes INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    price_display VARCHAR(50) NOT NULL,
    badge_text VARCHAR(50),
    badge_color VARCHAR(20),
    description TEXT,
    coach_description VARCHAR(200),
    img_url VARCHAR(500),
    includes JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_consultation_types_active ON consultation_types(is_active);
CREATE INDEX IF NOT EXISTS idx_consultation_types_order ON consultation_types(display_order);

-- Trigger for consultation_types.updated_at
CREATE TRIGGER trigger_consultation_types_updated_at
    BEFORE UPDATE ON consultation_types
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS consultation_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    consultation_type_id VARCHAR(50) NOT NULL REFERENCES consultation_types(id),
    booking_reference VARCHAR(50) UNIQUE NOT NULL,
    booking_date DATE NOT NULL,
    booking_time TIME NOT NULL,
    session_format VARCHAR(20) DEFAULT 'in-person',
    status VARCHAR(20) DEFAULT 'confirmed',
    notes TEXT,
    client_name VARCHAR(255) NOT NULL,
    client_email VARCHAR(255) NOT NULL,
    cancelled_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_consultation_bookings_client ON consultation_bookings(client_id);
CREATE INDEX IF NOT EXISTS idx_consultation_bookings_status ON consultation_bookings(status);
CREATE INDEX IF NOT EXISTS idx_consultation_bookings_date ON consultation_bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_consultation_bookings_reference ON consultation_bookings(booking_reference);
CREATE INDEX IF NOT EXISTS idx_consultation_client_status_date ON consultation_bookings(client_id, status, booking_date);

-- Trigger for consultation_bookings.updated_at
CREATE TRIGGER trigger_consultation_bookings_updated_at
    BEFORE UPDATE ON consultation_bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS consultation_availability (
    id SERIAL PRIMARY KEY,
    booking_date DATE NOT NULL,
    time_slot TIME NOT NULL,
    is_booked BOOLEAN DEFAULT FALSE,
    booked_by UUID NULL REFERENCES clients(id) ON DELETE SET NULL,
    booking_id UUID NULL REFERENCES consultation_bookings(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(booking_date, time_slot)
);

CREATE INDEX IF NOT EXISTS idx_consultation_availability_date ON consultation_availability(booking_date);
CREATE INDEX IF NOT EXISTS idx_consultation_availability_booked ON consultation_availability(is_booked);

-- Trigger for consultation_availability.updated_at
CREATE TRIGGER trigger_consultation_availability_updated_at
    BEFORE UPDATE ON consultation_availability
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS business_hours (
    id SERIAL PRIMARY KEY,
    day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    is_open BOOLEAN DEFAULT TRUE,
    start_time TIME,
    end_time TIME,
    slot_interval_minutes INT DEFAULT 60,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(day_of_week)
);

-- Trigger for business_hours.updated_at
CREATE TRIGGER trigger_business_hours_updated_at
    BEFORE UPDATE ON business_hours
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS holidays (
    id SERIAL PRIMARY KEY,
    holiday_date DATE NOT NULL UNIQUE,
    name VARCHAR(100),
    is_closed BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_holidays_date ON holidays(holiday_date);

-- =====================================================
-- SHOP TABLES
-- =====================================================
CREATE TABLE IF NOT EXISTS shop_categories (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    icon VARCHAR(10),
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_shop_categories_active ON shop_categories(is_active);
CREATE INDEX IF NOT EXISTS idx_shop_categories_order ON shop_categories(display_order);

-- Trigger for shop_categories.updated_at
CREATE TRIGGER trigger_shop_categories_updated_at
    BEFORE UPDATE ON shop_categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS shop_products (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    category_id VARCHAR(50) NOT NULL REFERENCES shop_categories(id),
    image_url VARCHAR(500),
    badge_text VARCHAR(100),
    badge_color VARCHAR(20),
    rating DECIMAL(2,1) DEFAULT 4.5,
    review_count INT DEFAULT 0,
    stock_quantity INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    featured BOOLEAN DEFAULT FALSE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_shop_products_category ON shop_products(category_id);
CREATE INDEX IF NOT EXISTS idx_shop_products_active ON shop_products(is_active);
CREATE INDEX IF NOT EXISTS idx_shop_products_featured ON shop_products(featured);
CREATE INDEX IF NOT EXISTS idx_shop_products_price ON shop_products(price);
CREATE INDEX IF NOT EXISTS idx_shop_products_name ON shop_products(name);

-- Trigger for shop_products.updated_at
CREATE TRIGGER trigger_shop_products_updated_at
    BEFORE UPDATE ON shop_products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS shop_cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    product_id VARCHAR(50) NOT NULL REFERENCES shop_products(id) ON DELETE CASCADE,
    quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(client_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_shop_cart_client ON shop_cart_items(client_id);

-- Trigger for shop_cart_items.updated_at
CREATE TRIGGER trigger_shop_cart_items_updated_at
    BEFORE UPDATE ON shop_cart_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS shop_wishlist_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    product_id VARCHAR(50) NOT NULL REFERENCES shop_products(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(client_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_shop_wishlist_client ON shop_wishlist_items(client_id);

CREATE TABLE IF NOT EXISTS shop_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_reference VARCHAR(50) UNIQUE NOT NULL,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    order_status VARCHAR(50) DEFAULT 'pending',
    payment_status VARCHAR(50) DEFAULT 'pending',
    payment_method VARCHAR(50) DEFAULT 'card',
    subtotal DECIMAL(10,2) NOT NULL,
    tax DECIMAL(10,2) NOT NULL,
    shipping_cost DECIMAL(10,2) NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    shipping_address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    notes TEXT,
    placed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    delivered_at TIMESTAMP NULL,
    cancelled_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    pickup_notes TEXT,
    ready_for_pickup BOOLEAN DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_shop_orders_client ON shop_orders(client_id);
CREATE INDEX IF NOT EXISTS idx_shop_orders_reference ON shop_orders(order_reference);
CREATE INDEX IF NOT EXISTS idx_shop_orders_status ON shop_orders(order_status);
CREATE INDEX IF NOT EXISTS idx_shop_orders_date ON shop_orders(placed_at);

-- Trigger for shop_orders.updated_at
CREATE TRIGGER trigger_shop_orders_updated_at
    BEFORE UPDATE ON shop_orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS shop_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES shop_orders(id) ON DELETE CASCADE,
    product_id VARCHAR(50) NOT NULL REFERENCES shop_products(id) ON DELETE RESTRICT,
    product_name VARCHAR(255) NOT NULL,
    product_price DECIMAL(10,2) NOT NULL,
    quantity INT NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_shop_order_items_order ON shop_order_items(order_id);

-- =====================================================
-- TRAINER ASSESSMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS trainer_assessments (
    id SERIAL PRIMARY KEY,
    trainer_id UUID NOT NULL REFERENCES trainers(id) ON DELETE CASCADE,
    trainer_name VARCHAR(100) NOT NULL,
    performance_score DECIMAL(3,1) DEFAULT 0,
    motivation_score DECIMAL(3,1) DEFAULT 0,
    interaction_score DECIMAL(3,1) DEFAULT 0,
    knowledge_score DECIMAL(3,1) DEFAULT 0,
    punctuality_score DECIMAL(3,1) DEFAULT 0,
    average_score DECIMAL(3,1) DEFAULT 0,
    standing VARCHAR(20),
    assessment_date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_trainer_assessments_trainer ON trainer_assessments(trainer_id);
CREATE INDEX IF NOT EXISTS idx_trainer_assessments_date ON trainer_assessments(assessment_date);

-- =====================================================
-- CLIENT STATUS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS client_status (
    id SERIAL PRIMARY KEY,
    client_id UUID NOT NULL UNIQUE REFERENCES clients(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'Active',
    last_visit DATE,
    membership_plan VARCHAR(50) DEFAULT 'Standard',
    assigned_trainer_id UUID REFERENCES trainers(id) ON DELETE SET NULL,
    fitness_goal VARCHAR(100),
    progress_percentage INT DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_client_status_status ON client_status(status);
CREATE INDEX IF NOT EXISTS idx_client_status_trainer ON client_status(assigned_trainer_id);

-- Trigger for client_status.updated_at
CREATE TRIGGER trigger_client_status_updated_at
    BEFORE UPDATE ON client_status
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SAMPLE DATA INSERTION (using PL/pgSQL block)
-- =====================================================
DO $$
DECLARE
    client1_id UUID;
    client2_id UUID;
    client3_id UUID;
    trainer1_id UUID;
    trainer2_id UUID;
    admin1_id UUID;
    today_dow INT;
BEGIN
    -- Get current day of week (0=Sunday, 1=Monday, ..., 6=Saturday)
    today_dow := EXTRACT(DOW FROM CURRENT_DATE);

    -- Insert Accounts for clients
    INSERT INTO Accounts (id, email, password_hash, role) VALUES
        (gen_random_uuid(), 'johandson@outlook.com', '$2b$12$r0KfHB37dGfaWx4NK.uZ8O1kLNV56RJNouszlKmElcujTmNKxcVW6', 'client')
        RETURNING id INTO client1_id;
    INSERT INTO Accounts (id, email, password_hash, role) VALUES
        (gen_random_uuid(), 'plincoln@gmail.com', '$2b$12$r0KfHB37dGfaWx4NK.uZ8O1kLNV56RJNouszlKmElcujTmNKxcVW6', 'client')
        RETURNING id INTO client2_id;
    INSERT INTO Accounts (id, email, password_hash, role) VALUES
        (gen_random_uuid(), 'smirth@icloud.com', '$2b$12$r0KfHB37dGfaWx4NK.uZ8O1kLNV56RJNouszlKmElcujTmNKxcVW6', 'client')
        RETURNING id INTO client3_id;

    -- Insert client profiles
    INSERT INTO clients (id, name, gender, phone_number, birthday, height, weight) VALUES
        (client1_id, 'Joe Hanson', 'Male', '8769983264', '1990-05-15', '158', '189'),
        (client2_id, 'Peter Lincoln', 'Male', '8769983264', '1985-08-22', '193', '164'),
        (client3_id, 'Merry Smith', 'Female', '8761157976', '1995-03-10', '258', '192');

    -- Insert trainers
    INSERT INTO Accounts (id, email, password_hash, role) VALUES
        (gen_random_uuid(), 'smyers@gmail.com', '$2b$12$r0KfHB37dGfaWx4NK.uZ8O1kLNV56RJNouszlKmElcujTmNKxcVW6', 'trainer')
        RETURNING id INTO trainer1_id;
    INSERT INTO Accounts (id, email, password_hash, role) VALUES
        (gen_random_uuid(), 'ashtHall@gmail.com', '$2b$12$r0KfHB37dGfaWx4NK.uZ8O1kLNV56RJNouszlKmElcujTmNKxcVW6', 'trainer')
        RETURNING id INTO trainer2_id;

    INSERT INTO trainers (id, name, birthday, certification, rating, trainer_level, is_senior) VALUES
        (trainer1_id, 'Sherice Myers', '1988-07-20', 'Good', 3.8, 2.6, FALSE),
        (trainer2_id, 'Ashton Hall', '1982-11-03', 'Excellent', 4.8, 4.9, TRUE);

    -- Insert admin
    INSERT INTO Accounts (id, email, password_hash, role) VALUES
        (gen_random_uuid(), 'cmontgmery@gmail.com', '$2b$12$r0KfHB37dGfaWx4NK.uZ8O1kLNV56RJNouszlKmElcujTmNKxcVW6', 'admin')
        RETURNING id INTO admin1_id;

    INSERT INTO admins (id, name, phone_number, birthday) VALUES
        (admin1_id, 'Chelsea Montgomery', '8769841653', '1987-12-25');

    -- Insert goals
    INSERT INTO client_goals (client_id, goal_type, primary_goal, target_weight_kg, target_chest_cm, target_waist_cm, target_hips_cm, target_thigh_cm, target_arm_cm) VALUES
        (client1_id, 'Cut Down', 'Lose Fat and Cut', 75, 105, 78, 95, 55, 36),
        (client2_id, 'Bulk Up', 'Build Muscle and Size', 85, 110, 82, 100, 60, 40),
        (client3_id, 'Tone and Define', 'Tone and Define', 70, 95, 75, 92, 52, 34)
    ON CONFLICT (client_id) DO UPDATE SET
        goal_type = EXCLUDED.goal_type,
        target_weight_kg = EXCLUDED.target_weight_kg;

    -- Health conditions
    INSERT INTO client_health_conditions (client_id, condition_name) VALUES
        (client1_id, 'Back Pain'),
        (client1_id, 'Knee Injury'),
        (client2_id, 'Hypertension'),
        (client3_id, 'Asthma')
    ON CONFLICT (client_id, condition_name) DO NOTHING;

    -- Trainer ratings
    INSERT INTO trainer_ratings (client_id, trainer_name, rating) VALUES
        (client1_id, 'Coach Marcus', 4),
        (client1_id, 'Coach Lisa', 5),
        (client1_id, 'Coach David', 4),
        (client1_id, 'Coach Sarah', 5),
        (client2_id, 'Coach Marcus', 5),
        (client2_id, 'Coach Lisa', 5),
        (client2_id, 'Coach David', 4),
        (client2_id, 'Coach Sarah', 5),
        (client3_id, 'Coach Marcus', 3),
        (client3_id, 'Coach Lisa', 4),
        (client3_id, 'Coach David', 4),
        (client3_id, 'Coach Sarah', 4)
    ON CONFLICT (client_id, trainer_name) DO UPDATE SET rating = EXCLUDED.rating;

    -- Badges
    INSERT INTO client_badges (client_id, badge_name, awarded_date) VALUES
        (client1_id, '100 Workouts', CURRENT_DATE),
        (client1_id, '8-Week Streak', CURRENT_DATE),
        (client1_id, 'Weight Loss Milestone', CURRENT_DATE),
        (client2_id, '200 Workouts', CURRENT_DATE),
        (client2_id, '12-Week Streak', CURRENT_DATE),
        (client2_id, 'Elite Member', CURRENT_DATE),
        (client2_id, 'Strength Champion', CURRENT_DATE),
        (client3_id, '50 Workouts', CURRENT_DATE),
        (client3_id, '4-Week Streak', CURRENT_DATE),
        (client3_id, 'Consistency Award', CURRENT_DATE);

    -- Water intake
    INSERT INTO client_water_intake (client_id, intake_date, cups_consumed) VALUES
        (client1_id, CURRENT_DATE, 4),
        (client2_id, CURRENT_DATE, 6),
        (client3_id, CURRENT_DATE, 3)
    ON CONFLICT (client_id, intake_date) DO UPDATE SET cups_consumed = EXCLUDED.cups_consumed;

    -- Workout sessions
    INSERT INTO client_workout_sessions (client_id, session_date, session_type, duration_minutes, calories_burned, avg_heart_rate, notes) VALUES
        (client1_id, CURRENT_DATE - INTERVAL '7 days', 'Upper Body Hypertrophy', 65, 500, 140, 'Bench press, rows, OHP'),
        (client2_id, CURRENT_DATE - INTERVAL '7 days', 'Upper Body Power', 70, 560, 145, 'Bench, rows, accessories'),
        (client3_id, CURRENT_DATE - INTERVAL '7 days', 'Full Body Circuit', 55, 420, 140, 'Light weights, high reps');

    -- Strength records
    INSERT INTO client_strength_records (client_id, exercise_name, current_weight_kg, goal_weight_kg, current_reps, goal_reps, percentage_progress, record_date) VALUES
        (client1_id, 'Bench Press', 85, 100, 8, 10, 85, CURRENT_DATE),
        (client1_id, 'Squat', 110, 130, 8, 10, 85, CURRENT_DATE),
        (client1_id, 'Deadlift', 130, 150, 5, 6, 87, CURRENT_DATE),
        (client1_id, 'Overhead Press', 50, 65, 8, 10, 77, CURRENT_DATE),
        (client1_id, 'Pull-ups', 12, 20, 10, 15, 60, CURRENT_DATE),
        (client2_id, 'Bench Press', 110, 130, 8, 10, 85, CURRENT_DATE),
        (client2_id, 'Squat', 140, 160, 8, 10, 88, CURRENT_DATE),
        (client2_id, 'Deadlift', 170, 190, 5, 6, 89, CURRENT_DATE),
        (client2_id, 'Overhead Press', 70, 85, 8, 10, 82, CURRENT_DATE),
        (client2_id, 'Pull-ups', 20, 30, 10, 15, 67, CURRENT_DATE),
        (client3_id, 'Bench Press', 60, 75, 8, 10, 80, CURRENT_DATE),
        (client3_id, 'Squat', 80, 100, 8, 10, 80, CURRENT_DATE),
        (client3_id, 'Deadlift', 90, 110, 5, 6, 82, CURRENT_DATE),
        (client3_id, 'Overhead Press', 35, 45, 8, 10, 78, CURRENT_DATE),
        (client3_id, 'Pull-ups', 5, 10, 10, 15, 50, CURRENT_DATE);

    -- Training schedule (only for client1 as in original)
    INSERT INTO training_schedule (client_id, day_of_week, day_number, session_name, session_time, has_session, is_today) VALUES
        (client1_id, 'Monday', 25, 'Upper Body Strength', '17:30:00', TRUE, FALSE),
        (client1_id, 'Tuesday', 26, NULL, NULL, FALSE, FALSE),
        (client1_id, 'Wednesday', 27, 'Lower Body Power', '17:30:00', TRUE, FALSE),
        (client1_id, 'Thursday', 28, 'Back and Biceps', '17:30:00', TRUE, FALSE),
        (client1_id, 'Friday', 1, NULL, NULL, FALSE, FALSE),
        (client1_id, 'Saturday', 2, 'Cardio and Core', '09:00:00', TRUE, (today_dow = 6)),
        (client1_id, 'Sunday', 3, NULL, NULL, FALSE, FALSE),
        (client1_id, 'Monday', 4, 'Upper Body Hypertrophy', '17:30:00', TRUE, (today_dow = 1));

    -- Client status
    INSERT INTO client_status (client_id, status, last_visit, membership_plan, fitness_goal, progress_percentage) VALUES
        (client1_id, 'Active', CURRENT_DATE - (floor(random() * 30) || ' days')::INTERVAL, 'Standard', 'Weight Loss', floor(random() * 100)),
        (client2_id, 'New', CURRENT_DATE - (floor(random() * 30) || ' days')::INTERVAL, 'Premium', 'Muscle Gain', floor(random() * 100)),
        (client3_id, 'Inactive', CURRENT_DATE - (floor(random() * 30) || ' days')::INTERVAL, 'Basic', 'Endurance', floor(random() * 100))
    ON CONFLICT (client_id) DO UPDATE SET
        status = EXCLUDED.status,
        last_visit = EXCLUDED.last_visit,
        membership_plan = EXCLUDED.membership_plan,
        fitness_goal = EXCLUDED.fitness_goal,
        progress_percentage = EXCLUDED.progress_percentage;
END $$;

-- =====================================================
-- EXCURSIONS DATA (static, no dependencies)
-- =====================================================
INSERT INTO excursions (id, name, location, level, level_label, date, time, duration, spots, spots_left, cost, img_url, thumb_url, map_url, description, guide, meetup_point, min_bmi, max_bmi, min_level, required_tenure_months, difficulty) VALUES
('exc_001', 'Blue Mountain Sunrise Hike', 'Blue Mountains, St. Andrew', 'advanced', 'Advanced', '2026-05-03', '03:00:00', '8 hours', 12, 4, 8500, 
 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80&fit=crop', 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&q=80&fit=crop',
 'https://www.openstreetmap.org/export/embed.html?bbox=-76.8500%2C18.0200%2C-76.6500%2C18.1200&layer=mapnik&marker=18.0646%2C-76.7500',
 'Jamaica''s most iconic trek. Conquer the highest peak in the Caribbean at 7,402 ft above sea level. Depart at 3 AM to summit for sunrise — a once-in-a-lifetime experience that demands serious fitness preparation.',
 'Coach Marcus Reid', 'B.A.D People Fitness, Kingston', 15, 30, 'advanced', 12, 9),
('exc_002', 'Dunn''s River Falls Wellness Walk', 'Dunn''s River Falls, Ocho Rios', 'beginner', 'Beginner', '2026-04-19', '08:00:00', '5 hours', 20, 11, 5500,
 'https://images.unsplash.com/photo-1518623489648-a173ef7824f3?w=800&q=80&fit=crop', 'https://images.unsplash.com/photo-1518623489648-a173ef7824f3?w=400&q=80&fit=crop',
 'https://www.openstreetmap.org/export/embed.html?bbox=-77.0200%2C18.4000%2C-76.9800%2C18.4300&layer=mapnik&marker=18.4117%2C-77.0145',
 'A refreshing family-friendly climb up the iconic Dunn''s River Falls. Perfect for beginners looking to enjoy active outdoor fun. Includes a wellness picnic and cool-down stretching session with a certified trainer.',
 'Coach Priya Nair', 'B.A.D People Fitness, Kingston', 15, 40, 'beginner', 0, 3),
('exc_003', 'Mystic Mountain Trail Run', 'Mystic Mountain, Ocho Rios', 'intermediate', 'Intermediate', '2026-05-17', '07:30:00', '6 hours', 15, 0, 7000,
 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&q=80&fit=crop', 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=400&q=80&fit=crop',
 'https://www.openstreetmap.org/export/embed.html?bbox=-76.9700%2C18.4050%2C-76.9200%2C18.4300&layer=mapnik&marker=18.4170%2C-76.9450',
 'An exhilarating trail run through Jamaica''s lush rainforest. Moderate terrain with challenging inclines — perfect for those who have built a solid fitness base. Includes post-run recovery session and protein-packed lunch.',
 'Coach Jordan Wells', 'B.A.D People Fitness, Kingston', 15, 34, 'intermediate', 6, 6),
('exc_004', 'Pelican Bar Kayak Challenge', 'Pelican Bar, St. Elizabeth', 'intermediate', 'Intermediate', '2026-06-07', '06:30:00', '7 hours', 10, 6, 9500,
 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&q=80&fit=crop', 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=400&q=80&fit=crop',
 'https://www.openstreetmap.org/export/embed.html?bbox=-77.9000%2C17.8300%2C-77.8000%2C17.8800&layer=mapnik&marker=17.8530%2C-77.8410',
 'Paddle your way across the Caribbean Sea to Jamaica''s famous Pelican Bar — a bar built on a sandbar in the middle of the ocean. A full-body workout that rewards you with paradise. Upper body and core strength required.',
 'Coach Sasha Volkov', 'B.A.D People Fitness, Kingston', 15, 32, 'intermediate', 4, 7),
('exc_005', 'Portland Waterfall Discovery', 'Reach Falls, Portland', 'beginner', 'Beginner', '2026-05-31', '07:00:00', '9 hours', 18, 13, 6000,
 'https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=800&q=80&fit=crop', 'https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=400&q=80&fit=crop',
 'https://www.openstreetmap.org/export/embed.html?bbox=-76.3500%2C18.0000%2C-76.1500%2C18.1000&layer=mapnik&marker=18.0500%2C-76.2500',
 'Discover the hidden gem of Portland — Reach Falls. A guided walk through lush jungle trails, swimming holes and cascading falls. Suitable for all fitness levels with moderate walking. Includes jungle picnic.',
 'Coach Elena Vasquez', 'B.A.D People Fitness, Kingston', 15, 40, 'beginner', 0, 4),
('exc_006', 'Cockpit Country Extreme Trek', 'Cockpit Country, Trelawny', 'advanced', 'Advanced', '2026-06-21', '05:00:00', '10 hours', 8, 3, 11000,
 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80&fit=crop', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80&fit=crop',
 'https://www.openstreetmap.org/export/embed.html?bbox=-77.7000%2C18.2000%2C-77.4000%2C18.4000&layer=mapnik&marker=18.2800%2C-77.5800',
 'The ultimate Jamaican adventure. Navigate the rugged limestone terrain of the Cockpit Country — one of Jamaica''s most biologically diverse and challenging environments. Includes caving and river crossing. Elite fitness required.',
 'Coach Marcus Reid', 'B.A.D People Fitness, Kingston', 15, 28, 'advanced', 18, 10);

INSERT INTO excursion_tags (excursion_id, tag_name) VALUES
('exc_001', 'Hiking'), ('exc_001', 'Cardio'), ('exc_001', 'Nature'),
('exc_002', 'Walking'), ('exc_002', 'Wellness'), ('exc_002', 'Waterfall'),
('exc_003', 'Trail Run'), ('exc_003', 'Endurance'), ('exc_003', 'Rainforest'),
('exc_004', 'Kayaking'), ('exc_004', 'Water Sports'), ('exc_004', 'Endurance'),
('exc_005', 'Hiking'), ('exc_005', 'Waterfall'), ('exc_005', 'Nature Walk'),
('exc_006', 'Extreme Hiking'), ('exc_006', 'Caving'), ('exc_006', 'Advanced');

INSERT INTO excursion_bring_items (excursion_id, item_name, display_order) VALUES
('exc_001', 'Water (2L minimum)', 1), ('exc_001', 'Headlamp', 2), ('exc_001', 'Warm layers', 3), ('exc_001', 'Energy snacks', 4), ('exc_001', 'Hiking boots', 5),
('exc_002', 'Water shoes', 1), ('exc_002', 'Change of clothes', 2), ('exc_002', 'Sunscreen', 3), ('exc_002', 'Water bottle', 4),
('exc_003', 'Trail shoes', 1), ('exc_003', 'Hydration pack', 2), ('exc_003', 'Sports nutrition', 3), ('exc_003', 'First aid kit', 4),
('exc_004', 'Rash guard', 1), ('exc_004', 'Sunscreen', 2), ('exc_004', 'Waterproof bag', 3), ('exc_004', 'Water shoes', 4),
('exc_005', 'Water shoes', 1), ('exc_005', 'Swimwear', 2), ('exc_005', 'Insect repellent', 3), ('exc_005', 'Water bottle', 4), ('exc_005', 'Snacks', 5),
('exc_006', 'Professional hiking boots', 1), ('exc_006', 'Headlamp', 2), ('exc_006', 'GPS tracker', 3), ('exc_006', '3L water', 4), ('exc_006', 'Gloves', 5), ('exc_006', 'Emergency kit', 6);

-- =====================================================
-- CONSULTATION DATA (static)
-- =====================================================
INSERT INTO consultation_types (id, icon, title, subtitle, duration_minutes, price, price_display, badge_text, badge_color, description, coach_description, img_url, includes, display_order) VALUES
('starter', '🚀', 'Starter Consultation', 'New to GymVault', 45, 0, 'Free', 'Complimentary', 'green', 
 'Your perfect entry point. Our coaches assess your current fitness level, understand your goals and build a personalised roadmap for your first 90 days at GymVault.',
 'Any certified GymVault coach',
 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80&fit=crop',
 jsonb_build_array('Full fitness baseline assessment', 'Goal-setting & roadmap planning', 'Gym orientation & equipment walkthrough', 'Membership plan recommendation', 'Free first-week programme'),
 1),
('nutrition', '🥗', 'Nutritional Consultation', 'Fuel Your Performance', 60, 45, '$45', 'Most Popular', 'orange',
 'A deep-dive into your diet, metabolism and eating habits with a certified Precision Nutrition coach. Walk away with a fully personalised meal plan and supplement strategy.',
 'Precision Nutrition Level 2 coach',
 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&q=80&fit=crop',
 jsonb_build_array('Body composition analysis', 'Macro & calorie target setting', 'Personalised meal plan (7-day)', 'Supplement protocol', 'Ongoing tracking setup (app)', 'Follow-up check-in included'),
 2),
('general', '💬', 'General Consultation', 'Talk to an Expert', 30, 0, 'Free', 'Open to All', 'blue',
 'Have a question about training, recovery, memberships or programmes? Book a no-pressure chat with one of our senior coaches — available in-person or via video call.',
 'Senior GymVault coach',
 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=600&q=80&fit=crop',
 jsonb_build_array('Open Q&A with a senior coach', 'Programme review & advice', 'Injury or recovery guidance', 'Membership & upgrade support', 'In-person or video call option'),
 3);

INSERT INTO business_hours (day_of_week, is_open, start_time, end_time, slot_interval_minutes) VALUES
(1, TRUE, '06:00:00', '20:00:00', 60),
(2, TRUE, '06:00:00', '20:00:00', 60),
(3, TRUE, '06:00:00', '20:00:00', 60),
(4, TRUE, '06:00:00', '20:00:00', 60),
(5, TRUE, '06:00:00', '20:00:00', 60),
(6, TRUE, '07:00:00', '17:00:00', 60),
(0, FALSE, NULL, NULL, 60);

INSERT INTO holidays (holiday_date, name) VALUES
('2026-01-01', 'New Year''s Day'),
('2026-01-19', 'MLK Day'),
('2026-02-16', 'Presidents'' Day'),
('2026-05-25', 'Memorial Day'),
('2026-07-04', 'Independence Day'),
('2026-09-07', 'Labor Day'),
('2026-11-26', 'Thanksgiving'),
('2026-12-25', 'Christmas Day'),
('2026-12-31', 'New Year''s Eve');

-- Pre-booked consultation slots (no actual bookings, just marked as booked)
INSERT INTO consultation_availability (booking_date, time_slot, is_booked) VALUES
('2026-04-08', '09:00:00', TRUE),
('2026-04-08', '10:00:00', TRUE),
('2026-04-08', '11:00:00', TRUE),
('2026-04-08', '14:00:00', TRUE),
('2026-04-09', '09:00:00', TRUE),
('2026-04-09', '13:00:00', TRUE),
('2026-04-10', '10:00:00', TRUE),
('2026-04-10', '11:00:00', TRUE),
('2026-04-10', '15:00:00', TRUE),
('2026-04-14', '09:00:00', TRUE),
('2026-04-14', '10:00:00', TRUE),
('2026-04-15', '09:00:00', TRUE),
('2026-04-15', '14:00:00', TRUE),
('2026-04-15', '15:00:00', TRUE),
('2026-04-16', '11:00:00', TRUE),
('2026-04-21', '09:00:00', TRUE),
('2026-04-22', '14:00:00', TRUE),
('2026-04-23', '10:00:00', TRUE);

-- =====================================================
-- SHOP DATA (static)
-- =====================================================
INSERT INTO shop_categories (id, name, display_name, icon, display_order) VALUES
('merch', 'merch', 'Merch', '👕', 1),
('essentials', 'essentials', 'Gym Essentials', '🏋️', 2),
('supplements', 'supplements', 'Supplements', '💊', 3);

INSERT INTO shop_products (id, name, description, price, category_id, image_url, badge_text, badge_color, rating, review_count, stock_quantity, featured, display_order) VALUES
('gym-tshirt', 'Gym T-Shirt', 'Premium cotton gym t-shirt with moisture-wicking technology', 1500, 'merch', '/images/SHIRT.webp', 'Best Seller', 'orange', 4.8, 128, 50, TRUE, 1),
('hoodie', 'Hoodie', 'Comfortable oversized hoodie for post-workout recovery', 2500, 'merch', '/images/merch2.png', 'New', 'green', 4.9, 45, 30, TRUE, 2),
('gym-cap', 'Gym Cap', 'Adjustable gym cap with breathable mesh panels', 500, 'merch', '/images/CAP.jpg', NULL, NULL, 4.5, 67, 100, FALSE, 3),
('gym-towel', 'Gym Towel', 'Microfiber gym towel, quick-drying and compact', 1000, 'merch', '/images/TOWEL.jpg', NULL, NULL, 4.6, 89, 75, FALSE, 4),
('yoga-mat', 'Yoga Mat', 'Non-slip eco-friendly yoga mat, 6mm thickness', 1500, 'essentials', '/images/mat.webp', 'Popular', 'orange', 4.7, 156, 40, TRUE, 1),
('bands', 'Resistance Bands', 'Set of 5 resistance bands with different tension levels', 1000, 'essentials', '/images/bands.png', NULL, NULL, 4.8, 92, 60, FALSE, 2),
('gym-gloves', 'Gym Gloves', 'Leather gym gloves with wrist support', 1500, 'essentials', '/images/GLOVES.jpg', NULL, NULL, 4.4, 34, 45, FALSE, 3),
('jump-rope', 'Jump Rope', 'Speed jump rope with ball bearings', 2000, 'essentials', '/images/ROPE.webp', 'New', 'green', 4.9, 23, 55, TRUE, 4),
('protein', 'Protein Powder', 'Whey protein isolate, 2lb tub, chocolate flavor', 3000, 'supplements', '/images/protein.png', 'Best Seller', 'orange', 4.9, 234, 120, TRUE, 1),
('creatine', 'Creatine', 'Micronized creatine monohydrate, 300g', 5000, 'supplements', '/images/creatine.png', 'Premium', 'blue', 4.8, 167, 80, TRUE, 2),
('multivitamin', 'Multivitamins', 'Daily multivitamin for active individuals', 3000, 'supplements', '/images/vitamins.png', NULL, NULL, 4.6, 89, 150, FALSE, 3),
('preworkout', 'Pre-Workout', 'High-energy pre-workout powder, 30 servings', 3000, 'supplements', '/images/preworkout.png', 'Popular', 'orange', 4.7, 145, 60, TRUE, 4);

-- =====================================================
-- ADDITIONAL UPDATES (as per original script)
-- =====================================================
-- Update password for a specific account (if exists)
UPDATE Accounts SET password_hash = '$2b$12$kAYMMRqrTQmXGMgk.kKAI.OZViLfgUllOl8OxvEbOXCRcxfJ82HNm'
WHERE email = 'jonathanbennett984@gmail.com';

-- =====================================================
-- VERIFICATION QUERIES (commented out, run manually if needed)
-- =====================================================
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'Accounts' ORDER BY table_name;
-- SELECT COUNT(*) AS total_accounts FROM Accounts;
-- SELECT COUNT(*) AS total_clients FROM clients;
-- SELECT COUNT(*) AS total_trainers FROM trainers;
-- SELECT COUNT(*) AS total_products FROM shop_products;