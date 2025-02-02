<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: DELETE");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once '../../config/Database.php';
include_once '../../models/Branch.php';
include_once '../../middleware/AdminAuthMiddleware.php';

$database = new Database();
$db = $database->getConnection();

// Verify admin is authenticated
$auth = new AdminAuthMiddleware($database);
if(!$auth->authenticate()) {
    exit;
}

$branch = new Branch($db);
$data = json_decode(file_get_contents("php://input"));

if(!empty($data->id)) {
    if($branch->delete($data->id)) {
        http_response_code(200);
        echo json_encode([
            "success" => true,
            "message" => "Branch deleted successfully"
        ]);
    } else {
        http_response_code(503);
        echo json_encode([
            "success" => false,
            "message" => "Unable to delete branch. It may be the ecommerce base branch."
        ]);
    }
} else {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Branch ID is required"
    ]);
}