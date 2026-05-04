<?php
require_once __DIR__ . "/../../../config/database.php";
require_once __DIR__ . "/../../helpers/response.php";
require_once __DIR__ . "/../../services/UserService.php";

try {
    $service = new UserService($conn);
    $user = $service->getUserById($_GET["id"] ?? null);

    if (!$user) {
        errorResponse("User not found", 404);
    }

    successResponse($user, "User fetched successfully");
} catch (InvalidArgumentException $e) {
    errorResponse($e->getMessage(), 422);
} catch (Throwable $e) {
    errorResponse($e->getMessage(), 500);
}
