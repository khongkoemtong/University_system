<?php

class Student
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
                students.id,
                students.user_id,
                students.student_code,
                students.gender,
                students.dob,
                students.address,
                users.name,
                users.email,
                users.role_id
            FROM students
            INNER JOIN users ON users.id = students.user_id
            ORDER BY students.id DESC
        ");
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function find($id)
    {
        $stmt = $this->conn->prepare("
            SELECT 
                students.id,
                students.user_id,
                students.student_code,
                students.gender,
                students.dob,
                students.address,
                users.name,
                users.email,
                users.role_id
            FROM students
            INNER JOIN users ON users.id = students.user_id
            WHERE students.id = :id
        ");
        $stmt->execute([":id" => $id]);

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function findByEmail($email)
    {
        $stmt = $this->conn->prepare("
            SELECT 
                students.id,
                students.user_id,
                students.student_code,
                students.gender,
                students.dob,
                students.address,
                users.name,
                users.email,
                users.role_id
            FROM students
            INNER JOIN users ON users.id = students.user_id
            WHERE users.email = :email
        ");
        $stmt->execute([":email" => $email]);

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function create($data, $studentRoleId)
    {
        $this->conn->beginTransaction();

        try {
            $userStmt = $this->conn->prepare("
                INSERT INTO users (name, email, password, role_id)
                VALUES (:name, :email, :password, :role_id)
            ");

            $userStmt->execute([
                ":name" => $data["name"],
                ":email" => $data["email"],
                ":password" => $data["password"],
                ":role_id" => $studentRoleId
            ]);

            $userId = (int) $this->conn->lastInsertId();

            $studentStmt = $this->conn->prepare("
                INSERT INTO students (user_id, student_code, gender, dob, address)
                VALUES (:user_id, :student_code, :gender, :dob, :address)
            ");

            $studentStmt->execute([
                ":user_id" => $userId,
                ":student_code" => $data["student_code"],
                ":gender" => $data["gender"] ?? null,
                ":dob" => $data["dob"] ?? null,
                ":address" => $data["address"] ?? null
            ]);

            $studentId = (int) $this->conn->lastInsertId();
            $this->conn->commit();

            return $this->find($studentId);
        } catch (Throwable $e) {
            $this->conn->rollBack();
            throw $e;
        }
    }

    public function update($id, $data)
    {
        $student = $this->find($id);

        if (!$student) {
            return null;
        }

        $this->conn->beginTransaction();

        try {
            $userStmt = $this->conn->prepare("
                UPDATE users
                SET name = :name, email = :email
                WHERE id = :user_id
            ");

            $userStmt->execute([
                ":name" => $data["name"],
                ":email" => $data["email"],
                ":user_id" => $student["user_id"]
            ]);

            $studentStmt = $this->conn->prepare("
                UPDATE students
                SET student_code = :student_code,
                    gender = :gender,
                    dob = :dob,
                    address = :address
                WHERE id = :id
            ");

            $studentStmt->execute([
                ":id" => $id,
                ":student_code" => $data["student_code"],
                ":gender" => $data["gender"] ?? null,
                ":dob" => $data["dob"] ?? null,
                ":address" => $data["address"] ?? null
            ]);

            $this->conn->commit();

            return $this->find($id);
        } catch (Throwable $e) {
            $this->conn->rollBack();
            throw $e;
        }
    }

    public function delete($id)
    {
        $student = $this->find($id);

        if (!$student) {
            return false;
        }

        $stmt = $this->conn->prepare("DELETE FROM users WHERE id = :user_id");
        $stmt->execute([":user_id" => $student["user_id"]]);

        return $stmt->rowCount() > 0;
    }

    public function studentCodeExists($studentCode, $ignoreId = null)
    {
        $sql = "SELECT id FROM students WHERE student_code = :student_code";
        $params = [":student_code" => $studentCode];

        if ($ignoreId !== null) {
            $sql .= " AND id != :id";
            $params[":id"] = $ignoreId;
        }

        $stmt = $this->conn->prepare($sql);
        $stmt->execute($params);

        return (bool) $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function getStudentRoleId()
    {
        $stmt = $this->conn->prepare("SELECT id FROM roles WHERE name = :name LIMIT 1");
        $stmt->execute([":name" => "student"]);

        $role = $stmt->fetch(PDO::FETCH_ASSOC);

        return $role ? (int) $role["id"] : null;
    }
}
