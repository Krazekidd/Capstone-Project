create DATABASE Accounts;
USE Accounts;

-- Main Accounts table for authentication (unified login)
CREATE TABLE Accounts (
    id binary(16) PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('client', 'trainer', 'admin')),
    created_at DATETIME DEFAULT (NOW()),
    updated_at DATETIME DEFAULT (NOW())
);

-- Client profiles (extends Accounts table)
CREATE TABLE clients (
    id binary(16) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    gender VARCHAR(10),
    phone_number VARCHAR(20),
    birthday DATE,
    height VARCHAR(10),
    weight VARCHAR(10),
    created_at DATETIME DEFAULT (NOW()),
    updated_at DATETIME DEFAULT (NOW()),
    FOREIGN KEY (id) REFERENCES Accounts(id) ON DELETE CASCADE
);

-- Trainer profiles (extends Accounts table)
CREATE TABLE trainers (
    id binary(16) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    birthday DATE,
    certification VARCHAR(100),
    rating FLOAT DEFAULT 0,
    trainer_level FLOAT DEFAULT 1,
    is_senior BIT DEFAULT 0,
    created_at DATETIME DEFAULT (NOW()),
    updated_at DATETIME DEFAULT (NOW()),
    FOREIGN KEY (id) REFERENCES Accounts(id) ON DELETE CASCADE
);

