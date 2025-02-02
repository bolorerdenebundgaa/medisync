<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Log request details
error_log("Test endpoint accessed: " . date('Y-m-d H:i:s'));
error_log("Request headers: " . json_encode(getallheaders()));

echo json_encode([
    "success" => true,
    "message" => "API is working",
    "timestamp" => date('Y-m-d H:i:s')
]);