<?php
require_once __DIR__ . "/../../../config/database.php";
header("Content-Type: application/json");

try {
    $stmt = $conn->prepare("
        SELECT 
            rp.role_id,
            r.name AS role_name,
            rp.permission_id,
            p.name AS permission_name
        FROM role_permissions rp
        JOIN roles r ON rp.role_id = r.id
        JOIN permissions p ON rp.permission_id = p.id
        ORDER BY rp.role_id ASC
    ");
    $stmt->execute();

    echo json_encode([
        "success" => true,
        "data" => $stmt->fetchAll(PDO::FETCH_ASSOC)
    ]);
} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}