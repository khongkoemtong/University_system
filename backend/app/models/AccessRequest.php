<?php

class AccessRequest
{
    private PDO $conn;

    public function __construct(PDO $conn)
    {
        $this->conn = $conn;
        $this->ensureTable();
    }

    private function ensureTable()
    {
        $this->conn->exec("
            CREATE TABLE IF NOT EXISTS access_requests (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(100) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                account_type VARCHAR(20) NOT NULL,
                staff_code VARCHAR(50) NULL,
                position VARCHAR(100) NULL,
                status ENUM('pending', 'approved', 'declined') NOT NULL DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                reviewed_at TIMESTAMP NULL DEFAULT NULL
            )
        ");
    }

    public function getAll()
    {
        $stmt = $this->conn->prepare("
            SELECT *
            FROM access_requests
            ORDER BY
                CASE status
                    WHEN 'pending' THEN 0
                    WHEN 'declined' THEN 1
                    ELSE 2
                END,
                created_at DESC
        ");
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function find($id)
    {
        $stmt = $this->conn->prepare("SELECT * FROM access_requests WHERE id = :id");
        $stmt->execute([":id" => $id]);

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function findByEmail($email)
    {
        $stmt = $this->conn->prepare("SELECT * FROM access_requests WHERE email = :email");
        $stmt->execute([":email" => $email]);

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function create(array $data)
    {
        $stmt = $this->conn->prepare("
            INSERT INTO access_requests (name, email, password, account_type, staff_code, position, status)
            VALUES (:name, :email, :password, :account_type, :staff_code, :position, 'pending')
        ");
        $stmt->execute([
            ":name" => $data["name"],
            ":email" => $data["email"],
            ":password" => $data["password"],
            ":account_type" => $data["account_type"],
            ":staff_code" => $data["staff_code"],
            ":position" => $data["position"],
        ]);

        return $this->find((int) $this->conn->lastInsertId());
    }

    public function updateStatus($id, $status)
    {
        $stmt = $this->conn->prepare("
            UPDATE access_requests
            SET status = :status,
                reviewed_at = CURRENT_TIMESTAMP
            WHERE id = :id
        ");
        $stmt->execute([
            ":id" => $id,
            ":status" => $status,
        ]);

        return $this->find($id);
    }
}
