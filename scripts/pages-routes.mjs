import { copyFileSync, mkdirSync } from "node:fs";

copyFileSync("dist/index.html", "dist/404.html");
mkdirSync("dist/install", { recursive: true });
copyFileSync("dist/index.html", "dist/install/index.html");
