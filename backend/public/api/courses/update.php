<?php
require_once __DIR__ . "/../../../config/database.php";
header("Content-Type: application/json");

$data = json_decode(file_get_contents("php://input"), true);

$id = $data["id"] ?? "";
$name = $data["name"] ?? "";
$staff_id = $data["staff_id"] ?? null;

if (empty($id) || empty($name)) {
    echo json_encode(["success" => false, "message" => "Course id and name are required"]);
    exit;
}

try {
    $stmt = $conn->prepare("UPDATE courses SET name = ?, staff_id = ? WHERE id = ?");
    $stmt->execute([$name, $staff_id, $id]);

    echo json_encode(["success" => true, "message" => "Course updated successfully"]);
} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}