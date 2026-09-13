import { t } from "../i18n";
import type { Locale } from "../types";

export const APPS_URL = "https://reidarkind.github.io/myapps/";
export const COFFEE_URL = "https://buymeacoffee.com/reidarkind";

export function moreLinks(locale: Locale): string {
  return `
    <nav class="more-links" aria-label="${t(locale, "more.title")}">
      <a class="btn" data-apps href="${APPS_URL}" target="_blank" rel="noopener noreferrer">${t(locale, "more.apps")}</a>
      <a class="btn" data-coffee href="${COFFEE_URL}" target="_blank" rel="noopener noreferrer"><span class="btn-ico" aria-hidden="true">☕</span>${t(locale, "more.coffee")}</a>
    </nav>
  `;
}
