import { t } from "../i18n";
import { PLAYER_NAME_MAX } from "../storage/highscores";
import type { Locale } from "../types";
import { html, onClick } from "./dom";

export function renderGameOver(
  root: HTMLElement,
  info: {
    title: string;
    detail: string;
    score: number;
    level: number;
    askName: boolean;
    locale?: Locale;
  },
  actions: {
    submit: (name: string) => void;
    afterSave: () => void;
    cancel: () => void;
    again: () => void;
    menu: () => void;
  },
): void {
  const locale = info.locale ?? "nb";
  const nameField = info.askName
    ? `<label class="name-field">${t(locale, "over.name")}
        <input data-name type="text" maxlength="${PLAYER_NAME_MAX}" autocomplete="nickname" enterkeyhint="done" placeholder="${t(locale, "over.placeholder")}" />
      </label>`
    : "";

  const buttons = info.askName
    ? `<button class="btn primary" data-save>${t(locale, "over.save")}</button>
       <button class="btn ghost" data-cancel>${t(locale, "over.cancel")}</button>`
    : `<button class="btn primary" data-again>${t(locale, "over.again")}</button>
       <button class="btn ghost" data-menu>${t(locale, "over.menu")}</button>`;

  root.replaceChildren(html`
    <section class="overlay">
      <h2>${info.title}</h2>
      <p>${info.detail}</p>
      <p class="scoreline">${t(locale, "over.score", { score: info.score, level: info.level })}</p>
      ${nameField}
      <div class="stack">${buttons}</div>
    </section>
  `);

  const input = root.querySelector<HTMLInputElement>("[data-name]");
  input?.focus();

  const save = () => {
    actions.submit(input?.value ?? "");
    actions.afterSave();
  };

  onClick(root, "[data-save]", save);
  onClick(root, "[data-cancel]", actions.cancel);
  onClick(root, "[data-again]", actions.again);
  onClick(root, "[data-menu]", actions.menu);
  input?.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      save();
    }
  });
}
