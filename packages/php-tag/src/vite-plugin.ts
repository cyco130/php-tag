import { PluginOption } from "vite";
import { transformAsync } from "@babel/core";
import transformPhpTag from "./babel-plugin";

export interface PhpTagPluginOptions {
  outputDir?: string;
}

export function phpTag(options: PhpTagPluginOptions = {}): PluginOption {
  return {
    name: "mini-babel-transform-plugin",

    apply: "build",

    async transform(code, id) {
      const [filepath, querystring = ""] = id.split("?");
      if (!querystring.match(jsExtensionRE) && !filepath.match(jsExtensionRE)) {
        return;
      }

      // Quick test to skip unnecessary transforms
      if (!code.match(/\bphp\s*`/) || !code.match(/\bphp-tag\b/)) {
        return;
      }

      const transformed = await transformAsync(code, {
        configFile: false,
        filename: id,
        plugins: [[transformPhpTag, options]],
      });

      if (!transformed?.code) {
        throw new Error("Failed to transform code");
      }

      return {
        code: transformed.code,
      };
    },
  };
}

const jsExtensionRE = /\.m?[jt]sx?$/;
