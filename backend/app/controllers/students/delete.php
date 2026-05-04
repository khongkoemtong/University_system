<?php
require_once __DIR__ . "/../../../config/database.php";
require_once __DIR__ . "/../../helpers/request.php";
require_once __DIR__ . "/../../helpers/response.php";
require_once __DIR__ . "/../../services/StudentService.php";

$data = getJsonInput();
$id = $data["id"] ?? null;

try {
    $studentService = new StudentService($conn);
    $deleted = $studentService->deleteStudent($id);

    if (!$deleted) {
        errorResponse("Student not found", 404);
    }
    
    successResponse([], "Student deleted successfully");
} catch (InvalidArgumentException $e) {
    errorResponse($e->getMessage(), 422);
} catch (Throwable $e) {
    errorResponse($e->getMessage(), 500);
}
