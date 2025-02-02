<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once '../config/Database.php';
include_once '../models/Order.php';

$database = new Database();
$db = $database->getConnection();
$order = new Order($db);

$data = json_decode(file_get_contents("php://input"));

if(!empty($data->items) && !empty($data->customer_details)) {
    $order->items = $data->items;
    $order->customer_details = $data->customer_details;
    $order->total = $data->total;
    $order->payment_method = $data->payment_method;
    
    if($order->create()) {
        http_response_code(201);
        echo json_encode([
            "success" => true,
            "message" => "Order placed successfully"
        ]);
    } else {
        http_response_code(503);
        echo json_encode([
            "success" => false,
            "message" => "Unable to place order"
        ]);
    }
} else {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Items and customer details are required"
    ]);
}