<?php
require_once __DIR__ . "/../models/Course.php";
require_once __DIR__ . "/../helpers/validation.php";

class CourseService
{
    private Course $courseModel;

    public function __construct(PDO $conn)
    {
        $this->courseModel = new Course($conn);
    }

    public function getAllCourses()
    {
        return $this->courseModel->getAll();
    }

    public function getCourseById($id)
    {
        if (!validateInteger($id)) {
            throw new InvalidArgumentException("Valid course id is required");
        }

        return $this->courseModel->find($id);
    }

    public function createCourse(array $data)
    {
        $payload = $this->validatePayload($data);

        if (!$this->courseModel->staffExists($payload["staff_id"])) {
            throw new InvalidArgumentException("Staff not found");
        }

        return $this->courseModel->create($payload);
    }

    public function updateCourse($id, array $data)
    {
        if (!validateInteger($id)) {
            throw new InvalidArgumentException("Valid course id is required");
        }

        if (!$this->courseModel->find($id)) {
            return null;
        }

        $payload = $this->validatePayload($data);

        if (!$this->courseModel->staffExists($payload["staff_id"])) {
            throw new InvalidArgumentException("Staff not found");
        }

        return $this->courseModel->update($id, $payload);
    }

    public function deleteCourse($id)
    {
        if (!validateInteger($id)) {
            throw new InvalidArgumentException("Valid course id is required");
        }

        return $this->courseModel->delete($id);
    }

    private function validatePayload(array $data)
    {
        $name = trim((string) ($data["name"] ?? ""));
        $staffId = $data["staff_id"] ?? null;

        if (!required($name)) {
            throw new InvalidArgumentException("Course name is required");
        }

        if ($staffId !== null && $staffId !== "" && !validateInteger($staffId)) {
            throw new InvalidArgumentException("staff_id must be an integer");
        }

        return [
            "name" => $name,
            "staff_id" => ($staffId === "" || $staffId === null) ? null : (int) $staffId
        ];
    }
}
