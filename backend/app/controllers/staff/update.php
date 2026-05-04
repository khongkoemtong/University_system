<?php
require_once "../../../config/database.php";
header("Content-Type: application/json");

$data = json_decode(file_get_contents("php://input"), true);

$id = $data["id"] ?? 0;
$user_id = $data["user_id"] ?? null;
$staff_code = $data["staff_code"] ?? "";
$position = $data["position"] ?? "";

$stmt = $conn->prepare("
    UPDATE staff
    SET user_id = :user_id,
        staff_code = :staff_code,
        position = :position
    WHERE id = :id
");

$stmt->execute([
    ":id" => $id,
    ":user_id" => $user_id,
    ":staff_code" => $staff_code,
    ":position" => $position
]);

echo json_encode([
    "success" => true,
    "message" => "Staff updated successfully"
]);