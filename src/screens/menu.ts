import { t } from "../i18n";
import type { Locale } from "../types";
import { html, onClick } from "./dom";

export function renderMenu(root: HTMLElement, actions: {
  play: () => void;
  scores: () => void;
  settings: () => void;
  about: () => void;
  install: () => void;
}, locale: Locale = "nb"): void {
  root.replaceChildren(html`
    <section class="screen menu">
      <img class="logo" src="${import.meta.env.BASE_URL}logo.png" alt="${t(locale, "menu.logo")}" width="160" height="160" />
      <h1>Bananmatte</h1>
      <p class="lead">${t(locale, "menu.lead")}</p>
      <div class="stack">
        <button class="btn primary" data-go="play">${t(locale, "menu.play")}</button>
        <button class="btn" data-go="scores">${t(locale, "menu.scores")}</button>
        <button class="btn" data-go="settings">${t(locale, "menu.settings")}</button>
        <button class="btn" data-go="install">${t(locale, "menu.install")}</button>
        <button class="btn ghost" data-go="about">${t(locale, "menu.about")}</button>
      </div>
    </section>
  `);
  onClick(root, "[data-go]", (button) => {
    const go = button.dataset.go;
    if (go === "play") actions.play();
    if (go === "scores") actions.scores();
    if (go === "settings") actions.settings();
    if (go === "install") actions.install();
    if (go === "about") actions.about();
  });
}
