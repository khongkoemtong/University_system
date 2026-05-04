<?php
require_once __DIR__ . "/../../../config/database.php";
header("Content-Type: application/json");

$data = json_decode(file_get_contents("php://input"), true);

$id = $data["id"] ?? "";

if (empty($id)) {
    echo json_encode(["success" => false, "message" => "Role id is required"]);
    exit;
}

try {
    $stmt = $conn->prepare("DELETE FROM roles WHERE id = ?");
    $stmt->execute([$id]);

    echo json_encode(["success" => true, "message" => "Role deleted successfully"]);
} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}