-- Admin profiles (extends Accounts table)
CREATE TABLE admins (
    id binary(16) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20),
    birthday DATE,
    created_at DATETIME DEFAULT (NOW()),
    updated_at DATETIME DEFAULT (NOW()),
    FOREIGN KEY (id) REFERENCES Accounts(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_Accounts_email ON Accounts(email);
CREATE INDEX idx_Accounts_role ON Accounts(role);
CREATE INDEX idx_clients_name ON clients(name);
CREATE INDEX idx_trainers_name ON trainers(name);
CREATE INDEX idx_admins_name ON admins(name);

-- Insert test data

-- Clients (password: 'password123' hashed with bcrypt)
INSERT INTO Accounts (id, email, password_hash, role, created_at, updated_at) 
VALUES 
    (UUID_TO_BIN(UUID()), 'johandson@outlook.com', '$2b$12$r0KfHB37dGfaWx4NK.uZ8O1kLNV56RJNouszlKmElcujTmNKxcVW6', 'client', NOW(), NOW()),
    (UUID_TO_BIN(UUID()),'plincoln@gmail.com', '$2b$12$r0KfHB37dGfaWx4NK.uZ8O1kLNV56RJNouszlKmElcujTmNKxcVW6', 'client', NOW(), NOW()),
    (UUID_TO_BIN(UUID()), 'smirth@icloud.com', '$2b$12$r0KfHB37dGfaWx4NK.uZ8O1kLNV56RJNouszlKmElcujTmNKxcVW6', 'client', NOW(), NOW());


-- Insert client profiles (using the same IDs from Accounts table)
SET @Client1ID = (SELECT id FROM Accounts WHERE email = 'johandson@outlook.com');
SET @Client2ID = (SELECT id FROM Accounts WHERE email = 'plincoln@gmail.com');
SET @Client3ID = (SELECT id FROM Accounts WHERE email = 'smirth@icloud.com');

INSERT INTO clients (id, name, gender,phone_number, birthday, height, weight, created_at, updated_at) VALUES
    (@Client1ID, 'Joe Hanson','Male', '8769983264', '1990-05-15', '158', '189', NOW(), NOW()),
    (@Client2ID, 'Peter Lincoln', 'Male','8769983264', '1985-08-22', '193', '164', NOW(), NOW()),
    (@Client3ID, 'Merry Smith', 'Female','8761157976', '1995-03-10', '258', '192', NOW(), NOW());

-- Trainers
INSERT INTO Accounts (id, email, password_hash, role, created_at, updated_at) 
VALUES 
    (UUID_TO_BIN(UUID()), 'smyers@gmail.com', '$2b$12$r0KfHB37dGfaWx4NK.uZ8O1kLNV56RJNouszlKmElcujTmNKxcVW6', 'trainer', NOW(), NOW()),
    (UUID_TO_BIN(UUID()), 'ashtHall@gmail.com', '$2b$12$r0KfHB37dGfaWx4NK.uZ8O1kLNV56RJNouszlKmElcujTmNKxcVW6', 'trainer', NOW(), NOW());

SET @Trainer1ID = (SELECT id FROM Accounts WHERE email = 'smyers@gmail.com');
SET @Trainer2ID = (SELECT id FROM Accounts WHERE email = 'ashtHall@gmail.com');

INSERT INTO trainers (id, name, birthday, certification, rating, trainer_level, is_senior, created_at, updated_at) VALUES
    (@Trainer1ID, 'Sherice Myers', '1988-07-20', 'Good', 3.8, 2.6, 0, NOW(), NOW()),
    (@Trainer2ID, 'Ashton Hall', '1982-11-03', 'Excellent', 4.8, 4.9, 1, NOW(), NOW());

-- Admin
INSERT INTO Accounts (id, email, password_hash, role, created_at, updated_at) 
VALUES 
    (UUID_TO_BIN(UUID()), 'cmontgmery@gmail.com', '$2b$12$r0KfHB37dGfaWx4NK.uZ8O1kLNV56RJNouszlKmElcujTmNKxcVW6', 'admin', NOW(), NOW());

SET @Admin1ID = (SELECT id FROM Accounts WHERE email = 'cmontgmery@gmail.com');

INSERT INTO admins (id, name, phone_number, birthday, created_at, updated_at) VALUES
    (@Admin1ID, 'Chelsea Montgomery', '8769841653', '1987-12-25', NOW(), NOW());

-- Verify the data
SELECT BIN_TO_UUID(id) as uuid, email, role FROM Accounts;
SELECT * FROM clients;
SELECT * FROM trainers;
SELECT * FROM admins;
USE Accounts;

USE Accounts;

-- =====================================================
-- BODY MEASUREMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS body_measurements (
    id BINARY(16) PRIMARY KEY DEFAULT (UUID_TO_BIN(UUID())),
    user_id BINARY(16) NOT NULL,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Body basics
    weight FLOAT,
    height FLOAT,
    body_fat FLOAT,
    
    -- Upper body
    chest FLOAT,
    waist FLOAT,
    shoulders FLOAT,
    arm_left FLOAT,
    arm_right FLOAT,
    neck FLOAT,
    
    -- Lower body
    hips FLOAT,
    thigh_left FLOAT,
    thigh_right FLOAT,
    calf_left FLOAT,
    calf_right FLOAT,
    glutes FLOAT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES Accounts(id) ON DELETE CASCADE,
    INDEX idx_user_recorded (user_id, recorded_at)
);

-- Verify table was created
SELECT '=== body_measurements table created ===' as '';
SHOW TABLES LIKE 'body_measurements';

-- Describe table structure
DESCRIBE body_measurements;
-- =====================================================
-- PROGRESS TRACKING TABLE (for JSON measurements storage)
-- =====================================================
CREATE TABLE IF NOT EXISTS progress_tracking (
    id BINARY(16) PRIMARY KEY DEFAULT (UUID_TO_BIN(UUID())),
    user_id BINARY(16) NOT NULL,
    weight FLOAT,
    height FLOAT,
    measurements TEXT,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Accounts(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_recorded_at (recorded_at),
    INDEX idx_user_recorded (user_id, recorded_at)
);
-- =====================================================
-- CLIENT GOALS TABLE (if not exists)
-- =====================================================
CREATE TABLE IF NOT EXISTS client_goals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_id BINARY(16) NOT NULL,
    goal_type VARCHAR(50) DEFAULT 'Bulk Up',
    primary_goal VARCHAR(100),
    target_weight_kg DECIMAL(5,1),
    target_chest_cm DECIMAL(5,1),
    target_waist_cm DECIMAL(5,1),
    target_hips_cm DECIMAL(5,1),
    target_thigh_cm DECIMAL(5,1),
    target_arm_cm DECIMAL(5,1),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    UNIQUE KEY unique_client_goals (client_id),
    INDEX idx_client_goals (client_id)
);

-- =====================================================
-- CLIENT HEALTH CONDITIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS client_health_conditions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_id BINARY(16) NOT NULL,
    condition_name VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    UNIQUE KEY unique_client_condition (client_id, condition_name),
    INDEX idx_client_health (client_id)
);

