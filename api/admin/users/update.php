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

include_once '../../config/Database.php';
include_once '../../models/User.php';
include_once '../../middleware/AdminAuthMiddleware.php';

$database = new Database();
$db = $database->getConnection();

// Verify admin is authenticated
$auth = new AdminAuthMiddleware($database);
$admin = $auth->authenticate();
if(!$admin) {
    exit;
}

// Get posted data
$data = json_decode(file_get_contents("php://input"));

// Validate required fields
if(!isset($data->id) || !isset($data->updates)) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Missing required fields"
    ]);
    exit;
}

try {
    $db->beginTransaction();

    $userModel = new User($db);

    // Check if user exists
    $stmt = $userModel->readOne($data->id);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if(!$user) {
        throw new Exception("User not found");
    }

    // Update user fields
    $updates = array();

    if(isset($data->updates->email)) {
        // Validate email format
        if(!filter_var($data->updates->email, FILTER_VALIDATE_EMAIL)) {
            throw new Exception("Invalid email format");
        }

        // Check if email is already taken by another user
        if($data->updates->email !== $user['email'] && $userModel->emailExists($data->updates->email)) {
            throw new Exception("Email already exists");
        }

        $updates['email'] = $data->updates->email;
    }

    if(isset($data->updates->full_name)) {
        $updates['full_name'] = $data->updates->full_name;
    }

    if(isset($data->updates->phone)) {
        $updates['phone'] = $data->updates->phone;
    }

    if(isset($data->updates->is_active)) {
        $updates['is_active'] = (bool)$data->updates->is_active;
    }

    // Update user if there are changes
    if(!empty($updates)) {
        if(!$userModel->update($data->id, $updates)) {
            throw new Exception("Failed to update user");
        }
    }

    // Get updated user with roles
    $stmt = $userModel->readOne($data->id);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    // Get user roles
    $roles = $userModel->getUserRoles($user['id']);
    $userRoles = array();
    while($roleRow = $roles->fetch(PDO::FETCH_ASSOC)) {
        $userRoles[] = array(
            "role_id" => $roleRow['role_id'],
            "role_name" => $roleRow['role_name'],
            "branch_id" => $roleRow['branch_id'],
            "branch_name" => $roleRow['branch_name'],
            "assigned_at" => $roleRow['assigned_at'],
            "assigned_by" => $roleRow['assigned_by'],
            "is_active" => (bool)$roleRow['is_active']
        );
    }

    $user['roles'] = $userRoles;
    $user['is_active'] = (bool)$user['is_active'];

    $db->commit();

    http_response_code(200);
    echo json_encode([
        "success" => true,
        "message" => "User updated successfully",
        "data" => [$user]
    ]);

} catch(Exception $e) {
    $db->rollBack();

    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}
