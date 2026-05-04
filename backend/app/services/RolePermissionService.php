<?php
require_once __DIR__ . "/../models/RolePermission.php";
require_once __DIR__ . "/../helpers/validation.php";

class RolePermissionService
{
    private RolePermission $rolePermissionModel;

    public function __construct(PDO $conn)
    {
        $this->rolePermissionModel = new RolePermission($conn);
    }

    public function getAllRolePermissions()
    {
        return $this->rolePermissionModel->getAll();
    }

    public function getPermissionsByRoleId($roleId)
    {
        $roleId = $this->validateId($roleId, "role_id");

        if (!$this->rolePermissionModel->roleExists($roleId)) {
            throw new InvalidArgumentException("Role not found");
        }

        return $this->rolePermissionModel->getByRoleId($roleId);
    }

    public function assignPermission(array $data)
    {
        $roleId = $this->validateId($data["role_id"] ?? null, "role_id");
        $permissionId = $this->validateId($data["permission_id"] ?? null, "permission_id");

        $this->assertRelationInputs($roleId, $permissionId);

        if ($this->rolePermissionModel->relationExists($roleId, $permissionId)) {
            throw new InvalidArgumentException("Permission already assigned to role");
        }

        return $this->rolePermissionModel->assign($roleId, $permissionId);
    }

    public function updatePermission(array $data)
    {
        $roleId = $this->validateId($data["role_id"] ?? null, "role_id");
        $oldPermissionId = $this->validateId($data["old_permission_id"] ?? null, "old_permission_id");
        $newPermissionId = $this->validateId($data["new_permission_id"] ?? null, "new_permission_id");

        $this->assertRelationInputs($roleId, $newPermissionId);

        if (!$this->rolePermissionModel->relationExists($roleId, $oldPermissionId)) {
            return false;
        }

        if ($this->rolePermissionModel->relationExists($roleId, $newPermissionId)) {
            throw new InvalidArgumentException("New permission is already assigned to this role");
        }

        return $this->rolePermissionModel->updateAssignment($roleId, $oldPermissionId, $newPermissionId);
    }

    public function removePermission(array $data)
    {
        $roleId = $this->validateId($data["role_id"] ?? null, "role_id");
        $permissionId = $this->validateId($data["permission_id"] ?? null, "permission_id");

        return $this->rolePermissionModel->remove($roleId, $permissionId);
    }

    private function assertRelationInputs($roleId, $permissionId)
    {
        if (!$this->rolePermissionModel->roleExists($roleId)) {
            throw new InvalidArgumentException("Role not found");
        }

        if (!$this->rolePermissionModel->permissionExists($permissionId)) {
            throw new InvalidArgumentException("Permission not found");
        }
    }

    private function validateId($value, $field)
    {
        if (!validateInteger($value)) {
            throw new InvalidArgumentException("Valid {$field} is required");
        }

        return (int) $value;
    }
}
