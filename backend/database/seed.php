<?php
require_once __DIR__ . "/../config/database.php";

try {
    // start transaction (IMPORTANT)
    $conn->beginTransaction();

    // roles (NO manual id)
    $conn->exec("
        INSERT IGNORE INTO roles (name) VALUES
        ('admin'),
        ('staff'),
        ('student')
    ");

    // permissions
    $conn->exec("
        INSERT IGNORE INTO permissions (name) VALUES
        ('student.create'),
        ('student.update'),
        ('student.delete'),
        ('student.view'),
        ('grade.create'),
        ('grade.update'),
        ('grade.view'),
        ('attendance.create'),
        ('attendance.view')
    ");

    // get role ids dynamically (SAFE)
    $roles = $conn->query("SELECT id, name FROM roles")->fetchAll(PDO::FETCH_KEY_PAIR);
    $permissions = $conn->query("SELECT id, name FROM permissions")->fetchAll(PDO::FETCH_KEY_PAIR);

    // flip array → name => id
    $roles = array_flip($roles);
    $permissions = array_flip($permissions);

    // assign permissions
    $rolePermissions = [
        'admin' => array_keys($permissions), // all
        'staff' => [
            'student.view',
            'grade.create',
            'grade.update',
            'grade.view',
            'attendance.create',
            'attendance.view'
        ],
        'student' => [
            'student.view',
            'grade.view',
            'attendance.view'
        ]
    ];

    foreach ($rolePermissions as $roleName => $perms) {
        foreach ($perms as $permName) {
            $conn->prepare("
                INSERT IGNORE INTO role_permissions (role_id, permission_id)
                VALUES (?, ?)
            ")->execute([
                $roles[$roleName],
                $permissions[$permName]
            ]);
        }
    }

    // create admin user
    $password = password_hash("123456", PASSWORD_DEFAULT);

    $stmt = $conn->prepare("
        INSERT IGNORE INTO users (name, email, password, role_id)
        VALUES (?, ?, ?, ?)
    ");

    $stmt->execute([
        "Admin One",
        "admin@gmail.com",
        $password,
        $roles['admin']
    ]);

    // commit
    $conn->commit();

    echo "✅ Seed data inserted successfully";

} catch (PDOException $e) {
    $conn->rollBack();
    echo "❌ Error: " . $e->getMessage();
}