<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once '../config/Database.php';
include_once '../models/WebUser.php';

$database = new Database();
$db = $database->getConnection();

// Get authorization header
$headers = getallheaders();
$auth = isset($headers['Authorization']) ? $headers['Authorization'] : '';

if(empty($auth)) {
    http_response_code(401);
    echo json_encode([
        "success" => false,
        "message" => "No authorization token provided"
    ]);
    exit;
}

// Extract token
$token = str_replace('Bearer ', '', $auth);

try {
    $user = new WebUser($db);
    $userData = $user->getUserByToken($token);
    
    if(!$userData) {
        http_response_code(401);
        echo json_encode([
            "success" => false,
            "message" => "Invalid or expired token"
        ]);
        exit;
    }

    // Get orders for user
    $query = "SELECT o.*, 
                     GROUP_CONCAT(JSON_OBJECT(
                         'name', p.name,
                         'quantity', oi.quantity,
                         'price', oi.price
                     )) as items
              FROM online_orders o
              LEFT JOIN online_order_items oi ON oi.order_id = o.id
              LEFT JOIN products p ON p.id = oi.product_id
              WHERE o.customer_id = :user_id
              GROUP BY o.id
              ORDER BY o.created_at DESC";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(":user_id", $userData['id']);
    $stmt->execute();
    
    $orders = [];
    while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $row['items'] = json_decode('[' . $row['items'] . ']');
        $orders[] = $row;
    }

    http_response_code(200);
    echo json_encode([
        "success" => true,
        "data" => $orders
    ]);
} catch(Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Error retrieving orders"
    ]);
}