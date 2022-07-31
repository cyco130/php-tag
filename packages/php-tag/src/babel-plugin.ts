import type { PluginItem } from "@babel/core";
import type * as t from "@babel/types";
import { createHash } from "crypto";
import path from "path";
import fs from "fs";

interface TransformPhpTagOptions {
  outputDir?: string;
}

export default function transformPhpTag(
  {
    types: t,
  }: {
    types: typeof import("@babel/types");
  },
  options: TransformPhpTagOptions = {},
): PluginItem {
  // console.log("Here");
  const outputDir = options.outputDir || "output";

  return {
    visitor: {
      TaggedTemplateExpression: {
        enter(template, state) {
          const tag = template.node.tag;
          if (tag.type !== "Identifier") return;

          const binding = template.parentPath.scope.getBinding(tag.name);

          if (
            !binding ||
            !binding.path.isImportSpecifier() ||
            !(
              (binding.path.node.imported.type === "Identifier" &&
                binding.path.node.imported.name === "php") ||
              (binding.path.node.imported.type === "StringLiteral" &&
                binding.path.node.imported.value === "php")
            ) ||
            !binding.path.parentPath.isImportDeclaration() ||
            binding.path.parentPath.node.source.value !== "php-tag"
          ) {
            return;
          }

          const md5 = createHash("sha256");
          let fnBody = "";

          for (const [i] of template.node.quasi.expressions.entries()) {
            const segment = template.node.quasi.quasis[i].value.cooked;
            fnBody += segment;
            fnBody += `$_arg${i}`;
          }

          fnBody +=
            template.node.quasi.quasis[template.node.quasi.expressions.length]
              .value.cooked;

          md5.update(fnBody);
          const hash = md5.digest("hex");

          const outputPath = `${outputDir}/${hash}.php`;

          let generatedFromComment = " ";
          if (state.file.opts.filename) {
            generatedFromComment = `\n// Generated from ${path.relative(
              state.file.opts.cwd,
              state.file.opts.filename,
            )}:${template.node.loc!.start.line}:${
              template.node.loc!.start.column + 1
            }\n`;
          }

          const fileContent = `<?php${generatedFromComment}return function(${template.node.quasi.expressions
            .map((_, i) => `$_arg${i}`)
            .join(",")}) {${fnBody}};`;

          // console.log("outputPath", outputPath);
          fs.mkdirSync(path.dirname(outputPath), { recursive: true });
          fs.writeFileSync(outputPath, fileContent);

          template.replaceWith(
            t.callExpression(tag, [
              t.stringLiteral(hash),
              ...(template.node.quasi.expressions as t.Expression[]),
            ]),
          );
        },
      },
    },
  };
}
