<?php
require_once "../../config/database.php";

header("Content-Type: application/json");

$sql = "
SELECT 
    courses.id,
    courses.name,
    staff.staff_code,
    staff.position
FROM courses
LEFT JOIN staff ON courses.staff_id = staff.id
ORDER BY courses.id DESC
";

$stmt = $conn->prepare($sql);
$stmt->execute();

echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));