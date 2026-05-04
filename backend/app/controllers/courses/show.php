<?php
require_once __DIR__ . "/../../../config/database.php";
header("Content-Type: application/json");

$id = $_GET["id"] ?? "";

if (empty($id)) {
    echo json_encode(["success" => false, "message" => "Course id is required"]);
    exit;
}

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
        WHERE courses.id = ?
    ");
    $stmt->execute([$id]);

    $course = $stmt->fetch(PDO::FETCH_ASSOC);

    echo json_encode([
        "success" => $course ? true : false,
        "data" => $course,
        "message" => $course ? "Course found" : "Course not found"
    ]);
} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}