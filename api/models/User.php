<?php
class User {
    private $conn;
    private $table_name = "users";

    // Object properties
    public $id;
    public $email;
    public $password;
    public $full_name;
    public $phone;
    public $is_active;
    public $created_at;
    public $updated_at;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function readAllWithRoles() {
        $query = "SELECT * FROM " . $this->table_name . " ORDER BY created_at DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    public function readOne($id) {
        $query = "SELECT * FROM " . $this->table_name . " WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $id);
        $stmt->execute();
        return $stmt;
    }

    public function getUserRoles($userId) {
        $query = "SELECT 
                    ur.role_id,
                    r.name as role_name,
                    ur.branch_id,
                    b.name as branch_name,
                    ur.assigned_at,
                    u.full_name as assigned_by,
                    ur.is_active
                FROM user_roles ur
                LEFT JOIN roles r ON ur.role_id = r.id
                LEFT JOIN branches b ON ur.branch_id = b.id
                LEFT JOIN users u ON ur.assigned_by = u.id
                WHERE ur.user_id = ?
                ORDER BY ur.assigned_at DESC";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $userId);
        $stmt->execute();
        return $stmt;
    }

    public function create() {
        $this->id = $this->generateUUID();
        
        $query = "INSERT INTO " . $this->table_name . "
                SET id = :id,
                    email = :email,
                    password = :password,
                    full_name = :full_name,
                    phone = :phone,
                    is_active = :is_active";

        $stmt = $this->conn->prepare($query);

        // Sanitize and bind
        $stmt->bindParam(":id", $this->id);
        $stmt->bindParam(":email", $this->email);
        $stmt->bindParam(":password", $this->password);
        $stmt->bindParam(":full_name", $this->full_name);
        $stmt->bindParam(":phone", $this->phone);
        $stmt->bindParam(":is_active", $this->is_active);

        return $stmt->execute();
    }

    public function update($id, $updates) {
        $setStatements = [];
        $params = [":id" => $id];

        foreach ($updates as $key => $value) {
            if (in_array($key, ['email', 'full_name', 'phone', 'is_active'])) {
                $setStatements[] = "$key = :$key";
                $params[":$key"] = $value;
            }
        }

        if (empty($setStatements)) {
            return false;
        }

        $query = "UPDATE " . $this->table_name . "
                SET " . implode(", ", $setStatements) . "
                WHERE id = :id";

        $stmt = $this->conn->prepare($query);
        return $stmt->execute($params);
    }

    public function updatePassword($id, $hashedPassword) {
        $query = "UPDATE " . $this->table_name . "
                SET password = :password
                WHERE id = :id";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":password", $hashedPassword);
        $stmt->bindParam(":id", $id);

        return $stmt->execute();
    }

    public function assignRole($userId, $roleId, $branchId = null, $assignedBy) {
        $query = "INSERT INTO user_roles
                SET id = :id,
                    user_id = :user_id,
                    role_id = :role_id,
                    branch_id = :branch_id,
                    assigned_by = :assigned_by,
                    is_active = true";

        $stmt = $this->conn->prepare($query);

        $id = $this->generateUUID();
        $stmt->bindParam(":id", $id);
        $stmt->bindParam(":user_id", $userId);
        $stmt->bindParam(":role_id", $roleId);
        $stmt->bindParam(":branch_id", $branchId);
        $stmt->bindParam(":assigned_by", $assignedBy);

        return $stmt->execute();
    }

    public function removeRole($userId, $roleId, $branchId = null) {
        $query = "DELETE FROM user_roles 
                WHERE user_id = :user_id 
                AND role_id = :role_id";
        
        $params = [
            ":user_id" => $userId,
            ":role_id" => $roleId
        ];

        if ($branchId !== null) {
            $query .= " AND branch_id = :branch_id";
            $params[":branch_id"] = $branchId;
        } else {
            $query .= " AND branch_id IS NULL";
        }

        $stmt = $this->conn->prepare($query);
        return $stmt->execute($params);
    }

    public function logPasswordReset($userId, $resetBy) {
        $query = "INSERT INTO password_reset_logs
                SET id = :id,
                    user_id = :user_id,
                    reset_by = :reset_by";

        $stmt = $this->conn->prepare($query);

        $id = $this->generateUUID();
        $stmt->bindParam(":id", $id);
        $stmt->bindParam(":user_id", $userId);
        $stmt->bindParam(":reset_by", $resetBy);

        return $stmt->execute();
    }

    public function emailExists($email) {
        $query = "SELECT id FROM " . $this->table_name . " WHERE email = ? LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $email);
        $stmt->execute();
        return $stmt->rowCount() > 0;
    }

    private function generateUUID() {
        return sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
            mt_rand(0, 0xffff), mt_rand(0, 0xffff),
            mt_rand(0, 0xffff),
            mt_rand(0, 0x0fff) | 0x4000,
            mt_rand(0, 0x3fff) | 0x8000,
            mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
        );
    }
}
