<?php
require_once __DIR__ . "/../models/Role.php";
require_once __DIR__ . "/../helpers/validation.php";

class RoleService
{
    private Role $roleModel;

    public function __construct(PDO $conn)
    {
        $this->roleModel = new Role($conn);
    }

    public function getAllRoles()
    {
        return $this->roleModel->getAll();
    }

    public function getRoleById($id)
    {
        if (!validateInteger($id)) {
            throw new InvalidArgumentException("Valid role id is required");
        }

        return $this->roleModel->find($id);
    }

    public function createRole(array $data)
    {
        $name = $this->validateName($data["name"] ?? "");

        if ($this->roleModel->findByName($name)) {
            throw new InvalidArgumentException("Role name already exists");
        }

        return $this->roleModel->create($name);
    }

    public function updateRole($id, array $data)
    {
        if (!validateInteger($id)) {
            throw new InvalidArgumentException("Valid role id is required");
        }

        if (!$this->roleModel->find($id)) {
            return null;
        }

        $name = $this->validateName($data["name"] ?? "");
        $existing = $this->roleModel->findByName($name);

        if ($existing && (int) $existing["id"] !== (int) $id) {
            throw new InvalidArgumentException("Role name already exists");
        }

        return $this->roleModel->update($id, $name);
    }

    public function deleteRole($id)
    {
        if (!validateInteger($id)) {
            throw new InvalidArgumentException("Valid role id is required");
        }

        return $this->roleModel->delete($id);
    }

    private function validateName($name)
    {
        $name = trim((string) $name);

        if (!required($name)) {
            throw new InvalidArgumentException("Role name is required");
        }

        return $name;
    }
}
