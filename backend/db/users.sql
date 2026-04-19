CREATE DATABASE Accounts;
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
<<<<<<< Updated upstream
    gender VARCHAR(10) NOT NULL,
=======
    gender VARCHAR(10),
>>>>>>> Stashed changes
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

<<<<<<< Updated upstream
-- Use the existing Accounts database
USE Accounts;
=======
>>>>>>> Stashed changes

-- =====================================================
-- TABLES FOR CLIENT DATA (extends existing schema)
-- =====================================================

-- Client measurements table (monthly tracking)
CREATE TABLE client_measurements (
<<<<<<< Updated upstream
    id INT AUTO_INCREMENT PRIMARY KEY,
=======
    id BINARY(16) PRIMARY KEY DEFAULT (UUID_TO_BIN(UUID())),
>>>>>>> Stashed changes
    client_id binary(16) NOT NULL,
    measurement_date DATE NOT NULL,
    month_name VARCHAR(3) NOT NULL,
    weight_kg DECIMAL(5,1),
    height_cm DECIMAL(5,1),
    body_fat_percentage DECIMAL(4,1),
    chest_cm DECIMAL(5,1),
    waist_cm DECIMAL(5,1),
    hips_cm DECIMAL(5,1),
    shoulders_cm DECIMAL(5,1),
    arm_left_cm DECIMAL(5,1),
    arm_right_cm DECIMAL(5,1),
    neck_cm DECIMAL(5,1),
    thigh_left_cm DECIMAL(5,1),
    thigh_right_cm DECIMAL(5,1),
    calf_left_cm DECIMAL(5,1),
    calf_right_cm DECIMAL(5,1),
    glutes_cm DECIMAL(5,1),
    created_at DATETIME DEFAULT NOW(),
    updated_at DATETIME DEFAULT NOW(),
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    INDEX idx_client_date (client_id, measurement_date),
    INDEX idx_month (month_name)
);

<<<<<<< Updated upstream
=======

-- =====================================================
-- BODY MEASUREMENTS TABLE (Detailed tracking)
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

>>>>>>> Stashed changes
-- Client goals table
CREATE TABLE client_goals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_id binary(16) NOT NULL,
    goal_type VARCHAR(50) NOT NULL,
    primary_goal VARCHAR(100),
    target_weight_kg DECIMAL(5,1),
    target_chest_cm DECIMAL(5,1),
    target_waist_cm DECIMAL(5,1),
    target_hips_cm DECIMAL(5,1),
    target_thigh_cm DECIMAL(5,1),
    target_arm_cm DECIMAL(5,1),
    created_at DATETIME DEFAULT NOW(),
    updated_at DATETIME DEFAULT NOW(),
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    INDEX idx_client_goals (client_id)
);

-- Client health conditions table
CREATE TABLE client_health_conditions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_id binary(16) NOT NULL,
    condition_name VARCHAR(50) NOT NULL,
    created_at DATETIME DEFAULT NOW(),
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    UNIQUE KEY unique_client_condition (client_id, condition_name),
    INDEX idx_client_health (client_id)
);

-- Client water intake tracking
CREATE TABLE client_water_intake (
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_id binary(16) NOT NULL,
    intake_date DATE NOT NULL,
    cups_consumed INT DEFAULT 0 CHECK (cups_consumed BETWEEN 0 AND 20),
    created_at DATETIME DEFAULT NOW(),
    updated_at DATETIME DEFAULT NOW(),
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    UNIQUE KEY unique_client_date (client_id, intake_date),
    INDEX idx_date (intake_date)
);

-- Client workout sessions
CREATE TABLE client_workout_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_id binary(16) NOT NULL,
    session_date DATE NOT NULL,
    session_type VARCHAR(50),
    duration_minutes INT,
    calories_burned INT,
    avg_heart_rate INT,
    notes TEXT,
    created_at DATETIME DEFAULT NOW(),
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    INDEX idx_client_session_date (client_id, session_date)
);

-- Client strength records (PRs and progress)
CREATE TABLE client_strength_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_id binary(16) NOT NULL,
    exercise_name VARCHAR(50) NOT NULL,
    current_weight_kg DECIMAL(5,1),
    goal_weight_kg DECIMAL(5,1),
    current_reps INT,
    goal_reps INT,
    percentage_progress INT,
    record_date DATE,
    created_at DATETIME DEFAULT NOW(),
    updated_at DATETIME DEFAULT NOW(),
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    INDEX idx_client_strength (client_id)
);

-- Trainer ratings by clients
CREATE TABLE trainer_ratings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_id binary(16) NOT NULL,
    trainer_name VARCHAR(100) NOT NULL,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    created_at DATETIME DEFAULT NOW(),
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    UNIQUE KEY unique_client_trainer (client_id, trainer_name),
    INDEX idx_trainer_name (trainer_name)
);

-- Client badges/achievements (store name only as requested)
CREATE TABLE client_badges (
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_id binary(16) NOT NULL,
    badge_name VARCHAR(100) NOT NULL,
    awarded_date DATE NOT NULL,
    created_at DATETIME DEFAULT NOW(),
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    INDEX idx_client_badges (client_id)
);

