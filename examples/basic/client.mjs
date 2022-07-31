import { php } from "php-tag";

async function run() {
  const pre = document.getElementById("result");
  try {
    const result = await php`return [
    'serverTime' => date('Y-m-d H:i:s'),
    'arg1' => ${"first argument"},
    'arg2' => ${"second argument"},
  ];`;

    pre.style.color = "#333";
    pre.innerText = JSON.stringify(result, null, 2);
  } catch (error) {
    pre.style.color = "red";
    pre.innerText = error.message;
  }
}

document.getElementById("btn").addEventListener("click", run);
