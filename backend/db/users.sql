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
    phone_number VARCHAR(20),
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

-- Clients (password: 'password123' hashed with bcrypt - you'll need to replace with actual bcrypt hash)
INSERT INTO Accounts (id, email, password_hash, role, created_at, updated_at) 
VALUES 
    (UUID_TO_BIN(UUID()), 'johandson@outlook.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.VTtYrQYQZvHk7W', 'client', NOW(), NOW()),
    (UUID_TO_BIN(UUID()),'plincoln@gmail.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.VTtYrQYQZvHk7W', 'client', NOW(), NOW()),
    (UUID_TO_BIN(UUID()), 'smirth@icloud.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.VTtYrQYQZvHk7W', 'client', NOW(), NOW());
-- Insert client profiles (using the same IDs from Accounts table)

SET @Client1ID = (SELECT id FROM Accounts WHERE email = 'johandson@outlook.com');
SET @Client2ID = (SELECT id FROM Accounts WHERE email = 'plincoln@gmail.com');
SET @Client3ID = (SELECT id  FROM Accounts WHERE email = 'smirth@icloud.com');

INSERT INTO clients (id, name, phone_number, height, weight, created_at, updated_at) VALUES
    (@Client1ID, 'Joe Hanson', '8769983264', '158', '189', NOW(), NOW()),
    (@Client2ID, 'Peter Lincoln', '8769983264', '193', '164', NOW(), NOW()),
    (@Client3ID, 'Merry Smith', '8761157976', '258', '192', NOW(), NOW());

-- Trainers
INSERT INTO Accounts (id, email, password_hash, role, created_at, updated_at) 
VALUES 
    (UUID_TO_BIN(UUID()), 'smyers@gmail.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.VTtYrQYQZvHk7W', 'trainer', NOW(), NOW()),
    (UUID_TO_BIN(UUID()), 'ashtHall@gmail.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.VTtYrQYQZvHk7W', 'trainer', NOW(), NOW());

SET @Trainer1ID = (SELECT id FROM Accounts WHERE email = 'smyers@gmail.com');
SET @Trainer2ID = (SELECT id FROM Accounts WHERE email = 'ashtHall@gmail.com');

INSERT INTO trainers (id, name, certification, rating, trainer_level, is_senior, created_at, updated_at) VALUES
    (@Trainer1ID, 'Sherice Myers', 'Good', 3.8, 2.6, 0, NOW(), NOW()),
    (@Trainer2ID, 'Ashton Hall', 'Excellent', 4.8, 4.9, 1, NOW(), NOW());

-- Admin
INSERT INTO Accounts (id, email, password_hash, role, created_at, updated_at) 
VALUES 
    (UUID_TO_BIN(UUID()), 'cmontgmery@gmail.com', '$2b$12$r0KfHB37dGfaWx4NK.uZ8O1kLNV56RJNouszlKmElcujTmNKxcVW6', 'admin', NOW(), NOW());
UPDATE Accounts SET password_hash = "$2b$12$r0KfHB37dGfaWx4NK.uZ8O1kLNV56RJNouszlKmElcujTmNKxcVW6" WHERE id =@Admin1ID;
SELECT BIN_TO_UUID(id) from Accounts;
SELECT * FROM admins;
SET @Admin1ID = (SELECT id FROM Accounts WHERE email = 'cmontgmery@gmail.com');
SELECT id FROM Accounts WHERE email = 'smyers@gmail.com';
SELECT @Admin1D;
SELECT * FROM Accounts;
INSERT INTO admins (id, name, phone_number, created_at, updated_at) VALUES
    (@Admin1ID, 'Chelsea Montgomery', '8769841653', NOW(), NOW());

SHOW TABLES;
DESCRIBE Accounts;
-- Optional: Create a view for easy user lookups
CREATE VIEW vw_user_profiles AS
SELECT 
    u.id,
    u.email,
    u.role,
    u.created_at,
    u.updated_at,
    CASE 
        WHEN u.role = 'client' THEN c.name
        WHEN u.role = 'trainer' THEN t.name
        WHEN u.role = 'admin' THEN a.name
    END AS name,
    CASE 
        WHEN u.role = 'client' THEN c.phone_number
        WHEN u.role = 'admin' THEN a.phone_number
        ELSE NULL
    END AS phone_number,
    CASE WHEN u.role = 'client' THEN c.height ELSE NULL END AS height,
    CASE WHEN u.role = 'client' THEN c.weight ELSE NULL END AS weight,
    CASE WHEN u.role = 'trainer' THEN t.certification ELSE NULL END AS certification,
    CASE WHEN u.role = 'trainer' THEN t.rating ELSE NULL END AS rating,
    CASE WHEN u.role = 'trainer' THEN t.trainer_level ELSE NULL END AS trainer_level,
    CASE WHEN u.role = 'trainer' THEN t.is_senior ELSE NULL END AS is_senior
FROM Accounts u
LEFT JOIN clients c ON u.id = clients.id AND u.role = 'client'
LEFT JOIN trainers t ON u.id = trainers.id AND u.role = 'trainer'
LEFT JOIN admins a ON u.id = admins.id AND u.role = 'admin';

SHOW CREATE VIEW vw_user_profiles

