import { defineConfig } from "vite";
import { phpTag } from "php-tag/vite-plugin";
import { phpServerPlugin } from "./php-server-plugin";

export default defineConfig((env) => ({
  plugins: [phpTag({ outputDir: "php-output" }), phpServerPlugin()],
}));
