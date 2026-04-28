<?php
require_once "../../../config/database.php";
header("Content-Type: application/json");

$id = $_GET["id"] ?? "";

if ($id == "") {
    echo json_encode(["message" => "ID required"]);
    exit;
}

$sql = "SELECT users.*, roles.name as role_name 
        FROM users 
        JOIN roles ON users.role_id = roles.id
        WHERE users.id = :id";

$stmt = $conn->prepare($sql);
$stmt->execute([":id" => $id]);

$user = $stmt->fetch(PDO::FETCH_ASSOC);

if ($user) {
    echo json_encode($user);
} else {
    echo json_encode(["message" => "User not found"]);
}
?>