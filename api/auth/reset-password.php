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

if(!empty($data->email)) {
    if($user->requestPasswordReset($data->email)) {
        http_response_code(200);
        echo json_encode([
            "success" => true,
            "message" => "Password reset instructions sent to your email"
        ]);
    } else {
        http_response_code(404);
        echo json_encode([
            "success" => false,
            "message" => "Email not found"
        ]);
    }
} else {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Email is required"
    ]);
}