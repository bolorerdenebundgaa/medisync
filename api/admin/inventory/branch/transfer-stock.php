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

include_once '../../../config/Database.php';
include_once '../../../models/BranchInventory.php';
include_once '../../../middleware/AdminAuthMiddleware.php';

$database = new Database();
$db = $database->getConnection();

// Verify admin is authenticated
$auth = new AdminAuthMiddleware($database);
$user = $auth->authenticate();
if(!$user) {
    exit;
}

// Get posted data
$data = json_decode(file_get_contents("php://input"));

// Validate required fields
if(!isset($data->from_branch_id) || !isset($data->to_branch_id) || 
   !isset($data->product_id) || !isset($data->quantity)) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Missing required fields"
    ]);
    exit;
}

// Validate quantity
if($data->quantity <= 0) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Quantity must be greater than 0"
    ]);
    exit;
}

// Validate branches
if($data->from_branch_id === $data->to_branch_id) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Source and destination branches must be different"
    ]);
    exit;
}

try {
    $branchInventory = new BranchInventory($db);
    $branchInventory->branch_id = $data->from_branch_id;
    $branchInventory->product_id = $data->product_id;

    // Check current stock in source branch
    $currentStock = $branchInventory->getProductStock($data->from_branch_id, $data->product_id);
    if($currentStock < $data->quantity) {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Insufficient stock in source branch. Current stock: " . $currentStock
        ]);
        exit;
    }

    // Generate transfer reference ID
    $transferId = bin2hex(random_bytes(16));

    // Transfer stock
    if($branchInventory->transferStock(
        $data->to_branch_id,
        $data->quantity,
        $user['id'],
        $transferId,
        $data->notes ?? null
    )) {
        // Get updated inventory for both branches
        $sourceInventory = array();
        $stmt = $branchInventory->read($data->from_branch_id);
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
            array_push($sourceInventory, $item);
        }

        $destinationInventory = array();
        $stmt = $branchInventory->read($data->to_branch_id);
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
            array_push($destinationInventory, $item);
        }

        http_response_code(200);
        echo json_encode([
            "success" => true,
            "message" => "Stock transferred successfully",
            "data" => [
                "transfer_id" => $transferId,
                "source_inventory" => $sourceInventory,
                "destination_inventory" => $destinationInventory
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
