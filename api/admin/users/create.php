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

try {
    $database = new Database();
    $db = $database->getConnection();

    // Verify admin is authenticated
    $auth = new AdminAuthMiddleware($database);
    if(!$auth->authenticate()) {
        exit;
    }

    $user = new User($db);
    $data = json_decode(file_get_contents("php://input"));

    if(!empty($data->email) && !empty($data->password) && !empty($data->full_name)) {
        if($user->create($data->email, $data->password, $data->full_name)) {
            http_response_code(201);
            echo json_encode([
                "success" => true,
                "message" => "User created successfully"
            ]);
        } else {
            throw new Exception("Unable to create user");
        }
    } else {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Email, password and full name are required"
        ]);
    }
} catch(Exception $e) {
    error_log("Error creating user: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}