-- Training schedule template
CREATE TABLE training_schedule (
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_id binary(16) NOT NULL,
    day_of_week VARCHAR(10),
    day_number INT,
    session_name VARCHAR(100),
    session_time TIME,
    has_session BOOLEAN DEFAULT FALSE,
    is_today BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT NOW(),
    updated_at DATETIME DEFAULT NOW(),
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    INDEX idx_client_schedule (client_id)
);

-- Workout recommendations (based on target areas)
CREATE TABLE workout_recommendations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    target_area VARCHAR(50) NOT NULL,
    exercise_name VARCHAR(100) NOT NULL,
    icon VARCHAR(10),
    detail VARCHAR(255),
    sets_info JSON,
    created_at DATETIME DEFAULT NOW()
);


-- =====================================================
-- INSERTIONS FOR EXISTING CLIENTS
-- Based on clients already in the database:
-- - Joe Hanson (johandson@outlook.com)
-- - Peter Lincoln (plincoln@gmail.com)
-- - Merry Smith (smirth@icloud.com)
-- =====================================================

-- Get client IDs
SET @Client1ID = (SELECT id FROM Accounts WHERE email = 'johandson@outlook.com');
SET @Client2ID = (SELECT id FROM Accounts WHERE email = 'plincoln@gmail.com');
SET @Client3ID = (SELECT id FROM Accounts WHERE email = 'smirth@icloud.com');
-- =====================================================
-- CLIENT GOALS
-- =====================================================
INSERT INTO client_goals (client_id, goal_type, primary_goal, target_weight_kg, target_chest_cm, target_waist_cm, target_hips_cm, target_thigh_cm, target_arm_cm) VALUES
(@Client1ID, 'Cut Down', 'Lose Fat and Cut', 75, 105, 78, 95, 55, 36),
(@Client2ID, 'Bulk Up', 'Build Muscle and Size', 85, 110, 82, 100, 60, 40),
(@Client3ID, 'Tone and Define', 'Tone and Define', 70, 95, 75, 92, 52, 34);

-- =====================================================
-- CLIENT HEALTH CONDITIONS
-- =====================================================
INSERT INTO client_health_conditions (client_id, condition_name) VALUES
(@Client1ID, 'Back Pain'),
(@Client1ID, 'Knee Injury'),
(@Client2ID, 'Hypertension'),
(@Client3ID, 'Asthma');

-- =====================================================
-- CLIENT MEASUREMENTS (History - last 6 months)
-- =====================================================
-- Joe Hanson measurements
INSERT INTO client_measurements (client_id, measurement_date, month_name, weight_kg, chest_cm, waist_cm, hips_cm, thigh_left_cm, arm_left_cm) VALUES
(@Client1ID, '2025-10-01', 'Oct', 89, 102, 90, 102, 60, 38),
(@Client1ID, '2025-11-01', 'Nov', 88, 101, 89, 101, 59, 38),
(@Client1ID, '2025-12-01', 'Dec', 87, 100, 88, 100, 59, 37),
(@Client1ID, '2026-01-01', 'Jan', 86, 99, 87, 99, 58, 37),
(@Client1ID, '2026-02-01', 'Feb', 85, 98, 86, 98, 58, 37),
(@Client1ID, '2026-03-01', 'Mar', 84, 97, 85, 97, 57, 36);

-- Peter Lincoln measurements
INSERT INTO client_measurements (client_id, measurement_date, month_name, weight_kg, chest_cm, waist_cm, hips_cm, thigh_left_cm, arm_left_cm) VALUES
(@Client2ID, '2025-10-01', 'Oct', 84, 98, 86, 98, 58, 38),
(@Client2ID, '2025-11-01', 'Nov', 83, 98, 85, 98, 58, 38),
(@Client2ID, '2025-12-01', 'Dec', 83, 99, 85, 99, 59, 39),
(@Client2ID, '2026-01-01', 'Jan', 82, 99, 84, 99, 59, 39),
(@Client2ID, '2026-02-01', 'Feb', 82, 100, 84, 100, 60, 40),
(@Client2ID, '2026-03-01', 'Mar', 81, 100, 83, 100, 60, 40);

-- Merry Smith measurements
INSERT INTO client_measurements (client_id, measurement_date, month_name, weight_kg, chest_cm, waist_cm, hips_cm, thigh_left_cm, arm_left_cm) VALUES
(@Client3ID, '2025-10-01', 'Oct', 95, 110, 95, 110, 65, 40),
(@Client3ID, '2025-11-01', 'Nov', 94, 109, 94, 109, 64, 40),
(@Client3ID, '2025-12-01', 'Dec', 93, 108, 93, 108, 64, 39),
(@Client3ID, '2026-01-01', 'Jan', 92, 107, 92, 107, 63, 39),
(@Client3ID, '2026-02-01', 'Feb', 91, 106, 91, 106, 63, 38),
(@Client3ID, '2026-03-01', 'Mar', 90, 105, 90, 105, 62, 38);

