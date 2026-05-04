<?php
require_once __DIR__ . "/../../../config/database.php";
require_once __DIR__ . "/../../helpers/request.php";
require_once __DIR__ . "/../../helpers/response.php";
require_once __DIR__ . "/../../services/RoleService.php";

try {
    $data = getJsonInput();
    $service = new RoleService($conn);
    $role = $service->updateRole($data["id"] ?? null, $data);

    if (!$role) {
        errorResponse("Role not found", 404);
    }

    successResponse($role, "Role updated successfully");
} catch (InvalidArgumentException $e) {
    errorResponse($e->getMessage(), 422);
} catch (Throwable $e) {
    errorResponse($e->getMessage(), 500);
}
