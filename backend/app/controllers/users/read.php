<?php
require_once __DIR__ . "/../../../config/database.php";
require_once __DIR__ . "/../../helpers/response.php";
require_once __DIR__ . "/../../services/UserService.php";

try {
    $service = new UserService($conn);
    successResponse($service->getAllUsers(), "Users fetched successfully");
} catch (Throwable $e) {
    errorResponse($e->getMessage(), 500);
}
