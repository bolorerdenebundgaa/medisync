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
include_once '../models/Cart.php';

$database = new Database();
$db = $database->getConnection();
$cart = new Cart($db);

$data = json_decode(file_get_contents("php://input"));

if(!empty($data->product_id) && !empty($data->guest_cart_id)) {
    if($cart->removeFromGuestCart($data->guest_cart_id, $data->product_id)) {
        http_response_code(200);
        echo json_encode([
            "success" => true,
            "message" => "Product removed from cart"
        ]);
    } else {
        http_response_code(503);
        echo json_encode([
            "success" => false,
            "message" => "Unable to remove product from cart"
        ]);
    }
} else {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Product ID and guest cart ID are required"
    ]);
}