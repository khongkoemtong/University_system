<?php
require_once __DIR__ . "/../../../config/database.php";
header("Content-Type: application/json");

$data = json_decode(file_get_contents("php://input"), true);

$name = $data["name"] ?? "";
$staff_id = $data["staff_id"] ?? null;

if (empty($name)) {
    echo json_encode(["success" => false, "message" => "Course name is required"]);
    exit;
}

try {
    $stmt = $conn->prepare("INSERT INTO courses (name, staff_id) VALUES (?, ?)");
    $stmt->execute([$name, $staff_id]);

    echo json_encode(["success" => true, "message" => "Course created successfully"]);
} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}