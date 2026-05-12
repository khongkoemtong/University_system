<?php
require_once __DIR__ . "/../../../config/database.php";
require_once __DIR__ . "/../../helpers/response.php";
require_once __DIR__ . "/../../services/ClassroomService.php";

try {
    $service = new ClassroomService($conn);
    $class = $service->getClassById($_GET["id"] ?? null);

    if (!$class) {
        errorResponse("Class not found", 404);
    }

    successResponse($class, "Class fetched successfully");
} catch (InvalidArgumentException $e) {
    errorResponse($e->getMessage(), 422);
} catch (Throwable $e) {
    errorResponse($e->getMessage(), 500);
}
