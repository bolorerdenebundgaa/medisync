<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: PUT");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once '../../config/Database.php';
include_once '../../models/Category.php';
include_once '../../middleware/AdminAuthMiddleware.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    // Verify admin is authenticated
    $auth = new AdminAuthMiddleware($database);
    if(!$auth->authenticate()) {
        exit;
    }

    $category = new Category($db);
    $data = json_decode(file_get_contents("php://input"));

    if(!empty($data->id) && !empty($data->name)) {
        $category->id = $data->id;
        $category->name = $data->name;
        $category->description = $data->description ?? null;
        $category->parent_id = $data->parent_id ?? null;
        
        if($category->update()) {
            http_response_code(200);
            echo json_encode([
                "success" => true,
                "message" => "Category updated successfully"
            ]);
        } else {
            throw new Exception("Unable to update category");
        }
    } else {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "ID and name are required"
        ]);
    }
} catch(Exception $e) {
    error_log("Error updating category: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}