-- Add missing columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'viewer',
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active',
ADD COLUMN IF NOT EXISTS last_login DATETIME NULL;

-- Create user_projects table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_projects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  project_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_project (user_id, project_id)
);

-- Check if we have admin users and create defaults if needed
INSERT INTO users (username, email, password_hash, role, status)
SELECT 'admin', 'admin@example.com', '$2a$10$eDsz0/XcdCfLHU4U1SUSluEXvvOI1PjAMUqQXsGtZ9V/Z3uKlUW8e', 'admin', 'active'
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE role = 'admin' OR username = 'admin' OR email = 'admin@example.com'
);

-- Make sure we have at least one project
INSERT INTO projects (name, description)
SELECT 'Default Project', 'Default project created automatically'
WHERE NOT EXISTS (
  SELECT 1 FROM projects LIMIT 1
);

-- Associate admin with default project
INSERT IGNORE INTO user_projects (user_id, project_id)
SELECT u.id, p.id
FROM users u, projects p
WHERE u.username = 'admin' AND p.name = 'Default Project'; 