<?php

class Attendance
{
    private PDO $conn;

    public function __construct(PDO $conn)
    {
        $this->conn = $conn;
        $this->ensureSchema();
    }

    public function getClassAttendanceByDate(int $classId, string $date): array
    {
        $stmt = $this->conn->prepare("
            SELECT student_id, status
            FROM attendance
            WHERE class_id = :class_id AND date = :date
        ");
        $stmt->execute([
            ":class_id" => $classId,
            ":date" => $date,
        ]);

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function saveClassAttendance(int $classId, string $date, array $entries): array
    {
        $stmt = $this->conn->prepare("
            INSERT INTO attendance (student_id, class_id, course_id, date, status)
            VALUES (:student_id, :class_id, NULL, :date, :status)
            ON DUPLICATE KEY UPDATE
                status = VALUES(status),
                class_id = VALUES(class_id),
                course_id = VALUES(course_id)
        ");

        foreach ($entries as $entry) {
            $stmt->execute([
                ":student_id" => $entry["student_id"],
                ":class_id" => $classId,
                ":date" => $date,
                ":status" => $entry["status"],
            ]);
        }

        return $this->getClassAttendanceByDate($classId, $date);
    }

    private function ensureSchema(): void
    {
        try {
            $this->conn->exec("
                ALTER TABLE attendance
                MODIFY course_id INT NULL
            ");
        } catch (Throwable $e) {
        }

        try {
            $this->conn->exec("
                ALTER TABLE attendance
                ADD COLUMN class_id INT NULL AFTER student_id
            ");
        } catch (Throwable $e) {
        }

        try {
            $constraintStmt = $this->conn->prepare("
                SELECT CONSTRAINT_NAME
                FROM information_schema.TABLE_CONSTRAINTS
                WHERE TABLE_SCHEMA = DATABASE()
                  AND TABLE_NAME = 'attendance'
                  AND CONSTRAINT_NAME = 'fk_attendance_class_id'
                LIMIT 1
            ");
            $constraintStmt->execute();

            if (!$constraintStmt->fetch(PDO::FETCH_ASSOC)) {
                $this->conn->exec("
                    ALTER TABLE attendance
                    ADD CONSTRAINT fk_attendance_class_id
                    FOREIGN KEY (class_id) REFERENCES classes(id)
                    ON DELETE CASCADE ON UPDATE CASCADE
                ");
            }
        } catch (Throwable $e) {
        }

        try {
            $indexStmt = $this->conn->prepare("SHOW INDEX FROM attendance WHERE Key_name = :key_name");
            $indexStmt->execute([":key_name" => "uq_attendance_student_class_date"]);

            if (!$indexStmt->fetch(PDO::FETCH_ASSOC)) {
                $this->conn->exec("
                    ALTER TABLE attendance
                    ADD UNIQUE KEY uq_attendance_student_class_date (student_id, class_id, date)
                ");
            }
        } catch (Throwable $e) {
        }
    }
}
