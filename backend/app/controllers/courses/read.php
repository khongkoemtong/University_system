<?php
require_once __DIR__ . "/../../../config/database.php";
header("Content-Type: application/json");

try {
    $stmt = $conn->prepare("
        SELECT 
            courses.id,
            courses.name,
            courses.staff_id,
            staff.staff_code,
            staff.position
        FROM courses
        LEFT JOIN staff ON courses.staff_id = staff.id
        ORDER BY courses.id DESC
    ");
    $stmt->execute();

    echo json_encode([
        "success" => true,
        "data" => $stmt->fetchAll(PDO::FETCH_ASSOC)
    ]);
} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}