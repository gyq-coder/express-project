import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["server.ts"],
  format: "esm",
  sourcemap: false,
  minify: true,
  outExtensions() {
    return {
      js: ".js",
    };
  },
});
