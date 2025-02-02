<?php
class Referee {
    private $conn;
    private $table = "users";

    public function __construct($db) {
        $this->conn = $db;
    }

    public function getAll() {
        $query = "SELECT u.id, u.email, u.full_name, 
                        COUNT(r.id) as total_referrals,
                        SUM(r.amount) as total_earnings,
                        MAX(r.created_at) as last_referral
                 FROM " . $this->table . " u
                 LEFT JOIN referral_earnings r ON r.referee_id = u.id
                 JOIN user_roles ur ON ur.user_id = u.id
                 JOIN roles ro ON ro.id = ur.role_id
                 WHERE ro.name = 'referee'
                 GROUP BY u.id, u.email, u.full_name";
        
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        
        $referees = [];
        while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $referees[] = [
                'id' => $row['id'],
                'email' => $row['email'],
                'full_name' => $row['full_name'],
                'total_referrals' => (int)$row['total_referrals'],
                'total_earnings' => (float)$row['total_earnings'],
                'last_referral' => $row['last_referral']
            ];
        }
        
        return $referees;
    }

    public function create($email, $full_name) {
        try {
            $this->conn->beginTransaction();

            // Create user
            $password = bin2hex(random_bytes(8)); // Generate random password
            $hashed_password = password_hash($password, PASSWORD_BCRYPT);

            $query = "INSERT INTO " . $this->table . "
                    SET email = :email,
                        password = :password,
                        full_name = :full_name";
            
            $stmt = $this->conn->prepare($query);
            
            $stmt->bindParam(":email", $email);
            $stmt->bindParam(":password", $hashed_password);
            $stmt->bindParam(":full_name", $full_name);
            
            if(!$stmt->execute()) {
                throw new Exception("Failed to create user");
            }
            
            $user_id = $this->conn->lastInsertId();

            // Get referee role ID
            $query = "SELECT id FROM roles WHERE name = 'referee'";
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            $role = $stmt->fetch(PDO::FETCH_ASSOC);

            if(!$role) {
                throw new Exception("Referee role not found");
            }

            // Assign referee role
            $query = "INSERT INTO user_roles (user_id, role_id)
                    VALUES (:user_id, :role_id)";
            
            $stmt = $this->conn->prepare($query);
            
            $stmt->bindParam(":user_id", $user_id);
            $stmt->bindParam(":role_id", $role['id']);
            
            if(!$stmt->execute()) {
                throw new Exception("Failed to assign role");
            }

            $this->conn->commit();
            return true;
        } catch(Exception $e) {
            $this->conn->rollBack();
            return false;
        }
    }

    public function update($id, $full_name) {
        $query = "UPDATE " . $this->table . "
                SET full_name = :full_name
                WHERE id = :id";
        
        $stmt = $this->conn->prepare($query);
        
        $stmt->bindParam(":full_name", $full_name);
        $stmt->bindParam(":id", $id);
        
        return $stmt->execute();
    }

    public function delete($id) {
        $query = "DELETE FROM " . $this->table . " WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $id);
        return $stmt->execute();
    }

    public function getStats($id) {
        $query = "SELECT 
                    COUNT(DISTINCT o.id) as total_orders,
                    SUM(o.total) as total_order_value,
                    COUNT(DISTINCT c.id) as total_customers,
                    AVG(o.total) as average_order_value
                 FROM orders o
                 JOIN customers c ON c.id = o.customer_id
                 WHERE o.referee_id = :id
                 AND o.status = 'completed'";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $id);
        $stmt->execute();
        
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if($row) {
            return [
                'total_orders' => (int)$row['total_orders'],
                'total_order_value' => (float)$row['total_order_value'],
                'total_customers' => (int)$row['total_customers'],
                'average_order_value' => (float)$row['average_order_value']
            ];
        }
        
        return false;
    }
    public function getEarnings($id) {
        $query = "SELECT r.*, o.order_number, o.total as order_total
                 FROM referral_earnings r
                 JOIN orders o ON o.id = r.order_id
                 WHERE r.referee_id = :id
                 ORDER BY r.created_at DESC";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $id);
        $stmt->execute();
        
        $earnings = [];
        while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $earnings[] = [
                'id' => $row['id'],
                'order_number' => $row['order_number'],
                'order_total' => (float)$row['order_total'],
                'amount' => (float)$row['amount'],
                'percentage' => (float)$row['percentage'],
                'created_at' => $row['created_at']
            ];
        }
        
        return $earnings;
    }
}