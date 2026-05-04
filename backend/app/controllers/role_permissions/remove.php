<?php
require_once __DIR__ . "/../../../config/database.php";
require_once __DIR__ . "/../../helpers/request.php";
require_once __DIR__ . "/../../helpers/response.php";
require_once __DIR__ . "/../../services/RolePermissionService.php";

try {
    $service = new RolePermissionService($conn);
    $deleted = $service->removePermission(getJsonInput());

    if (!$deleted) {
        errorResponse("Role permission not found", 404);
    }

    successResponse([], "Permission removed successfully");
} catch (InvalidArgumentException $e) {
    errorResponse($e->getMessage(), 422);
} catch (Throwable $e) {
    errorResponse($e->getMessage(), 500);
}
