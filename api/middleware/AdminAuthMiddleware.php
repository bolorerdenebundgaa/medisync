<?php
class AdminAuthMiddleware {
    private $db;
    private $admin;

    public function __construct($database) {
        $this->db = $database;
        $this->admin = new Admin($this->db);
    }

    public function authenticate() {
        // Handle preflight requests
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            return true;
        }

        // Get authorization header
        $headers = getallheaders();
        $auth = isset($headers['Authorization']) ? $headers['Authorization'] : '';

        error_log("Auth header: " . ($auth ?: 'none'));

        if(empty($auth)) {
            http_response_code(401);
            echo json_encode([
                "success" => false,
                "message" => "No authorization token provided"
            ]);
            return false;
        }

        // Extract token
        $token = str_replace('Bearer ', '', $auth);
        
        error_log("Verifying token: " . $token);
        
        try {
            $result = $this->admin->verifyToken($token);
            if(!$result) {
                http_response_code(401);
                echo json_encode([
                    "success" => false,
                    "message" => "Invalid or expired token"
                ]);
                return false;
            } else {
                error_log("Token verified successfully");
            }
            return true;
        } catch(Exception $e) {
            error_log("Authentication error: " . $e->getMessage());
            http_response_code(401);
            echo json_encode([
                "success" => false,
                "message" => "Authentication failed"
            ]);
            return false;
        }
    }
}