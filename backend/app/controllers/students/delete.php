<?php
header("Content-Type: application/json");

require_once __DIR__ . "/../../../config/database.php";

$data = json_decode(file_get_contents("php://input"), true);

// validate id
if (!isset($data["id"]) || empty($data["id"])) {
    echo json_encode([
        "success" => false,
        "message" => "ID is required"
    ]);
    exit;
}

$id = $data["id"];

try {
    $stmt = $conn->prepare("DELETE FROM students WHERE id = :id");
    $stmt->execute([":id" => $id]);

    if ($stmt->rowCount() > 0) {
        echo json_encode([
            "success" => true,
            "message" => "Student deleted successfully"
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