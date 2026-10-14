import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/server.ts"],
  format: "esm",
  sourcemap: true,
  outExtensions() {
    return {
      js: ".js",
    };
  },
  minify: true,
});
