import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: ["./src/index.ts", "./src/babel-plugin.ts", "./src/vite-plugin.ts"],
    format: ["esm", "cjs"],
    platform: "node",
    target: "node14",
    dts: true,
  },
]);