-- =====================================================
-- CLIENT WATER INTAKE TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS client_water_intake (
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_id BINARY(16) NOT NULL,
    intake_date DATE NOT NULL,
    cups_consumed INT DEFAULT 0 CHECK (cups_consumed BETWEEN 0 AND 20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    UNIQUE KEY unique_client_date (client_id, intake_date),
    INDEX idx_date (intake_date)
);

-- =====================================================
-- CLIENT WORKOUT SESSIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS client_workout_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_id BINARY(16) NOT NULL,
    session_date DATE NOT NULL,
    session_type VARCHAR(50),
    duration_minutes INT,
    calories_burned INT,
    avg_heart_rate INT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    INDEX idx_client_session_date (client_id, session_date)
);

-- =====================================================
-- CLIENT STRENGTH RECORDS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS client_strength_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_id BINARY(16) NOT NULL,
    exercise_name VARCHAR(50) NOT NULL,
    current_weight_kg DECIMAL(5,1),
    goal_weight_kg DECIMAL(5,1),
    current_reps INT,
    goal_reps INT,
    percentage_progress INT,
    record_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    INDEX idx_client_strength (client_id),
    INDEX idx_exercise_name (exercise_name)
);

-- =====================================================
-- TRAINER RATINGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS trainer_ratings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_id BINARY(16) NOT NULL,
    trainer_name VARCHAR(100) NOT NULL,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    UNIQUE KEY unique_client_trainer (client_id, trainer_name),
    INDEX idx_trainer_name (trainer_name)
);

-- =====================================================
-- CLIENT BADGES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS client_badges (
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_id BINARY(16) NOT NULL,
    badge_name VARCHAR(100) NOT NULL,
    awarded_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    INDEX idx_client_badges (client_id)
);

-- =====================================================
-- TRAINING SCHEDULE TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS training_schedule (
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_id BINARY(16) NOT NULL,
    day_of_week VARCHAR(10),
    day_number INT,
    session_name VARCHAR(100),
    session_time TIME,
    has_session BOOLEAN DEFAULT FALSE,
    is_today BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    INDEX idx_client_schedule (client_id),
    INDEX idx_day (day_number)
);

-- =====================================================
-- INSERT SAMPLE DATA FOR EXISTING CLIENTS
-- =====================================================

-- Get client IDs
SET @Client1ID = (SELECT id FROM Accounts WHERE email = 'johandson@outlook.com');
SET @Client2ID = (SELECT id FROM Accounts WHERE email = 'plincoln@gmail.com');
SET @Client3ID = (SELECT id FROM Accounts WHERE email = 'smirth@icloud.com');

-- Insert goals for existing clients
INSERT INTO client_goals (client_id, goal_type, primary_goal, target_weight_kg, target_chest_cm, target_waist_cm, target_hips_cm, target_thigh_cm, target_arm_cm) VALUES
(@Client1ID, 'Cut Down', 'Lose Fat and Cut', 75, 105, 78, 95, 55, 36),
(@Client2ID, 'Bulk Up', 'Build Muscle and Size', 85, 110, 82, 100, 60, 40),
(@Client3ID, 'Tone and Define', 'Tone and Define', 70, 95, 75, 92, 52, 34)
ON DUPLICATE KEY UPDATE
    goal_type = VALUES(goal_type),
    target_weight_kg = VALUES(target_weight_kg);

-- Insert health conditions
INSERT INTO client_health_conditions (client_id, condition_name) VALUES
(@Client1ID, 'Back Pain'),
(@Client1ID, 'Knee Injury'),
(@Client2ID, 'Hypertension'),
(@Client3ID, 'Asthma')
ON DUPLICATE KEY UPDATE condition_name = VALUES(condition_name);

-- Insert trainer ratings
INSERT INTO trainer_ratings (client_id, trainer_name, rating) VALUES
(@Client1ID, 'Coach Marcus', 4),
(@Client1ID, 'Coach Lisa', 5),
(@Client1ID, 'Coach David', 4),
(@Client1ID, 'Coach Sarah', 5),
(@Client2ID, 'Coach Marcus', 5),
(@Client2ID, 'Coach Lisa', 5),
(@Client2ID, 'Coach David', 4),
(@Client2ID, 'Coach Sarah', 5),
(@Client3ID, 'Coach Marcus', 3),
(@Client3ID, 'Coach Lisa', 4),
(@Client3ID, 'Coach David', 4),
(@Client3ID, 'Coach Sarah', 4)
ON DUPLICATE KEY UPDATE rating = VALUES(rating);

