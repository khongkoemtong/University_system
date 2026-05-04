<?php
require_once __DIR__ . "/../../../config/database.php";
require_once __DIR__ . "/../../helpers/response.php";
require_once __DIR__ . "/../../services/CourseService.php";

try {
    $service = new CourseService($conn);
    successResponse($service->getAllCourses(), "Courses fetched successfully");
} catch (Throwable $e) {
    errorResponse($e->getMessage(), 500);
}
