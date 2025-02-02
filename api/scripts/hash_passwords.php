<?php
require_once '../config/Database.php';

$database = new Database();
$db = $database->getConnection();

// Get all users with plain text passwords (not hashed)
$query = "SELECT id, password FROM users WHERE LENGTH(password) < 60";
$stmt = $db->prepare($query);
$stmt->execute();

$updated = 0;
while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    // Hash the plain password
    $hashedPassword = password_hash($row['password'], PASSWORD_BCRYPT);
    
    // Update the user's password
    $updateQuery = "UPDATE users SET password = :password WHERE id = :id";
    $updateStmt = $db->prepare($updateQuery);
    $updateStmt->bindParam(":password", $hashedPassword);
    $updateStmt->bindParam(":id", $row['id']);
    
    if ($updateStmt->execute()) {
        $updated++;
        echo "Updated password for user ID: {$row['id']}\n";
    }
}

echo "\nCompleted! Updated $updated passwords successfully\n";