-- Insert badges
INSERT INTO client_badges (client_id, badge_name, awarded_date) VALUES
(@Client1ID, '100 Workouts', CURDATE()),
(@Client1ID, '8-Week Streak', CURDATE()),
(@Client1ID, 'Weight Loss Milestone', CURDATE()),
(@Client2ID, '200 Workouts', CURDATE()),
(@Client2ID, '12-Week Streak', CURDATE()),
(@Client2ID, 'Elite Member', CURDATE()),
(@Client2ID, 'Strength Champion', CURDATE()),
(@Client3ID, '50 Workouts', CURDATE()),
(@Client3ID, '4-Week Streak', CURDATE()),
(@Client3ID, 'Consistency Award', CURDATE());

-- Insert water intake for today
INSERT INTO client_water_intake (client_id, intake_date, cups_consumed) VALUES
(@Client1ID, CURDATE(), 4),
(@Client2ID, CURDATE(), 6),
(@Client3ID, CURDATE(), 3)
ON DUPLICATE KEY UPDATE cups_consumed = VALUES(cups_consumed);

-- Insert workout sessions for last 30 days
INSERT INTO client_workout_sessions (client_id, session_date, session_type, duration_minutes, calories_burned, avg_heart_rate, notes) VALUES
(@Client1ID, DATE_SUB(CURDATE(), INTERVAL 7 DAY), 'Upper Body Hypertrophy', 65, 500, 140, 'Bench press, rows, OHP'),
(@Client2ID, DATE_SUB(CURDATE(), INTERVAL 7 DAY), 'Upper Body Power', 70, 560, 145, 'Bench, rows, accessories'),
(@Client3ID, DATE_SUB(CURDATE(), INTERVAL 7 DAY), 'Full Body Circuit', 55, 420, 140, 'Light weights, high reps');

-- Insert strength records
INSERT INTO client_strength_records (client_id, exercise_name, current_weight_kg, goal_weight_kg, current_reps, goal_reps, percentage_progress, record_date) VALUES
(@Client1ID, 'Bench Press', 85, 100, 8, 10, 85, CURDATE()),
(@Client1ID, 'Squat', 110, 130, 8, 10, 85, CURDATE()),
(@Client1ID, 'Deadlift', 130, 150, 5, 6, 87, CURDATE()),
(@Client1ID, 'Overhead Press', 50, 65, 8, 10, 77, CURDATE()),
(@Client1ID, 'Pull-ups', 12, 20, 10, 15, 60, CURDATE()),
(@Client2ID, 'Bench Press', 110, 130, 8, 10, 85, CURDATE()),
(@Client2ID, 'Squat', 140, 160, 8, 10, 88, CURDATE()),
(@Client2ID, 'Deadlift', 170, 190, 5, 6, 89, CURDATE()),
(@Client2ID, 'Overhead Press', 70, 85, 8, 10, 82, CURDATE()),
(@Client2ID, 'Pull-ups', 20, 30, 10, 15, 67, CURDATE()),
(@Client3ID, 'Bench Press', 60, 75, 8, 10, 80, CURDATE()),
(@Client3ID, 'Squat', 80, 100, 8, 10, 80, CURDATE()),
(@Client3ID, 'Deadlift', 90, 110, 5, 6, 82, CURDATE()),
(@Client3ID, 'Overhead Press', 35, 45, 8, 10, 78, CURDATE()),
(@Client3ID, 'Pull-ups', 5, 10, 10, 15, 50, CURDATE());

-- Insert training schedule for current week
INSERT INTO training_schedule (client_id, day_of_week, day_number, session_name, session_time, has_session, is_today) VALUES
(@Client1ID, 'Monday', 25, 'Upper Body Strength', '17:30:00', TRUE, FALSE),
(@Client1ID, 'Tuesday', 26, NULL, NULL, FALSE, FALSE),
(@Client1ID, 'Wednesday', 27, 'Lower Body Power', '17:30:00', TRUE, FALSE),
(@Client1ID, 'Thursday', 28, 'Back and Biceps', '17:30:00', TRUE, FALSE),
(@Client1ID, 'Friday', 1, NULL, NULL, FALSE, FALSE),
(@Client1ID, 'Saturday', 2, 'Cardio and Core', '09:00:00', TRUE, CASE WHEN DAYNAME(CURDATE()) = 'Saturday' THEN TRUE ELSE FALSE END),
(@Client1ID, 'Sunday', 3, NULL, NULL, FALSE, FALSE),
(@Client1ID, 'Monday', 4, 'Upper Body Hypertrophy', '17:30:00', TRUE, CASE WHEN DAYNAME(CURDATE()) = 'Monday' THEN TRUE ELSE FALSE END);

