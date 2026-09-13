import { t } from "../i18n";
import type { Locale } from "../types";
import { html, onClick } from "./dom";

export function renderJourneyEnd(
  host: HTMLElement,
  locale: Locale,
  actions: { settings: () => void; keep: () => void },
): void {
  const layer = html`
    <section class="overlay bonus-journey">
      <h2>${t(locale, "bonus.journey.title")}</h2>
      <p class="lead">${t(locale, "bonus.journey.lead")}</p>
      <p>${t(locale, "bonus.journey.hint")}</p>
      <div class="stack">
        <button class="btn primary" data-settings type="button">${t(locale, "bonus.journey.settings")}</button>
        <button class="btn" data-keep type="button">${t(locale, "bonus.journey.keep")}</button>
      </div>
    </section>
  `;
  host.append(layer);
  onClick(layer, "[data-settings]", () => {
    layer.remove();
    actions.settings();
  });
  onClick(layer, "[data-keep]", () => {
    layer.remove();
    actions.keep();
  });
}
