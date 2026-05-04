<?php

class Staff
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
                staff.id,
                staff.user_id,
                staff.staff_code,
                staff.position,
                users.name,
                users.email
            FROM staff
            LEFT JOIN users ON staff.user_id = users.id
            ORDER BY staff.id DESC
        ");
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function find($id)
    {
        $stmt = $this->conn->prepare("
            SELECT
                staff.id,
                staff.user_id,
                staff.staff_code,
                staff.position,
                users.name,
                users.email
            FROM staff
            LEFT JOIN users ON staff.user_id = users.id
            WHERE staff.id = :id
        ");
        $stmt->execute([":id" => $id]);

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function findByStaffCode($staffCode)
    {
        $stmt = $this->conn->prepare("SELECT * FROM staff WHERE staff_code = :staff_code");
        $stmt->execute([":staff_code" => $staffCode]);

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function userExists($userId)
    {
        $stmt = $this->conn->prepare("SELECT id FROM users WHERE id = :id");
        $stmt->execute([":id" => $userId]);

        return (bool) $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function create(array $data)
    {
        $stmt = $this->conn->prepare("
            INSERT INTO staff (user_id, staff_code, position)
            VALUES (:user_id, :staff_code, :position)
        ");
        $stmt->execute([
            ":user_id" => $data["user_id"],
            ":staff_code" => $data["staff_code"],
            ":position" => $data["position"]
        ]);

        return $this->find((int) $this->conn->lastInsertId());
    }

    public function update($id, array $data)
    {
        $stmt = $this->conn->prepare("
            UPDATE staff
            SET user_id = :user_id,
                staff_code = :staff_code,
                position = :position
            WHERE id = :id
        ");
        $stmt->execute([
            ":id" => $id,
            ":user_id" => $data["user_id"],
            ":staff_code" => $data["staff_code"],
            ":position" => $data["position"]
        ]);

        return $this->find($id);
    }

    public function delete($id)
    {
        $stmt = $this->conn->prepare("DELETE FROM staff WHERE id = :id");
        $stmt->execute([":id" => $id]);

        return $stmt->rowCount() > 0;
    }
}
