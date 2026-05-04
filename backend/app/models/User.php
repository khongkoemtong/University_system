<?php

class User
{
    private PDO $conn;

    public function __construct(PDO $conn)
    {
        $this->conn = $conn;
    }

    public function getAll()
    {
        $stmt = $this->conn->prepare("
            SELECT users.*, roles.name AS role_name
            FROM users
            INNER JOIN roles ON users.role_id = roles.id
            ORDER BY users.id DESC
        ");
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function find($id)
    {
        $stmt = $this->conn->prepare("
            SELECT users.*, roles.name AS role_name
            FROM users
            INNER JOIN roles ON users.role_id = roles.id
            WHERE users.id = :id
        ");
        $stmt->execute([":id" => $id]);

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function findByEmail($email)
    {
        $stmt = $this->conn->prepare("SELECT * FROM users WHERE email = :email");
        $stmt->execute([":email" => $email]);

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function roleExists($roleId)
    {
        $stmt = $this->conn->prepare("SELECT id FROM roles WHERE id = :id");
        $stmt->execute([":id" => $roleId]);

        return (bool) $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function create(array $data)
    {
        $stmt = $this->conn->prepare("
            INSERT INTO users (name, email, password, role_id)
            VALUES (:name, :email, :password, :role_id)
        ");

        $stmt->execute([
            ":name" => $data["name"],
            ":email" => $data["email"],
            ":password" => $data["password"],
            ":role_id" => $data["role_id"]
        ]);

        return $this->find((int) $this->conn->lastInsertId());
    }

    public function update($id, array $data)
    {
        $stmt = $this->conn->prepare("
            UPDATE users
            SET name = :name,
                email = :email,
                role_id = :role_id
            WHERE id = :id
        ");

        $stmt->execute([
            ":id" => $id,
            ":name" => $data["name"],
            ":email" => $data["email"],
            ":role_id" => $data["role_id"]
        ]);

        return $this->find($id);
    }

    public function delete($id)
    {
        $stmt = $this->conn->prepare("DELETE FROM users WHERE id = :id");
        $stmt->execute([":id" => $id]);

        return $stmt->rowCount() > 0;
    }
}
