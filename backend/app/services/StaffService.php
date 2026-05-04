<?php
require_once __DIR__ . "/../models/Staff.php";
require_once __DIR__ . "/../helpers/validation.php";

class StaffService
{
    private Staff $staffModel;

    public function __construct(PDO $conn)
    {
        $this->staffModel = new Staff($conn);
    }

    public function getAllStaff()
    {
        return $this->staffModel->getAll();
    }

    public function getStaffById($id)
    {
        if (!validateInteger($id)) {
            throw new InvalidArgumentException("Valid staff id is required");
        }

        return $this->staffModel->find($id);
    }

    public function createStaff(array $data)
    {
        $payload = $this->validatePayload($data);

        if ($this->staffModel->findByStaffCode($payload["staff_code"])) {
            throw new InvalidArgumentException("Staff code already exists");
        }

        if (!$this->staffModel->userExists($payload["user_id"])) {
            throw new InvalidArgumentException("User not found");
        }

        return $this->staffModel->create($payload);
    }

    public function updateStaff($id, array $data)
    {
        if (!validateInteger($id)) {
            throw new InvalidArgumentException("Valid staff id is required");
        }

        if (!$this->staffModel->find($id)) {
            return null;
        }

        $payload = $this->validatePayload($data);
        $existing = $this->staffModel->findByStaffCode($payload["staff_code"]);

        if ($existing && (int) $existing["id"] !== (int) $id) {
            throw new InvalidArgumentException("Staff code already exists");
        }

        if (!$this->staffModel->userExists($payload["user_id"])) {
            throw new InvalidArgumentException("User not found");
        }

        return $this->staffModel->update($id, $payload);
    }

    public function deleteStaff($id)
    {
        if (!validateInteger($id)) {
            throw new InvalidArgumentException("Valid staff id is required");
        }

        return $this->staffModel->delete($id);
    }

    private function validatePayload(array $data)
    {
        $userId = $data["user_id"] ?? null;
        $staffCode = trim((string) ($data["staff_code"] ?? ""));
        $position = trim((string) ($data["position"] ?? ""));

        if (!validateInteger($userId)) {
            throw new InvalidArgumentException("Valid user_id is required");
        }

        if (!required($staffCode)) {
            throw new InvalidArgumentException("Staff code is required");
        }

        return [
            "user_id" => (int) $userId,
            "staff_code" => $staffCode,
            "position" => $position !== "" ? $position : null
        ];
    }
}
