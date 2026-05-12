<?php
require_once __DIR__ . "/../app/middlewares/CorsMiddleware.php";

CorsMiddleware::handle();

$uri = parse_url($_SERVER["REQUEST_URI"], PHP_URL_PATH);
$uri = str_replace("/index.php", "", $uri);
$method = $_SERVER["REQUEST_METHOD"];

function dispatchCrudResource($uri, $method, $resource)
{
    $base = "/api/{$resource}";
    $controllerPath = __DIR__ . "/../app/controllers/{$resource}";

    if ($uri === $base) {
        if ($method === "GET") {
            require_once $controllerPath . "/" . ((isset($_GET["id"]) && $_GET["id"] !== "") ? "show.php" : "read.php");
            exit;
        }

        if ($method === "POST") {
            require_once $controllerPath . "/create.php";
            exit;
        }

        if ($method === "PUT") {
            require_once $controllerPath . "/update.php";
            exit;
        }

        if ($method === "DELETE") {
            require_once $controllerPath . "/delete.php";
            exit;
        }
    }

    $aliasMap = [
        "GET" => [
            "read" => "read.php",
            "show" => "show.php"
        ],
        "POST" => [
            "create" => "create.php"
        ],
        "PUT" => [
            "update" => "update.php"
        ],
        "DELETE" => [
            "delete" => "delete.php"
        ]
    ];

    if (!isset($aliasMap[$method])) {
        return;
    }

    foreach ($aliasMap[$method] as $action => $file) {
        if ($uri === "{$base}/{$action}") {
            require_once $controllerPath . "/{$file}";
            exit;
        }
    }
}

dispatchCrudResource($uri, $method, "students");
dispatchCrudResource($uri, $method, "users");
dispatchCrudResource($uri, $method, "roles");
dispatchCrudResource($uri, $method, "permissions");
dispatchCrudResource($uri, $method, "staff");
dispatchCrudResource($uri, $method, "courses");
dispatchCrudResource($uri, $method, "classes");

if ($uri === "/api/attendance/class" && $method === "GET") {
    require_once __DIR__ . "/../app/controllers/attendance/class_read.php";
    exit;
}

if ($uri === "/api/attendance/class" && $method === "POST") {
    require_once __DIR__ . "/../app/controllers/attendance/class_save.php";
    exit;
}

if ($uri === "/api/auth/login" && $method === "POST") {
    require_once __DIR__ . "/../app/controllers/auth/login.php";
    exit;
}

if ($uri === "/api/auth/register" && $method === "POST") {
    require_once __DIR__ . "/../app/controllers/auth/register.php";
    exit;
}

if ($uri === "/api/auth/requests" && $method === "GET") {
    require_once __DIR__ . "/../app/controllers/auth/requests.php";
    exit;
}

if ($uri === "/api/auth/review" && $method === "PUT") {
    require_once __DIR__ . "/../app/controllers/auth/review.php";
    exit;
}

if ($uri === "/api/role_permissions" && $method === "GET") {
    if (isset($_GET["role_id"]) && $_GET["role_id"] !== "") {
        require_once __DIR__ . "/../app/controllers/role_permissions/show.php";
    } else {
        require_once __DIR__ . "/../app/controllers/role_permissions/read.php";
    }
    exit;
}

if ($uri === "/api/role_permissions/assign" && $method === "POST") {
    require_once __DIR__ . "/../app/controllers/role_permissions/assign.php";
    exit;
}

if ($uri === "/api/role_permissions/update" && $method === "PUT") {
    require_once __DIR__ . "/../app/controllers/role_permissions/update.php";
    exit;
}

if ($uri === "/api/role_permissions/remove" && $method === "DELETE") {
    require_once __DIR__ . "/../app/controllers/role_permissions/remove.php";
    exit;
}

require_once __DIR__ . "/../app/helpers/response.php";
errorResponse("Route not found", 404);
