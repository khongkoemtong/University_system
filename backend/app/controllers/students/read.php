<?php
require_once __DIR__ . "/../../../config/database.php";
require_once __DIR__ . "/../../helpers/response.php";
require_once __DIR__ . "/../../services/StudentService.php";

try {
    $studentService = new StudentService($conn);
    successResponse($studentService->getAllStudents(), "Students fetched successfully");
} catch (Throwable $e) {
    errorResponse($e->getMessage(), 500);
}
