<?php

require_once __DIR__ . '/../vendor/autoload.php';

use Dotenv\Dotenv;

if (file_exists(__DIR__ . '/../.env')) {
    $dotenv = Dotenv::createImmutable(__DIR__ . '/../');
    $dotenv->safeLoad();
}

$host = $_ENV['DB_HOST'] ?? '127.0.0.1';
$port = $_ENV['DB_PORT'] ?? '3306';
$dbname = $_ENV['DB_NAME'] ?? 'university_db';
$user = $_ENV['DB_USER'] ?? 'root';
$pass = $_ENV['DB_PASS'] ?? '';

try {
    $conn = new PDO(
        "mysql:host=$host;port=$port;dbname=$dbname;charset=utf8",
        $user,
        $pass
    );

    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

} catch (PDOException $e) {
    die("Database connection failed: " . $e->getMessage());
}
