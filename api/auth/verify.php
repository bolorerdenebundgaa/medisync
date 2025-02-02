<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Access-Control-Max-Age: 3600");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
header("Access-Control-Max-Age: 3600");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once '../config/Database.php';
include_once '../models/WebUser.php';

$database = new Database();
$db = $database->getConnection();

// Get authorization header
$headers = getallheaders();
$auth = isset($headers['Authorization']) ? $headers['Authorization'] : '';

if(empty($auth)) {
    // Try to get token from request body as fallback
    $data = json_decode(file_get_contents("php://input"));
    $token = $data->token ?? null;
} else {
    // Extract token from Authorization header
    $token = str_replace('Bearer ', '', $auth);
}

error_log("Verifying token: " . ($token ?? 'no token'));
if(!empty($token)) {
    $user = new WebUser($db);
    $result = $user->getUserByToken($token);
    
    if($result) {
        error_log("Token verified for user: " . $result['email']);
        http_response_code(200);
        echo json_encode([
            "success" => true,
            "data" => [
                "id" => $result['id'],
                "email" => $result['email'],
                "full_name" => $result['full_name']
            ]
        ]);
    } else {
        error_log("Invalid or expired token");
        http_response_code(401);
        echo json_encode([
            "success" => false,
            "message" => "Invalid or expired token"
        ]);
    }
} else {
    error_log("No token provided");
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Token is required"
    ]);
}