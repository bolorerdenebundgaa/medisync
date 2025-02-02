<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once '../../config/Database.php';
include_once '../../models/Prescription.php';
include_once '../../middleware/AdminAuthMiddleware.php';

$database = new Database();
$db = $database->getConnection();

// Verify referee is authenticated
$auth = new AdminAuthMiddleware($database);
$user = $auth->authenticate();
if(!$user || $user['role'] !== 'referee') {
    http_response_code(403);
    echo json_encode([
        "success" => false,
        "message" => "Access denied. Only referees can create prescriptions."
    ]);
    exit;
}

// Get posted data
$data = json_decode(file_get_contents("php://input"));

// Validate required fields
if(!isset($data->client_id) || !isset($data->items) || empty($data->items)) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Missing required fields"
    ]);
    exit;
}

try {
    $db->beginTransaction();

    $prescriptionModel = new Prescription($db);

    // Create prescription
    $prescriptionData = [
        'client_id' => $data->client_id,
        'referee_id' => $user['id'],
        'branch_id' => $user['branch_id'], // Referee's assigned branch
        'status' => 'active'
    ];

    $prescriptionId = $prescriptionModel->create($prescriptionData);
    if(!$prescriptionId) {
        throw new Exception("Failed to create prescription");
    }

    // Add prescription items
    foreach($data->items as $item) {
        if(!isset($item->product_id) || !isset($item->quantity) || !isset($item->directions)) {
            throw new Exception("Invalid item data");
        }

        $itemData = [
            'prescription_id' => $prescriptionId,
            'product_id' => $item->product_id,
            'quantity' => $item->quantity,
            'directions' => $item->directions
        ];

        if(!$prescriptionModel->addItem($itemData)) {
            throw new Exception("Failed to add prescription item");
        }
    }

    // Get created prescription with items
    $prescription = $prescriptionModel->getOne($prescriptionId);
    if(!$prescription) {
        throw new Exception("Failed to retrieve created prescription");
    }

    $db->commit();

    http_response_code(201);
    echo json_encode([
        "success" => true,
        "message" => "Prescription created successfully",
        "data" => $prescription
    ]);

} catch(Exception $e) {
    $db->rollBack();

    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}
