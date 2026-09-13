import { t } from "../i18n";
import type { Locale } from "../types";

export const APPS_URL = "https://reidarkind.github.io/myapps/";
export const BMC_SRC = "https://cdnjs.buymeacoffee.com/1.0.0/button.prod.min.js";

export function moreLinks(locale: Locale): string {
  return `
    <nav class="more-links" aria-label="${t(locale, "more.title")}">
      <a class="btn" data-apps href="${APPS_URL}" target="_blank" rel="noopener noreferrer">${t(locale, "more.apps")}</a>
      <div data-bmc-host></div>
    </nav>
  `;
}

export function mountCoffeeButton(root: ParentNode): void {
  root.querySelectorAll("[data-bmc-host]").forEach((host) => {
    host.replaceChildren();
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src = BMC_SRC;
    script.dataset.name = "bmc-button";
    script.dataset.slug = "reidarkind";
    script.dataset.color = "#FFDD00";
    script.dataset.emoji = "☕";
    script.dataset.font = "Cookie";
    script.dataset.text = "Buy me a coffee";
    script.dataset.outlineColor = "#000000";
    script.dataset.fontColor = "#000000";
    script.dataset.coffeeColor = "#ffffff";
    host.append(script);
  });
}
