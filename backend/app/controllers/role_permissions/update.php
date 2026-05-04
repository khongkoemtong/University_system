<?php
require_once __DIR__ . "/../../../config/database.php";
require_once __DIR__ . "/../../helpers/request.php";
require_once __DIR__ . "/../../helpers/response.php";
require_once __DIR__ . "/../../services/RolePermissionService.php";

try {
    $service = new RolePermissionService($conn);
    $updated = $service->updatePermission(getJsonInput());

    if (!$updated) {
        errorResponse("Role permission not found", 404);
    }

    successResponse([], "Role permission updated successfully");
} catch (InvalidArgumentException $e) {
    errorResponse($e->getMessage(), 422);
} catch (Throwable $e) {
    errorResponse($e->getMessage(), 500);
}
