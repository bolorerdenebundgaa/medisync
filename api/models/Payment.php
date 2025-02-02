<?php
class Payment {
    private $conn;
    private $table = "payments";

    public $id;
    public $order_id;
    public $amount;
    public $payment_method;
    public $status;
    public $stripe_payment_intent_id;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function create() {
        try {
            $id = bin2hex(random_bytes(16));
            $query = "INSERT INTO " . $this->table . "
                    SET id = :id,
                        order_id = :order_id,
                        amount = :amount,
                        payment_method = :payment_method,
                        status = :status,
                        stripe_payment_intent_id = :stripe_payment_intent_id";
            
            $stmt = $this->conn->prepare($query);
            
            $stmt->bindParam(":id", $id);
            $stmt->bindParam(":order_id", $this->order_id);
            $stmt->bindParam(":amount", $this->amount);
            $stmt->bindParam(":payment_method", $this->payment_method);
            $stmt->bindParam(":status", $this->status);
            $stmt->bindParam(":stripe_payment_intent_id", $this->stripe_payment_intent_id);
            
            if($stmt->execute()) {
                $this->id = $id;
                return true;
            }
            return false;
        } catch(Exception $e) {
            return false;
        }
    }

    public function updateStatus($status) {
        $query = "UPDATE " . $this->table . "
                SET status = :status,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = :id";
        
        $stmt = $this->conn->prepare($query);
        
        $stmt->bindParam(":status", $status);
        $stmt->bindParam(":id", $this->id);
        
        return $stmt->execute();
    }
}