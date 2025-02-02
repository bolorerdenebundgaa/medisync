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

// Get URL parameters
$branchId = isset($_GET['branch_id']) ? $_GET['branch_id'] : null;
$productId = isset($_GET['product_id']) ? $_GET['product_id'] : null;
$startDate = isset($_GET['start_date']) ? $_GET['start_date'] : null;
$endDate = isset($_GET['end_date']) ? $_GET['end_date'] : null;

if(!$branchId) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Branch ID is required"
    ]);
    exit;
}

try {
    $branchInventory = new BranchInventory($db);
    $stmt = $branchInventory->getTransactionHistory($branchId, $productId, $startDate, $endDate);
    $num = $stmt->rowCount();

    if($num > 0) {
        $transactions = array();
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $transaction = array(
                "id" => $row['id'],
                "branch_id" => $row['branch_id'],
                "product_id" => $row['product_id'],
                "product_name" => $row['product_name'],
                "transaction_type" => $row['transaction_type'],
                "quantity" => (int)$row['quantity'],
                "reference_type" => $row['reference_type'],
                "reference_id" => $row['reference_id'],
                "notes" => $row['notes'],
                "created_by" => $row['created_by'],
                "created_by_name" => $row['created_by_name'],
                "created_at" => $row['created_at']
            );
            array_push($transactions, $transaction);
        }

        // Get current inventory status
        $currentInventory = array();
        $stmt = $branchInventory->read($branchId);
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            if(!$productId || $row['product_id'] === $productId) {
                $item = array(
                    "id" => $row['id'],
                    "branch_id" => $row['branch_id'],
                    "product_id" => $row['product_id'],
                    "product_name" => $row['product_name'],
                    "price" => (float)$row['price'],
                    "quantity" => (int)$row['quantity'],
                    "min_quantity" => (int)$row['min_quantity'],
                    "max_quantity" => (int)$row['max_quantity'],
                    "reorder_point" => (int)$row['reorder_point']
                );
                array_push($currentInventory, $item);
            }
        }

        http_response_code(200);
        echo json_encode([
            "success" => true,
            "data" => [
                "transactions" => $transactions,
                "current_inventory" => $currentInventory
            ]
        ]);
    } else {
        http_response_code(200);
        echo json_encode([
            "success" => true,
            "data" => [
                "transactions" => [],
                "current_inventory" => []
            ]
        ]);
    }
} catch(Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}