SELECT '=== Account Tables Created ===' as '';
SHOW TABLES LIKE 'client_%';
SHOW TABLES LIKE 'trainer_%';
SHOW TABLES LIKE 'training_%';

SHOW TABLES;

-- Main excursions table
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
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_level (level),
    INDEX idx_date (date),
    INDEX idx_spots_left (spots_left)
);

-- Excursion tags table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS excursion_tags (
    id INT AUTO_INCREMENT PRIMARY KEY,
    excursion_id VARCHAR(50) NOT NULL,
    tag_name VARCHAR(50) NOT NULL,
    FOREIGN KEY (excursion_id) REFERENCES excursions(id) ON DELETE CASCADE,
    INDEX idx_excursion (excursion_id),
    INDEX idx_tag (tag_name),
    UNIQUE KEY unique_excursion_tag (excursion_id, tag_name)
);

-- What to bring items for each excursion
CREATE TABLE IF NOT EXISTS excursion_bring_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    excursion_id VARCHAR(50) NOT NULL,
    item_name VARCHAR(255) NOT NULL,
    display_order INT DEFAULT 0,
    FOREIGN KEY (excursion_id) REFERENCES excursions(id) ON DELETE CASCADE,
    INDEX idx_excursion (excursion_id)
);

-- Client excursion bookings
CREATE TABLE IF NOT EXISTS excursion_bookings (
    id BINARY(16) PRIMARY KEY DEFAULT (UUID_TO_BIN(UUID())),
    client_id BINARY(16) NOT NULL,
    excursion_id VARCHAR(50) NOT NULL,
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
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    FOREIGN KEY (excursion_id) REFERENCES excursions(id) ON DELETE RESTRICT,
    INDEX idx_client (client_id),
    INDEX idx_excursion (excursion_id),
    INDEX idx_booking_reference (booking_reference),
    INDEX idx_booking_status (booking_status),
    INDEX idx_booking_date (booked_at)
);

-- User ML scores cache (optional, for storing recommendation scores)
CREATE TABLE IF NOT EXISTS excursion_ml_scores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_id BINARY(16) NOT NULL,
    excursion_id VARCHAR(50) NOT NULL,
    score INT NOT NULL,
    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    FOREIGN KEY (excursion_id) REFERENCES excursions(id) ON DELETE CASCADE,
    UNIQUE KEY unique_client_excursion (client_id, excursion_id),
    INDEX idx_client_scores (client_id, score DESC)
);

-- =====================================================
-- INSERT EXCURSION DATA
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

-- Insert tags for excursions
INSERT INTO excursion_tags (excursion_id, tag_name) VALUES
('exc_001', 'Hiking'), ('exc_001', 'Cardio'), ('exc_001', 'Nature'),
('exc_002', 'Walking'), ('exc_002', 'Wellness'), ('exc_002', 'Waterfall'),
('exc_003', 'Trail Run'), ('exc_003', 'Endurance'), ('exc_003', 'Rainforest'),
('exc_004', 'Kayaking'), ('exc_004', 'Water Sports'), ('exc_004', 'Endurance'),
('exc_005', 'Hiking'), ('exc_005', 'Waterfall'), ('exc_005', 'Nature Walk'),
('exc_006', 'Extreme Hiking'), ('exc_006', 'Caving'), ('exc_006', 'Advanced');

-- Insert what to bring items
INSERT INTO excursion_bring_items (excursion_id, item_name, display_order) VALUES
('exc_001', 'Water (2L minimum)', 1), ('exc_001', 'Headlamp', 2), ('exc_001', 'Warm layers', 3), ('exc_001', 'Energy snacks', 4), ('exc_001', 'Hiking boots', 5),
('exc_002', 'Water shoes', 1), ('exc_002', 'Change of clothes', 2), ('exc_002', 'Sunscreen', 3), ('exc_002', 'Water bottle', 4),
('exc_003', 'Trail shoes', 1), ('exc_003', 'Hydration pack', 2), ('exc_003', 'Sports nutrition', 3), ('exc_003', 'First aid kit', 4),
('exc_004', 'Rash guard', 1), ('exc_004', 'Sunscreen', 2), ('exc_004', 'Waterproof bag', 3), ('exc_004', 'Water shoes', 4),
('exc_005', 'Water shoes', 1), ('exc_005', 'Swimwear', 2), ('exc_005', 'Insect repellent', 3), ('exc_005', 'Water bottle', 4), ('exc_005', 'Snacks', 5),
('exc_006', 'Professional hiking boots', 1), ('exc_006', 'Headlamp', 2), ('exc_006', 'GPS tracker', 3), ('exc_006', '3L water', 4), ('exc_006', 'Gloves', 5), ('exc_006', 'Emergency kit', 6);

