<?php
header("Content-Type: application/json");

$uri = parse_url($_SERVER["REQUEST_URI"], PHP_URL_PATH);
$uri = str_replace("/index.php", "", $uri);

$method = $_SERVER["REQUEST_METHOD"];

if ($uri === "/api/students") {
    if ($method === "GET") {
        if (isset($_GET["id"]) && $_GET["id"] !== "") {
            require_once __DIR__ . "/../app/controllers/students/show.php";
        } else {
            require_once __DIR__ . "/../app/controllers/students/read.php";
        }
        exit;
    }

    if ($method === "POST") {
        require_once __DIR__ . "/../app/controllers/students/create.php";
        exit;
    }

    if ($method === "PUT") {
        require_once __DIR__ . "/../app/controllers/students/update.php";
        exit;
    }

    if ($method === "DELETE") {
        require_once __DIR__ . "/../app/controllers/students/delete.php";
        exit;
    }
}

if ($uri === "/api/students/read" && $method === "GET") {
    require_once __DIR__ . "/../app/controllers/students/read.php";
    exit;
}

if ($uri === "/api/students/show" && $method === "GET") {
    require_once __DIR__ . "/../app/controllers/students/show.php";
    exit;
}

if ($uri === "/api/students/create" && $method === "POST") {
    require_once __DIR__ . "/../app/controllers/students/create.php";
    exit;
}

if ($uri === "/api/students/update" && $method === "PUT") {
    require_once __DIR__ . "/../app/controllers/students/update.php";
    exit;
}

if ($uri === "/api/students/delete" && $method === "DELETE") {
    require_once __DIR__ . "/../app/controllers/students/delete.php";
    exit;
}

echo json_encode([
    "success" => false,
    "message" => "Route not found",
    "uri" => $uri,
    "method" => $method
]);
