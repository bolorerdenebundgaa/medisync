<?php
class WebUser {
    private $conn;
    private $table = "web_users";

    public $id;
    public $email;
    public $password;
    public $full_name;
    public $phone;
    public $shipping_address;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function register() {
        try {
            $this->conn->beginTransaction();
            
            // Check if email already exists
            $query = "SELECT id FROM " . $this->table . " WHERE email = :email";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":email", $this->email);
            $stmt->execute();
            
            if($stmt->rowCount() > 0) {
                throw new Exception("Email already exists");
            }

            // Generate proper UUID
            $id = $this->conn->generateUUID();

            // Hash password
            $password_hash = password_hash($this->password, PASSWORD_BCRYPT);

            // Create user
            $query = "INSERT INTO " . $this->table . "
                    SET id = :id,
                        email = :email,
                        password = :password,
                        full_name = :full_name";
            
            $stmt = $this->conn->prepare($query);
            
            $stmt->bindParam(":id", $id);
            $stmt->bindParam(":email", $this->email);
            $stmt->bindParam(":password", $password_hash);
            $stmt->bindParam(":full_name", $this->full_name);
            
            if(!$stmt->execute()) {
                throw new Exception("Failed to create user");
            }
            
            error_log("User created successfully: " . $this->email);
            
            // Create cart for the user
            $cart_id = $this->conn->generateUUID();
            $query = "INSERT INTO carts (id, user_id) VALUES (:id, :user_id)";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":id", $cart_id);
            $stmt->bindParam(":user_id", $id);
            
            if(!$stmt->execute()) {
                throw new Exception("Failed to create cart");
            }

            // Create wishlist
            $wishlist_id = $this->conn->generateUUID();
            $query = "INSERT INTO wishlists (id, user_id) VALUES (:id, :user_id)";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":id", $wishlist_id);
            $stmt->bindParam(":user_id", $id);
            
            if(!$stmt->execute()) {
                throw new Exception("Failed to create wishlist");
            }

            $this->conn->commit();
            return true;
        } catch(Exception $e) {
            $this->conn->rollBack();
            error_log("Registration error: " . $e->getMessage());
            return false;
        }
    }

    public function login() {
        $query = "SELECT id, email, password, full_name FROM " . $this->table . " 
                 WHERE email = :email AND is_active = 1 LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":email", $this->email);
        $stmt->execute();
        
        error_log("Login attempt for email: " . $this->email);

        if($stmt->rowCount() > 0) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            if(password_verify($this->password, $row['password'])) {
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
                
                if(!$stmt->execute()) {
                    throw new Exception("Failed to update token");
                }
                
                return [
                    'id' => $row['id'],
                    'email' => $row['email'],
                    'full_name' => $row['full_name'],
                    'token' => $token
                ];
            }
        }
        return false;
    }

    public function logout($token) {
        $query = "UPDATE " . $this->table . "
                 SET auth_token = NULL,
                     token_expires = NULL
                 WHERE auth_token = :token";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":token", $token);
        return $stmt->execute();
    }
    
    public function getUserByToken($token) {
        $query = "SELECT id, email, full_name, auth_token, token_expires 
                 FROM " . $this->table . " 
                 WHERE auth_token = :token 
                 AND token_expires > NOW() 
                 LIMIT 1";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":token", $token);
        $stmt->execute();
        
        if($stmt->rowCount() > 0) {
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            // Verify token matches
            if($user['auth_token'] === $token) {
                return $user;
            }
        }
        
        return false;
    }

    public function requestPasswordReset($email) {
        $query = "SELECT id FROM " . $this->table . " WHERE email = :email LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":email", $email);
        $stmt->execute();

        if($stmt->rowCount() > 0) {
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            $token = bin2hex(random_bytes(32));
            $expires = date('Y-m-d H:i:s', strtotime('+1 hour'));

            $query = "INSERT INTO password_resets (id, user_id, token, expires_at)
                     VALUES (:id, :user_id, :token, :expires_at)";
            $stmt = $this->conn->prepare($query);
            
            $reset_id = bin2hex(random_bytes(16));
            $stmt->bindParam(":id", $reset_id);
            $stmt->bindParam(":user_id", $user['id']);
            $stmt->bindParam(":token", $token);
            $stmt->bindParam(":expires_at", $expires);

            return $stmt->execute();
        }
        return false;
    }

    public function resetPassword($token, $new_password) {
        $query = "SELECT user_id FROM password_resets 
                 WHERE token = :token 
                 AND expires_at > NOW() 
                 AND used = 0 
                 LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":token", $token);
        $stmt->execute();

        if($stmt->rowCount() > 0) {
            $reset = $stmt->fetch(PDO::FETCH_ASSOC);
            $password_hash = password_hash($new_password, PASSWORD_BCRYPT);

            // Update password
            $query = "UPDATE " . $this->table . "
                     SET password = :password
                     WHERE id = :id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":password", $password_hash);
            $stmt->bindParam(":id", $reset['user_id']);

            if($stmt->execute()) {
                // Mark reset token as used
                $query = "UPDATE password_resets 
                         SET used = 1 
                         WHERE token = :token";
                $stmt = $this->conn->prepare($query);
                $stmt->bindParam(":token", $token);
                return $stmt->execute();
            }
        }
        return false;
    }
}