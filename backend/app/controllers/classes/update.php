<?php
require_once __DIR__ . "/../../../config/database.php";
require_once __DIR__ . "/../../helpers/auth.php";
require_once __DIR__ . "/../../helpers/request.php";
require_once __DIR__ . "/../../helpers/response.php";
require_once __DIR__ . "/../../services/ClassroomService.php";

try {
    $data = getJsonInput();
    $service = new ClassroomService($conn);
    $class = $service->updateClass($data["id"] ?? null, $data, getAuthenticatedUser());

    if (!$class) {
        errorResponse("Class not found", 404);
    }

    successResponse($class, "Class updated successfully");
} catch (InvalidArgumentException $e) {
    errorResponse($e->getMessage(), 422);
} catch (Throwable $e) {
    errorResponse($e->getMessage(), 500);
}
