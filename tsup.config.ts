import { defineConfig } from "tsup";

// Builds the `coreFrontendBase` Astro integration (the only compiled entry). The
// pages / layouts / components / lib / styles ship as raw source (see the
// package `exports`), consumed by the product build's Astro/Vite.
export default defineConfig({
  entry: { astro: "src/astro.ts" },
  format: ["esm", "cjs"],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ["astro"],
});