-- =====================================================
-- CURRENT MEASUREMENTS (March 2026 with full details)
-- =====================================================
INSERT INTO client_measurements (client_id, measurement_date, month_name, weight_kg, height_cm, body_fat_percentage, chest_cm, waist_cm, shoulders_cm, arm_left_cm, arm_right_cm, neck_cm, hips_cm, thigh_left_cm, thigh_right_cm, calf_left_cm, calf_right_cm, glutes_cm) VALUES
(@Client1ID, '2026-03-15', 'Mar', 84, 158, 22, 97, 85, 110, 36, 36, 40, 97, 57, 57, 38, 38, 102),
(@Client2ID, '2026-03-15', 'Mar', 81, 193, 15, 100, 83, 125, 40, 40, 42, 100, 60, 60, 42, 42, 105),
(@Client3ID, '2026-03-15', 'Mar', 90, 258, 28, 105, 90, 115, 38, 38, 38, 105, 62, 62, 40, 40, 108);

-- =====================================================
-- WATER INTAKE (Last 7 days)
-- =====================================================
INSERT INTO client_water_intake (client_id, intake_date, cups_consumed) VALUES
(@Client1ID, DATE_SUB(CURDATE(), INTERVAL 6 DAY), 6),
(@Client1ID, DATE_SUB(CURDATE(), INTERVAL 5 DAY), 7),
(@Client1ID, DATE_SUB(CURDATE(), INTERVAL 4 DAY), 5),
(@Client1ID, DATE_SUB(CURDATE(), INTERVAL 3 DAY), 8),
(@Client1ID, DATE_SUB(CURDATE(), INTERVAL 2 DAY), 6),
(@Client1ID, DATE_SUB(CURDATE(), INTERVAL 1 DAY), 7),
(@Client1ID, CURDATE(), 4),

(@Client2ID, DATE_SUB(CURDATE(), INTERVAL 6 DAY), 8),
(@Client2ID, DATE_SUB(CURDATE(), INTERVAL 5 DAY), 7),
(@Client2ID, DATE_SUB(CURDATE(), INTERVAL 4 DAY), 8),
(@Client2ID, DATE_SUB(CURDATE(), INTERVAL 3 DAY), 6),
(@Client2ID, DATE_SUB(CURDATE(), INTERVAL 2 DAY), 7),
(@Client2ID, DATE_SUB(CURDATE(), INTERVAL 1 DAY), 8),
(@Client2ID, CURDATE(), 6),

(@Client3ID, DATE_SUB(CURDATE(), INTERVAL 6 DAY), 5),
(@Client3ID, DATE_SUB(CURDATE(), INTERVAL 5 DAY), 6),
(@Client3ID, DATE_SUB(CURDATE(), INTERVAL 4 DAY), 5),
(@Client3ID, DATE_SUB(CURDATE(), INTERVAL 3 DAY), 7),
(@Client3ID, DATE_SUB(CURDATE(), INTERVAL 2 DAY), 6),
(@Client3ID, DATE_SUB(CURDATE(), INTERVAL 1 DAY), 5),
(@Client3ID, CURDATE(), 3);

-- =====================================================
-- STRENGTH RECORDS
-- =====================================================
INSERT INTO client_strength_records (client_id, exercise_name, current_weight_kg, goal_weight_kg, current_reps, goal_reps, percentage_progress, record_date) VALUES
-- Joe Hanson
(@Client1ID, 'Bench Press', 85, 100, 8, 10, 85, '2026-03-01'),
(@Client1ID, 'Squat', 110, 130, 8, 10, 85, '2026-03-01'),
(@Client1ID, 'Deadlift', 130, 150, 5, 6, 87, '2026-03-01'),
(@Client1ID, 'Overhead Press', 50, 65, 8, 10, 77, '2026-03-01'),
(@Client1ID, 'Pull-ups', 12, 20, 10, 15, 60, '2026-03-01'),

-- Peter Lincoln
(@Client2ID, 'Bench Press', 110, 130, 8, 10, 85, '2026-03-01'),
(@Client2ID, 'Squat', 140, 160, 8, 10, 88, '2026-03-01'),
(@Client2ID, 'Deadlift', 170, 190, 5, 6, 89, '2026-03-01'),
(@Client2ID, 'Overhead Press', 70, 85, 8, 10, 82, '2026-03-01'),
(@Client2ID, 'Pull-ups', 20, 30, 10, 15, 67, '2026-03-01'),

-- Merry Smith
(@Client3ID, 'Bench Press', 60, 75, 8, 10, 80, '2026-03-01'),
(@Client3ID, 'Squat', 80, 100, 8, 10, 80, '2026-03-01'),
(@Client3ID, 'Deadlift', 90, 110, 5, 6, 82, '2026-03-01'),
(@Client3ID, 'Overhead Press', 35, 45, 8, 10, 78, '2026-03-01'),
(@Client3ID, 'Pull-ups', 5, 10, 10, 15, 50, '2026-03-01');

