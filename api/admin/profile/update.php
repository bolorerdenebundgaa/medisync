<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: PUT");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once '../../config/Database.php';
include_once '../../models/Admin.php';
include_once '../../middleware/AdminAuthMiddleware.php';

$database = new Database();
$db = $database->getConnection();

// Verify admin is authenticated
$auth = new AdminAuthMiddleware($database);
if(!$auth->authenticate()) {
    exit;
}

$admin = new Admin($db);
$data = json_decode(file_get_contents("php://input"));

if(!empty($data->full_name)) {
    $admin->id = $auth->getUserId(); // Add method to get user ID from token
    $admin->full_name = $data->full_name;
    
    if($admin->updateProfile()) {
        http_response_code(200);
        echo json_encode([
            "success" => true,
            "message" => "Profile updated successfully"
        ]);
    } else {
        http_response_code(503);
        echo json_encode([
            "success" => false,
            "message" => "Unable to update profile"
        ]);
    }
} else {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Full name is required"
    ]);
}