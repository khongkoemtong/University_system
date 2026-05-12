<?php
require_once __DIR__ . "/../../../config/database.php";
require_once __DIR__ . "/../../helpers/auth.php";
require_once __DIR__ . "/../../helpers/request.php";
require_once __DIR__ . "/../../helpers/response.php";
require_once __DIR__ . "/../../services/AttendanceService.php";

try {
    $service = new AttendanceService($conn);
    $attendance = $service->saveClassAttendance(getJsonInput(), getAuthenticatedUser());
    successResponse($attendance, "Attendance saved successfully");
} catch (InvalidArgumentException $e) {
    errorResponse($e->getMessage(), 422);
} catch (Throwable $e) {
    errorResponse($e->getMessage(), 500);
}
