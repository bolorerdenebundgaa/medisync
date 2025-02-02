<?php
class Cart {
    private $conn;
    private $guest_carts_table = "guest_carts";
    private $guest_cart_items_table = "guest_cart_items";

    public function __construct($db) {
        $this->conn = $db;
        $this->ensureGuestCartTables();
    }

    private function ensureGuestCartTables() {
        // Create guest_carts table if not exists
        $query = "CREATE TABLE IF NOT EXISTS " . $this->guest_carts_table . " (
            id varchar(32) PRIMARY KEY,
            created_at timestamp DEFAULT CURRENT_TIMESTAMP,
            updated_at timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )";
        $this->conn->exec($query);

        // Create guest_cart_items table if not exists
        $query = "CREATE TABLE IF NOT EXISTS " . $this->guest_cart_items_table . " (
            id varchar(32) PRIMARY KEY,
            cart_id varchar(32),
            product_id varchar(32),
            quantity int NOT NULL DEFAULT 1,
            created_at timestamp DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (cart_id) REFERENCES " . $this->guest_carts_table . "(id) ON DELETE CASCADE
        )";
        $this->conn->exec($query);
    }

    public function getGuestCart($cart_id) {
        try {
            // Ensure cart exists
            $query = "INSERT IGNORE INTO " . $this->guest_carts_table . " (id) VALUES (:cart_id)";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":cart_id", $cart_id);
            $stmt->execute();

            // Get cart items with product details
            $query = "SELECT i.product_id, i.quantity, p.name, p.price, p.photo_url
                     FROM " . $this->guest_cart_items_table . " i
                     JOIN products p ON p.id = i.product_id
                     WHERE i.cart_id = :cart_id";
            
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":cart_id", $cart_id);
            $stmt->execute();
            
            $items = [];
            while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $items[] = [
                    'id' => $row['product_id'], 
                    'name' => $row['name'],
                    'price' => floatval($row['price']),
                    'quantity' => intval($row['quantity']),
                    'photo_url' => $row['photo_url']
                ];
            }
            
            return ['items' => $items];
        } catch(Exception $e) {
            error_log("Error getting guest cart: " . $e->getMessage());
            return false;
        }
    }

    public function addToGuestCart($cart_id, $product_id, $quantity) {
        try {
            // Ensure cart exists
            $query = "INSERT IGNORE INTO " . $this->guest_carts_table . " (id) VALUES (:cart_id)";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":cart_id", $cart_id);
            $stmt->execute();

            // Check if product already exists in cart
            $query = "SELECT id, quantity FROM " . $this->guest_cart_items_table . "
                     WHERE cart_id = :cart_id AND product_id = :product_id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":cart_id", $cart_id);
            $stmt->bindParam(":product_id", $product_id);
            $stmt->execute();

            if($stmt->rowCount() > 0) {
                // Update existing item
                $item = $stmt->fetch(PDO::FETCH_ASSOC);
                $newQuantity = $item['quantity'] + $quantity;
                
                $query = "UPDATE " . $this->guest_cart_items_table . "
                         SET quantity = :quantity
                         WHERE id = :id";
                $stmt = $this->conn->prepare($query);
                $stmt->bindParam(":quantity", $newQuantity);
                $stmt->bindParam(":id", $item['id']);
            } else {
                // Add new item
                $id = bin2hex(random_bytes(16));
                $query = "INSERT INTO " . $this->guest_cart_items_table . "
                         (id, cart_id, product_id, quantity)
                         VALUES (:id, :cart_id, :product_id, :quantity)";
                $stmt = $this->conn->prepare($query);
                $stmt->bindParam(":id", $id);
                $stmt->bindParam(":cart_id", $cart_id);
                $stmt->bindParam(":product_id", $product_id);
                $stmt->bindParam(":quantity", $quantity);
            }

            return $stmt->execute();
        } catch(Exception $e) {
            error_log("Error adding to guest cart: " . $e->getMessage());
            return false;
        }
    }

    public function removeFromGuestCart($cart_id, $product_id) {
        try {
            $query = "DELETE FROM " . $this->guest_cart_items_table . "
                     WHERE cart_id = :cart_id AND product_id = :product_id";
            
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":cart_id", $cart_id);
            $stmt->bindParam(":product_id", $product_id);
            
            return $stmt->execute();
        } catch(Exception $e) {
            error_log("Error removing from guest cart: " . $e->getMessage());
            return false;
        }
    }

    public function clearGuestCart($cart_id) {
        try {
            $query = "DELETE FROM " . $this->guest_cart_items_table . "
                     WHERE cart_id = :cart_id";
            
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":cart_id", $cart_id);
            
            return $stmt->execute();
        } catch(Exception $e) {
            error_log("Error clearing guest cart: " . $e->getMessage());
            return false;
        }
    }
}