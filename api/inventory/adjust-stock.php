<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once '../config/Database.php';
include_once '../models/Inventory.php';
include_once '../middleware/AdminAuthMiddleware.php';

$database = new Database();
$db = $database->getConnection();

// Verify admin is authenticated
$auth = new AdminAuthMiddleware($database);
if(!$auth->authenticate()) {
    exit;
}

$inventory = new Inventory($db);
$data = json_decode(file_get_contents("php://input"));

if(!empty($data->product_id) && isset($data->quantity_change)) {
    $inventory->product_id = $data->product_id;
    $inventory->quantity_change = $data->quantity_change;
    $inventory->reason = $data->reason ?? null;
    $inventory->admin_id = $auth->getUserId();
    
    if($inventory->adjustStock()) {
        http_response_code(200);
        echo json_encode([
            "success" => true,
            "message" => "Stock adjusted successfully"
        ]);
    } else {
        http_response_code(503);
        echo json_encode([
            "success" => false,
            "message" => "Unable to adjust stock"
        ]);
    }
} else {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Product ID and quantity change are required"
    ]);
}