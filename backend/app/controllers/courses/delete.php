<?php
require_once __DIR__ . "/../../../config/database.php";
header("Content-Type: application/json");

$data = json_decode(file_get_contents("php://input"), true);

$id = $data["id"] ?? "";

if (empty($id)) {
    echo json_encode(["success" => false, "message" => "Course id is required"]);
    exit;
}

try {
    $stmt = $conn->prepare("DELETE FROM courses WHERE id = ?");
    $stmt->execute([$id]);

    echo json_encode(["success" => true, "message" => "Course deleted successfully"]);
} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}