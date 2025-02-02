<?php
class Sale {
    private $conn;
    private $table = "pos_transactions";

    public $id;
    public $items;
    public $total;
    public $payment_method;
    public $customer_id;
    public $admin_id;
    public $branch_id;
    public $vat_amount;
    public $referral_amount;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function create() {
        $this->conn->beginTransaction();
        try {
            // Generate UUID
            $id = bin2hex(random_bytes(16));

            // Create transaction record
            $query = "INSERT INTO " . $this->table . "
                    SET id = :id,
                        branch_id = :branch_id,
                        customer_id = :customer_id,
                        admin_id = :admin_id,
                        total_amount = :total,
                        vat_amount = :vat_amount,
                        referral_amount = :referral_amount,
                        payment_method = :payment_method,
                        status = 'completed'";
            
            $stmt = $this->conn->prepare($query);
            
            $stmt->bindParam(":id", $id);
            $stmt->bindParam(":branch_id", $this->branch_id);
            $stmt->bindParam(":customer_id", $this->customer_id);
            $stmt->bindParam(":admin_id", $this->admin_id);
            $stmt->bindParam(":total", $this->total);
            $stmt->bindParam(":vat_amount", $this->vat_amount);
            $stmt->bindParam(":referral_amount", $this->referral_amount);
            $stmt->bindParam(":payment_method", $this->payment_method);
            
            if(!$stmt->execute()) {
                throw new Exception("Failed to create transaction");
            }
            
            // Create transaction items
            foreach($this->items as $item) {
                $query = "INSERT INTO pos_transaction_items
                        SET transaction_id = :transaction_id,
                            product_id = :product_id,
                            quantity = :quantity,
                            price = :price";
                
                $stmt = $this->conn->prepare($query);
                
                $stmt->bindParam(":transaction_id", $id);
                $stmt->bindParam(":product_id", $item->product_id);
                $stmt->bindParam(":quantity", $item->quantity);
                $stmt->bindParam(":price", $item->price);
                
                if(!$stmt->execute()) {
                    throw new Exception("Failed to create transaction item");
                }
                
                // Update branch inventory
                $query = "UPDATE branch_inventory 
                        SET quantity = quantity - :quantity
                        WHERE branch_id = :branch_id 
                        AND product_id = :product_id
                        AND quantity >= :quantity";
                
                $stmt = $this->conn->prepare($query);
                
                $stmt->bindParam(":quantity", $item->quantity);
                $stmt->bindParam(":branch_id", $this->branch_id);
                $stmt->bindParam(":product_id", $item->product_id);
                
                if(!$stmt->execute() || $stmt->rowCount() === 0) {
                    throw new Exception("Insufficient stock");
                }
            }
            
            $this->conn->commit();
            return true;
        } catch(Exception $e) {
            $this->conn->rollBack();
            return false;
        }
    }
}