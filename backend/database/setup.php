<?php
// load database connection
require_once __DIR__ . "/../config/database.php";

try {
    // IMPORTANT: enable foreign key
    $conn->exec("SET FOREIGN_KEY_CHECKS = 0");

    $sql = "

    CREATE TABLE IF NOT EXISTS roles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(50) NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS permissions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role_id INT NOT NULL,
        FOREIGN KEY (role_id) REFERENCES roles(id)
            ON DELETE CASCADE ON UPDATE CASCADE
    );

    CREATE TABLE IF NOT EXISTS role_permissions (
        role_id INT NOT NULL,
        permission_id INT NOT NULL,
        PRIMARY KEY (role_id, permission_id),
        FOREIGN KEY (role_id) REFERENCES roles(id)
            ON DELETE CASCADE ON UPDATE CASCADE,
        FOREIGN KEY (permission_id) REFERENCES permissions(id)
            ON DELETE CASCADE ON UPDATE CASCADE
    );

    CREATE TABLE IF NOT EXISTS classes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        class_code VARCHAR(50) NOT NULL UNIQUE,
        letter_start CHAR(1) NOT NULL,
        letter_end CHAR(1) NOT NULL,
        max_students INT NOT NULL DEFAULT 30,
        teacher_staff_id INT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS students (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL UNIQUE,
        student_code VARCHAR(50) NOT NULL UNIQUE,
        class_id INT NULL,
        phone VARCHAR(20) NULL UNIQUE,
        gender VARCHAR(10),
        dob DATE,
        address VARCHAR(255),
        FOREIGN KEY (class_id) REFERENCES classes(id)
            ON DELETE SET NULL ON UPDATE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id)
            ON DELETE CASCADE ON UPDATE CASCADE
    );

    CREATE TABLE IF NOT EXISTS staff (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL UNIQUE,
        staff_code VARCHAR(50) NOT NULL UNIQUE,
        position VARCHAR(100),
        FOREIGN KEY (user_id) REFERENCES users(id)
            ON DELETE CASCADE ON UPDATE CASCADE
    );

    CREATE TABLE IF NOT EXISTS courses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        staff_id INT,
        FOREIGN KEY (staff_id) REFERENCES staff(id)
            ON DELETE SET NULL ON UPDATE CASCADE
    );
    
    CREATE TABLE IF NOT EXISTS course_students (
        course_id INT NOT NULL,
        student_id INT NOT NULL,
        PRIMARY KEY (course_id, student_id),
        FOREIGN KEY (course_id) REFERENCES courses(id)
            ON DELETE CASCADE ON UPDATE CASCADE,
        FOREIGN KEY (student_id) REFERENCES students(id)
            ON DELETE CASCADE ON UPDATE CASCADE
    );

    CREATE TABLE IF NOT EXISTS grades (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT NOT NULL,
        course_id INT NOT NULL,
        grade VARCHAR(10),
        FOREIGN KEY (student_id) REFERENCES students(id)
            ON DELETE CASCADE ON UPDATE CASCADE,
        FOREIGN KEY (course_id) REFERENCES courses(id)
            ON DELETE CASCADE ON UPDATE CASCADE
    );

    CREATE TABLE IF NOT EXISTS attendance (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT NOT NULL,
        class_id INT NULL,
        course_id INT NULL,
        date DATE NOT NULL,
        status ENUM('present','absent','late') NOT NULL,
        FOREIGN KEY (student_id) REFERENCES students(id)
            ON DELETE CASCADE ON UPDATE CASCADE,
        FOREIGN KEY (class_id) REFERENCES classes(id)
            ON DELETE CASCADE ON UPDATE CASCADE,
        FOREIGN KEY (course_id) REFERENCES courses(id)
            ON DELETE CASCADE ON UPDATE CASCADE
    );

    CREATE TABLE IF NOT EXISTS access_requests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        account_type VARCHAR(20) NOT NULL,
        staff_code VARCHAR(50) NULL,
        position VARCHAR(100) NULL,
        status ENUM('pending','approved','declined') NOT NULL DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        reviewed_at TIMESTAMP NULL DEFAULT NULL
    );

    ";

    $conn->exec($sql);

    try {
        $classCapacityStmt = $conn->prepare("SHOW COLUMNS FROM classes LIKE :column");
        $classCapacityStmt->execute([":column" => "max_students"]);

        if (!$classCapacityStmt->fetch(PDO::FETCH_ASSOC)) {
            $conn->exec("ALTER TABLE classes ADD COLUMN max_students INT NOT NULL DEFAULT 30 AFTER letter_end");
        }
    } catch (Throwable $e) {
    }

    try {
        $classTeacherStmt = $conn->prepare("SHOW COLUMNS FROM classes LIKE :column");
        $classTeacherStmt->execute([":column" => "teacher_staff_id"]);

        if (!$classTeacherStmt->fetch(PDO::FETCH_ASSOC)) {
            $conn->exec("ALTER TABLE classes ADD COLUMN teacher_staff_id INT NULL AFTER max_students");
        }
    } catch (Throwable $e) {
    }

    try {
        $classTeacherConstraintStmt = $conn->prepare("
            SELECT CONSTRAINT_NAME
            FROM information_schema.TABLE_CONSTRAINTS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = 'classes'
              AND CONSTRAINT_NAME = 'fk_classes_teacher_staff_id'
            LIMIT 1
        ");
        $classTeacherConstraintStmt->execute();

        if (!$classTeacherConstraintStmt->fetch(PDO::FETCH_ASSOC)) {
            $conn->exec("
                ALTER TABLE classes
                ADD CONSTRAINT fk_classes_teacher_staff_id
                FOREIGN KEY (teacher_staff_id) REFERENCES staff(id)
                ON DELETE SET NULL ON UPDATE CASCADE
            ");
        }
    } catch (Throwable $e) {
    }

    try {
        $attendanceClassStmt = $conn->prepare("SHOW COLUMNS FROM attendance LIKE :column");
        $attendanceClassStmt->execute([":column" => "class_id"]);

        if (!$attendanceClassStmt->fetch(PDO::FETCH_ASSOC)) {
            $conn->exec("ALTER TABLE attendance ADD COLUMN class_id INT NULL AFTER student_id");
        }
    } catch (Throwable $e) {
    }

    try {
        $conn->exec("ALTER TABLE attendance MODIFY course_id INT NULL");
    } catch (Throwable $e) {
    }

    try {
        $attendanceClassConstraintStmt = $conn->prepare("
            SELECT CONSTRAINT_NAME
            FROM information_schema.TABLE_CONSTRAINTS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = 'attendance'
              AND CONSTRAINT_NAME = 'fk_attendance_class_id'
            LIMIT 1
        ");
        $attendanceClassConstraintStmt->execute();

        if (!$attendanceClassConstraintStmt->fetch(PDO::FETCH_ASSOC)) {
            $conn->exec("
                ALTER TABLE attendance
                ADD CONSTRAINT fk_attendance_class_id
                FOREIGN KEY (class_id) REFERENCES classes(id)
                ON DELETE CASCADE ON UPDATE CASCADE
            ");
        }
    } catch (Throwable $e) {
    }

    try {
        $attendanceUniqueStmt = $conn->prepare("SHOW INDEX FROM attendance WHERE Key_name = :key_name");
        $attendanceUniqueStmt->execute([":key_name" => "uq_attendance_student_class_date"]);

        if (!$attendanceUniqueStmt->fetch(PDO::FETCH_ASSOC)) {
            $conn->exec("
                ALTER TABLE attendance
                ADD UNIQUE KEY uq_attendance_student_class_date (student_id, class_id, date)
            ");
        }
    } catch (Throwable $e) {
    }

    try {
        $columnStmt = $conn->prepare("SHOW COLUMNS FROM students LIKE :column");
        $columnStmt->execute([":column" => "class_id"]);

        if (!$columnStmt->fetch(PDO::FETCH_ASSOC)) {
            $conn->exec("ALTER TABLE students ADD COLUMN class_id INT NULL AFTER student_code");
        }
    } catch (Throwable $e) {
    }

    try {
        $conn->exec("ALTER TABLE students MODIFY class_id INT NULL DEFAULT NULL");
    } catch (Throwable $e) {
    }

    try {
        $phoneColumnStmt = $conn->prepare("SHOW COLUMNS FROM students LIKE :column");
        $phoneColumnStmt->execute([":column" => "phone"]);

        if (!$phoneColumnStmt->fetch(PDO::FETCH_ASSOC)) {
            $conn->exec("ALTER TABLE students ADD COLUMN phone VARCHAR(20) NULL AFTER class_id");
        }
    } catch (Throwable $e) {
    }

    try {
        $phoneIndexStmt = $conn->prepare("SHOW INDEX FROM students WHERE Key_name = :key_name");
        $phoneIndexStmt->execute([":key_name" => "uq_students_phone"]);

        if (!$phoneIndexStmt->fetch(PDO::FETCH_ASSOC)) {
            $conn->exec("ALTER TABLE students ADD UNIQUE KEY uq_students_phone (phone)");
        }
    } catch (Throwable $e) {
    }

    try {
        $constraintStmt = $conn->prepare("
            SELECT CONSTRAINT_NAME
            FROM information_schema.TABLE_CONSTRAINTS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = 'students'
              AND CONSTRAINT_NAME = 'fk_students_class_id'
            LIMIT 1
        ");
        $constraintStmt->execute();

        if (!$constraintStmt->fetch(PDO::FETCH_ASSOC)) {
            $conn->exec("
                ALTER TABLE students
                ADD CONSTRAINT fk_students_class_id
                FOREIGN KEY (class_id) REFERENCES classes(id)
                ON DELETE SET NULL ON UPDATE CASCADE
            ");
        }
    } catch (Throwable $e) {
    }

    try {
        $classCount = (int) $conn->query("SELECT COUNT(*) FROM classes")->fetchColumn();

        if ($classCount === 0) {
            $conn->exec("
                INSERT INTO classes (name, class_code, letter_start, letter_end, max_students)
                VALUES
                    ('Class A', 'CLS-A', 'A', 'Z', 30),
                    ('Class B', 'CLS-B', 'A', 'Z', 30),
                    ('Class C', 'CLS-C', 'A', 'Z', 30),
                    ('Class D', 'CLS-D', 'A', 'Z', 30)
            ");
        }
    } catch (Throwable $e) {
    }

    // enable back foreign key
    $conn->exec("SET FOREIGN_KEY_CHECKS = 1");

    echo "✅ Database & tables created successfully";

} catch (PDOException $e) {
    echo "❌ Error: " . $e->getMessage();
}