-- =====================================================
-- TRAINER RATINGS
-- =====================================================
INSERT INTO trainer_ratings (client_id, trainer_name, rating) VALUES
-- Joe Hanson
(@Client1ID, 'Sherice Myers', 4),
(@Client1ID, 'Ashton Hall', 5),

-- Peter Lincoln
(@Client2ID, 'Sherice Myers', 5),
(@Client2ID, 'Ashton Hall', 5),

-- Merry Smith
(@Client3ID, 'Sherice Myers', 3),
(@Client3ID, 'Ashton Hall', 4);

-- =====================================================
-- BADGES EARNED
-- =====================================================
INSERT INTO client_badges (client_id, badge_name, awarded_date) VALUES
-- Joe Hanson
(@Client1ID, '100 Workouts', '2026-02-15'),
(@Client1ID, '8-Week Streak', '2026-03-01'),
(@Client1ID, 'Weight Loss Milestone', '2026-01-10'),

-- Peter Lincoln
(@Client2ID, '200 Workouts', '2026-02-20'),
(@Client2ID, '12-Week Streak', '2026-03-01'),
(@Client2ID, 'Elite Member', '2026-01-15'),
(@Client2ID, 'Strength Champion', '2026-02-10'),

-- Merry Smith
(@Client3ID, '50 Workouts', '2026-02-01'),
(@Client3ID, '4-Week Streak', '2026-02-15'),
(@Client3ID, 'Consistency Award', '2026-01-20');

-- =====================================================
-- WORKOUT SESSIONS (Last 30 days)
-- =====================================================
INSERT INTO client_workout_sessions (client_id, session_date, session_type, duration_minutes, calories_burned, avg_heart_rate, notes) VALUES
-- Joe Hanson
(@Client1ID, DATE_SUB(CURDATE(), INTERVAL 28 DAY), 'Upper Body', 60, 450, 135, 'Chest and arms focus'),
(@Client1ID, DATE_SUB(CURDATE(), INTERVAL 25 DAY), 'Lower Body', 55, 400, 140, 'Leg day'),
(@Client1ID, DATE_SUB(CURDATE(), INTERVAL 21 DAY), 'Full Body', 75, 600, 145, 'Heavy compound lifts'),
(@Client1ID, DATE_SUB(CURDATE(), INTERVAL 18 DAY), 'Cardio', 45, 350, 155, 'HIIT session'),
(@Client1ID, DATE_SUB(CURDATE(), INTERVAL 14 DAY), 'Upper Body', 60, 460, 138, 'Push day'),
(@Client1ID, DATE_SUB(CURDATE(), INTERVAL 10 DAY), 'Lower Body', 60, 420, 142, 'Squat focus'),
(@Client1ID, DATE_SUB(CURDATE(), INTERVAL 7 DAY), 'Full Body', 70, 580, 148, 'Strength training'),
(@Client1ID, CURDATE(), 'Upper Body Hypertrophy', 65, 500, 140, 'Bench press, rows, OHP'),

-- Peter Lincoln
(@Client2ID, DATE_SUB(CURDATE(), INTERVAL 29 DAY), 'Upper Body', 70, 550, 148, 'Heavy bench press'),
(@Client2ID, DATE_SUB(CURDATE(), INTERVAL 26 DAY), 'Lower Body', 65, 500, 150, 'Squat and deadlift'),
(@Client2ID, DATE_SUB(CURDATE(), INTERVAL 22 DAY), 'Full Body', 80, 680, 152, 'Power focus'),
(@Client2ID, DATE_SUB(CURDATE(), INTERVAL 19 DAY), 'Cardio', 50, 420, 160, 'Sprint intervals'),
(@Client2ID, DATE_SUB(CURDATE(), INTERVAL 15 DAY), 'Upper Body', 70, 540, 146, 'Push and pull'),
(@Client2ID, DATE_SUB(CURDATE(), INTERVAL 11 DAY), 'Lower Body', 65, 510, 151, 'Leg press focus'),
(@Client2ID, DATE_SUB(CURDATE(), INTERVAL 8 DAY), 'Full Body', 75, 620, 149, 'Strength endurance'),
(@Client2ID, CURDATE(), 'Upper Body Power', 70, 560, 145, 'Bench, rows, accessories'),

-- Merry Smith
(@Client3ID, DATE_SUB(CURDATE(), INTERVAL 27 DAY), 'Upper Body', 50, 380, 130, 'Light weights focus'),
(@Client3ID, DATE_SUB(CURDATE(), INTERVAL 24 DAY), 'Lower Body', 50, 370, 135, 'Bodyweight exercises'),
(@Client3ID, DATE_SUB(CURDATE(), INTERVAL 20 DAY), 'Full Body', 60, 450, 138, 'Circuit training'),
(@Client3ID, DATE_SUB(CURDATE(), INTERVAL 17 DAY), 'Cardio', 40, 300, 145, 'Walking and jogging'),
(@Client3ID, DATE_SUB(CURDATE(), INTERVAL 13 DAY), 'Upper Body', 50, 390, 132, 'Push day light'),
(@Client3ID, DATE_SUB(CURDATE(), INTERVAL 9 DAY), 'Lower Body', 45, 350, 136, 'Glute focus'),
(@Client3ID, DATE_SUB(CURDATE(), INTERVAL 6 DAY), 'Cardio', 35, 280, 142, 'Recovery cardio'),
(@Client3ID, CURDATE(), 'Full Body Circuit', 55, 420, 140, 'Light weights, high reps');

