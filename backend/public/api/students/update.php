<?php
require_once "../../../config/database.php";
header("Content-Type: application/json");

$data = json_decode(file_get_contents("php://input"), true);

$id = $data["id"] ?? 0;
$name = $data["name"] ?? "";
$gender = $data["gender"] ?? "";
$email = $data["email"] ?? "";
$phone = $data["phone"] ?? "";

$stmt = $conn->prepare("
    UPDATE students 
    SET name = :name,
        gender = :gender,
        email = :email,
        phone = :phone
    WHERE id = :id
");

$stmt->execute([
    ":id" => $id,
    ":name" => $name,
    ":gender" => $gender,
    ":email" => $email,
    ":phone" => $phone
]);

echo json_encode([
    "success" => true,
    "message" => "Student updated successfully"
]);