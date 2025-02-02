<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: PUT");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once '../../config/Database.php';
include_once '../../models/Settings.php';
include_once '../../middleware/AdminAuthMiddleware.php';

$database = new Database();
$db = $database->getConnection();

// Verify admin is authenticated
$auth = new AdminAuthMiddleware($database);
if(!$auth->authenticate()) {
    exit;
}

$settings = new Settings($db);
$data = json_decode(file_get_contents("php://input"));

if(!empty($data)) {
    $settings->vat_percentage = $data->vat_percentage ?? null;
    $settings->referral_percentage = $data->referral_percentage ?? null;
    $settings->maintenance_percentage = $data->maintenance_percentage ?? null;
    
    if($settings->update()) {
        http_response_code(200);
        echo json_encode([
            "success" => true,
            "message" => "Settings updated successfully"
        ]);
    } else {
        http_response_code(503);
        echo json_encode([
            "success" => false,
            "message" => "Unable to update settings"
        ]);
    }
} else {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "No settings provided"
    ]);
}