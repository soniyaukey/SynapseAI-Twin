-- =====================================================
-- SynapseAI Twin Database Schema
-- MySQL 8.0
-- =====================================================

-- Create database
CREATE DATABASE IF NOT EXISTS synapse_ai_twin;
USE synapse_ai_twin;

-- =====================================================
-- Users Table
-- =====================================================
DROP TABLE IF EXISTS users;
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- Activity Logs Table (With Duplicate Prevention)
-- =====================================================
DROP TABLE IF EXISTS activity_logs;
CREATE TABLE activity_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    activity VARCHAR(255) NOT NULL,
    activity_type VARCHAR(50) COMMENT 'task, habit, meeting, break, etc.',
    timestamp DATETIME NOT NULL,
    duration INT DEFAULT 0 COMMENT 'minutes',
    metadata JSON COMMENT 'Additional activity data',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    -- UNIQUE constraint prevents duplicate activity logs for same user at same timestamp
    UNIQUE KEY unique_user_activity_time (user_id, activity, timestamp),
    INDEX idx_user_id (user_id),
    INDEX idx_timestamp (timestamp),
    INDEX idx_activity_type (activity_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- Tasks Table (With Duplicate Prevention)
-- =====================================================
DROP TABLE IF EXISTS tasks;
CREATE TABLE tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    priority INT DEFAULT 3 COMMENT '1=High, 2=Medium, 3=Low',
    status VARCHAR(20) DEFAULT 'pending' COMMENT 'pending, in_progress, completed',
    category VARCHAR(50) COMMENT 'work, personal, study, health, etc.',
    estimated_duration INT COMMENT 'minutes',
    due_date DATETIME,
    completed_at DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    -- UNIQUE constraint prevents duplicate task for same user with same title and due_date
    UNIQUE KEY unique_user_task_date (user_id, title, due_date),
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_priority (priority),
    INDEX idx_due_date (due_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- Habits Table
-- =====================================================
DROP TABLE IF EXISTS habits;
CREATE TABLE habits (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    pattern JSON COMMENT 'JSON string of time patterns',
    frequency INT COMMENT 'times per week',
    productivity_score FLOAT DEFAULT 0 COMMENT '0-100',
    detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- Productivity Logs Table
-- =====================================================
DROP TABLE IF EXISTS productivity_logs;
CREATE TABLE productivity_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    date DATE NOT NULL,
    tasks_completed INT DEFAULT 0,
    total_focus_time INT DEFAULT 0 COMMENT 'minutes',
    productivity_score FLOAT DEFAULT 0 COMMENT '0-100',
    break_time INT DEFAULT 0 COMMENT 'minutes',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_date (user_id, date),
    INDEX idx_user_id (user_id),
    INDEX idx_date (date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- Schedule Templates Table
-- =====================================================
DROP TABLE IF EXISTS schedule_templates;
CREATE TABLE schedule_templates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    schedule_data JSON COMMENT 'Schedule template data',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- Predictions Table
-- =====================================================
DROP TABLE IF EXISTS predictions;
CREATE TABLE predictions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    prediction_type VARCHAR(50) COMMENT 'next_task, schedule, habit',
    prediction_data JSON COMMENT 'Prediction results',
    confidence FLOAT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_type (prediction_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- Insert Sample Data
-- =====================================================

-- Insert sample user
INSERT INTO users (name, email) VALUES 
('Demo User', 'demo@synapseai.com'),
('John Smith', 'john@example.com'),
('Jane Doe', 'jane@example.com');

-- Insert sample tasks
INSERT INTO tasks (user_id, title, description, priority, status, category, estimated_duration, due_date) VALUES
(1, 'Complete project proposal', 'Write the final project proposal document', 1, 'pending', 'work', 120, '2024-02-01 17:00:00'),
(1, 'Team standup meeting', 'Daily team standup', 2, 'completed', 'work', 15, '2024-01-30 10:00:00'),
(1, 'Code review session', 'Review pull requests from team', 2, 'in_progress', 'work', 60, '2024-01-30 14:00:00'),
(1, 'Gym workout', 'Morning gym session', 3, 'pending', 'health', 60, '2024-01-31 07:00:00'),
(1, 'Read documentation', 'Read API documentation', 3, 'pending', 'study', 45, '2024-02-02 20:00:00'),
(1, 'Client call', 'Weekly client check-in', 1, 'pending', 'work', 45, '2024-01-31 11:00:00'),
(1, 'Email catch-up', 'Process inbox', 2, 'pending', 'work', 30, '2024-01-30 09:00:00'),
(1, 'Design mockups', 'Create UI mockups for new feature', 1, 'pending', 'work', 180, '2024-02-05 17:00:00'),
(1, 'Write unit tests', 'Add unit tests for new module', 2, 'pending', 'work', 90, '2024-02-03 17:00:00'),
(1, 'Personal planning', 'Weekly personal planning', 3, 'pending', 'personal', 30, '2024-01-31 20:00:00');

-- Insert sample habits
INSERT INTO habits (user_id, name, pattern, frequency, productivity_score) VALUES
(1, 'Morning emails', '{"typical_time": "09:00", "variance": 0.5}', 7, 85),
(1, 'Team standup', '{"typical_time": "10:00", "variance": 0.2}', 5, 92),
(1, 'Deep work session', '{"typical_time": "11:00", "variance": 0.8}', 5, 78),
(1, 'Lunch break', '{"typical_time": "13:00", "variance": 0.3}', 7, 95),
(1, 'Gym workout', '{"typical_time": "18:00", "variance": 0.5}', 4, 88);

-- Insert sample productivity logs
INSERT INTO productivity_logs (user_id, date, tasks_completed, total_focus_time, productivity_score, break_time) VALUES
(1, '2024-01-24', 8, 360, 82, 45),
(1, '2024-01-25', 6, 300, 88, 30),
(1, '2024-01-26', 4, 240, 65, 60),
(1, '2024-01-27', 9, 420, 90, 40),
(1, '2024-01-28', 7, 330, 72, 35),
(1, '2024-01-29', 8, 380, 85, 50),
(1, '2024-01-30', 6, 290, 78, 45);

-- =====================================================
-- Create Views for Analytics
-- =====================================================

-- Task completion view
CREATE OR REPLACE VIEW task_completion_stats AS
SELECT 
    user_id,
    DATE(completed_at) as date,
    COUNT(*) as tasks_completed,
    SUM(estimated_duration) as total_time
FROM tasks
WHERE status = 'completed' AND completed_at IS NOT NULL
GROUP BY user_id, DATE(completed_at);

-- User productivity view
CREATE OR REPLACE VIEW user_productivity AS
SELECT 
    u.id as user_id,
    u.name,
    COUNT(t.id) as total_tasks,
    SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) as completed_tasks,
    ROUND(SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) * 100.0 / COUNT(t.id), 1) as completion_rate
FROM users u
LEFT JOIN tasks t ON u.id = t.user_id
GROUP BY u.id, u.name;

-- =====================================================
-- End of Schema
-- =====================================================