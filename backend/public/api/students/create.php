<?php
require_once "../../../config/database.php";

header("Content-Type: application/json");

$data = json_decode(file_get_contents("php://input"), true);

$name = $data["name"] ?? "";
$gender = $data["gender"] ?? "";
$email = $data["email"] ?? "";
$phone = $data["phone"] ?? "";

$sql = "INSERT INTO students (name, gender, email, phone)
        VALUES (:name, :gender, :email, :phone)";

$stmt = $conn->prepare($sql);

$stmt->execute([
    ":name" => $name,
    ":gender" => $gender,
    ":email" => $email,
    ":phone" => $phone
]);

echo json_encode([
    "success" => true,
    "message" => "Student created successfully"
]);