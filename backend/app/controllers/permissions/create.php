<?php
require_once __DIR__ . "/../../../config/database.php";
require_once __DIR__ . "/../../helpers/request.php";
require_once __DIR__ . "/../../helpers/response.php";
require_once __DIR__ . "/../../services/PermissionService.php";

try {
    $service = new PermissionService($conn);
    $permission = $service->createPermission(getJsonInput());
    successResponse($permission, "Permission created successfully", 201);
} catch (InvalidArgumentException $e) {
    errorResponse($e->getMessage(), 422);
} catch (Throwable $e) {
    errorResponse($e->getMessage(), 500);
}
