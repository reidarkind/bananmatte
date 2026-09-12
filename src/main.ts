import { startApp } from "./app";
import { registerPwa } from "./pwa";
import "./styles.css";

const root = document.getElementById("app");
if (!root) {
  throw new Error("Mangler #app");
}
startApp(root);
registerPwa();
