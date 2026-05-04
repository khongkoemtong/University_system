<?php

function jsonResponse(array $payload, int $statusCode = 200) {
    http_response_code($statusCode);
    header("Content-Type: application/json");
    echo json_encode($payload);
    exit;
}

function successResponse($data = [], $message = "Success", $statusCode = 200) {
    jsonResponse([
        "success" => true,
        "message" => $message,
        "data" => $data
    ], $statusCode);
}

function errorResponse($message = "Error", $statusCode = 400) {
    jsonResponse([
        "success" => false,
        "message" => $message
    ], $statusCode);
}
