<?php
require_once __DIR__ . "/../../../config/database.php";
require_once __DIR__ . "/../../helpers/response.php";
require_once __DIR__ . "/../../services/StaffService.php";

try {
    $service = new StaffService($conn);
    successResponse($service->getAllStaff(), "Staff fetched successfully");
} catch (Throwable $e) {
    errorResponse($e->getMessage(), 500);
}
