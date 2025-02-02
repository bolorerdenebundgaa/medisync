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
$admin = new Admin($db);

$data = json_decode(file_get_contents("php://input"));

if(!empty($data->email) && !empty($data->password)) {
    $admin->email = $data->email;
    $admin->password = $data->password;
    
    error_log("Admin login attempt for: " . $data->email);
    
    try {
        $result = $admin->login();
        if($result) {
            http_response_code(200);
            error_log("Admin login successful for: " . $data->email);
            echo json_encode([
                "success" => true,
                "data" => [
                    "id" => $result['id'],
                    "email" => $result['email'],
                    "full_name" => $result['full_name'],
                    "role" => $result['role'],
                    "token" => $result['token']
                ]
            ]);
        } else {
            error_log("Admin login failed for: " . $data->email);
            http_response_code(401);
            echo json_encode([
                "success" => false,
                "message" => "Invalid credentials"
            ]);
        }
    } catch(Exception $e) {
        error_log("Admin login error: " . $e->getMessage());
        http_response_code(500);
        echo json_encode([
            "success" => false,
            "message" => "Login failed"
        ]);
    }
} else {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Email and password are required"
    ]);
}