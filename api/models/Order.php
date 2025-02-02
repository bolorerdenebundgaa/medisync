<?php
class Order {
    private $conn;
    private $table = "online_orders";

    public $id;
    public $items;
    public $customer_details;
    public $total;
    public $payment_method;
    public $status;
    public $branch_id;
    public $vat_amount;
    public $referral_amount;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function create() {
        $this->conn->beginTransaction();
        try {
            // Get ecommerce base branch
            $query = "SELECT id FROM branches WHERE is_ecommerce_base = TRUE LIMIT 1";
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            $branch = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if(!$branch) {
                throw new Exception("No ecommerce base branch configured");
            }
            
            $this->branch_id = $branch['id'];

            // Generate UUID
            $id = bin2hex(random_bytes(16));

            // Create order record
            $query = "INSERT INTO " . $this->table . "
                    SET id = :id,
                        branch_id = :branch_id,
                        customer_name = :name,
                        customer_email = :email,
                        customer_phone = :phone,
                        shipping_address = :address,
                        total_amount = :total,
                        vat_amount = :vat_amount,
                        referral_amount = :referral_amount,
                        payment_method = :payment_method,
                        status = 'pending'";
            
            $stmt = $this->conn->prepare($query);
            
            $stmt->bindParam(":id", $id);
            $stmt->bindParam(":branch_id", $this->branch_id);
            $stmt->bindParam(":name", $this->customer_details->name);
            $stmt->bindParam(":email", $this->customer_details->email);
            $stmt->bindParam(":phone", $this->customer_details->phone);
            $stmt->bindParam(":address", $this->customer_details->address);
            $stmt->bindParam(":total", $this->total);
            $stmt->bindParam(":vat_amount", $this->vat_amount);
            $stmt->bindParam(":referral_amount", $this->referral_amount);
            $stmt->bindParam(":payment_method", $this->payment_method);
            
            if(!$stmt->execute()) {
                throw new Exception("Failed to create order");
            }
            
            // Create order items
            foreach($this->items as $item) {
                $query = "INSERT INTO online_order_items
                        SET order_id = :order_id,
                            product_id = :product_id,
                            quantity = :quantity,
                            price = :price";
                
                $stmt = $this->conn->prepare($query);
                
                $stmt->bindParam(":order_id", $id);
                $stmt->bindParam(":product_id", $item->product_id);
                $stmt->bindParam(":quantity", $item->quantity);
                $stmt->bindParam(":price", $item->price);
                
                if(!$stmt->execute()) {
                    throw new Exception("Failed to create order item");
                }
                
                // Check and reserve stock
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