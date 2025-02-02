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

if(!empty($data->email) && !empty($data->password) && !empty($data->full_name)) {
    $admin->email = $data->email;
    $admin->password = $data->password;
    $admin->full_name = $data->full_name;
    
    try {
        if($admin->register()) {
            http_response_code(201);
            echo json_encode([
                "success" => true,
                "message" => "Admin registered successfully"
            ]);
        } else {
            throw new Exception("Unable to register admin. Email may already be taken.");
        }
    } catch(Exception $e) {
        http_response_code(503);
        echo json_encode([
            "success" => false,
            "message" => $e->getMessage()
        ]);
    }
} else {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Email, password and full name are required"
    ]);
}