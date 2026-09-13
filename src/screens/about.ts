import { t } from "../i18n";
import type { Locale } from "../types";
import { html, onClick } from "./dom";
import { moreLinks, mountCoffeeButton } from "./more-links";

export function renderAbout(root: HTMLElement, back: () => void, locale: Locale = "nb"): void {
  root.replaceChildren(html`
    <section class="screen pad">
      <button class="back" data-back type="button">${t(locale, "back")}</button>
      <h1>${t(locale, "about.title")}</h1>
      <p>${t(locale, "about.p1")}</p>
      <p>${t(locale, "about.p2")}</p>
      <p>${t(locale, "about.p3")}</p>
      <h2>${t(locale, "about.privacy")}</h2>
      <p>${t(locale, "about.privacyBody")}</p>
      ${moreLinks(locale)}
    </section>
  `);
  onClick(root, "[data-back]", back);
  mountCoffeeButton(root);
}
