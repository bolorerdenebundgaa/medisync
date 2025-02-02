<?php
class Settings {
    private $conn;
    private $table = "settings";

    public $vat_percentage;
    public $referral_percentage;
    public $maintenance_percentage;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function update() {
        try {
            $this->conn->beginTransaction();

            // Update VAT percentage
            if($this->vat_percentage !== null) {
                $this->updateSetting('vat_percentage', $this->vat_percentage);
            }

            // Update referral percentage
            if($this->referral_percentage !== null) {
                $this->updateSetting('referral_percentage', $this->referral_percentage);
            }

            // Update maintenance percentage
            if($this->maintenance_percentage !== null) {
                $this->updateSetting('maintenance_percentage', $this->maintenance_percentage);
            }

            $this->conn->commit();
            return true;
        } catch(Exception $e) {
            $this->conn->rollBack();
            return false;
        }
    }

    private function updateSetting($key, $value) {
        $query = "UPDATE " . $this->table . "
                SET value = :value
                WHERE key = :key";
        
        $stmt = $this->conn->prepare($query);
        
        $stmt->bindParam(":value", $value);
        $stmt->bindParam(":key", $key);
        
        if(!$stmt->execute()) {
            throw new Exception("Failed to update " . $key);
        }
    }

    public function get() {
        $query = "SELECT key, value FROM " . $this->table;
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        
        $settings = [];
        while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $settings[$row['key']] = $row['value'];
        }
        
        return $settings;
    }
}