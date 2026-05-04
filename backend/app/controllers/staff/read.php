<?php
require_once "../../../config/database.php";
header("Content-Type: application/json");

$sql = "
SELECT 
    staff.id,
    staff.staff_code,
    staff.position,
    users.name,
    users.email
FROM staff
LEFT JOIN users ON staff.user_id = users.id
ORDER BY staff.id DESC
";

$stmt = $conn->prepare($sql);
$stmt->execute();

echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));