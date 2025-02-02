<?php
class BranchInventory {
    private $conn;
    private $table = "branch_inventory";
    private $transactions_table = "branch_inventory_transactions";

    public $id;
    public $branch_id;
    public $product_id;
    public $quantity;
    public $min_quantity;
    public $max_quantity;
    public $reorder_point;
    public $created_at;
    public $updated_at;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function read($branchId) {
        $query = "SELECT bi.*, p.name as product_name, p.price
                FROM " . $this->table . " bi
                INNER JOIN products p ON bi.product_id = p.id
                WHERE bi.branch_id = :branch_id
                ORDER BY p.name ASC";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":branch_id", $branchId);
        $stmt->execute();
        return $stmt;
    }

    public function getProductStock($branchId, $productId) {
        $query = "SELECT quantity FROM " . $this->table . "
                WHERE branch_id = :branch_id AND product_id = :product_id";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":branch_id", $branchId);
        $stmt->bindParam(":product_id", $productId);
        $stmt->execute();

        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row ? (int)$row['quantity'] : 0;
    }

    public function addStock($quantity, $userId, $referenceType, $referenceId, $notes = null) {
        try {
            $this->conn->beginTransaction();

            // Generate UUID for transaction
            $transactionId = bin2hex(random_bytes(16));

            // Create inventory transaction record
            $query = "INSERT INTO " . $this->transactions_table . "
                    SET id = :id,
                        branch_id = :branch_id,
                        product_id = :product_id,
                        transaction_type = 'in',
                        quantity = :quantity,
                        reference_type = :reference_type,
                        reference_id = :reference_id,
                        notes = :notes,
                        created_by = :created_by";

            $stmt = $this->conn->prepare($query);

            $stmt->bindParam(":id", $transactionId);
            $stmt->bindParam(":branch_id", $this->branch_id);
            $stmt->bindParam(":product_id", $this->product_id);
            $stmt->bindParam(":quantity", $quantity);
            $stmt->bindParam(":reference_type", $referenceType);
            $stmt->bindParam(":reference_id", $referenceId);
            $stmt->bindParam(":notes", $notes);
            $stmt->bindParam(":created_by", $userId);

            if(!$stmt->execute()) {
                throw new Exception("Failed to create inventory transaction");
            }

            // Check if product exists in branch inventory
            $query = "SELECT id FROM " . $this->table . "
                    WHERE branch_id = :branch_id AND product_id = :product_id";
            
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":branch_id", $this->branch_id);
            $stmt->bindParam(":product_id", $this->product_id);
            $stmt->execute();

            if($stmt->rowCount() === 0) {
                // Create new inventory record
                $inventoryId = bin2hex(random_bytes(16));
                $query = "INSERT INTO " . $this->table . "
                        SET id = :id,
                            branch_id = :branch_id,
                            product_id = :product_id,
                            quantity = :quantity,
                            min_quantity = :min_quantity,
                            max_quantity = :max_quantity,
                            reorder_point = :reorder_point";

                $stmt = $this->conn->prepare($query);

                $stmt->bindParam(":id", $inventoryId);
                $stmt->bindParam(":branch_id", $this->branch_id);
                $stmt->bindParam(":product_id", $this->product_id);
                $stmt->bindParam(":quantity", $quantity);
                $stmt->bindParam(":min_quantity", $this->min_quantity);
                $stmt->bindParam(":max_quantity", $this->max_quantity);
                $stmt->bindParam(":reorder_point", $this->reorder_point);

                if(!$stmt->execute()) {
                    throw new Exception("Failed to create inventory record");
                }
            } else {
                // Update existing inventory record
                $query = "UPDATE " . $this->table . "
                        SET quantity = quantity + :quantity
                        WHERE branch_id = :branch_id AND product_id = :product_id";

                $stmt = $this->conn->prepare($query);
                $stmt->bindParam(":quantity", $quantity);
                $stmt->bindParam(":branch_id", $this->branch_id);
                $stmt->bindParam(":product_id", $this->product_id);

                if(!$stmt->execute()) {
                    throw new Exception("Failed to update inventory quantity");
                }
            }

            $this->conn->commit();
            return true;
        } catch(Exception $e) {
            $this->conn->rollBack();
            throw $e;
        }
    }

    public function removeStock($quantity, $userId, $referenceType, $referenceId, $notes = null) {
        try {
            $this->conn->beginTransaction();

            // Check current stock
            $currentStock = $this->getProductStock($this->branch_id, $this->product_id);
            if($currentStock < $quantity) {
                throw new Exception("Insufficient stock");
            }

            // Generate UUID for transaction
            $transactionId = bin2hex(random_bytes(16));

            // Create inventory transaction record
            $query = "INSERT INTO " . $this->transactions_table . "
                    SET id = :id,
                        branch_id = :branch_id,
                        product_id = :product_id,
                        transaction_type = 'out',
                        quantity = :quantity,
                        reference_type = :reference_type,
                        reference_id = :reference_id,
                        notes = :notes,
                        created_by = :created_by";

            $stmt = $this->conn->prepare($query);

            $stmt->bindParam(":id", $transactionId);
            $stmt->bindParam(":branch_id", $this->branch_id);
            $stmt->bindParam(":product_id", $this->product_id);
            $stmt->bindParam(":quantity", $quantity);
            $stmt->bindParam(":reference_type", $referenceType);
            $stmt->bindParam(":reference_id", $referenceId);
            $stmt->bindParam(":notes", $notes);
            $stmt->bindParam(":created_by", $userId);

            if(!$stmt->execute()) {
                throw new Exception("Failed to create inventory transaction");
            }

            // Update inventory quantity
            $query = "UPDATE " . $this->table . "
                    SET quantity = quantity - :quantity
                    WHERE branch_id = :branch_id AND product_id = :product_id";

            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":quantity", $quantity);
            $stmt->bindParam(":branch_id", $this->branch_id);
            $stmt->bindParam(":product_id", $this->product_id);

            if(!$stmt->execute()) {
                throw new Exception("Failed to update inventory quantity");
            }

            $this->conn->commit();
            return true;
        } catch(Exception $e) {
            $this->conn->rollBack();
            throw $e;
        }
    }

    public function transferStock($toBranchId, $quantity, $userId, $referenceId, $notes = null) {
        try {
            $this->conn->beginTransaction();

            // Check current stock
            $currentStock = $this->getProductStock($this->branch_id, $this->product_id);
            if($currentStock < $quantity) {
                throw new Exception("Insufficient stock for transfer");
            }

            // Generate UUID for outgoing transaction
            $outTransactionId = bin2hex(random_bytes(16));

            // Create outgoing inventory transaction record
            $query = "INSERT INTO " . $this->transactions_table . "
                    SET id = :id,
                        branch_id = :branch_id,
                        product_id = :product_id,
                        transaction_type = 'out',
                        quantity = :quantity,
                        reference_type = 'transfer_out',
                        reference_id = :reference_id,
                        notes = :notes,
                        created_by = :created_by";

            $stmt = $this->conn->prepare($query);

            $stmt->bindParam(":id", $outTransactionId);
            $stmt->bindParam(":branch_id", $this->branch_id);
            $stmt->bindParam(":product_id", $this->product_id);
            $stmt->bindParam(":quantity", $quantity);
            $stmt->bindParam(":reference_id", $referenceId);
            $stmt->bindParam(":notes", $notes);
            $stmt->bindParam(":created_by", $userId);

            if(!$stmt->execute()) {
                throw new Exception("Failed to create outgoing transaction");
            }

            // Generate UUID for incoming transaction
            $inTransactionId = bin2hex(random_bytes(16));

            // Create incoming inventory transaction record
            $query = "INSERT INTO " . $this->transactions_table . "
                    SET id = :id,
                        branch_id = :branch_id,
                        product_id = :product_id,
                        transaction_type = 'in',
                        quantity = :quantity,
                        reference_type = 'transfer_in',
                        reference_id = :reference_id,
                        notes = :notes,
                        created_by = :created_by";

            $stmt = $this->conn->prepare($query);

            $stmt->bindParam(":id", $inTransactionId);
            $stmt->bindParam(":branch_id", $toBranchId);
            $stmt->bindParam(":product_id", $this->product_id);
            $stmt->bindParam(":quantity", $quantity);
            $stmt->bindParam(":reference_id", $referenceId);
            $stmt->bindParam(":notes", $notes);
            $stmt->bindParam(":created_by", $userId);

            if(!$stmt->execute()) {
                throw new Exception("Failed to create incoming transaction");
            }

            // Update source branch inventory
            $query = "UPDATE " . $this->table . "
                    SET quantity = quantity - :quantity
                    WHERE branch_id = :branch_id AND product_id = :product_id";

            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":quantity", $quantity);
            $stmt->bindParam(":branch_id", $this->branch_id);
            $stmt->bindParam(":product_id", $this->product_id);

            if(!$stmt->execute()) {
                throw new Exception("Failed to update source inventory");
            }

            // Check if product exists in destination branch inventory
            $query = "SELECT id FROM " . $this->table . "
                    WHERE branch_id = :branch_id AND product_id = :product_id";
            
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":branch_id", $toBranchId);
            $stmt->bindParam(":product_id", $this->product_id);
            $stmt->execute();

            if($stmt->rowCount() === 0) {
                // Create new inventory record for destination branch
                $inventoryId = bin2hex(random_bytes(16));
                $query = "INSERT INTO " . $this->table . "
                        SET id = :id,
                            branch_id = :branch_id,
                            product_id = :product_id,
                            quantity = :quantity,
                            min_quantity = :min_quantity,
                            max_quantity = :max_quantity,
                            reorder_point = :reorder_point";

                $stmt = $this->conn->prepare($query);

                $stmt->bindParam(":id", $inventoryId);
                $stmt->bindParam(":branch_id", $toBranchId);
                $stmt->bindParam(":product_id", $this->product_id);
                $stmt->bindParam(":quantity", $quantity);
                $stmt->bindParam(":min_quantity", $this->min_quantity);
                $stmt->bindParam(":max_quantity", $this->max_quantity);
                $stmt->bindParam(":reorder_point", $this->reorder_point);

                if(!$stmt->execute()) {
                    throw new Exception("Failed to create destination inventory record");
                }
            } else {
                // Update existing destination branch inventory
                $query = "UPDATE " . $this->table . "
                        SET quantity = quantity + :quantity
                        WHERE branch_id = :branch_id AND product_id = :product_id";

                $stmt = $this->conn->prepare($query);
                $stmt->bindParam(":quantity", $quantity);
                $stmt->bindParam(":branch_id", $toBranchId);
                $stmt->bindParam(":product_id", $this->product_id);

                if(!$stmt->execute()) {
                    throw new Exception("Failed to update destination inventory");
                }
            }

            $this->conn->commit();
            return true;
        } catch(Exception $e) {
            $this->conn->rollBack();
            throw $e;
        }
    }

    public function getTransactionHistory($branchId, $productId = null, $startDate = null, $endDate = null) {
        $query = "SELECT t.*, 
                        p.name as product_name,
                        u.full_name as created_by_name
                FROM " . $this->transactions_table . " t
                INNER JOIN products p ON t.product_id = p.id
                INNER JOIN users u ON t.created_by = u.id
                WHERE t.branch_id = :branch_id";

        if($productId) {
            $query .= " AND t.product_id = :product_id";
        }
        if($startDate) {
            $query .= " AND t.created_at >= :start_date";
        }
        if($endDate) {
            $query .= " AND t.created_at <= :end_date";
        }

        $query .= " ORDER BY t.created_at DESC";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":branch_id", $branchId);
        if($productId) {
            $stmt->bindParam(":product_id", $productId);
        }
        if($startDate) {
            $stmt->bindParam(":start_date", $startDate);
        }
        if($endDate) {
            $stmt->bindParam(":end_date", $endDate);
        }

        $stmt->execute();
        return $stmt;
    }
}
