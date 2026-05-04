<?php
require_once __DIR__ . "/../../../config/database.php";
header("Content-Type: application/json");

$data = json_decode(file_get_contents("php://input"), true);

$id = $data["id"] ?? "";
$name = $data["name"] ?? "";

if (empty($id) || empty($name)) {
    echo json_encode(["success" => false, "message" => "Permission id and name are required"]);
    exit;
}

try {
    $stmt = $conn->prepare("UPDATE permissions SET name = ? WHERE id = ?");
    $stmt->execute([$name, $id]);

    echo json_encode(["success" => true, "message" => "Permission updated successfully"]);
} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}