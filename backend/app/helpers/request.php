<?php

function getJsonInput(): array
{
    $raw = file_get_contents("php://input");

    if ($raw === false || trim($raw) === "") {
        return [];
    }

    $data = json_decode($raw, true);

    return is_array($data) ? $data : [];
}

function getAuthorizationHeader(): string
{
    $headers = function_exists("getallheaders") ? getallheaders() : [];

    return $headers["Authorization"] ?? $headers["authorization"] ?? "";
}

function getBearerToken(): ?string
{
    $header = trim(getAuthorizationHeader());

    if ($header === "") {
        return null;
    }

    if (stripos($header, "Bearer ") === 0) {
        return trim(substr($header, 7));
    }

    return $header;
}
