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

if(!empty($data->methodId) && !empty($data->updates)) {
    try {
        $paymentMethod->id = $data->methodId;

        // Get current method data
        $query = "SELECT * FROM payment_methods WHERE id = ?";
        $stmt = $db->prepare($query);
        $stmt->execute([$data->methodId]);
        $currentMethod = $stmt->fetch(PDO::FETCH_ASSOC);

        if(!$currentMethod) {
            throw new Exception("Payment method not found");
        }

        // Update only provided fields
        $paymentMethod->name = $data->updates->name ?? $currentMethod['name'];
        $paymentMethod->type = $data->updates->type ?? $currentMethod['type'];
        $paymentMethod->enabled = isset($data->updates->enabled) ? $data->updates->enabled : $currentMethod['enabled'];
        $paymentMethod->icon = $data->updates->icon ?? $currentMethod['icon'];
        $paymentMethod->is_default = isset($data->updates->is_default) ? $data->updates->is_default : $currentMethod['is_default'];
        
        // Handle processor config updates
        if(isset($data->updates->processor_config)) {
            $currentConfig = $currentMethod['processor_config'] ? json_decode($currentMethod['processor_config'], true) : [];
            $paymentMethod->processor_config = array_merge($currentConfig, (array)$data->updates->processor_config);
        } else {
            $paymentMethod->processor_config = $currentMethod['processor_config'];
        }

        if($paymentMethod->update()) {
            // Get updated method data
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
                "message" => "Payment method updated successfully",
                "data" => $methods
            ]);
        } else {
            throw new Exception("Failed to update payment method");
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
        "message" => "Method ID and updates are required"
    ]);
}
