<?php
require_once "../../../config/database.php";
header("Content-Type: application/json");

$data = json_decode(file_get_contents("php://input"), true);

$name = $data["name"] ?? "";
$email = $data["email"] ?? "";
$password = $data["password"] ?? "";
$role_id = $data["role_id"] ?? "";

if ($name == "" || $email == "" || $password == "" || $role_id == "") {
    echo json_encode(["success" => false, "message" => "All fields are required"]);
    exit;
}

$hashPassword = password_hash($password, PASSWORD_DEFAULT);

$sql = "INSERT INTO users (name, email, password, role_id)
        VALUES (:name, :email, :password, :role_id)";

$stmt = $conn->prepare($sql);

$stmt->execute([
    ":name" => $name,
    ":email" => $email,
    ":password" => $hashPassword,
    ":role_id" => $role_id
]);

echo json_encode([
    "success" => true,
    "message" => "User created successfully"
]);
?>