<?php
class Branch {
    private $conn;
    private $table = "branches";

    public $id;
    public $name;
    public $address;
    public $phone;
    public $email;
    public $created_at;
    public $updated_at;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function read() {
        $query = "SELECT * FROM " . $this->table . " ORDER BY name ASC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    public function readUserBranches($userId) {
        $query = "SELECT b.* FROM " . $this->table . " b
                 INNER JOIN branch_users bu ON b.id = bu.branch_id
                 WHERE bu.user_id = :user_id AND bu.is_active = 1
                 ORDER BY b.name ASC";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":user_id", $userId);
        $stmt->execute();
        return $stmt;
    }

    public function create() {
        try {
            $this->conn->beginTransaction();

            // Generate UUID
            $id = bin2hex(random_bytes(16));

            $query = "INSERT INTO " . $this->table . "
                    SET id = :id,
                        name = :name,
                        address = :address,
                        phone = :phone,
                        email = :email";

            $stmt = $this->conn->prepare($query);

            // Clean data
            $this->name = htmlspecialchars(strip_tags($this->name));
            $this->address = htmlspecialchars(strip_tags($this->address));
            $this->phone = htmlspecialchars(strip_tags($this->phone));
            $this->email = htmlspecialchars(strip_tags($this->email));

            // Bind data
            $stmt->bindParam(":id", $id);
            $stmt->bindParam(":name", $this->name);
            $stmt->bindParam(":address", $this->address);
            $stmt->bindParam(":phone", $this->phone);
            $stmt->bindParam(":email", $this->email);

            if(!$stmt->execute()) {
                throw new Exception("Failed to create branch");
            }

            $this->conn->commit();
            $this->id = $id;
            return true;
        } catch(Exception $e) {
            $this->conn->rollBack();
            throw $e;
        }
    }

    public function update() {
        $query = "UPDATE " . $this->table . "
                SET name = :name,
                    address = :address,
                    phone = :phone,
                    email = :email
                WHERE id = :id";

        $stmt = $this->conn->prepare($query);

        // Clean data
        $this->name = htmlspecialchars(strip_tags($this->name));
        $this->address = htmlspecialchars(strip_tags($this->address));
        $this->phone = htmlspecialchars(strip_tags($this->phone));
        $this->email = htmlspecialchars(strip_tags($this->email));

        // Bind data
        $stmt->bindParam(":name", $this->name);
        $stmt->bindParam(":address", $this->address);
        $stmt->bindParam(":phone", $this->phone);
        $stmt->bindParam(":email", $this->email);
        $stmt->bindParam(":id", $this->id);

        return $stmt->execute();
    }

    public function delete() {
        // Check if branch has any active users
        $query = "SELECT COUNT(*) as count FROM branch_users WHERE branch_id = :id AND is_active = 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $this->id);
        $stmt->execute();
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if($row['count'] > 0) {
            throw new Exception("Cannot delete branch with active users");
        }

        // Check if branch has any inventory
        $query = "SELECT COUNT(*) as count FROM branch_inventory WHERE branch_id = :id AND quantity > 0";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $this->id);
        $stmt->execute();
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if($row['count'] > 0) {
            throw new Exception("Cannot delete branch with existing inventory");
        }

        $query = "DELETE FROM " . $this->table . " WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $this->id);
        return $stmt->execute();
    }

    public function addUser($userId, $roleId) {
        try {
            $this->conn->beginTransaction();

            // Check if user already has a role in this branch
            $query = "SELECT id FROM branch_users 
                    WHERE branch_id = :branch_id 
                    AND user_id = :user_id 
                    AND role_id = :role_id";
            
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":branch_id", $this->id);
            $stmt->bindParam(":user_id", $userId);
            $stmt->bindParam(":role_id", $roleId);
            $stmt->execute();

            if($stmt->rowCount() > 0) {
                // Update existing record
                $query = "UPDATE branch_users 
                        SET is_active = 1 
                        WHERE branch_id = :branch_id 
                        AND user_id = :user_id 
                        AND role_id = :role_id";
            } else {
                // Create new record
                $query = "INSERT INTO branch_users 
                        SET branch_id = :branch_id,
                            user_id = :user_id,
                            role_id = :role_id,
                            is_active = 1";
            }

            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":branch_id", $this->id);
            $stmt->bindParam(":user_id", $userId);
            $stmt->bindParam(":role_id", $roleId);

            if(!$stmt->execute()) {
                throw new Exception("Failed to add user to branch");
            }

            $this->conn->commit();
            return true;
        } catch(Exception $e) {
            $this->conn->rollBack();
            throw $e;
        }
    }

    public function removeUser($userId, $roleId) {
        $query = "UPDATE branch_users 
                SET is_active = 0 
                WHERE branch_id = :branch_id 
                AND user_id = :user_id 
                AND role_id = :role_id";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":branch_id", $this->id);
        $stmt->bindParam(":user_id", $userId);
        $stmt->bindParam(":role_id", $roleId);
        return $stmt->execute();
    }

    public function getBranchUsers() {
        $query = "SELECT bu.*, u.email, u.full_name, r.name as role_name
                FROM branch_users bu
                INNER JOIN users u ON bu.user_id = u.id
                INNER JOIN roles r ON bu.role_id = r.id
                WHERE bu.branch_id = :branch_id AND bu.is_active = 1";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":branch_id", $this->id);
        $stmt->execute();
        return $stmt;
    }
}
