<?php

class RolePermission
{
    private PDO $conn;

    public function __construct(PDO $conn)
    {
        $this->conn = $conn;
    }

    public function getAll()
    {
        $stmt = $this->conn->prepare("
            SELECT
                rp.role_id,
                r.name AS role_name,
                rp.permission_id,
                p.name AS permission_name
            FROM role_permissions rp
            INNER JOIN roles r ON rp.role_id = r.id
            INNER JOIN permissions p ON rp.permission_id = p.id
            ORDER BY rp.role_id ASC, rp.permission_id ASC
        ");
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getByRoleId($roleId)
    {
        $stmt = $this->conn->prepare("
            SELECT
                p.id,
                p.name
            FROM role_permissions rp
            INNER JOIN permissions p ON rp.permission_id = p.id
            WHERE rp.role_id = :role_id
            ORDER BY p.id ASC
        ");
        $stmt->execute([":role_id" => $roleId]);

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function roleExists($roleId)
    {
        $stmt = $this->conn->prepare("SELECT id FROM roles WHERE id = :id");
        $stmt->execute([":id" => $roleId]);

        return (bool) $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function permissionExists($permissionId)
    {
        $stmt = $this->conn->prepare("SELECT id FROM permissions WHERE id = :id");
        $stmt->execute([":id" => $permissionId]);

        return (bool) $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function relationExists($roleId, $permissionId)
    {
        $stmt = $this->conn->prepare("
            SELECT role_id, permission_id
            FROM role_permissions
            WHERE role_id = :role_id AND permission_id = :permission_id
        ");
        $stmt->execute([
            ":role_id" => $roleId,
            ":permission_id" => $permissionId
        ]);

        return (bool) $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function assign($roleId, $permissionId)
    {
        $stmt = $this->conn->prepare("
            INSERT INTO role_permissions (role_id, permission_id)
            VALUES (:role_id, :permission_id)
        ");
        $stmt->execute([
            ":role_id" => $roleId,
            ":permission_id" => $permissionId
        ]);

        return [
            "role_id" => (int) $roleId,
            "permission_id" => (int) $permissionId
        ];
    }

    public function updateAssignment($roleId, $oldPermissionId, $newPermissionId)
    {
        $stmt = $this->conn->prepare("
            UPDATE role_permissions
            SET permission_id = :new_permission_id
            WHERE role_id = :role_id AND permission_id = :old_permission_id
        ");
        $stmt->execute([
            ":new_permission_id" => $newPermissionId,
            ":role_id" => $roleId,
            ":old_permission_id" => $oldPermissionId
        ]);

        return $stmt->rowCount() > 0;
    }

    public function remove($roleId, $permissionId)
    {
        $stmt = $this->conn->prepare("
            DELETE FROM role_permissions
            WHERE role_id = :role_id AND permission_id = :permission_id
        ");
        $stmt->execute([
            ":role_id" => $roleId,
            ":permission_id" => $permissionId
        ]);

        return $stmt->rowCount() > 0;
    }
}
