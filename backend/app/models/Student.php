<?php

class Student
{
    private PDO $conn;
    private ?bool $usesAccountSchema = null;
    private SchoolClass $classModel;

    public function __construct(PDO $conn)
    {
        $this->conn = $conn;
        require_once __DIR__ . "/../helpers/auth.php";
        require_once __DIR__ . "/SchoolClass.php";
        $this->migrateLegacyStudentTable();
        $this->classModel = new SchoolClass($conn);
        $this->ensureClassSchema();
    }

    public function usesAccountSchema(): bool
    {
        if ($this->usesAccountSchema !== null) {
            return $this->usesAccountSchema;
        }

        $this->usesAccountSchema = $this->tableHasColumn("students", "user_id");
        return $this->usesAccountSchema;
    }

    public function getAll()
    {
        if ($this->usesAccountSchema()) {
            $stmt = $this->conn->prepare("
                SELECT 
                    students.id,
                    students.user_id,
                    students.student_code,
                    students.class_id,
                    students.phone,
                    students.gender,
                    students.dob,
                    students.address,
                    classes.name AS class_name,
                    classes.class_code,
                    users.name,
                    users.email,
                    users.role_id,
                    roles.name AS role_name
                FROM students
                INNER JOIN users ON users.id = students.user_id
                INNER JOIN roles ON roles.id = users.role_id
                LEFT JOIN classes ON classes.id = students.class_id
                ORDER BY users.name ASC, students.id ASC
            ");
        } else {
            $stmt = $this->conn->prepare("
                SELECT id, name, gender, email, phone
                FROM students
                ORDER BY id DESC
            ");
        }

        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function find($id)
    {
        if ($this->usesAccountSchema()) {
            $stmt = $this->conn->prepare("
                SELECT 
                    students.id,
                    students.user_id,
                    students.student_code,
                    students.class_id,
                    students.phone,
                    students.gender,
                    students.dob,
                    students.address,
                    classes.name AS class_name,
                    classes.class_code,
                    users.name,
                    users.email,
                    users.role_id,
                    roles.name AS role_name
                FROM students
                INNER JOIN users ON users.id = students.user_id
                INNER JOIN roles ON roles.id = users.role_id
                LEFT JOIN classes ON classes.id = students.class_id
                WHERE students.id = :id
            ");
        } else {
            $stmt = $this->conn->prepare("
                SELECT id, name, gender, email, phone
                FROM students
                WHERE id = :id
            ");
        }

        $stmt->execute([":id" => $id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function findByEmail($email)
    {
        if ($this->usesAccountSchema()) {
            $stmt = $this->conn->prepare("
                SELECT 
                    students.id,
                    students.user_id,
                    students.student_code,
                    students.class_id,
                    students.phone,
                    students.gender,
                    students.dob,
                    students.address,
                    classes.name AS class_name,
                    classes.class_code,
                    users.name,
                    users.email,
                    users.role_id,
                    roles.name AS role_name
                FROM students
                INNER JOIN users ON users.id = students.user_id
                INNER JOIN roles ON roles.id = users.role_id
                LEFT JOIN classes ON classes.id = students.class_id
                WHERE users.email = :email
            ");
        } else {
            $stmt = $this->conn->prepare("
                SELECT id, name, gender, email, phone
                FROM students
                WHERE email = :email
            ");
        }

        $stmt->execute([":email" => $email]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function create($data, $studentRoleId = null)
    {
        if ($this->usesAccountSchema()) {
            return $this->createWithAccountSchema($data, $studentRoleId);
        }

        $stmt = $this->conn->prepare("
            INSERT INTO students (name, gender, email, phone)
            VALUES (:name, :gender, :email, :phone)
        ");

        $stmt->execute([
            ":name" => $data["name"],
            ":gender" => $data["gender"] ?? null,
            ":email" => $data["email"],
            ":phone" => $data["phone"] ?? null
        ]);

        return $this->find((int) $this->conn->lastInsertId());
    }

    public function update($id, $data)
    {
        if ($this->usesAccountSchema()) {
            return $this->updateWithAccountSchema($id, $data);
        }

        $student = $this->find($id);

        if (!$student) {
            return null;
        }

        $stmt = $this->conn->prepare("
            UPDATE students
            SET name = :name,
                gender = :gender,
                email = :email,
                phone = :phone
            WHERE id = :id
        ");

        $stmt->execute([
            ":id" => $id,
            ":name" => $data["name"],
            ":gender" => $data["gender"] ?? null,
            ":email" => $data["email"],
            ":phone" => $data["phone"] ?? null
        ]);

        return $this->find($id);
    }

    public function delete($id)
    {
        if ($this->usesAccountSchema()) {
            $student = $this->find($id);

            if (!$student) {
                return false;
            }

            $stmt = $this->conn->prepare("DELETE FROM users WHERE id = :user_id");
            $stmt->execute([":user_id" => $student["user_id"]]);

            return $stmt->rowCount() > 0;
        }

        $stmt = $this->conn->prepare("DELETE FROM students WHERE id = :id");
        $stmt->execute([":id" => $id]);

        return $stmt->rowCount() > 0;
    }

    public function studentCodeExists($studentCode, $ignoreId = null)
    {
        if (!$this->usesAccountSchema()) {
            return false;
        }

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

    public function phoneExists($phone, $ignoreId = null)
    {
        if ($phone === null || trim((string) $phone) === "") {
            return false;
        }

        $sql = "SELECT id FROM students WHERE phone = :phone";
        $params = [":phone" => $phone];

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
        if (!$this->usesAccountSchema()) {
            return null;
        }

        $stmt = $this->conn->prepare("SELECT id FROM roles WHERE name = :name LIMIT 1");
        $stmt->execute([":name" => "student"]);

        $role = $stmt->fetch(PDO::FETCH_ASSOC);

        return $role ? (int) $role["id"] : null;
    }

    public function rebalanceClassAssignments(): void
    {
        if (!$this->usesAccountSchema()) {
            return;
        }

        $classes = $this->conn->query("
            SELECT
                classes.id,
                classes.max_students
            FROM classes
            ORDER BY classes.name ASC, classes.id ASC
        ")->fetchAll(PDO::FETCH_ASSOC);

        if (!$classes) {
            return;
        }

        $students = $this->conn->query("
            SELECT
                students.id
            FROM students
            LEFT JOIN users ON users.id = students.user_id
            ORDER BY COALESCE(users.name, ''), students.id ASC
        ")->fetchAll(PDO::FETCH_ASSOC);

        $this->conn->beginTransaction();

        try {
            $clearStmt = $this->conn->prepare("
                UPDATE students
                SET class_id = NULL
                WHERE id = :id
            ");

            foreach ($students as $student) {
                $clearStmt->execute([
                    ":id" => $student["id"],
                ]);
            }

            $assignStmt = $this->conn->prepare("
                UPDATE students
                SET class_id = :class_id
                WHERE id = :id
            ");

            $studentIndex = 0;

            foreach ($classes as $class) {
                $capacity = max(0, (int) ($class["max_students"] ?? 0));

                for ($seat = 0; $seat < $capacity && $studentIndex < count($students); $seat++) {
                    $assignStmt->execute([
                        ":class_id" => $class["id"],
                        ":id" => $students[$studentIndex]["id"],
                    ]);
                    $studentIndex++;
                }
            }

            $this->conn->commit();
        } catch (Throwable $e) {
            $this->conn->rollBack();
            throw $e;
        }
    }

    private function createWithAccountSchema($data, $studentRoleId)
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
                INSERT INTO students (user_id, student_code, class_id, phone, gender, dob, address)
                VALUES (:user_id, :student_code, :class_id, :phone, :gender, :dob, :address)
            ");

            $class = $this->resolveClassForNewStudent();

            if (!isset($class["id"])) {
                throw new RuntimeException("No available class right now. Please create a class or increase class capacity first.");
            }

            $studentStmt->execute([
                ":user_id" => $userId,
                ":student_code" => $data["student_code"],
                ":class_id" => $class["id"] ?? null,
                ":phone" => $data["phone"] ?? null,
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

    private function updateWithAccountSchema($id, $data)
    {
        $student = $this->find($id);

        if (!$student) {
            return null;
        }

        $this->conn->beginTransaction();

        try {
            $classId = $student["class_id"] ?? null;

            if ($classId === null || $classId === "") {
                $class = $this->resolveClassForNewStudent();
                $classId = $class["id"] ?? null;
            }

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
                    class_id = :class_id,
                    phone = :phone,
                    gender = :gender,
                    dob = :dob,
                    address = :address
                WHERE id = :id
            ");

            $studentStmt->execute([
                ":id" => $id,
                ":student_code" => $data["student_code"],
                ":class_id" => $classId,
                ":phone" => $data["phone"] ?? null,
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

    private function tableHasColumn($table, $column): bool
    {
        try {
            $stmt = $this->conn->prepare("SHOW COLUMNS FROM `{$table}` LIKE :column");
            $stmt->execute([":column" => $column]);
            return (bool) $stmt->fetch(PDO::FETCH_ASSOC);
        } catch (Throwable $e) {
            return false;
        }
    }

    private function constraintExists($table, $constraintName): bool
    {
        try {
            $stmt = $this->conn->prepare("
                SELECT CONSTRAINT_NAME
                FROM information_schema.TABLE_CONSTRAINTS
                WHERE TABLE_SCHEMA = DATABASE()
                  AND TABLE_NAME = :table_name
                  AND CONSTRAINT_NAME = :constraint_name
                LIMIT 1
            ");
            $stmt->execute([
                ":table_name" => $table,
                ":constraint_name" => $constraintName
            ]);

            return (bool) $stmt->fetch(PDO::FETCH_ASSOC);
        } catch (Throwable $e) {
            return false;
        }
    }

    private function ensureClassSchema()
    {
        if ($this->tableHasColumn("students", "class_id")) {
            if (!$this->constraintExists("students", "fk_students_class_id")) {
                try {
                    $this->conn->exec("
                        ALTER TABLE students
                        ADD CONSTRAINT fk_students_class_id
                        FOREIGN KEY (class_id) REFERENCES classes(id)
                        ON DELETE SET NULL ON UPDATE CASCADE
                    ");
                } catch (Throwable $e) {
                }
            }
        } else {
            try {
                $this->conn->exec("
                    ALTER TABLE students
                    ADD COLUMN class_id INT NULL AFTER student_code
                ");
            } catch (Throwable $e) {
                return;
            }

            try {
                $this->conn->exec("
                    ALTER TABLE students
                    ADD CONSTRAINT fk_students_class_id
                    FOREIGN KEY (class_id) REFERENCES classes(id)
                    ON DELETE SET NULL ON UPDATE CASCADE
                ");
            } catch (Throwable $e) {
            }
        }

        try {
            $this->conn->exec("
                ALTER TABLE students
                MODIFY class_id INT NULL DEFAULT NULL
            ");
        } catch (Throwable $e) {
        }

        if (!$this->tableHasColumn("students", "phone")) {
            try {
                $this->conn->exec("
                    ALTER TABLE students
                    ADD COLUMN phone VARCHAR(20) NULL AFTER class_id
                ");
            } catch (Throwable $e) {
            }
        }

        if (!$this->indexExists("students", "uq_students_phone")) {
            try {
                $this->conn->exec("
                    ALTER TABLE students
                    ADD UNIQUE KEY uq_students_phone (phone)
                ");
            } catch (Throwable $e) {
            }
        }

        $this->assignClassesToUnassignedStudents();
        $this->rebalanceIfAnyClassIsOverCapacity();
    }

    private function assignClassesToUnassignedStudents()
    {
        try {
            $stmt = $this->conn->prepare("
                SELECT students.id
                FROM students
                LEFT JOIN users ON users.id = students.user_id
                WHERE students.class_id IS NULL
                ORDER BY COALESCE(users.name, ''), students.id ASC
            ");
            $stmt->execute();
            $students = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $updateStmt = $this->conn->prepare("
                UPDATE students
                SET class_id = :class_id
                WHERE id = :id
            ");

            foreach ($students as $student) {
                $class = $this->resolveClassForNewStudent();

                if (!isset($class["id"])) {
                    break;
                }

                $updateStmt->execute([
                    ":class_id" => $class["id"],
                    ":id" => $student["id"]
                ]);
            }
        } catch (Throwable $e) {
        }
    }

    private function resolveClassForNewStudent()
    {
        return $this->classModel->findAvailableClass();
    }

    private function rebalanceIfAnyClassIsOverCapacity(): void
    {
        if (!$this->usesAccountSchema()) {
            return;
        }

        try {
            $stmt = $this->conn->query("
                SELECT classes.id
                FROM classes
                LEFT JOIN students ON students.class_id = classes.id
                GROUP BY classes.id, classes.max_students
                HAVING COUNT(students.id) > classes.max_students
                LIMIT 1
            ");

            if ($stmt->fetch(PDO::FETCH_ASSOC)) {
                $this->rebalanceClassAssignments();
            }
        } catch (Throwable $e) {
        }
    }

    private function indexExists($table, $indexName): bool
    {
        try {
            $stmt = $this->conn->prepare("
                SHOW INDEX FROM `{$table}` WHERE Key_name = :index_name
            ");
            $stmt->execute([":index_name" => $indexName]);

            return (bool) $stmt->fetch(PDO::FETCH_ASSOC);
        } catch (Throwable $e) {
            return false;
        }
    }

    private function migrateLegacyStudentTable()
    {
        if ($this->tableHasColumn("students", "user_id")) {
            return;
        }

        if ($this->tableHasColumn("students", "class_id") && !$this->isIntegerColumn("students", "class_id")) {
            try {
                $this->conn->exec("
                    ALTER TABLE students
                    CHANGE class_id legacy_class_name VARCHAR(200) NOT NULL DEFAULT ''
                ");
            } catch (Throwable $e) {
            }
        }

        $legacyColumnStatements = [
            "ALTER TABLE students ADD COLUMN user_id INT NULL AFTER id",
            "ALTER TABLE students ADD COLUMN student_code VARCHAR(50) NULL AFTER user_id",
            "ALTER TABLE students ADD COLUMN class_id INT NULL DEFAULT NULL AFTER student_code",
            "ALTER TABLE students ADD COLUMN dob DATE NULL AFTER gender",
            "ALTER TABLE students ADD COLUMN address VARCHAR(255) NULL AFTER dob",
        ];

        foreach ($legacyColumnStatements as $statement) {
            try {
                $this->conn->exec($statement);
            } catch (Throwable $e) {
            }
        }

        try {
            $this->conn->exec("ALTER TABLE students MODIFY name VARCHAR(100) NULL");
        } catch (Throwable $e) {
        }

        try {
            $this->conn->exec("ALTER TABLE students MODIFY email VARCHAR(100) NULL DEFAULT NULL");
        } catch (Throwable $e) {
        }

        try {
            $this->conn->exec("ALTER TABLE students MODIFY class_id INT NULL DEFAULT NULL");
        } catch (Throwable $e) {
        }

        $studentRoleId = $this->getStudentRoleId();

        if ($studentRoleId === null) {
            return;
        }

        try {
            $stmt = $this->conn->prepare("
                SELECT id, name, email
                FROM students
                WHERE user_id IS NULL
                ORDER BY id ASC
            ");
            $stmt->execute();
            $legacyStudents = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $insertUserStmt = $this->conn->prepare("
                INSERT INTO users (name, email, password, role_id)
                VALUES (:name, :email, :password, :role_id)
            ");

            $updateStudentStmt = $this->conn->prepare("
                UPDATE students
                SET user_id = :user_id,
                    student_code = :student_code
                WHERE id = :id
            ");

            foreach ($legacyStudents as $student) {
                $studentId = (int) $student["id"];
                $name = trim((string) ($student["name"] ?? "")) ?: "Student {$studentId}";
                $email = trim((string) ($student["email"] ?? ""));
                $userId = $this->findUserIdByEmail($email);

                if ($userId === null) {
                    $resolvedEmail = $this->resolveLegacyStudentEmail($email, $studentId);

                    $insertUserStmt->execute([
                        ":name" => $name,
                        ":email" => $resolvedEmail,
                        ":password" => hashPassword("student123"),
                        ":role_id" => $studentRoleId,
                    ]);

                    $userId = (int) $this->conn->lastInsertId();
                }

                $updateStudentStmt->execute([
                    ":user_id" => $userId,
                    ":student_code" => $this->generateStudentCode($studentId),
                    ":id" => $studentId,
                ]);
            }
        } catch (Throwable $e) {
        }

        if (!$this->indexExists("students", "uq_students_user_id")) {
            try {
                $this->conn->exec("
                    ALTER TABLE students
                    ADD UNIQUE KEY uq_students_user_id (user_id)
                ");
            } catch (Throwable $e) {
            }
        }

        if (!$this->indexExists("students", "uq_students_student_code")) {
            try {
                $this->conn->exec("
                    ALTER TABLE students
                    ADD UNIQUE KEY uq_students_student_code (student_code)
                ");
            } catch (Throwable $e) {
            }
        }

        if (!$this->constraintExists("students", "fk_students_user_id")) {
            try {
                $this->conn->exec("
                    ALTER TABLE students
                    ADD CONSTRAINT fk_students_user_id
                    FOREIGN KEY (user_id) REFERENCES users(id)
                    ON DELETE CASCADE ON UPDATE CASCADE
                ");
            } catch (Throwable $e) {
            }
        }
    }

    private function isIntegerColumn($table, $column): bool
    {
        try {
            $stmt = $this->conn->prepare("SHOW COLUMNS FROM `{$table}` LIKE :column");
            $stmt->execute([":column" => $column]);
            $definition = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$definition) {
                return false;
            }

            return str_starts_with(strtolower((string) ($definition["Type"] ?? "")), "int");
        } catch (Throwable $e) {
            return false;
        }
    }

    private function findUserIdByEmail(string $email): ?int
    {
        if ($email === "") {
            return null;
        }

        try {
            $stmt = $this->conn->prepare("
                SELECT id
                FROM users
                WHERE email = :email
                LIMIT 1
            ");
            $stmt->execute([":email" => $email]);
            $row = $stmt->fetch(PDO::FETCH_ASSOC);

            return $row ? (int) $row["id"] : null;
        } catch (Throwable $e) {
            return null;
        }
    }

    private function resolveLegacyStudentEmail(string $email, int $studentId): string
    {
        $baseEmail = $email !== "" ? $email : "legacy-student-{$studentId}@school.local";

        if ($this->findUserIdByEmail($baseEmail) === null) {
            return $baseEmail;
        }

        return "legacy-student-{$studentId}-" . time() . "@school.local";
    }

    private function generateStudentCode(int $studentId): string
    {
        return "STU-" . str_pad((string) $studentId, 4, "0", STR_PAD_LEFT);
    }
}
