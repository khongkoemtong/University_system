<?php
require_once "../../../config/database.php";
header("Content-Type: application/json");

$id = $_POST["id"] ?? "";

if ($id == "") {
    echo json_encode(["message" => "ID required"]);
    exit;
}

$sql = "DELETE FROM users WHERE id = :id";
$stmt = $conn->prepare($sql);

$stmt->execute([":id" => $id]);

echo json_encode(["message" => "User deleted"]);
?>