-- =====================================================
-- TRAINING SCHEDULE (Current week)
-- =====================================================
INSERT INTO training_schedule (client_id, day_of_week, day_number, session_name, session_time, has_session, is_today) VALUES
-- Joe Hanson
(@Client1ID, 'Monday', 25, 'Upper Body Strength', '17:30:00', TRUE, FALSE),
(@Client1ID, 'Tuesday', 26, NULL, NULL, FALSE, FALSE),
(@Client1ID, 'Wednesday', 27, 'Lower Body Power', '17:30:00', TRUE, FALSE),
(@Client1ID, 'Thursday', 28, 'Back and Biceps', '17:30:00', TRUE, FALSE),
(@Client1ID, 'Friday', 1, NULL, NULL, FALSE, FALSE),
(@Client1ID, 'Saturday', 2, 'Cardio and Core', '09:00:00', TRUE, FALSE),
(@Client1ID, 'Sunday', 3, NULL, NULL, FALSE, FALSE),
(@Client1ID, 'Monday', 4, 'Upper Body Hypertrophy', '17:30:00', TRUE, FALSE),

-- Peter Lincoln
(@Client2ID, 'Monday', 25, 'Chest and Triceps', '18:00:00', TRUE, FALSE),
(@Client2ID, 'Tuesday', 26, 'Back and Biceps', '18:00:00', TRUE, FALSE),
(@Client2ID, 'Wednesday', 27, 'Leg Day', '18:00:00', TRUE, FALSE),
(@Client2ID, 'Thursday', 28, 'Shoulders and Abs', '18:00:00', TRUE, FALSE),
(@Client2ID, 'Friday', 1, 'Full Body', '18:00:00', TRUE, FALSE),
(@Client2ID, 'Saturday', 2, 'Active Recovery', '10:00:00', TRUE, FALSE),
(@Client2ID, 'Sunday', 3, 'Rest Day', NULL, FALSE, FALSE),
(@Client2ID, 'Monday', 4, 'Upper Body Power', '18:00:00', TRUE, FALSE),

-- Merry Smith
(@Client3ID, 'Monday', 25, 'Full Body Light', '09:00:00', TRUE, FALSE),
(@Client3ID, 'Tuesday', 26, NULL, NULL, FALSE, FALSE),
(@Client3ID, 'Wednesday', 27, 'Lower Body Focus', '09:00:00', TRUE, FALSE),
(@Client3ID, 'Thursday', 28, NULL, NULL, FALSE, FALSE),
(@Client3ID, 'Friday', 1, 'Upper Body Focus', '09:00:00', TRUE, FALSE),
(@Client3ID, 'Saturday', 2, 'Cardio', '08:00:00', TRUE, FALSE),
(@Client3ID, 'Sunday', 3, NULL, NULL, FALSE, FALSE),
(@Client3ID, 'Monday', 4, 'Full Body Circuit', '09:00:00', TRUE, FALSE);

SELECT * from accounts;
-- =====================================================
-- UPDATE TODAY'S SESSION FLAG (Based on current day)
-- =====================================================
-- Note: Run this on the actual day to mark today's session
UPDATE training_schedule SET is_today = TRUE 
WHERE client_id = @Client1ID AND day_of_week = DAYNAME(CURDATE());

UPDATE training_schedule SET is_today = TRUE 
WHERE client_id = @Client2ID AND day_of_week = DAYNAME(CURDATE());

UPDATE training_schedule SET is_today = TRUE 
WHERE client_id = @Client3ID AND day_of_week = DAYNAME(CURDATE());
-- Add progress_tracking table for backward compatibility
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
    INDEX idx_recorded_at (recorded_at)
);
SELECT * FROM progress_tracking;
SHOW TABLES;

<<<<<<< Updated upstream
USE Accounts;

-- =====================================================
-- 1. PROGRESS TRACKING TABLE (for JSON measurements storage)
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
-- 2. CLIENT GOALS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS client_goals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_id BINARY(16) NOT NULL,
    goal_type VARCHAR(50) DEFAULT 'Bulk Up',
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
-- 3. CLIENT MEASUREMENTS TABLE (Monthly tracking)
-- =====================================================
CREATE TABLE IF NOT EXISTS client_measurements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_id BINARY(16) NOT NULL,
    measurement_date DATE NOT NULL,
    month_name VARCHAR(3) NOT NULL,
    weight_kg DECIMAL(5,1),
    height_cm DECIMAL(5,1),
    body_fat_percentage DECIMAL(4,1),
    chest_cm DECIMAL(5,1),
    waist_cm DECIMAL(5,1),
    hips_cm DECIMAL(5,1),
    shoulders_cm DECIMAL(5,1),
    arm_left_cm DECIMAL(5,1),
    arm_right_cm DECIMAL(5,1),
    neck_cm DECIMAL(5,1),
    thigh_left_cm DECIMAL(5,1),
    thigh_right_cm DECIMAL(5,1),
    calf_left_cm DECIMAL(5,1),
    calf_right_cm DECIMAL(5,1),
    glutes_cm DECIMAL(5,1),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    INDEX idx_client_date (client_id, measurement_date),
    INDEX idx_month (month_name)
);

