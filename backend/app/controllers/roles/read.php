<?php
require_once __DIR__ . "/../../../config/database.php";
require_once __DIR__ . "/../../helpers/response.php";
require_once __DIR__ . "/../../services/RoleService.php";

try {
    $service = new RoleService($conn);
    successResponse($service->getAllRoles(), "Roles fetched successfully");
} catch (Throwable $e) {
    errorResponse($e->getMessage(), 500);
}
