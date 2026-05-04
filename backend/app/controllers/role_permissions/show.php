<?php
require_once __DIR__ . "/../../../config/database.php";
require_once __DIR__ . "/../../helpers/response.php";
require_once __DIR__ . "/../../services/RolePermissionService.php";

try {
    $service = new RolePermissionService($conn);
    $permissions = $service->getPermissionsByRoleId($_GET["role_id"] ?? null);
    successResponse($permissions, "Role permissions fetched successfully");
} catch (InvalidArgumentException $e) {
    errorResponse($e->getMessage(), 422);
} catch (Throwable $e) {
    errorResponse($e->getMessage(), 500);
}
