<?php

if (
  $_SERVER["REQUEST_URI"] !== "/php-tag" ||
  $_SERVER["REQUEST_METHOD"] !== "POST"
) {
  echo "URI: " .
    $_SERVER["REQUEST_URI"] .
    " Method: " .
    $_SERVER["REQUEST_METHOD"] .
    "\n";
  http_response_code(400);
  return false;
}

// Posted JSON data
$data = json_decode(file_get_contents("php://input"), true);

$args = $data["args"] ?? null;

if (getenv("NODE_ENV") !== "development") {
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
