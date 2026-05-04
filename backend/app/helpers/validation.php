<?php

function required($value) {
    return isset($value) && trim($value) !== "";
}

function validateEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL);
}

function validatePhone($phone) {
    return preg_match("/^[0-9]{8,15}$/", $phone);
}

function validateInteger($value) {
    return filter_var($value, FILTER_VALIDATE_INT) !== false;
}

function validateDateValue($value, $format = "Y-m-d") {
    if (!required($value)) {
        return false;
    }

    $date = DateTime::createFromFormat($format, $value);
    return $date !== false && $date->format($format) === $value;
}
