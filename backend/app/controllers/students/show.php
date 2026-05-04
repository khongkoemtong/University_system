<?php
header("Content-Type: application/json");

require_once __DIR__ . "/../../../config/database.php";

$id = $_GET["id"] ?? null;

if (!$id) {
    echo json_encode([
        "success" => false,
        "message" => "ID is required"
    ]);
    exit;
}

try {
    $stmt = $conn->prepare("SELECT * FROM students WHERE id = :id");
    $stmt->execute([":id" => $id]);

    $student = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($student) {
        echo json_encode([
            "success" => true,
            "data" => $student
        ]);
    } else {
        echo json_encode([
            "success" => false,
            "message" => "Student not found"
        ]);
    }

} catch (PDOException $e) {
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}