-- Verify data
SELECT '=== Excursions Data Loaded ===' as '';
SELECT COUNT(*) as total_excursions FROM excursions;
SELECT COUNT(*) as total_tags FROM excursion_tags;
SELECT COUNT(*) as total_bring_items FROM excursion_bring_items;


SELECT 
    TABLE_NAME,
    COLUMN_NAME,
    CONSTRAINT_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM information_schema.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'Accounts'
AND TABLE_NAME = 'excursion_bookings';

SELECT password_hash FROM accounts where email="jonathanbennett984@gmail.com";
UPDATE accounts SET password_hash = "$2b$12$kAYMMRqrTQmXGMgk.kKAI.OZViLfgUllOl8OxvEbOXCRcxfJ82HNm" 
WHERe email="jonathanbennett984@gmail.com";


-- =====================================================
-- CONSULTATION TABLES
-- =====================================================

-- Consultation types table
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
    includes JSON,
    is_active BOOLEAN DEFAULT TRUE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_active (is_active),
    INDEX idx_order (display_order)
);

-- Consultation bookings table
CREATE TABLE IF NOT EXISTS consultation_bookings (
    id BINARY(16) PRIMARY KEY DEFAULT (UUID_TO_BIN(UUID())),
    client_id BINARY(16) NOT NULL,
    consultation_type_id VARCHAR(50) NOT NULL,
    booking_reference VARCHAR(50) UNIQUE NOT NULL,
    booking_date DATE NOT NULL,
    booking_time TIME NOT NULL,
    session_format VARCHAR(20) DEFAULT 'in-person', -- in-person, video
    status VARCHAR(20) DEFAULT 'confirmed', -- confirmed, cancelled, completed, no_show
    notes TEXT,
    client_name VARCHAR(255) NOT NULL,
    client_email VARCHAR(255) NOT NULL,
    cancelled_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    FOREIGN KEY (consultation_type_id) REFERENCES consultation_types(id),
    INDEX idx_client (client_id),
    INDEX idx_status (status),
    INDEX idx_booking_date (booking_date),
    INDEX idx_booking_reference (booking_reference),
    INDEX idx_client_status_date (client_id, status, booking_date)
);

-- Consultation availability (for dynamic slot management)
CREATE TABLE IF NOT EXISTS consultation_availability (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_date DATE NOT NULL,
    time_slot TIME NOT NULL,
    is_booked BOOLEAN DEFAULT FALSE,
    booked_by BINARY(16) NULL,
    booking_id BINARY(16) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (booked_by) REFERENCES clients(id) ON DELETE SET NULL,
    FOREIGN KEY (booking_id) REFERENCES consultation_bookings(id) ON DELETE SET NULL,
    UNIQUE KEY unique_date_time (booking_date, time_slot),
    INDEX idx_date (booking_date),
    INDEX idx_booked (is_booked)
);

-- Business hours configuration
CREATE TABLE IF NOT EXISTS business_hours (
    id INT AUTO_INCREMENT PRIMARY KEY,
    day_of_week INT NOT NULL, -- 0=Sunday, 1=Monday, ..., 6=Saturday
    is_open BOOLEAN DEFAULT TRUE,
    start_time TIME,
    end_time TIME,
    slot_interval_minutes INT DEFAULT 60,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_day (day_of_week)
);

-- Holidays table
CREATE TABLE IF NOT EXISTS holidays (
    id INT AUTO_INCREMENT PRIMARY KEY,
    holiday_date DATE NOT NULL,
    name VARCHAR(100),
    is_closed BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_holiday_date (holiday_date),
    INDEX idx_date (holiday_date)
);

-- =====================================================
-- INSERT DEFAULT DATA
-- =====================================================

