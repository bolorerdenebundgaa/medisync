<?php
require_once __DIR__ . '/../config/Database.php';

function initializeDatabase() {
    try {
        // Get database configuration
        $config = require_once __DIR__ . '/../config/config.php';
        $dbConfig = $config['database'];

        // Create initial connection without database name
        $pdo = new PDO(
            "mysql:host={$dbConfig['host']};charset=utf8mb4",
            $dbConfig['username'],
            $dbConfig['password'],
            [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ]
        );

        // Read and execute SQL file
        $sql = file_get_contents(__DIR__ . '/database.sql');
        
        // Split SQL file into individual statements
        $statements = array_filter(
            array_map(
                'trim',
                explode(';', $sql)
            )
        );

        // Execute each statement
        foreach ($statements as $statement) {
            if (!empty($statement)) {
                $pdo->exec($statement);
                echo "Executed: " . substr($statement, 0, 50) . "...\n";
            }
        }

        echo "\nDatabase initialization completed successfully!\n";
        echo "Default admin credentials:\n";
        echo "Email: admin@medisync.com\n";
        echo "Password: admin123\n";

    } catch (PDOException $e) {
        die("Database initialization failed: " . $e->getMessage() . "\n");
    }
}

// Check if script is being run from command line
if (php_sapi_name() === 'cli') {
    echo "Starting database initialization...\n";
    initializeDatabase();
} else {
    die("This script should be run from the command line");
}

function createUploadsDirectory() {
    $uploadsDir = __DIR__ . '/../uploads';
    if (!file_exists($uploadsDir)) {
        if (mkdir($uploadsDir, 0755, true)) {
            echo "Created uploads directory at: $uploadsDir\n";
            
            // Create subdirectories
            $subdirs = ['products', 'prescriptions', 'profiles'];
            foreach ($subdirs as $dir) {
                $path = $uploadsDir . '/' . $dir;
                if (mkdir($path, 0755, true)) {
                    echo "Created subdirectory: $dir\n";
                    
                    // Create .htaccess to protect uploads directory
                    $htaccess = $path . '/.htaccess';
                    $content = "Options -Indexes\n";
                    $content .= "Order allow,deny\n";
                    $content .= "Allow from all\n";
                    $content .= "# Only allow image files\n";
                    $content .= "<FilesMatch \".(jpg|jpeg|png|gif|webp)$\">\n";
                    $content .= "    Order Allow,Deny\n";
                    $content .= "    Allow from all\n";
                    $content .= "</FilesMatch>\n";
                    
                    file_put_contents($htaccess, $content);
                    echo "Created .htaccess in: $dir\n";
                }
            }
        } else {
            echo "Failed to create uploads directory\n";
        }
    } else {
        echo "Uploads directory already exists\n";
    }
}

// Create necessary directories
createUploadsDirectory();

echo "\nSetup completed successfully!\n";
