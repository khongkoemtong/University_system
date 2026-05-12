<?php
require_once __DIR__ . "/../models/Attendance.php";
require_once __DIR__ . "/../models/SchoolClass.php";
require_once __DIR__ . "/../models/Staff.php";
require_once __DIR__ . "/../helpers/validation.php";

class AttendanceService
{
    private Attendance $attendanceModel;
    private SchoolClass $classModel;
    private Staff $staffModel;

    public function __construct(PDO $conn)
    {
        $this->attendanceModel = new Attendance($conn);
        $this->classModel = new SchoolClass($conn);
        $this->staffModel = new Staff($conn);
    }

    public function getClassAttendance(array $data, ?array $authUser = null): array
    {
        $classId = $data["class_id"] ?? null;
        $date = $this->normalizeDate($data["date"] ?? date("Y-m-d"));

        if (!validateInteger($classId)) {
            throw new InvalidArgumentException("Valid class_id is required");
        }

        $class = $this->classModel->find((int) $classId);
        if (!$class) {
            throw new InvalidArgumentException("Class not found");
        }

        $this->assertCanManageClass($class, $authUser);

        return $this->attendanceModel->getClassAttendanceByDate((int) $classId, $date);
    }

    public function saveClassAttendance(array $data, ?array $authUser = null): array
    {
        $classId = $data["class_id"] ?? null;
        $date = $this->normalizeDate($data["date"] ?? date("Y-m-d"));
        $entries = $data["entries"] ?? null;

        if (!validateInteger($classId)) {
            throw new InvalidArgumentException("Valid class_id is required");
        }

        if (!is_array($entries) || $entries === []) {
            throw new InvalidArgumentException("Attendance entries are required");
        }

        $class = $this->classModel->find((int) $classId);
        if (!$class) {
            throw new InvalidArgumentException("Class not found");
        }

        $this->assertCanManageClass($class, $authUser);

        $normalizedEntries = [];

        foreach ($entries as $entry) {
            $studentId = $entry["student_id"] ?? null;
            $status = strtolower(trim((string) ($entry["status"] ?? "")));

            if (!validateInteger($studentId)) {
                throw new InvalidArgumentException("Each attendance entry needs a valid student_id");
            }

            if (!in_array($status, ["present", "late", "absent"], true)) {
                throw new InvalidArgumentException("Attendance status must be present, late, or absent");
            }

            $normalizedEntries[] = [
                "student_id" => (int) $studentId,
                "status" => $status,
            ];
        }

        return $this->attendanceModel->saveClassAttendance((int) $classId, $date, $normalizedEntries);
    }

    private function normalizeDate(string $date): string
    {
        $trimmed = trim($date);
        if ($trimmed === "") {
            return date("Y-m-d");
        }

        $parsed = DateTime::createFromFormat("Y-m-d", $trimmed);
        if (!$parsed || $parsed->format("Y-m-d") !== $trimmed) {
            throw new InvalidArgumentException("date must use YYYY-MM-DD format");
        }

        return $trimmed;
    }

    private function assertCanManageClass(array $class, ?array $authUser): void
    {
        $roleName = strtolower((string) ($authUser["role_name"] ?? ""));
        if ($roleName !== "staff") {
            return;
        }

        $staffId = $this->resolveAuthenticatedStaffId($authUser);
        if ($staffId === null) {
            throw new InvalidArgumentException("Teacher account is not linked to a staff profile");
        }

        if ((int) ($class["teacher_staff_id"] ?? 0) !== $staffId) {
            throw new InvalidArgumentException("You can only save attendance for classes assigned to you");
        }
    }

    private function resolveAuthenticatedStaffId(?array $authUser): ?int
    {
        $staffId = $authUser["staff_id"] ?? null;
        if (validateInteger($staffId)) {
            return (int) $staffId;
        }

        $userId = $authUser["id"] ?? null;
        if (!validateInteger($userId)) {
            return null;
        }

        $staff = $this->staffModel->findByUserId((int) $userId);
        if (!$staff || !isset($staff["id"])) {
            return null;
        }

        return (int) $staff["id"];
    }
}
