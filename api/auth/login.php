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

include_once '../config/Database.php';
include_once '../models/WebUser.php';

$database = new Database();
$db = $database->getConnection();
$user = new WebUser($db);

$data = json_decode(file_get_contents("php://input"));

if(!empty($data->email) && !empty($data->password)) {
    $user->email = $data->email;
    $user->password = $data->password;
    
    error_log("Login attempt for: " . $data->email);
    
    $result = $user->login();
    if($result) {
        http_response_code(200);
        error_log("Login successful for user: " . $data->email);
        error_log("Token generated: " . $result['token']);
        echo json_encode([
            "success" => true,
            "data" => [
                "id" => $result['id'],
                "email" => $result['email'],
                "full_name" => $result['full_name'],
                "token" => $result['token']
            ]
        ]);
    } else {
        error_log("Login failed for user: " . $data->email);
        http_response_code(401);
        echo json_encode([
            "success" => false,
            "message" => "Invalid credentials"
        ]);
    }
} else {
    error_log("Login attempt with missing credentials");
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Email and password are required"
    ]);
}