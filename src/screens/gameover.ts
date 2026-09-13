import { t } from "../i18n";
import { isBlankPlayerName, PLAYER_NAME_MAX } from "../storage/highscores";
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
    ackFasit?: boolean;
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
  let step: "fasit" | "name" | "anon" | "actions" = info.ackFasit ? "fasit" : info.askName ? "name" : "actions";
  let typedName = "";

  const paint = () => {
    const scoreline = `<p class="scoreline">${t(locale, "over.score", { score: info.score, level: info.level })}</p>`;
    let body = "";
    if (step === "fasit") {
      body = `
        <p class="fasit">${info.detail}</p>
        ${scoreline}
        <div class="stack">
          <button class="btn primary" data-gotit>${t(locale, "over.gotIt")}</button>
        </div>`;
    } else if (step === "anon") {
      body = `
        <p>${info.detail}</p>
        ${scoreline}
        <p class="fasit">${t(locale, "over.anonymousAsk")}</p>
        <div class="stack">
          <button class="btn primary" data-anon-yes>${t(locale, "over.anonymousYes")}</button>
          <button class="btn" data-anon-back>${t(locale, "over.anonymousBack")}</button>
        </div>`;
    } else if (step === "name") {
      body = `
        <p>${info.ackFasit ? "" : info.detail}</p>
        ${scoreline}
        <label class="name-field">${t(locale, "over.name")}
          <input data-name type="text" maxlength="${PLAYER_NAME_MAX}" autocomplete="nickname" enterkeyhint="done" placeholder="${t(locale, "over.placeholder")}" />
        </label>
        <div class="stack">
          <button class="btn primary" data-save>${t(locale, "over.save")}</button>
          <button class="btn ghost" data-cancel>${t(locale, "over.cancel")}</button>
        </div>`;
    } else {
      body = `
        <p>${info.ackFasit ? "" : info.detail}</p>
        ${scoreline}
        <div class="stack">
          <button class="btn primary" data-again>${t(locale, "over.again")}</button>
          <button class="btn ghost" data-menu>${t(locale, "over.menu")}</button>
        </div>`;
    }

    root.replaceChildren(html`
      <section class="overlay">
        <h2>${info.title}</h2>
        ${body}
      </section>
    `);

    const input = root.querySelector<HTMLInputElement>("[data-name]");
    if (input) {
      input.value = typedName;
      input.focus();
      input.addEventListener("input", () => {
        typedName = input.value;
      });
      input.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          trySave();
        }
      });
    }

    const trySave = () => {
      const name = root.querySelector<HTMLInputElement>("[data-name]")?.value ?? typedName;
      typedName = name;
      if (isBlankPlayerName(name)) {
        step = "anon";
        paint();
        return;
      }
      actions.submit(name);
      actions.afterSave();
    };

    onClick(root, "[data-gotit]", () => {
      step = info.askName ? "name" : "actions";
      paint();
    });
    onClick(root, "[data-save]", trySave);
    onClick(root, "[data-anon-yes]", () => {
      actions.submit("");
      actions.afterSave();
    });
    onClick(root, "[data-anon-back]", () => {
      step = "name";
      paint();
    });
    onClick(root, "[data-cancel]", () => {
      if (info.ackFasit) {
        actions.menu();
        return;
      }
      actions.cancel();
    });
    onClick(root, "[data-again]", actions.again);
    onClick(root, "[data-menu]", actions.menu);
  };

  paint();
}
