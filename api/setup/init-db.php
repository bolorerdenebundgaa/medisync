<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once '../config/Database.php';

$database = new Database();
$db = $database->getConnection();

try {
    // Start transaction
    $db->beginTransaction();

    // Create roles table
    $db->exec("CREATE TABLE IF NOT EXISTS roles (
        id CHAR(36) PRIMARY KEY,
        name VARCHAR(50) NOT NULL UNIQUE,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");

    // Create users table
    $db->exec("CREATE TABLE IF NOT EXISTS users (
        id CHAR(36) PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        auth_token VARCHAR(255) NULL,
        token_expires TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )");

    // Create user_roles table
    $db->exec("CREATE TABLE IF NOT EXISTS user_roles (
        id CHAR(36) PRIMARY KEY,
        user_id CHAR(36) NOT NULL,
        role_id CHAR(36) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_role (user_id, role_id)
    )");

    // Insert default roles
    $roles = [
        ['name' => 'admin', 'description' => 'Administrator with full access'],
        ['name' => 'sales', 'description' => 'Sales staff with POS access'],
        ['name' => 'referee', 'description' => 'Referee with referral tracking']
    ];

    foreach ($roles as $role) {
        $id = $database->generateUUID();
        $stmt = $db->prepare("INSERT IGNORE INTO roles (id, name, description) VALUES (?, ?, ?)");
        $stmt->execute([$id, $role['name'], $role['description']]);
    }

    // Create admin user
    $adminId = $database->generateUUID();
    $adminPassword = password_hash('admin123', PASSWORD_BCRYPT);
    
    $stmt = $db->prepare("INSERT INTO users (id, email, password, full_name) 
                         VALUES (?, 'admin@example.com', ?, 'Admin User')
                         ON DUPLICATE KEY UPDATE
                         password = VALUES(password)");
    $stmt->execute([$adminId, $adminPassword]);

    // Get admin role ID
    $stmt = $db->prepare("SELECT id FROM roles WHERE name = 'admin'");
    $stmt->execute();
    $adminRole = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($adminRole) {
        // Assign admin role
        $userRoleId = $database->generateUUID();
        $stmt = $db->prepare("INSERT IGNORE INTO user_roles (id, user_id, role_id) VALUES (?, ?, ?)");
        $stmt->execute([$userRoleId, $adminId, $adminRole['id']]);
    }

    $db->commit();
    
    http_response_code(200);
    echo json_encode([
        "success" => true,
        "message" => "Database initialized successfully"
    ]);
} catch (Exception $e) {
    $db->rollBack();
    error_log("Database initialization error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Error initializing database: " . $e->getMessage()
    ]);
}