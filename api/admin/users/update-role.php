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
if(!isset($data->user_id) || !isset($data->role_updates)) {
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

    // Remove roles
    if(isset($data->role_updates->remove) && is_array($data->role_updates->remove)) {
        foreach($data->role_updates->remove as $role) {
            if(!isset($role->role_id)) {
                throw new Exception("Invalid role data in remove array");
            }

            if(!$userModel->removeRole(
                $data->user_id,
                $role->role_id,
                $role->branch_id ?? null
            )) {
                throw new Exception("Failed to remove role");
            }
        }
    }

    // Add roles
    if(isset($data->role_updates->add) && is_array($data->role_updates->add)) {
        foreach($data->role_updates->add as $role) {
            if(!isset($role->role_id)) {
                throw new Exception("Invalid role data in add array");
            }

            // Validate branch_id if role is not admin
            if($role->role_id !== 'admin' && !isset($role->branch_id)) {
                throw new Exception("Branch ID is required for non-admin roles");
            }

            if(!$userModel->assignRole(
                $data->user_id,
                $role->role_id,
                $role->branch_id ?? null,
                $admin['id']
            )) {
                throw new Exception("Failed to assign role");
            }
        }
    }

    // Get updated user with roles
    $stmt = $userModel->readOne($data->user_id);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if(!$user) {
        throw new Exception("User not found");
    }

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
        "message" => "User roles updated successfully",
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
