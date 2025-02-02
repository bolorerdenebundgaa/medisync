<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once '../config/Database.php';
include_once '../models/Sale.php';
include_once '../middleware/AdminAuthMiddleware.php';

$database = new Database();
$db = $database->getConnection();

// Verify admin is authenticated
$auth = new AdminAuthMiddleware($database);
if(!$auth->authenticate()) {
    exit;
}

$sale = new Sale($db);
$data = json_decode(file_get_contents("php://input"));

if(!empty($data->items) && !empty($data->total)) {
    $sale->items = $data->items;
    $sale->total = $data->total;
    $sale->payment_method = $data->payment_method;
    $sale->customer_id = $data->customer_id ?? null;
    $sale->admin_id = $auth->getUserId();
    
    if($sale->create()) {
        http_response_code(201);
        echo json_encode([
            "success" => true,
            "message" => "Sale created successfully"
        ]);
    } else {
        http_response_code(503);
        echo json_encode([
            "success" => false,
            "message" => "Unable to create sale"
        ]);
    }
} else {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Items and total are required"
    ]);
}