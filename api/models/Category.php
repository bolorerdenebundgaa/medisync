<?php
class Category {
    private $conn;
    private $table = "categories";

    public $id;
    public $name;
    public $description;
    public $parent_id;
    public $created_at;
    public $updated_at;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function getAll() {
        $query = "SELECT * FROM " . $this->table . " ORDER BY name";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    public function create() {
        try {
            $id = bin2hex(random_bytes(16));
            $query = "INSERT INTO " . $this->table . "
                    SET id = :id,
                        name = :name,
                        description = :description,
                        parent_id = :parent_id";
            
            $stmt = $this->conn->prepare($query);
            
            $stmt->bindParam(":id", $id);
            $stmt->bindParam(":name", $this->name);
            $stmt->bindParam(":description", $this->description);
            $stmt->bindParam(":parent_id", $this->parent_id);
            
            return $stmt->execute();
        } catch(Exception $e) {
            return false;
        }
    }

    public function update() {
        $query = "UPDATE " . $this->table . "
                SET name = :name,
                    description = :description,
                    parent_id = :parent_id,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = :id";
        
        $stmt = $this->conn->prepare($query);
        
        $stmt->bindParam(":name", $this->name);
        $stmt->bindParam(":description", $this->description);
        $stmt->bindParam(":parent_id", $this->parent_id);
        $stmt->bindParam(":id", $this->id);
        
        return $stmt->execute();
    }

    public function delete() {
        try {
            $this->conn->beginTransaction();

            // First update any products using this category
            $query = "UPDATE products SET category_id = NULL WHERE category_id = :id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":id", $this->id);
            $stmt->execute();

            // Then delete the category
            $query = "DELETE FROM " . $this->table . " WHERE id = :id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":id", $this->id);
            $result = $stmt->execute();

            $this->conn->commit();
            return $result;
        } catch(Exception $e) {
            $this->conn->rollBack();
            return false;
        }
    }
}