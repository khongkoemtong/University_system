<?php
require_once __DIR__ . "/../../../config/database.php";
require_once __DIR__ . "/../../helpers/response.php";
require_once __DIR__ . "/../../services/PermissionService.php";

try {
    $service = new PermissionService($conn);
    successResponse($service->getAllPermissions(), "Permissions fetched successfully");
} catch (Throwable $e) {
    errorResponse($e->getMessage(), 500);
}
