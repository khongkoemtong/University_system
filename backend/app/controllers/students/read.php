<?php
header("Content-Type: application/json");

require_once __DIR__ . "/../../../config/database.php";

try {
    $stmt = $conn->prepare("SELECT * FROM students ORDER BY id DESC");
    $stmt->execute();

    echo json_encode([
        "success" => true,
        "data" => $stmt->fetchAll(PDO::FETCH_ASSOC)
    ]);
} catch (PDOException $e) {
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}