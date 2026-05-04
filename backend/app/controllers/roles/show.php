<?php
require_once __DIR__ . "/../../../config/database.php";
require_once __DIR__ . "/../../helpers/response.php";
require_once __DIR__ . "/../../services/RoleService.php";

try {
    $service = new RoleService($conn);
    $role = $service->getRoleById($_GET["id"] ?? null);

    if (!$role) {
        errorResponse("Role not found", 404);
    }

    successResponse($role, "Role fetched successfully");
} catch (InvalidArgumentException $e) {
    errorResponse($e->getMessage(), 422);
} catch (Throwable $e) {
    errorResponse($e->getMessage(), 500);
}
