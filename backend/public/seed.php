<?php
require_once __DIR__ . "/../config/database.php";

try {
    // roles
    $conn->exec("
        INSERT IGNORE INTO roles (id, name) VALUES
        (1, 'admin'),
        (2, 'staff'),
        (3, 'student')
    ");

    // permissions
    $conn->exec("
        INSERT IGNORE INTO permissions (id, name) VALUES
        (1, 'student.create'),
        (2, 'student.update'),
        (3, 'student.delete'),
        (4, 'student.view'),
        (5, 'grade.create'),
        (6, 'grade.update'),
        (7, 'grade.view'),
        (8, 'attendance.create'),
        (9, 'attendance.view')
    ");

    // admin all permissions
    for ($i = 1; $i <= 9; $i++) {
        $conn->exec("INSERT IGNORE INTO role_permissions (role_id, permission_id) VALUES (1, $i)");
    }

    // staff permissions
    $staffPermissions = [4,5,6,7,8,9];
    foreach ($staffPermissions as $p) {
        $conn->exec("INSERT IGNORE INTO role_permissions (role_id, permission_id) VALUES (2, $p)");
    }

    // student permissions
    $studentPermissions = [4,7,9];
    foreach ($studentPermissions as $p) {
        $conn->exec("INSERT IGNORE INTO role_permissions (role_id, permission_id) VALUES (3, $p)");
    }

    // admin user
    $password = password_hash("123456", PASSWORD_DEFAULT);

    $stmt = $conn->prepare("
        INSERT IGNORE INTO users (id, name, email, password, role_id)
        VALUES (1, 'Admin One', 'admin@gmail.com', ?, 1)
    ");
    $stmt->execute([$password]);

    echo "✅ Seed data inserted successfully";

} catch (PDOException $e) {
    echo "❌ Error: " . $e->getMessage();
}