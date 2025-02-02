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
if(!isset($data->branch_id) || !isset($data->product_id) || !isset($data->quantity)) {
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

try {
    $branchInventory = new BranchInventory($db);
    $branchInventory->branch_id = $data->branch_id;
    $branchInventory->product_id = $data->product_id;

    // Set optional inventory control values if provided
    if(isset($data->min_quantity)) {
        $branchInventory->min_quantity = $data->min_quantity;
    }
    if(isset($data->max_quantity)) {
        $branchInventory->max_quantity = $data->max_quantity;
    }
    if(isset($data->reorder_point)) {
        $branchInventory->reorder_point = $data->reorder_point;
    }

    // Add stock
    if($branchInventory->addStock(
        $data->quantity,
        $user['id'],
        $data->reference_type ?? 'manual',
        $data->reference_id ?? bin2hex(random_bytes(16)),
        $data->notes ?? null
    )) {
        // Get updated inventory
        $stmt = $branchInventory->read($data->branch_id);
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
            "message" => "Stock added successfully",
            "data" => $inventory
        ]);
    }
} catch(Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}
