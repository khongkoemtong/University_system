<?php
require_once "../../../config/database.php";
header("Content-Type: application/json");

$id = $_GET["id"] ?? 0;

$stmt = $conn->prepare("SELECT * FROM staff WHERE id = :id");
$stmt->execute([":id" => $id]);

echo json_encode($stmt->fetch(PDO::FETCH_ASSOC));