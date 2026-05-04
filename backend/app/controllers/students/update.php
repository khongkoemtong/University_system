<?php
header("Content-Type: application/json");

require_once __DIR__ . "/../../../config/database.php";

$data = json_decode(file_get_contents("php://input"), true);

$id = $data["id"] ?? null;
$name = $data["name"] ?? "";
$gender = $data["gender"] ?? "";
$email = $data["email"] ?? "";
$phone = $data["phone"] ?? "";

if (!$id) {
    echo json_encode([
        "success" => false,
        "message" => "ID is required"
    ]);
    exit;
}

try {
    $stmt = $conn->prepare("
        UPDATE students 
        SET name = :name,
            gender = :gender,
            email = :email,
            phone = :phone
        WHERE id = :id
    ");

    $stmt->execute([
        ":id" => $id,
        ":name" => $name,
        ":gender" => $gender,
        ":email" => $email,
        ":phone" => $phone
    ]);

    if ($stmt->rowCount() > 0) {
        echo json_encode([
            "success" => true,
            "message" => "Student updated successfully"
        ]);
    } else {
        echo json_encode([
            "success" => false,
            "message" => "Student not found or no data changed"
        ]);
    }

} catch (PDOException $e) {
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}