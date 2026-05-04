<?php

class Role
{
    private PDO $conn;

    public function __construct(PDO $conn)
    {
        $this->conn = $conn;
    }

    public function getAll()
    {
        $stmt = $this->conn->prepare("SELECT * FROM roles ORDER BY id DESC");
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function find($id)
    {
        $stmt = $this->conn->prepare("SELECT * FROM roles WHERE id = :id");
        $stmt->execute([":id" => $id]);

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function findByName($name)
    {
        $stmt = $this->conn->prepare("SELECT * FROM roles WHERE name = :name");
        $stmt->execute([":name" => $name]);

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function create($name)
    {
        $stmt = $this->conn->prepare("INSERT INTO roles (name) VALUES (:name)");
        $stmt->execute([":name" => $name]);

        return $this->find((int) $this->conn->lastInsertId());
    }

    public function update($id, $name)
    {
        $stmt = $this->conn->prepare("UPDATE roles SET name = :name WHERE id = :id");
        $stmt->execute([":id" => $id, ":name" => $name]);

        return $this->find($id);
    }

    public function delete($id)
    {
        $stmt = $this->conn->prepare("DELETE FROM roles WHERE id = :id");
        $stmt->execute([":id" => $id]);

        return $stmt->rowCount() > 0;
    }
}
