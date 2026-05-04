<?php
require_once __DIR__ . "/../../../config/database.php";
require_once __DIR__ . "/../../helpers/request.php";
require_once __DIR__ . "/../../helpers/response.php";
require_once __DIR__ . "/../../services/RolePermissionService.php";

try {
    $service = new RolePermissionService($conn);
    $result = $service->assignPermission(getJsonInput());
    successResponse($result, "Permission assigned successfully", 201);
} catch (InvalidArgumentException $e) {
    errorResponse($e->getMessage(), 422);
} catch (Throwable $e) {
    errorResponse($e->getMessage(), 500);
}
