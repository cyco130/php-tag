<?php

if (
  $_SERVER["REQUEST_URI"] !== "/php-tag" ||
  $_SERVER["REQUEST_METHOD"] !== "POST"
) {
  http_response_code(400);
  return false;
}

$data = json_decode(file_get_contents("php://input"), true);

$args = $data["args"] ?? null;


if (getenv("PHP_TAG_ENV") === "development") {
  // In development, the code itself is in the payload
  // as an array of string literals.
  $parts = $data["selector"] ?? null;
  if (!is_array($parts) || !is_array($args)) {
    http_response_code(400);
    return false;
  }

  $function = "return function(";
  $body = "";

  foreach ($args as $i => $arg) {
    $function .= "\$_arg$i";
    if ($i < count($args) - 1) {
      $function .= ",";
    }

    if (!is_string($parts[$i] ?? null)) {
      http_response_code(400);
      return false;
    }

    $body .= $parts[$i] . " \$_arg$i ";
  }

  $body .= $parts[count($args)] ?? "";

  $function .= ") {" . $body . "};";

  echo json_encode(call_user_func_array(eval($function), $args));
  exit();
} else {
  // In production, the code is in a separate file and the selector is
  // a the file name.
  $hash = $data["selector"] ?? null;
  if (
    !is_string($hash) ||
    !preg_match("/^[a-f0-9]+$/", $hash) ||
    !is_array($args)
  ) {
    http_response_code(400);
    return false;
  }

  $function = require_once __DIR__ . "/php-output/$hash.php";
  echo json_encode(call_user_func_array($function, $args));
}
