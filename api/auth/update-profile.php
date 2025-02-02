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

    $data = json_decode(file_get_contents("php://input"));

    if(!empty($data->full_name)) {
        $query = "UPDATE web_users
                 SET full_name = :full_name,
                     phone = :phone,
                     shipping_address = :shipping_address,
                     updated_at = NOW()
                 WHERE id = :id";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(":full_name", $data->full_name);
        $stmt->bindParam(":phone", $data->phone);
        $stmt->bindParam(":shipping_address", $data->shipping_address);
        $stmt->bindParam(":id", $userData['id']);
        
        if($stmt->execute()) {
            http_response_code(200);
            echo json_encode([
                "success" => true,
                "message" => "Profile updated successfully"
            ]);
        } else {
            throw new Exception("Failed to update profile");
        }
    } else {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Full name is required"
        ]);
    }
} catch(Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Error updating profile"
    ]);
}