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
    // Get batch operations
    $query = "SELECT bo.*, b.name as branch_name
              FROM batch_operations bo
              LEFT JOIN branches b ON b.id = bo.branch_id
              ORDER BY bo.created_at DESC";
    
    $stmt = $db->prepare($query);
    $stmt->execute();
    
    $operations = [];
    while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        // Get items for each operation
        $itemsQuery = "SELECT boi.*, p.name as product_name
                      FROM batch_operation_items boi
                      JOIN products p ON p.id = boi.product_id
                      WHERE boi.operation_id = :operation_id";
        
        $itemsStmt = $db->prepare($itemsQuery);
        $itemsStmt->bindParam(":operation_id", $row['id']);
        $itemsStmt->execute();
        
        $items = [];
        while($itemRow = $itemsStmt->fetch(PDO::FETCH_ASSOC)) {
            $items[] = [
                'product_id' => $itemRow['product_id'],
                'product_name' => $itemRow['product_name'],
                'current_quantity' => intval($itemRow['current_quantity']),
                'new_quantity' => intval($itemRow['new_quantity']),
                'reason' => $itemRow['reason']
            ];
        }
        
        $operations[] = [
            'id' => $row['id'],
            'type' => $row['type'],
            'status' => $row['status'],
            'branch_id' => $row['branch_id'],
            'branch_name' => $row['branch_name'],
            'notes' => $row['notes'],
            'items' => $items,
            'created_at' => $row['created_at']
        ];
    }
    
    http_response_code(200);
    echo json_encode([
        "success" => true,
        "data" => $operations
    ]);
} catch(Exception $e) {
    error_log("Error getting batch operations: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Error getting batch operations"
    ]);
}