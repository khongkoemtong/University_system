<?php
require_once __DIR__ . "/../../../config/database.php";
require_once __DIR__ . "/../../helpers/response.php";
require_once __DIR__ . "/../../helpers/request.php";
require_once __DIR__ . "/../../services/StudentService.php";

try {
    $studentService = new StudentService($conn);
    $student = $studentService->createStudent(getJsonInput());
    successResponse($student, "Student created successfully", 201);
} catch (InvalidArgumentException $e) {
    errorResponse($e->getMessage(), 422);
} catch (Throwable $e) {
    errorResponse($e->getMessage(), 500);
}
