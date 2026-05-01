<?php
require_once __DIR__ . "/../../../config/database.php";
header("Content-Type: application/json");

$data = json_decode(file_get_contents("php://input"), true);

$role_id = $data["role_id"] ?? "";
$permission_id = $data["permission_id"] ?? "";

if (empty($role_id) || empty($permission_id)) {
    echo json_encode(["success" => false, "message" => "role_id and permission_id are required"]);
    exit;
}

try {
    $stmt = $conn->prepare("
        INSERT INTO role_permissions (role_id, permission_id)
        VALUES (?, ?)
    ");
    $stmt->execute([$role_id, $permission_id]);

    echo json_encode(["success" => true, "message" => "Permission assigned"]);
} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}