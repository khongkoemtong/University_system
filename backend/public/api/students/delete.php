<?php
require_once "../../../config/database.php";
header("Content-Type: application/json");

$data = json_decode(file_get_contents("php://input"), true);

$id = $data["id"] ?? 0;

$stmt = $conn->prepare("DELETE FROM students WHERE id = :id");
$stmt->execute([":id" => $id]);

echo json_encode([
    "success" => true,
    "message" => "Student deleted successfully"
]);