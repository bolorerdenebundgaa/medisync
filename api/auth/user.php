<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once '../config/Database.php';
include_once '../models/WebUser.php';

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
    $user = new WebUser($db);
    $userData = $user->getUserByToken($token);
    
    if($userData) {
        http_response_code(200);
        echo json_encode([
            "success" => true,
            "data" => [
                "id" => $userData['id'],
                "email" => $userData['email'],
                "full_name" => $userData['full_name'],
                "token" => $token
            ]
        ]);
    } else {
        http_response_code(401);
        echo json_encode([
            "success" => false,
            "message" => "Invalid or expired token"
        ]);
    }
} catch(Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Error retrieving user data"
    ]);
}