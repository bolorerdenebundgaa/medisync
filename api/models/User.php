<?php
class User {
    private $conn;
    private $table = "users";

    public $id;
    public $email;
    public $password;
    public $full_name;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function getAll() {
        $query = "SELECT u.id, u.email, u.full_name, 
                        r.name as role,
                        b.name as branch_name,
                        b.id as branch_id
                 FROM " . $this->table . " u
                 LEFT JOIN user_roles ur ON ur.user_id = u.id
                 LEFT JOIN roles r ON r.id = ur.role_id
                 LEFT JOIN branches b ON b.id = ur.branch_id
                 ORDER BY u.created_at DESC";
        
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        
        $users = [];
        while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $users[] = [
                'id' => $row['id'],
                'email' => $row['email'],
                'full_name' => $row['full_name'],
                'role' => $row['role'],
                'branch' => $row['branch_name'] ? [
                    'id' => $row['branch_id'],
                    'name' => $row['branch_name']
                ] : null
            ];
        }
        
        return $users;
    }

    public function updateRole($userId, $roleId, $branchId = null) {
        try {
            $this->conn->beginTransaction();

            // Remove existing roles
            $query = "DELETE FROM user_roles WHERE user_id = :user_id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":user_id", $userId);
            $stmt->execute();

            // Assign new role
            $query = "INSERT INTO user_roles (id, user_id, role_id, branch_id)
                     VALUES (UUID(), :user_id, :role_id, :branch_id)";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":user_id", $userId);
            $stmt->bindParam(":role_id", $roleId);
            $stmt->bindParam(":branch_id", $branchId);
            $stmt->execute();

            $this->conn->commit();
            return true;
        } catch(Exception $e) {
            $this->conn->rollBack();
            return false;
        }
    }

    public function delete($id) {
        $query = "DELETE FROM " . $this->table . " WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $id);
        return $stmt->execute();
    }
}