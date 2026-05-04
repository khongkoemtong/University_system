<?php
require_once __DIR__ . "/../../../config/database.php";
require_once __DIR__ . "/../../helpers/request.php";
require_once __DIR__ . "/../../helpers/response.php";
require_once __DIR__ . "/../../services/RoleService.php";

try {
    $data = getJsonInput();
    $service = new RoleService($conn);
    $deleted = $service->deleteRole($data["id"] ?? null);

    if (!$deleted) {
        errorResponse("Role not found", 404);
    }

    successResponse([], "Role deleted successfully");
} catch (InvalidArgumentException $e) {
    errorResponse($e->getMessage(), 422);
} catch (Throwable $e) {
    errorResponse($e->getMessage(), 500);
}
