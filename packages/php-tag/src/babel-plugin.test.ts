import { expect, it, vi } from "vitest";
import { transform } from "@babel/core";
import transformPhpTag from "./babel-plugin";

vi.mock("fs", () => ({
  default: {
    mkdirSync: vi.fn(),
    writeFileSync: vi.fn(),
  },
}));

it("converts to hashed code", async () => {
  const {
    default: { mkdirSync, writeFileSync },
  } = await import("fs");

  vi.mocked(mkdirSync).mockClear();
  vi.mocked(writeFileSync).mockClear();

  const output = transform(INPUT_1, {
    plugins: [[transformPhpTag, { outputDir: "output/dir" }]],
  });

  expect(output?.code).toMatchInlineSnapshot(`
    "import { php as p } from \\"php-tag\\";
    const param = 123;
    const template = p(\\"38bb2b63d62af9c7c67eb501f8a62cf79b03a80ebb5ebd24cd87c49f1ea675f3\\", param);"
  `);

  expect(mkdirSync).toHaveBeenCalledWith("output/dir", { recursive: true });
  expect(writeFileSync).toHaveBeenCalledWith(
    "output/dir/38bb2b63d62af9c7c67eb501f8a62cf79b03a80ebb5ebd24cd87c49f1ea675f3.php",
    "<?php return function($_arg0) {return $_arg0 * 3;};",
  );
});

it("only transforms imports from php-tag", async () => {
  const {
    default: { mkdirSync, writeFileSync },
  } = await import("fs");

  vi.mocked(mkdirSync).mockClear();
  vi.mocked(writeFileSync).mockClear();

  const output = transform(INPUT_2, {
    plugins: [[transformPhpTag, { outputDir: "output/dir" }]],
  });

  expect(output?.code).toMatchInlineSnapshot(`
    "import { php as p } from \\"other-module\\";
    const param = 123;
    const template = p\`return \${param} * 3;\`;"
  `);

  expect(mkdirSync).not.toHaveBeenCalled();
  expect(writeFileSync).not.toHaveBeenCalled();
});

it("unescapes backtick", async () => {
  const {
    default: { mkdirSync, writeFileSync },
  } = await import("fs");

  vi.mocked(mkdirSync).mockClear();
  vi.mocked(writeFileSync).mockClear();

  // @ts-expect-error: No types
  const input: string = await import("./fixtures/input.txt?raw").then(
    (x) => x.default,
  );

  // @ts-expect-error: No types
  const output: string = await import("./fixtures/output.txt?raw").then(
    (x) => x.default,
  );

  transform(input, {
    plugins: [[transformPhpTag, { outputDir: "output/dir" }]],
  });

  expect(writeFileSync).toHaveBeenCalledWith(
    "output/dir/8b477b7bf1773505fc472dccff5a7d4bb8f1c3305bb1289c0df4fd59515f4b7e.php",
    output,
  );
});

const INPUT_1 = `
	import { php as p} from "php-tag";

	const param = 123;

	const template = p\`return \${param} * 3;\`;
`;

const INPUT_2 = `
	import { php as p } from "other-module";

	const param = 123;

	const template = p\`return \${param} * 3;\`;
`;
