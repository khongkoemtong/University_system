<?php
require_once "../../../config/database.php";
header("Content-Type: application/json");

$data = json_decode(file_get_contents("php://input"), true);

$user_id = $data["user_id"] ?? null;
$staff_code = $data["staff_code"] ?? "";
$position = $data["position"] ?? "";

$stmt = $conn->prepare("
    INSERT INTO staff (user_id, staff_code, position)
    VALUES (:user_id, :staff_code, :position)
");

$stmt->execute([
    ":user_id" => $user_id,
    ":staff_code" => $staff_code,
    ":position" => $position
]);

echo json_encode([
    "success" => true,
    "message" => "Staff created successfully"
]);