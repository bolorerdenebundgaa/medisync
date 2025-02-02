-- Users table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Roles table
CREATE TABLE IF NOT EXISTS roles (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User roles table (many-to-many relationship between users and roles)
CREATE TABLE IF NOT EXISTS user_roles (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    role_id VARCHAR(50) NOT NULL,
    branch_id VARCHAR(36),
    assigned_by VARCHAR(36) NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_by) REFERENCES users(id),
    UNIQUE KEY unique_user_role_branch (user_id, role_id, branch_id)
);

-- Role permissions table
CREATE TABLE IF NOT EXISTS role_permissions (
    id VARCHAR(36) PRIMARY KEY,
    role_id VARCHAR(50) NOT NULL,
    permission VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    UNIQUE KEY unique_role_permission (role_id, permission)
);

-- Password reset logs
CREATE TABLE IF NOT EXISTS password_reset_logs (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    reset_by VARCHAR(36) NOT NULL,
    reset_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reset_by) REFERENCES users(id)
);

-- Insert default roles
INSERT IGNORE INTO roles (id, name, description) VALUES
('admin', 'Administrator', 'Full system access'),
('manager', 'Manager', 'Branch management access'),
('staff', 'Staff', 'Basic branch operations'),
('referee', 'Referee', 'Product referral access');

-- Insert default permissions for roles
INSERT IGNORE INTO role_permissions (id, role_id, permission) VALUES
(UUID(), 'admin', 'MANAGE_USERS'),
(UUID(), 'admin', 'MANAGE_ROLES'),
(UUID(), 'admin', 'MANAGE_BRANCHES'),
(UUID(), 'admin', 'MANAGE_PRODUCTS'),
(UUID(), 'admin', 'MANAGE_INVENTORY'),
(UUID(), 'admin', 'VIEW_REPORTS'),
(UUID(), 'admin', 'MANAGE_SETTINGS'),
(UUID(), 'admin', 'CREATE_SALE'),
(UUID(), 'admin', 'MANAGE_REFEREES'),

(UUID(), 'manager', 'MANAGE_BRANCH_INVENTORY'),
(UUID(), 'manager', 'MANAGE_BRANCH_STAFF'),
(UUID(), 'manager', 'VIEW_BRANCH_REPORTS'),
(UUID(), 'manager', 'CREATE_SALE'),

(UUID(), 'staff', 'CREATE_SALE'),
(UUID(), 'staff', 'VIEW_INVENTORY'),

(UUID(), 'referee', 'VIEW_PRODUCTS'),
(UUID(), 'referee', 'REFER_PRODUCTS');

-- Create default admin user if not exists
INSERT IGNORE INTO users (id, email, password, full_name, is_active) VALUES
(UUID(), 'admin@medisync.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'System Administrator', true);

-- Assign admin role to default admin user
INSERT IGNORE INTO user_roles (id, user_id, role_id, assigned_by)
SELECT UUID(), u.id, 'admin', u.id
FROM users u
WHERE u.email = 'admin@medisync.com'
LIMIT 1;
