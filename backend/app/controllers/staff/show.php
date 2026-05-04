<?php
require_once __DIR__ . "/../../../config/database.php";
require_once __DIR__ . "/../../helpers/response.php";
require_once __DIR__ . "/../../services/StaffService.php";

try {
    $service = new StaffService($conn);
    $staff = $service->getStaffById($_GET["id"] ?? null);

    if (!$staff) {
        errorResponse("Staff not found", 404);
    }

    successResponse($staff, "Staff fetched successfully");
} catch (InvalidArgumentException $e) {
    errorResponse($e->getMessage(), 422);
} catch (Throwable $e) {
    errorResponse($e->getMessage(), 500);
}
