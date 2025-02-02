<?php
class Product {
    private $conn;
    private $table = "products";

    public $id;
    public $name;
    public $sku;
    public $description;
    public $price;
    public $quantity;
    public $photo_url;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function read() {
        $query = "SELECT p.*, pp.ingredients, pp.dosage, pp.storage_instructions, 
                        pp.usage_instructions, pp.warnings
                 FROM " . $this->table . " p
                 LEFT JOIN product_properties pp ON pp.product_id = p.id
                 ORDER BY p.created_at DESC";

        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    public function create() {
        try {
            $this->conn->beginTransaction();

            // Generate UUID
            $id = bin2hex(random_bytes(16));

            // Create product
            $query = "INSERT INTO " . $this->table . "
                    SET id = :id,
                        name = :name,
                        sku = :sku,
                        description = :description,
                        price = :price,
                        quantity = :quantity,
                        photo_url = :photo_url";

            $stmt = $this->conn->prepare($query);

            $stmt->bindParam(":id", $id);
            $stmt->bindParam(":name", $this->name);
            $stmt->bindParam(":sku", $this->sku);
            $stmt->bindParam(":description", $this->description);
            $stmt->bindParam(":price", $this->price);
            $stmt->bindParam(":quantity", $this->quantity);
            $stmt->bindParam(":photo_url", $this->photo_url);

            if(!$stmt->execute()) {
                throw new Exception("Failed to create product");
            }

            // Create product properties if provided
            if(isset($this->properties)) {
                $query = "INSERT INTO product_properties
                        SET id = UUID(),
                            product_id = :product_id,
                            ingredients = :ingredients,
                            dosage = :dosage,
                            storage_instructions = :storage_instructions,
                            usage_instructions = :usage_instructions,
                            warnings = :warnings";

                $stmt = $this->conn->prepare($query);

                $ingredients = json_encode($this->properties['ingredients'] ?? []);
                $warnings = json_encode($this->properties['warnings'] ?? []);

                $stmt->bindParam(":product_id", $id);
                $stmt->bindParam(":ingredients", $ingredients);
                $stmt->bindParam(":dosage", $this->properties['dosage']);
                $stmt->bindParam(":storage_instructions", $this->properties['storage_instructions']);
                $stmt->bindParam(":usage_instructions", $this->properties['usage_instructions']);
                $stmt->bindParam(":warnings", $warnings);

                if(!$stmt->execute()) {
                    throw new Exception("Failed to create product properties");
                }
            }

            $this->conn->commit();
            return true;
        } catch(Exception $e) {
            $this->conn->rollBack();
            return false;
        }
    }

    public function update() {
        try {
            $this->conn->beginTransaction();

            // Update product
            $query = "UPDATE " . $this->table . "
                    SET name = :name,
                        sku = :sku,
                        description = :description,
                        price = :price,
                        quantity = :quantity,
                        photo_url = :photo_url
                    WHERE id = :id";

            $stmt = $this->conn->prepare($query);

            $stmt->bindParam(":name", $this->name);
            $stmt->bindParam(":sku", $this->sku);
            $stmt->bindParam(":description", $this->description);
            $stmt->bindParam(":price", $this->price);
            $stmt->bindParam(":quantity", $this->quantity);
            $stmt->bindParam(":photo_url", $this->photo_url);
            $stmt->bindParam(":id", $this->id);

            if(!$stmt->execute()) {
                throw new Exception("Failed to update product");
            }

            // Update product properties if provided
            if(isset($this->properties)) {
                $query = "INSERT INTO product_properties
                        SET product_id = :product_id,
                            ingredients = :ingredients,
                            dosage = :dosage,
                            storage_instructions = :storage_instructions,
                            usage_instructions = :usage_instructions,
                            warnings = :warnings
                        ON DUPLICATE KEY UPDATE
                            ingredients = VALUES(ingredients),
                            dosage = VALUES(dosage),
                            storage_instructions = VALUES(storage_instructions),
                            usage_instructions = VALUES(usage_instructions),
                            warnings = VALUES(warnings)";

                $stmt = $this->conn->prepare($query);

                $ingredients = json_encode($this->properties['ingredients'] ?? []);
                $warnings = json_encode($this->properties['warnings'] ?? []);

                $stmt->bindParam(":product_id", $this->id);
                $stmt->bindParam(":ingredients", $ingredients);
                $stmt->bindParam(":dosage", $this->properties['dosage']);
                $stmt->bindParam(":storage_instructions", $this->properties['storage_instructions']);
                $stmt->bindParam(":usage_instructions", $this->properties['usage_instructions']);
                $stmt->bindParam(":warnings", $warnings);

                if(!$stmt->execute()) {
                    throw new Exception("Failed to update product properties");
                }
            }

            $this->conn->commit();
            return true;
        } catch(Exception $e) {
            $this->conn->rollBack();
            return false;
        }
    }

    public function delete() {
        $query = "DELETE FROM " . $this->table . " WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $this->id);
        return $stmt->execute();
    }
}