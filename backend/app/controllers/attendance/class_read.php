<?php
require_once __DIR__ . "/../../../config/database.php";
require_once __DIR__ . "/../../helpers/auth.php";
require_once __DIR__ . "/../../helpers/response.php";
require_once __DIR__ . "/../../services/AttendanceService.php";

try {
    $service = new AttendanceService($conn);
    $attendance = $service->getClassAttendance($_GET, getAuthenticatedUser());
    successResponse($attendance, "Class attendance fetched successfully");
} catch (InvalidArgumentException $e) {
    errorResponse($e->getMessage(), 422);
} catch (Throwable $e) {
    errorResponse($e->getMessage(), 500);
}
