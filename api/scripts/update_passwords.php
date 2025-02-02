<?php
require_once '../config/Database.php';

$database = new Database();
$db = $database->getConnection();

// Get all users with plain passwords
$query = "SELECT id, password FROM users WHERE LENGTH(password) < 60";
$stmt = $db->prepare($query);
$stmt->execute();

while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    // Hash the plain password
    $hashedPassword = password_hash($row['password'], PASSWORD_BCRYPT);
    
    // Update the user's password
    $updateQuery = "UPDATE users SET password = :password WHERE id = :id";
    $updateStmt = $db->prepare($updateQuery);
    $updateStmt->bindParam(":password", $hashedPassword);
    $updateStmt->bindParam(":id", $row['id']);
    $updateStmt->execute();
}

echo "Passwords updated successfully\n";