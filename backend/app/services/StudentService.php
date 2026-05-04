<?php
require_once __DIR__ . "/../models/Student.php";
require_once __DIR__ . "/../helpers/auth.php";
require_once __DIR__ . "/../helpers/validation.php";

class StudentService
{
    private Student $studentModel;
    private bool $usesAccountSchema;

    public function __construct(PDO $conn)
    {
        $this->studentModel = new Student($conn);
        $this->usesAccountSchema = $this->studentModel->usesAccountSchema();
    }

    public function getAllStudents()
    {
        return $this->studentModel->getAll();
    }

    public function getStudentById($id)
    {
        return $this->studentModel->find($id);
    }

    public function createStudent(array $data)
    {
        $payload = $this->validateStudentData($data);

        if ($this->studentModel->findByEmail($payload["email"])) {
            throw new InvalidArgumentException("Email already exists");
        }

        if ($this->usesAccountSchema && $this->studentModel->studentCodeExists($payload["student_code"])) {
            throw new InvalidArgumentException("Student code already exists");
        }

        $studentRoleId = null;

        if ($this->usesAccountSchema) {
            $studentRoleId = $this->studentModel->getStudentRoleId();

            if ($studentRoleId === null) {
                throw new RuntimeException("Student role not found. Run seed first.");
            }

            $payload["password"] = hashPassword($payload["password"]);
        }

        return $this->studentModel->create($payload, $studentRoleId);
    }

    public function updateStudent($id, array $data)
    {
        if (!validateInteger($id)) {
            throw new InvalidArgumentException("Valid ID is required");
        }

        $existing = $this->studentModel->find($id);

        if (!$existing) {
            return null;
        }

        $payload = $this->validateStudentData($data, true);

        if ($this->usesAccountSchema && $this->studentModel->studentCodeExists($payload["student_code"], (int) $id)) {
            throw new InvalidArgumentException("Student code already exists");
        }

        $studentByEmail = $this->studentModel->findByEmail($payload["email"]);
        if ($studentByEmail && (int) $studentByEmail["id"] !== (int) $id) {
            throw new InvalidArgumentException("Email already exists");
        }

        return $this->studentModel->update($id, $payload);
    }

    public function deleteStudent($id)
    {
        if (!validateInteger($id)) {
            throw new InvalidArgumentException("Valid ID is required");
        }

        return $this->studentModel->delete($id);
    }

    private function validateStudentData(array $data, bool $isUpdate = false)
    {
        $name = trim((string) ($data["name"] ?? ""));
        $email = trim((string) ($data["email"] ?? ""));
        $studentCode = trim((string) ($data["student_code"] ?? ""));
        $password = (string) ($data["password"] ?? "");
        $gender = trim((string) ($data["gender"] ?? ""));
        $dob = trim((string) ($data["dob"] ?? ""));
        $address = trim((string) ($data["address"] ?? ""));
        $phone = trim((string) ($data["phone"] ?? ""));

        if (!required($name)) {
            throw new InvalidArgumentException("Name is required");
        }

        if (!validateEmail($email)) {
            throw new InvalidArgumentException("Valid email is required");
        }

        if ($this->usesAccountSchema) {
            if (!required($studentCode)) {
                throw new InvalidArgumentException("Student code is required");
            }

            if (!$isUpdate && strlen($password) < 6) {
                throw new InvalidArgumentException("Password must be at least 6 characters");
            }

            if ($dob !== "" && !validateDateValue($dob)) {
                throw new InvalidArgumentException("DOB must be in Y-m-d format");
            }
        } elseif ($phone !== "" && !validatePhone($phone)) {
            throw new InvalidArgumentException("Phone must be 8 to 15 digits");
        }

        return [
            "name" => $name,
            "email" => $email,
            "student_code" => $studentCode,
            "password" => $password,
            "gender" => $gender !== "" ? $gender : null,
            "dob" => $dob !== "" ? $dob : null,
            "address" => $address !== "" ? $address : null,
            "phone" => $phone !== "" ? $phone : null
        ];
    }
}
