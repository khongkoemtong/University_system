<?php
require_once __DIR__ . "/../../../config/database.php";
require_once __DIR__ . "/../../helpers/response.php";
require_once __DIR__ . "/../../services/PermissionService.php";

try {
    $service = new PermissionService($conn);
    $permission = $service->getPermissionById($_GET["id"] ?? null);

    if (!$permission) {
        errorResponse("Permission not found", 404);
    }

    successResponse($permission, "Permission fetched successfully");
} catch (InvalidArgumentException $e) {
    errorResponse($e->getMessage(), 422);
} catch (Throwable $e) {
    errorResponse($e->getMessage(), 500);
}
