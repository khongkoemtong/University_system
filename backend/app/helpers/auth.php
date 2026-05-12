<?php
require_once __DIR__ . "/request.php";

function hashPassword($password) {
    return password_hash($password, PASSWORD_DEFAULT);
}

function checkPassword($password, $hashedPassword) {
    return password_verify($password, $hashedPassword);
}

function createAccessToken(array $payload) {
    return base64_encode(json_encode($payload));
}

function parseAccessToken($token) {
    if (!$token) {
        return null;
    }

    $decoded = base64_decode($token, true);

    if ($decoded === false) {
        return null;
    }

    $payload = json_decode($decoded, true);

    return is_array($payload) ? $payload : null;
}

function getAuthenticatedUser(): ?array
{
    return parseAccessToken(getBearerToken());
}
