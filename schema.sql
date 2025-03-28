-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'viewer',
    status VARCHAR(20) DEFAULT 'Active',
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create user_projects table to track project associations
CREATE TABLE IF NOT EXISTS user_projects (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    project_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    UNIQUE KEY (user_id, project_id)
);

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Create vehicles table
CREATE TABLE IF NOT EXISTS vehicles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    project_id INT,
    name VARCHAR(100) NOT NULL,
    vin VARCHAR(17) NOT NULL,
    make VARCHAR(50),
    model VARCHAR(50),
    year INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    UNIQUE KEY (vin)
);

-- Create live_data table
CREATE TABLE IF NOT EXISTS live_data (
    id INT PRIMARY KEY AUTO_INCREMENT,
    vehicle_id INT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    speed DECIMAL(5,2),
    rpm INT,
    throttle_position DECIMAL(5,2),
    engine_load DECIMAL(5,2),
    coolant_temp DECIMAL(5,2),
    fuel_pressure DECIMAL(5,2),
    intake_pressure DECIMAL(5,2),
    maf DECIMAL(10,2),
    o2_voltage DECIMAL(5,2),
    fuel_level DECIMAL(5,2),
    battery_voltage DECIMAL(5,2),
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
);

-- Create fault_codes table
CREATE TABLE IF NOT EXISTS fault_codes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    vehicle_id INT,
    code VARCHAR(10) NOT NULL,
    description TEXT,
    severity VARCHAR(20),
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP NULL,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
);

-- Create historical_data table
CREATE TABLE IF NOT EXISTS historical_data (
    id INT PRIMARY KEY AUTO_INCREMENT,
    vehicle_id INT,
    timestamp TIMESTAMP,
    data_type VARCHAR(50),
    value DECIMAL(10,2),
    unit VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
);

-- Create reports table
CREATE TABLE IF NOT EXISTS reports (
    id INT PRIMARY KEY AUTO_INCREMENT,
    project_id INT,
    vehicle_id INT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    report_type VARCHAR(50),
    parameters JSON,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Create settings table
CREATE TABLE IF NOT EXISTS settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    theme VARCHAR(20) DEFAULT 'light',
    notifications_enabled BOOLEAN DEFAULT true,
    data_refresh_rate INT DEFAULT 5,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY (user_id)
);

-- Insert initial admin user (password: admin123)
INSERT IGNORE INTO users (username, email, password_hash) 
VALUES ('admin', 'admin@example.com', '$2b$10$YourHashedPasswordHere');

-- Insert tester user (password: password)
INSERT IGNORE INTO users (id, username, email, password_hash) 
VALUES (2, 'tester', 'tester@example.com', '$2b$10$YourHashedPasswordHere');

-- Insert viewer user (password: password)
INSERT IGNORE INTO users (id, username, email, password_hash) 
VALUES (3, 'viewer', 'viewer@example.com', '$2b$10$YourHashedPasswordHere');

-- Insert sample project
INSERT IGNORE INTO projects (id, name, description, created_by)
VALUES (1, 'Demo Project', 'Sample project for testing', 1);

-- Insert sample vehicle
INSERT IGNORE INTO vehicles (id, project_id, name, vin, make, model, year)
VALUES (1, 1, 'Test Vehicle', '1HGCM82633A123456', 'Honda', 'Accord', 2003);

-- Insert sample live data
INSERT IGNORE INTO live_data (vehicle_id, speed, rpm, throttle_position, engine_load, coolant_temp, fuel_pressure, intake_pressure, maf, o2_voltage, fuel_level, battery_voltage)
VALUES 
(1, 65.5, 2500, 25.5, 45.2, 90.5, 45.0, 30.2, 12.5, 0.85, 75.5, 14.2),
(1, 70.2, 2800, 30.0, 50.5, 92.0, 46.0, 31.5, 13.2, 0.88, 74.8, 14.1);

-- Insert sample fault codes
INSERT IGNORE INTO fault_codes (vehicle_id, code, description, severity)
VALUES 
(1, 'P0301', 'Cylinder 1 Misfire Detected', 'high'),
(1, 'P0171', 'System Too Lean', 'medium');

-- Insert sample historical data
INSERT IGNORE INTO historical_data (vehicle_id, timestamp, data_type, value, unit)
VALUES 
(1, DATE_SUB(NOW(), INTERVAL 1 HOUR), 'speed', 65.5, 'mph'),
(1, DATE_SUB(NOW(), INTERVAL 1 HOUR), 'rpm', 2500, 'rpm'),
(1, DATE_SUB(NOW(), INTERVAL 1 HOUR), 'fuel_efficiency', 28.5, 'mpg');

-- Insert sample report
INSERT IGNORE INTO reports (project_id, vehicle_id, name, description, report_type, created_by)
VALUES (1, 1, 'Performance Analysis', 'Vehicle performance analysis report', 'performance', 1);

-- Insert default settings
INSERT IGNORE INTO settings (user_id, theme, notifications_enabled, data_refresh_rate)
VALUES (1, 'light', true, 5); 