<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once '../../config/Database.php';
include_once '../../models/User.php';
include_once '../../middleware/AdminAuthMiddleware.php';

$database = new Database();
$db = $database->getConnection();

// Verify admin is authenticated
$auth = new AdminAuthMiddleware($database);
$admin = $auth->authenticate();
if(!$admin) {
    exit;
}

// Get posted data
$data = json_decode(file_get_contents("php://input"));

// Validate required fields
if(!isset($data->id) || !isset($data->password)) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Missing required fields"
    ]);
    exit;
}

// Validate password length
if(strlen($data->password) < 6) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Password must be at least 6 characters long"
    ]);
    exit;
}

try {
    $db->beginTransaction();

    $userModel = new User($db);

    // Check if user exists
    $stmt = $userModel->readOne($data->id);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if(!$user) {
        throw new Exception("User not found");
    }

    // Update password
    $hashedPassword = password_hash($data->password, PASSWORD_DEFAULT);
    if(!$userModel->updatePassword($data->id, $hashedPassword)) {
        throw new Exception("Failed to update password");
    }

    // Log password reset
    if(!$userModel->logPasswordReset($data->id, $admin['id'])) {
        throw new Exception("Failed to log password reset");
    }

    $db->commit();

    http_response_code(200);
    echo json_encode([
        "success" => true,
        "message" => "Password reset successfully"
    ]);

} catch(Exception $e) {
    $db->rollBack();

    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}
