<?php
require_once __DIR__ . "/../../../config/database.php";
header("Content-Type: application/json");

$id = $_GET["id"] ?? "";

if (empty($id)) {
    echo json_encode(["success" => false, "message" => "Permission id is required"]);
    exit;
}

try {
    $stmt = $conn->prepare("SELECT * FROM permissions WHERE id = ?");
    $stmt->execute([$id]);

    $permission = $stmt->fetch(PDO::FETCH_ASSOC);

    echo json_encode([
        "success" => $permission ? true : false,
        "data" => $permission,
        "message" => $permission ? "Permission found" : "Permission not found"
    ]);
} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}