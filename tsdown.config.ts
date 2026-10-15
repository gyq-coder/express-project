import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["server.ts"],
  format: "esm",
  sourcemap: true,
  outExtensions() {
    return {
      js: ".js",
    };
  },
  minify: true,
});
