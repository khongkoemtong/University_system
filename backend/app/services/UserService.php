<?php
require_once __DIR__ . "/../models/User.php";
require_once __DIR__ . "/../helpers/auth.php";
require_once __DIR__ . "/../helpers/validation.php";

class UserService
{
    private User $userModel;

    public function __construct(PDO $conn)
    {
        $this->userModel = new User($conn);
    }

    public function getAllUsers()
    {
        return $this->userModel->getAll();
    }

    public function getUserById($id)
    {
        if (!validateInteger($id)) {
            throw new InvalidArgumentException("Valid ID is required");
        }

        return $this->userModel->find($id);
    }

    public function createUser(array $data)
    {
        $payload = $this->validatePayload($data, false);

        if ($this->userModel->findByEmail($payload["email"])) {
            throw new InvalidArgumentException("Email already exists");
        }

        if (!$this->userModel->roleExists($payload["role_id"])) {
            throw new InvalidArgumentException("Role not found");
        }

        $payload["password"] = hashPassword($payload["password"]);

        return $this->userModel->create($payload);
    }

    public function updateUser($id, array $data)
    {
        if (!validateInteger($id)) {
            throw new InvalidArgumentException("Valid ID is required");
        }

        $existing = $this->userModel->find($id);
        if (!$existing) {
            return null;
        }

        $payload = $this->validatePayload($data, true);
        $userByEmail = $this->userModel->findByEmail($payload["email"]);

        if ($userByEmail && (int) $userByEmail["id"] !== (int) $id) {
            throw new InvalidArgumentException("Email already exists");
        }

        if (!$this->userModel->roleExists($payload["role_id"])) {
            throw new InvalidArgumentException("Role not found");
        }

        return $this->userModel->update($id, $payload);
    }

    public function deleteUser($id)
    {
        if (!validateInteger($id)) {
            throw new InvalidArgumentException("Valid ID is required");
        }

        return $this->userModel->delete($id);
    }

    private function validatePayload(array $data, bool $isUpdate)
    {
        $name = trim((string) ($data["name"] ?? ""));
        $email = trim((string) ($data["email"] ?? ""));
        $password = (string) ($data["password"] ?? "");
        $roleId = $data["role_id"] ?? null;

        if (!required($name)) {
            throw new InvalidArgumentException("Name is required");
        }

        if (!validateEmail($email)) {
            throw new InvalidArgumentException("Valid email is required");
        }

        if (!validateInteger($roleId)) {
            throw new InvalidArgumentException("Valid role_id is required");
        }

        if (!$isUpdate && strlen($password) < 6) {
            throw new InvalidArgumentException("Password must be at least 6 characters");
        }

        return [
            "name" => $name,
            "email" => $email,
            "password" => $password,
            "role_id" => (int) $roleId
        ];
    }
}
