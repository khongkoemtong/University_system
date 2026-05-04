<?php
require_once __DIR__ . "/../../../config/database.php";
require_once __DIR__ . "/../../helpers/request.php";
require_once __DIR__ . "/../../helpers/response.php";
require_once __DIR__ . "/../../services/CourseService.php";

try {
    $data = getJsonInput();
    $service = new CourseService($conn);
    $deleted = $service->deleteCourse($data["id"] ?? null);

    if (!$deleted) {
        errorResponse("Course not found", 404);
    }

    successResponse([], "Course deleted successfully");
} catch (InvalidArgumentException $e) {
    errorResponse($e->getMessage(), 422);
} catch (Throwable $e) {
    errorResponse($e->getMessage(), 500);
}
