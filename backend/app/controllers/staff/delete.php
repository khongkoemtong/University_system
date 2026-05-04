<?php
require_once __DIR__ . "/../../../config/database.php";
require_once __DIR__ . "/../../helpers/request.php";
require_once __DIR__ . "/../../helpers/response.php";
require_once __DIR__ . "/../../services/StaffService.php";

try {
    $data = getJsonInput();
    $service = new StaffService($conn);
    $deleted = $service->deleteStaff($data["id"] ?? null);

    if (!$deleted) {
        errorResponse("Staff not found", 404);
    }

    successResponse([], "Staff deleted successfully");
} catch (InvalidArgumentException $e) {
    errorResponse($e->getMessage(), 422);
} catch (Throwable $e) {
    errorResponse($e->getMessage(), 500);
}
