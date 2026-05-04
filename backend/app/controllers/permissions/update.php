<?php
require_once __DIR__ . "/../../../config/database.php";
require_once __DIR__ . "/../../helpers/request.php";
require_once __DIR__ . "/../../helpers/response.php";
require_once __DIR__ . "/../../services/PermissionService.php";

try {
    $data = getJsonInput();
    $service = new PermissionService($conn);
    $permission = $service->updatePermission($data["id"] ?? null, $data);

    if (!$permission) {
        errorResponse("Permission not found", 404);
    }

    successResponse($permission, "Permission updated successfully");
} catch (InvalidArgumentException $e) {
    errorResponse($e->getMessage(), 422);
} catch (Throwable $e) {
    errorResponse($e->getMessage(), 500);
}
