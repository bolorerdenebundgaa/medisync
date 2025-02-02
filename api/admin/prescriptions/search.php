<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once '../../config/Database.php';
include_once '../../models/Prescription.php';
include_once '../../middleware/AdminAuthMiddleware.php';

$database = new Database();
$db = $database->getConnection();

// Verify user is authenticated
$auth = new AdminAuthMiddleware($database);
$user = $auth->authenticate();
if(!$user) {
    exit;
}

// Get search parameters
$params = array();

// Client ID
if(isset($_GET['client_id'])) {
    $params['client_id'] = $_GET['client_id'];
}

// Referee ID - If user is referee, only show their prescriptions
if($user['role'] === 'referee') {
    $params['referee_id'] = $user['id'];
} elseif(isset($_GET['referee_id'])) {
    $params['referee_id'] = $_GET['referee_id'];
}

// Branch ID - If user is not admin, only show prescriptions from their branch
if($user['role'] !== 'admin') {
    $params['branch_id'] = $user['branch_id'];
} elseif(isset($_GET['branch_id'])) {
    $params['branch_id'] = $_GET['branch_id'];
}

// Status
if(isset($_GET['status']) && in_array($_GET['status'], ['active', 'completed', 'cancelled'])) {
    $params['status'] = $_GET['status'];
}

// Date range
if(isset($_GET['start_date'])) {
    $params['start_date'] = $_GET['start_date'];
}
if(isset($_GET['end_date'])) {
    $params['end_date'] = $_GET['end_date'];
}

try {
    $prescriptionModel = new Prescription($db);
    $prescriptions = $prescriptionModel->search($params);

    // For each prescription, get its items
    foreach($prescriptions as &$prescription) {
        $details = $prescriptionModel->getOne($prescription['id']);
        $prescription['items'] = $details['items'];
    }

    http_response_code(200);
    echo json_encode([
        "success" => true,
        "data" => $prescriptions
    ]);

} catch(Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}
