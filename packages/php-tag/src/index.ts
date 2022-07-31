// Tagged template literal
export async function php(
  strings: TemplateStringsArray,
  ...values: any[]
): Promise<any> {
  return fetch("/php-tag", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      selector: strings,
      args: values,
    }),
  }).then((res) => {
    if (!res.ok) {
      throw new Error(res.statusText);
    }

    return res.json();
  });
}
