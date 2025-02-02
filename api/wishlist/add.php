<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once '../config/Database.php';
include_once '../models/Wishlist.php';

$database = new Database();
$db = $database->getConnection();
$wishlist = new Wishlist($db);

$data = json_decode(file_get_contents("php://input"));

if(!empty($data->user_id) && !empty($data->product_id)) {
    if($wishlist->addItem($data->user_id, $data->product_id)) {
        http_response_code(200);
        echo json_encode([
            "success" => true,
            "message" => "Product added to wishlist"
        ]);
    } else {
        http_response_code(503);
        echo json_encode([
            "success" => false,
            "message" => "Unable to add product to wishlist"
        ]);
    }
} else {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "User ID and product ID are required"
    ]);
}