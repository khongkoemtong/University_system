<?php
require_once __DIR__ . "/../models/Permission.php";
require_once __DIR__ . "/../helpers/validation.php";

class PermissionService
{
    private Permission $permissionModel;

    public function __construct(PDO $conn)
    {
        $this->permissionModel = new Permission($conn);
    }

    public function getAllPermissions()
    {
        return $this->permissionModel->getAll();
    }

    public function getPermissionById($id)
    {
        if (!validateInteger($id)) {
            throw new InvalidArgumentException("Valid permission id is required");
        }

        return $this->permissionModel->find($id);
    }

    public function createPermission(array $data)
    {
        $name = $this->validateName($data["name"] ?? "");

        if ($this->permissionModel->findByName($name)) {
            throw new InvalidArgumentException("Permission name already exists");
        }

        return $this->permissionModel->create($name);
    }

    public function updatePermission($id, array $data)
    {
        if (!validateInteger($id)) {
            throw new InvalidArgumentException("Valid permission id is required");
        }

        if (!$this->permissionModel->find($id)) {
            return null;
        }

        $name = $this->validateName($data["name"] ?? "");
        $existing = $this->permissionModel->findByName($name);

        if ($existing && (int) $existing["id"] !== (int) $id) {
            throw new InvalidArgumentException("Permission name already exists");
        }

        return $this->permissionModel->update($id, $name);
    }

    public function deletePermission($id)
    {
        if (!validateInteger($id)) {
            throw new InvalidArgumentException("Valid permission id is required");
        }

        return $this->permissionModel->delete($id);
    }

    private function validateName($name)
    {
        $name = trim((string) $name);

        if (!required($name)) {
            throw new InvalidArgumentException("Permission name is required");
        }

        return $name;
    }
}
