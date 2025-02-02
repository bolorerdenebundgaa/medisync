<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once '../../config/Database.php';
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

// Get query parameters
$refereeId = isset($_GET['referee_id']) ? $_GET['referee_id'] : null;
$startDate = isset($_GET['start_date']) ? $_GET['start_date'] : null;
$endDate = isset($_GET['end_date']) ? $_GET['end_date'] : null;

// If user is referee, only show their own commission history
if($user['role'] === 'referee') {
    $refereeId = $user['id'];
}

// If user is not admin and not viewing their own history, deny access
if($user['role'] !== 'admin' && $refereeId !== $user['id']) {
    http_response_code(403);
    echo json_encode([
        "success" => false,
        "message" => "Access denied. You can only view your own commission history."
    ]);
    exit;
}

try {
    $settingsModel = new Settings($db);
    
    // Get commission history
    $history = $settingsModel->getCommissionHistory($refereeId, $startDate, $endDate);

    // Calculate totals
    $totals = [
        'total_sales' => 0,
        'total_commission' => 0,
        'pending_commission' => 0,
        'paid_commission' => 0
    ];

    foreach($history as $record) {
        $totals['total_sales'] += $record['sale_amount'];
        $totals['total_commission'] += $record['amount'];
        
        if($record['status'] === 'pending') {
            $totals['pending_commission'] += $record['amount'];
        } else if($record['status'] === 'paid') {
            $totals['paid_commission'] += $record['amount'];
        }
    }

    http_response_code(200);
    echo json_encode([
        "success" => true,
        "data" => [
            "history" => $history,
            "totals" => $totals
        ]
    ]);

} catch(Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}