-- =====================================================
-- 4. CLIENT HEALTH CONDITIONS TABLE
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
-- 5. CLIENT WATER INTAKE TABLE
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
-- 6. CLIENT WORKOUT SESSIONS TABLE
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
-- 7. CLIENT STRENGTH RECORDS TABLE
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
-- 8. TRAINER RATINGS TABLE
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
-- 9. CLIENT BADGES TABLE
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
-- 10. TRAINING SCHEDULE TABLE
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
-- 11. WORKOUT RECOMMENDATIONS TABLE (Static data)
-- =====================================================
CREATE TABLE IF NOT EXISTS workout_recommendations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    target_area VARCHAR(50) NOT NULL,
    exercise_name VARCHAR(100) NOT NULL,
    icon VARCHAR(10),
    detail VARCHAR(255),
    sets_info JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_target_area (target_area)
);

-- =====================================================
-- 12. BODY MEASUREMENTS TABLE (Detailed tracking)
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
=======



>>>>>>> Stashed changes

-- =====================================================
-- INSERT DEFAULT WORKOUT RECOMMENDATIONS
-- =====================================================
INSERT INTO workout_recommendations (target_area, exercise_name, icon, detail, sets_info) VALUES
-- Chest
('chest', 'Flat Bench Press', '🏋️', 'Compound · Chest focus', '["4×8", "80% 1RM", "Rest 90s"]'),
('chest', 'Incline DB Press', '📐', 'Upper chest activation', '["3×10", "70% effort", "Rest 75s"]'),
('chest', 'Cable Flys', '🔄', 'Isolation · Stretch', '["3×15", "Light-Med", "Rest 60s"]'),

-- Back
('back', 'Weighted Pull-ups', '⬆️', 'Width builder · Lats', '["4×6", "BW+10kg", "Rest 2min"]'),
('back', 'Barbell Rows', '🚣', 'Thickness · Mid-back', '["4×8", "75% 1RM", "Rest 90s"]'),
('back', 'Lat Pulldown', '🔽', 'Lat sweep · Volume', '["3×12", "Moderate", "Rest 60s"]'),

-- Legs
('legs', 'Back Squat', '🏆', 'King of leg exercises', '["5×5", "80% 1RM", "Rest 2min"]'),
('legs', 'Romanian Deadlift', '🦵', 'Hamstrings & glutes', '["4×10", "65% 1RM", "Rest 90s"]'),
('legs', 'Leg Press', '📦', 'Volume & quad pump', '["3×15", "Moderate", "Rest 60s"]'),

-- Core
('core', 'Ab Wheel Rollout', '🌊', 'Full core tension', '["4×12", "Slow tempo", "Rest 60s"]'),
('core', 'Plank Variations', '🧱', 'Stability & endurance', '["3×60s", "Max tension", "Rest 45s"]'),
('core', 'Hanging Leg Raise', '🔄', 'Lower abs & hip flex', '["3×15", "Controlled", "Rest 60s"]'),

-- Full Body
('fullbody', 'Power Cleans', '⚡', 'Full-body power', '["5×3", "70% 1RM", "Rest 2min"]'),
('fullbody', 'Deadlift', '🏋️', 'Total posterior chain', '["4×5", "80% 1RM", "Rest 2min"]'),
('fullbody', 'Dumbbell Complex', '🤸', '6-move circuit', '["3 rounds", "No rest", "Rest 90s"]'),

-- Cardio
('cardio', 'Sprint Intervals', '💥', 'HIIT · Fat burn', '["8×30s", "Max effort", "Rest 90s"]'),
('cardio', 'Assault Bike HIIT', '🚴', 'Cardio conditioning', '["5×1min", "All-out", "Rest 2min"]'),
('cardio', 'Rowing Machine', '🏃', 'Low-impact endurance', '["20min", "Moderate", "Steady"]');

<<<<<<< Updated upstream
-- =====================================================
-- INSERT SAMPLE DATA FOR EXISTING CLIENTS
-- =====================================================

-- Get client IDs
SET @Client1ID = (SELECT id FROM Accounts WHERE email = 'johandson@outlook.com');
SET @Client2ID = (SELECT id FROM Accounts WHERE email = 'plincoln@gmail.com');
SET @Client3ID = (SELECT id FROM Accounts WHERE email = 'smirth@icloud.com');

