<?php

class Course
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
                courses.id,
                courses.name,
                courses.staff_id,
                staff.staff_code,
                staff.position
            FROM courses
            LEFT JOIN staff ON courses.staff_id = staff.id
            ORDER BY courses.id DESC
        ");
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function find($id)
    {
        $stmt = $this->conn->prepare("
            SELECT
                courses.id,
                courses.name,
                courses.staff_id,
                staff.staff_code,
                staff.position
            FROM courses
            LEFT JOIN staff ON courses.staff_id = staff.id
            WHERE courses.id = :id
        ");
        $stmt->execute([":id" => $id]);

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function staffExists($staffId)
    {
        if ($staffId === null || $staffId === "") {
            return true;
        }

        $stmt = $this->conn->prepare("SELECT id FROM staff WHERE id = :id");
        $stmt->execute([":id" => $staffId]);

        return (bool) $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function create(array $data)
    {
        $stmt = $this->conn->prepare("
            INSERT INTO courses (name, staff_id)
            VALUES (:name, :staff_id)
        ");
        $stmt->execute([
            ":name" => $data["name"],
            ":staff_id" => $data["staff_id"]
        ]);

        return $this->find((int) $this->conn->lastInsertId());
    }

    public function update($id, array $data)
    {
        $stmt = $this->conn->prepare("
            UPDATE courses
            SET name = :name,
                staff_id = :staff_id
            WHERE id = :id
        ");
        $stmt->execute([
            ":id" => $id,
            ":name" => $data["name"],
            ":staff_id" => $data["staff_id"]
        ]);

        return $this->find($id);
    }

    public function delete($id)
    {
        $stmt = $this->conn->prepare("DELETE FROM courses WHERE id = :id");
        $stmt->execute([":id" => $id]);

        return $stmt->rowCount() > 0;
    }
}
