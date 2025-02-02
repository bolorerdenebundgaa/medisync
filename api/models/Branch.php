<?php
class Branch {
    private $conn;
    private $table = "branches";

    public function __construct($db) {
        $this->conn = $db;
    }

    public function getAll() {
        try {
            // First check if table exists
            $checkTable = "SHOW TABLES LIKE '" . $this->table . "'";
            $stmt = $this->conn->prepare($checkTable);
            $stmt->execute();
            
            if ($stmt->rowCount() === 0) {
                // Create table if it doesn't exist
                $createTable = "CREATE TABLE IF NOT EXISTS " . $this->table . " (
                    id VARCHAR(32) PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    location VARCHAR(255) NOT NULL,
                    is_ecommerce_base BOOLEAN DEFAULT FALSE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
                
                $this->conn->exec($createTable);
                
                // Add initial branch
                $initialBranch = "INSERT INTO " . $this->table . " 
                    (id, name, location, is_ecommerce_base) 
                    VALUES ('main-branch-001', 'Main Branch', 'Main Location', TRUE)";
                $this->conn->exec($initialBranch);
            }
            
            $query = "SELECT * FROM " . $this->table . " ORDER BY name";
            $stmt = $this->conn->prepare($query);
            
            $stmt->execute();
            
            $branches = [];
            while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $branches[] = [
                    'id' => $row['id'],
                    'name' => $row['name'],
                    'location' => $row['location'],
                    'is_ecommerce_base' => (bool)$row['is_ecommerce_base']
                ];
            }
            
            return $branches;
        } catch(Exception $e) {
            throw $e;
        }
    }

    public function create($name, $location) {
        try {
            $id = bin2hex(random_bytes(16));
            $query = "INSERT INTO " . $this->table . " (id, name, location) VALUES (:id, :name, :location)";
            
            $stmt = $this->conn->prepare($query);
            
            $stmt->bindParam(":id", $id);
            $stmt->bindParam(":name", $name);
            $stmt->bindParam(":location", $location);
            
            error_log("Creating branch with ID: " . $id);
            error_log("Query: " . $query);
            
            return $stmt->execute();
        } catch(Exception $e) {
            error_log("Error creating branch: " . $e->getMessage());
            throw $e;
        }
    }

    public function update($id, $name, $location) {
        try {
            $query = "UPDATE " . $this->table . "
                    SET name = :name,
                        location = :location
                    WHERE id = :id";
            
            $stmt = $this->conn->prepare($query);
            
            $stmt->bindParam(":name", $name);
            $stmt->bindParam(":location", $location);
            $stmt->bindParam(":id", $id);
            
            return $stmt->execute();
        } catch(Exception $e) {
            error_log("Error updating branch: " . $e->getMessage());
            throw $e;
        }
    }

    public function delete($id) {
        try {
            // Check if branch is ecommerce base
            $query = "SELECT is_ecommerce_base FROM " . $this->table . " WHERE id = :id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":id", $id);
            $stmt->execute();
            
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            if($row['is_ecommerce_base']) {
                return false;
            }
            
            $query = "DELETE FROM " . $this->table . " WHERE id = :id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":id", $id);
            return $stmt->execute();
        } catch(Exception $e) {
            error_log("Error deleting branch: " . $e->getMessage());
            throw $e;
        }
    }

    public function setEcommerceBase($id) {
        try {
            $this->conn->beginTransaction();

            // Reset all branches
            $query = "UPDATE " . $this->table . " SET is_ecommerce_base = FALSE";
            $stmt = $this->conn->prepare($query);
            $stmt->execute();

            // Set new ecommerce base
            $query = "UPDATE " . $this->table . "
                    SET is_ecommerce_base = TRUE
                    WHERE id = :id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":id", $id);
            $stmt->execute();

            $this->conn->commit();
            return true;
        } catch(Exception $e) {
            $this->conn->rollBack();
            error_log("Error setting ecommerce base: " . $e->getMessage());
            throw $e;
        }
    }
}