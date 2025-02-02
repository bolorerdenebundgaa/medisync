<?php
class Role {
    private $conn;
    private $table = "roles";

    public function __construct($db) {
        $this->conn = $db;
    }

    public function createDefaultRoles() {
        try {
            $this->conn->beginTransaction();

            // Create roles with unique UUIDs
            $roles = [
                ['name' => 'admin', 'description' => 'Administrator with full access'],
                ['name' => 'sales', 'description' => 'Sales staff with POS access'],
                ['name' => 'referee', 'description' => 'Referee with referral tracking']
            ];

            foreach ($roles as $role) {
                $id = $this->conn->generateUUID();
                $query = "INSERT INTO " . $this->table . " 
                         (id, name, description) 
                         VALUES (:id, :name, :description)
                         ON DUPLICATE KEY UPDATE
                         description = VALUES(description)";
                
                $stmt = $this->conn->prepare($query);
                $stmt->bindParam(":id", $id);
                $stmt->bindParam(":name", $role['name']);
                $stmt->bindParam(":description", $role['description']);
                $stmt->execute();
            }

            $this->conn->commit();
            return true;
        } catch(Exception $e) {
            $this->conn->rollBack();
            error_log("Error creating default roles: " . $e->getMessage());
            return false;
        }
    }

    public function getRoleByName($name) {
        $query = "SELECT * FROM " . $this->table . " WHERE name = :name LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":name", $name);
        $stmt->execute();
        
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
}