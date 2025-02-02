<?php
class Wishlist {
    private $conn;
    private $table = "wishlists";

    public $id;
    public $user_id;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function getWishlist($user_id) {
        $query = "SELECT w.id as wishlist_id, 
                        wi.id as item_id,
                        p.id as product_id,
                        p.name,
                        p.description,
                        p.price,
                        p.quantity,
                        p.photo_url
                 FROM " . $this->table . " w
                 LEFT JOIN wishlist_items wi ON wi.wishlist_id = w.id
                 LEFT JOIN products p ON p.id = wi.product_id
                 WHERE w.user_id = :user_id";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":user_id", $user_id);
        $stmt->execute();

        $items = [];
        while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            if($row['product_id']) {
                $items[] = [
                    'id' => $row['item_id'],
                    'product' => [
                        'id' => $row['product_id'],
                        'name' => $row['name'],
                        'description' => $row['description'],
                        'price' => $row['price'],
                        'quantity' => $row['quantity'],
                        'photo_url' => $row['photo_url']
                    ]
                ];
            }
        }

        return [
            'id' => $row['wishlist_id'],
            'items' => $items
        ];
    }

    public function addItem($user_id, $product_id) {
        try {
            // Get wishlist ID
            $query = "SELECT id FROM " . $this->table . " WHERE user_id = :user_id LIMIT 1";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":user_id", $user_id);
            $stmt->execute();

            if($stmt->rowCount() === 0) {
                // Create wishlist if doesn't exist
                $wishlist_id = bin2hex(random_bytes(16));
                $query = "INSERT INTO " . $this->table . " (id, user_id) VALUES (:id, :user_id)";
                $stmt = $this->conn->prepare($query);
                $stmt->bindParam(":id", $wishlist_id);
                $stmt->bindParam(":user_id", $user_id);
                $stmt->execute();
            } else {
                $row = $stmt->fetch(PDO::FETCH_ASSOC);
                $wishlist_id = $row['id'];
            }

            // Add item to wishlist
            $item_id = bin2hex(random_bytes(16));
            $query = "INSERT INTO wishlist_items (id, wishlist_id, product_id)
                     VALUES (:id, :wishlist_id, :product_id)";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":id", $item_id);
            $stmt->bindParam(":wishlist_id", $wishlist_id);
            $stmt->bindParam(":product_id", $product_id);

            return $stmt->execute();
        } catch(Exception $e) {
            return false;
        }
    }

    public function removeItem($user_id, $item_id) {
        $query = "DELETE wi FROM wishlist_items wi
                 INNER JOIN wishlists w ON w.id = wi.wishlist_id
                 WHERE w.user_id = :user_id AND wi.id = :item_id";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":user_id", $user_id);
        $stmt->bindParam(":item_id", $item_id);
        
        return $stmt->execute();
    }
}