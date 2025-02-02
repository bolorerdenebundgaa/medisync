<?php
class Inventory {
    private $conn;
    private $table = "branch_inventory";

    public $branch_id;
    public $product_id;
    public $quantity;
    public $min_quantity;
    public $max_quantity;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function adjustStock($quantity_change, $reason = null) {
        $this->conn->beginTransaction();
        try {
            // Record adjustment
            $query = "INSERT INTO inventory_adjustments
                    SET id = :id,
                        branch_id = :branch_id,
                        product_id = :product_id,
                        quantity_change = :quantity_change,
                        reason = :reason";
            
            $stmt = $this->conn->prepare($query);
            
            $id = bin2hex(random_bytes(16));
            $stmt->bindParam(":id", $id);
            $stmt->bindParam(":branch_id", $this->branch_id);
            $stmt->bindParam(":product_id", $this->product_id);
            $stmt->bindParam(":quantity_change", $quantity_change);
            $stmt->bindParam(":reason", $reason);
            
            if(!$stmt->execute()) {
                throw new Exception("Failed to record adjustment");
            }
            
            // Update branch inventory
            $query = "INSERT INTO " . $this->table . "
                    (branch_id, product_id, quantity, min_quantity, max_quantity)
                    VALUES (:branch_id, :product_id, :quantity, :min_quantity, :max_quantity)
                    ON DUPLICATE KEY UPDATE
                    quantity = quantity + :quantity_change,
                    min_quantity = VALUES(min_quantity),
                    max_quantity = VALUES(max_quantity)";
            
            $stmt = $this->conn->prepare($query);
            
            $stmt->bindParam(":branch_id", $this->branch_id);
            $stmt->bindParam(":product_id", $this->product_id);
            $stmt->bindParam(":quantity", $quantity_change);
            $stmt->bindParam(":quantity_change", $quantity_change);
            $stmt->bindParam(":min_quantity", $this->min_quantity);
            $stmt->bindParam(":max_quantity", $this->max_quantity);
            
            if(!$stmt->execute()) {
                throw new Exception("Failed to update inventory");
            }
            
            $this->conn->commit();
            return true;
        } catch(Exception $e) {
            $this->conn->rollBack();
            return false;
        }
    }

    public function checkLowStock() {
        $query = "SELECT bi.*, p.name as product_name
                FROM " . $this->table . " bi
                JOIN products p ON p.id = bi.product_id
                WHERE bi.quantity <= bi.min_quantity
                AND bi.branch_id = :branch_id";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":branch_id", $this->branch_id);
        $stmt->execute();
        
        return $stmt;
    }
}