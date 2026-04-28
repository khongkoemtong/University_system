<?php
require_once "../../../config/database.php";
header("Content-Type: application/json");

$sql = "SELECT users.*, roles.name as role_name 
        FROM users 
        JOIN roles ON users.role_id = roles.id";

$stmt = $conn->prepare($sql);
$stmt->execute();

$data = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode($data);
?>