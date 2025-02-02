<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Access-Control-Max-Age: 3600");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once '../config/Database.php';
include_once '../models/WebUser.php';

$database = new Database();
$db = $database->getConnection();
$user = new WebUser($db);

$data = json_decode(file_get_contents("php://input"));

if(!empty($data->email) && !empty($data->password) && !empty($data->full_name)) {
    $user->email = $data->email;
    $user->password = $data->password;
    $user->full_name = $data->full_name;
    
    // Check if email already exists
    $query = "SELECT id FROM web_users WHERE email = :email";
    $stmt = $db->prepare($query);
    $stmt->bindParam(":email", $data->email);
    $stmt->execute();
    
    if($stmt->rowCount() > 0) {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Email already exists"
        ]);
        exit;
    }

    if($user->register()) {
        // Login the user after registration
        $user->email = $data->email;
        $user->password = $data->password;
        $result = $user->login();
        
        error_log("Registration successful for: " . $data->email);

        if($result) {
            http_response_code(201);
            echo json_encode([
                "success" => true,
                "message" => "Registration successful",
                "data" => [
                    "id" => $result['id'],
                    "email" => $result['email'],
                    "full_name" => $result['full_name'],
                    "token" => $result['token']
                ]
            ]);
        } else {
            http_response_code(503);
            echo json_encode([
                "success" => false,
                "message" => "Unable to login after registration"
            ]);
        }
    } else {
        error_log("Registration failed for: " . $data->email);
        http_response_code(503);
        echo json_encode([
            "success" => false,
            "message" => "Unable to register. Email may already be taken."
        ]);
    }
} else {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Email, password and full name are required"
    ]);
}