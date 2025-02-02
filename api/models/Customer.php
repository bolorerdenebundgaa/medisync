<?php
class Customer {
    private $conn;
    private $table = "customers";

    public $id;
    public $name;
    public $email;
    public $phone;
    public $address;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function create() {
        try {
            $id = bin2hex(random_bytes(16));
            $query = "INSERT INTO " . $this->table . "
                    SET id = :id,
                        name = :name,
                        email = :email,
                        phone = :phone,
                        address = :address";
            
            $stmt = $this->conn->prepare($query);
            
            $stmt->bindParam(":id", $id);
            $stmt->bindParam(":name", $this->name);
            $stmt->bindParam(":email", $this->email);
            $stmt->bindParam(":phone", $this->phone);
            $stmt->bindParam(":address", $this->address);
            
            if($stmt->execute()) {
                $this->id = $id;
                return true;
            }
            return false;
        } catch(Exception $e) {
            return false;
        }
    }

    public function update() {
        $query = "UPDATE " . $this->table . "
                SET name = :name,
                    email = :email,
                    phone = :phone,
                    address = :address
                WHERE id = :id";
        
        $stmt = $this->conn->prepare($query);
        
        $stmt->bindParam(":name", $this->name);
        $stmt->bindParam(":email", $this->email);
        $stmt->bindParam(":phone", $this->phone);
        $stmt->bindParam(":address", $this->address);
        $stmt->bindParam(":id", $this->id);
        
        return $stmt->execute();
    }

    public function getById($id) {
        $query = "SELECT * FROM " . $this->table . " WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $id);
        $stmt->execute();
        
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if($row) {
            $this->id = $row['id'];
            $this->name = $row['name'];
            $this->email = $row['email'];
            $this->phone = $row['phone'];
            $this->address = $row['address'];
            return true;
        }
        return false;
    }
}