<?php
class PaymentMethod {
    private $conn;
    private $table = "payment_methods";

    public $id;
    public $name;
    public $type;
    public $enabled;
    public $icon;
    public $processor_config;
    public $is_default;
    public $created_at;
    public $updated_at;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function read() {
        $query = "SELECT * FROM " . $this->table . " ORDER BY created_at DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    public function create() {
        try {
            $this->conn->beginTransaction();

            // Generate UUID
            $id = bin2hex(random_bytes(16));

            $query = "INSERT INTO " . $this->table . "
                    SET id = :id,
                        name = :name,
                        type = :type,
                        enabled = :enabled,
                        icon = :icon,
                        processor_config = :processor_config,
                        is_default = :is_default";

            $stmt = $this->conn->prepare($query);

            // Clean and encode data
            $this->processor_config = $this->processor_config ? json_encode($this->processor_config) : null;
            $this->enabled = $this->enabled ? 1 : 0;
            $this->is_default = $this->is_default ? 1 : 0;

            // Bind data
            $stmt->bindParam(":id", $id);
            $stmt->bindParam(":name", $this->name);
            $stmt->bindParam(":type", $this->type);
            $stmt->bindParam(":enabled", $this->enabled);
            $stmt->bindParam(":icon", $this->icon);
            $stmt->bindParam(":processor_config", $this->processor_config);
            $stmt->bindParam(":is_default", $this->is_default);

            if(!$stmt->execute()) {
                throw new Exception("Failed to create payment method");
            }

            // If this is set as default, update other methods
            if($this->is_default) {
                $query = "UPDATE " . $this->table . " SET is_default = 0 WHERE id != :id";
                $stmt = $this->conn->prepare($query);
                $stmt->bindParam(":id", $id);
                if(!$stmt->execute()) {
                    throw new Exception("Failed to update default status");
                }
            }

            $this->conn->commit();
            $this->id = $id;
            return true;
        } catch(Exception $e) {
            $this->conn->rollBack();
            throw $e;
        }
    }

    public function update() {
        try {
            $this->conn->beginTransaction();

            $query = "UPDATE " . $this->table . "
                    SET name = :name,
                        type = :type,
                        enabled = :enabled,
                        icon = :icon,
                        processor_config = :processor_config,
                        is_default = :is_default
                    WHERE id = :id";

            $stmt = $this->conn->prepare($query);

            // Clean and encode data
            $this->processor_config = $this->processor_config ? json_encode($this->processor_config) : null;
            $this->enabled = $this->enabled ? 1 : 0;
            $this->is_default = $this->is_default ? 1 : 0;

            // Bind data
            $stmt->bindParam(":name", $this->name);
            $stmt->bindParam(":type", $this->type);
            $stmt->bindParam(":enabled", $this->enabled);
            $stmt->bindParam(":icon", $this->icon);
            $stmt->bindParam(":processor_config", $this->processor_config);
            $stmt->bindParam(":is_default", $this->is_default);
            $stmt->bindParam(":id", $this->id);

            if(!$stmt->execute()) {
                throw new Exception("Failed to update payment method");
            }

            // If this is set as default, update other methods
            if($this->is_default) {
                $query = "UPDATE " . $this->table . " SET is_default = 0 WHERE id != :id";
                $stmt = $this->conn->prepare($query);
                $stmt->bindParam(":id", $this->id);
                if(!$stmt->execute()) {
                    throw new Exception("Failed to update default status");
                }
            }

            $this->conn->commit();
            return true;
        } catch(Exception $e) {
            $this->conn->rollBack();
            throw $e;
        }
    }

    public function delete() {
        // Check if this is the default method
        $query = "SELECT is_default FROM " . $this->table . " WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $this->id);
        $stmt->execute();
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if($row['is_default']) {
            throw new Exception("Cannot delete default payment method");
        }

        $query = "DELETE FROM " . $this->table . " WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $this->id);
        return $stmt->execute();
    }

    public function getEnabled() {
        $query = "SELECT * FROM " . $this->table . " WHERE enabled = 1 ORDER BY created_at DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    public function setDefault() {
        try {
            $this->conn->beginTransaction();

            // First, ensure the method exists and is enabled
            $query = "SELECT enabled FROM " . $this->table . " WHERE id = :id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":id", $this->id);
            $stmt->execute();
            $row = $stmt->fetch(PDO::FETCH_ASSOC);

            if(!$row || !$row['enabled']) {
                throw new Exception("Payment method must be enabled to set as default");
            }

            // Update all methods to not be default
            $query = "UPDATE " . $this->table . " SET is_default = 0";
            $stmt = $this->conn->prepare($query);
            if(!$stmt->execute()) {
                throw new Exception("Failed to update default status");
            }

            // Set the selected method as default
            $query = "UPDATE " . $this->table . " SET is_default = 1 WHERE id = :id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":id", $this->id);
            if(!$stmt->execute()) {
                throw new Exception("Failed to set default payment method");
            }

            $this->conn->commit();
            return true;
        } catch(Exception $e) {
            $this->conn->rollBack();
            throw $e;
        }
    }
}
