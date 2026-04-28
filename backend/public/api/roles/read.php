<?php
require_once __DIR__ . "/../../../config/database.php";
header("Content-Type: application/json");

try {
    $stmt = $conn->prepare("SELECT * FROM roles ORDER BY id DESC");
    $stmt->execute();

    echo json_encode([
        "success" => true,
        "data" => $stmt->fetchAll(PDO::FETCH_ASSOC)
    ]);
} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}