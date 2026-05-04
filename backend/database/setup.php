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

    CREATE TABLE IF NOT EXISTS students (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL UNIQUE,
        student_code VARCHAR(50) NOT NULL UNIQUE,
        gender VARCHAR(10),
        dob DATE,
        address VARCHAR(255),
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

    CR id INT AUTO_INEATE TABLE IF NOT EXISTS grades (
       CREMENT PRIMARY KEY,
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
        course_id INT NOT NULL,
        date DATE NOT NULL,
        status ENUM('present','absent','late') NOT NULL,
        FOREIGN KEY (student_id) REFERENCES students(id)
            ON DELETE CASCADE ON UPDATE CASCADE,
        FOREIGN KEY (course_id) REFERENCES courses(id)
            ON DELETE CASCADE ON UPDATE CASCADE
    );

    ";

    $conn->exec($sql);

    // enable back foreign key
    $conn->exec("SET FOREIGN_KEY_CHECKS = 1");

    echo "✅ Database & tables created successfully";

} catch (PDOException $e) {
    echo "❌ Error: " . $e->getMessage();
}