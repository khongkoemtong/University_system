<?php
require_once __DIR__ . "/../../../config/database.php";
header("Content-Type: application/json");

$input = json_decode(file_get_contents("php://input"), true);

if (!$input) {
    $input = $_POST;
}

$role_id = $input["role_id"] ?? "";
$old_permission_id = $input["old_permission_id"] ?? "";
$new_permission_id = $input["new_permission_id"] ?? "";

if (empty($role_id) || empty($old_permission_id) || empty($new_permission_id)) {
    echo json_encode([
        "success" => false,
        "message" => "role_id, old_permission_id and new_permission_id are required"
    ]);
    exit;
}

try {
    $stmt = $conn->prepare("
        UPDATE role_permissions
        SET permission_id = ?
        WHERE role_id = ? AND permission_id = ?
    ");

    $stmt->execute([
        $new_permission_id,
        $role_id,
        $old_permission_id
    ]);

    echo json_encode([
        "success" => true,
        "message" => "Role permission updated successfully",
        "affected_rows" => $stmt->rowCount()
    ]);

} catch (PDOException $e) {
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}