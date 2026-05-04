<?php
require_once __DIR__ . "/AuthMiddleware.php";
require_once __DIR__ . "/../helpers/response.php";

class PermissionMiddleware
{
    public static function handle($requiredPermission)
    {
        $user = AuthMiddleware::handle();
        $permissions = $user["permissions"] ?? [];

        if (!is_array($permissions) || !in_array($requiredPermission, $permissions, true)) {
            errorResponse("Forbidden: missing permission", 403);
        }

        return $user;
    }
}
