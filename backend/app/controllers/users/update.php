<?php
require_once "../../../config/database.php";
header("Content-Type: application/json");

$id = $_POST["id"] ?? "";
$name = $_POST["name"] ?? "";
$email = $_POST["email"] ?? "";
$role_id = $_POST["role_id"] ?? "";

if ($id == "" || $name == "" || $email == "" || $role_id == "") {
    echo json_encode(["message" => "All fields required"]);
    exit;
}

$sql = "UPDATE users 
        SET name = :name, email = :email, role_id = :role_id 
        WHERE id = :id";

$stmt = $conn->prepare($sql);

$stmt->execute([
    ":id" => $id,
    ":name" => $name,
    ":email" => $email,
    ":role_id" => $role_id
]);

echo json_encode(["message" => "User updated"]);
?>