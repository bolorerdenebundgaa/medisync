<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once '../../config/Database.php';
include_once '../../models/Prescription.php';
include_once '../../models/Sale.php';
include_once '../../models/Settings.php';
include_once '../../middleware/AdminAuthMiddleware.php';

$database = new Database();
$db = $database->getConnection();

// Verify user is authenticated
$auth = new AdminAuthMiddleware($database);
$user = $auth->authenticate();
if(!$user) {
    exit;
}

// Get posted data
$data = json_decode(file_get_contents("php://input"));

// Validate required fields
if(!isset($data->id) || !isset($data->sale_id)) {
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
    $saleModel = new Sale($db);
    $settingsModel = new Settings($db);

    // Get prescription details
    $prescription = $prescriptionModel->getOne($data->id);
    if(!$prescription) {
        throw new Exception("Prescription not found");
    }

    // Verify prescription is active
    if($prescription['status'] !== 'active') {
        throw new Exception("Prescription is not active");
    }

    // Get sale details
    $sale = $saleModel->getOne($data->sale_id);
    if(!$sale) {
        throw new Exception("Sale not found");
    }

    // Update prescription status
    if(!$prescriptionModel->updateStatus($data->id, 'completed')) {
        throw new Exception("Failed to update prescription status");
    }

    // Link sale to prescription's referee
    if(!$saleModel->updateReferee($data->sale_id, $prescription['referee_id'])) {
        throw new Exception("Failed to update sale referee");
    }

    // Calculate and record referee commission
    $settings = $settingsModel->get();
    $commissionPercentage = $settings['referee_commission_percentage'];
    $commission = ($sale['total_amount'] * $commissionPercentage) / 100;

    if(!$saleModel->addRefereeCommission(
        $data->sale_id,
        $prescription['referee_id'],
        $commission,
        $commissionPercentage
    )) {
        throw new Exception("Failed to record referee commission");
    }

    // Get updated prescription with items
    $updatedPrescription = $prescriptionModel->getOne($data->id);

    $db->commit();

    http_response_code(200);
    echo json_encode([
        "success" => true,
        "message" => "Prescription completed successfully",
        "data" => $updatedPrescription
    ]);

} catch(Exception $e) {
    $db->rollBack();

    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}
