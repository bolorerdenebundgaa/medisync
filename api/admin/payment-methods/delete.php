<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: DELETE");
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

// Get ID from URL parameter
$id = isset($_GET['id']) ? $_GET['id'] : null;

if($id) {
    try {
        $paymentMethod->id = $id;

        if($paymentMethod->delete()) {
            // Get remaining methods
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

            http_response_code(200);
            echo json_encode([
                "success" => true,
                "message" => "Payment method deleted successfully",
                "data" => $methods
            ]);
        } else {
            throw new Exception("Failed to delete payment method");
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
        "message" => "Payment method ID is required"
    ]);
}
