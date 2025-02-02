<?php
class Database {
    // Database credentials from environment variables
    private $host;
    private $db_name;
    private $username;
    private $password;
    private $port;
    private $conn;

    public function __construct() {
        // Load environment variables
        $this->loadEnvironmentVariables();

        // Set database configuration
        $this->host = getenv('DB_HOST') ?: 'localhost';
        $this->db_name = getenv('DB_DATABASE') ?: 'medisync';
        $this->username = getenv('DB_USERNAME') ?: 'root';
        $this->password = getenv('DB_PASSWORD') ?: '';
        $this->port = getenv('DB_PORT') ?: '3306';
    }

    // Get database connection
    public function getConnection() {
        $this->conn = null;

        try {
            // Create connection with error handling and UTF-8 support
            $dsn = "mysql:host={$this->host};port={$this->port};dbname={$this->db_name};charset=utf8mb4";
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
                PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci"
            ];

            $this->conn = new PDO($dsn, $this->username, $this->password, $options);

        } catch(PDOException $e) {
            // Log error and return generic message in production
            $this->logError($e);
            if (getenv('APP_ENV') === 'development') {
                throw new Exception("Connection error: " . $e->getMessage());
            } else {
                throw new Exception("Connection error. Please try again later.");
            }
        }

        return $this->conn;
    }

    // Load environment variables from .env file
    private function loadEnvironmentVariables() {
        $envFile = __DIR__ . '/../.env';
        
        if (file_exists($envFile)) {
            $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
            foreach ($lines as $line) {
                if (strpos($line, '=') !== false && strpos($line, '#') !== 0) {
                    list($key, $value) = explode('=', $line, 2);
                    $key = trim($key);
                    $value = trim($value);
                    
                    // Remove quotes if present
                    if (preg_match('/^(["\']).*\1$/', $value)) {
                        $value = substr($value, 1, -1);
                    }
                    
                    putenv("$key=$value");
                }
            }
        }
    }

    // Log database errors
    private function logError($exception) {
        $logFile = __DIR__ . '/../logs/db-errors.log';
        $timestamp = date('Y-m-d H:i:s');
        $message = "[{$timestamp}] Database Error: {$exception->getMessage()}\n";
        $message .= "File: {$exception->getFile()}, Line: {$exception->getLine()}\n";
        $message .= "Trace:\n{$exception->getTraceAsString()}\n\n";

        // Create logs directory if it doesn't exist
        if (!is_dir(dirname($logFile))) {
            mkdir(dirname($logFile), 0755, true);
        }

        // Append error to log file
        file_put_contents($logFile, $message, FILE_APPEND);
    }

    // Get current database name
    public function getDatabaseName() {
        return $this->db_name;
    }

    // Check database connection
    public function testConnection() {
        try {
            $conn = $this->getConnection();
            return [
                'success' => true,
                'message' => 'Database connection successful',
                'version' => $conn->getAttribute(PDO::ATTR_SERVER_VERSION)
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
