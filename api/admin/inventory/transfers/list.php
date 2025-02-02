<?php
require_once '../../../cors.php';
cors();

header("Content-Type: application/json; charset=UTF-8");

include_once '../../../config/Database.php';
include_once '../../../models/Admin.php';
include_once '../../../middleware/AdminAuthMiddleware.php';

$database = new Database();
$db = $database->getConnection();

// Verify admin is authenticated
$auth = new AdminAuthMiddleware($database);
if(!$auth->authenticate()) {
    exit;
}

try {
    // Get transfers
    $query = "SELECT t.*, 
                     fb.name as from_branch_name,
                     tb.name as to_branch_name,
                     p.name as product_name
              FROM inventory_transfers t
              JOIN branches fb ON fb.id = t.from_branch_id
              JOIN branches tb ON tb.id = t.to_branch_id
              JOIN products p ON p.id = t.product_id
              ORDER BY t.created_at DESC";
    
    $stmt = $db->prepare($query);
    $stmt->execute();
    
    $transfers = [];
    while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $transfers[] = [
            'id' => $row['id'],
            'from_branch' => [
                'id' => $row['from_branch_id'],
                'name' => $row['from_branch_name']
            ],
            'to_branch' => [
                'id' => $row['to_branch_id'],
                'name' => $row['to_branch_name']
            ],
            'product' => [
                'id' => $row['product_id'],
                'name' => $row['product_name']
            ],
            'quantity' => intval($row['quantity']),
            'status' => $row['status'],
            'notes' => $row['notes'],
            'created_at' => $row['created_at']
        ];
    }
    
    http_response_code(200);
    echo json_encode([
        "success" => true,
        "data" => $transfers
    ]);
} catch(Exception $e) {
    error_log("Error getting transfers: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Error getting transfers"
    ]);
}