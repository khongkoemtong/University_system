<?php
require_once "../../config/database.php";

header("Content-Type: application/json");

$stmt = $conn->prepare("SELECT * FROM roles");
$stmt->execute();

echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));