-- Insert goals for existing clients
INSERT INTO client_goals (client_id, goal_type, target_weight_kg, target_chest_cm, target_waist_cm, target_hips_cm, target_thigh_cm, target_arm_cm) VALUES
(@Client1ID, 'Cut Down', 75, 105, 78, 95, 55, 36),
(@Client2ID, 'Bulk Up', 85, 110, 82, 100, 60, 40),
(@Client3ID, 'Tone and Define', 70, 95, 75, 92, 52, 34)
ON DUPLICATE KEY UPDATE
    goal_type = VALUES(goal_type),
    target_weight_kg = VALUES(target_weight_kg),
    target_chest_cm = VALUES(target_chest_cm),
    target_waist_cm = VALUES(target_waist_cm),
    target_hips_cm = VALUES(target_hips_cm),
    target_thigh_cm = VALUES(target_thigh_cm),
    target_arm_cm = VALUES(target_arm_cm);

-- Insert health conditions
INSERT INTO client_health_conditions (client_id, condition_name) VALUES
(@Client1ID, 'Back Pain'),
(@Client1ID, 'Knee Injury'),
(@Client2ID, 'Hypertension'),
(@Client3ID, 'Asthma')
ON DUPLICATE KEY UPDATE condition_name = VALUES(condition_name);

-- Insert trainer ratings
INSERT INTO trainer_ratings (client_id, trainer_name, rating) VALUES
(@Client1ID, 'Sherice Myers', 4),
(@Client1ID, 'Ashton Hall', 5),
(@Client2ID, 'Sherice Myers', 5),
(@Client2ID, 'Ashton Hall', 5),
(@Client3ID, 'Sherice Myers', 3),
(@Client3ID, 'Ashton Hall', 4)
ON DUPLICATE KEY UPDATE rating = VALUES(rating);

-- Insert badges
INSERT INTO client_badges (client_id, badge_name, awarded_date) VALUES
(@Client1ID, '100 Workouts', CURDATE()),
(@Client1ID, '8-Week Streak', CURDATE()),
(@Client2ID, '200 Workouts', CURDATE()),
(@Client2ID, '12-Week Streak', CURDATE()),
(@Client2ID, 'Elite Member', CURDATE()),
(@Client3ID, '50 Workouts', CURDATE()),
(@Client3ID, '4-Week Streak', CURDATE());

-- Insert sample water intake for today
INSERT INTO client_water_intake (client_id, intake_date, cups_consumed) VALUES
(@Client1ID, CURDATE(), 4),
(@Client2ID, CURDATE(), 6),
(@Client3ID, CURDATE(), 3)
ON DUPLICATE KEY UPDATE cups_consumed = VALUES(cups_consumed);

-- Insert sample workout session for today
INSERT INTO client_workout_sessions (client_id, session_date, session_type, duration_minutes, calories_burned, avg_heart_rate, notes) VALUES
(@Client1ID, CURDATE(), 'Upper Body Hypertrophy', 65, 500, 140, 'Bench press, rows, OHP'),
(@Client2ID, CURDATE(), 'Upper Body Power', 70, 560, 145, 'Bench, rows, accessories'),
(@Client3ID, CURDATE(), 'Full Body Circuit', 55, 420, 140, 'Light weights, high reps');
=======


>>>>>>> Stashed changes

-- =====================================================
-- VERIFY TABLES CREATED
-- =====================================================
SELECT '=== Tables Created ===' as '';
SHOW TABLES;

SELECT '=== Table Count ===' as '';
SELECT COUNT(*) as total_tables FROM information_schema.tables WHERE table_schema = 'Accounts';
SELECT * FROM body_measurements;
-- Verify specific tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'Accounts' 
AND table_name IN ('progress_tracking', 'client_goals', 'client_measurements', 'client_health_conditions', 
                   'client_water_intake', 'client_workout_sessions', 'client_strength_records', 
                   'trainer_ratings', 'client_badges', 'training_schedule', 'workout_recommendations', 
                   'body_measurements');
                   
USE Accounts;

-- Get client IDs
SET @Client1ID = (SELECT id FROM Accounts WHERE email = 'johandson@outlook.com');
SET @Client2ID = (SELECT id FROM Accounts WHERE email = 'plincoln@gmail.com');
SET @Client3ID = (SELECT id FROM Accounts WHERE email = 'smirth@icloud.com');

-- Insert sample progress data for Joe Hanson
INSERT INTO progress_tracking (id, user_id, weight, height, measurements, recorded_at) VALUES
(UUID_TO_BIN(UUID()), @Client1ID, 89, 158, '{"chest": 102, "waist": 90, "hips": 102, "thigh_left": 60, "arm_left": 38}', DATE_SUB(NOW(), INTERVAL 5 MONTH)),
(UUID_TO_BIN(UUID()), @Client1ID, 88, 158, '{"chest": 101, "waist": 89, "hips": 101, "thigh_left": 59, "arm_left": 38}', DATE_SUB(NOW(), INTERVAL 4 MONTH)),
(UUID_TO_BIN(UUID()), @Client1ID, 87, 158, '{"chest": 100, "waist": 88, "hips": 100, "thigh_left": 59, "arm_left": 37}', DATE_SUB(NOW(), INTERVAL 3 MONTH)),
(UUID_TO_BIN(UUID()), @Client1ID, 86, 158, '{"chest": 99, "waist": 87, "hips": 99, "thigh_left": 58, "arm_left": 37}', DATE_SUB(NOW(), INTERVAL 2 MONTH)),
(UUID_TO_BIN(UUID()), @Client1ID, 85, 158, '{"chest": 98, "waist": 86, "hips": 98, "thigh_left": 58, "arm_left": 37}', DATE_SUB(NOW(), INTERVAL 1 MONTH)),
(UUID_TO_BIN(UUID()), @Client1ID, 84, 158, '{"chest": 97, "waist": 85, "hips": 97, "thigh_left": 57, "arm_left": 36, "body_fat": 22, "shoulders": 110, "arm_right": 36, "neck": 40, "thigh_right": 57, "calf_left": 38, "calf_right": 38, "glutes": 102}', NOW());

