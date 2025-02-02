<?php
require_once '../../cors.php';
cors();

header("Content-Type: application/json; charset=UTF-8");

include_once '../../config/Database.php';
include_once '../../models/Admin.php';
include_once '../../middleware/AdminAuthMiddleware.php';

$database = new Database();
$db = $database->getConnection();

// Verify admin is authenticated
$auth = new AdminAuthMiddleware($database);
if(!$auth->authenticate()) {
    exit;
}

try {
    // Get active alerts
    $query = "SELECT sa.*, b.name as branch_name, p.name as product_name
              FROM stock_alerts sa
              JOIN branches b ON b.id = sa.branch_id
              JOIN products p ON p.id = sa.product_id
              WHERE sa.status = 'active'
              ORDER BY sa.created_at DESC";
    
    $stmt = $db->prepare($query);
    $stmt->execute();
    
    $alerts = [];
    while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $alerts[] = [
            'id' => $row['id'],
            'type' => $row['type'],
            'branch_id' => $row['branch_id'],
            'branch_name' => $row['branch_name'],
            'product_id' => $row['product_id'],
            'product_name' => $row['product_name'],
            'threshold' => intval($row['threshold']),
            'status' => $row['status'],
            'created_at' => $row['created_at']
        ];
    }
    
    http_response_code(200);
    echo json_encode([
        "success" => true,
        "data" => $alerts
    ]);
} catch(Exception $e) {
    error_log("Error getting alerts: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Error getting alerts"
    ]);
}