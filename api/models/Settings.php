<?php
class Settings {
    private $conn;
    private $table_name = "settings";

    public function __construct($db) {
        $this->conn = $db;
    }

    public function get() {
        $query = "SELECT * FROM " . $this->table_name . " LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();

        $settings = $stmt->fetch(PDO::FETCH_ASSOC);
        if(!$settings) {
            // Return default settings if none exist
            return [
                'referee_commission_percentage' => 10.00,
                'vat_percentage' => 15.00
            ];
        }

        return $settings;
    }

    public function update($data) {
        // Get current settings
        $current = $this->get();
        $id = $current['id'] ?? $this->generateUUID();

        if($current['id']) {
            // Update existing settings
            $query = "UPDATE " . $this->table_name . "
                    SET referee_commission_percentage = :commission,
                        vat_percentage = :vat,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = :id";
        } else {
            // Insert new settings
            $query = "INSERT INTO " . $this->table_name . "
                    SET id = :id,
                        referee_commission_percentage = :commission,
                        vat_percentage = :vat";
        }

        $stmt = $this->conn->prepare($query);

        // Validate and sanitize input
        $commission = isset($data['referee_commission_percentage']) 
            ? floatval($data['referee_commission_percentage']) 
            : $current['referee_commission_percentage'];
        $vat = isset($data['vat_percentage']) 
            ? floatval($data['vat_percentage']) 
            : $current['vat_percentage'];

        // Ensure percentages are within valid range
        if($commission < 0 || $commission > 100) {
            throw new Exception("Commission percentage must be between 0 and 100");
        }
        if($vat < 0 || $vat > 100) {
            throw new Exception("VAT percentage must be between 0 and 100");
        }

        // Bind parameters
        $stmt->bindParam(":id", $id);
        $stmt->bindParam(":commission", $commission);
        $stmt->bindParam(":vat", $vat);

        if($stmt->execute()) {
            return $this->get();
        }
        return false;
    }

    public function calculateCommission($amount) {
        $settings = $this->get();
        return ($amount * $settings['referee_commission_percentage']) / 100;
    }

    public function calculateVAT($amount) {
        $settings = $this->get();
        return ($amount * $settings['vat_percentage']) / 100;
    }

    public function calculateTotalWithVAT($amount) {
        return $amount + $this->calculateVAT($amount);
    }

    private function generateUUID() {
        return sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
            mt_rand(0, 0xffff), mt_rand(0, 0xffff),
            mt_rand(0, 0xffff),
            mt_rand(0, 0x0fff) | 0x4000,
            mt_rand(0, 0x3fff) | 0x8000,
            mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
        );
    }

    public function validateSettings($data) {
        $errors = [];

        if(isset($data['referee_commission_percentage'])) {
            $commission = floatval($data['referee_commission_percentage']);
            if($commission < 0 || $commission > 100) {
                $errors[] = "Commission percentage must be between 0 and 100";
            }
        }

        if(isset($data['vat_percentage'])) {
            $vat = floatval($data['vat_percentage']);
            if($vat < 0 || $vat > 100) {
                $errors[] = "VAT percentage must be between 0 and 100";
            }
        }

        return $errors;
    }

    public function getCommissionHistory($refereeId = null, $startDate = null, $endDate = null) {
        $query = "SELECT 
                    re.*,
                    u.full_name as referee_name,
                    s.total_amount as sale_amount
                FROM referee_earnings re
                LEFT JOIN users u ON re.referee_id = u.id
                LEFT JOIN sales s ON re.sale_id = s.id
                WHERE 1=1";

        $params = [];

        if($refereeId) {
            $query .= " AND re.referee_id = :referee_id";
            $params[':referee_id'] = $refereeId;
        }

        if($startDate) {
            $query .= " AND re.created_at >= :start_date";
            $params[':start_date'] = $startDate;
        }

        if($endDate) {
            $query .= " AND re.created_at <= :end_date";
            $params[':end_date'] = $endDate;
        }

        $query .= " ORDER BY re.created_at DESC";

        $stmt = $this->conn->prepare($query);
        foreach($params as $key => &$value) {
            $stmt->bindParam($key, $value);
        }

        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
