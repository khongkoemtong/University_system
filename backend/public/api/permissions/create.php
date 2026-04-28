<?php
require_once __DIR__ . "/../../../config/database.php";
header("Content-Type: application/json");

$data = json_decode(file_get_contents("php://input"), true);

$name = $data["name"] ?? "";

if (empty($name)) {
    echo json_encode(["success" => false, "message" => "Permission name is required"]);
    exit;
}

try {
    $stmt = $conn->prepare("INSERT INTO permissions (name) VALUES (?)");
    $stmt->execute([$name]);

    echo json_encode(["success" => true, "message" => "Permission created successfully"]);
} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}