<?php
require_once __DIR__ . "/../../../config/database.php";
header("Content-Type: application/json");

$role_id = $_GET["role_id"] ?? "";

if (empty($role_id)) {
    echo json_encode(["success" => false, "message" => "role_id is required"]);
    exit;
}

try {
    $stmt = $conn->prepare("
        SELECT 
            p.id,
            p.name
        FROM role_permissions rp
        JOIN permissions p ON rp.permission_id = p.id
        WHERE rp.role_id = ?
        ORDER BY p.id ASC
    ");
    $stmt->execute([$role_id]);

    echo json_encode([
        "success" => true,
        "role_id" => $role_id,
        "permissions" => $stmt->fetchAll(PDO::FETCH_ASSOC)
    ]);
} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}