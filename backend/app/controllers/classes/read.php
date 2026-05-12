<?php
require_once __DIR__ . "/../../../config/database.php";
require_once __DIR__ . "/../../helpers/auth.php";
require_once __DIR__ . "/../../helpers/response.php";
require_once __DIR__ . "/../../services/ClassroomService.php";

try {
    $classroomService = new ClassroomService($conn);
    successResponse($classroomService->getAllClasses(getAuthenticatedUser()), "Classes fetched successfully");
} catch (Throwable $e) {
    errorResponse($e->getMessage(), 500);
}
