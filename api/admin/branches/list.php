<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");


// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
include_once '../../config/Database.php';
include_once '../../models/Branch.php';
include_once '../../middleware/AdminAuthMiddleware.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    
    // Verify admin is authenticated
    $auth = new AdminAuthMiddleware($database);
    if(!$auth->authenticate()) {
        exit;
    }

    $branch = new Branch($db);
    $branches = $branch->getAll();

    http_response_code(200);
    echo json_encode([
        "success" => true,
        "data" => $branches
    ]);
} catch(Exception $e) {
    error_log("Error in branches/list.php: " . $e->getMessage());
    error_log("Stack trace: " . $e->getTraceAsString());
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}