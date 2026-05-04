<?php
require_once __DIR__ . "/../../../config/database.php";
require_once __DIR__ . "/../../helpers/request.php";
require_once __DIR__ . "/../../helpers/response.php";
require_once __DIR__ . "/../../services/CourseService.php";

try {
    $data = getJsonInput();
    $service = new CourseService($conn);
    $course = $service->updateCourse($data["id"] ?? null, $data);

    if (!$course) {
        errorResponse("Course not found", 404);
    }

    successResponse($course, "Course updated successfully");
} catch (InvalidArgumentException $e) {
    errorResponse($e->getMessage(), 422);
} catch (Throwable $e) {
    errorResponse($e->getMessage(), 500);
}
