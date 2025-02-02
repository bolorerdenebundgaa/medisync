<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Handle file upload
if(isset($_FILES["image"])) {
    $target_dir = "../uploads/";
    if(!file_exists($target_dir)) {
        mkdir($target_dir, 0777, true);
    }

    $file = $_FILES["image"];
    $imageFileType = strtolower(pathinfo($file["name"], PATHINFO_EXTENSION));
    
    // Generate unique filename
    $target_file = $target_dir . bin2hex(random_bytes(16)) . "." . $imageFileType;
    
    // Check if image file is actual image
    $check = getimagesize($file["tmp_name"]);
    if($check === false) {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "File is not an image"
        ]);
        exit;
    }
    
    // Check file size (5MB limit)
    if ($file["size"] > 5000000) {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "File is too large"
        ]);
        exit;
    }
    
    // Allow certain file formats
    if($imageFileType != "jpg" && $imageFileType != "png" && $imageFileType != "jpeg") {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Only JPG, JPEG & PNG files are allowed"
        ]);
        exit;
    }
    
    if(move_uploaded_file($file["tmp_name"], $target_file)) {
        http_response_code(200);
        echo json_encode([
            "success" => true,
            "url" => str_replace("../", "", $target_file)
        ]);
    } else {
        http_response_code(500);
        echo json_encode([
            "success" => false,
            "message" => "Error uploading file"
        ]);
    }
} else {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "No file uploaded"
    ]);
}