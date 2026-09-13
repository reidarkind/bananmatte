import { t } from "../i18n";
import { LOCALES, LOCALE_NAMES, type Locale } from "../types";
import { html, onClick } from "./dom";

export function renderLanguage(
  root: HTMLElement,
  suggested: Locale,
  onChoose: (locale: Locale) => void,
): void {
  let selected = suggested;

  const paint = () => {
    root.replaceChildren(html`
      <section class="screen menu">
        <img class="logo" src="${import.meta.env.BASE_URL}logo.png" alt="${t(selected, "menu.logo")}" width="160" height="160" />
        <h1>${t(selected, "lang.title")}</h1>
        <div class="stack">
          ${LOCALES.map((id) => `<button class="btn ${id === selected ? "primary" : ""}" data-lang="${id}" type="button">${LOCALE_NAMES[id]}</button>`).join("")}
          <button class="btn" data-ok type="button">${t(selected, "lang.continue")}</button>
        </div>
      </section>
    `);
    onClick(root, "[data-lang]", (button) => {
      selected = button.dataset.lang as Locale;
      paint();
    });
    onClick(root, "[data-ok]", () => onChoose(selected));
  };

  paint();
}
