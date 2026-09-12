import { defineConfig } from "vite";

export default defineConfig(({ command, mode }) => ({
  base: command === "serve" && mode === "development" ? "/" : "/bananmatte/",
  publicDir: "public",
}));
