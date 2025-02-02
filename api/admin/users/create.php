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
if(!isset($data->email) || !isset($data->password) || !isset($data->full_name) || !isset($data->role_id)) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Missing required fields"
    ]);
    exit;
}

// Validate email format
if(!filter_var($data->email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Invalid email format"
    ]);
    exit;
}

// Validate branch_id if role is not admin
if($data->role_id !== 'admin' && !isset($data->branch_id)) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Branch ID is required for non-admin roles"
    ]);
    exit;
}

try {
    $db->beginTransaction();

    $userModel = new User($db);

    // Check if email already exists
    if($userModel->emailExists($data->email)) {
        throw new Exception("Email already exists");
    }

    // Create user
    $userModel->email = $data->email;
    $userModel->password = password_hash($data->password, PASSWORD_DEFAULT);
    $userModel->full_name = $data->full_name;
    $userModel->phone = $data->phone ?? null;
    $userModel->is_active = true;

    if(!$userModel->create()) {
        throw new Exception("Failed to create user");
    }

    // Assign role
    if(!$userModel->assignRole(
        $userModel->id,
        $data->role_id,
        $data->branch_id ?? null,
        $admin['id']
    )) {
        throw new Exception("Failed to assign role");
    }

    // Get created user with roles
    $stmt = $userModel->readOne($userModel->id);
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

    http_response_code(201);
    echo json_encode([
        "success" => true,
        "message" => "User created successfully",
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
