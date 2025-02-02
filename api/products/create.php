<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once '../config/Database.php';
include_once '../models/Product.php';

$database = new Database();
$db = $database->getConnection();
$product = new Product($db);

$data = json_decode(file_get_contents("php://input"));

if(
    !empty($data->name) &&
    !empty($data->sku) &&
    !empty($data->price)
) {
    $product->name = $data->name;
    $product->sku = $data->sku;
    $product->description = $data->description;
    $product->price = $data->price;
    $product->quantity = $data->quantity;

    if($product->create()) {
        http_response_code(201);
        echo json_encode(["message" => "Product was created."]);
    } else {
        http_response_code(503);
        echo json_encode(["message" => "Unable to create product."]);
    }
} else {
    http_response_code(400);
    echo json_encode(["message" => "Unable to create product. Data is incomplete."]);
}