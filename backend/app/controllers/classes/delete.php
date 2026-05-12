<?php
require_once __DIR__ . "/../../../config/database.php";
require_once __DIR__ . "/../../helpers/auth.php";
require_once __DIR__ . "/../../helpers/request.php";
require_once __DIR__ . "/../../helpers/response.php";
require_once __DIR__ . "/../../services/ClassroomService.php";

try {
    $data = getJsonInput();
    $service = new ClassroomService($conn);
    $deleted = $service->deleteClass($data["id"] ?? null, getAuthenticatedUser());

    if (!$deleted) {
        errorResponse("Class not found", 404);
    }

    successResponse([], "Class deleted successfully");
} catch (InvalidArgumentException $e) {
    errorResponse($e->getMessage(), 422);
} catch (Throwable $e) {
    errorResponse($e->getMessage(), 500);
}
