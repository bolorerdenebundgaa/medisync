<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With, Cache-Control");
header("Access-Control-Max-Age: 3600");

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

// Get guest cart ID from query parameter
$guest_cart_id = isset($_GET['guest_cart_id']) ? $_GET['guest_cart_id'] : null;

if ($guest_cart_id) {
    $result = $cart->getGuestCart($guest_cart_id);
    if ($result) {
        http_response_code(200);
        echo json_encode([
            "success" => true,
            "data" => $result
        ]);
    } else {
        http_response_code(200);
        echo json_encode([
            "success" => true,
            "data" => [
                "items" => []
            ]
        ]);
    }
} else {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Guest cart ID is required"
    ]);
}