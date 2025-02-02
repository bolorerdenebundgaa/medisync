<?php
/**
 * Database Configuration Example
 * Copy this file to 'Database.php' and update the values according to your setup
 */

class Database {
    // Database credentials
    private $host = "localhost";
    private $db_name = "medisync";
    private $username = "your_username";
    private $password = "your_password";
    private $port = "3306";
    private $charset = "utf8mb4";
    public $conn;

    // Get database connection
    public function getConnection() {
        $this->conn = null;

        try {
            $dsn = "mysql:host={$this->host};port={$this->port};dbname={$this->db_name};charset={$this->charset}";
            $this->conn = new PDO($dsn, $this->username, $this->password, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
                PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES {$this->charset}"
            ]);
        } catch(PDOException $e) {
            error_log("Connection Error: " . $e->getMessage());
            throw new Exception("Database connection failed. Please check your configuration.");
        }

        return $this->conn;
    }

    // Get database configuration
    public static function getConfig() {
        return [
            'database' => [
                'host' => 'localhost',
                'name' => 'medisync',
                'username' => 'your_username',
                'password' => 'your_password',
                'port' => '3306',
                'charset' => 'utf8mb4'
            ]
        ];
    }

    // Test database connection
    public function testConnection() {
        try {
            $this->getConnection();
            return [
                'success' => true,
                'message' => 'Database connection successful'
            ];
        } catch(Exception $e) {
            return [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
    }

    // Close database connection
    public function closeConnection() {
        $this->conn = null;
    }
}

// Example usage:
/*
try {
    $database = new Database();
    $db = $database->getConnection();
    
    // Your database operations here
    
    $database->closeConnection();
} catch(Exception $e) {
    // Handle error
    error_log($e->getMessage());
}
*/
