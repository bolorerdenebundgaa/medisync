<?php
class Prescription {
    private $conn;
    private $table_name = "prescriptions";
    private $items_table = "prescription_items";

    public $id;
    public $client_id;
    public $referee_id;
    public $branch_id;
    public $status;
    public $created_at;
    public $updated_at;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function create($data) {
        $this->id = $this->generateUUID();
        
        $query = "INSERT INTO " . $this->table_name . "
                SET id = :id,
                    client_id = :client_id,
                    referee_id = :referee_id,
                    branch_id = :branch_id,
                    status = :status";

        $stmt = $this->conn->prepare($query);

        // Sanitize and bind
        $stmt->bindParam(":id", $this->id);
        $stmt->bindParam(":client_id", $data['client_id']);
        $stmt->bindParam(":referee_id", $data['referee_id']);
        $stmt->bindParam(":branch_id", $data['branch_id']);
        $stmt->bindParam(":status", $data['status']);

        if($stmt->execute()) {
            return $this->id;
        }
        return false;
    }

    public function addItem($data) {
        $query = "INSERT INTO " . $this->items_table . "
                SET id = :id,
                    prescription_id = :prescription_id,
                    product_id = :product_id,
                    quantity = :quantity,
                    directions = :directions";

        $stmt = $this->conn->prepare($query);

        $id = $this->generateUUID();
        $stmt->bindParam(":id", $id);
        $stmt->bindParam(":prescription_id", $data['prescription_id']);
        $stmt->bindParam(":product_id", $data['product_id']);
        $stmt->bindParam(":quantity", $data['quantity']);
        $stmt->bindParam(":directions", $data['directions']);

        return $stmt->execute();
    }

    public function getOne($id) {
        $query = "SELECT 
                    p.*,
                    c.full_name as client_name,
                    c.phone as client_phone,
                    c.email as client_email,
                    u.full_name as referee_name,
                    b.name as branch_name
                FROM " . $this->table_name . " p
                LEFT JOIN clients c ON p.client_id = c.id
                LEFT JOIN users u ON p.referee_id = u.id
                LEFT JOIN branches b ON p.branch_id = b.id
                WHERE p.id = ?";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $id);
        $stmt->execute();

        $prescription = $stmt->fetch(PDO::FETCH_ASSOC);
        if(!$prescription) return null;

        // Get prescription items
        $query = "SELECT 
                    pi.*,
                    p.name as product_name,
                    p.sku,
                    p.price
                FROM " . $this->items_table . " pi
                LEFT JOIN products p ON pi.product_id = p.id
                WHERE pi.prescription_id = ?";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $id);
        $stmt->execute();

        $prescription['items'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
        return $prescription;
    }

    public function updateStatus($id, $status) {
        $query = "UPDATE " . $this->table_name . "
                SET status = :status,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = :id";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":status", $status);
        $stmt->bindParam(":id", $id);

        return $stmt->execute();
    }

    public function getActive($clientId = null) {
        $query = "SELECT 
                    p.*,
                    c.full_name as client_name,
                    u.full_name as referee_name,
                    b.name as branch_name
                FROM " . $this->table_name . " p
                LEFT JOIN clients c ON p.client_id = c.id
                LEFT JOIN users u ON p.referee_id = u.id
                LEFT JOIN branches b ON p.branch_id = b.id
                WHERE p.status = 'active'";

        if($clientId) {
            $query .= " AND p.client_id = :client_id";
        }

        $query .= " ORDER BY p.created_at DESC";

        $stmt = $this->conn->prepare($query);
        if($clientId) {
            $stmt->bindParam(":client_id", $clientId);
        }

        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function search($params) {
        $query = "SELECT 
                    p.*,
                    c.full_name as client_name,
                    u.full_name as referee_name,
                    b.name as branch_name
                FROM " . $this->table_name . " p
                LEFT JOIN clients c ON p.client_id = c.id
                LEFT JOIN users u ON p.referee_id = u.id
                LEFT JOIN branches b ON p.branch_id = b.id
                WHERE 1=1";

        $bindParams = array();

        if(isset($params['client_id'])) {
            $query .= " AND p.client_id = :client_id";
            $bindParams[':client_id'] = $params['client_id'];
        }

        if(isset($params['referee_id'])) {
            $query .= " AND p.referee_id = :referee_id";
            $bindParams[':referee_id'] = $params['referee_id'];
        }

        if(isset($params['branch_id'])) {
            $query .= " AND p.branch_id = :branch_id";
            $bindParams[':branch_id'] = $params['branch_id'];
        }

        if(isset($params['status'])) {
            $query .= " AND p.status = :status";
            $bindParams[':status'] = $params['status'];
        }

        if(isset($params['start_date'])) {
            $query .= " AND p.created_at >= :start_date";
            $bindParams[':start_date'] = $params['start_date'];
        }

        if(isset($params['end_date'])) {
            $query .= " AND p.created_at <= :end_date";
            $bindParams[':end_date'] = $params['end_date'];
        }

        $query .= " ORDER BY p.created_at DESC";

        $stmt = $this->conn->prepare($query);
        foreach($bindParams as $key => &$value) {
            $stmt->bindParam($key, $value);
        }

        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
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
}
