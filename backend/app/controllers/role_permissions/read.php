<?php
require_once __DIR__ . "/../../../config/database.php";
require_once __DIR__ . "/../../helpers/response.php";
require_once __DIR__ . "/../../services/RolePermissionService.php";

try {
    $service = new RolePermissionService($conn);
    successResponse($service->getAllRolePermissions(), "Role permissions fetched successfully");
} catch (Throwable $e) {
    errorResponse($e->getMessage(), 500);
}
