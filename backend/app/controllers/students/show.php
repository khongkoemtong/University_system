<?php
require_once __DIR__ . "/../../../config/database.php";
require_once __DIR__ . "/../../helpers/response.php";
require_once __DIR__ . "/../../helpers/validation.php";
require_once __DIR__ . "/../../services/StudentService.php";

$id = $_GET["id"] ?? null;

if (!validateInteger($id)) {
    errorResponse("Valid ID is required", 422);
}

try {
    $studentService = new StudentService($conn);
    $student = $studentService->getStudentById($id);

    if (!$student) {
        errorResponse("Student not found", 404);
    }
    
    successResponse($student, "Student fetched successfully");
} catch (Throwable $e) {
    errorResponse($e->getMessage(), 500);
}