-- Insert consultation types
INSERT INTO consultation_types (id, icon, title, subtitle, duration_minutes, price, price_display, badge_text, badge_color, description, coach_description, img_url, includes, display_order) VALUES
('starter', '🚀', 'Starter Consultation', 'New to GymVault', 45, 0, 'Free', 'Complimentary', 'green', 
 'Your perfect entry point. Our coaches assess your current fitness level, understand your goals and build a personalised roadmap for your first 90 days at GymVault.',
 'Any certified GymVault coach',
 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80&fit=crop',
 JSON_ARRAY('Full fitness baseline assessment', 'Goal-setting & roadmap planning', 'Gym orientation & equipment walkthrough', 'Membership plan recommendation', 'Free first-week programme'),
 1),

('nutrition', '🥗', 'Nutritional Consultation', 'Fuel Your Performance', 60, 45, '$45', 'Most Popular', 'orange',
 'A deep-dive into your diet, metabolism and eating habits with a certified Precision Nutrition coach. Walk away with a fully personalised meal plan and supplement strategy.',
 'Precision Nutrition Level 2 coach',
 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&q=80&fit=crop',
 JSON_ARRAY('Body composition analysis', 'Macro & calorie target setting', 'Personalised meal plan (7-day)', 'Supplement protocol', 'Ongoing tracking setup (app)', 'Follow-up check-in included'),
 2),

('general', '💬', 'General Consultation', 'Talk to an Expert', 30, 0, 'Free', 'Open to All', 'blue',
 'Have a question about training, recovery, memberships or programmes? Book a no-pressure chat with one of our senior coaches — available in-person or via video call.',
 'Senior GymVault coach',
 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=600&q=80&fit=crop',
 JSON_ARRAY('Open Q&A with a senior coach', 'Programme review & advice', 'Injury or recovery guidance', 'Membership & upgrade support', 'In-person or video call option'),
 3);

-- Insert business hours (Monday=1 to Saturday=6, Sunday=0 closed)
INSERT INTO business_hours (day_of_week, is_open, start_time, end_time, slot_interval_minutes) VALUES
(1, TRUE, '06:00:00', '20:00:00', 60),
(2, TRUE, '06:00:00', '20:00:00', 60),
(3, TRUE, '06:00:00', '20:00:00', 60),
(4, TRUE, '06:00:00', '20:00:00', 60),
(5, TRUE, '06:00:00', '20:00:00', 60),
(6, TRUE, '07:00:00', '17:00:00', 60),
(0, FALSE, NULL, NULL, 60);

-- Insert holidays for 2026
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

-- Insert some pre-booked slots for demonstration
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

-- Verify tables
SELECT '=== Consultation Tables Created ===' as '';
SHOW TABLES LIKE 'consultation%';
SELECT COUNT(*) as total_types FROM consultation_types;
SELECT COUNT(*) as total_bookings FROM consultation_bookings;


-- =====================================================
-- SHOP TABLES
-- =====================================================

-- Categories table
CREATE TABLE IF NOT EXISTS shop_categories (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    icon VARCHAR(10),
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_active (is_active),
    INDEX idx_order (display_order)
);

-- Products table
CREATE TABLE IF NOT EXISTS shop_products (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    category_id VARCHAR(50) NOT NULL,
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
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES shop_categories(id),
    INDEX idx_category (category_id),
    INDEX idx_active (is_active),
    INDEX idx_featured (featured),
    INDEX idx_price (price),
    INDEX idx_name (name)
);

-- Cart items table
CREATE TABLE IF NOT EXISTS shop_cart_items (
    id BINARY(16) PRIMARY KEY DEFAULT (UUID_TO_BIN(UUID())),
    client_id BINARY(16) NOT NULL,
    product_id VARCHAR(50) NOT NULL,
    quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES shop_products(id) ON DELETE CASCADE,
    UNIQUE KEY unique_client_product (client_id, product_id),
    INDEX idx_client (client_id)
);

-- Wishlist items table
CREATE TABLE IF NOT EXISTS shop_wishlist_items (
    id BINARY(16) PRIMARY KEY DEFAULT (UUID_TO_BIN(UUID())),
    client_id BINARY(16) NOT NULL,
    product_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES shop_products(id) ON DELETE CASCADE,
    UNIQUE KEY unique_client_product (client_id, product_id),
    INDEX idx_client (client_id)
);

