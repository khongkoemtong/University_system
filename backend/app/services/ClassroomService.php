<?php
require_once __DIR__ . "/../models/SchoolClass.php";
require_once __DIR__ . "/../models/Staff.php";
require_once __DIR__ . "/../models/Student.php";
require_once __DIR__ . "/../helpers/validation.php";

class ClassroomService
{
    private SchoolClass $classModel;
    private Staff $staffModel;
    private Student $studentModel;

    public function __construct(PDO $conn)
    {
        $this->classModel = new SchoolClass($conn);
        $this->staffModel = new Staff($conn);
        $this->studentModel = new Student($conn);
    }

    public function getAllClasses(?array $authUser = null)
    {
        if ($this->isStaffUser($authUser)) {
            $staffId = $this->resolveAuthenticatedStaffId($authUser);
            return $staffId === null ? [] : $this->classModel->getByTeacherStaffId($staffId);
        }

        return $this->classModel->getAll();
    }

    public function getClassById($id)
    {
        if (!validateInteger($id)) {
            throw new InvalidArgumentException("Valid class id is required");
        }

        return $this->classModel->find($id);
    }

    public function createClass(array $data, ?array $authUser = null)
    {
        $payload = $this->validatePayload($data, $authUser);

        if ($this->classModel->classCodeExists($payload["class_code"])) {
            throw new InvalidArgumentException("Class code already exists");
        }

        if (!$this->classModel->staffExists($payload["teacher_staff_id"])) {
            throw new InvalidArgumentException("Teacher not found");
        }

        $class = $this->classModel->create($payload);
        $this->studentModel->rebalanceClassAssignments();

        return $class;
    }

    public function updateClass($id, array $data, ?array $authUser = null)
    {
        if (!validateInteger($id)) {
            throw new InvalidArgumentException("Valid class id is required");
        }

        $existingClass = $this->classModel->find($id);

        if (!$existingClass) {
            return null;
        }

        $this->assertStaffCanManageClass($existingClass, $authUser);

        $payload = $this->validatePayload($data, $authUser);

        if ($this->classModel->classCodeExists($payload["class_code"], (int) $id)) {
            throw new InvalidArgumentException("Class code already exists");
        }

        if (!$this->classModel->staffExists($payload["teacher_staff_id"])) {
            throw new InvalidArgumentException("Teacher not found");
        }

        $class = $this->classModel->update($id, $payload);
        $this->studentModel->rebalanceClassAssignments();

        return $class;
    }

    public function deleteClass($id, ?array $authUser = null)
    {
        if (!validateInteger($id)) {
            throw new InvalidArgumentException("Valid class id is required");
        }

        $existingClass = $this->classModel->find($id);
        if (!$existingClass) {
            return false;
        }

        $this->assertStaffCanManageClass($existingClass, $authUser);

        $deleted = $this->classModel->delete($id);

        if ($deleted) {
            $this->studentModel->rebalanceClassAssignments();
        }

        return $deleted;
    }

    private function validatePayload(array $data, ?array $authUser = null)
    {
        $name = trim((string) ($data["name"] ?? ""));
        $classCode = strtoupper(trim((string) ($data["class_code"] ?? "")));
        $maxStudents = $data["max_students"] ?? 30;
        $teacherStaffId = $data["teacher_staff_id"] ?? null;

        if (!required($name)) {
            throw new InvalidArgumentException("Class name is required");
        }

        if (!required($classCode)) {
            throw new InvalidArgumentException("Class code is required");
        }

        if (!validateInteger($maxStudents)) {
            throw new InvalidArgumentException("max_students must be an integer");
        }

        $maxStudents = (int) $maxStudents;
        if ($maxStudents < 1) {
            throw new InvalidArgumentException("max_students must be at least 1");
        }

        if ($this->isStaffUser($authUser)) {
            $teacherStaffId = $this->resolveAuthenticatedStaffId($authUser);

            if ($teacherStaffId === null) {
                throw new InvalidArgumentException("Teacher account is not linked to a staff profile");
            }
        } elseif ($teacherStaffId !== null && $teacherStaffId !== "" && !validateInteger($teacherStaffId)) {
            throw new InvalidArgumentException("teacher_staff_id must be an integer");
        }

        return [
            "name" => $name,
            "class_code" => $classCode,
            "max_students" => $maxStudents,
            "teacher_staff_id" => ($teacherStaffId === "" || $teacherStaffId === null) ? null : (int) $teacherStaffId
        ];
    }

    private function isStaffUser(?array $authUser): bool
    {
        return strtolower((string) ($authUser["role_name"] ?? "")) === "staff";
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

    private function assertStaffCanManageClass(array $existingClass, ?array $authUser): void
    {
        if (!$this->isStaffUser($authUser)) {
            return;
        }

        $staffId = $this->resolveAuthenticatedStaffId($authUser);
        if ($staffId === null) {
            throw new InvalidArgumentException("Teacher account is not linked to a staff profile");
        }

        if ((int) ($existingClass["teacher_staff_id"] ?? 0) !== $staffId) {
            throw new InvalidArgumentException("You can only manage classes assigned to you");
        }
    }
}
