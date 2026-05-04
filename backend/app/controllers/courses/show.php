<?php
require_once __DIR__ . "/../../../config/database.php";
require_once __DIR__ . "/../../helpers/response.php";
require_once __DIR__ . "/../../services/CourseService.php";

try {
    $service = new CourseService($conn);
    $course = $service->getCourseById($_GET["id"] ?? null);

    if (!$course) {
        errorResponse("Course not found", 404);
    }

    successResponse($course, "Course fetched successfully");
} catch (InvalidArgumentException $e) {
    errorResponse($e->getMessage(), 422);
} catch (Throwable $e) {
    errorResponse($e->getMessage(), 500);
}
