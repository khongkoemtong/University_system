<?php
require_once __DIR__ . "/../../../config/database.php";
header("Content-Type: application/json");

$id = $_GET["id"] ?? "";

if (empty($id)) {
    echo json_encode(["success" => false, "message" => "Role id is required"]);
    exit;
}

try {
    $stmt = $conn->prepare("SELECT * FROM roles WHERE id = ?");
    $stmt->execute([$id]);

    $role = $stmt->fetch(PDO::FETCH_ASSOC);

    echo json_encode([
        "success" => $role ? true : false,
        "data" => $role,
        "message" => $role ? "Role found" : "Role not found"
    ]);
} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}