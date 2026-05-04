<?php
require_once __DIR__ . "/../../../config/database.php";
require_once __DIR__ . "/../../helpers/request.php";
require_once __DIR__ . "/../../helpers/response.php";
require_once __DIR__ . "/../../services/StudentService.php";

$data = getJsonInput();
$id = $data["id"] ?? null;

try {
    $studentService = new StudentService($conn);
    $student = $studentService->updateStudent($id, $data);

    if (!$student) {
        errorResponse("Student not found", 404);
    }
    
    successResponse($student, "Student updated successfully");
} catch (InvalidArgumentException $e) {
    errorResponse($e->getMessage(), 422);
} catch (Throwable $e) {
    errorResponse($e->getMessage(), 500);
}
