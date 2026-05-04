<?php
require_once __DIR__ . "/../helpers/auth.php";
require_once __DIR__ . "/../helpers/response.php";

class AuthMiddleware
{
    public static function handle()
    {
        $token = getBearerToken();

        if (empty($token)) {
            errorResponse("Unauthorized", 401);
        }

        $user = parseAccessToken($token);

        if ($user === null) {
            errorResponse("Invalid access token", 401);
        }

        return $user;
    }
}
