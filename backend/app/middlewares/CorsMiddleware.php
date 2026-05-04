<?php

class CorsMiddleware
{
    public static function handle()
    {
        $origin = $_SERVER["HTTP_ORIGIN"] ?? "*";

        header("Access-Control-Allow-Origin: " . $origin);
        header("Vary: Origin");
        header("Access-Control-Allow-Headers: Content-Type, Authorization");
        header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");

        if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
            http_response_code(200);
            header("Content-Length: 0");
            exit;
        }
    }
}
