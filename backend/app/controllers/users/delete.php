<?php
require_once __DIR__ . "/../../../config/database.php";
require_once __DIR__ . "/../../helpers/request.php";
require_once __DIR__ . "/../../helpers/response.php";
require_once __DIR__ . "/../../services/UserService.php";

try {
    $data = getJsonInput();
    $service = new UserService($conn);
    $deleted = $service->deleteUser($data["id"] ?? null);

    if (!$deleted) {
        errorResponse("User not found", 404);
    }

    successResponse([], "User deleted successfully");
} catch (InvalidArgumentException $e) {
    errorResponse($e->getMessage(), 422);
} catch (Throwable $e) {
    errorResponse($e->getMessage(), 500);
}