-- Orders table
CREATE TABLE IF NOT EXISTS shop_orders (
    id BINARY(16) PRIMARY KEY DEFAULT (UUID_TO_BIN(UUID())),
    order_reference VARCHAR(50) UNIQUE NOT NULL,
    client_id BINARY(16) NOT NULL,
    order_status VARCHAR(50) DEFAULT 'pending', -- pending, processing, shipped, delivered, cancelled
    payment_status VARCHAR(50) DEFAULT 'pending', -- pending, paid, failed, refunded
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
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    INDEX idx_client (client_id),
    INDEX idx_reference (order_reference),
    INDEX idx_status (order_status),
    INDEX idx_date (placed_at)
);

-- Order items table
CREATE TABLE IF NOT EXISTS shop_order_items (
    id BINARY(16) PRIMARY KEY DEFAULT (UUID_TO_BIN(UUID())),
    order_id BINARY(16) NOT NULL,
    product_id VARCHAR(50) NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    product_price DECIMAL(10,2) NOT NULL,
    quantity INT NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES shop_orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES shop_products(id) ON DELETE RESTRICT,
    INDEX idx_order (order_id)
);

-- =====================================================
-- INSERT SAMPLE DATA
-- =====================================================

-- Insert categories
INSERT INTO shop_categories (id, name, display_name, icon, display_order) VALUES
('merch', 'merch', 'Merch', '👕', 1),
('essentials', 'essentials', 'Gym Essentials', '🏋️', 2),
('supplements', 'supplements', 'Supplements', '💊', 3);

-- Insert products
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

-- Verify data
SELECT '=== Shop Tables Created ===' as '';
SHOW TABLES LIKE 'shop_%';
SELECT COUNT(*) as total_categories FROM shop_categories;
SELECT COUNT(*) as total_products FROM shop_products;

USE Accounts;

-- =====================================================
-- TRAINER ASSESSMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS trainer_assessments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    trainer_id BINARY(16) NOT NULL,
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (trainer_id) REFERENCES trainers(id) ON DELETE CASCADE,
    INDEX idx_trainer (trainer_id),
    INDEX idx_date (assessment_date)
);

-- =====================================================
-- CLIENT STATUS TABLE (to track Active/Inactive/New status)
-- =====================================================
CREATE TABLE IF NOT EXISTS client_status (
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_id BINARY(16) NOT NULL UNIQUE,
    status VARCHAR(20) DEFAULT 'Active',
    last_visit DATE,
    membership_plan VARCHAR(50) DEFAULT 'Standard',
    assigned_trainer_id BINARY(16),
    fitness_goal VARCHAR(100),
    progress_percentage INT DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_trainer_id) REFERENCES trainers(id) ON DELETE SET NULL,
    INDEX idx_status (status),
    INDEX idx_trainer (assigned_trainer_id)
);

-- =====================================================
-- SHOP ORDERS STATUS TABLE (for admin order tracking)
-- =====================================================
ALTER TABLE shop_orders ADD COLUMN pickup_notes TEXT;
ALTER TABLE shop_orders ADD COLUMN ready_for_pickup BOOLEAN DEFAULT FALSE;

-- Insert sample client statuses for existing clients
INSERT INTO client_status (client_id, status, last_visit, membership_plan, fitness_goal, progress_percentage)
SELECT id, 
       CASE WHEN RAND() > 0.7 THEN 'Active' WHEN RAND() > 0.4 THEN 'New' ELSE 'Inactive' END as status,
       DATE_SUB(CURDATE(), INTERVAL FLOOR(RAND() * 30) DAY) as last_visit,
       CASE WHEN RAND() > 0.5 THEN 'Premium' WHEN RAND() > 0.3 THEN 'Standard' ELSE 'Basic' END as plan,
       CASE WHEN RAND() > 0.7 THEN 'Weight Loss' WHEN RAND() > 0.4 THEN 'Muscle Gain' ELSE 'Endurance' END as goal,
       FLOOR(RAND() * 100) as progress
FROM clients
ON DUPLICATE KEY UPDATE
    status = VALUES(status),
    last_visit = VALUES(last_visit),
    membership_plan = VALUES(membership_plan),
    fitness_goal = VALUES(fitness_goal),
    progress_percentage = VALUES(progress_percentage);

SELECT * FROM clients;
-- Update sample birthdays for testing
UPDATE clients SET birthday = CURDATE() WHERE name = 'Jonathan Bennett';
UPDATE clients SET birthday = DATE_ADD(CURDATE(), INTERVAL 5 DAY) WHERE name = 'Jonathan Bennett';
UPDATE clients SET birthday = DATE_ADD(CURDATE(), INTERVAL 12 DAY) WHERE name = 'Merry Smith';