-- Insert sample progress data for Peter Lincoln
INSERT INTO progress_tracking (id, user_id, weight, height, measurements, recorded_at) VALUES
(UUID_TO_BIN(UUID()), @Client2ID, 84, 193, '{"chest": 98, "waist": 86, "hips": 98, "thigh_left": 58, "arm_left": 38}', DATE_SUB(NOW(), INTERVAL 5 MONTH)),
(UUID_TO_BIN(UUID()), @Client2ID, 83, 193, '{"chest": 98, "waist": 85, "hips": 98, "thigh_left": 58, "arm_left": 38}', DATE_SUB(NOW(), INTERVAL 4 MONTH)),
(UUID_TO_BIN(UUID()), @Client2ID, 83, 193, '{"chest": 99, "waist": 85, "hips": 99, "thigh_left": 59, "arm_left": 39}', DATE_SUB(NOW(), INTERVAL 3 MONTH)),
(UUID_TO_BIN(UUID()), @Client2ID, 82, 193, '{"chest": 99, "waist": 84, "hips": 99, "thigh_left": 59, "arm_left": 39}', DATE_SUB(NOW(), INTERVAL 2 MONTH)),
(UUID_TO_BIN(UUID()), @Client2ID, 82, 193, '{"chest": 100, "waist": 84, "hips": 100, "thigh_left": 60, "arm_left": 40}', DATE_SUB(NOW(), INTERVAL 1 MONTH)),
(UUID_TO_BIN(UUID()), @Client2ID, 81, 193, '{"chest": 100, "waist": 83, "hips": 100, "thigh_left": 60, "arm_left": 40, "body_fat": 15, "shoulders": 125, "arm_right": 40, "neck": 42, "thigh_right": 60, "calf_left": 42, "calf_right": 42, "glutes": 105}', NOW());

-- Insert sample progress data for Merry Smith
INSERT INTO progress_tracking (id, user_id, weight, height, measurements, recorded_at) VALUES
(UUID_TO_BIN(UUID()), @Client3ID, 95, 258, '{"chest": 110, "waist": 95, "hips": 110, "thigh_left": 65, "arm_left": 40}', DATE_SUB(NOW(), INTERVAL 5 MONTH)),
(UUID_TO_BIN(UUID()), @Client3ID, 94, 258, '{"chest": 109, "waist": 94, "hips": 109, "thigh_left": 64, "arm_left": 40}', DATE_SUB(NOW(), INTERVAL 4 MONTH)),
(UUID_TO_BIN(UUID()), @Client3ID, 93, 258, '{"chest": 108, "waist": 93, "hips": 108, "thigh_left": 64, "arm_left": 39}', DATE_SUB(NOW(), INTERVAL 3 MONTH)),
(UUID_TO_BIN(UUID()), @Client3ID, 92, 258, '{"chest": 107, "waist": 92, "hips": 107, "thigh_left": 63, "arm_left": 39}', DATE_SUB(NOW(), INTERVAL 2 MONTH)),
(UUID_TO_BIN(UUID()), @Client3ID, 91, 258, '{"chest": 106, "waist": 91, "hips": 106, "thigh_left": 63, "arm_left": 38}', DATE_SUB(NOW(), INTERVAL 1 MONTH)),
(UUID_TO_BIN(UUID()), @Client3ID, 90, 258, '{"chest": 105, "waist": 90, "hips": 105, "thigh_left": 62, "arm_left": 38, "body_fat": 28, "shoulders": 115, "arm_right": 38, "neck": 38, "thigh_right": 62, "calf_left": 40, "calf_right": 40, "glutes": 108}', NOW());

SELECT 'Sample progress data added successfully!' as '';



-- Create password_reset_tokens table
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id binary(16) NOT NULL,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    used_at DATETIME NULL,
    FOREIGN KEY (user_id) REFERENCES Accounts(id) ON DELETE CASCADE,
    INDEX idx_token (token),
    INDEX idx_expires (expires_at),
    INDEX idx_user_id (user_id)
);


<<<<<<< Updated upstream
CREATE INDEX idx_clients_email ON clients(name);
=======

SHOW TABLES;
>>>>>>> Stashed changes
