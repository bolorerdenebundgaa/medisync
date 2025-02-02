<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once '../../config/Database.php';
include_once '../../models/User.php';
include_once '../../middleware/AdminAuthMiddleware.php';

$database = new Database();
$db = $database->getConnection();

// Verify admin is authenticated
$auth = new AdminAuthMiddleware($database);
$user = $auth->authenticate();
if(!$user) {
    exit;
}

$userModel = new User($db);
$stmt = $userModel->readAllWithRoles();
$num = $stmt->rowCount();

if($num > 0) {
    $users = array();
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        // Get user roles
        $roles = $userModel->getUserRoles($row['id']);
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

        $item = array(
            "id" => $row['id'],
            "email" => $row['email'],
            "full_name" => $row['full_name'],
            "phone" => $row['phone'],
            "is_active" => (bool)$row['is_active'],
            "roles" => $userRoles,
            "created_at" => $row['created_at'],
            "updated_at" => $row['updated_at']
        );
        array_push($users, $item);
    }

    http_response_code(200);
    echo json_encode([
        "success" => true,
        "data" => $users
    ]);
} else {
    http_response_code(200);
    echo json_encode([
        "success" => true,
        "data" => []
    ]);
}
