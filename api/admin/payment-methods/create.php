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

include_once '../../config/Database.php';
include_once '../../models/PaymentMethod.php';
include_once '../../middleware/AdminAuthMiddleware.php';

$database = new Database();
$db = $database->getConnection();

// Verify admin is authenticated
$auth = new AdminAuthMiddleware($database);
if(!$auth->authenticate()) {
    exit;
}

$paymentMethod = new PaymentMethod($db);
$data = json_decode(file_get_contents("php://input"));

if(!empty($data->name) && !empty($data->type)) {
    try {
        // Set payment method properties
        $paymentMethod->name = $data->name;
        $paymentMethod->type = $data->type;
        $paymentMethod->enabled = isset($data->enabled) ? $data->enabled : false;
        $paymentMethod->icon = $data->icon ?? null;
        $paymentMethod->processor_config = isset($data->processor_config) ? $data->processor_config : null;
        $paymentMethod->is_default = isset($data->is_default) ? $data->is_default : false;

        if($paymentMethod->create()) {
            // Get all methods including the new one
            $stmt = $paymentMethod->read();
            $methods = array();
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $method = array(
                    "id" => $row['id'],
                    "name" => $row['name'],
                    "type" => $row['type'],
                    "enabled" => (bool)$row['enabled'],
                    "icon" => $row['icon'],
                    "is_default" => (bool)$row['is_default'],
                    "processor_config" => $row['processor_config'] ? json_decode($row['processor_config']) : null,
                    "created_at" => $row['created_at'],
                    "updated_at" => $row['updated_at']
                );
                array_push($methods, $method);
            }

            http_response_code(201);
            echo json_encode([
                "success" => true,
                "message" => "Payment method created successfully",
                "data" => $methods
            ]);
        } else {
            throw new Exception("Failed to create payment method");
        }
    } catch(Exception $e) {
        http_response_code(500);
        echo json_encode([
            "success" => false,
            "message" => $e->getMessage()
        ]);
    }
} else {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Name and type are required"
    ]);
}
