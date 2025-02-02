<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once '../../config/Database.php';
include_once '../../models/Admin.php';

$database = new Database();
$db = $database->getConnection();

// Get authorization header
$headers = getallheaders();
$auth = isset($headers['Authorization']) ? $headers['Authorization'] : '';

if(empty($auth)) {
    http_response_code(401);
    echo json_encode([
        "success" => false,
        "message" => "No authorization token provided"
    ]);
    exit;
}

// Extract token
$token = str_replace('Bearer ', '', $auth);

try {
    $admin = new Admin($db);
    if($admin->logout($token)) {
        http_response_code(200);
        echo json_encode([
            "success" => true,
            "message" => "Successfully logged out"
        ]);
    } else {
        throw new Exception("Error during logout");
    }
} catch(Exception $e) {
    error_log("Logout error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Error during logout"
    ]);
}