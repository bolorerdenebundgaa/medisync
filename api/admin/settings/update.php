<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once '../../config/Database.php';
include_once '../../models/Settings.php';
include_once '../../middleware/AdminAuthMiddleware.php';

$database = new Database();
$db = $database->getConnection();

// Verify admin is authenticated
$auth = new AdminAuthMiddleware($database);
$user = $auth->authenticate();
if(!$user || $user['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode([
        "success" => false,
        "message" => "Access denied. Only administrators can update settings."
    ]);
    exit;
}

// Get posted data
$data = json_decode(file_get_contents("php://input"));

try {
    $settingsModel = new Settings($db);

    // Validate settings
    $errors = $settingsModel->validateSettings([
        'referee_commission_percentage' => $data->referee_commission_percentage ?? null,
        'vat_percentage' => $data->vat_percentage ?? null
    ]);

    if(!empty($errors)) {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Validation failed",
            "errors" => $errors
        ]);
        exit;
    }

    // Update settings
    $updatedSettings = $settingsModel->update([
        'referee_commission_percentage' => $data->referee_commission_percentage ?? null,
        'vat_percentage' => $data->vat_percentage ?? null
    ]);

    if($updatedSettings) {
        http_response_code(200);
        echo json_encode([
            "success" => true,
            "message" => "Settings updated successfully",
            "data" => $updatedSettings
        ]);
    } else {
        throw new Exception("Failed to update settings");
    }

} catch(Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}
