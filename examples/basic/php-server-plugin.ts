import { PluginOption } from "vite";
import { spawn, ChildProcess } from "child_process";
// @ts-expect-error: No typings
import killPort from "kill-port";

export function phpServerPlugin(): PluginOption {
  let phpServer: ChildProcess | undefined;

  return {
    name: "php-server-plugin",

    apply: "serve",

    config() {
      return {
        server: {
          proxy: {
            "/php-tag": {
              target: "http://localhost:8000",
              changeOrigin: true,
            },
          },
        },
      };
    },

    async configResolved(config) {
      phpServer = spawn(
        "php",
        ["-S", "localhost:8000", config.root + "/index.php"],
        {
          stdio: "inherit",
          shell: true,
        },
      );
    },

    async buildEnd() {
      if (phpServer) {
        const pid = phpServer.pid;
        if (pid) await killPort(8000);
      }
    },
  };
}
