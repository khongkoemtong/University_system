<?php

class SchoolClass
{
    private PDO $conn;

    public function __construct(PDO $conn)
    {
        $this->conn = $conn;
        $this->ensureSchema();
        $this->ensureStudentClassSchema();
        $this->seedDefaults();
    }

    public function getAll()
    {
        $stmt = $this->conn->prepare("
            SELECT
                classes.id,
                classes.name,
                classes.class_code,
                classes.max_students,
                classes.teacher_staff_id,
                classes.created_at,
                staff.staff_code AS teacher_staff_code,
                staff.position AS teacher_position,
                users.name AS teacher_name,
                users.email AS teacher_email,
                COUNT(students.id) AS student_count
            FROM classes
            LEFT JOIN staff ON staff.id = classes.teacher_staff_id
            LEFT JOIN users ON users.id = staff.user_id
            LEFT JOIN students ON students.class_id = classes.id
            GROUP BY
                classes.id,
                classes.name,
                classes.class_code,
                classes.max_students,
                classes.teacher_staff_id,
                classes.created_at,
                staff.staff_code,
                staff.position,
                users.name,
                users.email
            ORDER BY classes.name ASC, classes.id ASC
        ");
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function find($id)
    {
        $stmt = $this->conn->prepare("
            SELECT
                classes.id,
                classes.name,
                classes.class_code,
                classes.max_students,
                classes.teacher_staff_id,
                classes.created_at,
                staff.staff_code AS teacher_staff_code,
                staff.position AS teacher_position,
                users.name AS teacher_name,
                users.email AS teacher_email,
                COUNT(students.id) AS student_count
            FROM classes
            LEFT JOIN staff ON staff.id = classes.teacher_staff_id
            LEFT JOIN users ON users.id = staff.user_id
            LEFT JOIN students ON students.class_id = classes.id
            WHERE classes.id = :id
            GROUP BY
                classes.id,
                classes.name,
                classes.class_code,
                classes.max_students,
                classes.teacher_staff_id,
                classes.created_at,
                staff.staff_code,
                staff.position,
                users.name,
                users.email
        ");
        $stmt->execute([":id" => $id]);

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function getByTeacherStaffId(int $teacherStaffId)
    {
        $stmt = $this->conn->prepare("
            SELECT
                classes.id,
                classes.name,
                classes.class_code,
                classes.max_students,
                classes.teacher_staff_id,
                classes.created_at,
                staff.staff_code AS teacher_staff_code,
                staff.position AS teacher_position,
                users.name AS teacher_name,
                users.email AS teacher_email,
                COUNT(students.id) AS student_count
            FROM classes
            LEFT JOIN staff ON staff.id = classes.teacher_staff_id
            LEFT JOIN users ON users.id = staff.user_id
            LEFT JOIN students ON students.class_id = classes.id
            WHERE classes.teacher_staff_id = :teacher_staff_id
            GROUP BY
                classes.id,
                classes.name,
                classes.class_code,
                classes.max_students,
                classes.teacher_staff_id,
                classes.created_at,
                staff.staff_code,
                staff.position,
                users.name,
                users.email
            ORDER BY classes.name ASC, classes.id ASC
        ");
        $stmt->execute([":teacher_staff_id" => $teacherStaffId]);

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function findAvailableClass()
    {
        $stmt = $this->conn->prepare("
            SELECT
                classes.id,
                classes.name,
                classes.class_code,
                classes.max_students,
                COUNT(students.id) AS student_count
            FROM classes
            LEFT JOIN students ON students.class_id = classes.id
            GROUP BY classes.id, classes.name, classes.class_code, classes.max_students
            HAVING COUNT(students.id) < classes.max_students
            ORDER BY classes.name ASC, classes.id ASC
            LIMIT 1
        ");
        $stmt->execute();

        return $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
    }

    public function classCodeExists(string $classCode, $ignoreId = null): bool
    {
        $sql = "SELECT id FROM classes WHERE class_code = :class_code";
        $params = [":class_code" => $classCode];

        if ($ignoreId !== null) {
            $sql .= " AND id != :id";
            $params[":id"] = $ignoreId;
        }

        $stmt = $this->conn->prepare($sql);
        $stmt->execute($params);

        return (bool) $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function create(array $data)
    {
        $stmt = $this->conn->prepare("
            INSERT INTO classes (name, class_code, letter_start, letter_end, max_students, teacher_staff_id)
            VALUES (:name, :class_code, 'A', 'Z', :max_students, :teacher_staff_id)
        ");
        $stmt->execute([
            ":name" => $data["name"],
            ":class_code" => $data["class_code"],
            ":max_students" => $data["max_students"],
            ":teacher_staff_id" => $data["teacher_staff_id"]
        ]);

        return $this->find((int) $this->conn->lastInsertId());
    }

    public function update($id, array $data)
    {
        $stmt = $this->conn->prepare("
            UPDATE classes
            SET name = :name,
                class_code = :class_code,
                max_students = :max_students,
                teacher_staff_id = :teacher_staff_id
            WHERE id = :id
        ");
        $stmt->execute([
            ":id" => $id,
            ":name" => $data["name"],
            ":class_code" => $data["class_code"],
            ":max_students" => $data["max_students"],
            ":teacher_staff_id" => $data["teacher_staff_id"]
        ]);

        return $this->find($id);
    }

    public function staffExists(?int $staffId): bool
    {
        if ($staffId === null) {
            return true;
        }

        $stmt = $this->conn->prepare("SELECT id FROM staff WHERE id = :id");
        $stmt->execute([":id" => $staffId]);

        return (bool) $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function delete($id)
    {
        $stmt = $this->conn->prepare("DELETE FROM classes WHERE id = :id");
        $stmt->execute([":id" => $id]);

        return $stmt->rowCount() > 0;
    }

    private function ensureSchema()
    {
        $this->conn->exec("
            CREATE TABLE IF NOT EXISTS classes (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                class_code VARCHAR(50) NOT NULL UNIQUE,
                letter_start CHAR(1) NOT NULL,
                letter_end CHAR(1) NOT NULL,
                max_students INT NOT NULL DEFAULT 30,
                teacher_staff_id INT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ");

        try {
            $this->conn->exec("
                ALTER TABLE classes
                ADD COLUMN max_students INT NOT NULL DEFAULT 30 AFTER letter_end
            ");
        } catch (Throwable $e) {
        }

        try {
            $this->conn->exec("
                ALTER TABLE classes
                ADD COLUMN teacher_staff_id INT NULL AFTER max_students
            ");
        } catch (Throwable $e) {
        }

        try {
            $constraintStmt = $this->conn->prepare("
                SELECT CONSTRAINT_NAME
                FROM information_schema.TABLE_CONSTRAINTS
                WHERE TABLE_SCHEMA = DATABASE()
                  AND TABLE_NAME = 'classes'
                  AND CONSTRAINT_NAME = 'fk_classes_teacher_staff_id'
                LIMIT 1
            ");
            $constraintStmt->execute();

            if (!$constraintStmt->fetch(PDO::FETCH_ASSOC)) {
                $this->conn->exec("
                    ALTER TABLE classes
                    ADD CONSTRAINT fk_classes_teacher_staff_id
                    FOREIGN KEY (teacher_staff_id) REFERENCES staff(id)
                    ON DELETE SET NULL ON UPDATE CASCADE
                ");
            }
        } catch (Throwable $e) {
        }
    }

    private function ensureStudentClassSchema()
    {
        try {
            $columnStmt = $this->conn->prepare("SHOW COLUMNS FROM students LIKE :column");
            $columnStmt->execute([":column" => "class_id"]);

            if (!$columnStmt->fetch(PDO::FETCH_ASSOC)) {
                $this->conn->exec("
                    ALTER TABLE students
                    ADD COLUMN class_id INT NULL AFTER student_code
                ");
            }
        } catch (Throwable $e) {
            return;
        }

        try {
            $this->conn->exec("
                ALTER TABLE students
                MODIFY class_id INT NULL DEFAULT NULL
            ");
        } catch (Throwable $e) {
        }

        try {
            $constraintStmt = $this->conn->prepare("
                SELECT CONSTRAINT_NAME
                FROM information_schema.TABLE_CONSTRAINTS
                WHERE TABLE_SCHEMA = DATABASE()
                  AND TABLE_NAME = 'students'
                  AND CONSTRAINT_NAME = 'fk_students_class_id'
                LIMIT 1
            ");
            $constraintStmt->execute();

            if (!$constraintStmt->fetch(PDO::FETCH_ASSOC)) {
                $this->conn->exec("
                    ALTER TABLE students
                    ADD CONSTRAINT fk_students_class_id
                    FOREIGN KEY (class_id) REFERENCES classes(id)
                    ON DELETE SET NULL ON UPDATE CASCADE
                ");
            }
        } catch (Throwable $e) {
        }
    }

    private function seedDefaults()
    {
        $stmt = $this->conn->query("SELECT COUNT(*) FROM classes");
        $count = (int) $stmt->fetchColumn();

        if ($count > 0) {
            return;
        }

        $defaults = [
            ["Class A", "CLS-A", 30],
            ["Class B", "CLS-B", 30],
            ["Class C", "CLS-C", 30],
            ["Class D", "CLS-D", 30]
        ];

        $stmt = $this->conn->prepare("
            INSERT INTO classes (name, class_code, letter_start, letter_end, max_students, teacher_staff_id)
            VALUES (:name, :class_code, 'A', 'Z', :max_students, NULL)
        ");

        foreach ($defaults as [$name, $classCode, $maxStudents]) {
            $stmt->execute([
                ":name" => $name,
                ":class_code" => $classCode,
                ":max_students" => $maxStudents
            ]);
        }
    }
}
