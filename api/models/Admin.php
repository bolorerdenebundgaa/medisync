<?php
class Admin {
    private $conn;
    private $table = "users";

    public $id;
    public $email;
    public $password;
    public $full_name;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function login() {
        try {
            // First check if user exists and get their password
            $query = "SELECT id, email, password, full_name FROM " . $this->table . "
                     WHERE email = :email LIMIT 1";
            
            $stmt = $this->conn->prepare($query);
            $email = trim($this->email);
            $stmt->bindParam(":email", $email);
            $stmt->execute();

            if($stmt->rowCount() > 0) {
                $row = $stmt->fetch(PDO::FETCH_ASSOC);
                
                // Verify password
                if(password_verify($this->password, $row['password'])) {
                    // Check if user has admin role
                    $query = "SELECT r.name as role
                             FROM user_roles ur
                             JOIN roles r ON r.id = ur.role_id
                             WHERE ur.user_id = :user_id
                             AND r.name = 'admin'
                             LIMIT 1";
                    
                    $stmt = $this->conn->prepare($query);
                    $stmt->bindParam(":user_id", $row['id']);
                    $stmt->execute();
                    
                    if($stmt->rowCount() > 0) {
                        $roleRow = $stmt->fetch(PDO::FETCH_ASSOC);
                        
                        // Generate token
                        $token = bin2hex(random_bytes(32));
                        
                        // Store token in database
                        $query = "UPDATE " . $this->table . "
                                 SET auth_token = :token,
                                     token_expires = DATE_ADD(NOW(), INTERVAL 24 HOUR)
                                 WHERE id = :id";
                        
                        $stmt = $this->conn->prepare($query);
                        $stmt->bindParam(":token", $token);
                        $stmt->bindParam(":id", $row['id']);
                        
                        if($stmt->execute()) {
                            error_log("Admin login successful: " . $email);
                            return [
                                'id' => $row['id'],
                                'email' => $row['email'],
                                'full_name' => $row['full_name'],
                                'role' => $roleRow['role'],
                                'token' => $token
                            ];
                        }
                    }
                }
            }
            error_log("Admin login failed: " . $email);
            return false;
        } catch(Exception $e) {
            error_log("Admin login error: " . $e->getMessage());
            throw $e;
        }
    }

    public function verifyToken($token) {
        try {
            $query = "SELECT u.id, u.email, u.full_name, r.name as role
                     FROM " . $this->table . " u
                     JOIN user_roles ur ON ur.user_id = u.id
                     JOIN roles r ON r.id = ur.role_id
                     WHERE u.auth_token = :token
                     AND u.token_expires > NOW()
                     AND r.name = 'admin'
                     LIMIT 1";
            
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":token", $token);
            $stmt->execute();
            
            if($stmt->rowCount() > 0) {
                return $stmt->fetch(PDO::FETCH_ASSOC);
            }
            return false;
        } catch(Exception $e) {
            error_log("Token verification error: " . $e->getMessage());
            throw $e;
        }
    }

    public function logout($token) {
        try {
            $query = "UPDATE " . $this->table . "
                     SET auth_token = NULL,
                         token_expires = NULL
                     WHERE auth_token = :token";
            
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":token", $token);
            return $stmt->execute();
        } catch(Exception $e) {
            error_log("Logout error: " . $e->getMessage());
            throw $e;
        }
    }
}