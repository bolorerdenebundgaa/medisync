<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once '../../../config/Database.php';
include_once '../../../models/BranchInventory.php';
include_once '../../../middleware/AdminAuthMiddleware.php';

$database = new Database();
$db = $database->getConnection();

// Verify admin is authenticated
$auth = new AdminAuthMiddleware($database);
if(!$auth->authenticate()) {
    exit;
}

// Get branch ID from URL parameter
$branchId = isset($_GET['branch_id']) ? $_GET['branch_id'] : null;

if(!$branchId) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Branch ID is required"
    ]);
    exit;
}

$branchInventory = new BranchInventory($db);
$stmt = $branchInventory->read($branchId);
$num = $stmt->rowCount();

if($num > 0) {
    $inventory = array();
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $item = array(
            "id" => $row['id'],
            "branch_id" => $row['branch_id'],
            "product_id" => $row['product_id'],
            "product_name" => $row['product_name'],
            "price" => (float)$row['price'],
            "quantity" => (int)$row['quantity'],
            "min_quantity" => (int)$row['min_quantity'],
            "max_quantity" => (int)$row['max_quantity'],
            "reorder_point" => (int)$row['reorder_point'],
            "created_at" => $row['created_at'],
            "updated_at" => $row['updated_at']
        );
        array_push($inventory, $item);
    }

    http_response_code(200);
    echo json_encode([
        "success" => true,
        "data" => $inventory
    ]);
} else {
    http_response_code(200);
    echo json_encode([
        "success" => true,
        "data" => []
    ]);
}
