-- =====================================================
-- NUTRITION TABLES
-- =====================================================

-- Nutrition Plans table
CREATE TABLE IF NOT EXISTS nutrition_plans (
    id BINARY(16) PRIMARY KEY DEFAULT (UUID_TO_BIN(UUID())),
    user_id BINARY(16) NOT NULL,
    daily_calories DECIMAL(8,2) NOT NULL,
    daily_protein_g DECIMAL(6,2) NOT NULL,
    daily_carbs_g DECIMAL(6,2) NOT NULL,
    daily_fat_g DECIMAL(6,2) NOT NULL,
    daily_fiber_g DECIMAL(6,2),
    meals JSON NOT NULL DEFAULT ('[]'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Accounts(id) ON DELETE CASCADE,
    INDEX idx_nutrition_plans_user_id (user_id)
);

-- Nutrition Goals table
CREATE TABLE IF NOT EXISTS nutrition_goals (
    id BINARY(16) PRIMARY KEY DEFAULT (UUID_TO_BIN(UUID())),
    user_id BINARY(16) NOT NULL UNIQUE,
    daily_calories DECIMAL(8,2) NOT NULL,
    daily_protein_g DECIMAL(6,2) NOT NULL,
    daily_carbs_g DECIMAL(6,2) NOT NULL,
    daily_fat_g DECIMAL(6,2) NOT NULL,
    daily_fiber_g DECIMAL(6,2),
    dietary_restrictions JSON,
    allergies JSON,
    goal_type VARCHAR(50) NOT NULL DEFAULT 'maintain',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Accounts(id) ON DELETE CASCADE,
    INDEX idx_nutrition_goals_user_id (user_id)
);

-- Insert sample nutrition goals for existing clients
INSERT INTO nutrition_goals (user_id, daily_calories, daily_protein_g, daily_carbs_g, daily_fat_g, daily_fiber_g, dietary_restrictions, allergies, goal_type)
SELECT 
    id,
    CASE 
        WHEN name = 'Joe Hanson' THEN 1800
        WHEN name = 'Peter Lincoln' THEN 2500
        WHEN name = 'Merry Smith' THEN 2000
        ELSE 2000
    END as daily_calories,
    CASE 
        WHEN name = 'Joe Hanson' THEN 160
        WHEN name = 'Peter Lincoln' THEN 180
        WHEN name = 'Merry Smith' THEN 150
        ELSE 150
    END as daily_protein_g,
    CASE 
        WHEN name = 'Joe Hanson' THEN 200
        WHEN name = 'Peter Lincoln' THEN 300
        WHEN name = 'Merry Smith' THEN 250
        ELSE 250
    END as daily_carbs_g,
    CASE 
        WHEN name = 'Joe Hanson' THEN 60
        WHEN name = 'Peter Lincoln' THEN 80
        WHEN name = 'Merry Smith' THEN 65
        ELSE 65
    END as daily_fat_g,
    25 as daily_fiber_g,
    JSON_ARRAY() as dietary_restrictions,
    JSON_ARRAY() as allergies,
    CASE 
        WHEN name = 'Joe Hanson' THEN 'lose_weight'
        WHEN name = 'Peter Lincoln' THEN 'gain_muscle'
        WHEN name = 'Merry Smith' THEN 'maintain'
        ELSE 'maintain'
    END as goal_type
FROM Accounts 
WHERE role = 'client'
ON DUPLICATE KEY UPDATE
    daily_calories = VALUES(daily_calories),
    daily_protein_g = VALUES(daily_protein_g),
    daily_carbs_g = VALUES(daily_carbs_g),
    daily_fat_g = VALUES(daily_fat_g),
    goal_type = VALUES(goal_type);

-- Verify tables were created
SELECT '=== Nutrition Tables Created ===' as '';
SHOW TABLES LIKE 'nutrition_%';
SELECT COUNT(*) as total_nutrition_plans FROM nutrition_plans;
SELECT COUNT(*) as total_nutrition_goals FROM nutrition_goals;
