<?php
require_once __DIR__ . "/AuthMiddleware.php";
require_once __DIR__ . "/../helpers/response.php";

class RoleMiddleware
{
    public static function handle($requiredRole)
    {
        $user = AuthMiddleware::handle();
        $role = $user["role"] ?? null;

        if ($role !== $requiredRole) {
            errorResponse("Forbidden: insufficient role", 403);
        }

        return $user;
    }
}
